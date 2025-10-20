<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/ResponseHelper.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthHelper {
    public static function getAuthenticatedUser() {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';        
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            
            ResponseHelper::error('Authorization token missing', 401);
        }
        
        $token = $matches[1];
        try {
            $secretKey = 'your-secret-key'; // Should match login API key
            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            return (array) $decoded->user;
        } catch (Exception $e) {
            ResponseHelper::error('Invalid token: ' . $e->getMessage(), 401);
        }
    }
}