<?php
// API simple sin routing para compatibilidad con servidores básicos
error_reporting(0);
ini_set('display_errors', 0);

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Manejador de errores global
set_error_handler(function($severity, $message, $file, $line) {
    sendResponse(false, null, "Error interno: $message", 500);
});

set_exception_handler(function($exception) {
    sendResponse(false, null, "Excepción: " . $exception->getMessage(), 500);
});

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/Database.php';

// Función simple de respuesta
function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit();
}

// Obtener parámetros
$action = $_GET['action'] ?? '';
$endpoint = $_GET['resource'] ?? '';  // Cambiar de 'endpoint' a 'resource'

// Log debug info
error_log("API Request - Endpoint: $endpoint, Action: $action, Method: " . $_SERVER['REQUEST_METHOD']);

// Validar que se recibieron parámetros
if (empty($endpoint)) {
    sendResponse(false, null, 'Endpoint requerido', 400);
}

if (empty($action)) {
    sendResponse(false, null, 'Action requerida', 400);
}

// Manejar autenticación
if ($endpoint === 'auth') {
    session_start();
    
    if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $login = $input['login'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($login) || empty($password)) {
            sendResponse(false, null, 'Todos los campos son requeridos', 400);
        }
        
        try {
            $db = new Database();
            $conn = $db->getConnection();
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE (name = ? OR email = ?) LIMIT 1");
            $stmt->bind_param("ss", $login, $login);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['ID_user'];
                $_SESSION['username'] = $user['name'];
                $_SESSION['user_logged_in'] = true;
                
                sendResponse(true, [
                    'user' => [
                        'id' => $user['ID_user'],
                        'username' => $user['name'],
                        'email' => $user['email'],
                        'isAdmin' => $user['isAdmin']
                    ]
                ], 'Login exitoso');
            } else {
                sendResponse(false, null, 'Credenciales inválidas', 401);
            }
        } catch (Exception $e) {
            sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
        }
    }
    
    elseif ($action === 'check' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        // Asegurar que la sesión esté iniciada
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $valid = isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true;
        
        sendResponse(true, [
            'valid' => $valid,
            'user_id' => $_SESSION['user_id'] ?? null,
            'username' => $_SESSION['username'] ?? null
        ]);
    }
    
    elseif ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        session_destroy();
        sendResponse(true, null, 'Logout exitoso');
    }
}

// Manejar docentes
elseif ($endpoint === 'docentes') {
    session_start();
    
    // Verificar autenticación
    if (!isset($_SESSION['user_logged_in']) || !$_SESSION['user_logged_in']) {
        sendResponse(false, null, 'No autorizado', 401);
    }
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $search = $_GET['search'] ?? '';
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 10);
            $offset = ($page - 1) * $limit;
            
            if (!empty($search)) {
                $searchParam = "%$search%";
                $stmt = $conn->prepare("SELECT * FROM docentes WHERE nombre LIKE ? OR AP_Paterno LIKE ? OR AP_Materno LIKE ? OR carrera LIKE ? ORDER BY nombre LIMIT ? OFFSET ?");
                $stmt->bind_param("ssssii", $searchParam, $searchParam, $searchParam, $searchParam, $limit, $offset);
                $stmt->execute();
                $result = $stmt->get_result();
                $docentes = $result->fetch_all(MYSQLI_ASSOC);
                
                $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM docentes WHERE nombre LIKE ? OR AP_Paterno LIKE ? OR AP_Materno LIKE ? OR carrera LIKE ?");
                $countStmt->bind_param("ssss", $searchParam, $searchParam, $searchParam, $searchParam);
                $countStmt->execute();
                $countResult = $countStmt->get_result();
                $total = $countResult->fetch_assoc()['total'];
            } else {
                $stmt = $conn->prepare("SELECT * FROM docentes ORDER BY nombre LIMIT ? OFFSET ?");
                $stmt->bind_param("ii", $limit, $offset);
                $stmt->execute();
                $result = $stmt->get_result();
                $docentes = $result->fetch_all(MYSQLI_ASSOC);
                
                $countStmt = $conn->query("SELECT COUNT(*) as total FROM docentes");
                $total = $countStmt->fetch_assoc()['total'];
            }
            
            sendResponse(true, [
                'docentes' => $docentes,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => (int)$total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
        }
        
        elseif ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            $stmt = $conn->prepare("SELECT * FROM docentes WHERE ID_docente = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $docente = $result->fetch_assoc();
            
            if ($docente) {
                sendResponse(true, $docente);
            } else {
                sendResponse(false, null, 'Docente no encontrado', 404);
            }
        }
        
        elseif ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $nombre = $input['nombre'] ?? '';
            $ap_paterno = $input['AP_Paterno'] ?? '';
            $ap_materno = $input['AP_Materno'] ?? '';
            $carrera = $input['carrera'] ?? '';
            
            if (empty($nombre) || empty($ap_paterno) || empty($carrera)) {
                sendResponse(false, null, 'Faltan campos requeridos', 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO docentes (nombre, AP_Paterno, AP_Materno, carrera) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $nombre, $ap_paterno, $ap_materno, $carrera);
            
            if ($stmt->execute()) {
                sendResponse(true, ['id' => $conn->insert_id], 'Docente creado exitosamente');
            } else {
                sendResponse(false, null, 'Error al crear docente', 500);
            }
        }
        
        elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Convertir ID a entero
            $id = (int)$id;
            if ($id <= 0) {
                sendResponse(false, null, 'ID debe ser un número válido', 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Log para debug
            error_log("UPDATE Docente - ID: $id, Input: " . json_encode($input));
            
            $nombre = $input['nombre'] ?? '';
            $ap_paterno = $input['AP_Paterno'] ?? '';
            $ap_materno = $input['AP_Materno'] ?? '';
            $carrera = $input['carrera'] ?? '';
            
            if (empty($nombre) || empty($ap_paterno) || empty($carrera)) {
                sendResponse(false, null, 'Faltan campos requeridos', 400);
            }
            
            // Verificar que el docente existe antes de actualizar
            $checkStmt = $conn->prepare("SELECT ID_docente FROM docentes WHERE ID_docente = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $exists = $checkStmt->get_result()->fetch_assoc();
            
            if (!$exists) {
                sendResponse(false, null, 'Docente no encontrado', 404);
            }
            
            $stmt = $conn->prepare("UPDATE docentes SET nombre = ?, AP_Paterno = ?, AP_Materno = ?, carrera = ? WHERE ID_docente = ?");
            $stmt->bind_param("ssssi", $nombre, $ap_paterno, $ap_materno, $carrera, $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(true, null, 'Docente actualizado exitosamente');
                } else {
                    sendResponse(false, null, 'No se realizaron cambios (datos iguales)', 200);
                }
            } else {
                error_log("Error en UPDATE: " . $stmt->error);
                sendResponse(false, null, 'Error en la base de datos: ' . $stmt->error, 500);
            }
        }
        
        elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Convertir ID a entero
            $id = (int)$id;
            if ($id <= 0) {
                sendResponse(false, null, 'ID debe ser un número válido', 400);
            }
            
            // Verificar que el docente existe antes de eliminar
            $checkStmt = $conn->prepare("SELECT ID_docente FROM docentes WHERE ID_docente = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $exists = $checkStmt->get_result()->fetch_assoc();
            
            if (!$exists) {
                sendResponse(false, null, 'Docente no encontrado', 404);
            }
            
            // PRIMERO: Eliminar todos los registros de bitácora asociados al docente
            $deleteBitacoraStmt = $conn->prepare("DELETE FROM bitacora_semestre WHERE ID_docente = ?");
            $deleteBitacoraStmt->bind_param("i", $id);
            $deleteBitacoraStmt->execute();
            $registrosEliminados = $deleteBitacoraStmt->affected_rows;
            
            // SEGUNDO: Eliminar el docente
            $stmt = $conn->prepare("DELETE FROM docentes WHERE ID_docente = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $mensaje = "Docente eliminado exitosamente";
                    if ($registrosEliminados > 0) {
                        $mensaje .= " (se eliminaron $registrosEliminados registros de bitácora asociados)";
                    }
                    sendResponse(true, ['registros_bitacora_eliminados' => $registrosEliminados], $mensaje);
                } else {
                    sendResponse(false, null, 'No se pudo eliminar el docente', 500);
                }
            } else {
                error_log("Error en DELETE docente: " . $stmt->error);
                sendResponse(false, null, 'Error en la base de datos: ' . $stmt->error, 500);
            }
        }
    } catch (Exception $e) {
        sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
    }
}

// Manejar requisitos
elseif ($endpoint === 'requisitos') {
    session_start();
    
    // Verificar autenticación
    if (!isset($_SESSION['user_logged_in']) || !$_SESSION['user_logged_in']) {
        sendResponse(false, null, 'No autorizado', 401);
    }
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $search = $_GET['search'] ?? '';
            
            if (!empty($search)) {
                $searchParam = "%$search%";
                $stmt = $conn->prepare("SELECT ID_requisitos as id, requisitoTipo as nombre FROM requisitos WHERE requisitoTipo LIKE ? ORDER BY requisitoTipo");
                $stmt->bind_param("s", $searchParam);
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                $stmt = $conn->prepare("SELECT ID_requisitos as id, requisitoTipo as nombre FROM requisitos ORDER BY requisitoTipo");
                $stmt->execute();
                $result = $stmt->get_result();
            }
            
            $requisitos = [];
            while ($row = $result->fetch_assoc()) {
                $requisitos[] = $row;
            }
            sendResponse(true, $requisitos);
        }
        
        elseif ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            $stmt = $conn->prepare("SELECT ID_requisitos as id, requisitoTipo as nombre FROM requisitos WHERE ID_requisitos = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $requisito = $result->fetch_assoc();
            
            if ($requisito) {
                sendResponse(true, $requisito);
            } else {
                sendResponse(false, null, 'Requisito no encontrado', 404);
            }
        }
        
        elseif ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Aceptar tanto 'nombre' como 'requisitoTipo' para compatibilidad
            $nombre = $input['nombre'] ?? $input['requisitoTipo'] ?? '';
            
            if (empty($nombre)) {
                sendResponse(false, null, 'El tipo de requisito es requerido', 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO requisitos (requisitoTipo) VALUES (?)");
            $stmt->bind_param("s", $nombre);
            
            if ($stmt->execute()) {
                $id = $conn->insert_id;
                sendResponse(true, ['id' => $id], 'Requisito creado exitosamente');
            } else {
                sendResponse(false, null, 'Error al crear requisito', 500);
            }
        }
        
        elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Convertir ID a entero
            $id = (int)$id;
            if ($id <= 0) {
                sendResponse(false, null, 'ID debe ser un número válido', 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Aceptar tanto 'nombre' como 'requisitoTipo' para compatibilidad
            $nombre = $input['nombre'] ?? $input['requisitoTipo'] ?? '';
            
            if (empty($nombre)) {
                sendResponse(false, null, 'El tipo de requisito es requerido', 400);
            }
            
            $stmt = $conn->prepare("UPDATE requisitos SET requisitoTipo = ? WHERE ID_requisitos = ?");
            $stmt->bind_param("si", $nombre, $id);
            
            if ($stmt->execute() && $stmt->affected_rows > 0) {
                sendResponse(true, null, 'Requisito actualizado exitosamente');
            } else {
                sendResponse(false, null, 'Error al actualizar requisito o requisito no encontrado', 500);
            }
        }
        
        elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = $_GET['id'] ?? '';
            
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Convertir ID a entero
            $id = (int)$id;
            if ($id <= 0) {
                sendResponse(false, null, 'ID debe ser un número válido', 400);
            }
            
            // Verificar que el requisito existe antes de eliminar
            $checkStmt = $conn->prepare("SELECT ID_requisitos FROM requisitos WHERE ID_requisitos = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $exists = $checkStmt->get_result()->fetch_assoc();
            
            if (!$exists) {
                sendResponse(false, null, 'Requisito no encontrado', 404);
            }
            
            // PRIMERO: Eliminar todos los registros de bitácora asociados al requisito
            $deleteBitacoraStmt = $conn->prepare("DELETE FROM bitacora_semestre WHERE ID_requisito = ?");
            $deleteBitacoraStmt->bind_param("i", $id);
            $deleteBitacoraStmt->execute();
            $registrosEliminados = $deleteBitacoraStmt->affected_rows;
            
            // SEGUNDO: Eliminar el requisito
            $stmt = $conn->prepare("DELETE FROM requisitos WHERE ID_requisitos = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $mensaje = "Requisito eliminado exitosamente";
                    if ($registrosEliminados > 0) {
                        $mensaje .= " (se eliminaron $registrosEliminados registros de bitácora asociados)";
                    }
                    sendResponse(true, ['registros_bitacora_eliminados' => $registrosEliminados], $mensaje);
                } else {
                    sendResponse(false, null, 'No se pudo eliminar el requisito', 500);
                }
            } else {
                error_log("Error en DELETE requisito: " . $stmt->error);
                sendResponse(false, null, 'Error en la base de datos: ' . $stmt->error, 500);
            }
        }
        
        else {
            sendResponse(false, null, 'Acción no válida para requisitos', 400);
        }
    } catch (Exception $e) {
        sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
    }
}

// Manejar semestres
elseif ($endpoint === 'semestres') {
    session_start();
    
    // Verificar autenticación
    if (!isset($_SESSION['user_logged_in']) || !$_SESSION['user_logged_in']) {
        sendResponse(false, null, 'No autorizado', 401);
    }
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $conn->prepare("SELECT ID_semestre, nomSem, fecha_inicio, fecha_fin FROM semestres ORDER BY fecha_inicio DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            $semestres = [];
            while ($row = $result->fetch_assoc()) {
                $semestres[] = $row;
            }
            sendResponse(true, $semestres);
        }
        
        elseif ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            $stmt = $conn->prepare("SELECT ID_semestre, nomSem, fecha_inicio, fecha_fin FROM semestres WHERE ID_semestre = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $semestre = $result->fetch_assoc();
            
            if ($semestre) {
                sendResponse(true, $semestre);
            } else {
                sendResponse(false, null, 'Semestre no encontrado', 404);
            }
        }
        
        elseif ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            $nomSem = $input['nomSem'] ?? '';
            $fecha_inicio = $input['fecha_inicio'] ?? '';
            $fecha_fin = $input['fecha_fin'] ?? '';
            
            if (empty($nomSem) || empty($fecha_inicio) || empty($fecha_fin)) {
                sendResponse(false, null, 'Todos los campos son requeridos', 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO semestres (nomSem, fecha_inicio, fecha_fin) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $nomSem, $fecha_inicio, $fecha_fin);
            
            if ($stmt->execute()) {
                $id = $conn->insert_id;
                sendResponse(true, ['id' => $id], 'Semestre creado exitosamente');
            } else {
                sendResponse(false, null, 'Error al crear semestre', 500);
            }
        }
        
        elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? '';
            
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            $nomSem = $input['nomSem'] ?? '';
            $fecha_inicio = $input['fecha_inicio'] ?? '';
            $fecha_fin = $input['fecha_fin'] ?? '';
            
            if (empty($nomSem) || empty($fecha_inicio) || empty($fecha_fin)) {
                sendResponse(false, null, 'Todos los campos son requeridos', 400);
            }
            
            $stmt = $conn->prepare("UPDATE semestres SET nomSem = ?, fecha_inicio = ?, fecha_fin = ? WHERE ID_semestre = ?");
            $stmt->bind_param("sssi", $nomSem, $fecha_inicio, $fecha_fin, $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    sendResponse(true, null, 'Semestre actualizado exitosamente');
                } else {
                    sendResponse(false, null, 'Semestre no encontrado o sin cambios', 404);
                }
            } else {
                sendResponse(false, null, 'Error al actualizar semestre', 500);
            }
        }
        
        elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = $_GET['id'] ?? '';
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Primero eliminar registros de bitácora
            $deleteBitacoraStmt = $conn->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
            $deleteBitacoraStmt->bind_param("i", $id);
            $deleteBitacoraStmt->execute();
            $registrosEliminados = $deleteBitacoraStmt->affected_rows;
            
            // Luego eliminar el semestre
            $stmt = $conn->prepare("DELETE FROM semestres WHERE ID_semestre = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $mensaje = "Semestre eliminado exitosamente";
                    if ($registrosEliminados > 0) {
                        $mensaje .= " (se eliminaron $registrosEliminados registros de bitácora asociados)";
                    }
                    sendResponse(true, ['registros_bitacora_eliminados' => $registrosEliminados], $mensaje);
                } else {
                    sendResponse(false, null, 'Semestre no encontrado', 404);
                }
            } else {
                sendResponse(false, null, 'Error al eliminar semestre', 500);
            }
        }
        
        elseif ($action === 'docentes' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $semestre_id = $_GET['semestre_id'] ?? '';
            if (empty($semestre_id)) {
                sendResponse(false, null, 'ID de semestre requerido', 400);
            }
            
            // Obtener docentes que tienen registros en bitácora para este semestre
            $stmt = $conn->prepare("
                SELECT DISTINCT d.ID_docente, d.nombre, d.AP_Paterno, d.AP_Materno, d.carrera
                FROM docentes d
                INNER JOIN bitacora_semestre b ON d.ID_docente = b.ID_docente
                WHERE b.ID_semestre = ?
                ORDER BY d.nombre, d.AP_Paterno
            ");
            $stmt->bind_param("i", $semestre_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $docentes = [];
            while ($row = $result->fetch_assoc()) {
                $docentes[] = $row;
            }
            sendResponse(true, $docentes);
        }
        
        else {
            sendResponse(false, null, 'Acción no válida para semestres', 400);
        }
    } catch (Exception $e) {
        sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
    }
}

// Manejar bitácora
elseif ($endpoint === 'bitacora') {
    session_start();
    
    // Verificar autenticación
    if (!isset($_SESSION['user_logged_in']) || !$_SESSION['user_logged_in']) {
        sendResponse(false, null, 'No autorizado', 401);
    }
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $semestre_id = $_GET['semestre_id'] ?? '';
            
            $sql = "SELECT 
                        b.ID as id,
                        b.ID_semestre as semestre_id,
                        b.ID_docente as docente_id,
                        b.ID_requisito as requisito_id,
                        b.cumple,
                        b.estado,
                        b.comentario,
                        CONCAT(d.nombre, ' ', d.AP_Paterno, ' ', d.AP_Materno) as docente_nombre,
                        r.requisitoTipo as requisito_nombre,
                        s.nomSem as semestre_nombre
                    FROM bitacora_semestre b
                    LEFT JOIN docentes d ON b.ID_docente = d.ID_docente
                    LEFT JOIN requisitos r ON b.ID_requisito = r.ID_requisitos
                    LEFT JOIN semestres s ON b.ID_semestre = s.ID_semestre";
            
            if (!empty($semestre_id)) {
                $sql .= " WHERE b.ID_semestre = ?";
                $stmt = $conn->prepare($sql . " ORDER BY d.nombre, r.requisitoTipo");
                $stmt->bind_param("i", $semestre_id);
            } else {
                $stmt = $conn->prepare($sql . " ORDER BY s.nomSem DESC, d.nombre, r.requisitoTipo");
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            $bitacora = [];
            while ($row = $result->fetch_assoc()) {
                $bitacora[] = $row;
            }
            sendResponse(true, $bitacora);
        }
        
        elseif ($action === 'requisitos' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $semestre_id = $_GET['semestre_id'] ?? '';
            if (empty($semestre_id)) {
                sendResponse(false, null, 'ID de semestre requerido', 400);
            }
            
            // Obtener requisitos que tienen registros en bitácora para este semestre
            $stmt = $conn->prepare("
                SELECT DISTINCT r.ID_requisitos, r.requisitoTipo
                FROM requisitos r
                INNER JOIN bitacora_semestre b ON r.ID_requisitos = b.ID_requisito
                WHERE b.ID_semestre = ?
                ORDER BY r.requisitoTipo
            ");
            $stmt->bind_param("i", $semestre_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $requisitos = [];
            while ($row = $result->fetch_assoc()) {
                $requisitos[] = $row;
            }
            sendResponse(true, $requisitos);
        }
        
        elseif ($action === 'configurar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $semestre_id = $input['semestre_id'] ?? '';
            $docentes = $input['docentes'] ?? [];
            $requisitos = $input['requisitos'] ?? [];
            
            if (empty($semestre_id)) {
                sendResponse(false, null, 'ID de semestre requerido', 400);
            }
            
            // Iniciar transacción
            $conn->begin_transaction();
            
            try {
                // Eliminar configuración anterior del semestre
                $deleteStmt = $conn->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
                $deleteStmt->bind_param("i", $semestre_id);
                $deleteStmt->execute();
                
                // Insertar nuevas combinaciones docente-requisito
                if (!empty($docentes) && !empty($requisitos)) {
<<<<<<< Updated upstream
                    $insertStmt = $conn->prepare("INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito, cumple, estado, comentario) VALUES (?, ?, ?, 0, 'Incompleto', '')");
=======
                    $insertStmt = $conn->prepare("INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito, cumple, estado, comentario) VALUES (?, ?, ?, 0, 'Pendiente', '')");
>>>>>>> Stashed changes
                    
                    foreach ($docentes as $docente_id) {
                        foreach ($requisitos as $requisito_id) {
                            $insertStmt->bind_param("iii", $semestre_id, $docente_id, $requisito_id);
                            $insertStmt->execute();
                        }
                    }
                }
                
                $conn->commit();
                sendResponse(true, null, 'Configuración guardada exitosamente');
                
            } catch (Exception $e) {
                $conn->rollback();
                sendResponse(false, null, 'Error al guardar configuración: ' . $e->getMessage(), 500);
            }
        }
        
        elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? '';
            
            if (empty($id)) {
                sendResponse(false, null, 'ID requerido', 400);
            }
            
            // Construir la consulta dinámicamente solo con los campos que se envían
            $updates = [];
            $params = [];
            $types = '';
            
            if (isset($input['estado'])) {
                $updates[] = "estado = ?";
                $params[] = $input['estado'];
                $types .= 's';
            }
            
            if (isset($input['comentario'])) {
                $updates[] = "comentario = ?";
                $params[] = $input['comentario'];
                $types .= 's';
            }
            
            if (empty($updates)) {
                sendResponse(false, null, 'No hay campos para actualizar', 400);
            }
            
            $params[] = $id;
            $types .= 'i';
            
            $sql = "UPDATE bitacora_semestre SET " . implode(', ', $updates) . " WHERE ID = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                sendResponse(true, null, 'Bitácora actualizada exitosamente');
            } else {
                sendResponse(false, null, 'Error al actualizar bitácora', 500);
            }
        }
        
        else {
            sendResponse(false, null, 'Acción no válida para bitácora', 400);
        }
    } catch (Exception $e) {
        sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
    }
}

// Manejar reportes
elseif ($endpoint === 'reportes') {
    session_start();
    
    // Verificar autenticación
    if (!isset($_SESSION['user_logged_in']) || !$_SESSION['user_logged_in']) {
        sendResponse(false, null, 'No autorizado', 401);
    }
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($action === 'estadisticas' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            // Estadísticas generales
            $stats = [];
            
            // Total docentes
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM docentes");
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['totalDocentes'] = $result->fetch_assoc()['total'];
            
            // Total requisitos
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM requisitos");
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['totalRequisitos'] = $result->fetch_assoc()['total'];
            
            // Total semestres
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM semestres");
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['totalSemestres'] = $result->fetch_assoc()['total'];
            
            // Estadísticas de cumplimiento
            $stmt = $conn->prepare("
                SELECT 
                    estado,
                    COUNT(*) as cantidad
                FROM bitacora_semestre 
                GROUP BY estado
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $estadosCumplimiento = [
                'cumple' => 0,
                'noCumple' => 0,
                'incompleto' => 0
            ];
            
            $totalRegistros = 0;
            while ($row = $result->fetch_assoc()) {
                $totalRegistros += $row['cantidad'];
                switch ($row['estado']) {
                    case 'Cumple':
                        $estadosCumplimiento['cumple'] = $row['cantidad'];
                        break;
                    case 'No Cumple':
                        $estadosCumplimiento['noCumple'] = $row['cantidad'];
                        break;
                    case 'Incompleto':
                    case 'Pendiente':  // Tratar Pendiente como Incompleto para compatibilidad
                        $estadosCumplimiento['incompleto'] += $row['cantidad'];
                        break;
                }
            }
            
            // Calcular porcentajes
            if ($totalRegistros > 0) {
                $estadosCumplimiento['porcentajeCumple'] = round(($estadosCumplimiento['cumple'] / $totalRegistros) * 100, 2);
                $estadosCumplimiento['porcentajeNoCumple'] = round(($estadosCumplimiento['noCumple'] / $totalRegistros) * 100, 2);
                $estadosCumplimiento['porcentajeIncompleto'] = round(($estadosCumplimiento['incompleto'] / $totalRegistros) * 100, 2);
                $stats['porcentajeCumplimiento'] = $estadosCumplimiento['porcentajeCumple'];
            } else {
                $estadosCumplimiento['porcentajeCumple'] = 0;
                $estadosCumplimiento['porcentajeNoCumple'] = 0;
                $estadosCumplimiento['porcentajeIncompleto'] = 0;
                $stats['porcentajeCumplimiento'] = 0;
            }
            
            $stats['estadosCumplimiento'] = $estadosCumplimiento;
            $stats['totalRegistros'] = $totalRegistros;
            
            sendResponse(true, $stats);
        }
        
        elseif ($action === 'semestre' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $semestre_id = $_GET['semestre_id'] ?? '';
            $docentes = json_decode($_GET['docentes'] ?? '[]', true);
            $estados = json_decode($_GET['estados'] ?? '[]', true);
            
            if (empty($semestre_id)) {
                sendResponse(false, null, 'ID de semestre requerido', 400);
            }
            
            // Obtener información del semestre
            $stmt = $conn->prepare("SELECT ID_semestre, nomSem, fecha_inicio, fecha_fin FROM semestres WHERE ID_semestre = ?");
            $stmt->bind_param("i", $semestre_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $semestre = $result->fetch_assoc();
            
            if (!$semestre) {
                sendResponse(false, null, 'Semestre no encontrado', 404);
            }
            
            // Obtener docentes del semestre
            $docentes_sql = "
                SELECT DISTINCT d.ID_docente, d.nombre, d.AP_Paterno, d.AP_Materno, d.carrera
                FROM docentes d
                INNER JOIN bitacora_semestre b ON d.ID_docente = b.ID_docente
                WHERE b.ID_semestre = ?
            ";
            
            $docentes_params = [$semestre_id];
            $docentes_types = "i";
            
            if (!empty($docentes) && is_array($docentes)) {
                $placeholders = str_repeat('?,', count($docentes) - 1) . '?';
                $docentes_sql .= " AND d.ID_docente IN ($placeholders)";
                $docentes_params = array_merge($docentes_params, $docentes);
                $docentes_types .= str_repeat('i', count($docentes));
            }
            
            $docentes_sql .= " ORDER BY d.nombre, d.AP_Paterno";
            
            $stmt = $conn->prepare($docentes_sql);
            $stmt->bind_param($docentes_types, ...$docentes_params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $docentes_data = [];
            while ($row = $result->fetch_assoc()) {
                $docentes_data[] = $row;
            }
            
            // Obtener requisitos
            $stmt = $conn->prepare("SELECT ID_requisitos, requisitoTipo FROM requisitos ORDER BY requisitoTipo");
            $stmt->execute();
            $result = $stmt->get_result();
            
            $requisitos_data = [];
            while ($row = $result->fetch_assoc()) {
                $requisitos_data[] = $row;
            }
            
            // Obtener datos de bitácora
            $bitacora_sql = "
                SELECT 
                    b.ID_docente,
                    b.ID_requisito,
                    b.estado,
                    b.comentario
                FROM bitacora_semestre b
                WHERE b.ID_semestre = ?
            ";
            
            $bitacora_params = [$semestre_id];
            $bitacora_types = "i";
            
            if (!empty($docentes) && is_array($docentes)) {
                $placeholders = str_repeat('?,', count($docentes) - 1) . '?';
                $bitacora_sql .= " AND b.ID_docente IN ($placeholders)";
                $bitacora_params = array_merge($bitacora_params, $docentes);
                $bitacora_types .= str_repeat('i', count($docentes));
            }
            
            if (!empty($estados) && is_array($estados)) {
                $placeholders = str_repeat('?,', count($estados) - 1) . '?';
                $bitacora_sql .= " AND b.estado IN ($placeholders)";
                $bitacora_params = array_merge($bitacora_params, $estados);
                $bitacora_types .= str_repeat('s', count($estados));
            }
            
            $stmt = $conn->prepare($bitacora_sql);
            if (!empty($bitacora_params)) {
                $stmt->bind_param($bitacora_types, ...$bitacora_params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            
            $bitacora_data = [];
            while ($row = $result->fetch_assoc()) {
                $key = $row['ID_docente'] . '_' . $row['ID_requisito'];
                $bitacora_data[$key] = $row;
            }
            
            // Agregar datos de bitácora a cada docente
            foreach ($docentes_data as &$docente) {
                $docente['requisitos'] = [];
                foreach ($requisitos_data as $requisito) {
                    $key = $docente['ID_docente'] . '_' . $requisito['ID_requisitos'];
                    if (isset($bitacora_data[$key])) {
                        $docente['requisitos'][$requisito['ID_requisitos']] = $bitacora_data[$key];
                    } else {
                        $docente['requisitos'][$requisito['ID_requisitos']] = [
                            'estado' => 'Incompleto',
                            'comentario' => ''
                        ];
                    }
                }
            }
            
            $data = [
                'semestre' => $semestre,
                'docentes' => $docentes_data,
                'requisitos' => $requisitos_data,
                'total_docentes' => count($docentes_data),
                'total_requisitos' => count($requisitos_data)
            ];
            
            sendResponse(true, $data);
        }
        
        else {
            sendResponse(false, null, 'Acción no válida para reportes', 400);
        }
    } catch (Exception $e) {
        sendResponse(false, null, 'Error del servidor: ' . $e->getMessage(), 500);
    }
}

// Si no se reconoce el endpoint
else {
    sendResponse(false, null, 'Endpoint no encontrado', 404);
}
?>