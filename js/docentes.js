const BASE_URL = "../";
const modalConfirm = document.getElementById("modalConfirm");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const btnConfirmOk = document.getElementById("confirmOk");
const btnConfirmCancel = document.getElementById("confirmCancel");
const btnConfirmClose = document.getElementById("confirmClose");

document.addEventListener("DOMContentLoaded", () => {
  cargarDocentes();
  cargarRequisitos();

  // Configurar modales
  configurarModales();
});

// Función para mostrar notificaciones toast
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "warning") icon = "exclamation-triangle";
  if (type === "error") icon = "times-circle";

  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  toastContainer.appendChild(toast);

  // Eliminar el toast después de 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
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

  if (btnNuevoDocente) {
    btnNuevoDocente.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("modalDocenteTitle").textContent =
        "Nuevo Docente";
      document.getElementById("formDocente").reset();
      document.getElementById("docente_id").value = "";
      modalDocente.style.display = "block";
    };
  }

  if (btnCerrarModalDocente) {
    btnCerrarModalDocente.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      modalDocente.style.display = "none";
    };
  }

  // Modal de Requisitos
  const modalRequisito = document.getElementById("modalRequisito");
  const btnNuevoRequisito = document.getElementById("btnNuevoRequisito");
  const btnCerrarModalRequisito = document.getElementById(
    "btnCerrarModalRequisito"
  );

  // Asegurar que los modales estén cerrados al inicio
  if (modalRequisito) modalRequisito.style.display = "none";

  if (btnNuevoRequisito) {
    btnNuevoRequisito.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("modalRequisitoTitle").textContent =
        "Nuevo Requisito";
      document.getElementById("formRequisito").reset();
      document.getElementById("requisito_id").value = "";
      modalRequisito.style.display = "block";
    };
  }

  if (btnCerrarModalRequisito) {
    btnCerrarModalRequisito.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      modalRequisito.style.display = "none";
    };
  }
}

// ==================== DOCENTES ====================

// Cargar docentes
function cargarDocentes() {
  console.log(
    "Iniciando carga de docentes desde:",
    `${BASE_URL}php/docentes/leer_docentes.php`
  );

  fetch(`${BASE_URL}php/docentes/leer_docentes.php`)
    .then((response) => {
      console.log("Respuesta recibida:", response.status, response.statusText);
      console.log("Headers:", response.headers);

      // Obtener el texto plano de la respuesta primero
      return response.text().then((text) => {
        console.log("Respuesta texto completo:", text);

        // Si está vacío o es solo espacios en blanco
        if (!text || text.trim() === "") {
          throw new Error("Respuesta vacía del servidor");
        }

        try {
          // Intentar parsear el texto como JSON
          const data = JSON.parse(text);
          return data;
        } catch (e) {
          console.error("Error al parsear JSON:", e);
          throw new Error(
            `No se pudo parsear la respuesta como JSON: ${text.substring(
              0,
              100
            )}...`
          );
        }
      });
    })
    .then((data) => {
      console.log("Datos procesados correctamente:", data);
      actualizarTablaDocentes(data);
    })
    .catch((error) => {
      console.error("Error detallado:", error);
      showToast("Error al cargar los docentes: " + error.message, "error");
    });
}

// Versión de debug para probar la conectividad a PHP
function testConexion() {
  // Crear un archivo PHP simple para pruebas
  // test_conexion.php solo debe contener: <?php echo json_encode(['status' => 'ok']); ?>
  fetch(`${BASE_URL}php/test_conexion.php`)
    .then((response) => response.text())
    .then((text) => {
      console.log("Test de conexión:", text);
    })
    .catch((error) => {
      console.error("Error en test de conexión:", error);
    });
}

// Actualizar tabla de docentes
function actualizarTablaDocentes(data) {
  const tbody = document.getElementById("tbodyDocentes");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron docentes</td></tr>`;
    return;
  }

  data.forEach((docente) => {
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

// Formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX");
}

// Buscar docentes
function buscarDocentes() {
  const termino = document.getElementById("busqueda").value;

  fetch(
    `${BASE_URL}php/docentes/leer_docentes.php?search=${encodeURIComponent(
      termino
    )}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      } else {
        return response.text().then((text) => {
          console.error("Respuesta no JSON:", text);
          throw new Error("La respuesta no es un JSON válido");
        });
      }
    })
    .then((data) => {
      console.log("Datos de búsqueda:", data); // Para debug
      actualizarTablaDocentes(data);
      if (data.length === 0) {
        showToast("No se encontraron docentes con ese criterio", "info");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al buscar docentes: " + error.message, "error");
    });
}

// Abrir modal para editar docente
function abrirEdicionDocente(id) {
  fetch(`${BASE_URL}php/docentes/leer_docentes.php?id=${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("modalDocenteTitle").textContent =
        "Editar Docente";
      document.getElementById("docente_id").value = data.ID_docente;
      document.getElementById("nombre").value = data.nombre;
      document.getElementById("ap_paterno").value = data.AP_Paterno;
      document.getElementById("ap_materno").value = data.AP_Materno || "";
      document.getElementById("carrera").value = data.carrera;

      document.getElementById("modalDocente").style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al cargar los datos del docente", "error");
    });
}

// Eliminar docente
function eliminarDocente(id) {
  if (confirm("¿Estás seguro de eliminar este docente?")) {
    fetch(`${BASE_URL}php/docentes/eliminar_docente.php?id=${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la petición");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          showToast("Docente eliminado correctamente", "success");
          cargarDocentes();
        } else {
          showToast(data.message || "Error al eliminar el docente", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Error al eliminar el docente", "error");
      });
  }
}

// Guardar docente (crear o actualizar)
document.getElementById("formDocente").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const docenteId = document.getElementById("docente_id").value;

  // URL y mensaje según sea crear o actualizar
  const url = docenteId
    ? "../php/docentes/actualizar_docente.php"
    : "../php/docentes/crear_docente.php";
  const mensaje = docenteId
    ? "Docente actualizado correctamente"
    : "Docente creado correctamente";

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        showToast(mensaje, "success");
        document.getElementById("modalDocente").style.display = "none";
        this.reset();
        cargarDocentes();
      } else {
        showToast(data.message || "Error al procesar la solicitud", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al procesar la solicitud", "error");
    });
});

// ==================== REQUISITOS ====================

// Cargar requisitos
function cargarRequisitos() {
  fetch(`${BASE_URL}php/requisitos/leer_requisitos.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => actualizarTablaRequisitos(data))
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al cargar los requisitos", "error");
    });
}

// Actualizar tabla de requisitos
function actualizarTablaRequisitos(data) {
  const tbody = document.getElementById("tbodyRequisitos");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">No se encontraron requisitos</td></tr>`;
    return;
  }

  data.forEach((req, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${req.requisitoTipo}</td>
            <td>
                <button class="btn-edit" onclick="abrirEdicionRequisito(${
                  req.ID_requisitos
                })">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarRequisito(${
                  req.ID_requisitos
                })">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Buscar requisitos
function buscarRequisitos() {
  const termino = document.getElementById("busquedaRequisito").value;

  fetch(`${BASE_URL}php/requisitos/leer_requisitos.php?search=${termino}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      actualizarTablaRequisitos(data);
      if (data.length === 0) {
        showToast("No se encontraron requisitos con ese criterio", "info");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al buscar requisitos", "error");
    });
}

// Abrir modal para editar requisito
function abrirEdicionRequisito(id) {
  fetch(`${BASE_URL}php/requisitos/leer_requisitos.php?id=${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Error en la petición");
      return res.json();
    })
    .then((data) => {
      // data ahora es un objeto { ID_requisitos: ..., requisitoTipo: ... }
      document.getElementById("modalRequisitoTitle").textContent =
        "Editar Requisito";
      document.getElementById("requisito_id").value = data.ID_requisitos;
      document.getElementById("requisitoTipo").value = data.requisitoTipo;
      document.getElementById("modalRequisito").style.display = "block";
    })
    .catch((err) => {
      console.error(err);
      showToast("Error al cargar los datos del requisito", "error");
    });
}

function eliminarRequisito(id) {
  // Configura el texto del modal
  confirmTitle.textContent = "Eliminar requisito";
  confirmMessage.textContent = "¿Seguro que quieres eliminar este requisito?";
  btnConfirmOk.textContent = "Sí, eliminar";

  // Abre el modal
  modalConfirm.style.display = "flex";

  // Manejadores temporales
  function onOk() {
    // Llama al endpoint sólo al confirmar
    fetch(`${BASE_URL}php/requisitos/eliminar_requisito.php?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          showToast("Requisito eliminado correctamente", "success");
          cargarRequisitos();
        } else {
          showToast(json.error || "Error al eliminar", "error");
        }
      })
      .catch((err) => {
        console.error(err);
        showToast("Error al eliminar el requisito", "error");
      })
      .finally(closeModal);
  }
  function onCancel() {
    closeModal();
  }
  function closeModal() {
    modalConfirm.style.display = "none";
    btnConfirmOk.removeEventListener("click", onOk);
    btnConfirmCancel.removeEventListener("click", onCancel);
    btnConfirmClose.removeEventListener("click", onCancel);
  }

  btnConfirmOk.addEventListener("click", onOk);
  btnConfirmCancel.addEventListener("click", onCancel);
  btnConfirmClose.addEventListener("click", onCancel);
}

document
  .getElementById("formRequisito")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const requisitoId = document.getElementById("requisito_id").value;

    const url = requisitoId
      ? "../php/requisitos/actualizar_requisito.php"
      : "../php/requisitos/crear_requisito.php";
    const mensaje = requisitoId
      ? "Requisito actualizado correctamente"
      : "Requisito creado correctamente";

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la petición");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          showToast(mensaje, "success");
          document.getElementById("modalRequisito").style.display = "none";
          this.reset();
          cargarRequisitos();
        } else {
          showToast(data.message || "Error al procesar la solicitud", "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Error al procesar la solicitud", "error");
      });
  });

document.getElementById("busqueda").addEventListener("input", function () {
  if (this.value.length >= 2 || this.value === "") {
    buscarDocentes();
  }
});

document
  .getElementById("busquedaRequisito")
  .addEventListener("input", function () {
    if (this.value.length >= 2 || this.value === "") {
      buscarRequisitos();
    }
  });

// Función para desplazarse a la sección de requisitos
function scrollToRequisitos(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Asegurarse de que no se abran los modales
  const modalDocente = document.getElementById("modalDocente");
  const modalRequisito = document.getElementById("modalRequisito");

  if (modalDocente) modalDocente.style.display = "none";
  if (modalRequisito) modalRequisito.style.display = "none";

  const requisitosSection = document.getElementById("requisitos-section");
  if (requisitosSection) {
    requisitosSection.scrollIntoView({ behavior: "smooth" });
  }
}
