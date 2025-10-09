<?php

require_once 'BaseModel.php';

class SemestreModel extends BaseModel {
    
    protected $table = 'semestres';
    protected $primaryKey = 'ID_semestre';
    
    public function searchByName($searchTerm) {
        $searchTerm = "%{$searchTerm}%";
        $sql = "SELECT * FROM {$this->table} WHERE nomSem LIKE ? ORDER BY fecha_inicio DESC";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("s", $searchTerm);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function validateData($data, $isUpdate = false) {
        $errors = array();
        
        // Validar nombre del semestre
        if (!isset($data['nomSem']) || empty(trim($data['nomSem']))) {
            $errors[] = "El nombre del semestre es requerido";
        } elseif (strlen($data['nomSem']) > 70) {
            $errors[] = "El nombre del semestre no puede tener más de 70 caracteres";
        }
        
        // Validar fecha de inicio
        if (!isset($data['fecha_inicio']) || empty($data['fecha_inicio'])) {
            $errors[] = "La fecha de inicio es requerida";
        } elseif (!$this->isValidDate($data['fecha_inicio'])) {
            $errors[] = "La fecha de inicio no es válida";
        }
        
        // Validar fecha de fin
        if (!isset($data['fecha_fin']) || empty($data['fecha_fin'])) {
            $errors[] = "La fecha de fin es requerida";
        } elseif (!$this->isValidDate($data['fecha_fin'])) {
            $errors[] = "La fecha de fin no es válida";
        }
        
        // Validar que la fecha de fin sea mayor que la fecha de inicio
        if (isset($data['fecha_inicio']) && isset($data['fecha_fin'])) {
            if (strtotime($data['fecha_fin']) <= strtotime($data['fecha_inicio'])) {
                $errors[] = "La fecha de fin debe ser posterior a la fecha de inicio";
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors,
            'data' => $data
        );
    }
    
    private function isValidDate($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    public function create($data) {
        $validation = $this->validateData($data);
        
        if (!$validation['valid']) {
            throw new Exception("Datos inválidos: " . implode(', ', $validation['errors']));
        }
        
        return parent::create($validation['data']);
    }
    
    public function update($id, $data) {
        $validation = $this->validateData($data, true);
        
        if (!$validation['valid']) {
            throw new Exception("Datos inválidos: " . implode(', ', $validation['errors']));
        }
        
        return parent::update($id, $validation['data']);
    }
    
    public function delete($id) {
        // Verificar si el semestre tiene bitácoras asociadas
        $stmt = $this->connection->prepare("SELECT COUNT(*) as count FROM bitacora_semestre WHERE ID_semestre = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            // Eliminar primero las bitácoras asociadas
            $this->connection->begin_transaction();
            try {
                $stmt = $this->connection->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                
                $result = parent::delete($id);
                $this->connection->commit();
                return $result;
            } catch (Exception $e) {
                $this->connection->rollback();
                throw $e;
            }
        }
        
        return parent::delete($id);
    }
    
    public function getSemestreWithStats($id) {
        $sql = "SELECT s.*, 
                COUNT(DISTINCT bs.ID_docente) as total_docentes,
                COUNT(DISTINCT bs.ID_requisito) as total_requisitos,
                SUM(CASE WHEN bs.estado = 'Cumple' THEN 1 ELSE 0 END) as total_cumple,
                SUM(CASE WHEN bs.estado = 'No Cumple' THEN 1 ELSE 0 END) as total_no_cumple,
                SUM(CASE WHEN bs.estado = 'Incompleto' THEN 1 ELSE 0 END) as total_incompleto
                FROM semestres s
                LEFT JOIN bitacora_semestre bs ON s.ID_semestre = bs.ID_semestre
                WHERE s.ID_semestre = ?
                GROUP BY s.ID_semestre";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}

?>