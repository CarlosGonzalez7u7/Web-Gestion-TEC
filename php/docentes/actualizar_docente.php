<?php
require '../conexion.php';

header('Content-Type: application/json');

// Verificar si el ID existe
if (!isset($_POST['docente_id']) || empty($_POST['docente_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de docente no proporcionado']);
    exit;
}

$id = intval($_POST['docente_id']);
$nombre = $_POST['nombre'];
$ap_paterno = $_POST['ap_paterno'];
$ap_materno = isset($_POST['ap_materno']) ? $_POST['ap_materno'] : '';
$carrera = $_POST['carrera'];

try {
    $stmt = $conexion->prepare("UPDATE docentes SET 
        nombre = ?, 
        AP_Paterno = ?, 
        AP_Materno = ?, 
        carrera = ? 
        WHERE ID_docente = ?");
    $stmt->bind_param("ssssi", $nombre, $ap_paterno, $ap_materno, $carrera, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Docente actualizado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $conexion->error]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>