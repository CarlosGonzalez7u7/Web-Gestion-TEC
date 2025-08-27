<?php
require '../conexion.php';

if (isset($_GET['id'])) {
    // caso edición: devuelvo un único registro
    $id = intval($_GET['id']);
    $stmt = $conexion->prepare("SELECT * FROM requisitos WHERE ID_requisitos = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc() ?: [];
    echo json_encode($row);
    exit;
}

// caso listado/búsqueda:
$search = $_GET['search'] ?? '';
if ($search !== '') {
    $stmt = $conexion->prepare("SELECT * FROM requisitos WHERE requisitoTipo LIKE ?");
    $like = "%$search%";
    $stmt->bind_param("s", $like);
} else {
    $stmt = $conexion->prepare("SELECT * FROM requisitos");
}
$stmt->execute();
$result = $stmt->get_result();
$requisitos = [];
while ($r = $result->fetch_assoc()) {
    $requisitos[] = $r;
}
echo json_encode($requisitos);
