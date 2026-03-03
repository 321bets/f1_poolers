DELETE FROM drivers WHERE id IN ('herta','oward');
INSERT INTO drivers (id, name, nationality, team_id, number, image_url) VALUES
('bottas', 'Valtteri Bottas', 'Finnish', 'cadillac', 77, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/bottas.jpg.img.1024.medium.jpg'),
('perez', 'Sergio Perez', 'Mexican', 'cadillac', 11, 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/perez.jpg.img.1024.medium.jpg');
SELECT id, name, number, team_id FROM drivers WHERE team_id='cadillac';
