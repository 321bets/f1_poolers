<?php
// Standalone supporter preferences API - bypasses Docker container
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

try {

$db = new mysqli('localhost', 'f1pooler', 'f1pooler', 'f1pooler');
if ($db->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'DB: ' . $db->connect_error]));
}
$db->set_charset('utf8mb4');

// Run migration (idempotent) - check if columns exist first
$cols = $db->query("SHOW COLUMNS FROM users LIKE 'supported_driver_id'");
if ($cols->num_rows === 0) {
    $db->query("ALTER TABLE users ADD COLUMN supported_driver_id VARCHAR(100) DEFAULT NULL");
}
$cols = $db->query("SHOW COLUMNS FROM users LIKE 'supported_team_id'");
if ($cols->num_rows === 0) {
    $db->query("ALTER TABLE users ADD COLUMN supported_team_id VARCHAR(100) DEFAULT NULL");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $db->query("SELECT id, supported_driver_id, supported_team_id FROM users");
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $entry = ['userId' => $row['id']];
        if ($row['supported_driver_id']) $entry['supportedDriverId'] = $row['supported_driver_id'];
        if ($row['supported_team_id']) $entry['supportedTeamId'] = $row['supported_team_id'];
        $data[] = $entry;
    }
    echo json_encode($data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);

    if (!is_array($input) || empty($input['userId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input', 'raw_length' => strlen($raw)]);
        $db->close();
        exit;
    }

    $userId = $input['userId'];
    $driverId = isset($input['supportedDriverId']) && $input['supportedDriverId'] ? $input['supportedDriverId'] : null;
    $teamId = isset($input['supportedTeamId']) && $input['supportedTeamId'] ? $input['supportedTeamId'] : null;

    if ($driverId === null && $teamId === null) {
        $sql = "UPDATE users SET supported_driver_id = NULL, supported_team_id = NULL WHERE id = ?";
        $stmt = $db->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Prepare failed: ' . $db->error]);
            $db->close();
            exit;
        }
        $stmt->bind_param("s", $userId);
    } elseif ($driverId === null) {
        $stmt = $db->prepare("UPDATE users SET supported_driver_id = NULL, supported_team_id = ? WHERE id = ?");
        $stmt->bind_param("ss", $teamId, $userId);
    } elseif ($teamId === null) {
        $stmt = $db->prepare("UPDATE users SET supported_driver_id = ?, supported_team_id = NULL WHERE id = ?");
        $stmt->bind_param("ss", $driverId, $userId);
    } else {
        $stmt = $db->prepare("UPDATE users SET supported_driver_id = ?, supported_team_id = ? WHERE id = ?");
        $stmt->bind_param("sss", $driverId, $teamId, $userId);
    }

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['error' => 'Execute failed: ' . $stmt->error]);
        $stmt->close();
        $db->close();
        exit;
    }
    $stmt->close();

    echo json_encode(['success' => true, 'userId' => $userId, 'supportedDriverId' => $driverId, 'supportedTeamId' => $teamId]);
}

$db->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Exception: ' . $e->getMessage(), 'line' => $e->getLine()]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error: ' . $e->getMessage(), 'line' => $e->getLine()]);
}
