<?php

class Router {
    private $routes = array();
    private $middlewares = array();
    
    public function addRoute($method, $path, $controller, $action, $middlewares = array()) {
        $this->routes[] = array(
            'method' => strtoupper($method),
            'path' => $path,
            'controller' => $controller,
            'action' => $action,
            'middlewares' => $middlewares
        );
    }
    
    public function get($path, $controller, $action, $middlewares = array()) {
        $this->addRoute('GET', $path, $controller, $action, $middlewares);
    }
    
    public function post($path, $controller, $action, $middlewares = array()) {
        $this->addRoute('POST', $path, $controller, $action, $middlewares);
    }
    
    public function put($path, $controller, $action, $middlewares = array()) {
        $this->addRoute('PUT', $path, $controller, $action, $middlewares);
    }
    
    public function delete($path, $controller, $action, $middlewares = array()) {
        $this->addRoute('DELETE', $path, $controller, $action, $middlewares);
    }
    
    public function addMiddleware($middleware) {
        $this->middlewares[] = $middleware;
    }
    
    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $this->getPath();
        
        // Manejar OPTIONS para CORS
        if ($method === 'OPTIONS') {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            http_response_code(200);
            exit();
        }
        
        foreach ($this->routes as $route) {
            $pattern = $this->convertPathToRegex($route['path']);
            
            if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                // Extraer parámetros de la URL
                $params = $this->extractParams($route['path'], $path);
                
                // Ejecutar middlewares globales
                foreach ($this->middlewares as $middleware) {
                    $this->executeMiddleware($middleware);
                }
                
                // Ejecutar middlewares específicos de la ruta
                foreach ($route['middlewares'] as $middleware) {
                    $this->executeMiddleware($middleware);
                }
                
                // Ejecutar controlador
                $this->executeController($route['controller'], $route['action'], $params);
                return;
            }
        }
        
        // Ruta no encontrada
        Response::notFound("Ruta no encontrada");
    }
    
    private function getPath() {
        $path = $_SERVER['REQUEST_URI'];
        
        // Remover query string
        if (($pos = strpos($path, '?')) !== false) {
            $path = substr($path, 0, $pos);
        }
        
        // Remover el prefijo de la API si existe
        $basePath = '/Web-Gestion-TEC/api/v1';
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        return $path ?: '/';
    }
    
    private function convertPathToRegex($path) {
        // Convertir parámetros como {id} a regex
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $path);
        return '#^' . $pattern . '$#';
    }
    
    private function extractParams($routePath, $actualPath) {
        $params = array();
        $routeParts = explode('/', trim($routePath, '/'));
        $pathParts = explode('/', trim($actualPath, '/'));
        
        for ($i = 0; $i < count($routeParts); $i++) {
            if (isset($routeParts[$i]) && strpos($routeParts[$i], '{') === 0) {
                $paramName = trim($routeParts[$i], '{}');
                $params[$paramName] = isset($pathParts[$i]) ? $pathParts[$i] : null;
            }
        }
        
        return $params;
    }
    
    private function executeMiddleware($middleware) {
        if (is_string($middleware)) {
            require_once __DIR__ . '/../middleware/' . $middleware . '.php';
            $middlewareClass = new $middleware();
            $middlewareClass->handle();
        } elseif (is_callable($middleware)) {
            $middleware();
        }
    }
    
    private function executeController($controller, $action, $params = array()) {
        require_once __DIR__ . '/../controllers/' . $controller . '.php';
        
        $controllerInstance = new $controller();
        
        if (!method_exists($controllerInstance, $action)) {
            Response::error("Método {$action} no encontrado en el controlador {$controller}");
        }
        
        // Pasar parámetros al método del controlador
        call_user_func_array(array($controllerInstance, $action), array($params));
    }
}

?>