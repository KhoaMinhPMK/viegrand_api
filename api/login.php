<?php
/**
 * API: Login - Đăng nhập hệ thống
 * Method: POST
 * Params: email, password, remember_me (optional)
 */

require_once 'config.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Phương thức không được hỗ trợ', 405);
    exit;
}

// Lấy dữ liệu từ request
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$rememberMe = isset($_POST['remember_me']) && $_POST['remember_me'] === 'true';

// Kiểm tra dữ liệu
if (empty($email) || empty($password)) {
    sendErrorResponse('Vui lòng nhập email và mật khẩu');
    exit;
}

// Kiểm tra định dạng email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendErrorResponse('Định dạng email không hợp lệ');
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Tìm kiếm người dùng theo email
$stmt = $conn->prepare('
    SELECT u.id, u.username, u.email, u.password, u.role, u.status, 
           e.first_name, e.last_name, e.employee_id, e.department, e.position 
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    WHERE u.email = ? LIMIT 1
');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Log thông tin đăng nhập sai
    $logStmt = $conn->prepare('
        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
        VALUES (NULL, "login_failed", ?, ?, ?)
    ');
    $description = "Đăng nhập thất bại - Email không tồn tại: $email";
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    $logStmt->bind_param('sss', $description, $ipAddress, $userAgent);
    $logStmt->execute();
    $logStmt->close();
    
    // Trả về thông báo lỗi chung để tăng cường bảo mật
    sendErrorResponse('Email hoặc mật khẩu không chính xác');
    exit;
}

// Lấy thông tin người dùng
$user = $result->fetch_assoc();
$stmt->close();

// Kiểm tra mật khẩu
if (!password_verify($password, $user['password'])) {
    // Log thông tin đăng nhập sai
    $logStmt = $conn->prepare('
        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
        VALUES (NULL, "login_failed", ?, ?, ?)
    ');
    $description = "Đăng nhập thất bại - Mật khẩu không đúng cho email: $email";
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    $logStmt->bind_param('sss', $description, $ipAddress, $userAgent);
    $logStmt->execute();
    $logStmt->close();
    
    // Trả về thông báo lỗi chung để tăng cường bảo mật
    sendErrorResponse('Email hoặc mật khẩu không chính xác');
    exit;
}

// Kiểm tra trạng thái tài khoản
if ($user['status'] !== 'active') {
    $statusMessage = 'Tài khoản của bạn chưa được kích hoạt';
    if ($user['status'] === 'locked') {
        $statusMessage = 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên';
    } elseif ($user['status'] === 'inactive') {
        $statusMessage = 'Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ quản trị viên';
    }
    
    sendErrorResponse($statusMessage, 403);
    exit;
}

// Tạo JWT Token
$token = generateJWT($user['id'], $user['email'], $user['role']);

// Cập nhật thời gian đăng nhập cuối cùng
$updateStmt = $conn->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
$updateStmt->bind_param('i', $user['id']);
$updateStmt->execute();
$updateStmt->close();

// Log thông tin đăng nhập thành công
$logStmt = $conn->prepare('
    INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
    VALUES (?, "login_success", ?, ?, ?)
');
$description = "Đăng nhập thành công";
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
$logStmt->execute();
$logStmt->close();

// Đóng kết nối
$conn->close();

// Chuẩn bị dữ liệu trả về
$userData = [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email'],
    'role' => $user['role'],
    'first_name' => $user['first_name'],
    'last_name' => $user['last_name'],
    'employee_id' => $user['employee_id'],
    'department' => $user['department'],
    'position' => $user['position'],
    'token' => $token,
    'remember_me' => $rememberMe
];

// Trả về kết quả thành công
sendSuccessResponse('Đăng nhập thành công', $userData);
?>
