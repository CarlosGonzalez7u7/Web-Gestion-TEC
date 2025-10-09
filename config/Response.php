<?php

class Response {
    
    public static function json($data, $status_code = 200, $message = null) {
        http_response_code($status_code);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        $response = array(
            'success' => ($status_code >= 200 && $status_code < 300),
            'status_code' => $status_code,
            'data' => $data
        );
        
        if ($message !== null) {
            $response['message'] = $message;
        }
        
        if ($status_code >= 400) {
            $response['error'] = true;
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    public static function success($data = null, $message = "Operación exitosa", $status_code = 200) {
        self::json($data, $status_code, $message);
    }
    
    public static function error($message = "Error interno del servidor", $status_code = 500, $data = null) {
        self::json($data, $status_code, $message);
    }
    
    public static function badRequest($message = "Solicitud incorrecta", $data = null) {
        self::json($data, 400, $message);
    }
    
    public static function unauthorized($message = "No autorizado") {
        self::json(null, 401, $message);
    }
    
    public static function forbidden($message = "Acceso denegado") {
        self::json(null, 403, $message);
    }
    
    public static function notFound($message = "Recurso no encontrado") {
        self::json(null, 404, $message);
    }
    
    public static function methodNotAllowed($message = "Método no permitido") {
        self::json(null, 405, $message);
    }
    
    public static function created($data = null, $message = "Recurso creado exitosamente") {
        self::json($data, 201, $message);
    }
    
    public static function noContent($message = "Sin contenido") {
        self::json(null, 204, $message);
    }
}

?>