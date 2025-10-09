<?php

// Configuración de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivos necesarios
require_once __DIR__ . '/config/Router.php';
require_once __DIR__ . '/config/Response.php';

// Función de autoload para controladores y modelos
function autoloadClasses($className) {
    $directories = array(
        __DIR__ . '/controllers/',
        __DIR__ . '/models/',
        __DIR__ . '/config/',
        __DIR__ . '/middleware/'
    );
    
    foreach ($directories as $directory) {
        $file = $directory . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
}

spl_autoload_register('autoloadClasses');

try {
    // Crear instancia del router
    $router = new Router();
    
    // ===============================
    // RUTAS DE AUTENTICACIÓN
    // ===============================
    
    $router->post('/auth/login', 'AuthController', 'login');
    $router->post('/auth/logout', 'AuthController', 'logout', array('AuthMiddleware'));
    $router->get('/auth/me', 'AuthController', 'me', array('AuthMiddleware'));
    $router->post('/auth/check', 'AuthController', 'checkSession');
    $router->post('/auth/change-password', 'AuthController', 'changePassword', array('AuthMiddleware'));
    
    // ===============================
    // RUTAS DE DOCENTES
    // ===============================
    
    $router->get('/docentes', 'DocenteController', 'index', array('AuthMiddleware'));
    $router->get('/docentes/{id}', 'DocenteController', 'show', array('AuthMiddleware'));
    $router->post('/docentes', 'DocenteController', 'store', array('AuthMiddleware'));
    $router->put('/docentes/{id}', 'DocenteController', 'update', array('AuthMiddleware'));
    $router->delete('/docentes/{id}', 'DocenteController', 'destroy', array('AuthMiddleware'));
    $router->get('/docentes/search/{term}', 'DocenteController', 'search', array('AuthMiddleware'));
    $router->get('/docentes/semestre/{semestreId}', 'DocenteController', 'getBySemestre', array('AuthMiddleware'));
    
    // ===============================
    // RUTAS DE SEMESTRES
    // ===============================
    
    $router->get('/semestres', 'SemestreController', 'index', array('AuthMiddleware'));
    $router->get('/semestres/{id}', 'SemestreController', 'show', array('AuthMiddleware'));
    $router->get('/semestres/{id}/stats', 'SemestreController', 'showWithStats', array('AuthMiddleware'));
    $router->post('/semestres', 'SemestreController', 'store', array('AuthMiddleware'));
    $router->put('/semestres/{id}', 'SemestreController', 'update', array('AuthMiddleware'));
    $router->delete('/semestres/{id}', 'SemestreController', 'destroy', array('AuthMiddleware'));
    $router->get('/semestres/search/{term}', 'SemestreController', 'search', array('AuthMiddleware'));
    
    // ===============================
    // RUTAS DE REQUISITOS
    // ===============================
    
    $router->get('/requisitos', 'RequisitoController', 'index', array('AuthMiddleware'));
    $router->get('/requisitos/{id}', 'RequisitoController', 'show', array('AuthMiddleware'));
    $router->get('/requisitos/{id}/stats', 'RequisitoController', 'showWithStats', array('AuthMiddleware'));
    $router->post('/requisitos', 'RequisitoController', 'store', array('AuthMiddleware'));
    $router->put('/requisitos/{id}', 'RequisitoController', 'update', array('AuthMiddleware'));
    $router->delete('/requisitos/{id}', 'RequisitoController', 'destroy', array('AuthMiddleware'));
    $router->get('/requisitos/search/{term}', 'RequisitoController', 'search', array('AuthMiddleware'));
    $router->get('/requisitos/semestre/{semestreId}', 'RequisitoController', 'getBySemestre', array('AuthMiddleware'));
    
    // ===============================
    // RUTAS DE BITÁCORA
    // ===============================
    
    $router->get('/bitacora/semestre/{semestreId}', 'BitacoraController', 'getBySemestre', array('AuthMiddleware'));
    $router->get('/bitacora/semestre/{semestreId}/detalle', 'BitacoraController', 'getDetalleBySemestre', array('AuthMiddleware'));
    $router->get('/bitacora/estadisticas/{semestreId}', 'BitacoraController', 'getEstadisticas', array('AuthMiddleware'));
    $router->post('/bitacora/configurar', 'BitacoraController', 'configurarSemestre', array('AuthMiddleware'));
    $router->put('/bitacora/actualizar-estado', 'BitacoraController', 'actualizarEstado', array('AuthMiddleware'));
    $router->put('/bitacora/actualizar-docentes', 'BitacoraController', 'actualizarDocentes', array('AuthMiddleware'));
    $router->post('/bitacora/actualizar-comentario', 'BitacoraController', 'actualizarComentario', array('AuthMiddleware'));
    
    // ===============================
    // RUTA DE INFORMACIÓN DE LA API
    // ===============================
    
    $router->get('/', function() {
        $info = array(
            'name' => 'API Sistema Académico',
            'version' => '1.0.0',
            'description' => 'API REST para el Sistema de Gestión de Bitácoras y Docentes',
            'endpoints' => array(
                'auth' => array(
                    'POST /auth/login' => 'Iniciar sesión',
                    'POST /auth/logout' => 'Cerrar sesión',
                    'GET /auth/me' => 'Información del usuario actual',
                    'POST /auth/check' => 'Verificar estado de sesión',
                    'POST /auth/change-password' => 'Cambiar contraseña'
                ),
                'docentes' => array(
                    'GET /docentes' => 'Listar docentes (con paginación)',
                    'GET /docentes/{id}' => 'Obtener docente específico',
                    'POST /docentes' => 'Crear nuevo docente',
                    'PUT /docentes/{id}' => 'Actualizar docente',
                    'DELETE /docentes/{id}' => 'Eliminar docente',
                    'GET /docentes/search/{term}' => 'Buscar docentes',
                    'GET /docentes/semestre/{semestreId}' => 'Docentes de un semestre'
                ),
                'semestres' => array(
                    'GET /semestres' => 'Listar semestres (con paginación)',
                    'GET /semestres/{id}' => 'Obtener semestre específico',
                    'GET /semestres/{id}/stats' => 'Obtener semestre con estadísticas',
                    'POST /semestres' => 'Crear nuevo semestre',
                    'PUT /semestres/{id}' => 'Actualizar semestre',
                    'DELETE /semestres/{id}' => 'Eliminar semestre',
                    'GET /semestres/search/{term}' => 'Buscar semestres'
                ),
                'requisitos' => array(
                    'GET /requisitos' => 'Listar requisitos (con paginación)',
                    'GET /requisitos/{id}' => 'Obtener requisito específico',
                    'GET /requisitos/{id}/stats' => 'Obtener requisito con estadísticas',
                    'POST /requisitos' => 'Crear nuevo requisito',
                    'PUT /requisitos/{id}' => 'Actualizar requisito',
                    'DELETE /requisitos/{id}' => 'Eliminar requisito',
                    'GET /requisitos/search/{term}' => 'Buscar requisitos',
                    'GET /requisitos/semestre/{semestreId}' => 'Requisitos de un semestre'
                ),
                'bitacora' => array(
                    'GET /bitacora/semestre/{semestreId}' => 'Obtener bitácora de un semestre',
                    'GET /bitacora/semestre/{semestreId}/detalle' => 'Obtener detalle completo de bitácora',
                    'GET /bitacora/estadisticas/{semestreId}' => 'Obtener estadísticas de un semestre',
                    'POST /bitacora/configurar' => 'Configurar docentes y requisitos de un semestre',
                    'PUT /bitacora/actualizar-estado' => 'Actualizar estado de cumplimiento',
                    'PUT /bitacora/actualizar-docentes' => 'Actualizar docentes de un semestre',
                    'POST /bitacora/actualizar-comentario' => 'Actualizar comentario específico'
                )
            ),
            'examples' => array(
                'pagination' => '?page=1&limit=10',
                'search' => '?search=termino',
                'auth_header' => 'Usar sesiones PHP (cookies)'
            ),
            'status_codes' => array(
                '200' => 'OK - Éxito',
                '201' => 'Created - Recurso creado',
                '400' => 'Bad Request - Solicitud incorrecta',
                '401' => 'Unauthorized - No autorizado',
                '403' => 'Forbidden - Acceso denegado',
                '404' => 'Not Found - Recurso no encontrado',
                '405' => 'Method Not Allowed - Método no permitido',
                '409' => 'Conflict - Conflicto (ej: no se puede eliminar)',
                '500' => 'Internal Server Error - Error interno'
            )
        );
        
        Response::success($info, 'API Sistema Académico - Información general');
    });
    
    // Ejecutar el router
    $router->dispatch();
    
} catch (Exception $e) {
    error_log("API Fatal Error: " . $e->getMessage());
    Response::error("Error interno del servidor", 500);
}

?>