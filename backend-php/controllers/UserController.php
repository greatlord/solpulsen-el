<?php
require_once '../models/User.php';
require_once '../helpers/ResponseHelper.php';

class UserController {
    public static function getAll($user) {
        if ($user->role !== 'admin') {
            ResponseHelper::error('Only admin can view all users', 403);
            return;
        }

        $userModel = new User();
        $users = $userModel->findAll();
        ResponseHelper::success($users);
    }

    public static function create($input, $user) {
        if ($user->role !== 'admin') {
            ResponseHelper::error('Only admin can create users', 403);
            return;
        }

        $required = ['username', 'email', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ResponseHelper::error("Missing field: $field", 400);
                return;
            }
        }

        $userModel = new User();
        $input['password_hash'] = password_hash($input['password'], PASSWORD_BCRYPT);
        unset($input['password']);

        try {
            $userId = $userModel->createUser($input);
            ResponseHelper::success(['message' => 'User created successfully', 'id' => $userId]);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 409); // 409 = Conflict
        }
    }

    public static function update($input, $user) {
        if ($user->role !== 'admin') {
            ResponseHelper::error('Only admin can update users', 403);
            return;
        }

        if (empty($input['id'])) {
            ResponseHelper::error('User ID is required', 400);
            return;
        }

        $userModel = new User();

        try {
            $userModel->updateUser($input['id'], $input);
            ResponseHelper::success(['message' => 'User updated successfully']);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 409);
        }
    }

    public static function delete($input, $user) {
        if ($user->role !== 'admin') {
            ResponseHelper::error('Only admin can delete users', 403);
            return;
        }

        if (empty($input['id'])) {
            ResponseHelper::error('User ID is required', 400);
            return;
        }

        $userModel = new User();
        $userModel->deleteUser($input['id']);
        ResponseHelper::success(['message' => 'User deleted successfully']);
    }
}
