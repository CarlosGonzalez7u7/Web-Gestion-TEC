// Referencias a elementos DOM
const modalConfirm = document.getElementById("modalConfirm");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const btnConfirmOk = document.getElementById("confirmOk");
const btnConfirmCancel = document.getElementById("confirmCancel");
const btnConfirmClose = document.getElementById("confirmClose");

// Estado de la aplicación
let currentPage = 1;
let currentLimit = 10;
let currentSearchTerm = "";

// Timer para debounce
let searchDocentesTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
  // cerramos los modales desde que se carga la pagina por si las dudas
  const modalDocente = document.getElementById("modalDocente");
  if (modalDocente) modalDocente.style.display = "none";

  // Verificar autenticación
  await checkAuthentication();

  // Cargar datos iniciales
  await cargarDocentes();

  // Configurar modales y eventos
  configurarModales();
  configurarEventos();
});

// Verificar autenticación
async function checkAuthentication() {
  try {
    const result = await AuthService.checkSession();
    if (!result || !result.success || !result.data.valid) {
      window.location.href = "../index.html";
      return;
    }
  } catch (error) {
    console.error("Error verificando sesión:", error);
    window.location.href = "../index.html";
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

  // Asegurar que el modal esté cerrado al inicio
  if (modalDocente) modalDocente.style.display = "none";

  btnNuevoDocente.addEventListener("click", () => {
    document.getElementById("modalDocenteTitle").textContent = "Nuevo Docente";
    document.getElementById("formDocente").reset();
    document.getElementById("docente_id").value = "";
    modalDocente.style.display = "block";
  });

  btnCerrarModalDocente.addEventListener("click", () => {
    modalDocente.style.display = "none";
  });

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (event) => {
    if (event.target === modalDocente) {
      modalDocente.style.display = "none";
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

  // Búsqueda de docentes
  const btnBuscarDocentes = document.getElementById("btnBuscarDocentes");
  if (btnBuscarDocentes) {
    btnBuscarDocentes.addEventListener("click", buscarDocentes);
  }

  // Búsqueda en tiempo real para docentes
  const busquedaInput = document.getElementById("busqueda");
  if (busquedaInput) {
    console.log("✅ Campo de búsqueda de docentes encontrado");

    busquedaInput.addEventListener("input", (e) => {
      console.log("🔍 Evento input detectado:", e.target.value);

      // Cancelar el timer anterior si existe
      if (searchDocentesTimer) {
        clearTimeout(searchDocentesTimer);
      }

      // Crear un nuevo timer que ejecutará la búsqueda después de 500ms
      searchDocentesTimer = setTimeout(() => {
        console.log("⏰ Ejecutando búsqueda automática");
        buscarDocentes();
      }, 500);
    });

    // También mantener el evento Enter para búsqueda inmediata
    busquedaInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("⚡ Enter presionado - búsqueda inmediata");
        // Cancelar el timer si existe
        if (searchDocentesTimer) {
          clearTimeout(searchDocentesTimer);
        }
        buscarDocentes();
      }
    });
  } else {
    console.error("❌ Campo de búsqueda de docentes NO encontrado");
  }

  // Logout
  const logoutLinks = document.querySelectorAll('a[href="../index.html"]');
  logoutLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  });
}

// ==================== DOCENTES ====================

// Cargar docentes con la nueva API
async function cargarDocentes(search = "") {
  try {
    const params = {
      page: currentPage,
      limit: currentLimit,
    };

    if (search) {
      params.search = search;
    }

    const result = await DocenteService.getAll(params);

    if (result && result.success) {
      actualizarTablaDocentes(result.data.docentes);
      actualizarPaginacionDocentes(result.data.pagination);
    } else {
      UIHelpers.showToast(
        result?.message || "Error al cargar los docentes",
        "error"
      );
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
                <button class="btn-edit" onclick="abrirEdicionDocente(${
                  docente.ID_docente
                })">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarDocente(${
                  docente.ID_docente
                })">
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
  console.log("Paginación:", pagination);
}

// Formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX");
}

// Buscar docentes
async function buscarDocentes() {
  const termino = document.getElementById("busqueda")?.value?.trim() || "";
  currentSearchTerm = termino;
  currentPage = 1; // Resetear página al buscar

  // Mostrar indicador de búsqueda
  const searchContainer = document.querySelector(
    "#docentes-section .search-container"
  );
  if (searchContainer) {
    searchContainer.classList.add("searching");
  }

  try {
    await cargarDocentes(termino);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    UIHelpers.showToast("Error al buscar docentes", "error");
  } finally {
    // Quitar indicador de búsqueda
    if (searchContainer) {
      searchContainer.classList.remove("searching");
    }
  }
}

// Abrir modal para editar docente
async function abrirEdicionDocente(id) {
  try {
    const result = await DocenteService.getById(id);

    if (result && result.success) {
      const docente = result.data;

      document.getElementById("modalDocenteTitle").textContent =
        "Editar Docente";
      document.getElementById("docente_id").value = docente.ID_docente;
      document.getElementById("nombre").value = docente.nombre;
      document.getElementById("ap_paterno").value = docente.AP_Paterno;
      document.getElementById("ap_materno").value = docente.AP_Materno || "";
      document.getElementById("carrera").value = docente.carrera;

      document.getElementById("modalDocente").style.display = "block";
    } else {
      UIHelpers.showToast(
        result?.message || "Error al cargar los datos del docente",
        "error"
      );
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
      UIHelpers.showToast(
        result?.message || "Error al eliminar el docente",
        "error"
      );
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
    nombre: formData.get("nombre"),
    AP_Paterno: formData.get("ap_paterno"),
    AP_Materno: formData.get("ap_materno"),
    carrera: formData.get("carrera"),
  };

  // Mostrar indicador de carga
  const submitButton = form.querySelector('button[type="submit"]');
  const hideLoading = UIHelpers.showLoading(
    submitButton,
    docenteId ? "Actualizando..." : "Creando..."
  );

  try {
    let result;
    if (docenteId) {
      result = await DocenteService.update(docenteId, data);
    } else {
      result = await DocenteService.create(data);
    }

    if (result && result.success) {
      const mensaje = docenteId
        ? "Docente actualizado correctamente"
        : "Docente creado correctamente";
      UIHelpers.showToast(mensaje, "success");
      document.getElementById("modalDocente").style.display = "none";
      form.reset();
      await cargarDocentes(currentSearchTerm);
    } else {
      UIHelpers.showToast(
        result?.message || "Error al procesar la solicitud",
        "error"
      );
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
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Error en logout:", error);
    // Aun si hay error, redirigir al login
    window.location.href = "../index.html";
  }
}
