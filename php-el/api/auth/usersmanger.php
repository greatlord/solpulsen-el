<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../controllers/UserManagerController.php';
require_once __DIR__ . '/../../helpers/AuthHelper.php';

// CORS headers

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get authenticated user
$user = AuthHelper::getAuthenticatedUser();

// Admin check
if ($user['role'] !== 'admin') {
        
   // http_response_code(403);
   // echo json_encode(['message' => 'Forbidden']);
  //  exit;            
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            UserManagerController::get($id);
        } else {
            UserManagerController::getAll();
        }
        break;
    case 'POST':
        UserManagerController::create($input);
        break;
    case 'PUT':
        $id = $input['id'];
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID required']);
            break;
        }
        UserManagerController::update($id, $input);
        break;
    case 'DELETE':
        // Try to get ID from URL first, then from body

        if ($user['role'] !== 'admin') { 
            http_response_code(403);
            echo json_encode(['message' => 'Forbidden']);
            exit;
        }

        $deleteId = $id;
        if (!$deleteId && isset($input['id'])) {
            $deleteId = (int)$input['id'];
        }
        
        if (!$deleteId) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID required']);
            break;
        }
        UserManagerController::delete($deleteId);
    break;
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
        break;
}