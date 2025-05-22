<?php
require '../conexion.php';

// Obtener el ID del semestre a eliminar
$id = $_GET['id'];

// Iniciar transacción para asegurar que todas las operaciones se completen o ninguna
$conexion->begin_transaction();

try {
    // Primero eliminar los registros relacionados en bitacora_semestre
    $stmt = $conexion->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    // Luego eliminar el semestre
    $stmt = $conexion->prepare("DELETE FROM semestres WHERE ID_semestre = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    // Si todo salió bien, confirmar la transacción
    $conexion->commit();
    
    echo json_encode(['success' => true, 'message' => 'Semestre eliminado correctamente']);
} catch (Exception $e) {
    // Si hubo algún error, revertir la transacción
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al eliminar el semestre: ' . $e->getMessage()]);
}
?>