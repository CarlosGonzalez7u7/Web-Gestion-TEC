# API REST - Sistema Académico

## Documentación de la API

Esta API REST está desarrollada en PHP puro para máxima compatibilidad con servidores básicos de PHP.

### URL Base
```
http://localhost/Web-Gestion-TEC/api/v1/
```

### Autenticación

La API utiliza **sesiones PHP** para la autenticación. No requiere tokens JWT ni headers especiales.

#### Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "tu_contraseña"
}
```

**Respuesta:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Inicio de sesión exitoso",
  "data": {
    "id": 6,
    "name": "admin",
    "isAdmin": true,
    "session_id": "abc123..."
  }
}
```

#### Cerrar Sesión
```http
POST /auth/logout
```

#### Verificar Sesión
```http
POST /auth/check
```

### Gestión de Docentes

#### Listar Docentes (con paginación)
```http
GET /docentes?page=1&limit=10&search=apellido
```

#### Obtener Docente Específico
```http
GET /docentes/3
```

#### Crear Nuevo Docente
```http
POST /docentes
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "AP_Paterno": "García",
  "AP_Materno": "López",
  "carrera": "Ingeniería en Sistemas"
}
```

#### Actualizar Docente
```http
PUT /docentes/3
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "AP_Paterno": "García",
  "AP_Materno": "Martínez",
  "carrera": "Ingeniería en Sistemas"
}
```

#### Eliminar Docente
```http
DELETE /docentes/3
```

#### Buscar Docentes
```http
GET /docentes/search/García
```

#### Docentes de un Semestre
```http
GET /docentes/semestre/4
```

### Gestión de Semestres

#### Listar Semestres
```http
GET /semestres?page=1&limit=10
```

#### Obtener Semestre con Estadísticas
```http
GET /semestres/4/stats
```

#### Crear Nuevo Semestre
```http
POST /semestres
Content-Type: application/json

{
  "nomSem": "Enero-Junio 2026",
  "fecha_inicio": "2026-01-15",
  "fecha_fin": "2026-06-30"
}
```

#### Actualizar Semestre
```http
PUT /semestres/4
Content-Type: application/json

{
  "nomSem": "Enero-Junio 2026 (Actualizado)",
  "fecha_inicio": "2026-01-20",
  "fecha_fin": "2026-06-25"
}
```

### Gestión de Requisitos

#### Listar Requisitos
```http
GET /requisitos
```

#### Crear Nuevo Requisito
```http
POST /requisitos
Content-Type: application/json

{
  "requisitoTipo": "EVALUACIÓN FINAL"
}
```

#### Requisitos de un Semestre
```http
GET /requisitos/semestre/4
```

### Gestión de Bitácora

#### Obtener Bitácora de un Semestre
```http
GET /bitacora/semestre/4
```

**Respuesta:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Bitácora del semestre obtenida exitosamente",
  "data": {
    "docentes": [
      {
        "ID_docente": 3,
        "nombre": "Suzel",
        "AP_Paterno": "Rivera",
        "AP_Materno": "Gomez"
      }
    ],
    "requisitos": [
      {
        "ID_requisitos": 1,
        "requisitoTipo": "PLANEACION"
      }
    ],
    "estados": {
      "3_1": {
        "estado": "Cumple",
        "comentario": "Entregado a tiempo"
      }
    }
  }
}
```

#### Configurar Semestre (Asignar Docentes y Requisitos)
```http
POST /bitacora/configurar
Content-Type: application/json

{
  "ID_semestre": 4,
  "docentes": [3, 4, 5],
  "requisitos": [1, 3, 4, 5]
}
```

#### Actualizar Estado de Cumplimiento
```http
PUT /bitacora/actualizar-estado
Content-Type: application/json

{
  "ID_semestre": 4,
  "ID_docente": 3,
  "ID_requisito": 1,
  "estado": "Cumple",
  "comentario": "Entregado correctamente"
}
```

**Estados válidos:**
- `"Cumple"`
- `"No Cumple"`
- `"Incompleto"`

#### Actualizar Docentes de un Semestre
```http
PUT /bitacora/actualizar-docentes
Content-Type: application/json

{
  "ID_semestre": 4,
  "docentes": [3, 4, 5, 6],
  "requisitos": [1, 3, 4, 5]
}
```

#### Actualizar Solo Comentario
```http
POST /bitacora/actualizar-comentario
Content-Type: application/json

{
  "ID_semestre": 4,
  "ID_docente": 3,
  "ID_requisito": 1,
  "comentario": "Comentario actualizado"
}
```

#### Obtener Estadísticas de un Semestre
```http
GET /bitacora/estadisticas/4
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_registros": 20,
    "total_cumple": 12,
    "total_no_cumple": 3,
    "total_incompleto": 5,
    "porcentaje_cumple": 60.00
  }
}
```

### Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Sin permisos suficientes
- **404 Not Found**: Recurso no encontrado
- **405 Method Not Allowed**: Método HTTP no permitido
- **409 Conflict**: Conflicto (ej: no se puede eliminar porque está en uso)
- **500 Internal Server Error**: Error del servidor

### Paginación

Todos los endpoints de listado soportan paginación:

```http
GET /docentes?page=2&limit=5
```

**Parámetros:**
- `page`: Número de página (por defecto: 1)
- `limit`: Elementos por página (por defecto: 20, máximo: 100)

**Respuesta con paginación:**
```json
{
  "success": true,
  "data": {
    "docentes": [...],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 25,
      "pages": 5
    }
  }
}
```

### Búsqueda

Endpoints de búsqueda disponibles:

```http
GET /docentes?search=García
GET /semestres?search=2025
GET /requisitos?search=PLANEACION
```

### Formato de Respuesta

Todas las respuestas siguen el mismo formato:

```json
{
  "success": true|false,
  "status_code": 200,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "error": true  // Solo en caso de error
}
```

### Ejemplos con JavaScript (Fetch)

```javascript
// Iniciar sesión
const login = async () => {
  const response = await fetch('/Web-Gestion-TEC/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Importante para mantener sesiones
    body: JSON.stringify({
      usernameOrEmail: 'admin',
      password: 'contraseña'
    })
  });
  
  const result = await response.json();
  console.log(result);
};

// Obtener docentes
const getDocentes = async () => {
  const response = await fetch('/Web-Gestion-TEC/api/v1/docentes', {
    credentials: 'include' // Mantener sesión
  });
  
  const result = await response.json();
  console.log(result);
};

// Crear docente
const createDocente = async () => {
  const response = await fetch('/Web-Gestion-TEC/api/v1/docentes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      nombre: 'Juan',
      AP_Paterno: 'Pérez',
      AP_Materno: 'López',
      carrera: 'Sistemas'
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

### Manejo de Errores

```javascript
const handleApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('Error de API:', result.message);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Error de red:', error);
    return null;
  }
};
```

### Consideraciones de Seguridad

1. **Sesiones**: La API usa sesiones PHP nativas
2. **CORS**: Configurado para desarrollo (ajustar en producción)
3. **Validación**: Todos los datos son validados y sanitizados
4. **SQL Injection**: Se usan prepared statements
5. **XSS**: Los datos se escapan con `htmlspecialchars`

### Instalación y Configuración

1. Copiar archivos a `/Web-Gestion-TEC/api/v1/`
2. Asegurar que Apache tiene mod_rewrite habilitado
3. Verificar permisos de archivos
4. Configurar base de datos en `config/Database.php`
5. Probar con: `GET /Web-Gestion-TEC/api/v1/`