<?php
require '../conexion.php';

$nom = $_POST['nomSem'];
$inicio = $_POST['fecha_inicio'];
$fin = $_POST['fecha_fin'];

$stmt = $conexion->prepare("INSERT INTO semestres (nomSem, fecha_inicio, fecha_fin) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nom, $inicio, $fin);
$stmt->execute();

echo json_encode(['success' => true]);
?>