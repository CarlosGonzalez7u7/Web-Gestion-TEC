<?php
// php/bitacora/actualizar_docentes_semestre.php

header('Content-Type: application/json');
require '../conexion.php';

$ID_semestre = isset($_POST['ID_semestre'])    ? (int) $_POST['ID_semestre']    : 0;
$docentes    = isset($_POST['docentes'])       ? json_decode($_POST['docentes'], true)    : [];
$requisitos  = isset($_POST['requisitos'])     ? json_decode($_POST['requisitos'], true)  : [];

if ($ID_semestre <= 0 || !is_array($docentes) || !is_array($requisitos)) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'Parámetros inválidos']);
    exit;
}

$conexion->begin_transaction();
try {
    // 1) Leer todas las filas existentes de este semestre
    $sqlSel = "
      SELECT ID_docente, ID_requisito, estado, comentario
        FROM bitacora_semestre
       WHERE ID_semestre = ?
    ";
    $stmtSel = $conexion->prepare($sqlSel);
    $stmtSel->bind_param("i", $ID_semestre);
    $stmtSel->execute();
    $res = $stmtSel->get_result();
    $existing = [];
    while ($row = $res->fetch_assoc()) {
        // Creamos un índice "doc-req"
        $key = $row['ID_docente'] . '-' . $row['ID_requisito'];
        $existing[$key] = [
          'estado'     => $row['estado'],
          'comentario' => $row['comentario']
        ];
    }
    $stmtSel->close();

    // 2) Construir el conjunto deseado tras la edición de docentes
    $desired = [];
    foreach ($docentes as $doc) {
      foreach ($requisitos as $req) {
        $desired[] = $doc . '-' . $req;
      }
    }

    // 3) Eliminar las combinaciones que EXISTÍAN pero ya NO están en $desired
    $toDelete = array_diff(array_keys($existing), $desired);
    if (count($toDelete) > 0) {
      $sqlDel = "
        DELETE FROM bitacora_semestre
         WHERE ID_semestre = ?
           AND CONCAT(ID_docente,'-',ID_requisito) = ?
      ";
      $stmtDel = $conexion->prepare($sqlDel);
      foreach ($toDelete as $key) {
        $stmtDel->bind_param("is", $ID_semestre, $key);
        $stmtDel->execute();
      }
      $stmtDel->close();
    }

    // 4) Insertar solo las combinaciones nuevas (en $desired pero no en $existing)
    $toInsert = array_diff($desired, array_keys($existing));
    if (count($toInsert) > 0) {
      $sqlIns = "
        INSERT INTO bitacora_semestre
          (ID_semestre, ID_docente, ID_requisito, estado, comentario)
        VALUES (?, ?, ?, ?, ?)
      ";
      $stmtIns = $conexion->prepare($sqlIns);
      foreach ($toInsert as $key) {
        list($doc, $req) = explode('-', $key);
        // valores por defecto para nuevas filas
        $estado     = 'Incompleto';
        $comentario = '';
        $stmtIns->bind_param("iisss",
          $ID_semestre,
          $doc,
          $req,
          $estado,
          $comentario
        );
        $stmtIns->execute();
      }
      $stmtIns->close();
    }

    // 5) Commit y respuesta
    $conexion->commit();
    echo json_encode(['success'=>true]);

} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(500);
    echo json_encode([
      'success'=>false,
      'message'=>'Error al actualizar docentes: '.$e->getMessage()
    ]);
}
$conexion->close();
