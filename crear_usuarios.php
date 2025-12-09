<?php
/**
 * SCRIPT DE CREACIÓN DE USUARIOS - SOLO PARA ADMINISTRADORES
 * 
 * IMPORTANTE: 
 * - Solo usar en acceso restringido
 */

// Configuración de la base de datos (ajustar según tu configuración)
$host = 'localhost';
$dbname = 'webnahim';
$username = 'root';
$password = '12345678';

// =====================================================
// CONFIGURACIÓN DEL USUARIO A CREAR
// =====================================================
$nuevo_usuario = [
    'name' => '',
    'email' => '',
    'password' => '',  // Contraseña en texto plano (será hasheada)
    'isAdmin' => 1  // 1 = Admin, 0 = Usuario normal
];
// =====================================================

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear Usuario - Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
        }
        
        .danger {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #721c24;
        }
        
        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #155724;
        }
        
        .info {
            background: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #0c5460;
        }
        
        .user-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .user-details p {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
        }
        
        .user-details strong {
            color: #495057;
        }
        
        .user-details span {
            color: #212529;
            font-family: monospace;
            background: white;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            margin: 5px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
        }
        
        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
        }
        
        .form-group {
            margin: 20px 0;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #495057;
            font-weight: 600;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1> Crear Usuario Administrativo</h1>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Conectar a la base de datos
        $conn = new mysqli($host, $username, $password, $dbname);
        
        if ($conn->connect_error) {
            throw new Exception("Error de conexión: " . $conn->connect_error);
        }
        
        // Obtener datos del formulario
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        $pass = $_POST['password'];
        $isAdmin = intval($_POST['isAdmin']);
        
        // Validaciones básicas
        if (empty($name) || empty($email) || empty($pass)) {
            throw new Exception("Todos los campos son obligatorios");
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Email inválido");
        }
        
        // Verificar si el usuario ya existe
        $stmt = $conn->prepare("SELECT ID_user FROM users WHERE email = ? OR name = ?");
        $stmt->bind_param("ss", $email, $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            throw new Exception("Ya existe un usuario con ese email o nombre");
        }
        
        // Hashear la contraseña
        $hashedPassword = password_hash($pass, PASSWORD_DEFAULT);
        
        // Insertar usuario
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $name, $email, $hashedPassword, $isAdmin);
        
        if ($stmt->execute()) {
            $userId = $conn->insert_id;
            echo '<div class="success">';
            echo '<strong>Usuario creado exitosamente</strong><br><br>';
            echo '<strong>ID:</strong> ' . $userId . '<br>';
            echo '<strong>Nombre:</strong> ' . htmlspecialchars($name) . '<br>';
            echo '<strong>Email:</strong> ' . htmlspecialchars($email) . '<br>';
            echo '<strong>Tipo:</strong> ' . ($isAdmin ? 'Administrador' : 'Usuario Normal') . '<br>';
            echo '<strong>Contraseña:</strong> ' . htmlspecialchars($pass) . ' (guardada de forma segura)';
            echo '</div>';
            
            echo '<div class="info">';
            echo '<strong>Credenciales de acceso:</strong><br>';
            echo 'Usuario: <code>' . htmlspecialchars($name) . '</code> o <code>' . htmlspecialchars($email) . '</code><br>';
            echo 'Contraseña: <code>' . htmlspecialchars($pass) . '</code>';
            echo '</div>';
            
            echo '<div class="actions">';
            echo '<a href="index.php" class="btn btn-primary">Ir al Login</a>';
            echo '</div>';
        } else {
            throw new Exception("Error al crear el usuario: " . $stmt->error);
        }
        
        $stmt->close();
        $conn->close();
        
    } catch (Exception $e) {
        echo '<div class="danger">';
        echo '<strong> Error:</strong> ' . htmlspecialchars($e->getMessage());
        echo '</div>';
    }
} else {
    // Mostrar formulario
    ?>
    
    <form method="POST" action="">
        <div class="form-group">
            <label for="name">Nombre de usuario:</label>
            <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($nuevo_usuario['name']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($nuevo_usuario['email']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="password">Contraseña:</label>
            <input type="text" id="password" name="password" value="<?php echo htmlspecialchars($nuevo_usuario['password']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="isAdmin">Tipo de usuario:</label>
            <select id="isAdmin" name="isAdmin" required>
                <option value="1" <?php echo $nuevo_usuario['isAdmin'] == 1 ? 'selected' : ''; ?>>Administrador</option>
                <option value="0" <?php echo $nuevo_usuario['isAdmin'] == 0 ? 'selected' : ''; ?>>Usuario Normal</option>
            </select>
        </div>
        
        
        <div class="actions">
            <button type="submit" class="btn btn-primary">✓ Crear Usuario</button>
        </div>
    </form>
    
    <?php
}
?>
    </div>
</body>
</html>
