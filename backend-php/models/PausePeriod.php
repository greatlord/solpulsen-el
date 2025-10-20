<?php
require_once __DIR__ . '/../db/database.php';

class PausePeriod {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getPDO();
    }

    // Start a pause period
    public function start($timeLogId) {
        $stmt = $this->db->prepare("
            INSERT INTO pause_periods 
            (time_log_id, pause_start) 
            VALUES (:time_log_id, NOW())
        ");
        
        $stmt->execute(['time_log_id' => $timeLogId]);
        return $this->db->lastInsertId();
    }

    // End a pause period
    public function stop($pauseId) {
        $stmt = $this->db->prepare("
            UPDATE pause_periods 
            SET pause_end = NOW()
            WHERE id = :id
        ");
        
        return $stmt->execute(['id' => $pauseId]);
    }

    // Get active pause for a time log
    public function getActivePause($timeLogId) {
        $stmt = $this->db->prepare("
            SELECT * FROM pause_periods 
            WHERE time_log_id = :time_log_id 
            AND (pause_end IS NULL OR pause_end = '0000-00-00 00:00:00')
            ORDER BY pause_start DESC 
            LIMIT 1
        ");
        
        $stmt->execute(['time_log_id' => $timeLogId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get total pause time for a time log
    public function getTotalPauseTime($timeLogId) {
        $stmt = $this->db->prepare("
            SELECT SUM(TIMESTAMPDIFF(SECOND, pause_start, pause_end)) AS total_seconds
            FROM pause_periods 
            WHERE time_log_id = :time_log_id
        ");
        
        $stmt->execute(['time_log_id' => $timeLogId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total_seconds'] ?? 0;
    }
}