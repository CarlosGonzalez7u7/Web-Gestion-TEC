<?php
header('Content-Type: application/json');
ini_set('display_errors', 0); // En producción es mejor no mostrar errores
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require '../conexion.php';

$search = isset($_GET['search']) ? $_GET['search'] : '';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

try {
    if($id > 0) {
        // Consulta para un docente específico
        $stmt = $conexion->prepare("SELECT * FROM docentes WHERE ID_docente = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $docente = $result->fetch_assoc();
        echo json_encode($docente ?: []);
    } else {
        // Consulta para múltiples docentes (con o sin búsqueda)
        if (!empty($search)) {
            $sql = "SELECT * FROM docentes WHERE 
                    nombre LIKE ? OR 
                    AP_Paterno LIKE ? OR 
                    AP_Materno LIKE ? OR 
                    carrera LIKE ?";
            $searchTerm = "%$search%";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("ssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm);
        } else {
            $stmt = $conexion->prepare("SELECT * FROM docentes");
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $docentes = [];
        while($row = $result->fetch_assoc()) {
            $docentes[] = $row;
        }
        echo json_encode($docentes);
    }
} catch (Exception $e) {
    // Asegúrate de devolver un JSON válido incluso en caso de error
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
?>