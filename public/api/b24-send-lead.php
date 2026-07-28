<?php
/**
 * Приём заявок с сайта и передача в Битрикс24.
 * Размещается на боевом сервере (t-sib.ru). На preview/poehali файл
 * статичный и не исполняется — это нормально, он нужен для продакшена.
 *
 * Ожидает JSON в теле запроса:
 *   name, phone, email, company, comment,
 *   productType, modelType, source, url,
 *   utm_source, utm_medium, utm_campaign, utm_content, utm_term,
 *   calc_params, calc_result, yaClientId
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// === НАСТРОЙКИ ===
// Заполнить на боевом сервере:
$B24_WEBHOOK_URL = ''; // например: https://your-portal.bitrix24.ru/rest/1/xxxxxxxxxxxxxxxx/
$ASSIGNED_BY_ID  = 1;  // ID ответственного в Битрикс24
$LOG_FILE        = __DIR__ . '/b24-send-lead.log';

// === ЧТЕНИЕ ВХОДНЫХ ДАННЫХ ===
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$name        = trim((string)($data['name']        ?? ''));
$phone       = trim((string)($data['phone']       ?? ''));
$email       = trim((string)($data['email']       ?? ''));
$company     = trim((string)($data['company']     ?? ''));
$comment     = trim((string)($data['comment']     ?? ''));
$productType = trim((string)($data['productType'] ?? ''));
$modelType   = trim((string)($data['modelType']   ?? ''));
$source      = trim((string)($data['source']      ?? ''));
$pageUrl     = trim((string)($data['url']         ?? ''));
$yaClientId  = trim((string)($data['yaClientId']  ?? ''));

$utm = [
    'utm_source'   => (string)($data['utm_source']   ?? ''),
    'utm_medium'   => (string)($data['utm_medium']   ?? ''),
    'utm_campaign' => (string)($data['utm_campaign'] ?? ''),
    'utm_content'  => (string)($data['utm_content']  ?? ''),
    'utm_term'     => (string)($data['utm_term']     ?? ''),
];

// Примитивная валидация
if ($phone === '' && $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'phone or email required']);
    exit;
}

// === ФОРМИРОВАНИЕ КОММЕНТАРИЯ ===
$commentParts = [];
if ($productType !== '') $commentParts[] = "Тип оборудования: $productType";
if ($modelType   !== '') $commentParts[] = "Модель: $modelType";
if ($source      !== '') $commentParts[] = "Источник: $source";
if ($comment     !== '') $commentParts[] = "Комментарий: $comment";
if ($pageUrl     !== '') $commentParts[] = "Страница: $pageUrl";
if ($yaClientId  !== '') $commentParts[] = "ClientID: $yaClientId";
foreach ($utm as $k => $v) {
    if ($v !== '') $commentParts[] = "$k: $v";
}
if (!empty($data['calc_params'])) {
    $commentParts[] = "Параметры калькулятора: " . json_encode($data['calc_params'], JSON_UNESCAPED_UNICODE);
}
if (!empty($data['calc_result'])) {
    $commentParts[] = "Результат калькулятора: " . json_encode($data['calc_result'], JSON_UNESCAPED_UNICODE);
}
$fullComment = implode("\n", $commentParts);

// === ЛОГ ===
$logLine = '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n";
@file_put_contents($LOG_FILE, $logLine, FILE_APPEND);

// === ОТПРАВКА В БИТРИКС24 ===
$b24ok = false;
$b24err = '';
if ($B24_WEBHOOK_URL !== '') {
    $leadTitle = 'Заявка с сайта';
    if ($source !== '') {
        $leadTitle .= ' — ' . $source;
    } elseif ($productType !== '') {
        $leadTitle .= ' — ' . $productType;
    }

    $fields = [
        'TITLE'         => $leadTitle,
        'NAME'          => $name !== '' ? $name : 'Без имени',
        'COMPANY_TITLE' => $company,
        'COMMENTS'      => $fullComment,
        'SOURCE_ID'     => 'WEB',
        'ASSIGNED_BY_ID'=> $ASSIGNED_BY_ID,
        'PHONE'         => $phone !== '' ? [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']] : [],
        'EMAIL'         => $email !== '' ? [['VALUE' => $email, 'VALUE_TYPE' => 'WORK']] : [],
        'UTM_SOURCE'    => $utm['utm_source'],
        'UTM_MEDIUM'    => $utm['utm_medium'],
        'UTM_CAMPAIGN'  => $utm['utm_campaign'],
        'UTM_CONTENT'   => $utm['utm_content'],
        'UTM_TERM'      => $utm['utm_term'],
    ];

    $payload = http_build_query(['fields' => $fields]);
    $url     = rtrim($B24_WEBHOOK_URL, '/') . '/crm.lead.add.json';

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $b24err   = curl_error($ch);
    curl_close($ch);

    $decoded = json_decode((string)$response, true);
    $b24ok = ($httpCode === 200 && is_array($decoded) && !empty($decoded['result']));

    @file_put_contents(
        $LOG_FILE,
        '[' . date('Y-m-d H:i:s') . '] B24 response: ' . (string)$response . "\n",
        FILE_APPEND
    );
}

// === ОТВЕТ ===
// Отдаём success=true если заявка сохранена в лог, даже если Битрикс упал —
// менеджер всегда сможет взять её из лога.
echo json_encode([
    'success' => true,
    'b24'     => $b24ok,
    'error'   => $b24err ?: null,
], JSON_UNESCAPED_UNICODE);