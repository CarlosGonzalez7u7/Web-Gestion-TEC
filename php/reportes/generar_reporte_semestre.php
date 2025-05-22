<?php
require '../conexion.php';

// Obtener parámetros
$ID_semestre = $_GET['ID_semestre'];
$docentes = json_decode($_GET['docentes']);
$estados = json_decode($_GET['estados']);

// Inicializar respuesta
$response = [
    'semestre' => null,
    'docentes' => [],
    'requisitos' => [],
    'estado' => []
];

// Obtener información del semestre
$stmt = $conexion->prepare("SELECT * FROM semestres WHERE ID_semestre = ?");
$stmt->bind_param("i", $ID_semestre);
$stmt->execute();
$result = $stmt->get_result();
$response['semestre'] = $result->fetch_assoc();

// Obtener docentes seleccionados
$placeholders = implode(',', array_fill(0, count($docentes), '?'));
$query = "SELECT * FROM docentes WHERE ID_docente IN ($placeholders)";
$stmt = $conexion->prepare($query);

// Bind parameters dinámicamente
$types = str_repeat('i', count($docentes));
$stmt->bind_param($types, ...$docentes);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $response['docentes'][] = $row;
}

// Obtener requisitos del semestre
$stmt = $conexion->prepare("
    SELECT DISTINCT r.* 
    FROM requisitos r
    JOIN bitacora_semestre bs ON r.ID_requisitos = bs.ID_requisito
    WHERE bs.ID_semestre = ?
");
$stmt->bind_param("i", $ID_semestre);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $response['requisitos'][] = $row;
}

// Obtener estado de cumplimiento
$placeholdersEstados = implode(',', array_fill(0, count($estados), '?'));
$query = "
    SELECT bs.ID_docente, bs.ID_requisito, bs.estado, bs.comentario
    FROM bitacora_semestre bs
    WHERE bs.ID_semestre = ? 
    AND bs.ID_docente IN ($placeholders)
    AND bs.estado IN ($placeholdersEstados)
";

$stmt = $conexion->prepare($query);

// Combinar parámetros
$allParams = array_merge([$ID_semestre], $docentes, $estados);
$types = 'i' . str_repeat('i', count($docentes)) . str_repeat('s', count($estados));
$stmt->bind_param($types, ...$allParams);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $key = $row['ID_docente'] . '_' . $row['ID_requisito'];
    $response['estado'][$key] = [
        'estado' => $row['estado'],
        'comentario' => $row['comentario']
    ];
}

// Devolver respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
?>