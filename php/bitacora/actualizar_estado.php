<?php
require '../conexion.php';

$idSem = $_POST['ID_semestre'];
$idDoc = $_POST['ID_docente'];
$idReq = $_POST['ID_requisito'];
$estado = $_POST['estado'];

$stmt = $conexion->prepare("UPDATE bitacora_semestre SET estado = ? WHERE ID_semestre = ? AND ID_docente = ? AND ID_requisito = ?");
$stmt->bind_param("siii", $estado, $idSem, $idDoc, $idReq);
$stmt->execute();

echo json_encode(["success" => true]);
?>