<?php
/**
 * API: User Profile - Lấy thông tin người dùng
 * Method: GET
 * Authorization: Bearer {token}
 */

require_once 'config.php';

// Xác thực người dùng từ token
$userData = authenticateUser();

// Kết nối database
$conn = getDBConnection();

// Lấy thông tin người dùng
$stmt = $conn->prepare('
    SELECT u.id, u.username, u.email, u.role, u.status, u.created_at, u.last_login,
           e.employee_id, e.first_name, e.last_name, e.phone, e.department, 
           e.position, e.start_date, e.avatar, e.agree_newsletter
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    WHERE u.id = ?
');
$stmt->bind_param('i', $userData['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendErrorResponse('Không tìm thấy thông tin người dùng', 404);
    exit;
}

// Lấy thông tin người dùng
$user = $result->fetch_assoc();
$stmt->close();

// Thêm thông tin hoạt động gần đây
$activityStmt = $conn->prepare('
    SELECT action, description, ip_address, created_at
    FROM activity_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10
');
$activityStmt->bind_param('i', $userData['id']);
$activityStmt->execute();
$activityResult = $activityStmt->get_result();

$recentActivities = [];
while ($activity = $activityResult->fetch_assoc()) {
    $recentActivities[] = $activity;
}
$activityStmt->close();

// Đóng kết nối
$conn->close();

// Chuẩn bị dữ liệu trả về
$profileData = [
    'user_info' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'status' => $user['status'],
        'created_at' => $user['created_at'],
        'last_login' => $user['last_login']
    ],
    'employee_info' => [
        'employee_id' => $user['employee_id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'full_name' => $user['first_name'] . ' ' . $user['last_name'],
        'phone' => $user['phone'],
        'department' => $user['department'],
        'position' => $user['position'],
        'start_date' => $user['start_date'],
        'avatar' => $user['avatar'],
        'agree_newsletter' => (bool)$user['agree_newsletter']
    ],
    'recent_activities' => $recentActivities
];

// Trả về thành công
sendSuccessResponse('Lấy thông tin người dùng thành công', $profileData);
?>
