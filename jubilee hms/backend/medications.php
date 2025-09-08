<?php
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
$stmt = $pdo->prepare("SELECT * FROM medications WHERE id = ?");
$stmt->execute([$id]);
$medication = $stmt->fetch(PDO::FETCH_ASSOC);
if ($medication) {
echo json_encode($medication);
} else {
http_response_code(404);
echo json_encode(["error" => "Medication not found"]);
}
} else {
$stmt = $pdo->query("SELECT * FROM medications");
$medications = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($medications);
}
break;

case 'POST':
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['drug_name'], $data['stock'], $data['expiry'], $data['manufacturer'])) {
http_response_code(400);
echo json_encode(["error" => "Missing required fields"]);
exit;
}
$stmt = $pdo->prepare("INSERT INTO medications (drug_name, stock, expiry, manufacturer) VALUES (?, ?, ?, ?)");
$stmt->execute([
$data['drug_name'],
$data['stock'],
$data['expiry'],
$data['manufacturer']
]);
echo json_encode(["message" => "Medication added", "id" => $pdo->lastInsertId()]);
break;

case 'PUT':
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['id'])) {
http_response_code(400);
echo json_encode(["error" => "Missing medication id"]);
exit;
}
$id = intval($data['id']);
$fields = ['drug_name', 'stock', 'expiry', 'manufacturer'];
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
$sql = "UPDATE medications SET " . implode(", ", $setParts) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($values);
echo json_encode(["message" => "Medication updated"]);
break;

case 'DELETE':
if (!isset($_GET['id'])) {
http_response_code(400);
echo json_encode(["error" => "Missing medication id"]);
exit;
}
$id = intval($_GET['id']);
$stmt = $pdo->prepare("DELETE FROM medications WHERE id = ?");
$stmt->execute([$id]);
echo json_encode(["message" => "Medication deleted"]);
break;

default:
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
break;
}
?>