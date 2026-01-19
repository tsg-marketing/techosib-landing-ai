import json
import urllib.request
import urllib.parse
import os

def handler(event: dict, context) -> dict:
    """Отправка заявки в Bitrix24 через webhook"""
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    data = json.loads(body_str)
    
    name = data.get('name', '')
    phone = data.get('phone', '')
    email = data.get('email', '')
    company = data.get('company', '')
    comment = data.get('comment', '')
    product_type = data.get('productType', '')
    model_type = data.get('modelType', '')
    
    webhook_url = os.environ.get('BITRIX24_WEBHOOK_URL', '')
    
    if not webhook_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Bitrix24 webhook URL not configured'})
        }
    
    lead_data = {
        'fields': {
            'TITLE': f'Заявка с сайта: {model_type or product_type or "Общая заявка"}',
            'NAME': name,
            'PHONE': [{'VALUE': phone, 'VALUE_TYPE': 'WORK'}] if phone else [],
            'EMAIL': [{'VALUE': email, 'VALUE_TYPE': 'WORK'}] if email else [],
            'COMPANY_TITLE': company,
            'COMMENTS': comment,
            'SOURCE_ID': 'WEB',
            'UF_CRM_1234567890': product_type,
            'UF_CRM_0987654321': model_type
        }
    }
    
    req_data = urllib.parse.urlencode({'fields': json.dumps(lead_data['fields'])}).encode('utf-8')
    
    try:
        request = urllib.request.Request(
            f'{webhook_url}/crm.lead.add.json',
            data=req_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(request, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('result'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'leadId': result['result']
                    })
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': result.get('error_description', 'Unknown error')
                    })
                }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
