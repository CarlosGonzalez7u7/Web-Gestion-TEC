<?php

require_once 'BaseController.php';
require_once __DIR__ . '/../models/RequisitoModel.php';

class RequisitoController extends BaseController {
    
    private $requisitoModel;
    
    public function __construct() {
        $this->requisitoModel = new RequisitoModel();
    }
    
    /**
     * GET /api/v1/requisitos
     * Obtener todos los requisitos con paginación y búsqueda
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            
            if (!empty($search)) {
                $requisitos = $this->requisitoModel->searchByType($search);
                $total = count($requisitos);
                
                // Aplicar paginación manual para búsquedas
                $requisitos = array_slice($requisitos, $pagination['offset'], $pagination['limit']);
            } else {
                $requisitos = $this->requisitoModel->findAll($pagination['limit'], $pagination['offset'], 'requisitoTipo ASC');
                $total = $this->requisitoModel->count();
            }
            
            $response = array(
                'requisitos' => $requisitos,
                'pagination' => array(
                    'page' => $pagination['page'],
                    'limit' => $pagination['limit'],
                    'total' => $total,
                    'pages' => ceil($total / $pagination['limit'])
                )
            );
            
            Response::success($response, "Requisitos obtenidos exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener los requisitos");
        }
    }
    
    /**
     * GET /api/v1/requisitos/{id}
     * Obtener un requisito específico
     */
    public function show($params) {
        try {
            $id = $this->validateId($params['id']);
            $requisito = $this->requisitoModel->findById($id);
            
            if (!$requisito) {
                Response::notFound("Requisito no encontrado");
            }
            
            Response::success($requisito, "Requisito obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener el requisito");
        }
    }
    
    /**
     * GET /api/v1/requisitos/{id}/stats
     * Obtener un requisito con estadísticas
     */
    public function showWithStats($params) {
        try {
            $id = $this->validateId($params['id']);
            $requisito = $this->requisitoModel->getRequisitoWithStats($id);
            
            if (!$requisito) {
                Response::notFound("Requisito no encontrado");
            }
            
            Response::success($requisito, "Requisito con estadísticas obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener las estadísticas del requisito");
        }
    }
    
    /**
     * POST /api/v1/requisitos
     * Crear un nuevo requisito
     */
    public function store() {
        try {
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            $this->validateRequired($data, array('requisitoTipo'));
            
            $id = $this->requisitoModel->create($data);
            $requisito = $this->requisitoModel->findById($id);
            
            Response::created($requisito, "Requisito creado exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al crear el requisito");
        }
    }
    
    /**
     * PUT /api/v1/requisitos/{id}
     * Actualizar un requisito existente
     */
    public function update($params) {
        try {
            $id = $this->validateId($params['id']);
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            // Verificar que el requisito existe
            $requisitoExistente = $this->requisitoModel->findById($id);
            if (!$requisitoExistente) {
                Response::notFound("Requisito no encontrado");
            }
            
            $this->validateRequired($data, array('requisitoTipo'));
            
            $success = $this->requisitoModel->update($id, $data);
            
            if ($success) {
                $requisito = $this->requisitoModel->findById($id);
                Response::success($requisito, "Requisito actualizado exitosamente");
            } else {
                Response::error("No se pudo actualizar el requisito");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar el requisito");
        }
    }
    
    /**
     * DELETE /api/v1/requisitos/{id}
     * Eliminar un requisito
     */
    public function destroy($params) {
        try {
            $id = $this->validateId($params['id']);
            
            // Verificar que el requisito existe
            $requisito = $this->requisitoModel->findById($id);
            if (!$requisito) {
                Response::notFound("Requisito no encontrado");
            }
            
            $success = $this->requisitoModel->delete($id);
            
            if ($success) {
                Response::success(null, "Requisito eliminado exitosamente");
            } else {
                Response::error("No se pudo eliminar el requisito");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al eliminar el requisito");
        }
    }
    
    /**
     * GET /api/v1/requisitos/search/{term}
     * Buscar requisitos por término
     */
    public function search($params) {
        try {
            $term = isset($params['term']) ? trim($params['term']) : '';
            
            if (empty($term)) {
                Response::badRequest("Término de búsqueda requerido");
            }
            
            $requisitos = $this->requisitoModel->searchByType($term);
            
            Response::success($requisitos, "Búsqueda completada exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error en la búsqueda de requisitos");
        }
    }
    
    /**
     * GET /api/v1/requisitos/semestre/{semestreId}
     * Obtener requisitos asignados a un semestre
     */
    public function getBySemestre($params) {
        try {
            $semestreId = $this->validateId($params['semestreId']);
            $requisitos = $this->requisitoModel->getRequisitosBySemestre($semestreId);
            
            Response::success($requisitos, "Requisitos del semestre obtenidos exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener requisitos del semestre");
        }
    }
}

?>