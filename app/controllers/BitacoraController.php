<?php

require_once 'BaseController.php';
require_once __DIR__ . '/../models/BitacoraModel.php';

class BitacoraController extends BaseController {
    
    private $bitacoraModel;
    
    public function __construct() {
        $this->bitacoraModel = new BitacoraModel();
    }
    
    /**
     * GET /api/v1/bitacora/semestre/{semestreId}
     * Obtener la bitácora completa de un semestre
     */
    public function getBySemestre($params) {
        try {
            $semestreId = $this->validateId($params['semestreId']);
            $bitacora = $this->bitacoraModel->getDocentesAndRequisitosBySemestre($semestreId);
            
            Response::success($bitacora, "Bitácora del semestre obtenida exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener la bitácora del semestre");
        }
    }
    
    /**
     * GET /api/v1/bitacora/semestre/{semestreId}/detalle
     * Obtener el detalle completo de la bitácora de un semestre
     */
    public function getDetalleBySemestre($params) {
        try {
            $semestreId = $this->validateId($params['semestreId']);
            $detalle = $this->bitacoraModel->getBitacoraBySemestre($semestreId);
            
            Response::success($detalle, "Detalle de bitácora obtenido exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener el detalle de la bitácora");
        }
    }
    
    /**
     * POST /api/v1/bitacora/configurar
     * Configurar docentes y requisitos de un semestre
     */
    public function configurarSemestre() {
        try {
            $data = $this->getRequestData();
            
            $this->validateRequired($data, array('ID_semestre', 'docentes', 'requisitos'));
            
            $semestreId = $this->validateId($data['ID_semestre']);
            
            // Validar arrays
            if (!is_array($data['docentes']) || !is_array($data['requisitos'])) {
                Response::badRequest("Docentes y requisitos deben ser arrays");
            }
            
            if (empty($data['docentes']) || empty($data['requisitos'])) {
                Response::badRequest("Debe proporcionar al menos un docente y un requisito");
            }
            
            // Validar que los IDs sean numéricos
            foreach ($data['docentes'] as $docenteId) {
                if (!is_numeric($docenteId) || $docenteId <= 0) {
                    Response::badRequest("IDs de docentes inválidos");
                }
            }
            
            foreach ($data['requisitos'] as $requisitoId) {
                if (!is_numeric($requisitoId) || $requisitoId <= 0) {
                    Response::badRequest("IDs de requisitos inválidos");
                }
            }
            
            $success = $this->bitacoraModel->configurarSemestre($semestreId, $data['docentes'], $data['requisitos']);
            
            if ($success) {
                Response::success(null, "Semestre configurado exitosamente");
            } else {
                Response::error("No se pudo configurar el semestre");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al configurar el semestre");
        }
    }
    
    /**
     * PUT /api/v1/bitacora/actualizar-estado
     * Actualizar el estado de un requisito para un docente en un semestre
     */
    public function actualizarEstado() {
        try {
            $data = $this->getRequestData();
            
            $this->validateRequired($data, array('ID_semestre', 'ID_docente', 'ID_requisito', 'estado'));
            
            $semestreId = $this->validateId($data['ID_semestre']);
            $docenteId = $this->validateId($data['ID_docente']);
            $requisitoId = $this->validateId($data['ID_requisito']);
            $estado = trim($data['estado']);
            $comentario = isset($data['comentario']) ? trim($data['comentario']) : '';
            
            $success = $this->bitacoraModel->actualizarEstado($semestreId, $docenteId, $requisitoId, $estado, $comentario);
            
            if ($success) {
                Response::success(null, "Estado actualizado exitosamente");
            } else {
                Response::error("No se pudo actualizar el estado");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar el estado");
        }
    }
    
    /**
     * PUT /api/v1/bitacora/actualizar-docentes
     * Actualizar los docentes asignados a un semestre
     */
    public function actualizarDocentes() {
        try {
            $data = $this->getRequestData();
            
            $this->validateRequired($data, array('ID_semestre', 'docentes', 'requisitos'));
            
            $semestreId = $this->validateId($data['ID_semestre']);
            
            // Validar arrays
            if (!is_array($data['docentes']) || !is_array($data['requisitos'])) {
                Response::badRequest("Docentes y requisitos deben ser arrays");
            }
            
            if (empty($data['docentes']) || empty($data['requisitos'])) {
                Response::badRequest("Debe proporcionar al menos un docente y un requisito");
            }
            
            $success = $this->bitacoraModel->actualizarDocentesSemestre($semestreId, $data['docentes'], $data['requisitos']);
            
            if ($success) {
                Response::success(null, "Docentes del semestre actualizados exitosamente");
            } else {
                Response::error("No se pudieron actualizar los docentes del semestre");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar los docentes del semestre");
        }
    }
    
    /**
     * GET /api/v1/bitacora/estadisticas/{semestreId}
     * Obtener estadísticas de cumplimiento de un semestre
     */
    public function getEstadisticas($params) {
        try {
            $semestreId = $this->validateId($params['semestreId']);
            $estadisticas = $this->bitacoraModel->getEstadisticasSemestre($semestreId);
            
            if (!$estadisticas) {
                Response::notFound("No se encontraron estadísticas para este semestre");
            }
            
            Response::success($estadisticas, "Estadísticas obtenidas exitosamente");
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al obtener las estadísticas");
        }
    }
    
    /**
     * POST /api/v1/bitacora/actualizar-comentario
     * Actualizar solo el comentario de un registro específico
     */
    public function actualizarComentario() {
        try {
            $data = $this->getRequestData();
            
            $this->validateRequired($data, array('ID_semestre', 'ID_docente', 'ID_requisito', 'comentario'));
            
            $semestreId = $this->validateId($data['ID_semestre']);
            $docenteId = $this->validateId($data['ID_docente']);
            $requisitoId = $this->validateId($data['ID_requisito']);
            $comentario = trim($data['comentario']);
            
            // Obtener el estado actual
            $stmt = $this->bitacoraModel->getConnection()->prepare(
                "SELECT estado FROM bitacora_semestre WHERE ID_semestre = ? AND ID_docente = ? AND ID_requisito = ?"
            );
            $stmt->bind_param("iii", $semestreId, $docenteId, $requisitoId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                Response::notFound("Registro no encontrado en la bitácora");
            }
            
            $row = $result->fetch_assoc();
            $estadoActual = $row['estado'];
            
            // Actualizar solo el comentario manteniendo el estado actual
            $success = $this->bitacoraModel->actualizarEstado($semestreId, $docenteId, $requisitoId, $estadoActual, $comentario);
            
            if ($success) {
                Response::success(null, "Comentario actualizado exitosamente");
            } else {
                Response::error("No se pudo actualizar el comentario");
            }
            
        } catch (Exception $e) {
            $this->handleException($e, "Error al actualizar el comentario");
        }
    }
}

?>