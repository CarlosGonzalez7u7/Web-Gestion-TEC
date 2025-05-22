<?php
session_start();
error_reporting(E_ALL); // Agrega esto
ini_set('display_errors', 1); // Agrega esto
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = trim($_POST['usernameOrEmail']);
    $password = $_POST['password'];

    // Validación básica
    if (empty($login) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }

    // Depuración: Imprime valores recibidos
    error_log("Login attempt: $login"); // Ver en logs de PHP

    // Buscar usuario por email o nombre
    $stmt = $conexion->prepare("SELECT ID_user, password, isAdmin FROM users WHERE name = ? OR email = ?");
    $stmt->bind_param("ss", $login, $login);
    
    if (!$stmt->execute()) {
        error_log("Error en la consulta: " . $stmt->error); // Ver en logs
        echo json_encode(['success' => false, 'message' => 'Error del servidor']);
        exit;
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Depuración: Verifica el hash
        error_log("Hash almacenado: " . $user['password']);
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['ID_user'];
            $_SESSION['is_admin'] = $user['isAdmin'];
            echo json_encode(['success' => true]);
            exit;
        } else {
            error_log("Contraseña no coincide"); // Ver en logs
        }
    } else {
        error_log("Usuario no encontrado"); // Ver en logs
    }

    echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
    exit;
}
?>