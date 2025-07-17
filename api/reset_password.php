<?php
/**
 * API: Reset Password - Đặt lại mật khẩu
 * Method: POST
 * Params: token, password, confirmPassword
 */

require_once 'config.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Phương thức không được hỗ trợ', 405);
    exit;
}

// Lấy dữ liệu từ request
$token = isset($_POST['token']) ? trim($_POST['token']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

// Kiểm tra dữ liệu
if (empty($token) || empty($password) || empty($confirmPassword)) {
    sendErrorResponse('Vui lòng nhập đầy đủ thông tin');
    exit;
}

// Kiểm tra mật khẩu và xác nhận mật khẩu
if ($password !== $confirmPassword) {
    sendErrorResponse('Mật khẩu xác nhận không khớp');
    exit;
}

// Kiểm tra độ mạnh của mật khẩu
if (strlen($password) < 8) {
    sendErrorResponse('Mật khẩu phải có ít nhất 8 ký tự');
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Kiểm tra token có hợp lệ không
$stmt = $conn->prepare('SELECT email, expires_at FROM password_resets WHERE token = ? LIMIT 1');
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendErrorResponse('Token không hợp lệ hoặc đã hết hạn');
    exit;
}

// Lấy thông tin reset password
$resetInfo = $result->fetch_assoc();
$stmt->close();

// Kiểm tra token có hết hạn không
$currentTime = time();
$expiryTime = strtotime($resetInfo['expires_at']);

if ($currentTime > $expiryTime) {
    // Xóa token đã hết hạn
    $deleteStmt = $conn->prepare('DELETE FROM password_resets WHERE token = ?');
    $deleteStmt->bind_param('s', $token);
    $deleteStmt->execute();
    $deleteStmt->close();
    
    $conn->close();
    sendErrorResponse('Token đã hết hạn, vui lòng yêu cầu khôi phục mật khẩu lại');
    exit;
}

// Lấy thông tin người dùng từ email
$email = $resetInfo['email'];
$stmt = $conn->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Trường hợp hiếm gặp: email trong bảng password_resets không tồn tại trong bảng users
    $stmt->close();
    $conn->close();
    sendErrorResponse('Tài khoản không tồn tại');
    exit;
}

// Lấy thông tin người dùng
$user = $result->fetch_assoc();
$stmt->close();

// Cập nhật mật khẩu mới
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$updateStmt = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
$updateStmt->bind_param('si', $hashedPassword, $user['id']);
$updateStmt->execute();
$updateStmt->close();

// Xóa token đã sử dụng
$deleteStmt = $conn->prepare('DELETE FROM password_resets WHERE token = ?');
$deleteStmt->bind_param('s', $token);
$deleteStmt->execute();
$deleteStmt->close();

// Log hoạt động
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$description = "Đặt lại mật khẩu thành công";

$logStmt = $conn->prepare('
    INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
    VALUES (?, "reset_password", ?, ?, ?)
');
$logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
$logStmt->execute();
$logStmt->close();

// Đóng kết nối
$conn->close();

// Trả về thành công
sendSuccessResponse('Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
?>
