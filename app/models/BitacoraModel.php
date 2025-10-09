<?php

require_once 'BaseModel.php';

class BitacoraModel extends BaseModel {
    
    protected $table = 'bitacora_semestre';
    protected $primaryKey = 'ID';
    
    public function getBitacoraBySemestre($semestreId) {
        $sql = "SELECT 
                    bs.ID,
                    bs.ID_semestre,
                    bs.ID_docente,
                    bs.ID_requisito,
                    bs.cumple,
                    bs.estado,
                    bs.comentario,
                    d.nombre,
                    d.AP_Paterno,
                    d.AP_Materno,
                    r.requisitoTipo,
                    s.nomSem
                FROM bitacora_semestre bs
                INNER JOIN docentes d ON bs.ID_docente = d.ID_docente
                INNER JOIN requisitos r ON bs.ID_requisito = r.ID_requisitos
                INNER JOIN semestres s ON bs.ID_semestre = s.ID_semestre
                WHERE bs.ID_semestre = ?
                ORDER BY d.AP_Paterno, d.nombre, r.requisitoTipo";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function getDocentesAndRequisitosBySemestre($semestreId) {
        // Obtener docentes del semestre
        $sqlDocentes = "SELECT DISTINCT d.ID_docente, d.nombre, d.AP_Paterno, d.AP_Materno
                        FROM docentes d
                        INNER JOIN bitacora_semestre bs ON d.ID_docente = bs.ID_docente
                        WHERE bs.ID_semestre = ?
                        ORDER BY d.AP_Paterno, d.nombre";
        
        $stmt = $this->connection->prepare($sqlDocentes);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        $docentes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        // Obtener requisitos del semestre
        $sqlRequisitos = "SELECT DISTINCT r.ID_requisitos, r.requisitoTipo
                          FROM requisitos r
                          INNER JOIN bitacora_semestre bs ON r.ID_requisitos = bs.ID_requisito
                          WHERE bs.ID_semestre = ?
                          ORDER BY r.requisitoTipo";
        
        $stmt = $this->connection->prepare($sqlRequisitos);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        $requisitos = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        // Obtener estados
        $sqlEstados = "SELECT ID_docente, ID_requisito, estado, comentario
                       FROM bitacora_semestre
                       WHERE ID_semestre = ?";
        
        $stmt = $this->connection->prepare($sqlEstados);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        $estadosRaw = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        // Organizar estados por clave docente_requisito
        $estados = array();
        foreach ($estadosRaw as $row) {
            $key = $row['ID_docente'] . '_' . $row['ID_requisito'];
            $estados[$key] = array(
                'estado' => $row['estado'],
                'comentario' => $row['comentario']
            );
        }
        
        return array(
            'docentes' => $docentes,
            'requisitos' => $requisitos,
            'estados' => $estados
        );
    }
    
    public function actualizarEstado($semestreId, $docenteId, $requisitoId, $estado, $comentario = '') {
        // Validar estado
        $estadosValidos = array('Cumple', 'No Cumple', 'Incompleto');
        if (!in_array($estado, $estadosValidos)) {
            throw new Exception("Estado inválido. Los estados válidos son: " . implode(', ', $estadosValidos));
        }
        
        // Verificar si el registro existe
        $stmt = $this->connection->prepare("SELECT ID FROM bitacora_semestre WHERE ID_semestre = ? AND ID_docente = ? AND ID_requisito = ?");
        $stmt->bind_param("iii", $semestreId, $docenteId, $requisitoId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Actualizar registro existente
            $row = $result->fetch_assoc();
            $sql = "UPDATE bitacora_semestre SET estado = ?, comentario = ? WHERE ID = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->bind_param("ssi", $estado, $comentario, $row['ID']);
        } else {
            // Crear nuevo registro
            $sql = "INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito, estado, comentario, cumple) VALUES (?, ?, ?, ?, ?, 0)";
            $stmt = $this->connection->prepare($sql);
            $stmt->bind_param("iiiis", $semestreId, $docenteId, $requisitoId, $estado, $comentario);
        }
        
        return $stmt->execute();
    }
    
    public function configurarSemestre($semestreId, $docentes, $requisitos) {
        if (empty($docentes) || empty($requisitos)) {
            throw new Exception("Debe proporcionar al menos un docente y un requisito");
        }
        
        $this->connection->begin_transaction();
        try {
            // Limpiar configuración anterior del semestre
            $stmt = $this->connection->prepare("DELETE FROM bitacora_semestre WHERE ID_semestre = ?");
            $stmt->bind_param("i", $semestreId);
            $stmt->execute();
            
            // Insertar nuevas combinaciones
            $sql = "INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito, estado, comentario, cumple) VALUES (?, ?, ?, 'Incompleto', '', 0)";
            $stmt = $this->connection->prepare($sql);
            
            foreach ($docentes as $docenteId) {
                foreach ($requisitos as $requisitoId) {
                    $stmt->bind_param("iii", $semestreId, $docenteId, $requisitoId);
                    $stmt->execute();
                }
            }
            
            $this->connection->commit();
            return true;
        } catch (Exception $e) {
            $this->connection->rollback();
            throw $e;
        }
    }
    
    public function actualizarDocentesSemestre($semestreId, $docentes, $requisitos) {
        $this->connection->begin_transaction();
        try {
            // Obtener configuración existente
            $stmt = $this->connection->prepare("SELECT ID_docente, ID_requisito, estado, comentario FROM bitacora_semestre WHERE ID_semestre = ?");
            $stmt->bind_param("i", $semestreId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $existing = array();
            while ($row = $result->fetch_assoc()) {
                $key = $row['ID_docente'] . '-' . $row['ID_requisito'];
                $existing[$key] = array(
                    'estado' => $row['estado'],
                    'comentario' => $row['comentario']
                );
            }
            
            // Crear conjunto deseado
            $desired = array();
            foreach ($docentes as $docenteId) {
                foreach ($requisitos as $requisitoId) {
                    $desired[] = $docenteId . '-' . $requisitoId;
                }
            }
            
            // Eliminar combinaciones que ya no están en el conjunto deseado
            $toDelete = array_diff(array_keys($existing), $desired);
            if (!empty($toDelete)) {
                $sqlDel = "DELETE FROM bitacora_semestre WHERE ID_semestre = ? AND CONCAT(ID_docente,'-',ID_requisito) = ?";
                $stmtDel = $this->connection->prepare($sqlDel);
                foreach ($toDelete as $key) {
                    $stmtDel->bind_param("is", $semestreId, $key);
                    $stmtDel->execute();
                }
            }
            
            // Insertar nuevas combinaciones
            $toInsert = array_diff($desired, array_keys($existing));
            if (!empty($toInsert)) {
                $sqlIns = "INSERT INTO bitacora_semestre (ID_semestre, ID_docente, ID_requisito, estado, comentario, cumple) VALUES (?, ?, ?, 'Incompleto', '', 0)";
                $stmtIns = $this->connection->prepare($sqlIns);
                
                foreach ($toInsert as $key) {
                    list($docenteId, $requisitoId) = explode('-', $key);
                    $stmtIns->bind_param("iii", $semestreId, $docenteId, $requisitoId);
                    $stmtIns->execute();
                }
            }
            
            $this->connection->commit();
            return true;
        } catch (Exception $e) {
            $this->connection->rollback();
            throw $e;
        }
    }
    
    public function getEstadisticasSemestre($semestreId) {
        $sql = "SELECT 
                    COUNT(*) as total_registros,
                    SUM(CASE WHEN estado = 'Cumple' THEN 1 ELSE 0 END) as total_cumple,
                    SUM(CASE WHEN estado = 'No Cumple' THEN 1 ELSE 0 END) as total_no_cumple,
                    SUM(CASE WHEN estado = 'Incompleto' THEN 1 ELSE 0 END) as total_incompleto,
                    ROUND((SUM(CASE WHEN estado = 'Cumple' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as porcentaje_cumple
                FROM bitacora_semestre 
                WHERE ID_semestre = ?";
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bind_param("i", $semestreId);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}

?>