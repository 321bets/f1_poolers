#!/bin/bash
# Deploy F1 Poolers to production
echo "=== F1 Poolers Deployment ==="

cd /opt/f1poolers-src

# Clean DB from old test data
echo "Cleaning test data..."
mysql -u f1pooler -pf1pooler f1pooler <<'EOF'
DELETE FROM result_winners;
DELETE FROM result_positions;
DELETE FROM results;
DELETE FROM bet_predictions;
DELETE FROM bet_team_predictions;
DELETE FROM bets;
DELETE FROM events;
DELETE FROM rounds;
DELETE FROM notifications;
DELETE FROM league_members WHERE user_id != 'admin';
DELETE FROM users WHERE id != 'admin';
EOF
echo "DB cleaned."

# Rebuild Docker
echo "Rebuilding Docker image..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo "Waiting 10s for container to start..."
sleep 10

# Verify
echo "Verifying API..."
curl -s http://localhost:3080/api/users | python3 -c "import sys,json; u=json.load(sys.stdin); print(f'Users: {len(u)}'); [print(f'  - {x[\"username\"]}') for x in u]"
curl -s http://localhost:3080/api/teams | python3 -c "import sys,json; print(f'Teams: {len(json.load(sys.stdin))}')"
curl -s http://localhost:3080/api/drivers | python3 -c "import sys,json; print(f'Drivers: {len(json.load(sys.stdin))}')"
echo "=== Deploy Complete ==="
