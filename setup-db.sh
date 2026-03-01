#!/bin/bash
mysql -u root <<'EOF'
CREATE DATABASE IF NOT EXISTS f1pooler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON f1pooler.* TO 'f1pooler'@'localhost' IDENTIFIED BY 'f1pooler';
GRANT ALL PRIVILEGES ON f1pooler.* TO 'f1pooler'@'%' IDENTIFIED BY 'f1pooler';
FLUSH PRIVILEGES;
EOF
echo "Database and user created"

# Import schema
mysql -u f1pooler -pf1pooler f1pooler < /var/www/f1poolers/schema.sql 2>&1
echo "Schema imported"

# Bind MySQL to all interfaces so Docker can reach it
if ! grep -q "bind-address.*0.0.0.0" /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null; then
  sed -i 's/bind-address.*=.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null || true
  sed -i 's/bind-address.*=.*/bind-address = 0.0.0.0/' /etc/mysql/my.cnf 2>/dev/null || true
  systemctl restart mariadb
  echo "MariaDB restarted with bind 0.0.0.0"
fi
