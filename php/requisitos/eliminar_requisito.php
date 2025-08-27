<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

require __DIR__ . '/../conexion.php';

// Parámetro
if (!isset($_GET['id'])) {
  echo json_encode(['success'=>false,'error'=>'Falta el parámetro id']);
  exit;
}
$id = intval($_GET['id']);

// Empieza transacción
$conexion->begin_transaction();

try {
  // 1) Borra las referencias en bitacora_semestre
  $stmt1 = $conexion->prepare("
    DELETE FROM bitacora_semestre
    WHERE ID_requisito = ?
  ");
  $stmt1->bind_param("i", $id);
  if (!$stmt1->execute()) {
    throw new Exception("Error al borrar bitácora: ".$stmt1->error);
  }

  // 2) Borra el requisito
  $stmt2 = $conexion->prepare("
    DELETE FROM requisitos
    WHERE ID_requisitos = ?
  ");
  $stmt2->bind_param("i", $id);
  if (!$stmt2->execute()) {
    throw new Exception("Error al borrar requisito: ".$stmt2->error);
  }

  // 3) Todo bien → commit
  $conexion->commit();
  echo json_encode(['success'=>true]);

} catch (Exception $e) {
  // Algo falló: rollback y devuelve error
  $conexion->rollback();
  echo json_encode([
    'success' => false,
    'error'   => $e->getMessage()
  ]);
}
