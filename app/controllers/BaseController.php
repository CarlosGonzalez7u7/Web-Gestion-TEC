<?php

require_once __DIR__ . '/../config/Response.php';

class BaseController {
    
    protected function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
    
    protected function getRequestData() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                return $_GET;
            case 'POST':
                return $_POST ?: $this->getJsonInput();
            case 'PUT':
            case 'DELETE':
                return $this->getJsonInput();
            default:
                return array();
        }
    }
    
    protected function validateRequired($data, $fields) {
        $missing = array();
        
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            Response::badRequest("Campos requeridos faltantes: " . implode(', ', $missing));
        }
    }
    
    protected function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map(array($this, 'sanitizeInput'), $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
    
    protected function validateId($id) {
        if (!is_numeric($id) || $id <= 0) {
            Response::badRequest("ID inválido");
        }
        return (int) $id;
    }
    
    protected function handleException($e, $defaultMessage = "Error interno del servidor") {
        error_log("API Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
        
        if ($e->getMessage() && strpos($e->getMessage(), 'Datos inválidos') === 0) {
            Response::badRequest($e->getMessage());
        } elseif ($e->getMessage() && strpos($e->getMessage(), 'No se puede eliminar') === 0) {
            Response::error($e->getMessage(), 409); // Conflict
        } else {
            Response::error($defaultMessage);
        }
    }
    
    protected function getPaginationParams() {
        $page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(100, max(1, (int) $_GET['limit'])) : 20;
        $offset = ($page - 1) * $limit;
        
        return array(
            'page' => $page,
            'limit' => $limit,
            'offset' => $offset
        );
    }
}

?>