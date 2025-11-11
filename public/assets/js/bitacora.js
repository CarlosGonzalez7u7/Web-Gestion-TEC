// Estado de la aplicación
let editarSemestreId = null;
let currentSemesterId = null;
let semestreSeleccionado = null;
let todosDocentes = [];
let todosRequisitos = [];
let todosSemestres = [];

// Timer para debounce de búsqueda
let searchDocentesTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  await checkAuthentication();
  
  // Cargar semestres
  await cargarSemestres();
  
  // Cargar docentes y requisitos
  await cargarDocentes();
  await cargarRequisitos();
  
  // Configurar eventos básicos
  configurarEventosBasicos();
  configurarEventosSemestre();
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

// Configurar eventos básicos
function configurarEventosBasicos() {
  // Configurar logout
  const logoutLinks = document.querySelectorAll('a[href="index.html"], a[href="../index.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
    });
  });
}

// Configurar eventos de semestre
function configurarEventosSemestre() {
  // Botón nuevo semestre
  const btnNuevoSemestre = document.getElementById('btnNuevoSemestre');
  if (btnNuevoSemestre) {
    btnNuevoSemestre.addEventListener('click', () => {
      editarSemestreId = null; // Asegurar que estamos en modo crear
      document.getElementById('formSemestre').reset(); // Limpiar el formulario
      
      // Cambiar título y botón a modo crear
      document.querySelector('#semestreFormOverlay .overlay-header h2').innerHTML = '<i class="fas fa-plus-circle"></i> Crear Nuevo Semestre';
      document.querySelector('#formSemestre button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Crear Semestre';
      
      document.getElementById('semestreFormOverlay').style.display = 'flex';
    });
  }

  // Botón cerrar formulario
  const btnCerrarForm = document.getElementById('btnCerrarFormSemestre');
  if (btnCerrarForm) {
    btnCerrarForm.addEventListener('click', () => {
      document.getElementById('semestreFormOverlay').style.display = 'none';
      document.getElementById('formSemestre').reset();
      editarSemestreId = null; // Limpiar el ID al cerrar
      
      // Restaurar título y botón a modo crear
      document.querySelector('#semestreFormOverlay .overlay-header h2').innerHTML = '<i class="fas fa-plus-circle"></i> Crear Nuevo Semestre';
      document.querySelector('#formSemestre button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Crear Semestre';
    });
  }

  // Formulario de crear/editar semestre
  const formSemestre = document.getElementById('formSemestre');
  if (formSemestre) {
    formSemestre.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Si editarSemestreId tiene un valor, estamos editando; si no, estamos creando
      if (editarSemestreId) {
        await actualizarSemestre(editarSemestreId);
      } else {
        await crearSemestre();
      }
    });
  }

  // Master checkbox para docentes
  const masterDocentes = document.getElementById('masterDocentes');
  if (masterDocentes) {
    masterDocentes.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#checkDocentes input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Master checkbox para requisitos
  const masterRequisitos = document.getElementById('masterRequisitos');
  if (masterRequisitos) {
    masterRequisitos.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#checkRequisitos input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Master checkbox para docentes actuales en modal de edición
  const masterDocentesActuales = document.getElementById('masterDocentesActuales');
  if (masterDocentesActuales) {
    masterDocentesActuales.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#listaDocentesActuales input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Master checkbox para docentes disponibles en modal de edición
  const masterDocentesDisponibles = document.getElementById('masterDocentesDisponibles');
  if (masterDocentesDisponibles) {
    masterDocentesDisponibles.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#listaDocentesDisponibles input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Master checkbox para requisitos actuales en modal de edición
  const masterRequisitosActuales = document.getElementById('masterRequisitosActuales');
  if (masterRequisitosActuales) {
    masterRequisitosActuales.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#listaRequisitosActuales input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Master checkbox para requisitos disponibles en modal de edición
  const masterRequisitosDisponibles = document.getElementById('masterRequisitosDisponibles');
  if (masterRequisitosDisponibles) {
    masterRequisitosDisponibles.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('#listaRequisitosDisponibles input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Botón Editar Docentes
  const btnEditarDocentes = document.getElementById('btnEditarDocentes');
  if (btnEditarDocentes) {
    btnEditarDocentes.addEventListener('click', () => {
      if (currentSemesterId) {
        abrirModalEditarDocentes(currentSemesterId);
      }
    });
  }

  // Botón Cerrar modal de editar docentes
  const btnCerrarEditarDocentes = document.getElementById('btnCerrarEditarDocentes');
  if (btnCerrarEditarDocentes) {
    btnCerrarEditarDocentes.addEventListener('click', () => {
      document.getElementById('editarDocentesModal').style.display = 'none';
    });
  }

  // Botón Editar Requisitos
  const btnEditarRequisitos = document.getElementById('btnEditarRequisitos');
  if (btnEditarRequisitos) {
    btnEditarRequisitos.addEventListener('click', () => {
      if (currentSemesterId) {
        abrirModalEditarRequisitos(currentSemesterId);
      }
    });
  }

  // Botón Cerrar modal de editar requisitos
  const btnCerrarEditarRequisitos = document.getElementById('btnCerrarEditarRequisitos');
  if (btnCerrarEditarRequisitos) {
    btnCerrarEditarRequisitos.addEventListener('click', () => {
      document.getElementById('editarRequisitosModal').style.display = 'none';
    });
  }

  // Botón Eliminar Semestre
  const btnEliminarSemestre = document.getElementById('btnEliminarSemestre');
  if (btnEliminarSemestre) {
    btnEliminarSemestre.addEventListener('click', () => {
      if (currentSemesterId) {
        eliminarSemestreDesdeTabla(currentSemesterId);
      }
    });
  }

  // Botón Volver a lista de semestres
  const btnVolverSemestres = document.getElementById('btnVolverSemestres');
  if (btnVolverSemestres) {
    btnVolverSemestres.addEventListener('click', () => {
      volverAListaSemestres();
    });
  }

  // Modal de confirmación de eliminación
  const btnCerrarConfirmarEliminar = document.getElementById('btnCerrarConfirmarEliminar');
  if (btnCerrarConfirmarEliminar) {
    btnCerrarConfirmarEliminar.addEventListener('click', () => {
      document.getElementById('confirmarEliminarModal').style.display = 'none';
      semestreAEliminarId = null;
      eliminarDesdeTabla = false;
    });
  }

  const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
  if (btnCancelarEliminar) {
    btnCancelarEliminar.addEventListener('click', () => {
      document.getElementById('confirmarEliminarModal').style.display = 'none';
      semestreAEliminarId = null;
      eliminarDesdeTabla = false;
    });
  }

  const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener('click', async () => {
      await ejecutarEliminacionSemestre();
    });
  }

  // Búsqueda de semestres
  const busquedaSemestre = document.getElementById('busquedaSemestre');
  if (busquedaSemestre) {
    busquedaSemestre.addEventListener('input', (e) => {
      filtrarSemestres(e.target.value);
    });
  }

  // Búsqueda de docentes en la tabla
  const busquedaDocente = document.getElementById('busquedaDocente');
  if (busquedaDocente) {
    console.log("Campo de búsqueda de docentes encontrado");

    busquedaDocente.addEventListener('input', (e) => {
      console.log("Evento input detectado:", e.target.value);

      // Cancelar el timer anterior si existe
      if (searchDocentesTimer) {
        clearTimeout(searchDocentesTimer);
      }

      // Crear un nuevo timer que ejecutará la búsqueda después de 150ms (búsqueda casi instantánea)
      searchDocentesTimer = setTimeout(() => {
        console.log("Ejecutando búsqueda automática");
        filtrarDocentesEnTabla(e.target.value);
      }, 150);
    });

    // También mantener el evento Enter para búsqueda inmediata
    busquedaDocente.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log("Enter presionado - búsqueda inmediata");
        // Cancelar el timer si existe
        if (searchDocentesTimer) {
          clearTimeout(searchDocentesTimer);
        }
        filtrarDocentesEnTabla(e.target.value);
      }
    });
  } else {
    console.error("Campo de búsqueda de docentes NO encontrado");
  }
}

// Filtrar semestres por búsqueda
function filtrarSemestres(busqueda) {
  if (!todosSemestres || todosSemestres.length === 0) return;

  const busquedaLower = busqueda.toLowerCase().trim();

  // Si la búsqueda está vacía, mostrar todos los semestres
  if (busquedaLower === '') {
    mostrarSemestres(todosSemestres);
    return;
  }

  // Filtrar semestres que coincidan con el nombre o fechas
  const semestresFiltrados = todosSemestres.filter(semestre => {
    const nombre = semestre.nomSem.toLowerCase();
    const fechaInicio = formatearFecha(semestre.fecha_inicio).toLowerCase();
    const fechaFin = formatearFecha(semestre.fecha_fin).toLowerCase();
    
    return nombre.includes(busquedaLower) || 
           fechaInicio.includes(busquedaLower) || 
           fechaFin.includes(busquedaLower);
  });

  mostrarSemestres(semestresFiltrados);
}

// Filtrar docentes en la tabla de bitácora
function filtrarDocentesEnTabla(busqueda) {
  const tabla = document.querySelector('.bitacora-table tbody');
  if (!tabla) return;

  const filas = tabla.querySelectorAll('tr');
  const busquedaLower = busqueda.toLowerCase().trim();

  filas.forEach(fila => {
    const nombreDocente = fila.querySelector('.docente-name');
    if (nombreDocente) {
      const texto = nombreDocente.textContent.toLowerCase();
      if (texto.includes(busquedaLower)) {
        fila.style.display = '';
      } else {
        fila.style.display = 'none';
      }
    }
  });
}

// Volver a la lista de semestres
function volverAListaSemestres() {
  document.getElementById('tablaBitacora').style.display = 'none';
  document.getElementById('semestresList').style.display = 'block';
  currentSemesterId = null;
  semestreSeleccionado = null;
}

// Logout
async function logout() {
  try {
    await AuthService.logout();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error en logout:', error);
    window.location.href = 'index.html';
  }
}

// ==================== CARGAR DATOS ====================

// Cargar semestres
async function cargarSemestres() {
  try {
    const result = await SemestreService.getAll();
    
    if (result && result.success) {
      todosSemestres = result.data || [];
      mostrarSemestres(todosSemestres);
    } else {
      UIHelpers.showToast('Error al cargar semestres', 'error');
    }
  } catch (error) {
    console.error('Error cargando semestres:', error);
    UIHelpers.showToast('Error al cargar semestres', 'error');
  }
}

// Mostrar semestres en la lista
function mostrarSemestres(semestres) {
  const lista = document.getElementById('listaSemestres');
  if (!lista) return;

  lista.innerHTML = '';

  if (!semestres || semestres.length === 0) {
    lista.innerHTML = '<li class="empty-message">No hay semestres registrados</li>';
    return;
  }

  semestres.forEach(semestre => {
    const li = document.createElement('li');
    li.className = 'semestre-item';
    li.innerHTML = `
      <div class="semestre-info" onclick="verBitacora(${semestre.ID_semestre})" style="cursor: pointer;">
        <h3>${semestre.nomSem}</h3>
        <p>${formatearFecha(semestre.fecha_inicio)} - ${formatearFecha(semestre.fecha_fin)}</p>
      </div>
      <div class="semestre-actions">
        <button class="btn-eliminar" onclick="eliminarSemestre(${semestre.ID_semestre})">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
        <button class="btn-editar" onclick="editarSemestre(${semestre.ID_semestre})">
          <i class="fas fa-edit"></i> Editar
        </button>
      </div>
    `;
    lista.appendChild(li);
  });
}

// Cargar docentes
async function cargarDocentes() {
  try {
    const result = await DocenteService.getAll();
    
    if (result && result.success && result.data && result.data.docentes) {
      todosDocentes = result.data.docentes;
    }
  } catch (error) {
    console.error('Error cargando docentes:', error);
  }
}

// Cargar requisitos
async function cargarRequisitos() {
  try {
    const result = await RequisitoService.getAll();
    
    if (result && result.success) {
      // Mapear los datos del backend (nombre) a requisitoTipo
      todosRequisitos = (result.data || []).map(req => ({
        id: req.id,
        requisitoTipo: req.nombre || req.requisitoTipo,
        ID_requisitos: req.id
      }));
      console.log('Requisitos cargados:', todosRequisitos);
    }
  } catch (error) {
    console.error('Error cargando requisitos:', error);
  }
}

// ==================== CREAR SEMESTRE ====================

async function crearSemestre() {
  const nomSem = document.getElementById('nomSem').value.trim();
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;

  if (!nomSem || !fecha_inicio || !fecha_fin) {
    UIHelpers.showToast('Por favor completa todos los campos', 'warning');
    return;
  }

  try {
    const result = await SemestreService.create({
      nomSem,
      fecha_inicio,
      fecha_fin
    });

    if (result && result.success) {
      UIHelpers.showToast('Semestre creado exitosamente', 'success');
      document.getElementById('semestreFormOverlay').style.display = 'none';
      document.getElementById('formSemestre').reset();
      editarSemestreId = null; // Limpiar el ID después de crear
      
      // Restaurar título y botón a modo crear
      document.querySelector('#semestreFormOverlay .overlay-header h2').innerHTML = '<i class="fas fa-plus-circle"></i> Crear Nuevo Semestre';
      document.querySelector('#formSemestre button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Crear Semestre';
      
      await cargarSemestres();
    } else {
      UIHelpers.showToast(result?.message || 'Error al crear semestre', 'error');
    }
  } catch (error) {
    console.error('Error creando semestre:', error);
    UIHelpers.showToast('Error al crear semestre', 'error');
  }
}

// ==================== ELIMINAR SEMESTRE ====================

// Variable para almacenar temporalmente el ID y origen del semestre a eliminar
let semestreAEliminarId = null;
let eliminarDesdeTabla = false;

// Mostrar modal de confirmación de eliminación
function mostrarModalEliminarSemestre(id, desdeTabla = false) {
  semestreAEliminarId = id;
  eliminarDesdeTabla = desdeTabla;
  
  // Obtener el nombre del semestre para mostrarlo en el modal
  let nombreSemestre = 'este semestre';
  
  if (desdeTabla && semestreSeleccionado) {
    nombreSemestre = semestreSeleccionado.nomSem;
  } else {
    // Buscar el semestre en el array de semestres
    const semestre = todosSemestres.find(s => s.ID_semestre == id);
    if (semestre) {
      nombreSemestre = semestre.nomSem;
    }
  }
  
  document.getElementById('nombreSemestreEliminar').textContent = nombreSemestre;
  document.getElementById('confirmarEliminarModal').style.display = 'flex';
}

async function eliminarSemestre(id) {
  mostrarModalEliminarSemestre(id, false);
}

// Eliminar semestre desde la tabla de bitácora
async function eliminarSemestreDesdeTabla(id) {
  mostrarModalEliminarSemestre(id, true);
}

// Ejecutar la eliminación del semestre
async function ejecutarEliminacionSemestre() {
  if (!semestreAEliminarId) return;
  
  const id = semestreAEliminarId;
  const desdeTabla = eliminarDesdeTabla;
  
  // Cerrar el modal
  document.getElementById('confirmarEliminarModal').style.display = 'none';
  
  try {
    const result = await SemestreService.delete(id);

    if (result && result.success) {
      UIHelpers.showToast(result.message || 'Semestre eliminado exitosamente', 'success');
      
      if (desdeTabla) {
        // Volver a la lista de semestres
        document.getElementById('tablaBitacora').style.display = 'none';
        document.getElementById('semestresList').style.display = 'block';
        currentSemesterId = null;
        semestreSeleccionado = null;
      }
      
      // Recargar la lista
      await cargarSemestres();
    } else {
      UIHelpers.showToast(result?.message || 'Error al eliminar semestre', 'error');
    }
  } catch (error) {
    console.error('Error eliminando semestre:', error);
    UIHelpers.showToast('Error al eliminar semestre', 'error');
  } finally {
    // Limpiar variables temporales
    semestreAEliminarId = null;
    eliminarDesdeTabla = false;
  }
}

// ==================== EDITAR SEMESTRE ====================

async function editarSemestre(id) {
  try {
    const result = await SemestreService.getById(id);
    
    if (result && result.success) {
      const semestre = result.data;
      
      // Establecer el ID del semestre a editar
      editarSemestreId = id;
      
      // Llenar el formulario con los datos del semestre
      document.getElementById('nomSem').value = semestre.nomSem;
      document.getElementById('fecha_inicio').value = semestre.fecha_inicio;
      document.getElementById('fecha_fin').value = semestre.fecha_fin;
      
      // Cambiar título y botón a modo editar
      document.querySelector('#semestreFormOverlay .overlay-header h2').innerHTML = '<i class="fas fa-edit"></i> Editar Semestre';
      document.querySelector('#formSemestre button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
      
      // Mostrar el modal
      document.getElementById('semestreFormOverlay').style.display = 'flex';
    }
  } catch (error) {
    console.error('Error cargando semestre:', error);
    UIHelpers.showToast('Error al cargar datos del semestre', 'error');
  }
}

async function actualizarSemestre(id) {
  const nomSem = document.getElementById('nomSem').value.trim();
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;

  if (!nomSem || !fecha_inicio || !fecha_fin) {
    UIHelpers.showToast('Por favor completa todos los campos', 'warning');
    return;
  }

  try {
    const result = await SemestreService.update(id, {
      nomSem,
      fecha_inicio,
      fecha_fin
    });

    if (result && result.success) {
      UIHelpers.showToast('Semestre actualizado exitosamente', 'success');
      document.getElementById('semestreFormOverlay').style.display = 'none';
      document.getElementById('formSemestre').reset();
      editarSemestreId = null;
      
      // Restaurar título y botón a modo crear
      document.querySelector('#semestreFormOverlay .overlay-header h2').innerHTML = '<i class="fas fa-plus-circle"></i> Crear Nuevo Semestre';
      document.querySelector('#formSemestre button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Crear Semestre';
      
      await cargarSemestres();
    } else {
      UIHelpers.showToast(result?.message || 'Error al actualizar semestre', 'error');
    }
  } catch (error) {
    console.error('Error actualizando semestre:', error);
    UIHelpers.showToast('Error al actualizar semestre', 'error');
  }
}

// ==================== CONFIGURAR SEMESTRE ====================

async function configurarSemestre(id) {
  currentSemesterId = id;
  
  try {
    const result = await SemestreService.getById(id);
    
    if (result && result.success) {
      semestreSeleccionado = result.data;
      
      // Ocultar lista y mostrar configuración
      document.getElementById('semestresList').style.display = 'none';
      document.getElementById('configuracionSemestre').style.display = 'block';
      document.getElementById('nombreSemestre').textContent = semestreSeleccionado.nomSem;
      
      // Cargar docentes y requisitos actuales del semestre
      await cargarDocentesSemestre(id);
      await cargarRequisitosSemestre(id);
    }
  } catch (error) {
    console.error('Error:', error);
    UIHelpers.showToast('Error al cargar configuración', 'error');
  }
}

async function cargarDocentesSemestre(semestreId) {
  const container = document.getElementById('checkDocentes');
  if (!container) return;

  try {
    // Obtener docentes del semestre
    const result = await SemestreService.getDocentes(semestreId);
    const docentesSemestre = result.success ? result.data : [];
    const idsDocentesSemestre = docentesSemestre.map(d => d.ID_docente);

    container.innerHTML = '';

    todosDocentes.forEach(docente => {
      const checked = idsDocentesSemestre.includes(docente.ID_docente);
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      div.innerHTML = `
        <label>
          <input type="checkbox" value="${docente.ID_docente}" ${checked ? 'checked' : ''} />
          ${docente.nombre} ${docente.AP_Paterno} ${docente.AP_Materno || ''}
        </label>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando docentes del semestre:', error);
  }
}

async function cargarRequisitosSemestre(semestreId) {
  const container = document.getElementById('checkRequisitos');
  if (!container) return;

  try {
    // Obtener requisitos del semestre
    const result = await SemestreService.getRequisitos(semestreId);
    const requisitosSemestre = result.success ? result.data : [];
    const idsRequisitosSemestre = requisitosSemestre.map(r => r.ID_requisitos);

    container.innerHTML = '';

    todosRequisitos.forEach(requisito => {
      const checked = idsRequisitosSemestre.includes(requisito.id);
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      div.innerHTML = `
        <label>
          <input type="checkbox" value="${requisito.id}" ${checked ? 'checked' : ''} />
          ${requisito.nombre}
        </label>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando requisitos del semestre:', error);
  }
}

async function guardarConfiguracion() {
  if (!currentSemesterId) {
    UIHelpers.showToast('No hay semestre seleccionado', 'error');
    return;
  }

  // Obtener docentes seleccionados
  const docentesCheckboxes = document.querySelectorAll('#checkDocentes input[type="checkbox"]:checked');
  const docentes = Array.from(docentesCheckboxes).map(cb => cb.value);

  // Obtener requisitos seleccionados
  const requisitosCheckboxes = document.querySelectorAll('#checkRequisitos input[type="checkbox"]:checked');
  const requisitos = Array.from(requisitosCheckboxes).map(cb => cb.value);

  try {
    const result = await SemestreService.saveConfiguration(currentSemesterId, {
      docentes,
      requisitos
    });

    if (result && result.success) {
      UIHelpers.showToast('Configuración guardada exitosamente', 'success');
      
      // Cerrar el modal de configuración
      document.getElementById('configuracionSemestre').style.display = 'none';
      
      // Recargar la bitácora para mostrar los cambios
      await cargarBitacora(currentSemesterId);
      
      // Mantener visible la tabla de bitácora
      document.getElementById('tablaBitacora').style.display = 'block';
      document.getElementById('semestresList').style.display = 'none';
    } else {
      UIHelpers.showToast(result?.message || 'Error al guardar configuración', 'error');
    }
  } catch (error) {
    console.error('Error guardando configuración:', error);
    UIHelpers.showToast('Error al guardar configuración', 'error');
  }
}

// ==================== EDITAR REQUISITOS MODAL ====================

async function abrirModalEditarRequisitos(semestreId) {
  try {
    // Obtener requisitos del semestre
    const result = await SemestreService.getRequisitos(semestreId);
    const requisitosActuales = result.success ? result.data : [];
    const idsRequisitosActuales = requisitosActuales.map(r => r.ID_requisitos);

    // Separar requisitos actuales y disponibles
    const actuales = todosRequisitos.filter(r => idsRequisitosActuales.includes(r.id));
    const disponibles = todosRequisitos.filter(r => !idsRequisitosActuales.includes(r.id));

    // Llenar lista de requisitos actuales
    const containerActuales = document.getElementById('listaRequisitosActuales');
    containerActuales.innerHTML = '';
    
    if (actuales.length === 0) {
      containerActuales.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">No hay requisitos asignados</p>';
    } else {
      actuales.forEach(requisito => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <label>
            <input type="checkbox" value="${requisito.id}" checked />
            <span>${requisito.requisitoTipo}</span>
          </label>
        `;
        containerActuales.appendChild(div);
      });
    }

    // Llenar lista de requisitos disponibles
    const containerDisponibles = document.getElementById('listaRequisitosDisponibles');
    containerDisponibles.innerHTML = '';
    
    if (disponibles.length === 0) {
      containerDisponibles.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">Todos los requisitos están asignados</p>';
    } else {
      disponibles.forEach(requisito => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <label>
            <input type="checkbox" value="${requisito.id}" />
            <span>${requisito.requisitoTipo}</span>
          </label>
        `;
        containerDisponibles.appendChild(div);
      });
    }

    // Mostrar modal
    document.getElementById('editarRequisitosModal').style.display = 'flex';
  } catch (error) {
    console.error('Error cargando requisitos:', error);
    UIHelpers.showToast('Error al cargar requisitos', 'error');
  }
}

async function guardarEdicionRequisitos() {
  if (!currentSemesterId) {
    UIHelpers.showToast('No hay semestre seleccionado', 'error');
    return;
  }

  // Obtener todos los requisitos seleccionados (actuales checked + disponibles checked)
  const actualesChecked = document.querySelectorAll('#listaRequisitosActuales input[type="checkbox"]:checked');
  const disponiblesChecked = document.querySelectorAll('#listaRequisitosDisponibles input[type="checkbox"]:checked');
  
  const requisitosSeleccionados = [
    ...Array.from(actualesChecked).map(cb => cb.value),
    ...Array.from(disponiblesChecked).map(cb => cb.value)
  ];

  // Validar que se hayan seleccionado requisitos
  if (requisitosSeleccionados.length === 0) {
    UIHelpers.showToast('Debe seleccionar al menos un requisito', 'warning');
    return;
  }

  // Obtener todos los docentes actuales del semestre
  try {
    const docentesResult = await SemestreService.getDocentes(currentSemesterId);
    const docentesActuales = docentesResult.success ? docentesResult.data : [];
    const idsDocentes = docentesActuales.map(d => d.ID_docente);

    // Si no hay docentes asignados, usar todos los docentes disponibles
    let docentesParaGuardar = idsDocentes;
    if (docentesParaGuardar.length === 0) {
      // Si es un semestre nuevo sin docentes, asignar todos los docentes disponibles
      docentesParaGuardar = todosDocentes.map(d => d.ID_docente);
      
      if (docentesParaGuardar.length === 0) {
        UIHelpers.showToast('No hay docentes disponibles. Por favor, cree docentes primero.', 'warning');
        return;
      }
    }

    // Guardar configuración con los docentes y los nuevos requisitos
    const result = await SemestreService.saveConfiguration(currentSemesterId, {
      docentes: docentesParaGuardar,
      requisitos: requisitosSeleccionados
    });

    if (result && result.success) {
      UIHelpers.showToast('Requisitos actualizados exitosamente', 'success');
      
      // Cerrar el modal
      document.getElementById('editarRequisitosModal').style.display = 'none';
      
      // Recargar la bitácora para mostrar los cambios
      await cargarBitacora(currentSemesterId);
      
      // Mantener visible la tabla de bitácora
      document.getElementById('tablaBitacora').style.display = 'block';
      document.getElementById('semestresList').style.display = 'none';
    } else {
      UIHelpers.showToast(result?.message || 'Error al actualizar requisitos', 'error');
    }
  } catch (error) {
    console.error('Error guardando requisitos:', error);
    UIHelpers.showToast('Error al actualizar requisitos', 'error');
  }
}

// ==================== EDITAR DOCENTES MODAL ====================

async function abrirModalEditarDocentes(semestreId) {
  try {
    // Obtener docentes del semestre
    const result = await SemestreService.getDocentes(semestreId);
    const docentesActuales = result.success ? result.data : [];
    const idsDocentesActuales = docentesActuales.map(d => d.ID_docente);

    // Separar docentes actuales y disponibles
    const actuales = todosDocentes.filter(d => idsDocentesActuales.includes(d.ID_docente));
    const disponibles = todosDocentes.filter(d => !idsDocentesActuales.includes(d.ID_docente));

    // Llenar lista de docentes actuales
    const containerActuales = document.getElementById('listaDocentesActuales');
    containerActuales.innerHTML = '';
    
    if (actuales.length === 0) {
      containerActuales.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">No hay docentes asignados</p>';
    } else {
      actuales.forEach(docente => {
        const nombreCompleto = `${docente.nombre} ${docente.AP_Paterno} ${docente.AP_Materno || ''}`.trim();
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <label>
            <input type="checkbox" value="${docente.ID_docente}" checked />
            <span>${nombreCompleto}</span>
          </label>
        `;
        containerActuales.appendChild(div);
      });
    }

    // Llenar lista de docentes disponibles
    const containerDisponibles = document.getElementById('listaDocentesDisponibles');
    containerDisponibles.innerHTML = '';
    
    if (disponibles.length === 0) {
      containerDisponibles.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">Todos los docentes están asignados</p>';
    } else {
      disponibles.forEach(docente => {
        const nombreCompleto = `${docente.nombre} ${docente.AP_Paterno} ${docente.AP_Materno || ''}`.trim();
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <label>
            <input type="checkbox" value="${docente.ID_docente}" />
            <span>${nombreCompleto}</span>
          </label>
        `;
        containerDisponibles.appendChild(div);
      });
    }

    // Mostrar modal
    document.getElementById('editarDocentesModal').style.display = 'flex';
  } catch (error) {
    console.error('Error cargando docentes:', error);
    UIHelpers.showToast('Error al cargar docentes', 'error');
  }
}

async function guardarEdicionDocentes() {
  if (!currentSemesterId) {
    UIHelpers.showToast('No hay semestre seleccionado', 'error');
    return;
  }

  // Obtener todos los docentes seleccionados (actuales checked + disponibles checked)
  const actualesChecked = document.querySelectorAll('#listaDocentesActuales input[type="checkbox"]:checked');
  const disponiblesChecked = document.querySelectorAll('#listaDocentesDisponibles input[type="checkbox"]:checked');
  
  const docentesSeleccionados = [
    ...Array.from(actualesChecked).map(cb => cb.value),
    ...Array.from(disponiblesChecked).map(cb => cb.value)
  ];

  // Validar que se hayan seleccionado docentes
  if (docentesSeleccionados.length === 0) {
    UIHelpers.showToast('Debe seleccionar al menos un docente', 'warning');
    return;
  }

  // Obtener todos los requisitos actuales del semestre
  try {
    const requisitosResult = await SemestreService.getRequisitos(currentSemesterId);
    const requisitosActuales = requisitosResult.success ? requisitosResult.data : [];
    const idsRequisitos = requisitosActuales.map(r => r.ID_requisitos);

    // Si no hay requisitos asignados, usar todos los requisitos disponibles
    let requisitosParaGuardar = idsRequisitos;
    if (requisitosParaGuardar.length === 0) {
      // Si es un semestre nuevo sin requisitos, asignar todos los requisitos disponibles
      requisitosParaGuardar = todosRequisitos.map(r => r.id);
      
      if (requisitosParaGuardar.length === 0) {
        UIHelpers.showToast('No hay requisitos disponibles. Por favor, cree requisitos primero.', 'warning');
        return;
      }
    }

    // Guardar configuración con los nuevos docentes y los requisitos
    const result = await SemestreService.saveConfiguration(currentSemesterId, {
      docentes: docentesSeleccionados,
      requisitos: requisitosParaGuardar
    });

    if (result && result.success) {
      UIHelpers.showToast('Docentes actualizados exitosamente', 'success');
      
      // Cerrar el modal
      document.getElementById('editarDocentesModal').style.display = 'none';
      
      // Recargar la bitácora para mostrar los cambios
      await cargarBitacora(currentSemesterId);
      
      // Mantener visible la tabla de bitácora
      document.getElementById('tablaBitacora').style.display = 'block';
      document.getElementById('semestresList').style.display = 'none';
    } else {
      UIHelpers.showToast(result?.message || 'Error al actualizar docentes', 'error');
    }
  } catch (error) {
    console.error('Error guardando docentes:', error);
    UIHelpers.showToast('Error al actualizar docentes', 'error');
  }
}

// ==================== VER BITÁCORA ====================

async function verBitacora(id) {
  currentSemesterId = id;
  
  try {
    const result = await SemestreService.getById(id);
    
    if (result && result.success) {
      semestreSeleccionado = result.data;
      
      // Ocultar lista y mostrar bitácora
      document.getElementById('semestresList').style.display = 'none';
      document.getElementById('tablaBitacora').style.display = 'block';
      document.getElementById('nombreSemestreTabla').textContent = semestreSeleccionado.nomSem;
      
      await cargarBitacora(id);
    }
  } catch (error) {
    console.error('Error:', error);
    UIHelpers.showToast('Error al cargar bitácora', 'error');
  }
}

async function cargarBitacora(semestreId) {
  try {
    const result = await SemestreService.getBitacora(semestreId);
    
    if (result && result.success) {
      mostrarBitacora(result.data || []);
    } else {
      UIHelpers.showToast('Error al cargar bitácora', 'error');
    }
  } catch (error) {
    console.error('Error cargando bitácora:', error);
    UIHelpers.showToast('Error al cargar bitácora', 'error');
  }
}

function mostrarBitacora(bitacora) {
  const contenedor = document.getElementById('contenedorBitacora');
  if (!contenedor) return;

  if (!bitacora || bitacora.length === 0) {
    contenedor.innerHTML = '<p class="empty-message">No hay registros en la bitácora</p>';
    return;
  }

  // Obtener requisitos únicos y ordenarlos
  const requisitosUnicos = [...new Set(bitacora.map(b => b.requisito_nombre))].filter(r => r);
  
  // Obtener docentes únicos y ordenarlos
  const docentesUnicos = [...new Set(bitacora.map(b => b.docente_nombre))].filter(d => d);

  // Crear tabla
  let html = '<table class="bitacora-table"><thead><tr>';
  html += '<th class="docente-col">Docente</th>';
  
  requisitosUnicos.forEach(req => {
    html += `<th class="requisito-col">${req}</th>`;
  });
  
  html += '</tr></thead><tbody>';
  
  // Crear fila para cada docente
  docentesUnicos.forEach(docente => {
    html += '<tr>';
    html += `<td class="docente-name">${docente}</td>`;
    
    requisitosUnicos.forEach(requisito => {
      const registro = bitacora.find(b => b.docente_nombre === docente && b.requisito_nombre === requisito);
      
      if (registro) {
        const registroId = registro.id;
        const estado = registro.estado || 'Incompleto';
        const comentario = registro.comentario || '';
        const estadoClass = estado === 'Cumple' ? 'cumple' : estado === 'No Cumple' ? 'no-cumple' : 'incompleto';
        const estadoIcon = estado === 'Cumple' ? '✓' : '⚠';
        
        html += `
          <td class="requisito-cell">
            <div class="cell-content">
              <div class="estado-selector ${estadoClass}">
                <i class="fas fa-exclamation-triangle"></i>
                <select onchange="actualizarEstadoCell(${registroId}, this.value)" data-registro-id="${registroId}">
                  <option value="Incompleto" ${estado === 'Incompleto' ? 'selected' : ''}>Incompleto</option>
                  <option value="Cumple" ${estado === 'Cumple' ? 'selected' : ''}>Cumple</option>
                  <option value="No Cumple" ${estado === 'No Cumple' ? 'selected' : ''}>No Cumple</option>
                </select>
                <i class="fas fa-chevron-down"></i>
              </div>
              <textarea 
                placeholder="Agregar comentario..." 
                class="comentario-input"
                data-registro-id="${registroId}"
                onblur="actualizarComentarioCell(${registroId}, this.value)"
              >${comentario}</textarea>
              <button class="btn-edit-cell" onclick="editarRegistroCell(${registroId})" title="Editar">
                <i class="fas fa-pencil-alt"></i>
              </button>
            </div>
          </td>
        `;
      } else {
        html += '<td class="requisito-cell empty-cell">-</td>';
      }
    });
    
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  contenedor.innerHTML = html;
  
  // Aplicar colores a los selectores después de renderizar
  actualizarColoresEstado();
}

function actualizarColoresEstado() {
  document.querySelectorAll('.estado-selector select').forEach(select => {
    const estado = select.value;
    const parent = select.closest('.estado-selector');
    parent.classList.remove('cumple', 'no-cumple', 'incompleto');
    if (estado === 'Cumple') {
      parent.classList.add('cumple');
    } else if (estado === 'No Cumple') {
      parent.classList.add('no-cumple');
    } else {
      parent.classList.add('incompleto');
    }
  });
}

async function actualizarEstadoCell(registroId, nuevoEstado) {
  try {
    const result = await fetch(`index.php?resource=bitacora&action=update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: registroId,
        estado: nuevoEstado
      })
    });
    
    const data = await result.json();
    
    if (data.success) {
      UIHelpers.showToast('Estado actualizado', 'success');
      actualizarColoresEstado();
    } else {
      UIHelpers.showToast('Error al actualizar estado', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    UIHelpers.showToast('Error al actualizar estado', 'error');
  }
}

async function actualizarComentarioCell(registroId, comentario) {
  try {
    const result = await fetch(`index.php?resource=bitacora&action=update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: registroId,
        comentario: comentario
      })
    });
    
    const data = await result.json();
    
    if (data.success) {
      UIHelpers.showToast('Comentario guardado', 'success');
    } else {
      UIHelpers.showToast('Error al guardar comentario', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    UIHelpers.showToast('Error al guardar comentario', 'error');
  }
}

function editarRegistroCell(registroId) {
  // Esta función puede abrir un modal más detallado si es necesario
  UIHelpers.showToast('Función de edición detallada', 'info');
}

// ==================== UTILIDADES ====================

function formatearFecha(fechaStr) {
  if (!fechaStr) return '-';
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
