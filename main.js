document.addEventListener("DOMContentLoaded", () => {
  // --- Script para el menú hamburguesa en móvil ---
  initializeMobileMenu();

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  function initializeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () =>
        navLinks.classList.toggle("active")
      );
    }
  }
  // --- Script para el Autoplay del reproductor ---
  const radioPlayer = document.getElementById("radio-audio");
  if (radioPlayer) {
    // Intentamos reproducir. Si falla (por políticas del navegador), no hacemos nada.
    radioPlayer.play().catch(() => {
      console.log("La reproducción automática fue bloqueada por el navegador.");
    });
  }

  // --- Script para registrar el Service Worker (PWA) ---
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js") // Usamos ruta relativa para que funcione en todas las páginas
        .then((reg) => console.log("Service worker registrado", reg))
        .catch((err) => console.log("Error al registrar service worker", err));
    });
  }

  // --- Lógica para el aviso de instalación de PWA ---
  let deferredPrompt;
  const installModal = document.getElementById("pwa-install-modal");
  const installBtn = document.getElementById("pwa-install-btn");
  const laterBtn = document.getElementById("pwa-later-btn");

  window.addEventListener("beforeinstallprompt", (e) => {
    // Previene que el mini-infobar de Chrome aparezca en móvil
    e.preventDefault();
    // Guarda el evento para que pueda ser disparado más tarde.
    deferredPrompt = e;
    // Muestra nuestro modal de instalación personalizado
    if (installModal) {
      console.log("`beforeinstallprompt` event was fired.");
      installModal.style.display = "flex";
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      // Oculta nuestro modal
      installModal.style.display = "none";
      // Muestra el prompt de instalación del navegador
      deferredPrompt.prompt();
      // Espera a que el usuario responda al prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // Ya no podemos usar el evento, lo descartamos
      deferredPrompt = null;
    });
  }

  if (laterBtn) {
    laterBtn.addEventListener("click", () => {
      installModal.style.display = "none";
    });
  }

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
  });
});
