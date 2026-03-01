#!/bin/bash
mysql -u f1pooler -pf1pooler f1pooler -e "SELECT t.name as team, GROUP_CONCAT(d.name ORDER BY d.number SEPARATOR ', ') as drivers FROM teams t LEFT JOIN drivers d ON t.id = d.team_id GROUP BY t.id ORDER BY t.name;"
