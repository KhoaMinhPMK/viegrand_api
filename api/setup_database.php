<?php
/**
 * API: Setup Database
 * Tạo các bảng cần thiết cho ứng dụng nếu chưa tồn tại
 */

require_once 'config.php';

// Chỉ cho phép chạy trên máy chủ cục bộ hoặc IP của admin
$allowedIPs = ['127.0.0.1', '::1', 'YOUR_ADMIN_IP']; 
if (!in_array($_SERVER['REMOTE_ADDR'], $allowedIPs)) {
    sendErrorResponse('Không có quyền truy cập', 403);
    exit;
}

// Kết nối đến database
$conn = getDBConnection();

// Mảng chứa các lệnh tạo bảng
$tables = [
    // Bảng users - lưu thông tin người dùng và đăng nhập
    'users' => "CREATE TABLE IF NOT EXISTS `users` (
        `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(50) NOT NULL,
        `email` VARCHAR(100) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `role` ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
        `status` ENUM('active', 'pending', 'inactive', 'locked') NOT NULL DEFAULT 'pending',
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `last_login` TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `username` (`username`),
        UNIQUE KEY `email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
    
    // Bảng employees - lưu thông tin nhân viên
    'employees' => "CREATE TABLE IF NOT EXISTS `employees` (
        `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` INT(11) UNSIGNED NOT NULL,
        `employee_id` VARCHAR(10) NOT NULL,
        `first_name` VARCHAR(50) NOT NULL,
        `last_name` VARCHAR(50) NOT NULL,
        `phone` VARCHAR(20) NOT NULL,
        `department` VARCHAR(100) NOT NULL,
        `position` VARCHAR(100) NOT NULL,
        `start_date` DATE NOT NULL,
        `avatar` VARCHAR(255) DEFAULT NULL,
        `agree_newsletter` TINYINT(1) NOT NULL DEFAULT '0',
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `employee_id` (`employee_id`),
        KEY `user_id` (`user_id`),
        CONSTRAINT `fk_employee_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
    
    // Bảng password_resets - lưu thông tin reset mật khẩu
    'password_resets' => "CREATE TABLE IF NOT EXISTS `password_resets` (
        `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        `email` VARCHAR(100) NOT NULL,
        `token` VARCHAR(255) NOT NULL,
        `expires_at` TIMESTAMP NOT NULL,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `email` (`email`),
        KEY `token` (`token`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
    
    // Bảng activity_logs - ghi lại các hoạt động của người dùng
    'activity_logs' => "CREATE TABLE IF NOT EXISTS `activity_logs` (
        `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` INT(11) UNSIGNED DEFAULT NULL,
        `action` VARCHAR(50) NOT NULL,
        `description` TEXT NOT NULL,
        `ip_address` VARCHAR(45) NOT NULL,
        `user_agent` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `user_id` (`user_id`),
        CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
];

// Tạo từng bảng nếu chưa tồn tại
$results = [
    'success' => true,
    'created_tables' => [],
    'existing_tables' => [],
    'errors' => []
];

foreach ($tables as $tableName => $tableQuery) {
    // Kiểm tra xem bảng đã tồn tại chưa
    $checkTable = $conn->query("SHOW TABLES LIKE '$tableName'");
    
    if ($checkTable->num_rows > 0) {
        $results['existing_tables'][] = $tableName;
    } else {
        // Tạo bảng mới
        if ($conn->query($tableQuery)) {
            $results['created_tables'][] = $tableName;
        } else {
            $results['errors'][] = "Lỗi khi tạo bảng $tableName: " . $conn->error;
            $results['success'] = false;
        }
    }
}

// Tạo tài khoản admin mặc định nếu chưa có
$adminEmail = 'admin@viegrand.site';
$adminCheck = $conn->query("SELECT id FROM users WHERE email = '$adminEmail'");

if ($adminCheck->num_rows == 0) {
    $adminUsername = 'admin';
    $adminPassword = password_hash('Admin@123', PASSWORD_BCRYPT, ['cost' => 12]);
    
    $createAdmin = $conn->query("
        INSERT INTO users (username, email, password, role, status) 
        VALUES ('$adminUsername', '$adminEmail', '$adminPassword', 'admin', 'active')
    ");
    
    if ($createAdmin) {
        $adminId = $conn->insert_id;
        
        $createAdminProfile = $conn->query("
            INSERT INTO employees (user_id, employee_id, first_name, last_name, phone, department, position, start_date) 
            VALUES ($adminId, 'AD001', 'Admin', 'System', '0901234567', 'IT', 'Administrator', '2023-01-01')
        ");
        
        if ($createAdminProfile) {
            $results['admin_created'] = true;
        } else {
            $results['admin_profile_error'] = $conn->error;
        }
    } else {
        $results['admin_error'] = $conn->error;
    }
}

// Đóng kết nối
$conn->close();

// Trả về kết quả
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
