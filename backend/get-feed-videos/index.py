import json
import urllib.request
import xml.etree.ElementTree as ET
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Возвращает все товары из фида с брендом Robopac или ТЕХНОСИБ — id, бренд, категория, видео.'''
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    feed_url = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'

    with urllib.request.urlopen(feed_url, timeout=30) as response:
        xml_data = response.read()
    root = ET.fromstring(xml_data)

    categories = {}
    for c in root.findall('.//category'):
        cid = c.get('id') or ''
        categories[cid] = (c.text or '').strip()

    items = []
    for offer in root.findall('.//offer'):
        brand = None
        video = None
        for p in offer.findall('param'):
            pname = p.get('name', '')
            if pname == 'Бренд':
                brand = (p.text or '').strip()
            elif pname == 'Видео (ссылка)':
                video = (p.text or '').strip()
        if not brand:
            continue
        if brand.lower() not in ('robopac', 'техносиб'):
            continue
        cat_elem = offer.find('categoryId')
        cat_id = cat_elem.text.strip() if (cat_elem is not None and cat_elem.text) else ''
        name_elem = offer.find('name')
        name_text = name_elem.text.strip() if (name_elem is not None and name_elem.text) else ''
        items.append({
            'offer_id': offer.get('id'),
            'brand': brand,
            'category_id': cat_id,
            'category_name': categories.get(cat_id, ''),
            'name': name_text,
            'video': video,
            'available': offer.get('available', 'true'),
        })

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json; charset=utf-8'
        },
        'body': json.dumps(items, ensure_ascii=False),
        'isBase64Encoded': False
    }
