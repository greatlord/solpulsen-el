<?php
require_once __DIR__ . '/../models/EgenkontrollModel.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class EgenkontrollController {
    public static function getAll() {
        $model = new EgenkontrollModel();
        $forms = $model->findAll();
        ResponseHelper::success($forms);
    }

    public static function get($id) {
        $model = new EgenkontrollModel();
        $form = $model->findWithDetails($id);
        
        if (!$form) {
            ResponseHelper::error('Egenkontroll form not found', 404);
            return;
        }
        
        ResponseHelper::success($form);
    }

    public static function create($input) {
        $required = [
            'customerName', 'address', 'projectNumber', 'date', 
            'electricianName', 'certificationNumber'
        ];
        
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ResponseHelper::error("Missing required field: $field", 400);
                return;
            }
        }
        
        $model = new EgenkontrollModel();
        
        try {
            $formId = $model->createWithDetails($input);
            
            ResponseHelper::success([
                'message' => 'Egenkontroll form submitted successfully',
                'id' => $formId
            ], 201);
            
        } catch (Exception $e) {
            error_log("Error creating egenkontroll form: " . $e->getMessage());
            ResponseHelper::error('Failed to create form: ' . $e->getMessage(), 500);
        }
    }

    public static function update($id, $input) {
        $model = new EgenkontrollModel();
        $form = $model->find($id);
        
        if (!$form) {
            ResponseHelper::error('Egenkontroll form not found', 404);
            return;
        }
        
        try {
            $model->updateWithDetails($id, $input);
            ResponseHelper::success(['message' => 'Egenkontroll form updated successfully']);
        } catch (Exception $e) {
            ResponseHelper::error('Failed to update form: ' . $e->getMessage(), 500);
        }
    }

    public static function delete($id) {
        $model = new EgenkontrollModel();
        $form = $model->find($id);
        
        if (!$form) {
            ResponseHelper::error('Egenkontroll form not found', 404);
            return;
        }
        
        $model->delete($id);
        ResponseHelper::success(['message' => 'Egenkontroll form deleted successfully']);
    }

    // Method to get individual photo
    public static function getPhoto($photoId) {
        $model = new EgenkontrollModel();
        $photo = $model->getPhoto($photoId);
        
        if (!$photo) {
            http_response_code(404);
            echo json_encode(['message' => 'Photo not found']);
            return;
        }
        
        // Return image data with proper headers
        header('Content-Type: ' . $photo['mime_type']);
        header('Content-Length: ' . strlen($photo['photo']));
        header('Content-Disposition: inline; filename="' . $photo['filename'] . '"');
        echo $photo['photo'];
        exit;
    }
}
