# API REST Endpoints - Web-Gestion-TEC

## Base URL
```
http://localhost/Web-Gestion-TEC/public/index.php
```

## Formato de Peticiones
Todos los endpoints usan **query parameters**:
```
?resource={recurso}&action={accion}
```

---

## 1. Autenticación (`resource=auth`)

### 1.1 Login
**Iniciar sesión en el sistema**
```http
POST /public/index.php?resource=auth&action=login
Content-Type: application/json

{
    "login": "admin",           // Usuario o email
    "password": "1234"          // Contraseña
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@sistema.com",
            "isAdmin": 1
        }
    },
    "message": "Login exitoso"
}
```

### 1.2 Verificar Sesión
**Comprobar si hay una sesión activa**
```http
GET /public/index.php?resource=auth&action=check
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "valid": true,
        "user_id": 1,
        "username": "admin"
    }
}
```

### 1.3 Cerrar Sesión
**Finalizar la sesión del usuario**
```http
POST /public/index.php?resource=auth&action=logout
```

**Respuesta:**
```json
{
    "success": true,
    "data": null,
    "message": "Logout exitoso"
}
```

---

## 2. Docentes (`resource=docentes`)

### 2.1 Listar Docentes
**Obtener lista de docentes con paginación**
```http
GET /public/index.php?resource=docentes&action=list&page=1&limit=10&search=nombre
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10)
- `search` (opcional): Búsqueda por nombre, apellido o carrera

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "docentes": [
            {
                "ID_docente": 1,
                "nombre": "Juan",
                "AP_Paterno": "Pérez",
                "AP_Materno": "García",
                "carrera": "Ingeniería en Sistemas"
            }
        ],
        "total": 25,
        "page": 1,
        "limit": 10
    },
    "message": ""
}
```

### 2.2 Obtener Docente
**Obtener información de un docente específico**
```http
GET /public/index.php?resource=docentes&action=get&id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "ID_docente": 1,
        "nombre": "Juan",
        "AP_Paterno": "Pérez",
        "AP_Materno": "García",
        "carrera": "Ingeniería en Sistemas"
    }
}
```

### 2.3 Crear Docente
**Registrar un nuevo docente**
```http
POST /public/index.php?resource=docentes&action=create
Content-Type: application/json

{
    "nombre": "María",
    "AP_Paterno": "López",
    "AP_Materno": "Martínez",
    "carrera": "Ingeniería Industrial"
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "id": 26
    },
    "message": "Docente creado exitosamente"
}
```

### 2.4 Actualizar Docente
**Modificar información de un docente**
```http
PUT /public/index.php?resource=docentes&action=update&id=1
Content-Type: application/json

{
    "nombre": "Juan Carlos",
    "AP_Paterno": "Pérez",
    "AP_Materno": "García",
    "carrera": "Ingeniería en Sistemas"
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": null,
    "message": "Docente actualizado exitosamente"
}
```

### 2.5 Eliminar Docente
**Eliminar un docente del sistema**
```http
DELETE /public/index.php?resource=docentes&action=delete&id=1
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": null,
    "message": "Docente eliminado exitosamente"
}
```

**Respuesta con restricción:**
```json
{
    "success": false,
    "data": null,
    "message": "No se puede eliminar. El docente está asignado a X semestre(s)"
}
```

---

## 3. Requisitos (`resource=requisitos`)

### 3.1 Listar Requisitos
**Obtener lista de todos los requisitos**
```http
GET /public/index.php?resource=requisitos&action=list
```

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "ID_requisito": 1,
            "requisito_tipo": "Documentación",
            "descripcion": "Presentar documentos requeridos"
        }
    ]
}
```

### 3.2 Obtener Requisito
**Obtener información de un requisito específico**
```http
GET /public/index.php?resource=requisitos&action=get&id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "ID_requisito": 1,
        "requisito_tipo": "Documentación",
        "descripcion": "Presentar documentos requeridos"
    }
}
```

### 3.3 Crear Requisito
**Registrar un nuevo requisito**
```http
POST /public/index.php?resource=requisitos&action=create
Content-Type: application/json

{
    "requisito_tipo": "Capacitación",
    "descripcion": "Asistir a curso de inducción"
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "id": 5
    },
    "message": "Requisito creado exitosamente"
}
```

### 3.4 Actualizar Requisito
**Modificar información de un requisito**
```http
PUT /public/index.php?resource=requisitos&action=update&id=1
Content-Type: application/json

{
    "requisito_tipo": "Documentación Completa",
    "descripcion": "Presentar todos los documentos legales"
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": null,
    "message": "Requisito actualizado exitosamente"
}
```

### 3.5 Eliminar Requisito
**Eliminar un requisito del sistema**
```http
DELETE /public/index.php?resource=requisitos&action=delete&id=1
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": null,
    "message": "Requisito eliminado exitosamente"
}
```

**Respuesta con restricción:**
```json
{
    "success": false,
    "data": null,
    "message": "No se puede eliminar. El requisito está asignado a X semestre(s)"
}
```

---

## 4. Semestres (`resource=semestres`)

### 4.1 Listar Semestres
**Obtener lista de semestres**
```http
GET /public/index.php?resource=semestres&action=list
```

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "ID_semestre": 1,
            "nombre": "Semestre Agosto-Diciembre 2025",
            "fecha_inicio": "2025-08-01",
            "fecha_fin": "2025-12-15",
            "activo": 1
        }
    ]
}
```

### 4.2 Obtener Semestre
**Obtener información de un semestre específico**
```http
GET /public/index.php?resource=semestres&action=get&id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "ID_semestre": 1,
        "nombre": "Semestre Agosto-Diciembre 2025",
        "fecha_inicio": "2025-08-01",
        "fecha_fin": "2025-12-15",
        "activo": 1
    }
}
```

### 4.3 Obtener Docentes del Semestre
**Listar docentes asignados a un semestre**
```http
GET /public/index.php?resource=semestres&action=docentes&id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "ID_docente": 1,
            "nombre": "Juan",
            "AP_Paterno": "Pérez",
            "AP_Materno": "García",
            "carrera": "Ingeniería en Sistemas"
        }
    ]
}
```

---

## 5. Bitácora (`resource=bitacora`)

### 5.1 Obtener Bitácora de Semestre
**Obtener registros de bitácora con estado de requisitos**
```http
GET /public/index.php?resource=bitacora&action=list&semestre_id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "ID_bitacora": 1,
            "ID_semestre": 1,
            "ID_docente": 1,
            "ID_requisito": 1,
            "nombre_docente": "Juan Pérez García",
            "carrera": "Ingeniería en Sistemas",
            "requisito_tipo": "Documentación",
            "estado": "Pendiente",
            "comentarios": "",
            "fecha_actualizacion": "2025-10-01"
        }
    ]
}
```

### 5.2 Actualizar Estado y Comentario
**Modificar estado o comentario de un registro de bitácora**
```http
PUT /public/index.php?resource=bitacora&action=update&id=1
Content-Type: application/json

{
    "estado": "Completado",              // Opciones: Pendiente, En Proceso, Completado
    "comentarios": "Entregado el día 5"  // Opcional
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": null,
    "message": "Bitácora actualizada exitosamente"
}
```

---

## 6. Reportes (`resource=reportes`)

### 6.1 Estadísticas Generales
**Obtener estadísticas generales del sistema**
```http
GET /public/index.php?resource=reportes&action=estadisticas
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "total_docentes": 25,
        "total_requisitos": 8,
        "total_semestres": 5,
        "semestre_activo": {
            "ID_semestre": 1,
            "nombre": "Semestre Agosto-Diciembre 2025",
            "fecha_inicio": "2025-08-01",
            "fecha_fin": "2025-12-15"
        },
        "estadisticas_requisitos": {
            "completados": 150,
            "en_proceso": 45,
            "pendientes": 30,
            "total": 225
        }
    }
}
```

### 6.2 Reporte de Semestre
**Obtener reporte detallado de un semestre específico**
```http
GET /public/index.php?resource=reportes&action=semestre&semestre_id=1
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "semestre": {
            "ID_semestre": 1,
            "nombre": "Semestre Agosto-Diciembre 2025",
            "fecha_inicio": "2025-08-01",
            "fecha_fin": "2025-12-15"
        },
        "estadisticas": {
            "total_docentes": 25,
            "total_requisitos": 8,
            "total_registros": 200,
            "completados": 150,
            "en_proceso": 30,
            "pendientes": 20
        },
        "por_carrera": [
            {
                "carrera": "Ingeniería en Sistemas",
                "total_docentes": 10,
                "completados": 60,
                "en_proceso": 15,
                "pendientes": 5
            }
        ],
        "por_requisito": [
            {
                "requisito": "Documentación",
                "total": 25,
                "completados": 20,
                "en_proceso": 3,
                "pendientes": 2
            }
        ],
        "bitacora_completa": [
            {
                "docente": "Juan Pérez García",
                "carrera": "Ingeniería en Sistemas",
                "requisito": "Documentación",
                "estado": "Completado",
                "comentarios": "Entregado",
                "fecha": "2025-10-01"
            }
        ]
    }
}
```

---

## Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | Solicitud exitosa |
| 400 | Petición incorrecta (parámetros faltantes o inválidos) |
| 401 | No autorizado (sesión inválida o expirada) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Autenticación

Todos los endpoints **excepto** `auth/login` requieren una sesión activa.

### Manejo de Sesiones
- Las sesiones se manejan mediante cookies PHP nativas
- Incluir `credentials: 'include'` en peticiones fetch
- La sesión expira al cerrar el navegador o al hacer logout

### Ejemplo de Petición con Sesión
```javascript
fetch('http://localhost/Web-Gestion-TEC/public/index.php?resource=docentes&action=list', {
    method: 'GET',
    credentials: 'include'  // Importante: incluir cookies de sesión
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Ejemplos de Uso

### JavaScript (Fetch API)

**Login:**
```javascript
const login = async (username, password) => {
    const response = await fetch(
        'http://localhost/Web-Gestion-TEC/public/index.php?resource=auth&action=login',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ login: username, password: password })
        }
    );
    return await response.json();
};
```

**Listar Docentes:**
```javascript
const getDocentes = async () => {
    const response = await fetch(
        'http://localhost/Web-Gestion-TEC/public/index.php?resource=docentes&action=list',
        {
            method: 'GET',
            credentials: 'include'
        }
    );
    return await response.json();
};
```

**Crear Docente:**
```javascript
const createDocente = async (docente) => {
    const response = await fetch(
        'http://localhost/Web-Gestion-TEC/public/index.php?resource=docentes&action=create',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(docente)
        }
    );
    return await response.json();
};
```

### cURL

**Login:**
```bash
curl -X POST "http://localhost/Web-Gestion-TEC/public/index.php?resource=auth&action=login" \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"1234"}' \
  -c cookies.txt
```

**Listar Docentes (con sesión):**
```bash
curl -X GET "http://localhost/Web-Gestion-TEC/public/index.php?resource=docentes&action=list" \
  -b cookies.txt
```

---

## Resumen de Recursos

| Recurso | Endpoints Disponibles |
|---------|----------------------|
| **auth** | login, check, logout |
| **docentes** | list, get, create, update, delete |
| **requisitos** | list, get, create, update, delete |
| **semestres** | list, get, docentes |
| **bitacora** | list, update |
| **reportes** | estadisticas, semestre |

---

## Notas Técnicas

- **Formato de fechas**: YYYY-MM-DD (ISO 8601)
- **Codificación**: UTF-8
- **Content-Type**: application/json
- **CORS**: Configurado para `http://localhost`
- **Método de autenticación**: Sesiones PHP
- **Versionado**: Se recomienda usar `?v=2.0` para evitar cache

---

**Versión de API**: 2.0  
**Última actualización**: Octubre 2025  
**Arquitectura**: MVC con PHP puro