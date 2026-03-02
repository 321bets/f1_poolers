#!/bin/bash
mysql -u f1pooler -pf1pooler f1pooler <<'EOF'
DELETE FROM result_winners;
DELETE FROM result_positions;
DELETE FROM results;
DELETE FROM bet_predictions;
DELETE FROM bet_team_predictions;
DELETE FROM bets;
DELETE FROM events;
DELETE FROM rounds;
DELETE FROM league_members WHERE user_id != 'admin';
DELETE FROM notifications;
DELETE FROM users WHERE id != 'admin';
EOF
echo "DB cleaned. Remaining:"
mysql -u f1pooler -pf1pooler f1pooler -N -e "SELECT COUNT(*) as users FROM users; SELECT COUNT(*) as rounds FROM rounds; SELECT COUNT(*) as events FROM events;"
