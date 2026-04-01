import json
import urllib.request
import xml.etree.ElementTree as ET
import os
from typing import Dict, Any
from datetime import datetime, timezone, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    CRON-функция: обновляет цены из XML-фида и записывает в БД.
    Запускается по расписанию: каждый день в 5:00 по Новосибирску (UTC+7) = 22:00 UTC предыдущего дня.
    
    Cron expression: 0 22 * * *
    (22:00 UTC = 05:00 Новосибирск)
    '''
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
    
    novosibirsk_tz = timezone(timedelta(hours=7))
    now_nsk = datetime.now(novosibirsk_tz)
    
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
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'No prices found in XML feed',
                    'time_nsk': now_nsk.isoformat()
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # 2. Записываем в БД
        db_url = os.environ.get('DATABASE_URL', '')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False
            }
        
        import psycopg2
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        updated_count = 0
        
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
            updated_count += 1
        
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
        cur.close()
        conn.close()
        
        result = {
            'success': True,
            'message': f'Prices updated successfully at {now_nsk.strftime("%Y-%m-%d %H:%M:%S")} NSK',
            'models_updated': updated_count,
            'min_price': min_price_formatted,
            'min_price_raw': min_price,
            'time_nsk': now_nsk.isoformat()
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': str(e),
                'time_nsk': now_nsk.isoformat()
            }),
            'isBase64Encoded': False
        }
