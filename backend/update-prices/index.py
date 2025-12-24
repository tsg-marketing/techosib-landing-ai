import json
import urllib.request
import xml.etree.ElementTree as ET
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Парсит XML-фид с ценами на паллетообмотчики и возвращает актуальные цены
    Args: event - dict с httpMethod, headers, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с ценами в JSON формате
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
    
    feed_url = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'
    
    model_mapping = {
        '6323': 'TS3000MR-H',
        '6324': 'TS3000SPS-H',
        '6325': 'TS3000MR-TP',
        '6326': 'TS3000SPS-TP',
        '6327': 'TS3000MR-MT',
        '6328': 'TS3000SPS-MT',
        '6329': 'TS3000MR-MT-TP',
        '6330': 'TS3000SPS-MT-TP'
    }
    
    prices = {}
    
    try:
        with urllib.request.urlopen(feed_url, timeout=30) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        
        ns = {'yml': 'http://www.w3.org/2001/XMLSchema'}
        
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
                    'error': 'No prices found in feed',
                    'checked_ids': list(model_mapping.keys()),
                    'feed_url': feed_url
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        min_price = min([p['price_raw'] for p in prices.values() if p['price_raw'] > 0], default=0)
        min_price_formatted = f"{min_price:,}".replace(',', ' ') if min_price > 0 else 'по запросу'
        
        result = {
            'success': True,
            'prices': prices,
            'min_price': min_price_formatted,
            'min_price_raw': min_price,
            'updated_at': context.request_id,
            'models_found': len(prices)
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
