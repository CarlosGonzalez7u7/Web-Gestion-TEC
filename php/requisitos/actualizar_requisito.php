<?php
require '../conexion.php';

$id = $_POST['id'];
$tipo = $_POST['requisitoTipo'];

$stmt = $conexion->prepare("UPDATE requisitos SET requisitoTipo = ? WHERE ID_requisitos = ?");
$stmt->bind_param("si", $tipo, $id);
$stmt->execute();

echo json_encode(['success' => true]);
?>