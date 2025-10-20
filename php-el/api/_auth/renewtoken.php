<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../helpers/AuthHelper.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $secretKey = 'your-secret-key';
    $user = AuthHelper::getAuthenticatedUser();

    $issuedAt = time();
    $expiration = $issuedAt + 3600;

    $payload = [
        'user' => $user,
        'iat' => $issuedAt,
        'exp' => $expiration
    ];

    $newToken = JWT::encode($payload, $secretKey, 'HS256');

    echo json_encode(['token' => $newToken]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['message' => 'Token renewal failed', 'error' => $e->getMessage()]);
}
