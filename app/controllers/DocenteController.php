<?php

require_once 'BaseController.php';
require_once __DIR__ . '/../models/DocenteModel.php';

class DocenteController extends BaseController {
    
    private $docenteModel;
    
    public function __construct() {
        $this->docenteModel = new DocenteModel();
    }
    
    /**
     * GET /api/v1/docentes
     * Obtener todos los docentes con paginación y búsqueda
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            
            if (!empty($search)) {
                $docentes = $this->docenteModel->searchByName($search);
                $total = count($docentes);
                
                // Aplicar paginación manual para búsquedas
                $docentes = array_slice($docentes, $pagination['offset'], $pagination['limit']);
            } else {
                $docentes = $this->docenteModel->findAll($pagination['limit'], $pagination['offset'], 'AP_Paterno ASC');
                $total = $this->docenteModel->count();
            }
            
            $response = array(
                'docentes' => $docentes,
                'pagination' => array(
                    'page' => $pagination['page'],
                    'limit' => $pagination['limit'],
                    'total' => $total,
                    'pages' => ceil($total / $pagination['limit'])
                )
            );
            
            Response::success($response, "Docentes obtenidos exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener los docentes");
        }
    }
    
    /**
     * GET /api/v1/docentes/{id}
     * Obtener un docente específico
     */
    public function show($params) {
        try {
            $id = $this->validateId($params['id']);
            $docente = $this->docenteModel->findById($id);
            
            if (!$docente) {
                Response::notFound("Docente no encontrado");
            }
            
            Response::success($docente, "Docente obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener el docente");
        }
    }
    
    /**
     * POST /api/v1/docentes
     * Crear un nuevo docente
     */
    public function store() {
        try {
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            $this->validateRequired($data, array('nombre', 'AP_Paterno', 'AP_Materno', 'carrera'));
            
            // Agregar fecha de registro actual si no se proporciona
            if (!isset($data['fec_Regist']) || empty($data['fec_Regist'])) {
                $data['fec_Regist'] = date('Y-m-d');
            }
            
            $id = $this->docenteModel->create($data);
            $docente = $this->docenteModel->findById($id);
            
            Response::created($docente, "Docente creado exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al crear el docente");
        }
    }
    
    /**
     * PUT /api/v1/docentes/{id}
     * Actualizar un docente existente
     */
    public function update($params) {
        try {
            $id = $this->validateId($params['id']);
            $data = $this->getRequestData();
            $data = $this->sanitizeInput($data);
            
            // Verificar que el docente existe
            $docenteExistente = $this->docenteModel->findById($id);
            if (!$docenteExistente) {
                Response::notFound("Docente no encontrado");
            }
            
            $this->validateRequired($data, array('nombre', 'AP_Paterno', 'AP_Materno', 'carrera'));
            
            $success = $this->docenteModel->update($id, $data);
            
            if ($success) {
                $docente = $this->docenteModel->findById($id);
                Response::success($docente, "Docente actualizado exitosamente");
            } else {
                Response::error("No se pudo actualizar el docente");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar el docente");
        }
    }
    
    /**
     * DELETE /api/v1/docentes/{id}
     * Eliminar un docente
     */
    public function destroy($params) {
        try {
            $id = $this->validateId($params['id']);
            
            // Verificar que el docente existe
            $docente = $this->docenteModel->findById($id);
            if (!$docente) {
                Response::notFound("Docente no encontrado");
            }
            
            $success = $this->docenteModel->delete($id);
            
            if ($success) {
                Response::success(null, "Docente eliminado exitosamente");
            } else {
                Response::error("No se pudo eliminar el docente");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al eliminar el docente");
        }
    }
    
    /**
     * GET /api/v1/docentes/search/{term}
     * Buscar docentes por término
     */
    public function search($params) {
        try {
            $term = isset($params['term']) ? trim($params['term']) : '';
            
            if (empty($term)) {
                Response::badRequest("Término de búsqueda requerido");
            }
            
            $docentes = $this->docenteModel->searchByName($term);
            
            Response::success($docentes, "Búsqueda completada exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error en la búsqueda de docentes");
        }
    }
    
    /**
     * GET /api/v1/docentes/semestre/{semestreId}
     * Obtener docentes asignados a un semestre
     */
    public function getBySemestre($params) {
        try {
            $semestreId = $this->validateId($params['semestreId']);
            $docentes = $this->docenteModel->getDocentesBySemestre($semestreId);
            
            Response::success($docentes, "Docentes del semestre obtenidos exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener docentes del semestre");
        }
    }
}

?>