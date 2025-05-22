<?php
require '../conexion.php';

$search = $_GET['search'] ?? '';
if ($search !== '') {
    $stmt = $conexion->prepare("SELECT * FROM requisitos WHERE requisitoTipo LIKE ?");
    $searchTerm = "%$search%";
    $stmt->bind_param("s", $searchTerm);
} else {
    $stmt = $conexion->prepare("SELECT * FROM requisitos");
}

$stmt->execute();
$result = $stmt->get_result();

$requisitos = [];
while ($row = $result->fetch_assoc()) {
    $requisitos[] = $row;
}

echo json_encode($requisitos);
?>