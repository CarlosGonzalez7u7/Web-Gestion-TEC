document.addEventListener("DOMContentLoaded", () => {
  // Verificar si ya hay una sesión activa
  checkExistingSession();

  // Manejar el envío del formulario de login
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const usernameOrEmail = this.usernameOrEmail.value.trim();
    const password = this.password.value;
    const errorMessage = document.getElementById("errorMessage");
    
    // Limpiar errores previos
    errorMessage.textContent = "";

    // Validación básica
    if (!usernameOrEmail || !password) {
      errorMessage.textContent = "Por favor, completa todos los campos";
      return;
    }

    // Mostrar indicador de carga
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    submitButton.disabled = true;

    try {
      console.log('Intentando login con:', usernameOrEmail, password);
      
      // Llamar a la API de login
      const result = await AuthService.login(usernameOrEmail, password);
      
      console.log('Resultado del login:', result);

      if (result && result.success) {
        errorMessage.textContent = "";
        errorMessage.style.color = "green";
        errorMessage.textContent = "Inicio de sesión exitoso. Redirigiendo...";
        
        // Redirigir inmediatamente
        window.location.href = "bitacora.html";
      } else {
        const message = result?.message || "Credenciales incorrectas";
        errorMessage.textContent = message;
      }
    } catch (error) {
      console.error("Error en login:", error);
      errorMessage.textContent = "Error en la conexión. Intente nuevamente.";
    } finally {
      // Restaurar botón
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });

  // Verificar sesión existente
  async function checkExistingSession() {
    try {
      const result = await AuthService.checkSession();
      if (result && result.success && result.data.valid) {
        // Ya hay una sesión activa, redirigir
        window.location.href = "bitacora.html";
      }
    } catch (error) {
      console.log("No hay sesión activa");
    }
  }
});
