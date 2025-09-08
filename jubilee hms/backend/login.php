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
} else {
    // Optionally, send a helpful error for disallowed origins:
    // http_response_code(403);
    // echo json_encode(["error" => "Origin not allowed"]);
    // exit;
}
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ...rest of your code...

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
http_response_code(400);
echo json_encode(["error" => "Missing required fields"]);
exit;
}

$username = $data['username'];
$password = $data['password'];
$role = $data['role'];

try {
$stmt = $pdo->prepare("SELECT id, username, password, role, name FROM users WHERE username = ? AND role = ?");
$stmt->execute([$username, $role]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!isset($_SESSION['login_attempts'])) {
$_SESSION['login_attempts'] = 0;
}

if ($_SESSION['login_attempts'] >= 10) {
http_response_code(429);
echo json_encode(["error" => "Too many login attempts. Please try again later."]);
exit;
}

if ($user && password_verify($password, $user['password'])) {
// Authentication successful
session_regenerate_id(true); // Prevent session fixation
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];
$_SESSION['name'] = $user['name'];
$_SESSION['login_attempts'] = 0; // Reset on successful login

echo json_encode([
"message" => "Login successful",
"user" => [
"id" => $user['id'],
"username" => $user['username'],
"role" => $user['role'],
"name" => $user['name']
]
]);
} else {
$_SESSION['login_attempts']++;
http_response_code(401);
echo json_encode(["error" => "Invalid username, password, or role"]);
}
} catch (PDOException $e) {
http_response_code(500);
echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}