<?php

class AuthMiddleware {
    
    public function handle() {
        session_start();
        
        // Verificar si existe sesión activa
        if (!isset($_SESSION['user_id'])) {
            Response::unauthorized("Sesión no válida. Debe iniciar sesión.");
        }
        
        // Verificar si el usuario es administrador para ciertas rutas
        $restrictedPaths = array(
            '/docentes',
            '/requisitos',
            '/semestres',
            '/bitacora'
        );
        
        $currentPath = $_SERVER['REQUEST_URI'];
        foreach ($restrictedPaths as $path) {
            if (strpos($currentPath, $path) !== false) {
                if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
                    Response::forbidden("Acceso denegado. Se requieren permisos de administrador.");
                }
                break;
            }
        }
    }
    
    public static function getCurrentUserId() {
        session_start();
        return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    }
    
    public static function isAdmin() {
        session_start();
        return isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
    }
}

?>