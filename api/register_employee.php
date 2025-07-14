<?php
// API: Đăng ký nhân viên
// Nhận POST: email, password, fullname, phone
// Kiểm tra email trùng, nếu chưa có thì thêm mới vào bảng employees
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
$email    = isset($_POST['email'])    ? trim($_POST['email'])    : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';
$fullname = isset($_POST['fullname']) ? trim($_POST['fullname']) : '';
$phone    = isset($_POST['phone'])    ? trim($_POST['phone'])    : '';

// Kiểm tra dữ liệu hợp lệ
if ($email === '' || $password === '' || $fullname === '' || $phone === '') {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin']);
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
$stmt = $conn->prepare('INSERT INTO employees (email, password, fullname, phone) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $email, $password, $fullname, $phone);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Đăng ký thành công']);
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi khi đăng ký: ' . $conn->error]);
}
$stmt->close();
$conn->close();
?> 