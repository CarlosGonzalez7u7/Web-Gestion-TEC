<?php
require '../conexion.php';

$nombre = $_POST['nombre'];
$ap_paterno = $_POST['ap_paterno'];
$ap_materno = $_POST['ap_materno'] ?? '';
$carrera = $_POST['carrera'];
$fecha = date("Y-m-d");

$stmt = $conexion->prepare("INSERT INTO docentes (nombre, AP_Paterno, AP_Materno, carrera, fec_Regist) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $nombre, $ap_paterno, $ap_materno, $carrera, $fecha);

if($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conexion->error]);
}
?>