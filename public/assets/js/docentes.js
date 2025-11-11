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

// Timers para debounce
let searchDocentesTimer = null;
let searchRequisitosTimer = null;

// Almacenar todos los docentes para filtrado local
let todosLosDocentes = [];

// Almacenar todos los docentes para filtrado local
let todosLosDocentes = [];

// Almacenar todos los docentes para filtrado local
let todosLosDocentes = [];

// Almacenar todos los docentes para filtrado local
let todosLosDocentes = [];

// Almacenar todos los docentes para filtrado local
let todosLosDocentes = [];

document.addEventListener("DOMContentLoaded", async () => {
  // cerramos los modales desde que se carga la pagina por si las dudas
  const modalDocente = document.getElementById("modalDocente");
  const modalRequisito = document.getElementById("modalRequisito");
  if (modalDocente) modalDocente.style.display = "none";
  if (modalRequisito) modalRequisito.style.display = "none";

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

  // Asegurar que los modales estén cerrados al inicio
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

  // Modal de Requisitos
  const modalRequisito = document.getElementById("modalRequisito");
  const btnNuevoRequisito = document.getElementById("btnNuevoRequisito");
  const btnCerrarModalRequisito = document.getElementById(
    "btnCerrarModalRequisito"
  );

  // Asegurar que los modales estén cerrados al inicio
  if (modalRequisito) modalRequisito.style.display = "none";

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
  const btnBuscarDocentes = document.getElementById("btnBuscarDocentes");
  if (btnBuscarDocentes) {
    btnBuscarDocentes.addEventListener("click", buscarDocentes);
  }

  // Búsqueda en tiempo real para docentes
  const busquedaInput = document.getElementById("busqueda");
  if (busquedaInput) {
    console.log("Campo de búsqueda de docentes encontrado");

    busquedaInput.addEventListener("input", (e) => {
      console.log("Evento input detectado:", e.target.value);

      // Cancelar el timer anterior si existe
      if (searchDocentesTimer) {
        clearTimeout(searchDocentesTimer);
      }

      // Crear un nuevo timer que ejecutará la búsqueda después de 150ms (búsqueda casi instantánea)
      searchDocentesTimer = setTimeout(() => {
        console.log("Ejecutando búsqueda automática");
        buscarDocentes();
      }, 150);
    });

    // También mantener el evento Enter para búsqueda inmediata
    busquedaInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("Enter presionado - búsqueda inmediata");
        // Cancelar el timer si existe
        if (searchDocentesTimer) {
          clearTimeout(searchDocentesTimer);
        }
        buscarDocentes();
      }
    });
  } else {
    console.error("Campo de búsqueda de docentes NO encontrado");
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  }

  // Búsqueda de requisitos
  const btnBuscarRequisitos = document.getElementById("btnBuscarRequisitos");
  if (btnBuscarRequisitos) {
    btnBuscarRequisitos.addEventListener("click", buscarRequisitos);
  }

  // Búsqueda en tiempo real para requisitos
  const busquedaRequisitoInput = document.getElementById("busquedaRequisito");
  if (busquedaRequisitoInput) {
    console.log("✅ Campo de búsqueda de requisitos encontrado");

    busquedaRequisitoInput.addEventListener("input", (e) => {
      console.log("🔍 Evento input detectado en requisitos:", e.target.value);

      // Cancelar el timer anterior si existe
      if (searchRequisitosTimer) {
        clearTimeout(searchRequisitosTimer);
      }

      // Crear un nuevo timer que ejecutará la búsqueda después de 500ms
      searchRequisitosTimer = setTimeout(() => {
        console.log("⏰ Ejecutando búsqueda automática de requisitos");
        buscarRequisitos();
      }, 500);
    });

    // También mantener el evento Enter para búsqueda inmediata
    busquedaRequisitoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        console.log("⚡ Enter presionado - búsqueda inmediata de requisitos");
        // Cancelar el timer si existe
        if (searchRequisitosTimer) {
          clearTimeout(searchRequisitosTimer);
        }
        buscarRequisitos();
      }
    });
  } else {
    console.error("❌ Campo de búsqueda de requisitos NO encontrado");
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }

  // Logout
  const logoutLinks = document.querySelectorAll('a[href="index.html"], a[href="../index.html"]');
  logoutLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  });

  // Detectar scroll para actualizar sidebar automáticamente
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.addEventListener("scroll", () => {
      const docentesSection = document.getElementById("docentes-section");
      const requisitosSection = document.getElementById("requisitos-section");
      const sidebarItems = document.querySelectorAll(".sidebar-menu li");

      if (!docentesSection || !requisitosSection) return;

      const scrollPosition = mainContent.scrollTop + 100; // offset para mejor detección
      const docentesTop = docentesSection.offsetTop;
      const requisitosTop = requisitosSection.offsetTop;

      // Determinar qué sección está visible
      if (scrollPosition >= requisitosTop) {
        // Estamos en requisitos
        sidebarItems.forEach((item) => item.classList.remove("active"));
        const requisitosItem = document.querySelector(
          ".sidebar-menu li:nth-child(3)"
        );
        if (requisitosItem) requisitosItem.classList.add("active");
      } else if (scrollPosition >= docentesTop) {
        // Estamos en docentes
        sidebarItems.forEach((item) => item.classList.remove("active"));
        const docentesItem = document.querySelector(
          ".sidebar-menu li:nth-child(2)"
        );
        if (docentesItem) docentesItem.classList.add("active");
      }
    });
  }
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
      // Guardar todos los docentes para filtrado local
      todosLosDocentes = result.data.docentes || [];
      
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

  console.log("Buscando docentes con término:", termino);

  // Si no hay término de búsqueda, mostrar todos
  if (!termino) {
    actualizarTablaDocentes(todosLosDocentes);
    return;
  }

  // Filtrar localmente usando includes (búsqueda parcial)
  const terminoLower = termino.toLowerCase();
  const docentesFiltrados = todosLosDocentes.filter(docente => {
    const nombreCompleto = `${docente.nombre} ${docente.AP_Paterno} ${docente.AP_Materno || ''}`.toLowerCase();
    const cedula = (docente.cedula || '').toLowerCase();
    
    return nombreCompleto.includes(terminoLower) || cedula.includes(terminoLower);
  });

  console.log("Docentes filtrados:", docentesFiltrados.length);

  // Actualizar la tabla con los resultados filtrados
  actualizarTablaDocentes(docentesFiltrados);
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

// ==================== REQUISITOS ====================

// Cargar requisitos
async function cargarRequisitos(search = "") {
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
      UIHelpers.showToast(
        result?.message || "Error al cargar los requisitos",
        "error"
      );
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
  const termino =
    document.getElementById("busquedaRequisito")?.value?.trim() || "";

  // Mostrar indicador de búsqueda
  const searchContainer = document.querySelector(
    "#requisitos-section .search-container"
  );
  if (searchContainer) {
    searchContainer.classList.add("searching");
  }

  try {
    await cargarRequisitos(termino);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    UIHelpers.showToast("Error al buscar requisitos", "error");
  } finally {
    // Quitar indicador de búsqueda
    if (searchContainer) {
      searchContainer.classList.remove("searching");
    }
  }
}

// Abrir modal para editar requisito
async function abrirEdicionRequisito(id) {
  try {
    const result = await RequisitoService.getById(id);

    if (result && result.success) {
      const requisito = result.data;

      document.getElementById("modalRequisitoTitle").textContent =
        "Editar Requisito";
      document.getElementById("requisito_id").value = requisito.id; // Usar 'id' en lugar de 'ID_requisitos'
      document.getElementById("requisitoTipo").value = requisito.nombre; // Usar 'nombre' en lugar de 'requisitoTipo'

      document.getElementById("modalRequisito").style.display = "block";
    } else {
      UIHelpers.showToast(
        result?.message || "Error al cargar los datos del requisito",
        "error"
      );
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
      UIHelpers.showToast(
        result?.message || "Error al eliminar el requisito",
        "error"
      );
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
    requisitoTipo: formData.get("requisitoTipo"),
  };

  // Mostrar indicador de carga
  const submitButton = form.querySelector('button[type="submit"]');
  const hideLoading = UIHelpers.showLoading(
    submitButton,
    requisitoId ? "Actualizando..." : "Creando..."
  );

  try {
    let result;
    if (requisitoId) {
      result = await RequisitoService.update(requisitoId, data);
    } else {
      result = await RequisitoService.create(data);
    }

    if (result && result.success) {
      const mensaje = requisitoId
        ? "Requisito actualizado correctamente"
        : "Requisito creado correctamente";
      UIHelpers.showToast(mensaje, "success");
      document.getElementById("modalRequisito").style.display = "none";
      form.reset();
      await cargarRequisitos();
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
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error en logout:", error);
    // Aun si hay error, redirigir al login
    window.location.href = "index.html";
  }
}

// Funciones de utilidad para scrolling suave
function scrollToRequisitos(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Cerrar modales si están abiertos
  const modalDocente = document.getElementById("modalDocente");
  const modalRequisitos = document.getElementById("modalRequisito");
  if (modalDocente) modalDocente.style.display = "none";
  if (modalRequisitos) modalRequisitos.style.display = "none";

  // Actualizar clase active en el sidebar
  const sidebarItems = document.querySelectorAll(".sidebar-menu li");
  sidebarItems.forEach((item) => item.classList.remove("active"));

  // Marcar el item de Requisitos como activo en caso de que se seleccione
  const requisitosItem = document.querySelector(
    ".sidebar-menu li:nth-child(3)"
  );
  if (requisitosItem) {
    requisitosItem.classList.add("active");
  }

  // Hacer scroll a la sección de requisitos
  const requisitosDeSeccion = document.getElementById("requisitos-section");
  if (requisitosDeSeccion)
    requisitosDeSeccion.scrollIntoView({ behavior: "smooth" });
}
