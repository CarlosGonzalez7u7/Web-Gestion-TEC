<?php
// actualizar_requisito.php o actualizar_docente.php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

require '../conexion.php';

// validaciones básicas:
if (!isset($_POST['id'], $_POST['requisitoTipo'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros.']);
    exit;
}

$id   = intval($_POST['id']);
$tipo = trim($_POST['requisitoTipo']);

$stmt = $conexion->prepare("
    UPDATE requisitos 
    SET requisitoTipo = ? 
    WHERE ID_requisitos = ?
");
$stmt->bind_param("si", $tipo, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode([
      'success' => false,
      'message' => 'Error en la base de datos: ' . $stmt->error
    ]);
}
