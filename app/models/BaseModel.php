<?php

require_once __DIR__ . '/config/Database.php';

class BaseModel {
    protected $db;
    protected $connection;
    protected $table;
    protected $primaryKey = 'id';
    
    public function __construct() {
        $this->db = new Database();
        $this->connection = $this->db->getConnection();
    }
    
    public function findAll($limit = null, $offset = null, $orderBy = null) {
        $sql = "SELECT * FROM {$this->table}";
        
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }
        
        if ($limit) {
            $sql .= " LIMIT {$limit}";
            if ($offset) {
                $sql .= " OFFSET {$offset}";
            }
        }
        
        $result = $this->connection->query($sql);
        
        if (!$result) {
            throw new Exception("Error al ejecutar consulta: " . $this->connection->error);
        }
        
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function findById($id) {
        $stmt = $this->connection->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    public function create($data) {
        $fields = array_keys($data);
        $values = array_values($data);
        $placeholders = str_repeat('?,', count($fields) - 1) . '?';
        
        $sql = "INSERT INTO {$this->table} (" . implode(',', $fields) . ") VALUES ({$placeholders})";
        $stmt = $this->connection->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error en prepare: " . $this->connection->error);
        }
        
        $types = str_repeat('s', count($values));
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            return $this->connection->insert_id;
        } else {
            throw new Exception("Error al crear registro: " . $stmt->error);
        }
    }
    
    public function update($id, $data) {
        $fields = array_keys($data);
        $values = array_values($data);
        
        $setClause = implode(' = ?, ', $fields) . ' = ?';
        $sql = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";
        
        $stmt = $this->connection->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error en prepare: " . $this->connection->error);
        }
        
        $values[] = $id; // Agregar ID al final
        $types = str_repeat('s', count($values));
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            return $this->connection->affected_rows > 0;
        } else {
            throw new Exception("Error al actualizar registro: " . $stmt->error);
        }
    }
    
    public function delete($id) {
        $stmt = $this->connection->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            return $this->connection->affected_rows > 0;
        } else {
            throw new Exception("Error al eliminar registro: " . $stmt->error);
        }
    }
    
    public function search($field, $value, $operator = 'LIKE') {
        if ($operator === 'LIKE') {
            $value = "%{$value}%";
        }
        
        $stmt = $this->connection->prepare("SELECT * FROM {$this->table} WHERE {$field} {$operator} ?");
        $stmt->bind_param("s", $value);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function count($where = null) {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $result = $this->connection->query($sql);
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    public function beginTransaction() {
        return $this->connection->begin_transaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollback();
    }
    
    public function __destruct() {
        if ($this->db) {
            $this->db->close();
        }
    }
}

?>