<?php
require_once __DIR__ . '/../models/InstallationModel.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class InstallationController {
    public static function getAll() {
        $model = new InstallationModel();
        $forms = $model->findAll();
        ResponseHelper::success($forms);
    }

    public static function get($id) {
        $model = new InstallationModel();
        $form = $model->findWithDetails($id);
        
        if (!$form) {
            ResponseHelper::error('Installation form not found', 404);
            return;
        }
        
        ResponseHelper::success($form);
    }

    public static function create($input) {
        $required = [
            'customerName', 'address', 'projectNumber', 'date', 
            'installerName', 'supervisor'
        ];
        
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ResponseHelper::error("Missing required field: $field", 400);
                return;
            }
        }
        
        $model = new InstallationModel();
        
        try {
            $formId = $model->createWithDetails($input);
            
            ResponseHelper::success([
                'message' => 'Installation form submitted successfully',
                'id' => $formId
            ], 201);
            
        } catch (Exception $e) {
            error_log("Error creating installation form: " . $e->getMessage());
            ResponseHelper::error('Failed to create form: ' . $e->getMessage(), 500);
        }
    }

    public static function update($id, $input) {
        $model = new InstallationModel();
        $form = $model->find($id);
        
        if (!$form) {
            ResponseHelper::error('Installation form not found', 404);
            return;
        }
        
        try {
            $model->updateWithDetails($id, $input);
            ResponseHelper::success(['message' => 'Installation form updated successfully']);
        } catch (Exception $e) {
            ResponseHelper::error('Failed to update form: ' . $e->getMessage(), 500);
        }
    }

    public static function delete($id) {
        $model = new InstallationModel();
        $form = $model->find($id);
        
        if (!$form) {
            ResponseHelper::error('Installation form not found', 404);
            return;
        }
        
        $model->delete($id);
        ResponseHelper::success(['message' => 'Installation form deleted successfully']);
    }

    // Method to get individual photo
    public static function getPhoto($photoId) {
        $model = new InstallationModel();
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
