-- F1 Poolers - MySQL Schema
-- Database: f1pooler
-- Target: localhost:3306, user: f1pooler, password: f1pooler

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS message_reactions;
DROP TABLE IF EXISTS league_messages;
DROP TABLE IF EXISTS league_members;
DROP TABLE IF EXISTS leagues;
DROP TABLE IF EXISTS result_winners;
DROP TABLE IF EXISTS result_positions;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS bet_team_predictions;
DROP TABLE IF EXISTS bet_predictions;
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS coin_packs;
DROP TABLE IF EXISTS ad_settings;
DROP TABLE IF EXISTS system_settings;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  theme VARCHAR(20) NOT NULL DEFAULT 'original',
  terms_content_en LONGTEXT,
  terms_content_pt LONGTEXT,
  terms_content_es LONGTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teams (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nationality VARCHAR(50),
  logo_url MEDIUMTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drivers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nationality VARCHAR(50),
  team_id VARCHAR(50) NOT NULL,
  number INT,
  image_url MEDIUMTEXT,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id VARCHAR(100) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  avatar_url MEDIUMTEXT,
  balance INT NOT NULL DEFAULT 100,
  points INT NOT NULL DEFAULT 0,
  `rank` INT NOT NULL DEFAULT 0,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  age INT,
  country VARCHAR(50),
  lat DOUBLE,
  lng DOUBLE,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  terms_accepted TINYINT(1) DEFAULT 1,
  email VARCHAR(100),
  phone VARCHAR(30)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  sender VARCHAR(50) DEFAULT 'System',
  type VARCHAR(20) DEFAULT 'general',
  meta_league_id VARCHAR(100),
  meta_league_name VARCHAR(200),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rounds (
  id VARCHAR(100) PRIMARY KEY,
  number INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  circuit VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  id VARCHAR(100) PRIMARY KEY,
  round_id VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  date DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Upcoming',
  bet_value INT NOT NULL DEFAULT 10,
  pool_prize INT NOT NULL DEFAULT 0,
  FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
  INDEX idx_event_round (round_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bets (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  locked_multiplier DOUBLE NOT NULL DEFAULT 1.0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_bet_user (user_id),
  INDEX idx_bet_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bet_predictions (
  bet_id VARCHAR(100) NOT NULL,
  position INT NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (bet_id, position),
  FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bet_team_predictions (
  bet_id VARCHAR(100) NOT NULL,
  position INT NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (bet_id, position),
  FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE results (
  event_id VARCHAR(100) PRIMARY KEY,
  total_prize_pool INT NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE result_positions (
  event_id VARCHAR(100) NOT NULL,
  position INT NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (event_id, position),
  FOREIGN KEY (event_id) REFERENCES results(event_id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE result_winners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  prize_amount INT NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES results(event_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leagues (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  admin_id VARCHAR(100) NOT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 0,
  invite_code VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  has_chat TINYINT(1) NOT NULL DEFAULT 0,
  prize_title VARCHAR(200),
  prize_image_url MEDIUMTEXT,
  prize_rules TEXT,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE league_members (
  league_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (league_id, user_id),
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE league_messages (
  id VARCHAR(100) PRIMARY KEY,
  league_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  avatar_url MEDIUMTEXT,
  global_rank INT NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_msg_league (league_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE message_reactions (
  message_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  type ENUM('like', 'dislike') NOT NULL,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES league_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coin_packs (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coins INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ad_settings (
  id INT PRIMARY KEY DEFAULT 1,
  google_ad_client_id VARCHAR(100) DEFAULT '',
  reward_amount INT NOT NULL DEFAULT 25,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA

INSERT INTO system_settings (theme, terms_content_en, terms_content_pt, terms_content_es) VALUES ('original', 'F1 POOLERS - TERMS AND CONDITIONS...', 'F1 POOLERS - TERMOS E CONDICOES...', 'F1 POOLERS - TERMINOS Y CONDICIONES...');

INSERT INTO teams (id, name, nationality, logo_url) VALUES
('alpine', 'BWT Alpine Formula One Team', 'French', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/alpine/2026alpinelogo.webp'),
('astonmartin', 'Aston Martin Aramco Formula One Team', 'British', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/astonmartin/2026astonmartinlogo.webp'),
('audi', 'Audi Revolut F1 Team', 'German', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/audi/2026audilogo.webp'),
('cadillac', 'Cadillac Formula 1 Team', 'American', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/cadillac/2026cadillaclogo.webp'),
('ferrari', 'Scuderia Ferrari HP', 'Italian', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/ferrari/2026ferrarilogo.webp'),
('haas', 'TGR Haas F1 Team', 'American', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/haas/2026haaslogo.webp'),
('mclaren', 'McLaren Mastercard F1 Team', 'British', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/mclaren/2026mclarenlogo.webp'),
('mercedes', 'Mercedes-AMG PETRONAS Formula One Team', 'German', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/mercedes/2026mercedeslogo.webp'),
('redbull', 'Oracle Red Bull Racing', 'Austrian', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/redbullracing/2026redbullracinglogo.webp'),
('williams', 'Atlassian Williams F1 Team', 'British', 'https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/williams/2026williamslogo.webp');

INSERT INTO drivers (id, name, nationality, team_id, number, image_url) VALUES
('albon', 'Alexander Albon', 'Thai', 'williams', 23, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/albon.jpg.img.1024.medium.jpg'),
('alonso', 'Fernando Alonso', 'Spanish', 'astonmartin', 14, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/alonso.jpg.img.1024.medium.jpg'),
('antonelli', 'Kimi Antonelli', 'Italian', 'mercedes', 12, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/antonelli.jpg.img.1024.medium.jpg'),
('bearman', 'Oliver Bearman', 'British', 'haas', 87, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/bearman.jpg.img.1024.medium.jpg'),
('bortoleto', 'Gabriel Bortoleto', 'Brazilian', 'audi', 5, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/bortoleto.jpg.img.1024.medium.jpg'),
('bottas', 'Valtteri Bottas', 'Finnish', 'cadillac', 77, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/bottas.jpg.img.1024.medium.jpg'),
('colapinto', 'Franco Colapinto', 'Argentine', 'alpine', 43, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/colapinto.jpg.img.1024.medium.jpg'),
('gasly', 'Pierre Gasly', 'French', 'alpine', 10, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/gasly.jpg.img.1024.medium.jpg'),
('hamilton', 'Lewis Hamilton', 'British', 'ferrari', 44, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/hamilton.jpg.img.1024.medium.jpg'),
('hulkenberg', 'Nico Hulkenberg', 'German', 'audi', 27, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/hulkenberg.jpg.img.1024.medium.jpg'),
('leclerc', 'Charles Leclerc', 'Monegasque', 'ferrari', 16, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/leclerc.jpg.img.1024.medium.jpg'),
('norris', 'Lando Norris', 'British', 'mclaren', 1, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/norris.jpg.img.1024.medium.jpg'),
('ocon', 'Esteban Ocon', 'French', 'haas', 31, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/ocon.jpg.img.1024.medium.jpg'),
('perez', 'Sergio Perez', 'Mexican', 'cadillac', 11, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/perez.jpg.img.1024.medium.jpg'),
('piastri', 'Oscar Piastri', 'Australian', 'mclaren', 81, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/piastri.jpg.img.1024.medium.jpg'),
('russell', 'George Russell', 'British', 'mercedes', 63, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/russell.jpg.img.1024.medium.jpg'),
('sainz', 'Carlos Sainz', 'Spanish', 'williams', 55, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/sainz.jpg.img.1024.medium.jpg'),
('stroll', 'Lance Stroll', 'Canadian', 'astonmartin', 18, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/stroll.jpg.img.1024.medium.jpg'),
('tsunoda', 'Yuki Tsunoda', 'Japanese', 'redbull', 22, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/tsunoda.jpg.img.1024.medium.jpg'),
('verstappen', 'Max Verstappen', 'Dutch', 'redbull', 3, 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/verstappen.jpg.img.1024.medium.jpg');

INSERT INTO users (id, username, password, avatar_url, balance, points, `rank`, is_admin, age, country) VALUES
('admin', 'admin', 'admin', 'https://picsum.photos/seed/adminuser/100/100', 999999, 9999, 0, 1, 99, 'FIA');

INSERT INTO leagues (id, name, description, admin_id, is_private, invite_code, created_at, has_chat) VALUES
('global-league', 'Official F1 Pool League', 'The main public league for all users.', 'admin', 0, 'PUBLIC', NOW(), 0);

INSERT INTO league_members (league_id, user_id, status) VALUES ('global-league', 'admin', 'active');

INSERT INTO coin_packs (id, name, coins, price, currency) VALUES
('pack1', 'Starter Kit', 100, 0.99, 'USD'),
('pack2', 'Racer Bundle', 550, 4.99, 'USD'),
('pack3', 'Podium Stash', 1200, 9.99, 'USD'),
('pack4', 'Championship Vault', 3000, 24.99, 'USD');

INSERT INTO ad_settings (id, google_ad_client_id, reward_amount, is_enabled) VALUES (1, 'ca-pub-XXXXXXXXXXXXXXXX', 25, 1);
