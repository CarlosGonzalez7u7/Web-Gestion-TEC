<?php

require_once 'BaseController.php';
require_once __DIR__ . '/../models/SemestreModel.php';

class SemestreController extends BaseController {
    
    private $semestreModel;
    
    public function __construct() {
        $this->semestreModel = new SemestreModel();
    }
    
    /**
     * GET /api/v1/semestres
     * Obtener todos los semestres con paginación y búsqueda
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            
            if (!empty($search)) {
                $semestres = $this->semestreModel->searchByName($search);
                $total = count($semestres);
                
                // Aplicar paginación manual para búsquedas
                $semestres = array_slice($semestres, $pagination['offset'], $pagination['limit']);
            } else {
                $semestres = $this->semestreModel->findAll($pagination['limit'], $pagination['offset'], 'fecha_inicio DESC');
                $total = $this->semestreModel->count();
            }
            
            $response = array(
                'semestres' => $semestres,
                'pagination' => array(
                    'page' => $pagination['page'],
                    'limit' => $pagination['limit'],
                    'total' => $total,
                    'pages' => ceil($total / $pagination['limit'])
                )
            );
            
            Response::success($response, "Semestres obtenidos exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener los semestres");
        }
    }
    
    /**
     * GET /api/v1/semestres/{id}
     * Obtener un semestre específico
     */
    public function show($params) {
        try {
            $id = $this->validateId($params['id']);
            $semestre = $this->semestreModel->findById($id);
            
            if (!$semestre) {
                Response::notFound("Semestre no encontrado");
            }
            
            Response::success($semestre, "Semestre obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener el semestre");
        }
    }
    
    /**
     * GET /api/v1/semestres/{id}/stats
     * Obtener un semestre con estadísticas
     */
    public function showWithStats($params) {
        try {
            $id = $this->validateId($params['id']);
            $semestre = $this->semestreModel->getSemestreWithStats($id);
            
            if (!$semestre) {
                Response::notFound("Semestre no encontrado");
            }
            
            Response::success($semestre, "Semestre con estadísticas obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener las estadísticas del semestre");
        }
    }
    
    /**
     * POST /api/v1/semestres
     * Crear un nuevo semestre
     */
    public function store() {
        try {
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            $this->validateRequired($data, array('nomSem', 'fecha_inicio', 'fecha_fin'));
            
            $id = $this->semestreModel->create($data);
            $semestre = $this->semestreModel->findById($id);
            
            Response::created($semestre, "Semestre creado exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al crear el semestre");
        }
    }
    
    /**
     * PUT /api/v1/semestres/{id}
     * Actualizar un semestre existente
     */
    public function update($params) {
        try {
            $id = $this->validateId($params['id']);
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            // Verificar que el semestre existe
            $semestreExistente = $this->semestreModel->findById($id);
            if (!$semestreExistente) {
                Response::notFound("Semestre no encontrado");
            }
            
            $this->validateRequired($data, array('nomSem', 'fecha_inicio', 'fecha_fin'));
            
            $success = $this->semestreModel->update($id, $data);
            
            if ($success) {
                $semestre = $this->semestreModel->findById($id);
                Response::success($semestre, "Semestre actualizado exitosamente");
            } else {
                Response::error("No se pudo actualizar el semestre");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar el semestre");
        }
    }
    
    /**
     * DELETE /api/v1/semestres/{id}
     * Eliminar un semestre
     */
    public function destroy($params) {
        try {
            $id = $this->validateId($params['id']);
            
            // Verificar que el semestre existe
            $semestre = $this->semestreModel->findById($id);
            if (!$semestre) {
                Response::notFound("Semestre no encontrado");
            }
            
            $success = $this->semestreModel->delete($id);
            
            if ($success) {
                Response::success(null, "Semestre eliminado exitosamente");
            } else {
                Response::error("No se pudo eliminar el semestre");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al eliminar el semestre");
        }
    }
    
    /**
     * GET /api/v1/semestres/search/{term}
     * Buscar semestres por término
     */
    public function search($params) {
        try {
            $term = isset($params['term']) ? trim($params['term']) : '';
            
            if (empty($term)) {
                Response::badRequest("Término de búsqueda requerido");
            }
            
            $semestres = $this->semestreModel->searchByName($term);
            
            Response::success($semestres, "Búsqueda completada exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error en la búsqueda de semestres");
        }
    }
}

?>