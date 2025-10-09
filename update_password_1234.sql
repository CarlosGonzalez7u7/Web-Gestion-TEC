USE webnahim;

-- Actualizar contraseña para '1234'
UPDATE users 
SET password = '$2y$10$1wuOb5dCM9s5aRilhkcImu8WnNWvLbix.9U05vW80hNSgaTD9XWii'
WHERE name = 'admin';

-- Verificar el resultado
SELECT name, email, 'Password updated for 1234' as status
FROM users 
WHERE name = 'admin';