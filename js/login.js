document.addEventListener("DOMContentLoaded", () => {
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

  // Manejar el envío del formulario de login
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = "";

    // Mostrar indicador de carga
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    submitButton.disabled = true;

    fetch("php/login.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error de red");
        return response.json();
      })
      .then((data) => {
        // Restaurar el botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        if (data.success) {
          showToast("Inicio de sesión exitoso", "success");
          // Pequeña demora para mostrar el toast antes de redirigir
          setTimeout(() => {
            window.location.href = "html/bitacora.html";
          }, 1000);
        } else {
          errorMessage.textContent = data.message || "Credenciales incorrectas";
          showToast("Error de autenticación", "error");
        }
      })
      .catch((error) => {
        // Restaurar el botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        errorMessage.textContent = "Error en la conexión. Intente nuevamente.";
        showToast("Error de conexión", "error");
      });
  });
});
