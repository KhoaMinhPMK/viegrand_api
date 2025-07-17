<?php
/**
 * API: Register - Đăng ký tài khoản mới
 * Method: POST
 * Params: firstName, lastName, email, phone, employeeId, username, password, 
 *         confirmPassword, department, position, startDate, agreeTerms, agreeNewsletter (optional)
 */

require_once 'config.php';

// Chỉ chấp nhận phương thức POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Phương thức không được hỗ trợ', 405);
    exit;
}

// Lấy dữ liệu từ request
$firstName       = isset($_POST['firstName'])       ? trim($_POST['firstName'])       : '';
$lastName        = isset($_POST['lastName'])        ? trim($_POST['lastName'])        : '';
$email           = isset($_POST['email'])           ? trim($_POST['email'])           : '';
$phone           = isset($_POST['phone'])           ? trim($_POST['phone'])           : '';
$employeeId      = isset($_POST['employeeId'])      ? trim($_POST['employeeId'])      : '';
$username        = isset($_POST['username'])        ? trim($_POST['username'])        : '';
$password        = isset($_POST['password'])        ? $_POST['password']              : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword']       : '';
$department      = isset($_POST['department'])      ? trim($_POST['department'])      : '';
$position        = isset($_POST['position'])        ? trim($_POST['position'])        : '';
$startDate       = isset($_POST['startDate'])       ? trim($_POST['startDate'])       : '';
$agreeTerms      = isset($_POST['agreeTerms'])      ? (bool)$_POST['agreeTerms']      : false;
$agreeNewsletter = isset($_POST['agreeNewsletter']) ? (bool)$_POST['agreeNewsletter'] : false;

// Kiểm tra các trường bắt buộc
if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || 
    empty($employeeId) || empty($username) || empty($password) || empty($confirmPassword) || 
    empty($department) || empty($position) || empty($startDate) || !$agreeTerms) {
    
    sendErrorResponse('Vui lòng điền đầy đủ thông tin bắt buộc và đồng ý điều khoản');
    exit;
}

// Kiểm tra định dạng email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendErrorResponse('Định dạng email không hợp lệ');
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

// Kiểm tra định dạng số điện thoại (dựa theo định dạng số điện thoại Việt Nam)
if (!preg_match('/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/', $phone)) {
    sendErrorResponse('Số điện thoại không hợp lệ');
    exit;
}

// Kiểm tra định dạng mã nhân viên 
if (!preg_match('/^[A-Z]{2}\d{4}$/', $employeeId)) {
    sendErrorResponse('Mã nhân viên phải có định dạng: 2 chữ cái + 4 số (VD: NV0001)');
    exit;
}

// Kiểm tra định dạng username
if (!preg_match('/^[a-zA-Z0-9_]{4,}$/', $username)) {
    sendErrorResponse('Tên đăng nhập phải có ít nhất 4 ký tự và chỉ được chứa chữ cái, số và dấu gạch dưới');
    exit;
}

// Kết nối database
$conn = getDBConnection();

// Kiểm tra email đã tồn tại chưa
$stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    sendErrorResponse('Email này đã được sử dụng');
    exit;
}
$stmt->close();

// Kiểm tra username đã tồn tại chưa
$stmt = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    sendErrorResponse('Tên đăng nhập này đã được sử dụng');
    exit;
}
$stmt->close();

// Kiểm tra employee_id đã tồn tại chưa
$stmt = $conn->prepare('SELECT id FROM employees WHERE employee_id = ? LIMIT 1');
$stmt->bind_param('s', $employeeId);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    sendErrorResponse('Mã nhân viên này đã được sử dụng');
    exit;
}
$stmt->close();

// Băm mật khẩu
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Trạng thái người dùng mặc định dựa trên cấu hình
$status = $config['settings']['auto_activate_users'] ? 'active' : 'pending';

// Thêm người dùng vào bảng users
$stmt = $conn->prepare('
    INSERT INTO users (username, email, password, role, status) 
    VALUES (?, ?, ?, ?, ?)
');
$role = $config['settings']['default_user_role'];
$stmt->bind_param('sssss', $username, $email, $hashedPassword, $role, $status);

// Bắt đầu transaction
$conn->begin_transaction();

try {
    if (!$stmt->execute()) {
        throw new Exception("Lỗi khi thêm người dùng: " . $stmt->error);
    }
    
    $userId = $stmt->insert_id;
    $stmt->close();
    
    // Thêm thông tin nhân viên vào bảng employees
    $stmt = $conn->prepare('
        INSERT INTO employees (user_id, employee_id, first_name, last_name, phone, 
                             department, position, start_date, agree_newsletter) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $agreeNewsletterInt = $agreeNewsletter ? 1 : 0;
    $stmt->bind_param('isssssssi', $userId, $employeeId, $firstName, $lastName, $phone, 
                     $department, $position, $startDate, $agreeNewsletterInt);
                     
    if (!$stmt->execute()) {
        throw new Exception("Lỗi khi thêm thông tin nhân viên: " . $stmt->error);
    }
    
    // Log hoạt động
    $ipAddress = $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    $description = "Đăng ký tài khoản mới: $username ($email)";
    
    $logStmt = $conn->prepare('
        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
        VALUES (?, "register", ?, ?, ?)
    ');
    $logStmt->bind_param('isss', $userId, $description, $ipAddress, $userAgent);
    $logStmt->execute();
    $logStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    // Chuẩn bị phản hồi
    $message = $status === 'active' 
        ? 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.'
        : 'Đăng ký thành công! Tài khoản của bạn đang chờ được phê duyệt.';
    
    sendSuccessResponse($message, [
        'username' => $username,
        'email' => $email,
        'status' => $status
    ]);
    
} catch (Exception $e) {
    // Rollback transaction nếu có lỗi
    $conn->rollback();
    sendErrorResponse('Đã xảy ra lỗi trong quá trình đăng ký: ' . $e->getMessage());
} finally {
    $stmt->close();
    $conn->close();
}
?>
