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

require_once "config.php";

// Optional: Set session cookie params for security (uncomment 'secure' if using HTTPS)
// session_set_cookie_params([
//     'httponly' => true,
//     'samesite' => 'Lax'
//     // 'secure' => true, // Only if using HTTPS
// ]);

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
            $stmt = $pdo->prepare("SELECT * FROM lab_records WHERE id = ?");
            $stmt->execute([$id]);
            $record = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($record) {
                echo json_encode($record);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Lab record not found"]);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM lab_records");
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($records);
        }
        break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (
                !isset($data['patient_id'], $data['test_type'], $data['test_date'], $data['result'], $data['doctor_id']) ||
                trim($data['patient_id']) === "" ||
                trim($data['test_type']) === "" ||
                trim($data['test_date']) === "" ||
                trim($data['doctor_id']) === ""
            ) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required fields"]);
                exit;
            }
            try {
                $stmt = $pdo->prepare("INSERT INTO lab_records (patient_id, test_type, test_date, result, doctor_id) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['patient_id'],
                    $data['test_type'],
                    $data['test_date'],
                    $data['result'],
                    $data['doctor_id']
                ]);
                echo json_encode(["message" => "Lab record added successfully."]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Database error: " . $e->getMessage()]);
            }
            break;
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing lab record id"]);
            exit;
        }
        $id = intval($data['id']);
        $fields = ['patient_id', 'test_type', 'test_date', 'result', 'doctor_id'];
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
        $sql = "UPDATE lab_records SET " . implode(", ", $setParts) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        echo json_encode(["message" => "Lab record updated"]);
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing lab record id"]);
            exit;
        }
        $id = intval($_GET['id']);
        $stmt = $pdo->prepare("DELETE FROM lab_records WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Lab record deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>