<?php
// Script de prueba para verificar usuario existente
echo "Testing existing user...\n";

try {
    require_once 'api/v1/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verificar usuario admin
    $stmt = $conn->prepare("SELECT * FROM users WHERE name = 'admin'");
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo "✓ User 'admin' found in database\n";
        echo "  ID: " . $user['ID_user'] . "\n";
        echo "  Name: " . $user['name'] . "\n";
        echo "  Email: " . $user['email'] . "\n";
        echo "  IsAdmin: " . ($user['isAdmin'] ? 'Yes' : 'No') . "\n";
        echo "  Password hash: " . substr($user['password'], 0, 20) . "...\n";
        
        // Probar algunas contraseñas comunes
        $passwords_to_test = ['password', 'admin', '123456', '12345678'];
        
        foreach ($passwords_to_test as $test_pass) {
            if (password_verify($test_pass, $user['password'])) {
                echo "✓ Password verification successful with: '$test_pass'\n";
                break;
            }
        }
        
    } else {
        echo "✗ User 'admin' not found\n";
        
        // Mostrar todos los usuarios
        $stmt = $conn->prepare("SELECT * FROM users");
        $stmt->execute();
        $result = $stmt->get_result();
        echo "\nAll users in database:\n";
        while ($row = $result->fetch_assoc()) {
            echo "  - " . $row['name'] . " (" . $row['email'] . ")\n";
        }
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";
?>