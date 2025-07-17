<?php
/**
 * API: Dashboard - Lấy dữ liệu thống kê cho dashboard
 * Method: GET
 */

require_once 'config.php';

// Xác thực người dùng - Yêu cầu quyền admin hoặc manager
$user = authenticateUser();
if ($user['role'] !== 'admin' && $user['role'] !== 'manager') {
    sendErrorResponse('Bạn không có quyền truy cập dữ liệu này', 403);
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Dữ liệu sẽ trả về
$dashboardData = [
    'employee_stats' => [],
    'department_stats' => [],
    'recent_activities' => [],
    'user_stats' => []
];

// 1. Lấy thống kê nhân viên
$employeeStats = $conn->query("
    SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN DATEDIFF(CURDATE(), start_date) <= 30 THEN 1 ELSE 0 END) as new_employees
    FROM employees
");

if ($employeeStats) {
    $dashboardData['employee_stats'] = $employeeStats->fetch_assoc();
}

// 2. Lấy thống kê theo phòng ban
$departmentStats = $conn->query("
    SELECT department, COUNT(*) as count
    FROM employees
    GROUP BY department
    ORDER BY count DESC
");

if ($departmentStats) {
    $departments = [];
    while ($row = $departmentStats->fetch_assoc()) {
        $departments[] = $row;
    }
    $dashboardData['department_stats'] = $departments;
}

// 3. Lấy hoạt động gần đây
$recentActivities = $conn->query("
    SELECT a.*, u.username
    FROM activity_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
");

if ($recentActivities) {
    $activities = [];
    while ($row = $recentActivities->fetch_assoc()) {
        $activities[] = $row;
    }
    $dashboardData['recent_activities'] = $activities;
}

// 4. Lấy thống kê người dùng
$userStats = $conn->query("
    SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_count,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
        SUM(CASE WHEN DATEDIFF(CURDATE(), created_at) <= 30 THEN 1 ELSE 0 END) as new_users
    FROM users
");

if ($userStats) {
    $dashboardData['user_stats'] = $userStats->fetch_assoc();
}

// Đóng kết nối
$conn->close();

// Trả về kết quả
sendSuccessResponse('Lấy dữ liệu dashboard thành công', $dashboardData);
?>
