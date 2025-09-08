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
$id = intval($data['id']);
$patient_id = $data['patient_id'] ?? '';
$test_type = $data['test_type'] ?? '';
$test_date = $data['test_date'] ?? '';
$result = $data['result'] ?? '';

$stmt = $conn->prepare("UPDATE labrecord SET patient_id=?, test_type=?, test_date=?, result=? WHERE id=?");
$stmt->bind_param("ssssi", $patient_id, $test_type, $test_date, $result, $id);

if ($stmt->execute()) {
  echo json_encode(['success' => true, 'message' => 'Lab record updated']);
} else {
  echo json_encode(['success' => false, 'error' => 'Database error']);
}
$stmt->close();
$conn->close();