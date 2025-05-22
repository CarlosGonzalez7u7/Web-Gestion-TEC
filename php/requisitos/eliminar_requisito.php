<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require '../conexion.php';

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Falta el parámetro ID']);
    exit;
}

$id = intval($_GET['id']);

if (!$conexion) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

$stmt = $conexion->prepare("DELETE FROM requisitos WHERE ID_requisitos = ?");
if (!$stmt) {
    echo json_encode(['error' => 'Falló la preparación: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id);

if (!$stmt->execute()) {
    echo json_encode(['error' => 'Falló la ejecución: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true]);