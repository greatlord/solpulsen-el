<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    public static function authenticate($secretKey) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized: Missing or invalid token']);
            exit;
        }

        try {
            $decoded = JWT::decode($matches[1], new Key($secretKey, 'HS256'));
            return (object)[
                'id' => $decoded->sub,
                'role' => $decoded->role
            ];
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid token', 'error' => $e->getMessage()]);
            exit;
        }
    }
}
