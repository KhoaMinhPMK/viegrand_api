<?php
/**
 * API: Admin - Cập nhật trạng thái tài khoản
 * Methods: POST
 * Parameters JSON: 
 *   - id: ID tài khoản
 *   - status: Trạng thái mới ('pending', 'active', 'inactive')
 */

header('Content-Type: application/json');

// Kiểm tra quyền admin
session_start();
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Bạn không có quyền truy cập tính năng này']);
    exit;
}

// Lấy dữ liệu từ body JSON
$input = json_decode(file_get_contents('php://input'), true);

// Kiểm tra dữ liệu
if (!isset($input['id']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
    exit;
}

$id = (int)$input['id'];
$status = $input['status'];

// Kiểm tra trạng thái hợp lệ
$validStatus = ['pending', 'active', 'inactive'];
if (!in_array($status, $validStatus)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Trạng thái không hợp lệ']);
    exit;
}

// Kết nối database
$host = 'viegrand.site';
$user = 'viegrand';
$pass = '12345678';
$db   = 'viegrand';
$port = 3306;
$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Kết nối database thất bại']);
    exit;
}

// Cập nhật trạng thái tài khoản
$sql = "UPDATE employees SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('si', $status, $id);

if ($stmt->execute()) {
    // Ghi lại hoạt động
    $adminId = $_SESSION['user_id'];
    $activitySql = "INSERT INTO account_activities (employee_id, admin_id, action, details, created_at) 
                    VALUES (?, ?, 'status_update', ?, NOW())";
    $activityStmt = $conn->prepare($activitySql);
    $details = json_encode(['status' => $status]);
    $activityStmt->bind_param('iis', $id, $adminId, $details);
    $activityStmt->execute();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Cập nhật trạng thái tài khoản thành công'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi khi cập nhật trạng thái tài khoản: ' . $conn->error
    ]);
}

// Đóng kết nối
$stmt->close();
$conn->close();
?>
