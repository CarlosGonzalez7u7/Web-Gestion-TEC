<?php

require_once 'BaseModel.php';

class DocenteModel extends BaseModel {
    
    protected $table = 'docentes';
    protected $primaryKey = 'ID_docente';
    
    public function searchByName($searchTerm) {
        $searchTerm = "%{$searchTerm}%";
        $sql = "SELECT * FROM {$this->table} WHERE 
                nombre LIKE ? OR 
                AP_Paterno LIKE ? OR 
                AP_Materno LIKE ? OR 
                carrera LIKE ?";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("ssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function getDocentesBySemestre($semestreId) {
        $sql = "SELECT DISTINCT d.ID_docente, d.nombre, d.AP_Paterno, d.AP_Materno, d.carrera, d.fec_Regist
                FROM docentes d
                INNER JOIN bitacora_semestre bs ON d.ID_docente = bs.ID_docente
                WHERE bs.ID_semestre = ?";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function validateData($data, $isUpdate = false) {
        $errors = array();
        
        // Validar nombre
        if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
            $errors[] = "El nombre es requerido";
        } elseif (strlen($data['nombre']) > 70) {
            $errors[] = "El nombre no puede tener más de 70 caracteres";
        }
        
        // Validar apellido paterno
        if (!isset($data['AP_Paterno']) || empty(trim($data['AP_Paterno']))) {
            $errors[] = "El apellido paterno es requerido";
        } elseif (strlen($data['AP_Paterno']) > 50) {
            $errors[] = "El apellido paterno no puede tener más de 50 caracteres";
        }
        
        // Validar apellido materno
        if (!isset($data['AP_Materno']) || empty(trim($data['AP_Materno']))) {
            $errors[] = "El apellido materno es requerido";
        } elseif (strlen($data['AP_Materno']) > 50) {
            $errors[] = "El apellido materno no puede tener más de 50 caracteres";
        }
        
        // Validar carrera
        if (!isset($data['carrera']) || empty(trim($data['carrera']))) {
            $errors[] = "La carrera es requerida";
        } elseif (strlen($data['carrera']) > 100) {
            $errors[] = "La carrera no puede tener más de 100 caracteres";
        }
        
        // Validar fecha de registro (solo para nuevos registros)
        if (!$isUpdate) {
            if (!isset($data['fec_Regist']) || empty($data['fec_Regist'])) {
                $data['fec_Regist'] = date('Y-m-d'); // Fecha actual por defecto
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors,
            'data' => $data
        );
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
        // Verificar si el docente está asignado a algún semestre
        $stmt = $this->connection->prepare("SELECT COUNT(*) as count FROM bitacora_semestre WHERE ID_docente = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            throw new Exception("No se puede eliminar el docente porque está asignado a uno o más semestres");
        }
        
        return parent::delete($id);
    }
}

?>