<?php
require_once __DIR__ . '/../db/database.php';

class TimeLog {
    private $conn;
    private $table_name = "time_logs";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getPDO();
    }

    public function start($userId, $project = null, $description = null) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id = :user_id,
                      project_name = :project_name,
                      description = :description,
                      start_time = NOW(),
                      status = 'pending',
                      created_at = NOW(),
                      updated_at = NOW()";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":project_name", $project);
        $stmt->bindParam(":description", $description);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function stop($timeLogId) {
        $query = "UPDATE " . $this->table_name . " 
                  SET end_time = NOW(),
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $timeLogId);

        return $stmt->execute();
    }

    public function getActiveLog($userId) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  AND (end_time IS NULL OR end_time = '0000-00-00 00:00:00')
                  ORDER BY start_time DESC 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getLogs($userId, $period = 'today') {
        $whereConditions = ['user_id = :user_id'];
        $params = [':user_id' => $userId];

        switch($period) {
            case 'today':
                $whereConditions[] = 'DATE(start_time) = CURDATE()';
                break;
            case 'this_week':
                $whereConditions[] = 'YEARWEEK(start_time, 1) = YEARWEEK(CURDATE(), 1)';
                break;
            case 'this_month':
                $whereConditions[] = 'MONTH(start_time) = MONTH(CURDATE()) AND YEAR(start_time) = YEAR(CURDATE())';
                break;
            case 'last_3_months':
                $whereConditions[] = 'start_time >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
                break;
        }

        $query = "SELECT *,
                  CASE 
                      WHEN end_time IS NOT NULL AND end_time != '0000-00-00 00:00:00' 
                      THEN TIMESTAMPDIFF(SECOND, start_time, end_time)
                      ELSE NULL
                  END as duration_seconds
                  FROM " . $this->table_name . " 
                  WHERE " . implode(' AND ', $whereConditions) . "
                  ORDER BY start_time DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalTime($userId, $period = 'today') {
        $whereConditions = ['user_id = :user_id'];
        $params = [':user_id' => $userId];

        switch($period) {
            case 'today':
                $whereConditions[] = 'DATE(start_time) = CURDATE()';
                break;
            case 'this_week':
                $whereConditions[] = 'YEARWEEK(start_time, 1) = YEARWEEK(CURDATE(), 1)';
                break;
            case 'this_month':
                $whereConditions[] = 'MONTH(start_time) = MONTH(CURDATE()) AND YEAR(start_time) = YEAR(CURDATE())';
                break;
            case 'last_3_months':
                $whereConditions[] = 'start_time >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
                break;
        }

        $query = "SELECT 
                  SUM(
                      CASE 
                          WHEN end_time IS NOT NULL AND end_time != '0000-00-00 00:00:00' 
                          THEN TIMESTAMPDIFF(SECOND, start_time, end_time)
                          ELSE 0
                      END
                  ) as total_seconds
                  FROM " . $this->table_name . " 
                  WHERE " . implode(' AND ', $whereConditions);

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return intval($result['total_seconds'] ?? 0);
    }

    public function getWeeklyBreakdown($userId) {
        $query = "SELECT 
                  DAYNAME(start_time) as day_name,
                  SUM(
                      CASE 
                          WHEN end_time IS NOT NULL AND end_time != '0000-00-00 00:00:00' 
                          THEN TIMESTAMPDIFF(SECOND, start_time, end_time)
                          ELSE 0 
                      END
                  ) as total_seconds
                  FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  AND YEARWEEK(start_time, 1) = YEARWEEK(CURDATE(), 1)
                  GROUP BY DAYNAME(start_time), DAYOFWEEK(start_time)
                  ORDER BY DAYOFWEEK(start_time)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize all days with 0
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $weeklyData = [];
        foreach ($days as $day) {
            $weeklyData[] = ['day_name' => $day, 'total_seconds' => 0];
        }

        // Fill in actual data
        foreach ($results as $result) {
            $dayIndex = array_search($result['day_name'], $days);
            if ($dayIndex !== false) {
                $weeklyData[$dayIndex]['total_seconds'] = intval($result['total_seconds']);
            }
        }

        return $weeklyData;
    }

    public function getMonthlyTrend($userId, $months = 3) {
        $query = "SELECT 
                  CONCAT('Vecka ', WEEK(start_time, 1)) as week,
                  SUM(
                      CASE 
                          WHEN end_time IS NOT NULL AND end_time != '0000-00-00 00:00:00' 
                          THEN TIMESTAMPDIFF(SECOND, start_time, end_time)
                          ELSE 0 
                      END
                  ) as total_seconds
                  FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  AND start_time >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
                  AND (end_time IS NOT NULL AND end_time != '0000-00-00 00:00:00')
                  GROUP BY WEEK(start_time, 1)
                  ORDER BY start_time";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':months', $months);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createManual($userId, $date, $startTime, $endTime, $projectName = null, $description = null) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id = :user_id,
                      project_name = :project_name,
                      description = :description,
                      start_time = :start_time,
                      end_time = :end_time,
                      status = 'pending',
                      created_at = NOW(),
                      updated_at = NOW()";

        $stmt = $this->conn->prepare($query);
        
        $startDateTime = $date . ' ' . $startTime;
        $endDateTime = $date . ' ' . $endTime;
        
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":project_name", $projectName);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":start_time", $startDateTime);
        $stmt->bindParam(":end_time", $endDateTime);

        return $stmt->execute();
    }

    public function updateEntry($entryId, $userId, $date, $startTime, $endTime, $projectName = null, $description = null) {
        $query = "UPDATE " . $this->table_name . " 
                  SET project_name = :project_name,
                      description = :description,
                      start_time = :start_time,
                      end_time = :end_time,
                      updated_at = NOW()
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        
        $startDateTime = $date . ' ' . $startTime;
        $endDateTime = $date . ' ' . $endTime;
        
        $stmt->bindParam(":id", $entryId);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":project_name", $projectName);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":start_time", $startDateTime);
        $stmt->bindParam(":end_time", $endDateTime);

        return $stmt->execute();
    }

    public function getTargets($userId) {
        // For now, return default targets
        // You can expand this to fetch user-specific targets from database
        return [
            'daily_target' => 28800,  // 8 hours in seconds
            'weekly_target' => 144000 // 40 hours in seconds
        ];
    }

    public function deleteEntry($entryId, $userId) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $entryId);
        $stmt->bindParam(":user_id", $userId);

        return $stmt->execute();
    }

    // Helper method to get current active session duration
    public function getActiveSessionDuration($userId) {
        $activeLog = $this->getActiveLog($userId);
        if (!$activeLog) {
            return 0;
        }

        $startTime = new DateTime($activeLog['start_time']);
        $now = new DateTime();
        return $now->getTimestamp() - $startTime->getTimestamp();
    }
}