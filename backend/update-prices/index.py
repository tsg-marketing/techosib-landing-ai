import json
import urllib.request
import xml.etree.ElementTree as ET
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Парсит XML-фид с ценами на паллетообмотчики и записывает в БД.
    Вызывается по cron раз в сутки в 5:00 по Новосибирску (22:00 UTC).
    Также может быть вызван вручную через GET-запрос.
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    feed_url = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'
    
    model_mapping = {
        '6323': 'TS3000MR-H',
        '6366': 'TS3000SPS-H',
        '6373': 'TS3000MR-TP',
        '6324': 'TS3000SPS-TP',
        '6368': 'TS3000MR-MT',
        '6367': 'TS3000SPS-MT',
        '6369': 'TS3000MR-MT-TP',
        '6370': 'TS3000SPS-MT-TP',
        '5322': 'ROBO-MS'
    }
    
    prices = {}
    
    try:
        # 1. Парсим XML-фид
        with urllib.request.urlopen(feed_url, timeout=30) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        
        for offer in root.findall('.//offer'):
            offer_id = offer.get('id')
            
            if offer_id in model_mapping:
                price_elem = offer.find('price')
                name_elem = offer.find('name')
                
                if price_elem is not None and price_elem.text:
                    model_name = model_mapping[offer_id]
                    price_value = price_elem.text.strip()
                    
                    try:
                        price_int = int(float(price_value))
                        formatted_price = f"{price_int:,}".replace(',', ' ')
                        
                        prices[model_name] = {
                            'price': formatted_price,
                            'price_raw': price_int,
                            'offer_id': offer_id,
                            'name': name_elem.text if name_elem is not None else model_name
                        }
                    except ValueError:
                        prices[model_name] = {
                            'price': 'по запросу',
                            'price_raw': 0,
                            'offer_id': offer_id,
                            'name': name_elem.text if name_elem is not None else model_name
                        }
        
        if not prices:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No prices found in feed',
                    'checked_ids': list(model_mapping.keys()),
                    'feed_url': feed_url
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # 2. Записываем в БД
        db_url = os.environ.get('DATABASE_URL', '')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        if db_url:
            import psycopg2
            
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            try:
                # Upsert каждой модели
                for model_name, data in prices.items():
                    cur.execute(f"""
                        INSERT INTO {schema}.prices_cache 
                            (model_name, offer_id, product_name, price_raw, price_formatted, updated_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (model_name) 
                        DO UPDATE SET 
                            offer_id = EXCLUDED.offer_id,
                            product_name = EXCLUDED.product_name,
                            price_raw = EXCLUDED.price_raw,
                            price_formatted = EXCLUDED.price_formatted,
                            updated_at = NOW()
                    """, (model_name, data['offer_id'], data['name'], data['price_raw'], data['price']))
                
                # Обновляем мета-информацию
                min_price = min([p['price_raw'] for p in prices.values() if p['price_raw'] > 0], default=0)
                min_price_formatted = f"{min_price:,}".replace(',', ' ') if min_price > 0 else 'по запросу'
                
                cur.execute(f"""
                    INSERT INTO {schema}.prices_meta (id, min_price_raw, min_price_formatted, models_found, last_update)
                    VALUES (1, %s, %s, %s, NOW())
                    ON CONFLICT (id) 
                    DO UPDATE SET 
                        min_price_raw = EXCLUDED.min_price_raw,
                        min_price_formatted = EXCLUDED.min_price_formatted,
                        models_found = EXCLUDED.models_found,
                        last_update = NOW()
                """, (min_price, min_price_formatted, len(prices)))
                
                conn.commit()
                db_status = 'saved_to_db'
            except Exception as db_err:
                conn.rollback()
                db_status = f'db_error: {str(db_err)}'
            finally:
                cur.close()
                conn.close()
        else:
            db_status = 'no_database_url'
        
        # 3. Формируем ответ
        min_price = min([p['price_raw'] for p in prices.values() if p['price_raw'] > 0], default=0)
        min_price_formatted = f"{min_price:,}".replace(',', ' ') if min_price > 0 else 'по запросу'
        
        result = {
            'success': True,
            'prices': prices,
            'min_price': min_price_formatted,
            'min_price_raw': min_price,
            'updated_at': context.request_id if hasattr(context, 'request_id') else 'manual',
            'models_found': len(prices),
            'db_status': db_status
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': str(e),
                'feed_url': feed_url
            }),
            'isBase64Encoded': False
        }
