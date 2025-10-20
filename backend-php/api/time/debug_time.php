<?php
// Temporary debug file to test time tracking
require_once __DIR__ . '/../../models/TimeLog.php';
require_once __DIR__ . '/../../helpers/AuthHelper.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

try {
    $user = AuthHelper::getAuthenticatedUser();
    $timeLog = new TimeLog();
    
    // Test different scenarios
    echo "=== TIME TRACKING DEBUG ===\n";
    echo "User ID: " . $user['id'] . "\n\n";
    
    // 1. Check active log
    echo "1. ACTIVE LOG:\n";
    $activeLog = $timeLog->getActiveLog($user['id']);
    if ($activeLog) {
        echo "Active log found:\n";
        echo "- ID: " . $activeLog['id'] . "\n";
        echo "- Start: " . $activeLog['start_time'] . "\n";
        echo "- End: " . ($activeLog['end_time'] ?: 'NULL') . "\n";
        
        // Calculate current duration
        $startTime = new DateTime($activeLog['start_time']);
        $now = new DateTime();
        $currentDuration = $now->getTimestamp() - $startTime->getTimestamp();
        echo "- Current duration: " . $currentDuration . " seconds\n";
    } else {
        echo "No active log found\n";
    }
    echo "\n";
    
    // 2. Check today's logs
    echo "2. TODAY'S LOGS:\n";
    $todayLogs = $timeLog->getLogs($user['id'], 'today');
    echo "Found " . count($todayLogs) . " logs today:\n";
    
    foreach ($todayLogs as $log) {
        echo "- Log ID: " . $log['id'] . "\n";
        echo "  Start: " . $log['start_time'] . "\n";
        echo "  End: " . ($log['end_time'] ?: 'NULL') . "\n";
        echo "  Duration (seconds): " . ($log['duration_seconds'] ?: 'NULL') . "\n";
        echo "  Project: " . ($log['project_name'] ?: 'NULL') . "\n";
        echo "\n";
    }
    
    // 3. Calculate total time
    echo "3. TOTAL TIME CALCULATION:\n";
    $totalTime = $timeLog->getTotalTime($user['id'], 'today');
    echo "Total completed time today: " . $totalTime . " seconds\n";
    echo "Total completed time (formatted): " . gmdate('H:i:s', $totalTime) . "\n";
    
    // 4. If there's an active session, add that time
    if ($activeLog) {
        $activeTime = $currentDuration;
        $grandTotal = $totalTime + $activeTime;
        echo "Active session time: " . $activeTime . " seconds\n";
        echo "Grand total (completed + active): " . $grandTotal . " seconds\n";
        echo "Grand total (formatted): " . gmdate('H:i:s', $grandTotal) . "\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}