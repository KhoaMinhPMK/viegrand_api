<?php
/**
 * API: Admin - Lấy lịch sử hoạt động của tài khoản
 * Methods: GET
 * Parameters: 
 *   - id: ID tài khoản cần lấy lịch sử
 */

header('Content-Type: application/json');

// Kiểm tra quyền admin
session_start();
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Bạn không có quyền truy cập tính năng này']);
    exit;
}

// Lấy ID tài khoản
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Thiếu ID tài khoản']);
    exit;
}

$id = (int)$_GET['id'];

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

// Kiểm tra tồn tại tài khoản
$checkSql = "SELECT id FROM employees WHERE id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param('i', $id);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản']);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Lấy lịch sử hoạt động
$sql = "
    SELECT 
        aa.id,
        aa.action,
        aa.details,
        aa.created_at,
        CONCAT(e.first_name, ' ', e.last_name) as admin_name
    FROM 
        account_activities aa
    LEFT JOIN 
        employees e ON aa.admin_id = e.id
    WHERE 
        aa.employee_id = ?
    ORDER BY 
        aa.created_at DESC
    LIMIT 50
";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) {
    // Định dạng lại dữ liệu
    $row['created_at'] = date('Y-m-d H:i:s', strtotime($row['created_at']));
    $row['details'] = json_decode($row['details'], true);
    
    // Thêm mô tả dễ đọc
    switch ($row['action']) {
        case 'status_update':
            $row['description'] = 'Cập nhật trạng thái thành: ' . translateStatus($row['details']['status']);
            break;
        case 'account_update':
            $row['description'] = 'Cập nhật thông tin tài khoản';
            break;
        case 'password_reset':
            $row['description'] = 'Đặt lại mật khẩu';
            break;
        case 'login':
            $row['description'] = 'Đăng nhập hệ thống';
            break;
        case 'logout':
            $row['description'] = 'Đăng xuất hệ thống';
            break;
        case 'failed_login':
            $row['description'] = 'Đăng nhập thất bại';
            break;
        default:
            $row['description'] = 'Hoạt động khác: ' . $row['action'];
    }
    
    $history[] = $row;
}

// Trả về kết quả
echo json_encode([
    'success' => true,
    'history' => $history
]);

// Đóng kết nối
$stmt->close();
$conn->close();

// Hàm tiện ích
function translateStatus($status) {
    $translations = [
        'pending' => 'Chờ duyệt',
        'active' => 'Đang hoạt động',
        'inactive' => 'Đã vô hiệu'
    ];
    
    return isset($translations[$status]) ? $translations[$status] : $status;
}
?>
