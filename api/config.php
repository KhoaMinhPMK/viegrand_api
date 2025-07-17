<?php
/**
 * API Configuration file
 * Defines database connection and common functions for all API endpoints
 */

// Cấu hình chung cho API
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Thời gian khu vực Việt Nam
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Thông tin kết nối Database
$config = [
    'db' => [
        'host' => 'viegrand.site',
        'user' => 'viegrand', 
        'pass' => '12345678',
        'name' => 'viegrand',
        'port' => 3306
    ],
    'security' => [
        'password_hash_algo' => PASSWORD_BCRYPT,
        'password_hash_options' => ['cost' => 12],
        'jwt_secret' => 'viegrand_secret_key_change_this_in_production',
        'jwt_expire' => 86400 // 24 giờ
    ],
    'settings' => [
        'auto_activate_users' => false, // Tự động kích hoạt người dùng mới (true) hoặc yêu cầu admin phê duyệt (false)
        'default_user_role' => 'user' // Role mặc định cho người dùng mới: admin, manager, user
    ]
];

// Kết nối database
function getDBConnection() {
    global $config;
    $conn = new mysqli(
        $config['db']['host'],
        $config['db']['user'],
        $config['db']['pass'],
        $config['db']['name'],
        $config['db']['port']
    );
    
    if ($conn->connect_error) {
        sendErrorResponse('Kết nối database thất bại', 500);
        exit;
    }
    
    // Đặt charset utf8mb4 cho kết nối
    $conn->set_charset("utf8mb4");
    
    return $conn;
}

// Hàm trả về response thành công
function sendSuccessResponse($message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        'success' => true,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Hàm trả về response lỗi
function sendErrorResponse($message, $statusCode = 400, $errors = null) {
    http_response_code($statusCode);
    $response = [
        'success' => false,
        'message' => $message
    ];
    
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Tạo JWT token
function generateJWT($userId, $email, $role = 'user') {
    global $config;
    
    $issuedAt = time();
    $expire = $issuedAt + $config['security']['jwt_expire'];
    
    $payload = [
        'iss' => 'viegrand.site', // Issuer
        'aud' => 'viegrand_app',  // Audience
        'iat' => $issuedAt,       // Issued at
        'exp' => $expire,         // Expire time
        'data' => [
            'id' => $userId,
            'email' => $email,
            'role' => $role
        ]
    ];
    
    // Header token
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = base64_encode($header);
    
    // Payload
    $payload = json_encode($payload);
    $payload = base64_encode($payload);
    
    // Signature
    $signature = hash_hmac('sha256', "$header.$payload", $config['security']['jwt_secret'], true);
    $signature = base64_encode($signature);
    
    return "$header.$payload.$signature";
}

// Kiểm tra JWT token
function verifyJWT($token) {
    global $config;
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $validSignature = hash_hmac('sha256', "$header.$payload", $config['security']['jwt_secret'], true);
    $validSignature = base64_encode($validSignature);
    
    if ($signature !== $validSignature) {
        return false;
    }
    
    $payload = json_decode(base64_decode($payload), true);
    if ($payload['exp'] < time()) {
        return false; // Token đã hết hạn
    }
    
    return $payload['data'];
}

// Hàm lấy JWT từ header
function getAuthToken() {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        return $token;
    }
    return null;
}

// Hàm xác thực người dùng từ token
function authenticateUser($requiredRole = null) {
    $token = getAuthToken();
    if (!$token) {
        sendErrorResponse('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 401);
        exit;
    }
    
    $userData = verifyJWT($token);
    if (!$userData) {
        sendErrorResponse('Token không hợp lệ hoặc đã hết hạn', 401);
        exit;
    }
    
    // Kiểm tra quyền nếu có yêu cầu
    if ($requiredRole && $userData['role'] !== $requiredRole && $userData['role'] !== 'admin') {
        sendErrorResponse('Bạn không có quyền thực hiện hành động này', 403);
        exit;
    }
    
    return $userData;
}
?>
