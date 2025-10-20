<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../models/user.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['email'] ?? '';
$password = $input['password'] ?? '';

$userModel = new User();
$user = $userModel->findByEmail($username);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid credentials']);   
    exit;
}

$userModel->updateLastLogin($user['id']);

$secretKey = 'your-secret-key';
$issuedAt = time();
$expiration = $issuedAt + 3600;

$payload = [ 
    'user' =>  $user,
    'iss' => 'yourdomain.com',
    'iat' => $issuedAt,
    'exp' => $expiration
];



$jwt = JWT::encode($payload, $secretKey, 'HS256');

echo json_encode(['token' => $jwt]);

