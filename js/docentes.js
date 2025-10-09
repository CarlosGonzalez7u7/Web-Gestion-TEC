// Referencias a elementos DOM
const modalConfirm     = document.getElementById("modalConfirm");
const confirmTitle     = document.getElementById("confirmTitle");
const confirmMessage   = document.getElementById("confirmMessage");
const btnConfirmOk     = document.getElementById("confirmOk");
const btnConfirmCancel = document.getElementById("confirmCancel");
const btnConfirmClose  = document.getElementById("confirmClose");

// Estado de la aplicación
let currentPage = 1;
let currentLimit = 10;
let currentSearchTerm = '';

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  await checkAuthentication();
  
  // Cargar datos iniciales
  await cargarDocentes();
  await cargarRequisitos();

  // Configurar modales y eventos
  configurarModales();
  configurarEventos();
});

// Verificar autenticación
async function checkAuthentication() {
  try {
    const result = await AuthService.checkSession();
    if (!result || !result.success || !result.data.valid) {
      window.location.href = '../index.html';
      return;
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    window.location.href = '../index.html';
  }
}

// Configurar modales
function configurarModales() {
  // Modal de Docentes
  const modalDocente = document.getElementById("modalDocente");
  const btnNuevoDocente = document.getElementById("btnNuevoDocente");
  const btnCerrarModalDocente = document.getElementById(
    "btnCerrarModalDocente"
  );

  btnNuevoDocente.addEventListener("click", () => {
    document.getElementById("modalDocenteTitle").textContent = "Nuevo Docente";
    document.getElementById("formDocente").reset();
    document.getElementById("docente_id").value = "";
    modalDocente.style.display = "block";
  });

  btnCerrarModalDocente.addEventListener("click", () => {
    modalDocente.style.display = "none";
  });

  // Modal de Requisitos
  const modalRequisito = document.getElementById("modalRequisito");
  const btnNuevoRequisito = document.getElementById("btnNuevoRequisito");
  const btnCerrarModalRequisito = document.getElementById(
    "btnCerrarModalRequisito"
  );

  btnNuevoRequisito.addEventListener("click", () => {
    document.getElementById("modalRequisitoTitle").textContent =
      "Nuevo Requisito";
    document.getElementById("formRequisito").reset();
    document.getElementById("requisito_id").value = "";
    modalRequisito.style.display = "block";
  });

  btnCerrarModalRequisito.addEventListener("click", () => {
    modalRequisito.style.display = "none";
  });

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (event) => {
    if (event.target === modalDocente) {
      modalDocente.style.display = "none";
    }
    if (event.target === modalRequisito) {
      modalRequisito.style.display = "none";
    }
  });
}

// Configurar eventos adicionales
function configurarEventos() {
  // Formulario de docente
  const formDocente = document.getElementById("formDocente");
  if (formDocente) {
    formDocente.addEventListener("submit", guardarDocente);
  }

  // Formulario de requisito
  const formRequisito = document.getElementById("formRequisito");
  if (formRequisito) {
    formRequisito.addEventListener("submit", guardarRequisito);
  }

  // Búsqueda de docentes
  const btnBuscarDocentes = document.querySelector('#docentes-section .btn-secondary');
  if (btnBuscarDocentes) {
    btnBuscarDocentes.addEventListener("click", buscarDocentes);
  }

  // Enter en campo de búsqueda
  const busquedaInput = document.getElementById("busqueda");
  if (busquedaInput) {
    busquedaInput.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        buscarDocentes();
      }
    });
  }

  // Búsqueda de requisitos
  const btnBuscarRequisitos = document.querySelector('#requisitos-section .btn-secondary');
  if (btnBuscarRequisitos) {
    btnBuscarRequisitos.addEventListener("click", buscarRequisitos);
  }

  // Enter en campo de búsqueda de requisitos
  const busquedaRequisitoInput = document.getElementById("busquedaRequisito");
  if (busquedaRequisitoInput) {
    busquedaRequisitoInput.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        buscarRequisitos();
      }
    });
  }

  // Logout
  const logoutLinks = document.querySelectorAll('a[href="../index.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
    });
  });
}

// ==================== DOCENTES ====================

// Cargar docentes con la nueva API
async function cargarDocentes(search = '') {
  try {
    const params = {
      page: currentPage,
      limit: currentLimit
    };
    
    if (search) {
      params.search = search;
    }

    const result = await DocenteService.getAll(params);
    
    if (result && result.success) {
      actualizarTablaDocentes(result.data.docentes);
      actualizarPaginacionDocentes(result.data.pagination);
    } else {
      UIHelpers.showToast(result?.message || "Error al cargar los docentes", "error");
    }
  } catch (error) {
    console.error("Error cargando docentes:", error);
    UIHelpers.showToast("Error al cargar los docentes", "error");
  }
}

// Función de debug removida - ahora usando la API unificada

// Actualizar tabla de docentes
function actualizarTablaDocentes(docentes) {
  const tbody = document.getElementById("tbodyDocentes");
  tbody.innerHTML = "";

  if (!docentes || docentes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron docentes</td></tr>`;
    return;
  }

  docentes.forEach((docente) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${docente.ID_docente}</td>
            <td>${docente.nombre}</td>
            <td>${docente.AP_Paterno}</td>
            <td>${docente.AP_Materno || "-"}</td>
            <td>${docente.carrera}</td>
            <td>${formatearFecha(docente.fec_Regist)}</td>
            <td>
                <button class="btn-edit" onclick="abrirEdicionDocente(${docente.ID_docente})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarDocente(${docente.ID_docente})">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Actualizar paginación de docentes
function actualizarPaginacionDocentes(pagination) {
  // Aquí puedes agregar lógica para mostrar controles de paginación
  console.log('Paginación:', pagination);
}

// Formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX");
}

// Buscar docentes
async function buscarDocentes() {
  const termino = document.getElementById("busqueda")?.value?.trim() || '';
  currentSearchTerm = termino;
  currentPage = 1; // Resetear página al buscar
  
  try {
    await cargarDocentes(termino);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    UIHelpers.showToast("Error al buscar docentes", "error");
  }
}

// Abrir modal para editar docente
async function abrirEdicionDocente(id) {
  try {
    const result = await DocenteService.getById(id);
    
    if (result && result.success) {
      const docente = result.data;
      
      document.getElementById("modalDocenteTitle").textContent = "Editar Docente";
      document.getElementById("docente_id").value = docente.ID_docente;
      document.getElementById("nombre").value = docente.nombre;
      document.getElementById("ap_paterno").value = docente.AP_Paterno;
      document.getElementById("ap_materno").value = docente.AP_Materno || "";
      document.getElementById("carrera").value = docente.carrera;

      document.getElementById("modalDocente").style.display = "block";
    } else {
      UIHelpers.showToast(result?.message || "Error al cargar los datos del docente", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al cargar los datos del docente", "error");
  }
}

// Eliminar docente
async function eliminarDocente(id) {
  if (!confirm("¿Estás seguro de eliminar este docente?")) {
    return;
  }

  try {
    const result = await DocenteService.delete(id);
    
    if (result && result.success) {
      UIHelpers.showToast("Docente eliminado correctamente", "success");
      await cargarDocentes(currentSearchTerm);
    } else {
      UIHelpers.showToast(result?.message || "Error al eliminar el docente", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al eliminar el docente", "error");
  }
}

// Guardar docente (crear o actualizar)
async function guardarDocente(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const docenteId = document.getElementById("docente_id").value;

  const data = {
    nombre: formData.get('nombre'),
    AP_Paterno: formData.get('ap_paterno'),
    AP_Materno: formData.get('ap_materno'),
    carrera: formData.get('carrera')
  };

  // Mostrar indicador de carga
  const submitButton = form.querySelector('button[type="submit"]');
  const hideLoading = UIHelpers.showLoading(submitButton, docenteId ? 'Actualizando...' : 'Creando...');

  try {
    let result;
    if (docenteId) {
      result = await DocenteService.update(docenteId, data);
    } else {
      result = await DocenteService.create(data);
    }

    if (result && result.success) {
      const mensaje = docenteId ? "Docente actualizado correctamente" : "Docente creado correctamente";
      UIHelpers.showToast(mensaje, "success");
      document.getElementById("modalDocente").style.display = "none";
      form.reset();
      await cargarDocentes(currentSearchTerm);
    } else {
      UIHelpers.showToast(result?.message || "Error al procesar la solicitud", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al procesar la solicitud", "error");
  } finally {
    hideLoading();
  }
}

// ==================== REQUISITOS ====================

// Cargar requisitos
async function cargarRequisitos(search = '') {
  try {
    const params = {};
    if (search) {
      params.search = search;
    }

    const result = await RequisitoService.getAll(params);
    
    if (result && result.success) {
      // El endpoint devuelve directamente el array de requisitos
      actualizarTablaRequisitos(result.data || []);
    } else {
      UIHelpers.showToast(result?.message || "Error al cargar los requisitos", "error");
    }
  } catch (error) {
    console.error("Error cargando requisitos:", error);
    UIHelpers.showToast("Error al cargar los requisitos", "error");
  }
}

// Actualizar tabla de requisitos
function actualizarTablaRequisitos(requisitos) {
  const tbody = document.getElementById("tbodyRequisitos");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!requisitos || requisitos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">No se encontraron requisitos</td></tr>`;
    return;
  }

  requisitos.forEach((requisito) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${requisito.id}</td>
            <td>${requisito.nombre}</td>
            <td>
                <button class="btn-edit" onclick="abrirEdicionRequisito(${requisito.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarRequisito(${requisito.id})">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Buscar requisitos
async function buscarRequisitos() {
  const termino = document.getElementById("busquedaRequisito")?.value?.trim() || '';
  
  try {
    await cargarRequisitos(termino);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    UIHelpers.showToast("Error al buscar requisitos", "error");
  }
}

// Abrir modal para editar requisito
async function abrirEdicionRequisito(id) {
  try {
    const result = await RequisitoService.getById(id);
    
    if (result && result.success) {
      const requisito = result.data;
      
      document.getElementById("modalRequisitoTitle").textContent = "Editar Requisito";
      document.getElementById("requisito_id").value = requisito.id;  // Usar 'id' en lugar de 'ID_requisitos'
      document.getElementById("requisitoTipo").value = requisito.nombre;  // Usar 'nombre' en lugar de 'requisitoTipo'

      document.getElementById("modalRequisito").style.display = "block";
    } else {
      UIHelpers.showToast(result?.message || "Error al cargar los datos del requisito", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al cargar los datos del requisito", "error");
  }
}


// Eliminar requisito
async function eliminarRequisito(id) {
  if (!confirm("¿Estás seguro de eliminar este requisito?")) {
    return;
  }

  try {
    const result = await RequisitoService.delete(id);
    
    if (result && result.success) {
      UIHelpers.showToast("Requisito eliminado correctamente", "success");
      await cargarRequisitos();
    } else {
      UIHelpers.showToast(result?.message || "Error al eliminar el requisito", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al eliminar el requisito", "error");
  }
}

// Guardar requisito (crear o actualizar)
async function guardarRequisito(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const requisitoId = document.getElementById("requisito_id").value;

  const data = {
    requisitoTipo: formData.get('requisitoTipo')
  };

  // Mostrar indicador de carga
  const submitButton = form.querySelector('button[type="submit"]');
  const hideLoading = UIHelpers.showLoading(submitButton, requisitoId ? 'Actualizando...' : 'Creando...');

  try {
    let result;
    if (requisitoId) {
      result = await RequisitoService.update(requisitoId, data);
    } else {
      result = await RequisitoService.create(data);
    }

    if (result && result.success) {
      const mensaje = requisitoId ? "Requisito actualizado correctamente" : "Requisito creado correctamente";
      UIHelpers.showToast(mensaje, "success");
      document.getElementById("modalRequisito").style.display = "none";
      form.reset();
      await cargarRequisitos();
    } else {
      UIHelpers.showToast(result?.message || "Error al procesar la solicitud", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    UIHelpers.showToast("Error al procesar la solicitud", "error");
  } finally {
    hideLoading();
  }
}

// ==================== UTILIDADES ====================

// Formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX");
}

// Logout
async function logout() {
  try {
    await AuthService.logout();
    window.location.href = '../index.html';
  } catch (error) {
    console.error('Error en logout:', error);
    // Aun si hay error, redirigir al login
    window.location.href = '../index.html';
  }
}

// Funciones de utilidad para scrolling suave
function scrollToRequisitos(event) {
  if (event) event.preventDefault();
  const section = document.getElementById('requisitos-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
