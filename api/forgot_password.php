<?php
/**
 * API: Forgot Password - Khôi phục mật khẩu
 * Method: POST
 * Params: email
 */

require_once 'config.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Phương thức không được hỗ trợ', 405);
    exit;
}

// Lấy email từ request
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// Kiểm tra email
if (empty($email)) {
    sendErrorResponse('Vui lòng nhập email');
    exit;
}

// Kiểm tra định dạng email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendErrorResponse('Địa chỉ email không hợp lệ');
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Kiểm tra xem email có tồn tại trong hệ thống không
$stmt = $conn->prepare('SELECT id, username, status FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

// Nếu không tìm thấy email
if ($result->num_rows === 0) {
    // Không trả về thông báo lỗi cụ thể để bảo vệ thông tin
    $stmt->close();
    $conn->close();
    sendSuccessResponse('Nếu email này được đăng ký trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu qua email.');
    exit;
}

// Lấy thông tin người dùng
$user = $result->fetch_assoc();
$stmt->close();

// Kiểm tra trạng thái tài khoản
if ($user['status'] === 'locked' || $user['status'] === 'inactive') {
    $conn->close();
    sendErrorResponse('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    exit;
}

// Tạo token ngẫu nhiên
$token = bin2hex(random_bytes(32));

// Thời hạn token (1 giờ)
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Xóa token cũ của email này
$deleteStmt = $conn->prepare('DELETE FROM password_resets WHERE email = ?');
$deleteStmt->bind_param('s', $email);
$deleteStmt->execute();
$deleteStmt->close();

// Lưu token mới vào database
$insertStmt = $conn->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)');
$insertStmt->bind_param('sss', $email, $token, $expiresAt);
$insertStmt->execute();
$insertStmt->close();

// Log hoạt động
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$description = "Yêu cầu khôi phục mật khẩu cho email: $email";

$logStmt = $conn->prepare('
    INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
    VALUES (?, "forgot_password", ?, ?, ?)
');
$logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
$logStmt->execute();
$logStmt->close();

// Đóng kết nối
$conn->close();

// URL khôi phục mật khẩu
$resetUrl = "https://viegrand.site/page/auth/reset-password.html?token=$token";

// Trong môi trường thực tế, gửi email với link khôi phục mật khẩu
// Hiện tại chỉ trả về URL để test
sendSuccessResponse('Hướng dẫn khôi phục mật khẩu đã được gửi tới email của bạn.', [
    'reset_url' => $resetUrl,
    'token' => $token, // Chỉ trả về token trong môi trường phát triển, xóa trong production
    'expires_at' => $expiresAt
]);
?>
