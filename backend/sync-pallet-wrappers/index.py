import json
import hashlib
import mimetypes
import os
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

import boto3
from botocore.exceptions import ClientError
import psycopg2
from psycopg2.extras import Json


TARGET_CATEGORIES = {'332', '452', '333', '334'}
FEED_URL = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'
FEED_BASE_URL = 'https://t-sib.ru'
S3_BUCKET = 'files'
S3_PREFIX = 'pallet-wrappers/'


def _normalize_url(u: str) -> str:
    '''Делает абсолютный URL из относительного (например /upload/... → https://t-sib.ru/upload/...).'''
    if not u:
        return ''
    s = u.strip()
    if not s:
        return ''
    if s.startswith('http://') or s.startswith('https://'):
        return s
    if s.startswith('//'):
        return 'https:' + s
    if s.startswith('/'):
        return FEED_BASE_URL + s
    return FEED_BASE_URL + '/' + s


def _get_s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def _cdn_url(key: str) -> str:
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def _guess_content_type(url: str) -> str:
    ct, _ = mimetypes.guess_type(url)
    return ct or 'image/jpeg'


def _s3_key_for(src_url: str) -> str:
    ext = os.path.splitext(src_url.split('?')[0])[1].lower()
    if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
        ext = '.jpg'
    h = hashlib.sha1(src_url.encode('utf-8')).hexdigest()[:16]
    return f"{S3_PREFIX}{h}{ext}"


def _s3_exists(s3, key: str) -> bool:
    try:
        s3.head_object(Bucket=S3_BUCKET, Key=key)
        return True
    except ClientError:
        return False
    except Exception:
        return False


def _mirror_image(s3, src_url: str, cache: Dict[str, Optional[str]]) -> Optional[str]:
    '''Качает картинку с источника и заливает в S3. Возвращает CDN-URL или None.'''
    if not src_url:
        return None
    if src_url in cache:
        return cache[src_url]
    if src_url.startswith('https://cdn.poehali.dev/'):
        cache[src_url] = src_url
        return src_url
    try:
        key = _s3_key_for(src_url)
        cdn = _cdn_url(key)
        if _s3_exists(s3, key):
            cache[src_url] = cdn
            return cdn

        req = urllib.request.Request(
            src_url,
            headers={
                'User-Agent': 'Mozilla/5.0 (compatible; poehali-bot/1.0)',
                'Referer': FEED_BASE_URL + '/',
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        if not data:
            cache[src_url] = None
            return None

        s3.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=data,
            ContentType=_guess_content_type(src_url),
            CacheControl='public, max-age=31536000',
        )
        cache[src_url] = cdn
        return cdn
    except Exception:
        cache[src_url] = None
        return None


def _extract_params(offer: ET.Element) -> Dict[str, Any]:
    '''Собирает все <param name="..."> в словарь. Для Картинок товара — список.'''
    params: Dict[str, Any] = {}
    images: List[str] = []
    video_url = ''

    for p in offer.findall('param'):
        name = (p.get('name') or '').strip()
        value = (p.text or '').strip()
        if not name:
            continue
        if name == 'Картинки товара':
            if value:
                images.append(_normalize_url(value))
            continue
        if name == 'Видео (ссылка)':
            video_url = value
            continue
        params[name] = value

    params['_images'] = images
    params['_video'] = video_url
    return params


def _parse_price(value: str) -> float:
    try:
        return float(value.replace(',', '.').strip())
    except Exception:
        return 0.0


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Синхронизирует товары паллетообмотчиков из XML-фида в БД.
    Фильтр по category id: 332, 452, 333.
    Запускается 2 раза в сутки по расписанию: 06:00 и 13:00 Новосибирск (UTC+7)
    = 23:00 и 06:00 UTC.
    Cron: 0 23,6 * * *
    '''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    novosibirsk_tz = timezone(timedelta(hours=7))
    now_nsk = datetime.now(novosibirsk_tz)

    try:
        req = urllib.request.Request(FEED_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            xml_data = resp.read()

        root = ET.fromstring(xml_data)

        items: List[Dict[str, Any]] = []
        brands_set = set()

        for offer in root.findall('.//offer'):
            cat_elem = offer.find('categoryId')
            if cat_elem is None or cat_elem.text is None:
                continue
            category_id = cat_elem.text.strip()
            if category_id not in TARGET_CATEGORIES:
                continue

            offer_id = (offer.get('id') or '').strip()
            if not offer_id:
                continue

            available = (offer.get('available') or 'true').lower() != 'false'

            name_elem = offer.find('name')
            url_elem = offer.find('url')
            price_elem = offer.find('price')
            currency_elem = offer.find('currencyId')
            picture_elem = offer.find('picture')
            desc_elem = offer.find('description')

            all_params = _extract_params(offer)
            images = all_params.pop('_images', [])
            video_url = all_params.pop('_video', '')
            brand = all_params.get('Бренд', '').strip() or 'Другое'
            brands_set.add(brand)

            name_text = name_elem.text.strip() if (name_elem is not None and name_elem.text) else ''
            picture_raw = picture_elem.text.strip() if (picture_elem is not None and picture_elem.text) else ''
            picture_text = _normalize_url(picture_raw)
            if picture_text and picture_text not in images:
                images.insert(0, picture_text)

            items.append({
                'offer_id': offer_id,
                'category_id': category_id,
                'brand': brand,
                'name': name_text,
                'url': url_elem.text.strip() if (url_elem is not None and url_elem.text) else '',
                'price': _parse_price(price_elem.text) if (price_elem is not None and price_elem.text) else 0.0,
                'currency': currency_elem.text.strip() if (currency_elem is not None and currency_elem.text) else 'RUR',
                'available': available,
                'picture': picture_text,
                'description': desc_elem.text.strip() if (desc_elem is not None and desc_elem.text) else '',
                'video_url': video_url,
                'images': images,
                'params': all_params,
            })

        if not items:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No items found in feed for target categories',
                    'time_nsk': now_nsk.isoformat(),
                }, ensure_ascii=False),
                'isBase64Encoded': False,
            }

        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False,
            }

        # Зеркалим все картинки в наш S3, чтобы обойти hotlink-защиту исходного сайта.
        # Используем пул потоков для параллельной загрузки — исходные URL отдают быстро.
        mirrored_images_count = 0
        try:
            s3 = _get_s3_client()
            url_cache: Dict[str, Optional[str]] = {}

            all_urls: List[str] = []
            for it in items:
                for u in it['images']:
                    if u and u not in url_cache:
                        all_urls.append(u)
                        url_cache[u] = None  # резервируем
                if it.get('picture') and it['picture'] not in url_cache:
                    all_urls.append(it['picture'])
                    url_cache[it['picture']] = None

            # сбросим резерв, чтобы _mirror_image корректно отработал
            for u in all_urls:
                if u in url_cache:
                    del url_cache[u]

            def _job(u: str):
                return (u, _mirror_image(s3, u, url_cache))

            with ThreadPoolExecutor(max_workers=16) as ex:
                for u, cdn in ex.map(_job, all_urls):
                    if cdn:
                        url_cache[u] = cdn
                        mirrored_images_count += 1

            for it in items:
                new_images = []
                for u in it['images']:
                    mapped = url_cache.get(u)
                    new_images.append(mapped if mapped else u)
                it['images'] = new_images
                if it.get('picture'):
                    mapped = url_cache.get(it['picture'])
                    if mapped:
                        it['picture'] = mapped
        except Exception:
            # если S3 недоступен — используем исходные URL
            pass

        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        feed_offer_ids = [it['offer_id'] for it in items]

        upserted = 0
        for idx, it in enumerate(items):
            cur.execute(
                """
                INSERT INTO pallet_wrappers
                    (offer_id, category_id, brand, name, url, price, currency,
                     available, picture, description, video_url, images, params,
                     sort_order, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (offer_id) DO UPDATE SET
                    category_id = EXCLUDED.category_id,
                    brand = EXCLUDED.brand,
                    name = EXCLUDED.name,
                    url = EXCLUDED.url,
                    price = EXCLUDED.price,
                    currency = EXCLUDED.currency,
                    available = EXCLUDED.available,
                    picture = EXCLUDED.picture,
                    description = EXCLUDED.description,
                    video_url = EXCLUDED.video_url,
                    images = EXCLUDED.images,
                    params = EXCLUDED.params,
                    sort_order = EXCLUDED.sort_order,
                    updated_at = NOW()
                """,
                (
                    it['offer_id'], it['category_id'], it['brand'], it['name'], it['url'],
                    it['price'], it['currency'], it['available'], it['picture'],
                    it['description'], it['video_url'], Json(it['images']), Json(it['params']),
                    idx,
                ),
            )
            upserted += 1

        # Удаляем из БД товары, которых больше нет в фиде
        cur.execute(
            "DELETE FROM pallet_wrappers WHERE offer_id NOT IN %s",
            (tuple(feed_offer_ids),) if feed_offer_ids else (('__none__',),),
        )
        deleted = cur.rowcount

        # Мета
        brands_list = sorted(brands_set)
        cur.execute(
            """
            INSERT INTO pallet_wrappers_meta (id, last_update, items_count, brands)
            VALUES (1, NOW(), %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                last_update = NOW(),
                items_count = EXCLUDED.items_count,
                brands = EXCLUDED.brands
            """,
            (len(items), Json(brands_list)),
        )

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'upserted': upserted,
                'deleted': deleted,
                'brands': brands_list,
                'images_mirrored': mirrored_images_count,
                'time_nsk': now_nsk.isoformat(),
            }, ensure_ascii=False),
            'isBase64Encoded': False,
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'time_nsk': now_nsk.isoformat(),
            }, ensure_ascii=False),
            'isBase64Encoded': False,
        }