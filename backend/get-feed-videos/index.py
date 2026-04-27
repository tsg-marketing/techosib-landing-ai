import json
import urllib.request
import xml.etree.ElementTree as ET
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Возвращает Бренд и ссылку на видео из XML-фида для нужных моделей паллетообмотчиков.'''
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
    model_mapping = {
        '6323': 'TS3000MR-H',
        '6366': 'TS3000SPS-H',
        '6373': 'TS3000MR-TP',
        '6324': 'TS3000SPS-TP',
        '6368': 'TS3000MR-MT',
        '6367': 'TS3000SPS-MT',
        '6369': 'TS3000MR-MT-TP',
        '6370': 'TS3000SPS-MT-TP',
        '5322': 'ROBO-MS',
    }

    result = {}
    with urllib.request.urlopen(feed_url, timeout=30) as response:
        xml_data = response.read()
    root = ET.fromstring(xml_data)

    for offer in root.findall('.//offer'):
        offer_id = offer.get('id')
        if offer_id not in model_mapping:
            continue
        brand = None
        video = None
        for p in offer.findall('param'):
            pname = p.get('name', '')
            if pname == 'Бренд':
                brand = (p.text or '').strip()
            elif pname == 'Видео (ссылка)':
                video = (p.text or '').strip()
        result[model_mapping[offer_id]] = {'brand': brand, 'video': video, 'offer_id': offer_id}

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json; charset=utf-8'
        },
        'body': json.dumps(result, ensure_ascii=False),
        'isBase64Encoded': False
    }
