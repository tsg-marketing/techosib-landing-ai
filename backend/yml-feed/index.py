import os
from datetime import datetime, timezone, timedelta
from html import escape
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import RealDictCursor


SHOP_NAME = 'ТЕХНОСИБ'
SHOP_COMPANY = 'ТЕХНОСИБ'
SHOP_URL = 'https://t-sib.ru'
CURRENCY = 'RUR'
# Бренды, которые попадают в фид
ALLOWED_BRANDS = ('ТЕХНОСИБ', 'Robopac')


def _xml_escape(s: str) -> str:
    if s is None:
        return ''
    return escape(str(s), quote=True)


def _build_yml(items: List[Dict[str, Any]]) -> str:
    nsk_tz = timezone(timedelta(hours=7))
    now_str = datetime.now(nsk_tz).strftime('%Y-%m-%d %H:%M')

    parts: List[str] = []
    parts.append('<?xml version="1.0" encoding="UTF-8"?>')
    parts.append(f'<yml_catalog date="{now_str}">')
    parts.append('<shop>')
    parts.append(f'<name>{_xml_escape(SHOP_NAME)}</name>')
    parts.append(f'<company>{_xml_escape(SHOP_COMPANY)}</company>')
    parts.append(f'<url>{_xml_escape(SHOP_URL)}</url>')
    parts.append('<currencies>')
    parts.append(f'<currency id="{CURRENCY}" rate="1"/>')
    parts.append('</currencies>')

    # Категории
    brand_to_cat: Dict[str, str] = {}
    parts.append('<categories>')
    for idx, brand in enumerate(ALLOWED_BRANDS, start=1):
        brand_to_cat[brand] = str(idx)
        parts.append(f'<category id="{idx}">{_xml_escape(brand)}</category>')
    parts.append('</categories>')

    parts.append('<offers>')
    for it in items:
        brand = (it.get('brand') or '').strip()
        cat_id = brand_to_cat.get(brand)
        if not cat_id:
            continue

        offer_id = _xml_escape(it.get('offer_id') or '')
        available = 'true' if it.get('available') else 'false'
        url = _xml_escape(it.get('url') or SHOP_URL)
        price = it.get('price') or 0
        name = _xml_escape(it.get('name') or '')
        description = it.get('description') or ''
        images = it.get('images') or []
        picture = it.get('picture') or (images[0] if images else '')
        params = it.get('params') or {}

        try:
            price_int = int(round(float(price)))
        except Exception:
            price_int = 0

        parts.append(f'<offer id="{offer_id}" available="{available}">')
        parts.append(f'<url>{url}</url>')
        parts.append(f'<price>{price_int}</price>')
        parts.append(f'<currencyId>{CURRENCY}</currencyId>')
        parts.append(f'<categoryId>{cat_id}</categoryId>')
        if picture:
            parts.append(f'<picture>{_xml_escape(picture)}</picture>')
        parts.append(f'<name>{name}</name>')
        parts.append(f'<vendor>{_xml_escape(brand)}</vendor>')
        if description:
            parts.append(f'<description><![CDATA[{description}]]></description>')
        for img in images:
            if img and img != picture:
                parts.append(f'<picture>{_xml_escape(img)}</picture>')
        if isinstance(params, dict):
            for k, v in params.items():
                if not k or v is None or str(v).strip() == '':
                    continue
                parts.append(f'<param name="{_xml_escape(k)}">{_xml_escape(v)}</param>')
        parts.append('</offer>')
    parts.append('</offers>')
    parts.append('</shop>')
    parts.append('</yml_catalog>')

    return '\n'.join(parts)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Возвращает YML (XML) фид товаров для брендов ТЕХНОСИБ и Robopac.
    Данные берутся из таблицы pallet_wrappers, которая обновляется из исходного XML-фида
    функцией sync-pallet-wrappers. Таким образом фид автоматически актуализируется
    вместе с обновлением данных на сайте.
    '''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': '{"error":"DATABASE_URL not configured"}',
            'isBase64Encoded': False,
        }

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        placeholders = ','.join([f"'{b}'" for b in ALLOWED_BRANDS])
        cur.execute(
            f"""
            SELECT offer_id, brand, name, url, price, available,
                   picture, description, images, params
            FROM pallet_wrappers
            WHERE brand IN ({placeholders})
            ORDER BY brand ASC, name ASC
            """
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        items = []
        for r in rows:
            items.append({
                'offer_id': r['offer_id'],
                'brand': r['brand'],
                'name': r['name'],
                'url': r['url'],
                'price': float(r['price']) if r['price'] is not None else 0,
                'available': r['available'],
                'picture': r['picture'],
                'description': r['description'],
                'images': r['images'] or [],
                'params': r['params'] or {},
            })

        xml = _build_yml(items)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/xml; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300',
            },
            'body': xml,
            'isBase64Encoded': False,
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': f'{{"error": "{str(e)}"}}',
            'isBase64Encoded': False,
        }
