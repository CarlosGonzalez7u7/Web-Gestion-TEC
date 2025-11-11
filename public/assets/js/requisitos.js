// Estado de la aplicación
let currentSearchTerm = "";

// Timer para debounce
let searchRequisitosTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Cerrar el modal desde que se carga la página por si las dudas
  const modalRequisito = document.getElementById("modalRequisito");
  if (modalRequisito) modalRequisito.style.display = "none";

  // Verificar autenticación
  await checkAuthentication();

  // Cargar datos iniciales
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
  const modalRequisito = document.getElementById("modalRequisito");
  const btnNuevoRequisito = document.getElementById("btnNuevoRequisito");
  const btnCerrarModalRequisito = document.getElementById(
    "btnCerrarModalRequisito"
  );

  // Asegurar que el modal esté cerrado al inicio
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

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (event) => {
    if (event.target === modalRequisito) {
      modalRequisito.style.display = "none";
    }
  });
}

// Configurar eventos adicionales
function configurarEventos() {
  // Formulario de requisito
  const formRequisito = document.getElementById("formRequisito");
  if (formRequisito) {
    formRequisito.addEventListener("submit", guardarRequisito);
  }

  // Búsqueda de requisitos
  const btnBuscarRequisitos = document.getElementById("btnBuscarRequisitos");
  if (btnBuscarRequisitos) {
    btnBuscarRequisitos.addEventListener("click", buscarRequisitos);
  }

  // Búsqueda en tiempo real para requisitos
  const busquedaRequisitoInput = document.getElementById("busquedaRequisito");
  if (busquedaRequisitoInput) {
    console.log("Campo de búsqueda de requisitos encontrado");

    busquedaRequisitoInput.addEventListener("input", (e) => {
      console.log("Evento input detectado en requisitos:", e.target.value);

      // Cancelar el timer anterior si existe
      if (searchRequisitosTimer) {
        clearTimeout(searchRequisitosTimer);
      }

      // Crear un nuevo timer que ejecutará la búsqueda después de 150ms (búsqueda casi instantánea)
      searchRequisitosTimer = setTimeout(() => {
        console.log("Ejecutando búsqueda automática de requisitos");
        buscarRequisitos();
      }, 150);
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
    console.error("Campo de búsqueda de requisitos NO encontrado");
  }

  // Logout
  const logoutLinks = document.querySelectorAll('a[href="index.html"]');
  logoutLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  });
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
  currentSearchTerm = termino;

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
      document.getElementById("requisito_id").value = requisito.id;
      document.getElementById("requisitoTipo").value = requisito.nombre;

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
      await cargarRequisitos(currentSearchTerm);
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
      await cargarRequisitos(currentSearchTerm);
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
