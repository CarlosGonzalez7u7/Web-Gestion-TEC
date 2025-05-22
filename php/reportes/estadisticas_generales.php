<?php
require '../conexion.php';

// Inicializar respuesta
$response = [
    'totalDocentes' => 0,
    'totalRequisitos' => 0,
    'totalSemestres' => 0,
    'porcentajeCumplimiento' => 0,
    'estadosCumplimiento' => [
        'cumple' => 0,
        'noCumple' => 0,
        'incompleto' => 0,
        'porcentajeCumple' => 0,
        'porcentajeNoCumple' => 0,
        'porcentajeIncompleto' => 0
    ]
];

// Obtener total de docentes
$result = $conexion->query("SELECT COUNT(*) as total FROM docentes");
$row = $result->fetch_assoc();
$response['totalDocentes'] = $row['total'];

// Obtener total de requisitos
$result = $conexion->query("SELECT COUNT(*) as total FROM requisitos");
$row = $result->fetch_assoc();
$response['totalRequisitos'] = $row['total'];

// Obtener total de semestres
$result = $conexion->query("SELECT COUNT(*) as total FROM semestres");
$row = $result->fetch_assoc();
$response['totalSemestres'] = $row['total'];

// Obtener estadísticas de cumplimiento
$result = $conexion->query("
    SELECT 
        estado,
        COUNT(*) as total
    FROM bitacora_semestre
    GROUP BY estado
");

$totalRegistros = 0;
$estadosCumplimiento = [
    'Cumple' => 0,
    'No Cumple' => 0,
    'Incompleto' => 0
];

while ($row = $result->fetch_assoc()) {
    $totalRegistros += $row['total'];
    if ($row['estado'] === 'Cumple') {
        $estadosCumplimiento['Cumple'] = $row['total'];
    } else if ($row['estado'] === 'No Cumple') {
        $estadosCumplimiento['No Cumple'] = $row['total'];
    } else if ($row['estado'] === 'Incompleto') {
        $estadosCumplimiento['Incompleto'] = $row['total'];
    }
}

// Calcular porcentajes
$response['estadosCumplimiento']['cumple'] = $estadosCumplimiento['Cumple'];
$response['estadosCumplimiento']['noCumple'] = $estadosCumplimiento['No Cumple'];
$response['estadosCumplimiento']['incompleto'] = $estadosCumplimiento['Incompleto'];

if ($totalRegistros > 0) {
    $response['estadosCumplimiento']['porcentajeCumple'] = round(($estadosCumplimiento['Cumple'] / $totalRegistros) * 100, 2);
    $response['estadosCumplimiento']['porcentajeNoCumple'] = round(($estadosCumplimiento['No Cumple'] / $totalRegistros) * 100, 2);
    $response['estadosCumplimiento']['porcentajeIncompleto'] = round(($estadosCumplimiento['Incompleto'] / $totalRegistros) * 100, 2);
    $response['porcentajeCumplimiento'] = $response['estadosCumplimiento']['porcentajeCumple'];
}

// Devolver respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
?>