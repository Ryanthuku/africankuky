<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

require_once "config.php";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        !isset($data['first_name'], $data['dob'], $data['address'], $data['mobile'], $data['ailment'], $data['assigned_doctor_id'])
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO patients (first_name, dob, address, mobile, ailment, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['first_name'],
        $data['dob'],
        $data['address'],
        $data['mobile'],
        $data['ailment'],
        $data['assigned_doctor_id']
    ]);
    if ($success) {
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to register patient"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>