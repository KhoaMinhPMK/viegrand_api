<?php
/**
 * API: Update Profile - Cập nhật thông tin người dùng
 * Method: POST
 * Authorization: Bearer {token}
 * Params: firstName, lastName, phone, oldPassword (optional), newPassword (optional), confirmPassword (optional)
 */

require_once 'config.php';

// Xác thực người dùng từ token
$userData = authenticateUser();

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Phương thức không được hỗ trợ', 405);
    exit;
}

// Lấy dữ liệu từ request
$firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$oldPassword = isset($_POST['oldPassword']) ? $_POST['oldPassword'] : '';
$newPassword = isset($_POST['newPassword']) ? $_POST['newPassword'] : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

// Kiểm tra các trường bắt buộc
if (empty($firstName) || empty($lastName)) {
    sendErrorResponse('Vui lòng điền đầy đủ họ và tên');
    exit;
}

// Kiểm tra định dạng số điện thoại nếu có
if (!empty($phone) && !preg_match('/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/', $phone)) {
    sendErrorResponse('Số điện thoại không hợp lệ');
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Cập nhật thông tin cơ bản
$stmt = $conn->prepare('
    UPDATE employees 
    SET first_name = ?, last_name = ? 
    WHERE user_id = ?
');
$stmt->bind_param('ssi', $firstName, $lastName, $userData['id']);
$stmt->execute();
$stmt->close();

// Cập nhật số điện thoại nếu có
if (!empty($phone)) {
    $stmt = $conn->prepare('UPDATE employees SET phone = ? WHERE user_id = ?');
    $stmt->bind_param('si', $phone, $userData['id']);
    $stmt->execute();
    $stmt->close();
}

// Kiểm tra nếu có yêu cầu đổi mật khẩu
if (!empty($oldPassword) && !empty($newPassword) && !empty($confirmPassword)) {
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if ($newPassword !== $confirmPassword) {
        $conn->close();
        sendErrorResponse('Mật khẩu xác nhận không khớp');
        exit;
    }
    
    // Kiểm tra độ mạnh của mật khẩu mới
    if (strlen($newPassword) < 8) {
        $conn->close();
        sendErrorResponse('Mật khẩu mới phải có ít nhất 8 ký tự');
        exit;
    }
    
    // Kiểm tra mật khẩu cũ
    $stmt = $conn->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->bind_param('i', $userData['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if (!password_verify($oldPassword, $user['password'])) {
        $conn->close();
        sendErrorResponse('Mật khẩu cũ không chính xác');
        exit;
    }
    
    // Cập nhật mật khẩu mới
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->bind_param('si', $hashedPassword, $userData['id']);
    $stmt->execute();
    $stmt->close();
    
    // Log hoạt động đổi mật khẩu
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    $description = "Đổi mật khẩu thành công";
    
    $logStmt = $conn->prepare('
        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
        VALUES (?, "change_password", ?, ?, ?)
    ');
    $logStmt->bind_param('isss', $userData['id'], $description, $ipAddress, $userAgent);
    $logStmt->execute();
    $logStmt->close();
}

// Log hoạt động cập nhật thông tin
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$description = "Cập nhật thông tin cá nhân";

$logStmt = $conn->prepare('
    INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
    VALUES (?, "update_profile", ?, ?, ?)
');
$logStmt->bind_param('isss', $userData['id'], $description, $ipAddress, $userAgent);
$logStmt->execute();
$logStmt->close();

// Đóng kết nối
$conn->close();

// Trả về thành công
$message = !empty($oldPassword) 
    ? 'Cập nhật thông tin và mật khẩu thành công' 
    : 'Cập nhật thông tin thành công';

sendSuccessResponse($message);
?>
