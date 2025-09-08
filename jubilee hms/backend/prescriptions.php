<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
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

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
case 'GET':
if (isset($_GET['id'])) {
$id = intval($_GET['id']);
$stmt = $pdo->prepare("SELECT * FROM prescriptions WHERE id = ?");
$stmt->execute([$id]);
$prescription = $stmt->fetch(PDO::FETCH_ASSOC);
if ($prescription) {
echo json_encode($prescription);
} else {
http_response_code(404);
echo json_encode(["error" => "Prescription not found"]);
}
} else {
$stmt = $pdo->query("SELECT * FROM prescriptions");
$prescriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($prescriptions);
}
break;

case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);
    if (
        !isset($data['patient_id'], $data['medication'], $data['doctor_id']) ||
        trim($data['patient_id']) === "" ||
        trim($data['medication']) === "" ||
        trim($data['doctor_id']) === ""
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO prescriptions (patient_id, medication, doctor_id) VALUES (?, ?, ?)");
    $stmt->execute([$data['patient_id'], $data['medication'], $data['doctor_id']]);
    echo json_encode(["message" => "Prescription added successfully."]);
    break;

case 'DELETE':
if (!isset($_GET['id'])) {
http_response_code(400);
echo json_encode(["error" => "Missing prescription id"]);
exit;
}
$id = intval($_GET['id']);
$stmt = $pdo->prepare("DELETE FROM prescriptions WHERE id = ?");
$stmt->execute([$id]);
echo json_encode(["message" => "Prescription deleted"]);
break;

default:
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
break;
}
?>