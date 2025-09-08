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
$stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ?");
$stmt->execute([$id]);
$appointment = $stmt->fetch(PDO::FETCH_ASSOC);
if ($appointment) {
echo json_encode($appointment);
} else {
http_response_code(404);
echo json_encode(["error" => "Appointment not found"]);
}
} else {
$stmt = $pdo->query("SELECT * FROM appointments");
$appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($appointments);
}
break;

case 'POST':
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['patient_id'], $data['doctor_id'], $data['appointment_date'])) {
http_response_code(400);
echo json_encode(["error" => "Missing required fields"]);
exit;
}
$status = isset($data['status']) ? $data['status'] : 'scheduled';
$stmt = $pdo->prepare("INSERT INTO appointments (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)");
$stmt->execute([
$data['patient_id'],
$data['doctor_id'],
$data['appointment_date'],
$status
]);
echo json_encode(["message" => "Appointment added", "id" => $pdo->lastInsertId()]);
break;

case 'PUT':
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['id'])) {
http_response_code(400);
echo json_encode(["error" => "Missing appointment id"]);
exit;
}
$id = intval($data['id']);
$fields = ['patient_id', 'doctor_id', 'appointment_date', 'status'];
$setParts = [];
$values = [];
foreach ($fields as $field) {
if (isset($data[$field])) {
$setParts[] = "$field = ?";
$values[] = $data[$field];
}
}
if (empty($setParts)) {
http_response_code(400);
echo json_encode(["error" => "No fields to update"]);
exit;
}
$values[] = $id;
$sql = "UPDATE appointments SET " . implode(", ", $setParts) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($values);
echo json_encode(["message" => "Appointment updated"]);
break;

case 'DELETE':
if (!isset($_GET['id'])) {
http_response_code(400);
echo json_encode(["error" => "Missing appointment id"]);
exit;
}
$id = intval($_GET['id']);
$stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
$stmt->execute([$id]);
echo json_encode(["message" => "Appointment deleted"]);
break;

default:
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
break;
}
?>