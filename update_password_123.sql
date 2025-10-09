USE webnahim;

-- Actualizar contraseña para '123'
UPDATE users 
SET password = '$2y$10$HKWYAobxe1a1JImPNWXp1.ST3vcNOD8H3rtQBEx6IkPZoA0Vgn1ZO'
WHERE name = 'admin';

-- Verificar el resultado
SELECT name, email, 'Password updated for 123' as status
FROM users 
WHERE name = 'admin';