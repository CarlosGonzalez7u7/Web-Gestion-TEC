/**
 * Utilidades para impresión y exportación a PDF
 */

// Modificar la función imprimirReporteEnVentana para incluir información de estados seleccionados
function imprimirReporteEnVentana(titulo, contenido, periodo = null) {
  // Crear una nueva ventana
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    // Usar la función showToast que ya está definida en reportes.js
    if (typeof window.showToast === "function") {
      window.showToast(
        "Error: No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.",
        "error"
      );
    } else {
      console.error(
        "Error: No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos."
      );
    }
    return;
  }

  // Buscar información de estados seleccionados
  let estadosInfo = "";
  const reporteContenido = document.getElementById("reporteContenido");
  if (reporteContenido) {
    const estadosElement = reporteContenido.querySelector(
      ".reporte-header p:nth-child(4)"
    );
    if (estadosElement) {
      estadosInfo = estadosElement.textContent;
    }
  }

  // Crear contenido HTML directamente en lugar de cargar una plantilla externa
  let contenidoHTML = `
    <html>
    <head>
      <title>${titulo}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 20px;
        }
        .reporte-header { 
          text-align: center; 
          margin-bottom: 20px; 
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .reporte-header h1 {
          margin: 0;
          color: #1e40af;
          font-size: 24px;
        }
        .reporte-header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .reporte-body { 
          padding: 20px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .status-success { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-danger { color: #ef4444; }
        .estado-no-seleccionado { color: #999; text-align: center; }
        .print-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        @media print {
          body { padding: 0; margin: 0; }
        }
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

  if (estadosInfo) {
    contenidoHTML += `<p>${estadosInfo}</p>`;
  }

  contenidoHTML += `
      </div>
      <div class="reporte-body">
        ${contenido}
      </div>
      <div class="print-footer">
        <p>Sistema Académico - Reporte generado automáticamente</p>
      </div>
      <script>
        // Imprimir automáticamente cuando la página termine de cargar
        window.onload = function() {
          setTimeout(function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(contenidoHTML);
  printWindow.document.close();
}

// Función para exportar a PDF usando jsPDF
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
    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // Configurar título
    doc.setFontSize(18);
    doc.text(titulo, 14, 22);

    // Agregar fecha
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

    // Si hay una tabla, usar autoTable
    const tabla = elemento.querySelector("table");
    if (tabla) {
      doc.autoTable({
        html: tabla,
        startY: 40,
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
      const contenido = elemento.textContent.trim();
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

// Exportar funciones
window.imprimirReporteEnVentana = imprimirReporteEnVentana;
window.exportarPDFMejorado = exportarPDFMejorado;
