<?php
header('Content-Type: application/json');
require '../conexion.php';

$ID_semestre = isset($_POST['ID_semestre']) ? (int) $_POST['ID_semestre'] : 0;
$nomSem      = isset($_POST['nomSem'])      ? trim($_POST['nomSem'])    : '';

if ($ID_semestre <= 0 || $nomSem === '') {
  http_response_code(400);
  echo json_encode(['success'=>false, 'message'=>'Datos inválidos']);
  exit;
}

$stmt = $conexion->prepare("
  UPDATE semestres
     SET nomSem = ?
   WHERE ID_semestre = ?
");
$stmt->bind_param("si", $nomSem, $ID_semestre);

if ($stmt->execute()) {
  echo json_encode(['success'=>true]);
} else {
  http_response_code(500);
  echo json_encode([
    'success'=>false, 
    'message'=>'Error al guardar cambios'
  ]);
}
$stmt->close();
$conexion->close();
