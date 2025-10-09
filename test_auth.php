<?php
// Script de prueba para verificar autenticación
echo "Testing authentication...\n";

try {
    require_once 'api/v1/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    // Datos de prueba
    $login = 'admin';
    $password = '1234';
    
    echo "Testing login: '$login' with password: '$password'\n";
    
    // Buscar usuario
    $stmt = $conn->prepare("SELECT * FROM users WHERE (name = ? OR email = ?) LIMIT 1");
    $stmt->bind_param("ss", $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo "✓ User found: " . $user['name'] . " (" . $user['email'] . ")\n";
        echo "Password hash in DB: " . substr($user['password'], 0, 30) . "...\n";
        
        // Verificar contraseña
        if (password_verify($password, $user['password'])) {
            echo "✓ Password verification successful!\n";
            echo "User data would be:\n";
            echo "  ID: " . $user['ID_user'] . "\n";
            echo "  Name: " . $user['name'] . "\n";
            echo "  Email: " . $user['email'] . "\n";
            echo "  IsAdmin: " . ($user['isAdmin'] ? 'Yes' : 'No') . "\n";
        } else {
            echo "✗ Password verification failed!\n";
            
            // Probar con diferentes contraseñas
            $test_passwords = ['admin123', 'password', '123456', 'admin@ejemplo.com'];
            foreach ($test_passwords as $test_pwd) {
                if (password_verify($test_pwd, $user['password'])) {
                    echo "✓ Password '$test_pwd' works!\n";
                    break;
                }
            }
        }
    } else {
        echo "✗ User not found\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";
?>