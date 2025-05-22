<?php
require '../conexion.php';

$search = $_GET['search'] ?? '';
$semestres = [];

if ($search !== '') {
    $stmt = $conexion->prepare("SELECT * FROM semestres WHERE nomSem LIKE ? ORDER BY fecha_inicio DESC");
    $term = "%$search%";
    $stmt->bind_param("s", $term);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conexion->query("SELECT * FROM semestres ORDER BY fecha_inicio DESC");
}

while ($row = $result->fetch_assoc()) {
    $id = $row['ID_semestre'];

    // Verifica si hay registros en bitacora_semestre para este semestre
    $consulta = $conexion->prepare("SELECT COUNT(*) as total FROM bitacora_semestre WHERE ID_semestre = ?");
    $consulta->bind_param("i", $id);
    $consulta->execute();
    $res = $consulta->get_result()->fetch_assoc();

    $row['configurado'] = $res['total'] > 0 ? true : false;
    $semestres[] = $row;
}

echo json_encode($semestres);
?>