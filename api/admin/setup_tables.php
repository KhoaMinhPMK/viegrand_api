<?php
/**
 * Script để tạo bảng account_activities và admin_activities
 * Chạy script này để tạo cấu trúc bảng cần thiết cho admin panel
 */

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

// Mảng lưu trữ kết quả thực thi
$results = [];

// 1. Cập nhật bảng employees để thêm các trường cần thiết
$employeesSql = "
    ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' COMMENT 'Trạng thái tài khoản: pending, active, inactive',
    ADD COLUMN IF NOT EXISTS notes TEXT NULL COMMENT 'Ghi chú của admin',
    ADD COLUMN IF NOT EXISTS registration_date DATETIME NULL COMMENT 'Ngày đăng ký',
    ADD COLUMN IF NOT EXISTS last_login DATETIME NULL COMMENT 'Lần đăng nhập cuối'
";

if ($conn->query($employeesSql)) {
    $results[] = "Đã cập nhật bảng employees thành công";
} else {
    $results[] = "Lỗi khi cập nhật bảng employees: " . $conn->error;
}

// 2. Tạo bảng account_activities để lưu hoạt động của tài khoản
$accountActivitiesSql = "
    CREATE TABLE IF NOT EXISTS account_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL COMMENT 'ID của nhân viên',
        admin_id INT NULL COMMENT 'ID của admin thực hiện thay đổi (nếu có)',
        action VARCHAR(50) NOT NULL COMMENT 'Loại hoạt động: login, logout, status_update, etc.',
        details TEXT NULL COMMENT 'Chi tiết hoạt động (JSON)',
        created_at DATETIME NOT NULL COMMENT 'Thời gian hoạt động',
        INDEX (employee_id),
        INDEX (admin_id),
        INDEX (action),
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lưu lịch sử hoạt động của tài khoản'
";

if ($conn->query($accountActivitiesSql)) {
    $results[] = "Đã tạo bảng account_activities thành công";
} else {
    $results[] = "Lỗi khi tạo bảng account_activities: " . $conn->error;
}

// 3. Tạo bảng admin_activities để lưu hoạt động của admin
$adminActivitiesSql = "
    CREATE TABLE IF NOT EXISTS admin_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL COMMENT 'ID của admin thực hiện hành động',
        action VARCHAR(50) NOT NULL COMMENT 'Loại hoạt động: delete_account, bulk_update, etc.',
        details TEXT NULL COMMENT 'Chi tiết hoạt động (JSON)',
        created_at DATETIME NOT NULL COMMENT 'Thời gian hoạt động',
        INDEX (admin_id),
        INDEX (action),
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lưu lịch sử hoạt động của admin'
";

if ($conn->query($adminActivitiesSql)) {
    $results[] = "Đã tạo bảng admin_activities thành công";
} else {
    $results[] = "Lỗi khi tạo bảng admin_activities: " . $conn->error;
}

// Trả về kết quả
echo json_encode([
    'success' => true,
    'results' => $results
]);

// Đóng kết nối
$conn->close();
?>
