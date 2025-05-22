<?php
require '../conexion.php';

$ID_semestre = $_POST['ID_semestre'];
$docentes = json_decode($_POST['docentes']);
$requisitos = json_decode($_POST['requisitos']);
$actualizar = isset($_POST['actualizar']) && $_POST['actualizar'] === 'true';

// Iniciar transacción
$conexion->begin_transaction();

try {
    if ($actualizar) {
        // Si es una actualización, primero eliminamos los registros existentes
        $stmt = $conexion->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
        $stmt->bind_param("i", $ID_semestre);
        $stmt->execute();
    }
    
    // Insertar las nuevas relaciones
    foreach ($docentes as $docente) {
        foreach ($requisitos as $req) {
            $stmt = $conexion->prepare("INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $ID_semestre, $docente, $req);
            $stmt->execute();
        }
    }
    
    // Confirmar la transacción
    $conexion->commit();
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Si hay un error, revertir la transacción
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>