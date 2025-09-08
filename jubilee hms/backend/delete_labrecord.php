<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Allowed origins for CORS
$allowed_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// Database credentials — replace with your real credentials
$host = "localhost";
$db_name = "jubilee_hms"; // Make sure this matches your actual database name
$username = "root";       // Default XAMPP user
$password = "";    

// Get incoming JSON data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'Lab record ID required']);
    exit;
}

$id = intval($data['id']);
if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid lab record ID']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Correct table name here - use your actual DB table name for lab records!
    $stmt = $pdo->prepare('DELETE FROM lab_records WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to delete lab record']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    // You may want to return the error message during development:
    // echo json_encode(['success' => false, 'error' => $e->getMessage()]);

    // For production, return generic message:
    echo json_encode(['success' => false, 'error' => 'Database error']);
}