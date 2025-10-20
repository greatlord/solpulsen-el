<?php
// api/installation.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/InstallationController.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../helpers/AuthHelper.php';

// CORS headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get authenticated user (if authentication is required)
$user = AuthHelper::getAuthenticatedUser();

// Get request method and input
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$queryParams = $_GET;

try {
    // Handle photo requests first
    if (isset($queryParams['photoId'])) {
        InstallationController::getPhoto($queryParams['photoId']);
        exit;
    }

    // Handle main CRUD operations
    switch ($method) {
        case 'GET':
            if (isset($queryParams['id'])) {
                InstallationController::get($queryParams['id']);
            } else {
                InstallationController::getAll();
            }
            break;

        case 'POST':
            if (!$input) {
                ResponseHelper::error('No input data provided', 400);
                break;
            }
            InstallationController::create($input);
            break;

        case 'PUT':
            if (!isset($queryParams['id'])) {
                ResponseHelper::error('ID parameter required for update', 400);
                break;
            }
            if (!$input) {
                ResponseHelper::error('No input data provided', 400);
                break;
            }
            InstallationController::update($queryParams['id'], $input);
            break;

        case 'DELETE':
            if (!isset($queryParams['id'])) {
                ResponseHelper::error('ID parameter required for deletion', 400);
                break;
            }
            InstallationController::delete($queryParams['id']);
            break;

        default:
            ResponseHelper::error('Method not allowed', 405);
            break;
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ResponseHelper::error('Internal server error: ' . $e->getMessage(), 500);
}
