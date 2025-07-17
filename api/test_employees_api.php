<?php
/**
 * API Test: Test API kết nối đến bảng employees
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cho phép cross-origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Kết nối database
$host = 'viegrand.site';
$user = 'viegrand';
$pass = '12345678';
$db   = 'viegrand';
$port = 3306;

// Kết quả tổng hợp
$results = [];
$results[] = ['step' => 'init', 'message' => "Connecting to database: $host:$port, user: $user, db: $db"];

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Kết nối database thất bại: ' . $conn->connect_error
    ]);
    exit;
}

$results[] = ['step' => 'connect', 'message' => "Database connection successful"];

// Kiểm tra bảng employees
$sql = "SHOW TABLES LIKE 'employees'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    echo json_encode([
        'success' => false, 
        'message' => 'Bảng employees không tồn tại',
        'results' => $results
    ]);
    $conn->close();
    exit;
}

$results[] = ['step' => 'check_table', 'message' => "Table 'employees' exists"];

// Đếm số bản ghi trong bảng
$sql = "SELECT COUNT(*) as count FROM employees";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
$count = $row['count'];

$results[] = ['step' => 'count', 'message' => "Found $count records in employees table"];

// Lấy danh sách 5 bản ghi đầu tiên
$sql = "SELECT * FROM employees LIMIT 5";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        'success' => false, 
        'message' => 'Lỗi truy vấn: ' . $conn->error,
        'results' => $results
    ]);
    $conn->close();
    exit;
}

$employees = [];
while ($row = $result->fetch_assoc()) {
    $employees[] = $row;
}

$results[] = ['step' => 'sample', 'message' => "Retrieved sample data successfully"];

// Trả về tất cả kết quả
echo json_encode([
    'success' => true,
    'results' => $results,
    'count' => $count,
    'data' => $employees
]);

// Đóng kết nối
$conn->close();
?>
