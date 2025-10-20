<?php
require_once __DIR__ . '/../models/TimeLog.php';
require_once __DIR__ . '/../helpers/AuthHelper.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class TimeTrackingController {
    public static function start() {
        $user = AuthHelper::getAuthenticatedUser();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $timeLog = new TimeLog();
        
        // Stop any existing active log first (auto-stop previous session)
        $activeLog = $timeLog->getActiveLog($user['id']);
        if ($activeLog) {
            $timeLog->stop($activeLog['id']);
        }
        
        $id = $timeLog->start(
            $user['id'],
            $input['project'] ?? 'Default Project',
            $input['description'] ?? 'Working...'
        );
        
        ResponseHelper::success([
            'message' => 'Time tracking started',
            'time_log_id' => $id
        ]);
    }

    public static function stop() {
        $user = AuthHelper::getAuthenticatedUser();
        
        $timeLog = new TimeLog();
        $activeLog = $timeLog->getActiveLog($user['id']);
        
        if (!$activeLog) {
            ResponseHelper::error('No active time log found', 404);
            return;
        }
        
        // Stop the time log
        $timeLog->stop($activeLog['id']);
        
        ResponseHelper::success(['message' => 'Time log stopped']);
    }

    public static function getActive() {
        $user = AuthHelper::getAuthenticatedUser();
        
        $timeLog = new TimeLog();
        $activeLog = $timeLog->getActiveLog($user['id']);
        
        if (!$activeLog) {
            ResponseHelper::success(['active_log' => null]);
            return;
        }
        
        ResponseHelper::success([
            'active_log' => $activeLog
        ]);
    }

    public static function getReport() {
        $user = AuthHelper::getAuthenticatedUser();
        $period = $_GET['period'] ?? 'today';
        
        $timeLog = new TimeLog();
        
        // Get logs with calculated duration from database
        $logs = $timeLog->getLogs($user['id'], $period);
        
        // Get additional data for charts and statistics
        $totalTime = $timeLog->getTotalTime($user['id'], $period);
        $weeklyBreakdown = $timeLog->getWeeklyBreakdown($user['id']);
        $monthlyTrend = $timeLog->getMonthlyTrend($user['id'], 3);
        $targets = $timeLog->getTargets($user['id']);
        
        ResponseHelper::success([
            'entries' => $logs,
            'daily_target' => $targets['daily_target'],
            'weekly_target' => $targets['weekly_target'],
            'total_time' => $totalTime,
            'weekly_breakdown' => $weeklyBreakdown,
            'monthly_trend' => $monthlyTrend
        ]);
    }

    public static function createManual() {
        $user = AuthHelper::getAuthenticatedUser();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['date', 'start_time', 'end_time'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                ResponseHelper::error("Missing required field: $field", 400);
                return;
            }
        }
        
        $timeLog = new TimeLog();
        
        // Check if this is an update or create
        if (isset($input['id']) && !empty($input['id'])) {
            // Update existing entry
            $result = $timeLog->updateEntry(
                $input['id'],
                $user['id'],
                $input['date'],
                $input['start_time'],
                $input['end_time'],
                $input['project_name'] ?? 'Manual Entry',
                $input['description'] ?? 'Manual time entry'
            );
            
            if ($result) {
                ResponseHelper::success(['message' => 'Entry updated successfully']);
            } else {
                ResponseHelper::error('Failed to update entry', 500);
            }
        } else {
            // Create new entry
            $result = $timeLog->createManual(
                $user['id'],
                $input['date'],
                $input['start_time'],
                $input['end_time'],
                $input['project_name'] ?? 'Manual Entry',
                $input['description'] ?? 'Manual time entry'
            );
            
            if ($result) {
                ResponseHelper::success(['message' => 'Manual entry created successfully']);
            } else {
                ResponseHelper::error('Failed to create entry', 500);
            }
        }
    }

    // Additional helper methods for dashboard and statistics
    public static function getDashboardStats() {
        $user = AuthHelper::getAuthenticatedUser();
        $timeLog = new TimeLog();
        
        $todayTime = $timeLog->getTotalTime($user['id'], 'today');
        $weekTime = $timeLog->getTotalTime($user['id'], 'this_week');
        $monthTime = $timeLog->getTotalTime($user['id'], 'this_month');
        $activeLog = $timeLog->getActiveLog($user['id']);
        $targets = $timeLog->getTargets($user['id']);
        
        // Calculate efficiency percentages
        $dailyEfficiency = $targets['daily_target'] > 0 ? min(100, round(($todayTime / $targets['daily_target']) * 100)) : 0;
        $weeklyEfficiency = $targets['weekly_target'] > 0 ? min(100, round(($weekTime / $targets['weekly_target']) * 100)) : 0;
        
        ResponseHelper::success([
            'today_time' => $todayTime,
            'week_time' => $weekTime,
            'month_time' => $monthTime,
            'daily_efficiency' => $dailyEfficiency,
            'weekly_efficiency' => $weeklyEfficiency,
            'is_active' => $activeLog !== null,
            'active_log' => $activeLog,
            'targets' => $targets
        ]);
    }
}