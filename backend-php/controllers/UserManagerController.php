<?php
require_once __DIR__ . '/../models/usersManger.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class UserManagerController {
    public static function getAll() {
        $model = new UserModel();
        $users = $model->findAll();
        ResponseHelper::success($users);
    }

    public static function get($id) {
        $model = new UserModel();
        $user = $model->find($id);
        
        if (!$user) {
            ResponseHelper::error('User not found', 404);
            return;
        }
        
        ResponseHelper::success($user);
    }

    public static function create($input) {
        $required = ['email', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ResponseHelper::error("Missing required field: $field", 400);
                return;
            }
        }
        
        $model = new UserModel();
        $userId = $model->create($input);
        
        ResponseHelper::success([
            'message' => 'User created',
            'id' => $userId
        ], 201);
    }

    public static function update($id, $input) {
        $model = new UserModel();
        $user = $model->find($id);
        
        if (!$user) {
            ResponseHelper::error('User not found', 404);
            return;
        }
        
        $model->update($id, $input);
        ResponseHelper::success(['message' => 'User updated']);
    }

    public static function delete($id) {
        $model = new UserModel();
        $user = $model->find($id);
        
        if (!$user) {
            ResponseHelper::error('User not found', 404);
            return;
        }
        
        $model->delete($id);
        ResponseHelper::success(['message' => 'User deleted']);
    }

    private static function canAccess($user) {
        return $user['role'] === 'admin' || 
               $user['role'] === 'säljchef';               
    }
}