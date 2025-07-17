<?php
/**
 * API: Employees - Quản lý thông tin nhân viên
 * Methods: GET, POST, PUT, DELETE
 */

require_once 'config.php';

// Xác thực người dùng
$user = authenticateUser();

// Xử lý theo phương thức
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        handleGetRequest($user);
        break;
    case 'POST':
        handlePostRequest($user);
        break;
    case 'PUT':
        handlePutRequest($user);
        break;
    case 'DELETE':
        handleDeleteRequest($user);
        break;
    default:
        sendErrorResponse('Phương thức không được hỗ trợ', 405);
        break;
}

/**
 * Xử lý yêu cầu GET - Lấy danh sách hoặc chi tiết nhân viên
 */
function handleGetRequest($user) {
    global $conn;
    
    // Kết nối database
    $conn = getDBConnection();
    
    // Kiểm tra xem có yêu cầu lấy chi tiết không
    if (isset($_GET['id'])) {
        // Lấy chi tiết một nhân viên
        $employeeId = (int)$_GET['id'];
        
        $stmt = $conn->prepare('
            SELECT e.*, u.email, u.username, u.role, u.status 
            FROM employees e
            INNER JOIN users u ON e.user_id = u.id
            WHERE e.id = ?
        ');
        $stmt->bind_param('i', $employeeId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendErrorResponse('Không tìm thấy nhân viên', 404);
            exit;
        }
        
        $employee = $result->fetch_assoc();
        
        // Kiểm tra quyền - Người dùng thường chỉ có thể xem thông tin của chính họ
        if ($user['role'] !== 'admin' && $user['role'] !== 'manager' && $user['id'] !== $employee['user_id']) {
            sendErrorResponse('Bạn không có quyền xem thông tin này', 403);
            exit;
        }
        
        sendSuccessResponse('Lấy thông tin nhân viên thành công', $employee);
    } else {
        // Lấy danh sách nhân viên (chỉ admin và manager mới được phép)
        if ($user['role'] !== 'admin' && $user['role'] !== 'manager') {
            sendErrorResponse('Bạn không có quyền xem danh sách nhân viên', 403);
            exit;
        }
        
        // Xử lý phân trang
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;
        
        // Xây dựng câu lệnh SQL
        $sql = '
            SELECT e.*, u.email, u.username, u.role, u.status 
            FROM employees e
            INNER JOIN users u ON e.user_id = u.id
            WHERE 1=1
        ';
        
        // Thêm các điều kiện lọc
        $params = [];
        $types = '';
        
        if (isset($_GET['department']) && !empty($_GET['department'])) {
            $sql .= ' AND e.department = ?';
            $params[] = $_GET['department'];
            $types .= 's';
        }
        
        if (isset($_GET['position']) && !empty($_GET['position'])) {
            $sql .= ' AND e.position = ?';
            $params[] = $_GET['position'];
            $types .= 's';
        }
        
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $sql .= ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_id LIKE ? OR u.email LIKE ?)';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
            $types .= 'ssss';
        }
        
        // Thêm phân trang
        $sql .= ' ORDER BY e.last_name, e.first_name LIMIT ?, ?';
        $params[] = $offset;
        $params[] = $limit;
        $types .= 'ii';
        
        // Thực thi truy vấn
        $stmt = $conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
        
        // Đếm tổng số nhân viên (không có phân trang)
        $countSql = '
            SELECT COUNT(*) AS total 
            FROM employees e
            INNER JOIN users u ON e.user_id = u.id
            WHERE 1=1
        ';
        
        // Thêm các điều kiện lọc cho câu lệnh đếm
        $countParams = [];
        $countTypes = '';
        
        if (isset($_GET['department']) && !empty($_GET['department'])) {
            $countSql .= ' AND e.department = ?';
            $countParams[] = $_GET['department'];
            $countTypes .= 's';
        }
        
        if (isset($_GET['position']) && !empty($_GET['position'])) {
            $countSql .= ' AND e.position = ?';
            $countParams[] = $_GET['position'];
            $countTypes .= 's';
        }
        
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $countSql .= ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_id LIKE ? OR u.email LIKE ?)';
            $countParams[] = $search;
            $countParams[] = $search;
            $countParams[] = $search;
            $countParams[] = $search;
            $countTypes .= 'ssss';
        }
        
        $countStmt = $conn->prepare($countSql);
        if (!empty($countParams)) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }
        $countStmt->execute();
        $totalResult = $countStmt->get_result()->fetch_assoc();
        $total = $totalResult['total'];
        
        $pagination = [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ];
        
        sendSuccessResponse('Lấy danh sách nhân viên thành công', [
            'employees' => $employees,
            'pagination' => $pagination
        ]);
    }
    
    $conn->close();
}

/**
 * Xử lý yêu cầu POST - Thêm nhân viên mới
 */
function handlePostRequest($user) {
    // Chỉ admin và manager mới được thêm nhân viên
    if ($user['role'] !== 'admin' && $user['role'] !== 'manager') {
        sendErrorResponse('Bạn không có quyền thêm nhân viên mới', 403);
        exit;
    }
    
    // Lấy dữ liệu từ request
    $firstName = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
    $lastName = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $employeeId = isset($_POST['employee_id']) ? trim($_POST['employee_id']) : '';
    $department = isset($_POST['department']) ? trim($_POST['department']) : '';
    $position = isset($_POST['position']) ? trim($_POST['position']) : '';
    $startDate = isset($_POST['start_date']) ? trim($_POST['start_date']) : '';
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $role = isset($_POST['role']) && in_array($_POST['role'], ['admin', 'manager', 'user']) ? $_POST['role'] : 'user';
    
    // Nếu không phải admin, không cho phép tạo admin khác
    if ($user['role'] !== 'admin' && $role === 'admin') {
        $role = 'user'; // Hạ xuống quyền user
    }
    
    // Kiểm tra dữ liệu
    $errors = [];
    if (empty($firstName)) $errors[] = 'Thiếu họ';
    if (empty($lastName)) $errors[] = 'Thiếu tên';
    if (empty($email)) $errors[] = 'Thiếu email';
    if (empty($phone)) $errors[] = 'Thiếu số điện thoại';
    if (empty($employeeId)) $errors[] = 'Thiếu mã nhân viên';
    if (empty($department)) $errors[] = 'Thiếu phòng ban';
    if (empty($position)) $errors[] = 'Thiếu chức vụ';
    if (empty($startDate)) $errors[] = 'Thiếu ngày bắt đầu';
    if (empty($username)) $errors[] = 'Thiếu tên đăng nhập';
    if (empty($password)) $errors[] = 'Thiếu mật khẩu';
    
    if (!empty($errors)) {
        sendErrorResponse('Dữ liệu không hợp lệ', 400, $errors);
        exit;
    }
    
    // Kiểm tra định dạng email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendErrorResponse('Định dạng email không hợp lệ', 400);
        exit;
    }
    
    // Kết nối database
    $conn = getDBConnection();
    
    // Kiểm tra email và username đã tồn tại chưa
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1');
    $stmt->bind_param('ss', $email, $username);
    $stmt->execute();
    $existingUser = $stmt->get_result();
    
    if ($existingUser->num_rows > 0) {
        sendErrorResponse('Email hoặc tên đăng nhập đã tồn tại', 400);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Kiểm tra mã nhân viên đã tồn tại chưa
    $stmt = $conn->prepare('SELECT id FROM employees WHERE employee_id = ? LIMIT 1');
    $stmt->bind_param('s', $employeeId);
    $stmt->execute();
    $existingEmployee = $stmt->get_result();
    
    if ($existingEmployee->num_rows > 0) {
        sendErrorResponse('Mã nhân viên đã tồn tại', 400);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // Mã hóa mật khẩu
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    try {
        // Thêm người dùng mới
        $stmt = $conn->prepare('
            INSERT INTO users (username, email, password, role, status) 
            VALUES (?, ?, ?, ?, "active")
        ');
        $stmt->bind_param('ssss', $username, $email, $hashedPassword, $role);
        $stmt->execute();
        $userId = $stmt->insert_id;
        $stmt->close();
        
        // Thêm thông tin nhân viên
        $stmt = $conn->prepare('
            INSERT INTO employees (user_id, employee_id, first_name, last_name, phone, department, position, start_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->bind_param('isssssss', $userId, $employeeId, $firstName, $lastName, $phone, $department, $position, $startDate);
        $stmt->execute();
        $employeeId = $stmt->insert_id;
        $stmt->close();
        
        // Log hoạt động
        $logStmt = $conn->prepare('
            INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
            VALUES (?, "create_employee", ?, ?, ?)
        ');
        $description = "Thêm nhân viên mới: $firstName $lastName";
        $ipAddress = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
        $logStmt->execute();
        $logStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        sendSuccessResponse('Thêm nhân viên mới thành công', ['employee_id' => $employeeId]);
    } catch (Exception $e) {
        // Rollback nếu có lỗi
        $conn->rollback();
        sendErrorResponse('Lỗi khi thêm nhân viên: ' . $e->getMessage(), 500);
    }
    
    $conn->close();
}

/**
 * Xử lý yêu cầu PUT - Cập nhật thông tin nhân viên
 */
function handlePutRequest($user) {
    // Kiểm tra ID nhân viên
    if (!isset($_GET['id'])) {
        sendErrorResponse('Thiếu ID nhân viên', 400);
        exit;
    }
    
    $employeeId = (int)$_GET['id'];
    
    // Kết nối database
    $conn = getDBConnection();
    
    // Lấy thông tin nhân viên hiện tại
    $stmt = $conn->prepare('
        SELECT e.*, u.id as user_id, u.role 
        FROM employees e
        INNER JOIN users u ON e.user_id = u.id
        WHERE e.id = ?
    ');
    $stmt->bind_param('i', $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendErrorResponse('Không tìm thấy nhân viên', 404);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    $employee = $result->fetch_assoc();
    $stmt->close();
    
    // Kiểm tra quyền - Người dùng thường chỉ có thể cập nhật thông tin của chính họ
    if ($user['role'] !== 'admin' && $user['role'] !== 'manager' && $user['id'] !== $employee['user_id']) {
        sendErrorResponse('Bạn không có quyền cập nhật thông tin này', 403);
        $conn->close();
        exit;
    }
    
    // Xử lý dữ liệu PUT từ php://input
    parse_str(file_get_contents("php://input"), $_PUT);
    
    // Lấy dữ liệu từ request
    $firstName = isset($_PUT['first_name']) ? trim($_PUT['first_name']) : $employee['first_name'];
    $lastName = isset($_PUT['last_name']) ? trim($_PUT['last_name']) : $employee['last_name'];
    $phone = isset($_PUT['phone']) ? trim($_PUT['phone']) : $employee['phone'];
    $department = isset($_PUT['department']) ? trim($_PUT['department']) : $employee['department'];
    $position = isset($_PUT['position']) ? trim($_PUT['position']) : $employee['position'];
    $startDate = isset($_PUT['start_date']) ? trim($_PUT['start_date']) : $employee['start_date'];
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    try {
        // Cập nhật thông tin nhân viên
        $stmt = $conn->prepare('
            UPDATE employees 
            SET first_name = ?, last_name = ?, phone = ?, department = ?, position = ?, start_date = ? 
            WHERE id = ?
        ');
        $stmt->bind_param('ssssssi', $firstName, $lastName, $phone, $department, $position, $startDate, $employeeId);
        $stmt->execute();
        $stmt->close();
        
        // Cập nhật quyền người dùng (chỉ admin mới làm được)
        if ($user['role'] === 'admin' && isset($_PUT['role']) && in_array($_PUT['role'], ['admin', 'manager', 'user'])) {
            $newRole = $_PUT['role'];
            $stmt = $conn->prepare('UPDATE users SET role = ? WHERE id = ?');
            $stmt->bind_param('si', $newRole, $employee['user_id']);
            $stmt->execute();
            $stmt->close();
        }
        
        // Log hoạt động
        $logStmt = $conn->prepare('
            INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
            VALUES (?, "update_employee", ?, ?, ?)
        ');
        $description = "Cập nhật thông tin nhân viên: $firstName $lastName (ID: $employeeId)";
        $ipAddress = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
        $logStmt->execute();
        $logStmt->close();
        
        // Commit transaction
        $conn->commit();
        
        sendSuccessResponse('Cập nhật thông tin nhân viên thành công');
    } catch (Exception $e) {
        // Rollback nếu có lỗi
        $conn->rollback();
        sendErrorResponse('Lỗi khi cập nhật nhân viên: ' . $e->getMessage(), 500);
    }
    
    $conn->close();
}

/**
 * Xử lý yêu cầu DELETE - Xóa nhân viên
 */
function handleDeleteRequest($user) {
    // Chỉ admin mới được xóa nhân viên
    if ($user['role'] !== 'admin') {
        sendErrorResponse('Bạn không có quyền xóa nhân viên', 403);
        exit;
    }
    
    // Kiểm tra ID nhân viên
    if (!isset($_GET['id'])) {
        sendErrorResponse('Thiếu ID nhân viên', 400);
        exit;
    }
    
    $employeeId = (int)$_GET['id'];
    
    // Kết nối database
    $conn = getDBConnection();
    
    // Lấy thông tin nhân viên và user_id
    $stmt = $conn->prepare('
        SELECT e.*, u.id as user_id, u.role
        FROM employees e
        INNER JOIN users u ON e.user_id = u.id
        WHERE e.id = ?
    ');
    $stmt->bind_param('i', $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendErrorResponse('Không tìm thấy nhân viên', 404);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    $employee = $result->fetch_assoc();
    $stmt->close();
    
    // Không cho phép xóa tài khoản admin cuối cùng
    if ($employee['role'] === 'admin') {
        // Đếm số lượng admin
        $countAdmins = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")->fetch_assoc()['count'];
        
        if ($countAdmins <= 1) {
            sendErrorResponse('Không thể xóa admin cuối cùng trong hệ thống', 400);
            $conn->close();
            exit;
        }
    }
    
    // Bắt đầu transaction
    $conn->begin_transaction();
    
    try {
        // Log hoạt động trước khi xóa
        $logStmt = $conn->prepare('
            INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
            VALUES (?, "delete_employee", ?, ?, ?)
        ');
        $description = "Xóa nhân viên: {$employee['first_name']} {$employee['last_name']} (ID: $employeeId)";
        $ipAddress = $_SERVER['REMOTE_ADDR'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $logStmt->bind_param('isss', $user['id'], $description, $ipAddress, $userAgent);
        $logStmt->execute();
        $logStmt->close();
        
        // Xóa người dùng (sẽ cascade xóa nhân viên do ràng buộc khóa ngoại)
        $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
        $stmt->bind_param('i', $employee['user_id']);
        $stmt->execute();
        $stmt->close();
        
        // Commit transaction
        $conn->commit();
        
        sendSuccessResponse('Xóa nhân viên thành công');
    } catch (Exception $e) {
        // Rollback nếu có lỗi
        $conn->rollback();
        sendErrorResponse('Lỗi khi xóa nhân viên: ' . $e->getMessage(), 500);
    }
    
    $conn->close();
}
?>
