USE webnahim;

-- Actualizar contraseña directamente
UPDATE users 
SET password = '$2y$10$d8qEZ6Ast0GV6Z1qaOWCFOvrK34GYVBbkh3hKoNg.7ILOF1u5JJDS'
WHERE name = 'admin';

-- Verificar el resultado
SELECT name, email, LENGTH(password) as password_length, LEFT(password, 20) as password_start 
FROM users 
WHERE name = 'admin';