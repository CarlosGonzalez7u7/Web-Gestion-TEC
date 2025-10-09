<?php

$server = "localhost";//localhost
$user = "root";//tecuruap_iscsadbd
$pass = "12345678";//3scs1dbd91
$db   = 'webnahim';//tecuruap_iscsad
$conexion = new mysqli($server, $user, $pass, $db);

if ($conexion->connect_error) {
    throw new Exception("Error de conexión: " . $conexion->connect_error);
}

?>