<?php
// API: Đăng ký nhân viên (đầy đủ trường tương thích frontend)
// Nhận POST: firstName, lastName, email, phone, employeeId, username, password, confirmPassword, department, position, startDate, agreeTerms, agreeNewsletter
// Kiểm tra các trường bắt buộc, kiểm tra email trùng, kiểm tra password và confirmPassword giống nhau
// Lưu vào bảng employees
// Trả về JSON kết quả

header('Content-Type: application/json');

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

// Nhận dữ liệu POST
$firstName        = isset($_POST['firstName'])        ? trim($_POST['firstName'])        : '';
$lastName         = isset($_POST['lastName'])         ? trim($_POST['lastName'])         : '';
$email            = isset($_POST['email'])            ? trim($_POST['email'])            : '';
$phone            = isset($_POST['phone'])            ? trim($_POST['phone'])            : '';
$employeeId       = isset($_POST['employeeId'])       ? trim($_POST['employeeId'])       : '';
$username         = isset($_POST['username'])         ? trim($_POST['username'])         : '';
$password         = isset($_POST['password'])         ? trim($_POST['password'])         : '';
$confirmPassword  = isset($_POST['confirmPassword'])  ? trim($_POST['confirmPassword'])  : '';
$department       = isset($_POST['department'])       ? trim($_POST['department'])       : '';
$position         = isset($_POST['position'])         ? trim($_POST['position'])         : '';
$startDate        = isset($_POST['startDate'])        ? trim($_POST['startDate'])        : '';
$agreeTerms       = isset($_POST['agreeTerms'])       ? 1 : 0;
$agreeNewsletter  = isset($_POST['agreeNewsletter'])  ? 1 : 0;

// Kiểm tra các trường bắt buộc
if ($firstName === '' || $lastName === '' || $email === '' || $phone === '' || $employeeId === '' || $username === '' || $password === '' || $confirmPassword === '' || $department === '' || $position === '' || $startDate === '' || !$agreeTerms) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin bắt buộc và đồng ý điều khoản']);
    $conn->close();
    exit;
}

// Kiểm tra password và confirmPassword giống nhau
if ($password !== $confirmPassword) {
    echo json_encode(['success' => false, 'message' => 'Mật khẩu xác nhận không khớp']);
    $conn->close();
    exit;
}

// Kiểm tra email đã tồn tại chưa
$stmt = $conn->prepare('SELECT id FROM employees WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email đã tồn tại']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// Thêm mới nhân viên
$stmt = $conn->prepare('INSERT INTO employees (first_name, last_name, email, phone, employee_id, username, password, department, position, start_date, agree_terms, agree_newsletter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->bind_param('ssssssssssis', $firstName, $lastName, $email, $phone, $employeeId, $username, $password, $department, $position, $startDate, $agreeTerms, $agreeNewsletter);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Đăng ký thành công']);
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi khi đăng ký: ' . $conn->error]);
}
$stmt->close();
$conn->close();
?> 