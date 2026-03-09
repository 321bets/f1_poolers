<?php
// Standalone supporter preferences API - bypasses Docker container
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = new mysqli('localhost', 'f1pooler', 'f1pooler', 'f1pooler');
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $db->connect_error]);
    exit;
}
$db->set_charset('utf8mb4');

// Run migration (idempotent)
$db->query("ALTER TABLE users ADD COLUMN supported_driver_id VARCHAR(100) DEFAULT NULL");
$db->query("ALTER TABLE users ADD COLUMN supported_team_id VARCHAR(100) DEFAULT NULL");

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
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? '';
    $driverId = isset($input['supportedDriverId']) ? $input['supportedDriverId'] : null;
    $teamId = isset($input['supportedTeamId']) ? $input['supportedTeamId'] : null;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'userId required']);
        exit;
    }

    $stmt = $db->prepare("UPDATE users SET supported_driver_id = ?, supported_team_id = ? WHERE id = ?");
    $stmt->bind_param("sss", $driverId, $teamId, $userId);
    $stmt->execute();

    echo json_encode(['success' => true, 'userId' => $userId, 'supportedDriverId' => $driverId, 'supportedTeamId' => $teamId]);
}

$db->close();
