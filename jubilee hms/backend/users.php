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
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once "config.php";
// Session check removed to allow public access to doctor list
$role = $_GET['role'] ?? '';
if ($role === 'doctor') {
    // Use 'id' as the doctor identifier, not 'user_id'
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE role = 'doctor'");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    http_response_code(400);
    echo json_encode(["error" => "Invalid role"]);
}