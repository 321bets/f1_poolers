#!/bin/bash
# Migration script: Update to 2026 F1 season (11 teams, 22 drivers)
mysql -u f1pooler -pf1pooler f1pooler <<'EOF'

-- Remove old driver foreign key references first
DELETE FROM bet_predictions;
DELETE FROM bet_team_predictions;
DELETE FROM result_positions;
DELETE FROM bets;
DELETE FROM results;
DELETE FROM result_winners;

-- Delete old drivers
DELETE FROM drivers;

-- Delete old teams
DELETE FROM teams;

-- Insert 2026 teams (11 teams)
INSERT INTO teams (id, name, nationality, logo_url) VALUES
('redbull', 'Red Bull Racing-Ford', 'Austrian', 'https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png'),
('ferrari', 'Scuderia Ferrari', 'Italian', 'https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png'),
('mclaren', 'McLaren-Mercedes', 'British', 'https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png'),
('mercedes', 'Mercedes-AMG PETRONAS F1 Team', 'German', 'https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png'),
('astonmartin', 'Aston Martin Aramco Honda', 'British', 'https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png'),
('racingbulls', 'Racing Bulls-Ford', 'Italian', 'https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png'),
('haas', 'MoneyGram Haas-Toyota', 'American', 'https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png.transform/2col/image.png'),
('alpine', 'Alpine-Mercedes F1 Team', 'French', 'https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png'),
('williams', 'Williams-Mercedes', 'British', 'https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png'),
('audi', 'Audi F1 Team', 'German', 'https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png'),
('cadillac', 'Cadillac F1 Team', 'American', 'https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png.transform/2col/image.png');

-- Insert 2026 drivers (22 drivers)
INSERT INTO drivers (id, name, nationality, team_id, number, image_url) VALUES
('verstappen', 'Max Verstappen', 'Dutch', 'redbull', 1, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/verstappen.jpg.img.1024.medium.jpg'),
('lawson', 'Liam Lawson', 'New Zealander', 'redbull', 30, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/lawson.jpg.img.1024.medium.jpg'),
('leclerc', 'Charles Leclerc', 'Monegasque', 'ferrari', 16, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/leclerc.jpg.img.1024.medium.jpg'),
('hamilton', 'Lewis Hamilton', 'British', 'ferrari', 44, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/hamilton.jpg.img.1024.medium.jpg'),
('norris', 'Lando Norris', 'British', 'mclaren', 4, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/norris.jpg.img.1024.medium.jpg'),
('piastri', 'Oscar Piastri', 'Australian', 'mclaren', 81, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/piastri.jpg.img.1024.medium.jpg'),
('russell', 'George Russell', 'British', 'mercedes', 63, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/russell.jpg.img.1024.medium.jpg'),
('antonelli', 'Kimi Antonelli', 'Italian', 'mercedes', 12, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/antonelli.jpg.img.1024.medium.jpg'),
('alonso', 'Fernando Alonso', 'Spanish', 'astonmartin', 14, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/alonso.jpg.img.1024.medium.jpg'),
('stroll', 'Lance Stroll', 'Canadian', 'astonmartin', 18, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/stroll.jpg.img.1024.medium.jpg'),
('gasly', 'Pierre Gasly', 'French', 'alpine', 10, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/gasly.jpg.img.1024.medium.jpg'),
('doohan', 'Jack Doohan', 'Australian', 'alpine', 7, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/doohan.jpg.img.1024.medium.jpg'),
('albon', 'Alexander Albon', 'Thai', 'williams', 23, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/albon.jpg.img.1024.medium.jpg'),
('sainz', 'Carlos Sainz', 'Spanish', 'williams', 55, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/sainz.jpg.img.1024.medium.jpg'),
('ocon', 'Esteban Ocon', 'French', 'haas', 31, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/ocon.jpg.img.1024.medium.jpg'),
('bearman', 'Oliver Bearman', 'British', 'haas', 87, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/bearman.jpg.img.1024.medium.jpg'),
('tsunoda', 'Yuki Tsunoda', 'Japanese', 'racingbulls', 22, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/tsunoda.jpg.img.1024.medium.jpg'),
('hadjar', 'Isack Hadjar', 'French', 'racingbulls', 6, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/hadjar.jpg.img.1024.medium.jpg'),
('hulkenberg', 'Nico Hulkenberg', 'German', 'audi', 27, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/hulkenberg.jpg.img.1024.medium.jpg'),
('bortoleto', 'Gabriel Bortoleto', 'Brazilian', 'audi', 5, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/bortoleto.jpg.img.1024.medium.jpg'),
('bottas', 'Valtteri Bottas', 'Finnish', 'cadillac', 77, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/bottas.jpg.img.1024.medium.jpg'),
('perez', 'Sergio Perez', 'Mexican', 'cadillac', 11, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/perez.jpg.img.1024.medium.jpg');

SELECT CONCAT(COUNT(*), ' teams') as result FROM teams
UNION ALL
SELECT CONCAT(COUNT(*), ' drivers') FROM drivers;

EOF
echo "Migration complete!"
