<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];

// Use 'id' as the primary key if that's your table structure
$primaryKey = 'id'; // Change to 'patient_id' if that's your table's PK

switch ($method) {
    case 'GET':
        // Only allow GET if authenticated
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        // Get all patients or a single patient by id
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM patients WHERE $primaryKey = ?");
            $stmt->execute([$id]);
            $patient = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($patient) {
                echo json_encode($patient);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Patient not found"]);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM patients");
            $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($patients);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        // Allow unauthenticated POST for public booking (minimal fields)
        if (!isset($_SESSION['user_id'])) {
            if (!isset($data['first_name'], $data['mobile'], $data['assigned_doctor_id'], $data['ailment'], $data['appointment_date'])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required fields"]);
                exit;
            }
            $first_name = filter_var($data['first_name'], FILTER_SANITIZE_STRING);
            $mobile = filter_var($data['mobile'], FILTER_SANITIZE_STRING);
            $assigned_doctor_id = $data['assigned_doctor_id'] !== '' ? intval($data['assigned_doctor_id']) : null;
            $ailment = filter_var($data['ailment'], FILTER_SANITIZE_STRING);
            $appointment_date = filter_var($data['appointment_date'], FILTER_SANITIZE_STRING);
            $status = isset($data['status']) ? filter_var($data['status'], FILTER_SANITIZE_STRING) : 'Scheduled';

            try {
                $stmt = $pdo->prepare("INSERT INTO patients (first_name, mobile, ailment, assigned_doctor_id, appointment_date, status) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $first_name,
                    $mobile,
                    $ailment,
                    $assigned_doctor_id,
                    $appointment_date,
                    $status
                ]);
                echo json_encode(["success" => true, "message" => "Patient added", "id" => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Database error: " . $e->getMessage()]);
            }
            exit;
        }

        // Authenticated POST (admin, etc.)
        if (!isset($data['first_name'], $data['dob'], $data['address'], $data['mobile'], $data['ailment'], $data['assigned_doctor_id'], $data['appointment_date'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        $first_name = filter_var($data['first_name'], FILTER_SANITIZE_STRING);
        $dob = filter_var($data['dob'], FILTER_SANITIZE_STRING);
        $address = filter_var($data['address'], FILTER_SANITIZE_STRING);
        $mobile = filter_var($data['mobile'], FILTER_SANITIZE_STRING);
        $ailment = filter_var($data['ailment'], FILTER_SANITIZE_STRING);
        $assigned_doctor_id = $data['assigned_doctor_id'] !== '' ? intval($data['assigned_doctor_id']) : null;
        $appointment_date = filter_var($data['appointment_date'], FILTER_SANITIZE_STRING);
        $status = isset($data['status']) ? filter_var($data['status'], FILTER_SANITIZE_STRING) : 'Scheduled';

        try {
            $stmt = $pdo->prepare("INSERT INTO patients (first_name, dob, address, mobile, ailment, assigned_doctor_id, appointment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $first_name,
                $dob,
                $address,
                $mobile,
                $ailment,
                $assigned_doctor_id,
                $appointment_date,
                $status
            ]);
            echo json_encode(["success" => true, "message" => "Patient added", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Only allow PUT if authenticated
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        // Update patient
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data[$primaryKey])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing patient id"]);
            exit;
        }
        $id = intval($data[$primaryKey]);
        $fields = ['first_name', 'dob', 'address', 'mobile', 'ailment', 'assigned_doctor_id', 'appointment_date', 'status', 'notes'];
        $setParts = [];
        $values = [];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $value = filter_var($data[$field], FILTER_SANITIZE_STRING);
                $setParts[] = "$field = ?";
                $values[] = $value;
            }
        }
        if (empty($setParts)) {
            http_response_code(400);
            echo json_encode(["error" => "No fields to update"]);
            exit;
        }
        $values[] = $id;
        $sql = "UPDATE patients SET " . implode(", ", $setParts) . " WHERE $primaryKey = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        echo json_encode(["message" => "Patient updated"]);
        break;

    case 'DELETE':
        // Only allow DELETE if authenticated
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        // Delete patient
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing patient id"]);
            exit;
        }
        $id = intval($_GET['id']);
        $stmt = $pdo->prepare("DELETE FROM patients WHERE $primaryKey = ?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Patient deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>