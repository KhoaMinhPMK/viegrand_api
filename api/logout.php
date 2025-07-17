<?php
/**
 * API: Logout - Đăng xuất
 * Method: POST
 * Authorization: Bearer {token}
 * 
 * Lưu ý: Việc đăng xuất chủ yếu được xử lý ở phía client
 * Phía server chỉ ghi log hoạt động đăng xuất của người dùng
 */

require_once 'config.php';

// Xác thực người dùng từ token
$userData = authenticateUser();

// Kết nối database
$conn = getDBConnection();

// Log hoạt động đăng xuất
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$description = "Đăng xuất từ hệ thống";

$logStmt = $conn->prepare('
    INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
    VALUES (?, "logout", ?, ?, ?)
');
$logStmt->bind_param('isss', $userData['id'], $description, $ipAddress, $userAgent);
$logStmt->execute();
$logStmt->close();

// Đóng kết nối
$conn->close();

// Trả về thành công
sendSuccessResponse('Đăng xuất thành công');
?>
