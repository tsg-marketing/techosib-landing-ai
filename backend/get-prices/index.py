import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Возвращает актуальные цены из БД (кеш, обновляется раз в сутки).
    Быстрый endpoint для фронтенда — не ходит к XML-фиду.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL', '')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        import psycopg2
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Получаем все цены
        cur.execute(f"""
            SELECT model_name, offer_id, product_name, price_raw, price_formatted, updated_at
            FROM {schema}.prices_cache
            ORDER BY model_name
        """)
        
        rows = cur.fetchall()
        
        # Получаем мета-информацию
        cur.execute(f"""
            SELECT min_price_raw, min_price_formatted, models_found, last_update
            FROM {schema}.prices_meta
            WHERE id = 1
        """)
        
        meta = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not rows:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'No prices in database yet. Prices will be updated soon.',
                    'prices': {},
                    'min_price': 'по запросу',
                    'min_price_raw': 0,
                    'models_found': 0
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Формируем ответ в формате, совместимом с текущим фронтендом
        prices = {}
        for row in rows:
            model_name, offer_id, product_name, price_raw, price_formatted, updated_at = row
            prices[model_name] = {
                'price': price_formatted,
                'price_raw': price_raw,
                'offer_id': offer_id,
                'name': product_name
            }
        
        last_update = meta[3].isoformat() if meta else None
        
        result = {
            'success': True,
            'prices': prices,
            'min_price': meta[1] if meta else 'по запросу',
            'min_price_raw': meta[0] if meta else 0,
            'models_found': meta[2] if meta else len(prices),
            'last_update': last_update,
            'source': 'database'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            },
            'body': json.dumps(result, ensure_ascii=False, default=str),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
