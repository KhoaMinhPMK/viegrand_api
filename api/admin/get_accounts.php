<?php
/**
 * API: Admin - Lấy danh sách tài khoản nhân viên
 * Methods: GET
 * Parameters: 
 *   - status: Lọc theo trạng thái ('pending', 'active', 'inactive', 'all')
 *   - department: Lọc theo phòng ban
 *   - search: Tìm kiếm theo tên, email, mã nhân viên
 *   - page: Trang hiện tại (bắt đầu từ 1)
 *   - pageSize: Số lượng mục trên mỗi trang
 */

header('Content-Type: application/json');

// Kiểm tra quyền admin
session_start();
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Bạn không có quyền truy cập tính năng này']);
    exit;
}

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

// Lấy các tham số
$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$department = isset($_GET['department']) ? $_GET['department'] : 'all';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$pageSize = isset($_GET['pageSize']) ? max(1, intval($_GET['pageSize'])) : 10;
$offset = ($page - 1) * $pageSize;

// Xây dựng câu truy vấn SQL
$sql = "
    SELECT 
        e.id,
        e.employee_id AS employeeId,
        e.first_name AS firstName,
        e.last_name AS lastName,
        e.email,
        e.phone,
        e.department,
        e.position,
        e.start_date AS startDate,
        IFNULL(e.registration_date, e.created_at) AS registrationDate,
        e.status,
        e.notes,
        e.username
    FROM 
        employees e
    WHERE 1=1
";

// Thêm điều kiện lọc
$params = [];
$types = '';

// Lọc theo trạng thái
if ($status !== 'all') {
    $sql .= " AND e.status = ?";
    $params[] = $status;
    $types .= 's';
}

// Lọc theo phòng ban
if ($department !== 'all') {
    $sql .= " AND e.department = ?";
    $params[] = $department;
    $types .= 's';
}

// Tìm kiếm
if (!empty($search)) {
    $search = "%$search%";
    $sql .= " AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)";
    $params[] = $search;
    $params[] = $search;
    $params[] = $search;
    $params[] = $search;
    $types .= 'ssss';
}

// Thêm phần phân trang
$countSql = "SELECT COUNT(*) as total FROM employees e WHERE 1=1";

// Thêm điều kiện cho câu truy vấn đếm
$countParams = [];
$countTypes = '';

if ($status !== 'all') {
    $countSql .= " AND e.status = ?";
    $countParams[] = $status;
    $countTypes .= 's';
}

if ($department !== 'all') {
    $countSql .= " AND e.department = ?";
    $countParams[] = $department;
    $countTypes .= 's';
}

if (!empty($search)) {
    $countSql .= " AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)";
    $countParams[] = $search;
    $countParams[] = $search;
    $countParams[] = $search;
    $countParams[] = $search;
    $countTypes .= 'ssss';
}

// Đếm tổng số bản ghi
$countStmt = $conn->prepare($countSql);
if (!empty($countParams)) {
    $countStmt->bind_param($countTypes, ...$countParams);
}
$countStmt->execute();
$totalResult = $countStmt->get_result()->fetch_assoc();
$total = $totalResult['total'];

// Thêm phân trang và sắp xếp
$sql .= " ORDER BY e.registration_date DESC LIMIT ?, ?";
$params[] = $offset;
$params[] = $pageSize;
$types .= 'ii';

// Thực thi truy vấn
$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

// Lấy kết quả
$accounts = [];
while ($row = $result->fetch_assoc()) {
    // Chuyển đổi dates sang định dạng chuẩn
    if (!empty($row['startDate'])) {
        $row['startDate'] = date('Y-m-d', strtotime($row['startDate']));
    }
    if (!empty($row['registrationDate'])) {
        $row['registrationDate'] = date('Y-m-d H:i:s', strtotime($row['registrationDate']));
    }
    
    $accounts[] = $row;
}

// Đếm số lượng tài khoản theo trạng thái
$statusCountsSql = "
    SELECT 
        status,
        COUNT(*) as count
    FROM 
        employees
    GROUP BY 
        status
";
$statusCountsResult = $conn->query($statusCountsSql);
$statusCounts = [
    'pending' => 0,
    'active' => 0,
    'inactive' => 0
];

while ($row = $statusCountsResult->fetch_assoc()) {
    $statusCounts[$row['status']] = (int)$row['count'];
}

$totalCounts = $statusCounts['pending'] + $statusCounts['active'] + $statusCounts['inactive'];

// Trả về kết quả
echo json_encode([
    'success' => true,
    'accounts' => $accounts,
    'pagination' => [
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => (int)$total,
        'totalPages' => ceil($total / $pageSize)
    ],
    'counts' => [
        'pending' => $statusCounts['pending'],
        'active' => $statusCounts['active'],
        'inactive' => $statusCounts['inactive'],
        'total' => $totalCounts
    ]
]);

// Đóng kết nối
$stmt->close();
$countStmt->close();
$conn->close();
?>
