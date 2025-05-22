<?php
require '../conexion.php';

$ID_semestre = $_POST['ID_semestre'];
$docentes = json_decode($_POST['docentes']);
$requisitos = json_decode($_POST['requisitos']);

foreach ($docentes as $docente) {
    foreach ($requisitos as $req) {
        $stmt = $conexion->prepare("INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $ID_semestre, $docente, $req);
        $stmt->execute();
    }
}

echo json_encode(['success' => true]);
?>