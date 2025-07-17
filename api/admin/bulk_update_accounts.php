<?php
/**
 * API: Admin - Cập nhật hàng loạt tài khoản
 * Methods: POST
 * Parameters JSON: 
 *   - ids: Mảng các ID tài khoản
 *   - data: Dữ liệu cập nhật (status, ...)
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
if (!isset($input['ids']) || !is_array($input['ids']) || empty($input['ids']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
    exit;
}

$ids = array_map('intval', $input['ids']);
$data = $input['data'];

// Kiểm tra dữ liệu cập nhật
if (isset($data['status'])) {
    $validStatus = ['pending', 'active', 'inactive'];
    if (!in_array($data['status'], $validStatus)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Trạng thái không hợp lệ']);
        exit;
    }
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

// Xây dựng câu lệnh SQL cập nhật
$updates = [];
$params = [];
$types = '';

// Cập nhật trạng thái
if (isset($data['status'])) {
    $updates[] = "status = ?";
    $params[] = $data['status'];
    $types .= 's';
}

// Cập nhật ghi chú (nếu có)
if (isset($data['notes'])) {
    $updates[] = "notes = ?";
    $params[] = $data['notes'];
    $types .= 's';
}

// Nếu không có trường nào được cập nhật
if (empty($updates)) {
    echo json_encode(['success' => true, 'message' => 'Không có thông tin nào được cập nhật']);
    $conn->close();
    exit;
}

// Tạo placeholder cho danh sách ID
$idPlaceholders = implode(',', array_fill(0, count($ids), '?'));
foreach ($ids as $id) {
    $types .= 'i';
    $params[] = $id;
}

// Thực hiện cập nhật
$sql = "UPDATE employees SET " . implode(', ', $updates) . " WHERE id IN ($idPlaceholders)";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    // Ghi log hoạt động
    $adminId = $_SESSION['user_id'];
    $activitySql = "INSERT INTO admin_activities (admin_id, action, details, created_at) 
                   VALUES (?, 'bulk_update', ?, NOW())";
    $activityStmt = $conn->prepare($activitySql);
    $details = json_encode([
        'ids' => $ids,
        'data' => $data
    ]);
    $activityStmt->bind_param('is', $adminId, $details);
    $activityStmt->execute();
    $activityStmt->close();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Cập nhật ' . count($ids) . ' tài khoản thành công'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi khi cập nhật tài khoản: ' . $conn->error
    ]);
}

// Đóng kết nối
$stmt->close();
$conn->close();
?>
