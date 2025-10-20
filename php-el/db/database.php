<?php

class Database {
    private $pdo;

    public function __construct() {
        $host = 'localhost';
        $db   = 'pulsen_suitecrm';
        $user = 'pulsen_suitecrm';
        $pass = 'I%XShyxikg7n3$q0';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            die("Database connection failed2: " . $e->getMessage());
        }
    }

    public function getPDO() {
        return $this->pdo;
    }
}
