<?php

require_once 'BaseController.php';
require_once __DIR__ . '/../config/Database.php';

class AuthController extends BaseController {
    
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * POST /api/v1/auth/login
     * Iniciar sesión
     */
    public function login() {
        try {
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            $this->validateRequired($data, array('usernameOrEmail', 'password'));
            
            $login = trim($data['usernameOrEmail']);
            $password = $data['password'];
            
            // Buscar usuario por email o nombre
            $stmt = $this->db->prepare("SELECT ID_user, password, isAdmin, name FROM users WHERE name = ? OR email = ?");
            $stmt->bind_param("ss", $login, $login);
            
            if (!$stmt->execute()) {
                Response::error("Error en la consulta de usuario");
            }
            
            $result = $stmt->get_result();
            
            if ($result->num_rows !== 1) {
                Response::unauthorized("Credenciales inválidas");
            }
            
            $user = $result->fetch_assoc();
            
            if (!password_verify($password, $user['password'])) {
                Response::unauthorized("Credenciales inválidas");
            }
            
            // Iniciar sesión
            session_start();
            $_SESSION['user_id'] = $user['ID_user'];
            $_SESSION['is_admin'] = $user['isAdmin'];
            $_SESSION['username'] = $user['name'];
            
            // Datos de respuesta (sin contraseña)
            $userData = array(
                'id' => $user['ID_user'],
                'name' => $user['name'],
                'isAdmin' => $user['isAdmin'],
                'session_id' => session_id()
            );
            
            Response::success($userData, "Inicio de sesión exitoso");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al iniciar sesión");
        }
    }
    
    /**
     * POST /api/v1/auth/logout
     * Cerrar sesión
     */
    public function logout() {
        try {
            session_start();
            
            // Destruir la sesión
            $_SESSION = array();
            
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            session_destroy();
            
            Response::success(null, "Sesión cerrada exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al cerrar sesión");
        }
    }
    
    /**
     * GET /api/v1/auth/me
     * Obtener información del usuario actual
     */
    public function me() {
        try {
            session_start();
            
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized("Sesión no válida");
            }
            
            $userId = $_SESSION['user_id'];
            
            // Obtener información actualizada del usuario
            $stmt = $this->db->prepare("SELECT ID_user, name, email, isAdmin FROM users WHERE ID_user = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            if ($result->num_rows !== 1) {
                Response::unauthorized("Usuario no encontrado");
            }
            
            $user = $result->fetch_assoc();
            
            $userData = array(
                'id' => $user['ID_user'],
                'name' => $user['name'],
                'email' => $user['email'],
                'isAdmin' => $user['isAdmin'],
                'session_id' => session_id()
            );
            
            Response::success($userData, "Información de usuario obtenida");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener información del usuario");
        }
    }
    
    /**
     * POST /api/v1/auth/check
     * Verificar si la sesión es válida
     */
    public function checkSession() {
        try {
            session_start();
            
            $isValid = isset($_SESSION['user_id']);
            $isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
            
            $response = array(
                'valid' => $isValid,
                'isAdmin' => $isAdmin,
                'user_id' => $isValid ? $_SESSION['user_id'] : null,
                'username' => $isValid ? $_SESSION['username'] : null
            );
            
            Response::success($response, "Estado de sesión verificado");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al verificar la sesión");
        }
    }
    
    /**
     * POST /api/v1/auth/change-password
     * Cambiar contraseña del usuario actual
     */
    public function changePassword() {
        try {
            session_start();
            
            if (!isset($_SESSION['user_id'])) {
                Response::unauthorized("Sesión no válida");
            }
            
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            $this->validateRequired($data, array('currentPassword', 'newPassword'));
            
            $userId = $_SESSION['user_id'];
            $currentPassword = $data['currentPassword'];
            $newPassword = $data['newPassword'];
            
            // Validar longitud de nueva contraseña
            if (strlen($newPassword) < 6) {
                Response::badRequest("La nueva contraseña debe tener al menos 6 caracteres");
            }
            
            // Verificar contraseña actual
            $stmt = $this->db->prepare("SELECT password FROM users WHERE ID_user = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows !== 1) {
                Response::error("Usuario no encontrado");
            }
            
            $user = $result->fetch_assoc();
            
            if (!password_verify($currentPassword, $user['password'])) {
                Response::badRequest("Contraseña actual incorrecta");
            }
            
            // Actualizar contraseña
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE ID_user = ?");
            $stmt->bind_param("si", $hashedPassword, $userId);
            
            if ($stmt->execute()) {
                Response::success(null, "Contraseña actualizada exitosamente");
            } else {
                Response::error("No se pudo actualizar la contraseña");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al cambiar la contraseña");
        }
    }
}

?>