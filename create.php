<?php
require 'php/conexion.php';

$name = "admin";
$email = "admin@ejemplo.com";
$password = "1234";
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$isAdmin = 1;

$stmt = $conexion->prepare("INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $name, $email, $hashed_password, $isAdmin);

if ($stmt->execute()) {
    echo "Usuario admin creado exitosamente!";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conexion->close();
?>