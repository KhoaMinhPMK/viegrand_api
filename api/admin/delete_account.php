<?php
/**
 * API: Admin - Xóa tài khoản
 * Methods: POST
 * Parameters JSON: 
 *   - id: ID tài khoản
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
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Thiếu ID tài khoản']);
    exit;
}

$id = (int)$input['id'];

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

// Kiểm tra tồn tại tài khoản
$checkSql = "SELECT id FROM employees WHERE id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param('i', $id);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản']);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Lưu thông tin tài khoản trước khi xóa (để ghi log)
$getInfoSql = "SELECT employee_id, email FROM employees WHERE id = ?";
$getInfoStmt = $conn->prepare($getInfoSql);
$getInfoStmt->bind_param('i', $id);
$getInfoStmt->execute();
$accountInfo = $getInfoStmt->get_result()->fetch_assoc();
$getInfoStmt->close();

// Xóa tài khoản
$sql = "DELETE FROM employees WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    // Ghi log hoạt động xóa tài khoản
    $adminId = $_SESSION['user_id'];
    $activitySql = "INSERT INTO admin_activities (admin_id, action, details, created_at) 
                   VALUES (?, 'delete_account', ?, NOW())";
    $activityStmt = $conn->prepare($activitySql);
    $details = json_encode([
        'account_id' => $id,
        'employee_id' => $accountInfo['employee_id'],
        'email' => $accountInfo['email']
    ]);
    $activityStmt->bind_param('is', $adminId, $details);
    $activityStmt->execute();
    $activityStmt->close();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Xóa tài khoản thành công'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi khi xóa tài khoản: ' . $conn->error
    ]);
}

// Đóng kết nối
$stmt->close();
$conn->close();
?>
