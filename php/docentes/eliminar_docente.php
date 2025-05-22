<?php
require '../conexion.php';

header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de docente no válido']);
    exit;
}

try {
    $stmt = $conexion->prepare("DELETE FROM docentes WHERE ID_docente = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Docente eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se encontró el docente con ID: ' . $id]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar: ' . $conexion->error]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>