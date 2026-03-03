#!/bin/bash
echo "=== ROUND CREATION TEST ==="

echo "Before:"
mysql -uf1pooler -pf1pooler f1pooler -e "SELECT id,number,name FROM rounds" 2>/dev/null

echo ""
echo "Creating round..."
RESP=$(curl -s -o /tmp/roundresp.txt -w "%{http_code}" -X POST http://localhost:3080/api/rounds -H "Content-Type: application/json" -d '{"number":88,"name":"Test GP 88","location":"TestCity","circuit":"Test Circuit"}')
echo "HTTP Code: $RESP"
echo "Response: $(cat /tmp/roundresp.txt)"

echo ""
echo "After:"
mysql -uf1pooler -pf1pooler f1pooler -e "SELECT id,number,name FROM rounds" 2>/dev/null

echo ""
echo "Docker logs (last 10):"
docker logs f1poolers 2>&1 | tail -10

echo "=== DONE ==="
