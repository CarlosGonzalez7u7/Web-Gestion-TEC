<?php
require '../conexion.php';

$ID_semestre = $_GET['ID_semestre'];

// Obtener docentes asignados
$docentes = $conexion->query("SELECT DISTINCT d.ID_docente, d.nombre, d.AP_Paterno
                                FROM bitacora_semestre bs
                                JOIN docentes d ON bs.ID_docente = d.ID_docente
                                WHERE bs.ID_semestre = $ID_semestre");

// Obtener requisitos asignados
$requisitos = $conexion->query("SELECT DISTINCT r.ID_requisitos, r.requisitoTipo
                                FROM bitacora_semestre bs
                                JOIN requisitos r ON bs.ID_requisito = r.ID_requisitos
                                WHERE bs.ID_semestre = $ID_semestre");

// Obtener estado de cumplimiento
$estadoRaw = $conexion->query("SELECT ID_docente, ID_requisito, estado, comentario
                                FROM bitacora_semestre
                                WHERE ID_semestre = $ID_semestre");

$estado = [];
while ($row = $estadoRaw->fetch_assoc()) {
    $clave = $row['ID_docente'] . '_' . $row['ID_requisito'];
    $estado[$clave] = [
        'estado' => $row['estado'],
        'comentario' => $row['comentario']
    ];
}


$response = [
    "docentes" => $docentes->fetch_all(MYSQLI_ASSOC),
    "requisitos" => $requisitos->fetch_all(MYSQLI_ASSOC),
    "estado" => $estado
];

echo json_encode($response);
?>