// Configuración global de la API
const API_CONFIG = {
    BASE_URL: '/Web-Gestion-TEC/api/v1/simple.php',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout', 
            CHECK: '/auth/check',
            ME: '/auth/me',
            CHANGE_PASSWORD: '/auth/change-password'
        },
        DOCENTES: {
            LIST: '/docentes',
            CREATE: '/docentes',
            SHOW: '/docentes',
            UPDATE: '/docentes',
            DELETE: '/docentes',
            SEARCH: '/docentes/search',
            BY_SEMESTRE: '/docentes/semestre'
        },
        SEMESTRES: {
            LIST: '/semestres',
            CREATE: '/semestres',
            SHOW: '/semestres',
            UPDATE: '/semestres',
            DELETE: '/semestres',
            SEARCH: '/semestres/search',
            STATS: '/semestres'
        },
        REQUISITOS: {
            LIST: '/requisitos',
            CREATE: '/requisitos',
            SHOW: '/requisitos',
            UPDATE: '/requisitos',
            DELETE: '/requisitos',
            SEARCH: '/requisitos/search',
            BY_SEMESTRE: '/requisitos/semestre',
            STATS: '/requisitos'
        },
        BITACORA: {
            BY_SEMESTRE: '/bitacora/semestre',
            DETALLE: '/bitacora/semestre',
            ESTADISTICAS: '/bitacora/estadisticas',
            CONFIGURAR: '/bitacora/configurar',
            ACTUALIZAR_ESTADO: '/bitacora/actualizar-estado',
            ACTUALIZAR_DOCENTES: '/bitacora/actualizar-docentes',
            ACTUALIZAR_COMENTARIO: '/bitacora/actualizar-comentario'
        }
    }
};

// Cliente API universal
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    async request(endpoint, action, options = {}) {
        let url = `${this.baseURL}?resource=${endpoint}&action=${action}`;
        
        // Agregar parámetros adicionales a la URL si existen
        if (options.params) {
            const urlParams = new URLSearchParams(options.params);
            url += '&' + urlParams.toString();
        }
        
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        // Remover params del config ya que se agregaron a la URL
        delete config.params;

        try {
            const response = await fetch(url, config);
            
            // Obtener el texto de la respuesta primero para debug
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text:', responseText);
            
            // Intentar parsear como JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response was:', responseText);
                return {
                    success: false,
                    message: `Error de respuesta del servidor: ${responseText.substring(0, 100)}...`
                };
            }
            
            if (!result.success && response.status === 401) {
                // Redireccionar al login si no está autenticado
                const currentPath = window.location.pathname;
                if (currentPath.includes('/html/')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'index.html';
                }
                return null;
            }
            
            return result;
        } catch (error) {
            console.error('Error en petición API:', error);
            return {
                success: false,
                message: `Error de conexión: ${error.message}`
            };
        }
    }

    // Métodos HTTP
    async get(endpoint, action, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}?resource=${endpoint}&action=${action}&${queryString}`;
        return fetch(url, { 
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json());
    }

    async post(endpoint, action, data = {}) {
        return this.request(endpoint, action, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, action, data = {}, params = {}) {
        return this.request(endpoint, action, {
            method: 'PUT',
            body: JSON.stringify(data),
            params: params
        });
    }

    async delete(endpoint, action, data = {}, params = {}) {
        return this.request(endpoint, action, {
            method: 'DELETE',
            body: JSON.stringify(data),
            params: params
        });
    }
}

// Instancia global del cliente API
const apiClient = new APIClient();

// Servicios específicos para cada módulo
class AuthService {
    static async login(login, password) {
        return apiClient.post('auth', 'login', {
            login,
            password
        });
    }

    static async logout() {
        return apiClient.post('auth', 'logout');
    }

    static async checkSession() {
        return apiClient.get('auth', 'check');
    }

    static async getCurrentUser() {
        return apiClient.get('auth', 'me');
    }
}

class DocenteService {
    static async getAll(params = {}) {
        return apiClient.get('docentes', 'list', params);
    }

    static async getById(id) {
        return apiClient.get('docentes', 'get', { id });
    }

    static async create(data) {
        return apiClient.post('docentes', 'create', data);
    }

    static async update(id, data) {
        return apiClient.put('docentes', 'update', data, { id });
    }

    static async delete(id) {
        return apiClient.delete('docentes', 'delete', {}, { id });
    }

    static async search(term) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.DOCENTES.SEARCH}/${encodeURIComponent(term)}`);
    }

    static async getBySemestre(semestreId) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.DOCENTES.BY_SEMESTRE}/${semestreId}`);
    }
}

class SemestreService {
    static async getAll(params = {}) {
        return apiClient.get(API_CONFIG.ENDPOINTS.SEMESTRES.LIST, params);
    }

    static async getById(id) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.SEMESTRES.SHOW}/${id}`);
    }

    static async getWithStats(id) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.SEMESTRES.STATS}/${id}/stats`);
    }

    static async create(data) {
        return apiClient.post(API_CONFIG.ENDPOINTS.SEMESTRES.CREATE, data);
    }

    static async update(id, data) {
        return apiClient.put(`${API_CONFIG.ENDPOINTS.SEMESTRES.UPDATE}/${id}`, data);
    }

    static async delete(id) {
        return apiClient.delete(`${API_CONFIG.ENDPOINTS.SEMESTRES.DELETE}/${id}`);
    }

    static async search(term) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.SEMESTRES.SEARCH}/${encodeURIComponent(term)}`);
    }
}

class RequisitoService {
    static async getAll(params = {}) {
        return apiClient.get('requisitos', 'list', params);
    }

    static async getById(id) {
        return apiClient.get('requisitos', 'get', { id });
    }

    static async getWithStats(id) {
        return apiClient.get('requisitos', 'stats', { id });
    }

    static async create(data) {
        return apiClient.post('requisitos', 'create', data);
    }

    static async update(id, data) {
        return apiClient.put('requisitos', 'update', data, { id });
    }

    static async delete(id) {
        return apiClient.delete('requisitos', 'delete', {}, { id });
    }

    static async search(term) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.REQUISITOS.SEARCH}/${encodeURIComponent(term)}`);
    }

    static async getBySemestre(semestreId) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.REQUISITOS.BY_SEMESTRE}/${semestreId}`);
    }
}

class BitacoraService {
    static async getBySemestre(semestreId) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.BITACORA.BY_SEMESTRE}/${semestreId}`);
    }

    static async getDetalleBySemestre(semestreId) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.BITACORA.DETALLE}/${semestreId}/detalle`);
    }

    static async getEstadisticas(semestreId) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.BITACORA.ESTADISTICAS}/${semestreId}`);
    }

    static async configurarSemestre(semestreId, docentes, requisitos) {
        return apiClient.post(API_CONFIG.ENDPOINTS.BITACORA.CONFIGURAR, {
            ID_semestre: semestreId,
            docentes,
            requisitos
        });
    }

    static async actualizarEstado(semestreId, docenteId, requisitoId, estado, comentario = '') {
        return apiClient.put(API_CONFIG.ENDPOINTS.BITACORA.ACTUALIZAR_ESTADO, {
            ID_semestre: semestreId,
            ID_docente: docenteId,
            ID_requisito: requisitoId,
            estado,
            comentario
        });
    }

    static async actualizarDocentes(semestreId, docentes, requisitos) {
        return apiClient.put(API_CONFIG.ENDPOINTS.BITACORA.ACTUALIZAR_DOCENTES, {
            ID_semestre: semestreId,
            docentes,
            requisitos
        });
    }

    static async actualizarComentario(semestreId, docenteId, requisitoId, comentario) {
        return apiClient.post(API_CONFIG.ENDPOINTS.BITACORA.ACTUALIZAR_COMENTARIO, {
            ID_semestre: semestreId,
            ID_docente: docenteId,
            ID_requisito: requisitoId,
            comentario
        });
    }
}

// Utilidades globales
class UIHelpers {
    static showToast(message, type = "info") {
        const toastContainer = document.getElementById("toast-container") || document.body;
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        let icon = "info-circle";
        if (type === "success") icon = "check-circle";
        if (type === "warning") icon = "exclamation-triangle";
        if (type === "error") icon = "times-circle";

        toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Colores por tipo
        switch (type) {
            case 'success': toast.style.backgroundColor = '#28a745'; break;
            case 'error': toast.style.backgroundColor = '#dc3545'; break;
            case 'warning': toast.style.backgroundColor = '#ffc107'; toast.style.color = '#000'; break;
            default: toast.style.backgroundColor = '#17a2b8';
        }

        toastContainer.appendChild(toast);

        // Mostrar con animación
        setTimeout(() => toast.style.opacity = '1', 100);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static showLoading(button, text = 'Cargando...') {
        if (!button) return null;
        
        const originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    static handleError(error, defaultMessage = 'Error inesperado') {
        console.error('Error:', error);
        const message = error?.message || defaultMessage;
        this.showToast(message, 'error');
    }
}