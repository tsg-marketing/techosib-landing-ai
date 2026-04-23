import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

import psycopg2
from psycopg2.extras import Json


TARGET_CATEGORIES = {'332', '452', '333'}
FEED_URL = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'
FEED_BASE_URL = 'https://t-sib.ru'


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