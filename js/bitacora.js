// Estado de la aplicación
let editarSemestreId = null;
let currentSemesterId = null;
let semestreSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar autenticación
  await checkAuthentication();
  
  // Mostrar mensaje informativo
  UIHelpers.showToast("Módulo de Bitácora - Sistema migrado a API REST", "info");
  
  // Configurar eventos básicos
  configurarEventosBasicos();
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
  const logoutLinks = document.querySelectorAll('a[href="../index.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
    });
  });
}

// Logout
async function logout() {
  try {
    await AuthService.logout();
    window.location.href = '../index.html';
  } catch (error) {
    console.error('Error en logout:', error);
    window.location.href = '../index.html';
  }
}
