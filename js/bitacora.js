const BASE_URL = "https://tecuruapan.edu.mx/iscasd/";

document.addEventListener("DOMContentLoaded", () => {
  cargarSemestres();
  cargarDocentesRequisitos();

  // Configurar búsqueda en tiempo real para semestres
  document
    .getElementById("busquedaSemestre")
    .addEventListener("input", debounce(cargarSemestres, 300));

  // Configurar el overlay del formulario de nuevo semestre
  const btnNuevoSemestre = document.getElementById("btnNuevoSemestre");
  const semestreFormOverlay = document.getElementById("semestreFormOverlay");
  const btnCerrarFormSemestre = document.getElementById(
    "btnCerrarFormSemestre"
  );

  btnNuevoSemestre.addEventListener("click", () => {
    semestreFormOverlay.style.display = "flex";
  });

  btnCerrarFormSemestre.addEventListener("click", () => {
    semestreFormOverlay.style.display = "none";
  });

  // Cerrar al hacer clic fuera del formulario
  semestreFormOverlay.addEventListener("click", (e) => {
    if (e.target === semestreFormOverlay) {
      semestreFormOverlay.style.display = "none";
    }
  });

  // Configurar el modal de editar docentes
  const editarDocentesModal = document.getElementById("editarDocentesModal");
  const btnCerrarEditarDocentes = document.getElementById(
    "btnCerrarEditarDocentes"
  );

  btnCerrarEditarDocentes.addEventListener("click", () => {
    editarDocentesModal.style.display = "none";
  });

  editarDocentesModal.addEventListener("click", (e) => {
    if (e.target === editarDocentesModal) {
      editarDocentesModal.style.display = "none";
    }
  });

  // Configurar el modal de confirmación de eliminación
  const confirmarEliminarModal = document.getElementById(
    "confirmarEliminarModal"
  );
  const btnCerrarConfirmarEliminar = document.getElementById(
    "btnCerrarConfirmarEliminar"
  );
  const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

  btnCerrarConfirmarEliminar.addEventListener("click", () => {
    confirmarEliminarModal.style.display = "none";
  });

  btnCancelarEliminar.addEventListener("click", () => {
    confirmarEliminarModal.style.display = "none";
  });

  confirmarEliminarModal.addEventListener("click", (e) => {
    if (e.target === confirmarEliminarModal) {
      confirmarEliminarModal.style.display = "none";
    }
  });

  btnConfirmarEliminar.addEventListener("click", () => {
    ejecutarEliminarSemestre();
  });
});

// Función para debounce (evitar múltiples llamadas durante la escritura)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

document
  .getElementById("formSemestre")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch(`${BASE_URL}/php/bitacora/crear_semestre.php`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        this.reset();
        cargarSemestres();
        showToast("Semestre creado exitosamente", "success");
        document.getElementById("semestreFormOverlay").style.display = "none";
      })
      .catch((error) => {
        showToast("Error al crear el semestre", "error");
      });
  });

function cargarSemestres() {
  const termino = document.getElementById("busquedaSemestre")?.value || "";
  fetch(`${BASE_URL}php/bitacora/leer_semestres.php?search=${termino}`)
    .then((res) => res.json())
    .then((data) => {
      const lista = document.getElementById("listaSemestres");
      lista.innerHTML = "";

      if (data.length === 0) {
        lista.innerHTML = `<li class="no-results">No se encontraron semestres</li>`;
        return;
      }

      data.forEach((sem) => {
        const li = document.createElement("li");

        // Nombre del semestre
        const nombre = document.createElement("span");
        nombre.textContent = sem.nomSem;
        nombre.classList.add("semestre-nombre");
        nombre.onclick = () => seleccionarSemestre(sem.ID_semestre, sem.nomSem);

        li.appendChild(nombre);

        // Contenedor para botones
        const actions = document.createElement("div");
        actions.classList.add("semestre-actions");

        // Botón de configuración solo si no está configurado
        if (!sem.configurado) {
          const btnConfig = document.createElement("button");
          btnConfig.innerHTML = `<i class="fas fa-cog"></i> Configurar`;
          btnConfig.classList.add("btn-configurar");
          btnConfig.onclick = (e) => {
            e.stopPropagation();
            configurarSemestre(sem.ID_semestre, sem.nomSem);
          };
          actions.appendChild(btnConfig);
        }

        // Botón de eliminar para todos los semestres
        const btnEliminar = document.createElement("button");
        btnEliminar.innerHTML = `<i class="fas fa-trash-alt"></i> Eliminar`;
        btnEliminar.classList.add("btn-eliminar");
        btnEliminar.onclick = (e) => {
          e.stopPropagation();
          mostrarConfirmacionEliminar(sem.ID_semestre, sem.nomSem);
        };
        actions.appendChild(btnEliminar);

        li.appendChild(actions);
        lista.appendChild(li);
      });
    })
    .catch((error) => {
      showToast("Error al cargar los semestres", "error");
    });
}

let semestreSeleccionado = null;
let docentesSemestre = [];
let requisitosSemestre = [];

// Modificar la función seleccionarSemestre para asegurar que los botones se configuren
function seleccionarSemestre(id, nombre) {
  semestreSeleccionado = id;
  document.getElementById("configuracionSemestre").style.display = "none";
  document.getElementById("nombreSemestreTabla").textContent = nombre;
  document.getElementById("tablaBitacora").style.display = "block";
  mostrarBitacora();
  showToast(`Semestre "${nombre}" seleccionado`, "info");

  // Asegurar que los botones se configuren después de que se muestre la bitácora
  setTimeout(configurarBotonesAccion, 100);
}

function cargarDocentesRequisitos() {
  fetch(`${BASE_URL}php/docentes/leer_docentes.php`)
    .then((res) => res.json())
    .then((data) => {
      const cont = document.getElementById("checkDocentes");
      cont.innerHTML = "";
      data.forEach((d) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        label.innerHTML = `
          <input type="checkbox" value="${d.ID_docente}"> 
          ${d.nombre} ${d.AP_Paterno}
        `;
        cont.appendChild(label);
      });
    })
    .catch((error) => {
      showToast("Error al cargar los docentes", "error");
    });

  fetch(`${BASE_URL}php/requisitos/leer_requisitos.php`)
    .then((res) => res.json())
    .then((data) => {
      const cont = document.getElementById("checkRequisitos");
      cont.innerHTML = "";
      data.forEach((r) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        label.innerHTML = `
          <input type="checkbox" value="${r.ID_requisitos}"> 
          ${r.requisitoTipo}
        `;
        cont.appendChild(label);
      });
    })
    .catch((error) => {
      showToast("Error al cargar los requisitos", "error");
    });
}

function guardarConfiguracion() {
  const docentes = Array.from(
    document.querySelectorAll("#checkDocentes input:checked")
  ).map((i) => i.value);

  const requisitos = Array.from(
    document.querySelectorAll("#checkRequisitos input:checked")
  ).map((i) => i.value);

  if (docentes.length === 0 || requisitos.length === 0) {
    showToast(
      "Debes seleccionar al menos un docente y un requisito",
      "warning"
    );
    return;
  }

  const formData = new FormData();
  formData.append("ID_semestre", semestreSeleccionado);
  formData.append("docentes", JSON.stringify(docentes));
  formData.append("requisitos", JSON.stringify(requisitos));

  fetch(`${BASE_URL}php/bitacora/guardar_configuracion.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then(() => {
      showToast("Configuración guardada correctamente", "success");
      document.getElementById("configuracionSemestre").style.display = "none";
      document.getElementById("tablaBitacora").style.display = "block";
      mostrarBitacora();
      cargarSemestres(); // Actualizar la lista para reflejar la configuración
    })
    .catch((error) => {
      showToast("Error al guardar la configuración", "error");
    });
}

// Configurar los botones de acción de la bitácora cuando se muestra
function configurarBotonesAccion() {
  // Botón para editar docentes
  const btnEditarDocentes = document.getElementById("btnEditarDocentes");
  if (btnEditarDocentes) {
    btnEditarDocentes.addEventListener("click", mostrarEditarDocentesModal);
  }

  // Botón para eliminar semestre
  const btnEliminarSemestre = document.getElementById("btnEliminarSemestre");
  if (btnEliminarSemestre) {
    btnEliminarSemestre.addEventListener("click", eliminarSemestre);
  }
}

function mostrarBitacora() {
  fetch(
    `${BASE_URL}php/bitacora/leer_bitacora.php?ID_semestre=${semestreSeleccionado}`
  )
    .then((res) => res.json())
    .then((data) => {
      const contenedor = document.getElementById("contenedorBitacora");
      const docentes = data.docentes;
      const requisitos = data.requisitos;
      const estado = data.estado;

      // Guardar los docentes y requisitos del semestre para usarlos en la edición
      docentesSemestre = docentes;
      requisitosSemestre = requisitos;

      if (docentes.length === 0 || requisitos.length === 0) {
        contenedor.innerHTML = `<div class="empty-state">
            <i class="fas fa-info-circle"></i>
            <p>No hay docentes o requisitos asignados. Configura primero el semestre.</p>
            <button onclick="configurarSemestre(${semestreSeleccionado}, document.getElementById('nombreSemestreTabla').textContent)" class="btn btn-primary">
              <i class="fas fa-cog"></i> Configurar Ahora
            </button>
          </div>`;
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Docente</th>`;

      // Ahora los requisitos van en las columnas (cabecera)
      requisitos.forEach((req) => {
        html += `<th>${req.requisitoTipo}</th>`;
      });

      html += `</tr></thead><tbody id="tablaDocentesBody">`;

      // Ahora los docentes van en las filas
      docentes.forEach((doc) => {
        html += `<tr class="docente-row" data-docente="${doc.nombre.toLowerCase()} ${doc.AP_Paterno.toLowerCase()}">
                  <td class="docente-name">${doc.nombre} ${
          doc.AP_Paterno
        }</td>`;

        // Para cada requisito, creamos una celda
        requisitos.forEach((req) => {
          const key = `${doc.ID_docente}_${req.ID_requisitos}`;
          const celda = estado[key] || { estado: "Incompleto", comentario: "" };

          let estadoClass = "";
          let estadoIcon = "";

          if (celda.estado === "Cumple") {
            estadoClass = "status-success";
            estadoIcon = '<i class="fas fa-check-circle"></i>';
          } else if (celda.estado === "No Cumple") {
            estadoClass = "status-danger";
            estadoIcon = '<i class="fas fa-times-circle"></i>';
          } else {
            estadoClass = "status-warning";
            estadoIcon = '<i class="fas fa-exclamation-triangle"></i>';
          }

          html += `
            <td class="${estadoClass}">
              <select onchange="actualizarEstado(${semestreSeleccionado}, ${
            doc.ID_docente
          }, ${req.ID_requisitos}, this)">
                <option value="Cumple" ${
                  celda.estado === "Cumple" ? "selected" : ""
                }>✅ Cumple</option>
                <option value="No Cumple" ${
                  celda.estado === "No Cumple" ? "selected" : ""
                }>❌ No Cumple</option>
                <option value="Incompleto" ${
                  celda.estado === "Incompleto" ? "selected" : ""
                }>⚠️ Incompleto</option>
              </select>
              <textarea 
                rows="2" 
                placeholder="Agregar comentario..." 
                onchange="actualizarComentario(${semestreSeleccionado}, ${
            doc.ID_docente
          }, ${req.ID_requisitos}, this)"
              >${celda.comentario || ""}</textarea>
            </td>`;
        });

        html += `</tr>`;
      });

      html += `</tbody></table>`;
      contenedor.innerHTML = html;

      // Configurar la búsqueda de docentes
      configurarBusquedaDocentes();

      // Configurar los botones de acción
      configurarBotonesAccion();
    })
    .catch((error) => {
      showToast("Error al cargar la bitácora", "error");
    });
}

// Función para filtrar docentes en la tabla
function configurarBusquedaDocentes() {
  const inputBusqueda = document.getElementById("busquedaDocente");
  if (!inputBusqueda) return;

  inputBusqueda.addEventListener("input", function () {
    const termino = this.value.toLowerCase().trim();
    const filas = document.querySelectorAll("#tablaDocentesBody tr");

    filas.forEach((fila) => {
      const docenteData = fila.getAttribute("data-docente");
      if (docenteData.includes(termino)) {
        fila.style.display = "";
        fila.classList.add("highlight-row");
      } else {
        if (termino === "") {
          fila.style.display = "";
          fila.classList.remove("highlight-row");
        } else {
          fila.style.display = "none";
        }
      }
    });

    if (termino === "") {
      filas.forEach((fila) => {
        fila.classList.remove("highlight-row");
      });
    }
  });
}

function actualizarEstado(idSem, idDoc, idReq, select) {
  const formData = new FormData();
  formData.append("ID_semestre", idSem);
  formData.append("ID_docente", idDoc);
  formData.append("ID_requisito", idReq);
  formData.append("estado", select.value);

  fetch(`${BASE_URL}php/bitacora/actualizar_estado.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      showToast("Estado actualizado correctamente", "success");

      // Actualizar la clase de la celda para el estilo visual
      const td = select.closest("td");
      td.className = "";

      if (select.value === "Cumple") {
        td.classList.add("status-success");
      } else if (select.value === "No Cumple") {
        td.classList.add("status-danger");
      } else {
        td.classList.add("status-warning");
      }
    })
    .catch((error) => {
      showToast("Error al actualizar el estado", "error");
    });
}

function actualizarComentario(idSem, idDoc, idReq, textarea) {
  const formData = new FormData();
  formData.append("ID_semestre", idSem);
  formData.append("ID_docente", idDoc);
  formData.append("ID_requisito", idReq);
  formData.append("comentario", textarea.value);

  fetch(`${BASE_URL}php/bitacora/actualizar_comentario.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      showToast("Comentario guardado correctamente", "success");
    })
    .catch((error) => {
      showToast("Error al guardar el comentario", "error");
    });
}

function configurarSemestre(id, nombre) {
  semestreSeleccionado = id;
  document.getElementById("configuracionSemestre").style.display = "block";
  document.getElementById("tablaBitacora").style.display = "none";
  document.getElementById("nombreSemestre").textContent = nombre;
  showToast(`Configurando semestre "${nombre}"`, "info");
}

// Función para mostrar el modal de confirmación de eliminación
function mostrarConfirmacionEliminar(id, nombre) {
  semestreSeleccionado = id;
  document.getElementById("nombreSemestreEliminar").textContent = nombre;
  document.getElementById("confirmarEliminarModal").style.display = "flex";
}

// Función para ejecutar la eliminación del semestre
function ejecutarEliminarSemestre() {
  fetch(
    `${BASE_URL}php/bitacora/eliminar_semestre.php?id=${semestreSeleccionado}`,
    {
      method: "DELETE",
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Semestre eliminado correctamente", "success");
        document.getElementById("confirmarEliminarModal").style.display =
          "none";

        // Si estamos viendo la bitácora del semestre eliminado, volvemos a la lista
        if (document.getElementById("tablaBitacora").style.display !== "none") {
          document.getElementById("tablaBitacora").style.display = "none";
        }

        cargarSemestres(); // Actualizar la lista de semestres
      } else {
        showToast(data.message || "Error al eliminar el semestre", "error");
      }
    })
    .catch((error) => {
      showToast("Error al eliminar el semestre", "error");
    });
}

// Función para eliminar semestre desde la vista de bitácora
function eliminarSemestre() {
  const nombreSemestre = document.getElementById(
    "nombreSemestreTabla"
  ).textContent;
  mostrarConfirmacionEliminar(semestreSeleccionado, nombreSemestre);
}

// Función para mostrar el modal de edición de docentes
function mostrarEditarDocentesModal() {
  // Cargar todos los docentes disponibles
  fetch(`${BASE_URL}php/docentes/leer_docentes.php`)
    .then((res) => res.json())
    .then((todosDocentes) => {
      const listaDocentesActuales = document.getElementById(
        "listaDocentesActuales"
      );
      const listaDocentesDisponibles = document.getElementById(
        "listaDocentesDisponibles"
      );

      listaDocentesActuales.innerHTML = "";
      listaDocentesDisponibles.innerHTML = "";

      // IDs de docentes actuales
      const docentesActualesIds = docentesSemestre.map((d) => d.ID_docente);

      // Mostrar docentes actuales
      docentesSemestre.forEach((docente) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        label.innerHTML = `
          <input type="checkbox" value="${docente.ID_docente}" checked> 
          ${docente.nombre} ${docente.AP_Paterno}
        `;
        listaDocentesActuales.appendChild(label);
      });

      // Mostrar docentes disponibles (que no están en el semestre)
      todosDocentes.forEach((docente) => {
        if (!docentesActualesIds.includes(docente.ID_docente)) {
          const label = document.createElement("label");
          label.className = "checkbox-item";
          label.innerHTML = `
            <input type="checkbox" value="${docente.ID_docente}"> 
            ${docente.nombre} ${docente.AP_Paterno}
          `;
          listaDocentesDisponibles.appendChild(label);
        }
      });

      // Mostrar el modal
      document.getElementById("editarDocentesModal").style.display = "flex";
    })
    .catch((error) => {
      showToast("Error al cargar los docentes", "error");
    });
}

// Función para guardar los cambios en la edición de docentes
function guardarEdicionDocentes() {
  // Obtener docentes seleccionados (actuales y nuevos)
  const docentesActualesSeleccionados = Array.from(
    document.querySelectorAll("#listaDocentesActuales input:checked")
  ).map((i) => i.value);

  const docentesNuevosSeleccionados = Array.from(
    document.querySelectorAll("#listaDocentesDisponibles input:checked")
  ).map((i) => i.value);

  // Combinar todos los docentes seleccionados
  const todosDocentesSeleccionados = [
    ...docentesActualesSeleccionados,
    ...docentesNuevosSeleccionados,
  ];

  if (todosDocentesSeleccionados.length === 0) {
    showToast("Debes seleccionar al menos un docente", "warning");
    return;
  }

  // Obtener los IDs de requisitos actuales
  const requisitosIds = requisitosSemestre.map((r) => r.ID_requisitos);

  const formData = new FormData();
  formData.append("ID_semestre", semestreSeleccionado);
  formData.append("docentes", JSON.stringify(todosDocentesSeleccionados));
  formData.append("requisitos", JSON.stringify(requisitosIds));
  formData.append("actualizar", "true"); // Indicar que es una actualización

  fetch(`${BASE_URL}php/bitacora/actualizar_docentes_semestre.php`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Docentes actualizados correctamente", "success");
        document.getElementById("editarDocentesModal").style.display = "none";
        mostrarBitacora(); // Actualizar la bitácora
      } else {
        showToast(data.message || "Error al actualizar los docentes", "error");
      }
    })
    .catch((error) => {
      showToast("Error al actualizar los docentes", "error");
    });
}

// Añadir estilos dinámicos para estados
const styleElement = document.createElement("style");
styleElement.textContent = `
  .status-success { background-color: rgba(16, 185, 129, 0.1); }
  .status-warning { background-color: rgba(245, 158, 11, 0.1); }
  .status-danger { background-color: rgba(239, 68, 68, 0.1); }
  
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
  }
  
  .empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--primary-light);
  }
  
  .no-results {
    text-align: center;
    padding: 1rem;
    color: var(--text-light);
    background-color: transparent !important;
  }
`;
document.head.appendChild(styleElement);
