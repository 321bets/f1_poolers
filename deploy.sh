#!/bin/bash
# Deploy F1 Poolers to production
echo "=== F1 Poolers Deployment ==="

cd /opt/f1poolers-src

# Deploy (preserves existing data in database)
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
