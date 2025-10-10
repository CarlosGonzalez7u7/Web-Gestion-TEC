<?php

require_once 'BaseModel.php';

class RequisitoModel extends BaseModel {
    
    protected $table = 'requisitos';
    protected $primaryKey = 'ID_requisitos';
    
    public function searchByType($searchTerm) {
        $searchTerm = "%{$searchTerm}%";
        $sql = "SELECT * FROM {$this->table} WHERE requisitoTipo LIKE ? ORDER BY requisitoTipo ASC";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("s", $searchTerm);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function getRequisitosBySemestre($semestreId) {
        $sql = "SELECT DISTINCT r.ID_requisitos, r.requisitoTipo
                FROM requisitos r
                INNER JOIN bitacora_semestre bs ON r.ID_requisitos = bs.ID_requisito
                WHERE bs.ID_semestre = ?
                ORDER BY r.requisitoTipo ASC";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function validateData($data, $isUpdate = false) {
        $errors = array();
        
        // Validar tipo de requisito
        if (!isset($data['requisitoTipo']) || empty(trim($data['requisitoTipo']))) {
            $errors[] = "El tipo de requisito es requerido";
        } elseif (strlen($data['requisitoTipo']) > 100) {
            $errors[] = "El tipo de requisito no puede tener más de 100 caracteres";
        } else {
            // Verificar que el tipo de requisito no esté duplicado
            $stmt = $this->connection->prepare("SELECT ID_requisitos FROM {$this->table} WHERE requisitoTipo = ?");
            $stmt->bind_param("s", $data['requisitoTipo']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $existingRecord = $result->fetch_assoc();
                // Si es actualización, verificar que no sea el mismo registro
                if (!$isUpdate || (isset($data['ID_requisitos']) && $existingRecord['ID_requisitos'] != $data['ID_requisitos'])) {
                    $errors[] = "Ya existe un requisito con este tipo";
                }
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
        $data['ID_requisitos'] = $id; // Agregar ID para validación de duplicados
        $validation = $this->validateData($data, true);
        
        if (!$validation['valid']) {
            throw new Exception("Datos inválidos: " . implode(', ', $validation['errors']));
        }
        
        unset($validation['data']['ID_requisitos']); // Remover ID antes de actualizar
        return parent::update($id, $validation['data']);
    }
    
    public function delete($id) {
        // Verificar si el requisito está asignado a algún semestre
        $stmt = $this->connection->prepare("SELECT COUNT(*) as count FROM bitacora_semestre WHERE ID_requisito = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            throw new Exception("No se puede eliminar el requisito porque está asignado a uno o más semestres");
        }
        
        return parent::delete($id);
    }
    
    public function getRequisitoWithStats($id) {
        $sql = "SELECT r.*, 
                COUNT(bs.ID) as total_asignaciones,
                SUM(CASE WHEN bs.estado = 'Cumple' THEN 1 ELSE 0 END) as total_cumple,
                SUM(CASE WHEN bs.estado = 'No Cumple' THEN 1 ELSE 0 END) as total_no_cumple,
                SUM(CASE WHEN bs.estado = 'Incompleto' THEN 1 ELSE 0 END) as total_incompleto
                FROM requisitos r
                LEFT JOIN bitacora_semestre bs ON r.ID_requisitos = bs.ID_requisito
                WHERE r.ID_requisitos = ?
                GROUP BY r.ID_requisitos";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}

?>