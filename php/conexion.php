<?php

$server = "localhost";
$user = "tecuruap_iscsadbd";
$pass = "3scs1dbd91";
$db   = 'tecuruap_iscsad';

$conexion = new mysqli($server, $user, $pass, $db);

// En vez de imprimir error, lanzamos una excepción
if ($conexion->connect_error) {
    throw new Exception("Error de conexión: " . $conexion->connect_error);
}

?>