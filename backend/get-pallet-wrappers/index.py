import json
import os
from typing import Dict, Any

import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Возвращает список паллетообмотчиков для фронтенда,
    сгруппированный по бренду (для вкладок).
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
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False,
        }

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute(
            """
            SELECT offer_id, category_id, brand, name, url, price, currency,
                   available, picture, description, video_url, images, params,
                   sort_order, updated_at
            FROM pallet_wrappers
            ORDER BY brand ASC, sort_order ASC, name ASC
            """
        )
        rows = cur.fetchall()

        cur.execute("SELECT last_update, items_count, brands FROM pallet_wrappers_meta WHERE id = 1")
        meta = cur.fetchone() or {}

        cur.close()
        conn.close()

        items = []
        for r in rows:
            items.append({
                'offer_id': r['offer_id'],
                'category_id': r['category_id'],
                'brand': r['brand'],
                'name': r['name'],
                'url': r['url'],
                'price': float(r['price']) if r['price'] is not None else 0,
                'currency': r['currency'],
                'available': r['available'],
                'picture': r['picture'],
                'description': r['description'],
                'video_url': r['video_url'],
                'images': r['images'] or [],
                'params': r['params'] or {},
            })

        brands = meta.get('brands') or []
        if not brands:
            brands = sorted(list({it['brand'] for it in items if it['brand']}))

        result = {
            'items': items,
            'brands': brands,
            'last_update': meta['last_update'].isoformat() if meta.get('last_update') else None,
            'items_count': meta.get('items_count', len(items)),
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300',
            },
            'body': json.dumps(result, ensure_ascii=False, default=str),
            'isBase64Encoded': False,
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False,
        }
