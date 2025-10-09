<?php
// Script de prueba para verificar que la API funciona
echo "Testing API...\n";

// Test 1: Verificar conexión a base de datos
try {
    require_once 'api/v1/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    echo "✓ Database connection successful\n";
    
    // Test 2: Verificar usuario
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE username = 'admin'");
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo "✓ User 'admin' found in database\n";
    } else {
        echo "✗ User 'admin' not found\n";
    }
    
    // Test 3: Verificar password
    if ($user && password_verify('password', $user['password'])) {
        echo "✓ Password verification successful\n";
    } else {
        echo "✗ Password verification failed\n";
    }
    
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

echo "Test completed.\n";
?>