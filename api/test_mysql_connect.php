<?php
$host = 'viegrand.site';
$user = 'viegrand';
$pass = '12345678';
$db   = 'viegrand';
$port = 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die('Kết nối thất bại: ' . $conn->connect_error);
}
echo 'Kết nối thành công!';
$conn->close();
?> 