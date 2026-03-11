<?php
// Standalone pending rollovers API - bypasses Docker container
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Ensure table exists
$db->query("CREATE TABLE IF NOT EXISTS pending_rollovers (
    id VARCHAR(100) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    amount INT NOT NULL DEFAULT 0,
    source_event_id VARCHAR(100) NOT NULL,
    source_round_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get pending rollovers
    $result = $db->query("SELECT pr.*, r.name as source_round_name 
                          FROM pending_rollovers pr 
                          LEFT JOIN rounds r ON r.number = pr.source_round_number 
                          ORDER BY pr.created_at DESC");
    $pending = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $pending[] = [
                'id' => $row['id'],
                'eventType' => $row['event_type'],
                'amount' => (int)$row['amount'],
                'sourceEventId' => $row['source_event_id'],
                'sourceRoundNumber' => (int)$row['source_round_number'],
                'sourceRoundName' => $row['source_round_name'] ?? 'Round ' . $row['source_round_number'],
                'createdAt' => $row['created_at']
            ];
        }
    }

    // Also get active event pools (jackpots in progress)
    $evResult = $db->query("SELECT e.id, e.type, e.pool_prize, e.status, e.round_id, r.name as round_name, r.number as round_number
                            FROM events e 
                            LEFT JOIN rounds r ON e.round_id = r.id 
                            WHERE e.status != 'Finished' AND e.pool_prize > 0
                            ORDER BY r.number, e.type");
    $activePools = [];
    if ($evResult) {
        while ($row = $evResult->fetch_assoc()) {
            $activePools[] = [
                'eventId' => $row['id'],
                'eventType' => $row['type'],
                'poolPrize' => (int)$row['pool_prize'],
                'status' => $row['status'],
                'roundId' => $row['round_id'],
                'roundName' => $row['round_name'] ?? 'Unknown',
                'roundNumber' => (int)$row['round_number']
            ];
        }
    }

    // Get rollover history (finished events with no jackpot winner)
    $histResult = $db->query("SELECT e.id, e.type, r.name as round_name, r.number as round_number, 
                                     res.total_prize_pool,
                                     (SELECT COUNT(*) FROM result_winners rw WHERE rw.event_id = e.id AND rw.prize_amount > 0) as jackpot_winners
                              FROM events e 
                              JOIN results res ON res.event_id = e.id
                              LEFT JOIN rounds r ON e.round_id = r.id 
                              WHERE e.status = 'Finished' AND res.total_prize_pool > 0
                              ORDER BY r.number DESC, e.type
                              LIMIT 50");
    $history = [];
    if ($histResult) {
        while ($row = $histResult->fetch_assoc()) {
            $history[] = [
                'eventId' => $row['id'],
                'eventType' => $row['type'],
                'roundName' => $row['round_name'] ?? 'Unknown',
                'roundNumber' => (int)$row['round_number'],
                'totalPrizePool' => (int)$row['total_prize_pool'],
                'jackpotWon' => (int)$row['jackpot_winners'] > 0
            ];
        }
    }

    echo json_encode([
        'pendingRollovers' => $pending,
        'activePools' => $activePools,
        'rolloverHistory' => $history
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$db->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
