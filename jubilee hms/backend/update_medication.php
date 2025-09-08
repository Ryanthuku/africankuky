<?php
$allowed_origins = ['http://127.0.0.1:5500'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Rest of your PHP code below

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
  echo json_encode(['success' => false, 'error' => 'Medication ID missing']);
  exit;
}

$id = intval($data['id']);
$patient_id = $data['patient_id'] ?? '';
$medication_name = $data['medication_name'] ?? '';
$dosage = $data['dosage'] ?? '';
$frequency = $data['frequency'] ?? '';
$duration = $data['duration'] ?? '';

$stmt = $conn->prepare("UPDATE medications SET patient_id=?, medication_name=?, dosage=?, frequency=?, duration=? WHERE id=?");
$stmt->bind_param("sssssi", $patient_id, $medication_name, $dosage, $frequency, $duration, $id);

if ($stmt->execute()) {
  echo json_encode(['success' => true, 'message' => 'Medication updated']);
} else {
  echo json_encode(['success' => false, 'error' => 'Database error']);
}
$stmt->close();
$conn->close();