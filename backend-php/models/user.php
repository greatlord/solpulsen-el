<?php
// todo remove this file
require_once __DIR__ . '/../db/database.php';

class User {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getPDO();
    }

    public function findAll() {
        $stmt = $this->db->prepare("SELECT id, username, email, role, first_name, last_name, phone FROM users WHERE is_active = 1");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id AND is_active = 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUsername($username) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :username AND is_active = 1");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email AND is_active = 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function isUsernameTaken($username, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM users WHERE username = :username AND is_active = 1";
        if ($excludeId !== null) {
            $sql .= " AND id != :id";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':username', $username);
        if ($excludeId !== null) {
            $stmt->bindValue(':id', $excludeId);
        }
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    public function isEmailTaken($email, $excludeId = null) {
        $sql = "SELECT COUNT(*) FROM users WHERE email = :email AND is_active = 1";
        if ($excludeId !== null) {
            $sql .= " AND id != :id";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':email', $email);
        if ($excludeId !== null) {
            $stmt->bindValue(':id', $excludeId);
        }
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    public function createUser($data) {
      
        if ($this->isEmailTaken($data['email'])) {
            throw new Exception("Email is already used by another user.");
        }

        $stmt = $this->db->prepare("
            INSERT INTO users (
                email, password_hash, role,
                first_name, last_name, phone
            ) VALUES (
                :email, :password_hash, :role,
                :first_name, :last_name, :phone
            )
        ");

        $stmt->execute([           
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'role' => $data['role'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone']
        ]);
        return $this->db->lastInsertId();
    }

    public function updateUser($id, $data) {
        // Get current user to compare values
        $current = $this->findById($id);

        if (!$current) {
            throw new Exception("User not found.");
        }
       
        if ($current['email'] !== $data['email'] && $this->isEmailTaken($data['email'], $id)) {
            throw new Exception("Email is already used by another user.");
        }

        $stmt = $this->db->prepare("
            UPDATE users SET
                email = :email,
                role = :role,
                first_name = :first_name,
                last_name = :last_name,
                phone = :phone
            WHERE id = :id
        ");
        $stmt->execute([
            'id' => $id,
            'email' => $data['email'],
            'role' => $data['role'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone']
        ]);
    }

    public function deleteUser($id) {
        $stmt = $this->db->prepare("UPDATE users SET is_active = 0 WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function updateLastLogin($id) {
        $stmt = $this->db->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}
