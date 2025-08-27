const BASE_URL = "../";
document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de la página
  console.log("Página de reportes cargada");

  // Configurar botones de reportes
  document
    .getElementById("btnReporteSemestre")
    .addEventListener("click", iniciarReporteSemestre);
  document
    .getElementById("btnReporteDocentes")
    .addEventListener("click", generarReporteDocentes);
  document
    .getElementById("btnReporteRequisitos")
    .addEventListener("click", generarReporteRequisitos);
  document
    .getElementById("btnEstadisticas")
    .addEventListener("click", mostrarEstadisticas);

  // Configurar botones de acciones
  document
    .getElementById("btnImprimir")
    .addEventListener("click", imprimirReporte);
  document
    .getElementById("btnExportarPDF")
    .addEventListener("click", exportarPDF);

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

// Hacer que showToast sea accesible globalmente
window.showToast = showToast;

// Configurar modales
function configurarModales() {
  // Modal de selección de semestre
  const modalSemestre = document.getElementById("modalSeleccionarSemestre");
  const btnCerrarModalSemestre = document.getElementById(
    "btnCerrarModalSemestre"
  );
  const btnContinuarSeleccionDocentes = document.getElementById(
    "btnContinuarSeleccionDocentes"
  );

  btnCerrarModalSemestre.addEventListener("click", () => {
    modalSemestre.classList.remove("active");
  });

  btnContinuarSeleccionDocentes.addEventListener("click", () => {
    const semestreId = document.getElementById("selectSemestre").value;
    if (!semestreId) {
      showToast("Por favor, seleccione un semestre", "warning");
      return;
    }
    modalSemestre.classList.remove("active");
    mostrarModalSeleccionarDocentes(semestreId);
  });

  // Modal de selección de docentes
  const modalDocentes = document.getElementById("modalSeleccionarDocentes");
  const btnCerrarModalDocentes = document.getElementById(
    "btnCerrarModalDocentes"
  );
  const btnVolverSeleccionSemestre = document.getElementById(
    "btnVolverSeleccionSemestre"
  );
  const btnContinuarSeleccionRequisitos = document.getElementById(
    "btnContinuarSeleccionRequisitos"
  );
  const checkTodosDocentes = document.getElementById("checkTodosDocentes");

  btnCerrarModalDocentes.addEventListener("click", () => {
    modalDocentes.classList.remove("active");
  });

  btnVolverSeleccionSemestre.addEventListener("click", () => {
    modalDocentes.classList.remove("active");
    modalSemestre.classList.add("active");
  });

  btnContinuarSeleccionRequisitos.addEventListener("click", () => {
    const docentesSeleccionados = Array.from(
      document.querySelectorAll(
        "#listaDocentesSemestre input:checked:not(#checkTodosDocentes)"
      )
    ).map((input) => input.value);

    if (docentesSeleccionados.length === 0) {
      showToast("Por favor, seleccione al menos un docente", "warning");
      return;
    }

    modalDocentes.classList.remove("active");
    mostrarModalSeleccionarRequisitos();
  });

  checkTodosDocentes.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(
      "#listaDocentesSemestre input[type='checkbox']:not(#checkTodosDocentes)"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
    });
  });

  // Modal de selección de requisitos
  const modalRequisitos = document.getElementById("modalSeleccionarRequisitos");
  const btnCerrarModalRequisitos = document.getElementById(
    "btnCerrarModalRequisitos"
  );
  const btnVolverSeleccionDocentes = document.getElementById(
    "btnVolverSeleccionDocentes"
  );
  const btnGenerarReporteSemestre = document.getElementById(
    "btnGenerarReporteSemestre"
  );
  const checkTodosRequisitos = document.getElementById("checkTodosRequisitos");

  btnCerrarModalRequisitos.addEventListener("click", () => {
    modalRequisitos.classList.remove("active");
  });

  btnVolverSeleccionDocentes.addEventListener("click", () => {
    modalRequisitos.classList.remove("active");
    modalDocentes.classList.add("active");
  });

  btnGenerarReporteSemestre.addEventListener("click", () => {
    const estadosSeleccionados = Array.from(
      document.querySelectorAll("input[name='estadoRequisito']:checked")
    ).map((input) => input.value);

    if (estadosSeleccionados.length === 0 && !checkTodosRequisitos.checked) {
      showToast(
        "Por favor, seleccione al menos un estado de requisito",
        "warning"
      );
      return;
    }

    modalRequisitos.classList.remove("active");
    generarReporteSemestreCompleto();
  });

  checkTodosRequisitos.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(
      "input[name='estadoRequisito']"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = this.checked;
      checkbox.disabled = this.checked;
    });
  });

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (event) => {
    if (event.target === modalSemestre) {
      modalSemestre.classList.remove("active");
    }
    if (event.target === modalDocentes) {
      modalDocentes.classList.remove("active");
    }
    if (event.target === modalRequisitos) {
      modalRequisitos.classList.remove("active");
    }
  });

  // Ocultar los modales al inicio
  modalSemestre.classList.remove("active");
  modalDocentes.classList.remove("active");
  modalRequisitos.classList.remove("active");
}

// Iniciar proceso de reporte de semestre
function iniciarReporteSemestre() {
  showToast("Cargando semestres...", "info");

  // Cargar semestres disponibles
  fetch(`${BASE_URL}php/bitacora/leer_semestres.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      const selectSemestre = document.getElementById("selectSemestre");
      selectSemestre.innerHTML =
        '<option value="">Seleccione un semestre</option>';

      if (data.length === 0) {
        showToast("No hay semestres registrados", "warning");
        return;
      }

      data.forEach((semestre) => {
        const option = document.createElement("option");
        option.value = semestre.ID_semestre;
        option.textContent = semestre.nomSem;
        selectSemestre.appendChild(option);
      });

      // Mostrar modal de selección de semestre
      document
        .getElementById("modalSeleccionarSemestre")
        .classList.add("active");
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al cargar los semestres", "error");
    });
}

// Mostrar modal para seleccionar docentes
function mostrarModalSeleccionarDocentes(semestreId) {
  showToast("Cargando docentes del semestre...", "info");

  // Cargar docentes del semestre seleccionado
  fetch(
    `${BASE_URL}php/bitacora/leer_docentes_semestre.php?ID_semestre=${semestreId}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      const listaDocentes = document.getElementById("listaDocentesSemestre");
      listaDocentes.innerHTML = "";

      if (data.length === 0) {
        showToast("No hay docentes asignados a este semestre", "warning");
        return;
      }

      // Guardar el ID del semestre seleccionado
      document
        .getElementById("listaDocentesSemestre")
        .setAttribute("data-semestre", semestreId);

      // Mostrar lista de docentes
      data.forEach((docente) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        label.innerHTML = `
          <input type="checkbox" value="${docente.ID_docente}"> 
          ${docente.nombre} ${docente.AP_Paterno}
        `;
        listaDocentes.appendChild(label);
      });

      // Mostrar modal de selección de docentes
      document
        .getElementById("modalSeleccionarDocentes")
        .classList.add("active");
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al cargar los docentes del semestre", "error");
    });
}

// Mostrar modal para seleccionar requisitos
function mostrarModalSeleccionarRequisitos() {
  // Resetear checkboxes
  document.getElementById("checkTodosRequisitos").checked = true;
  const checkboxes = document.querySelectorAll("input[name='estadoRequisito']");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
    checkbox.disabled = true;
  });

  // Mostrar modal de selección de requisitos
  document.getElementById("modalSeleccionarRequisitos").classList.add("active");
}

// Modificar la función generarReporteSemestreCompleto para asegurar que los estados seleccionados se pasen correctamente
function generarReporteSemestreCompleto() {
  showToast("Generando reporte de semestre...", "info");

  // Obtener datos seleccionados
  const semestreId = document
    .getElementById("listaDocentesSemestre")
    .getAttribute("data-semestre");
  const docentesSeleccionados = Array.from(
    document.querySelectorAll(
      "#listaDocentesSemestre input:checked:not(#checkTodosDocentes)"
    )
  ).map((input) => input.value);

  const checkTodosRequisitos = document.getElementById(
    "checkTodosRequisitos"
  ).checked;
  const estadosSeleccionados = checkTodosRequisitos
    ? ["Cumple", "No Cumple", "Incompleto"]
    : Array.from(
        document.querySelectorAll("input[name='estadoRequisito']:checked")
      ).map((input) => input.value);

  // Verificar que se hayan seleccionado estados
  if (estadosSeleccionados.length === 0) {
    showToast(
      "Por favor, seleccione al menos un estado de requisito",
      "warning"
    );
    return;
  }

  console.log("Estados seleccionados:", estadosSeleccionados); // Para depuración

  // Crear objeto con los parámetros
  const params = new URLSearchParams();
  params.append("ID_semestre", semestreId);
  params.append("docentes", JSON.stringify(docentesSeleccionados));
  params.append("estados", JSON.stringify(estadosSeleccionados));

  // Realizar petición para generar reporte
  fetch(
    `${BASE_URL}php/reportes/generar_reporte_semestre.php?${params.toString()}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      // Añadir los estados seleccionados a los datos
      data.estadosSeleccionados = estadosSeleccionados;

      // Depuración: Imprimir los datos recibidos para verificar los estados
      console.log("Datos recibidos del servidor:", data);

      mostrarReporteSemestre(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al generar el reporte", "error");
    });
}

// Modificar la función mostrarReporteSemestre para filtrar por estados seleccionados
function mostrarReporteSemestre(data) {
  // No eliminar el reportePreview, solo limpiar su contenido
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");
  const reporteContenido = document.getElementById("reporteContenido");

  // Obtener los estados seleccionados
  const estadosSeleccionados = data.estadosSeleccionados || [
    "Cumple",
    "No Cumple",
    "Incompleto",
  ];

  // Verificar que los elementos existan antes de modificarlos
  if (reportePreview && reporteTitle && reporteContenido) {
    reporteTitle.textContent = `Reporte del Semestre: ${data.semestre.nomSem}`;

    let html = `
      <div class="reporte-header">
        <h1>Reporte de Semestre: ${data.semestre.nomSem}</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
        <p>Período: ${formatearFecha(
          data.semestre.fecha_inicio
        )} - ${formatearFecha(data.semestre.fecha_fin)}</p>
        <p>Estados incluidos: ${estadosSeleccionados.join(", ")}</p>
      </div>
      
      <div class="reporte-body">
    `;

    // Si no hay datos
    if (data.docentes.length === 0 || data.requisitos.length === 0) {
      html += `<p class="text-center">No hay datos disponibles para este reporte</p>`;
    } else {
      // Crear tabla de reporte
      html += `
        <table class="reporte-tabla">
          <thead>
            <tr>
              <th>Docente</th>
      `;

      // Encabezados de requisitos
      data.requisitos.forEach((requisito) => {
        html += `<th>${requisito.requisitoTipo}</th>`;
      });

      html += `</tr></thead><tbody>`;

      // Filas de docentes
      data.docentes.forEach((docente) => {
        // Verificar si el docente tiene al menos un requisito que coincida con los estados seleccionados
        let docenteTieneRequisitosSeleccionados = false;
        let filasDocente = "";

        // Comenzar a construir la fila del docente
        filasDocente = `
          <tr>
            <td>${docente.nombre} ${docente.AP_Paterno}</td>
        `;

        // Celdas de estado de requisitos
        data.requisitos.forEach((requisito) => {
          const key = `${docente.ID_docente}_${requisito.ID_requisitos}`;

          // Verificar si existe el estado para este docente y requisito
          if (!data.estado[key]) {
            // Si no existe, mostrar una celda vacía
            filasDocente += `<td class="estado-no-seleccionado">-</td>`;
            return; // Continuar con el siguiente requisito
          }

          // Obtener el estado exacto de la base de datos
          const estadoExacto = data.estado[key].estado;

          // Verificar si este estado está entre los seleccionados
          if (!estadosSeleccionados.includes(estadoExacto)) {
            // Si no está seleccionado, mostrar una celda vacía
            filasDocente += `<td class="estado-no-seleccionado">-</td>`;
            return; // Continuar con el siguiente requisito
          }

          // Si llegamos aquí, el estado está seleccionado y debemos mostrarlo
          docenteTieneRequisitosSeleccionados = true;

          // Determinar la clase y el icono según el estado
          let estadoClass = "";
          let estadoIcon = "";

          if (estadoExacto === "Cumple") {
            estadoClass = "status-success";
            estadoIcon = '<i class="fas fa-check-circle"></i>';
          } else if (estadoExacto === "No Cumple") {
            estadoClass = "status-danger";
            estadoIcon = '<i class="fas fa-times-circle"></i>';
          } else if (estadoExacto === "Incompleto") {
            estadoClass = "status-warning";
            estadoIcon = '<i class="fas fa-exclamation-triangle"></i>';
          }

          // Añadir la celda con el estado correcto
          filasDocente += `
            <td class="${estadoClass}">
              ${estadoIcon} ${estadoExacto}
              ${
                data.estado[key].comentario
                  ? `<br><small>${data.estado[key].comentario}</small>`
                  : ""
              }
            </td>
          `;
        });

        filasDocente += `</tr>`;

        // Solo añadir el docente al HTML si tiene al menos un requisito en los estados seleccionados
        if (docenteTieneRequisitosSeleccionados) {
          html += filasDocente;
        }
      });

      html += `</tbody></table>`;
    }

    html += `</div>`;

    reporteContenido.innerHTML = html;
    reportePreview.style.display = "block";

    // Desplazarse al reporte
    reportePreview.scrollIntoView({ behavior: "smooth" });

    showToast("Reporte generado correctamente", "success");

    // Agregar estilos para los estados
    const style = document.createElement("style");
    style.textContent = `
      .status-success { background-color: rgba(16, 185, 129, 0.1); color: var(--success); }
      .status-warning { background-color: rgba(245, 158, 11, 0.1); color: var(--warning); }
      .status-danger { background-color: rgba(239, 68, 68, 0.1); color: var(--danger); }
      .estado-no-seleccionado { background-color: #f9f9f9; color: #999; text-align: center; }
    `;
    document.head.appendChild(style);
  } else {
    showToast("Error al mostrar el reporte: Elementos no encontrados", "error");
    console.error("Elementos no encontrados:", {
      reportePreview,
      reporteTitle,
      reporteContenido,
    });
  }
}

// Función para generar reporte de docentes
function generarReporteDocentes() {
  showToast("Generando reporte de docentes...", "info");

  fetch(`${BASE_URL}php/docentes/leer_docentes.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      mostrarReporteDocentes(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al generar el reporte", "error");
    });
}

// Función para mostrar el reporte de docentes
function mostrarReporteDocentes(docentes) {
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");
  const reporteContenido = document.getElementById("reporteContenido");

  // Verificar que los elementos existan antes de modificarlos
  if (reportePreview && reporteTitle && reporteContenido) {
    reporteTitle.textContent = "Reporte de Docentes";

    let html = `
      <div class="reporte-header">
        <h1>Reporte de Docentes</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="reporte-body">
        <table class="reporte-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Carrera</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (docentes.length === 0) {
      html += `<tr><td colspan="6" class="text-center">No hay docentes registrados</td></tr>`;
    } else {
      docentes.forEach((docente) => {
        html += `
          <tr>
            <td>${docente.ID_docente}</td>
            <td>${docente.nombre}</td>
            <td>${docente.AP_Paterno}</td>
            <td>${docente.AP_Materno || "-"}</td>
            <td>${docente.carrera}</td>
            <td>${formatearFecha(docente.fec_Regist)}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    reporteContenido.innerHTML = html;
    reportePreview.style.display = "block";

    // Desplazarse al reporte
    reportePreview.scrollIntoView({ behavior: "smooth" });

    showToast("Reporte generado correctamente", "success");
  } else {
    showToast("Error al mostrar el reporte: Elementos no encontrados", "error");
    console.error("Elementos no encontrados:", {
      reportePreview,
      reporteTitle,
      reporteContenido,
    });
  }
}

// Función para generar reporte de requisitos
function generarReporteRequisitos() {
  showToast("Generando reporte de requisitos...", "info");

  fetch(`${BASE_URL}php/requisitos/leer_requisitos.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      mostrarReporteRequisitos(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al generar el reporte", "error");
    });
}

// Función para mostrar el reporte de requisitos
function mostrarReporteRequisitos(requisitos) {
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");
  const reporteContenido = document.getElementById("reporteContenido");

  // Verificar que los elementos existan antes de modificarlos
  if (reportePreview && reporteTitle && reporteContenido) {
    reporteTitle.textContent = "Reporte de Requisitos";

    let html = `
      <div class="reporte-header">
        <h1>Reporte de Requisitos</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="reporte-body">
        <table class="reporte-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Requisito</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (requisitos.length === 0) {
      html += `<tr><td colspan="2" class="text-center">No hay requisitos registrados</td></tr>`;
    } else {
      requisitos.forEach((requisito) => {
        html += `
          <tr>
            <td>${requisito.ID_requisitos}</td>
            <td>${requisito.requisitoTipo}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>
    `;

    reporteContenido.innerHTML = html;
    reportePreview.style.display = "block";

    // Desplazarse al reporte
    reportePreview.scrollIntoView({ behavior: "smooth" });

    showToast("Reporte generado correctamente", "success");
  } else {
    showToast("Error al mostrar el reporte: Elementos no encontrados", "error");
    console.error("Elementos no encontrados:", {
      reportePreview,
      reporteTitle,
      reporteContenido,
    });
  }
}

// Función para mostrar estadísticas
function mostrarEstadisticas() {
  showToast("Generando estadísticas...", "info");

  // Cargar datos reales desde el servidor
  fetch(`${BASE_URL}php/reportes/estadisticas_generales.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la petición");
      }
      return response.json();
    })
    .then((data) => {
      mostrarEstadisticasGenerales(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("Error al generar las estadísticas", "error");
    });
}

// Función para mostrar estadísticas generales
function mostrarEstadisticasGenerales(data) {
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");
  const reporteContenido = document.getElementById("reporteContenido");

  // Verificar que los elementos existan antes de modificarlos
  if (reportePreview && reporteTitle && reporteContenido) {
    reporteTitle.textContent = "Estadísticas Generales";

    const html = `
      <div class="reporte-header">
        <h1>Estadísticas Generales</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="reporte-body">
        <div class="estadisticas-grid">
          <div class="estadistica-card">
            <div class="estadistica-titulo">Total de Docentes</div>
            <div class="estadistica-valor">${data.totalDocentes}</div>
          </div>
          
          <div class="estadistica-card">
            <div class="estadistica-titulo">Total de Requisitos</div>
            <div class="estadistica-valor">${data.totalRequisitos}</div>
          </div>
          
          <div class="estadistica-card">
            <div class="estadistica-titulo">Semestres Activos</div>
            <div class="estadistica-valor">${data.totalSemestres}</div>
          </div>
          
          <div class="estadistica-card">
            <div class="estadistica-titulo">Requisitos Cumplidos</div>
            <div class="estadistica-valor">${data.porcentajeCumplimiento}%</div>
          </div>
        </div>
        
        <div class="estadisticas-info">
          <h3>Distribución de Estados</h3>
          <table class="reporte-tabla">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cumple</td>
                <td>${data.estadosCumplimiento.cumple}</td>
                <td>${data.estadosCumplimiento.porcentajeCumple}%</td>
              </tr>
              <tr>
                <td>No Cumple</td>
                <td>${data.estadosCumplimiento.noCumple}</td>
                <td>${data.estadosCumplimiento.porcentajeNoCumple}%</td>
              </tr>
              <tr>
                <td>Incompleto</td>
                <td>${data.estadosCumplimiento.incompleto}</td>
                <td>${data.estadosCumplimiento.porcentajeIncompleto}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    reporteContenido.innerHTML = html;
    reportePreview.style.display = "block";

    // Desplazarse al reporte
    reportePreview.scrollIntoView({ behavior: "smooth" });

    showToast("Estadísticas generadas correctamente", "success");
  } else {
    showToast(
      "Error al mostrar las estadísticas: Elementos no encontrados",
      "error"
    );
    console.error("Elementos no encontrados:", {
      reportePreview,
      reporteTitle,
      reporteContenido,
    });
  }
}

// Declarar las funciones imprimirReporteEnVentana y exportarPDFMejorado
function imprimirReporteEnVentana(titulo, contenido, periodo) {
  const ventanaImpresion = window.open("", "_blank");
  if (!ventanaImpresion) {
    throw new Error(
      "No se pudo abrir la ventana de impresión. Por favor, verifica la configuración de tu navegador."
    );
  }

  let contenidoHTML = `
    <html>
    <head>
      <title>${titulo}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .reporte-header { text-align: center; margin-bottom: 20px; }
        .reporte-body { padding: 20px; }
        .reporte-tabla { width: 100%; border-collapse: collapse; }
        .reporte-tabla th, .reporte-tabla td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .reporte-tabla th { background-color: #f2f2f2; }
        .estado-no-seleccionado { display: none; }
      </style>
    </head>
    <body>
      <div class="reporte-header">
        <h1>${titulo}</h1>
        <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
  `;

  if (periodo) {
    contenidoHTML += `<p>${periodo}</p>`;
  }

  contenidoHTML += `
      </div>
      <div class="reporte-body">
        ${contenido}
      </div>
    </body>
    </html>
  `;

  ventanaImpresion.document.write(contenidoHTML);
  ventanaImpresion.document.close();

  ventanaImpresion.focus(); // Asegura que la ventana esté enfocada antes de imprimir
  ventanaImpresion.print();
  ventanaImpresion.close();
}

// Modificar la función exportarPDFMejorado para incluir solo los estados seleccionados
function exportarPDFMejorado(elementoID, titulo) {
  const elemento = document.getElementById(elementoID);

  if (!elemento) {
    if (typeof window.showToast === "function") {
      window.showToast("Error: No se encontró el elemento a exportar", "error");
    } else {
      console.error("Error: No se encontró el elemento a exportar");
    }
    return;
  }

  if (typeof window.showToast === "function") {
    window.showToast("Generando PDF, por favor espere...", "info");
  }

  try {
    // Crear una copia del elemento para modificarlo sin afectar la visualización
    const elementoCopia = elemento.cloneNode(true);

    // Ocultar las celdas con estado-no-seleccionado
    const celdasNoSeleccionadas = elementoCopia.querySelectorAll(
      ".estado-no-seleccionado"
    );
    celdasNoSeleccionadas.forEach((celda) => {
      celda.style.display = "none";
    });

    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // Configurar título
    doc.setFontSize(18);
    doc.text(titulo, 14, 22);

    // Agregar fecha
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

    // Obtener información de estados incluidos si existe
    const estadosInfo = elementoCopia.querySelector(
      ".reporte-header p:nth-child(4)"
    );
    if (estadosInfo) {
      doc.setFontSize(10);
      doc.text(estadosInfo.textContent, 14, 36);
    }

    // Si hay una tabla, usar autoTable
    const tabla = elementoCopia.querySelector("table");
    if (tabla) {
      doc.autoTable({
        html: tabla,
        startY: estadosInfo ? 42 : 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 64, 175] },
        margin: { top: 40 },
        didDrawPage: (data) => {
          // Agregar pie de página
          doc.setFontSize(8);
          doc.text(
            "Sistema Académico - Reporte generado automáticamente",
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });
    } else {
      // Si no hay tabla, capturar el contenido como texto
      const contenido = elementoCopia.textContent.trim();
      doc.setFontSize(10);
      doc.text(contenido, 14, 40, { maxWidth: 180 });
    }

    // Guardar el PDF
    const nombreArchivo = `${titulo.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(nombreArchivo);

    if (typeof window.showToast === "function") {
      window.showToast(
        `PDF generado correctamente: ${nombreArchivo}`,
        "success"
      );
    }
  } catch (error) {
    console.error("Error al generar PDF:", error);
    if (typeof window.showToast === "function") {
      window.showToast("Error al generar el PDF: " + error.message, "error");
    }
  }
}

// Reemplazar la función imprimirReporte para usar la nueva utilidad
function imprimirReporte() {
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");
  const reporteContenido = document.getElementById("reporteContenido");

  if (
    !reportePreview ||
    !reporteTitle ||
    !reporteContenido ||
    reportePreview.style.display === "none"
  ) {
    showToast("Error: No hay reporte para imprimir", "error");
    return;
  }

  showToast("Preparando impresión...", "info");

  try {
    // Obtener el título y contenido del reporte
    const titulo = reporteTitle.textContent || "Reporte";

    // Crear una copia del contenido para modificarlo
    const contenidoElement = reporteContenido.cloneNode(true);

    // Ocultar las celdas con estado-no-seleccionado
    const celdasNoSeleccionadas = contenidoElement.querySelectorAll(
      ".estado-no-seleccionado"
    );
    celdasNoSeleccionadas.forEach((celda) => {
      celda.style.display = "none";
    });

    const contenido = contenidoElement.innerHTML;

    // Obtener el período si existe
    let periodo = null;
    const periodoElement = reporteContenido.querySelector(
      ".reporte-header p:nth-child(3)"
    );
    if (periodoElement) {
      periodo = periodoElement.textContent;
    }

    // Usar la nueva función de impresión en ventana separada
    window.imprimirReporteEnVentana(titulo, contenido, periodo);
  } catch (error) {
    console.error("Error al imprimir:", error);
    showToast("Error al imprimir: " + error.message, "error");
  }
}

// Reemplazar la función exportarPDF para usar la nueva utilidad
function exportarPDF() {
  const reportePreview = document.getElementById("reportePreview");
  const reporteTitle = document.getElementById("reporteTitle");

  if (
    !reportePreview ||
    !reporteTitle ||
    reportePreview.style.display === "none"
  ) {
    showToast("Error: No hay reporte para exportar", "error");
    return;
  }

  try {
    // Obtener el título del reporte
    const titulo = reporteTitle.textContent || "Reporte";

    // Usar la función de exportación a PDF
    window.exportarPDFMejorado("reporteContenido", titulo);
  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    showToast("Error al exportar a PDF: " + error.message, "error");
  }
}

// Función para formatear fecha
function formatearFecha(fechaStr) {
  if (!fechaStr) return "-";
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX");
}
