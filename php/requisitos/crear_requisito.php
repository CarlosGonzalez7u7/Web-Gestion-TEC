<?php
require '../conexion.php';

$tipo = $_POST['requisitoTipo'];

$stmt = $conexion->prepare("INSERT INTO requisitos (requisitoTipo) VALUES (?)");
$stmt->bind_param("s", $tipo);
$stmt->execute();

echo json_encode(['success' => true]);
?>