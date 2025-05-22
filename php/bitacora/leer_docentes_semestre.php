<?php
require '../conexion.php';

// Obtener el ID del semestre
$ID_semestre = $_GET['ID_semestre'];

// Consulta para obtener los docentes asignados a un semestre específico
$query = "
    SELECT DISTINCT d.* 
    FROM docentes d
    JOIN bitacora_semestre bs ON d.ID_docente = bs.ID_docente
    WHERE bs.ID_semestre = ?
    ORDER BY d.nombre, d.AP_Paterno
";

$stmt = $conexion->prepare($query);
$stmt->bind_param("i", $ID_semestre);
$stmt->execute();
$result = $stmt->get_result();

$docentes = [];
while ($row = $result->fetch_assoc()) {
    $docentes[] = $row;
}

// Devolver los resultados en formato JSON
header('Content-Type: application/json');
echo json_encode($docentes);
?>