#!/bin/bash
echo "Testing F1 Poolers API..."

echo "1. Health check:"
curl -s http://localhost:3080/api/health
echo

echo "2. Login test:"
curl -s -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | head -c 300
echo

echo "3. Drivers count:"
curl -s http://localhost:3080/api/drivers | python3 -c "import sys,json; print(len(json.load(sys.stdin)), 'drivers')" 2>/dev/null || echo "python3 not available"

echo "4. Teams count:"
curl -s http://localhost:3080/api/teams | wc -c
echo " bytes"

echo "5. Settings system:"
curl -s http://localhost:3080/api/settings/system | head -c 200
echo

echo "Done!"
