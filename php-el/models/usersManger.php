<?php
require_once __DIR__ . '/../db/database.php';

class UserModel {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getPDO();
    }

    public function findAll() {
        $stmt = $this->db->query("SELECT * FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $sql = "INSERT INTO users (
            email, password_hash, role, first_name, last_name, 
            phone, is_active
        ) VALUES (
            :email, :password_hash, :role, :first_name, :last_name, 
            :phone, :is_active
        )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([            
            'email' => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => $data['role'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'is_active' => $data['is_active'] ?? 1
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowedFields = [
            'email', 'role', 'first_name', 'last_name',
            'phone', 'is_active', 'password_hash'
        ];
        
        $fields = [];
        $params = ['id' => $id];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }
        
        // Special handling for password
        
        if (isset($data['password']) && !empty($data['password'])) {            
            $fields[] = "password_hash = :password_hash";
            $params['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        
        if (empty($fields)) {
            throw new Exception("No valid fields to update");
        }
        
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}