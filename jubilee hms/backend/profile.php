<?php
session_start();

$allowed_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ...rest of your code...
require_once "config.php";

if (!isset($_SESSION['user_id'])) {
http_response_code(401);
echo json_encode(["error" => "Unauthorized"]);
exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
case 'GET':
$stmt = $pdo->prepare("SELECT id, username, role, name, email FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user) {
echo json_encode($user);
} else {
http_response_code(404);
echo json_encode(["error" => "User not found"]);
}
break;

case 'PUT':
$data = json_decode(file_get_contents("php://input"), true);
$fields = [];
$values = [];

if (isset($data['name'])) {
$fields[] = "name = ?";
$values[] = $data['name'];
}
if (isset($data['email'])) {
$fields[] = "email = ?";
$values[] = $data['email'];
}
if (isset($data['old_password']) && isset($data['new_password'])) {
// Verify old password
$stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user || !password_verify($data['old_password'], $user['password'])) {
http_response_code(400);
echo json_encode(["error" => "Old password is incorrect"]);
exit;
}
$new_hashed = password_hash($data['new_password'], PASSWORD_DEFAULT);
$fields[] = "password = ?";
$values[] = $new_hashed;
}

if (empty($fields)) {
http_response_code(400);
echo json_encode(["error" => "No fields to update"]);
exit;
}

$values[] = $user_id;
$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($values);

echo json_encode(["message" => "Profile updated"]);
break;

default:
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
break;
}
?>