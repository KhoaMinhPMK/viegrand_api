<?php
/**
 * API: Admin - Cập nhật thông tin tài khoản
 * Methods: POST
 * Parameters JSON: 
 *   - id: ID tài khoản
 *   - firstName: Tên
 *   - lastName: Họ
 *   - email: Email
 *   - phone: Số điện thoại
 *   - department: Phòng ban
 *   - position: Chức vụ
 *   - startDate: Ngày bắt đầu
 *   - status: Trạng thái
 *   - notes: Ghi chú
 *   - resetPassword: Yêu cầu đặt lại mật khẩu (true/false)
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

// Xây dựng câu lệnh SQL update
$updates = [];
$params = [];
$types = '';

// Các trường có thể cập nhật
$fields = [
    'firstName' => 'first_name',
    'lastName' => 'last_name',
    'email' => 'email',
    'phone' => 'phone',
    'department' => 'department',
    'position' => 'position',
    'startDate' => 'start_date',
    'status' => 'status',
    'notes' => 'notes'
];

foreach ($fields as $inputField => $dbField) {
    if (isset($input[$inputField])) {
        $updates[] = "$dbField = ?";
        $params[] = $input[$inputField];
        $types .= 's';
    }
}

// Nếu không có trường nào cập nhật và không đặt lại mật khẩu
if (empty($updates) && (!isset($input['resetPassword']) || $input['resetPassword'] !== true)) {
    echo json_encode(['success' => true, 'message' => 'Không có thông tin nào được cập nhật']);
    $conn->close();
    exit;
}

// Thực hiện cập nhật thông tin
if (!empty($updates)) {
    $sql = "UPDATE employees SET " . implode(', ', $updates) . " WHERE id = ?";
    $params[] = $id;
    $types .= 'i';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật thông tin: ' . $conn->error]);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();
}

// Xử lý đặt lại mật khẩu nếu có yêu cầu
if (isset($input['resetPassword']) && $input['resetPassword'] === true) {
    // Tạo mật khẩu mới ngẫu nhiên
    $newPassword = generateRandomPassword();
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Cập nhật mật khẩu
    $passSql = "UPDATE employees SET password = ? WHERE id = ?";
    $passStmt = $conn->prepare($passSql);
    $passStmt->bind_param('si', $hashedPassword, $id);
    
    if (!$passStmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Lỗi khi đặt lại mật khẩu: ' . $conn->error]);
        $passStmt->close();
        $conn->close();
        exit;
    }
    $passStmt->close();
    
    // Ghi log đặt lại mật khẩu
    $adminId = $_SESSION['user_id'];
    $activitySql = "INSERT INTO account_activities (employee_id, admin_id, action, details, created_at) 
                   VALUES (?, ?, 'password_reset', ?, NOW())";
    $activityStmt = $conn->prepare($activitySql);
    $details = json_encode(['reset_by_admin' => true]);
    $activityStmt->bind_param('iis', $id, $adminId, $details);
    $activityStmt->execute();
    $activityStmt->close();
    
    // Trả về mật khẩu mới trong kết quả
    echo json_encode([
        'success' => true, 
        'message' => 'Cập nhật tài khoản thành công. Mật khẩu mới đã được tạo.',
        'newPassword' => $newPassword
    ]);
    
    $conn->close();
    exit;
}

// Ghi log cập nhật thông tin
$adminId = $_SESSION['user_id'];
$activitySql = "INSERT INTO account_activities (employee_id, admin_id, action, details, created_at) 
               VALUES (?, ?, 'account_update', ?, NOW())";
$activityStmt = $conn->prepare($activitySql);
$details = json_encode($input);
$activityStmt->bind_param('iis', $id, $adminId, $details);
$activityStmt->execute();
$activityStmt->close();

echo json_encode(['success' => true, 'message' => 'Cập nhật tài khoản thành công']);

// Đóng kết nối
$conn->close();

/**
 * Tạo mật khẩu ngẫu nhiên
 */
function generateRandomPassword($length = 10) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $password;
}
?>
