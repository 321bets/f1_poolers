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

# Deploy frontend to adster.app webroot (served by Plesk/Apache)
echo "Deploying frontend to adster.app webroot..."
WEBROOT="/var/www/vhosts/adster.app/httpdocs"
CONTAINER="f1poolers"

# Clean old assets
rm -rf "${WEBROOT}/assets"

# Copy built frontend from Docker container to webroot
docker cp "${CONTAINER}:/var/www/html/index.html" "${WEBROOT}/index.html"
docker cp "${CONTAINER}:/var/www/html/assets" "${WEBROOT}/assets"

# Set correct ownership for Plesk
PLESK_USER=$(stat -c '%U' "${WEBROOT}")
chown -R "${PLESK_USER}:psacln" "${WEBROOT}/index.html" "${WEBROOT}/assets"

echo "Frontend deployed to ${WEBROOT}"

# Create .htaccess for SPA fallback
cat > "${WEBROOT}/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF
chown "${PLESK_USER}:psacln" "${WEBROOT}/.htaccess"

# Verify
echo "Verifying API..."
curl -s http://localhost:3080/api/users | python3 -c "import sys,json; u=json.load(sys.stdin); print(f'Users: {len(u)}'); [print(f'  - {x[\"username\"]}') for x in u]"
curl -s http://localhost:3080/api/teams | python3 -c "import sys,json; print(f'Teams: {len(json.load(sys.stdin))}')"
curl -s http://localhost:3080/api/drivers | python3 -c "import sys,json; print(f'Drivers: {len(json.load(sys.stdin))}')"
curl -s http://localhost:3080/api/rounds | python3 -c "import sys,json; print(f'Rounds: {len(json.load(sys.stdin))}')"
echo "=== Deploy Complete ==="
