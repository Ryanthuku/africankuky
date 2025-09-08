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

// Database credentials
$host = "localhost";
$db_name = "jubilee_hms";
$username = "root";
$password = "";

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);
if (
    !isset($data['id']) ||
    !isset($data['first_name']) ||
    !isset($data['dob']) ||
    !isset($data['address']) ||
    !isset($data['mobile']) ||
    !isset($data['ailment']) ||
    !isset($data['assigned_doctor_id'])
) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$id = intval($data['id']);
if ($id <= 0) {
    echo json_encode(['success'=> false, 'error' => 'Invalid patient ID']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepare and execute update
    $stmt = $pdo->prepare('UPDATE patients SET first_name = :first_name, dob = :dob, address = :address, mobile = :mobile, ailment = :ailment, assigned_doctor_id = :assigned_doctor_id WHERE id = :id');
    $stmt->bindParam(':first_name', $data['first_name']);
    $stmt->bindParam(':dob', $data['dob']);
    $stmt->bindParam(':address', $data['address']);
    $stmt->bindParam(':mobile', $data['mobile']);
    $stmt->bindParam(':ailment', $data['ailment']);
    $stmt->bindParam(':assigned_doctor_id', $data['assigned_doctor_id'], PDO::PARAM_INT);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No changes made or patient not found']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update patient']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
}