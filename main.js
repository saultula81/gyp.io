document.addEventListener("DOMContentLoaded", () => {
  function initializeMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }
  }

  // --- Lógica para el aviso de instalación de PWA ---
  function initializePWAInstall() {
    const installButton = document.getElementById("install-app-button");
    let deferredPrompt;

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      sessionStorage.getItem("pwaInstallDismissed") === "true"
    ) {
      console.log(
        "La PWA ya está instalada o el aviso fue descartado en esta sesión."
      );
      return;
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installButton) {
        installButton.style.display = "block";
        console.log(
          "`beforeinstallprompt` event fired. Botón de instalación mostrado."
        );
      }
    });

    if (installButton) {
      installButton.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Respuesta del usuario: ${outcome}`);

        if (outcome === "dismissed") {
          sessionStorage.setItem("pwaInstallDismissed", "true");
        }

        installButton.style.display = "none";
        deferredPrompt = null;
      });
    }

    window.addEventListener("appinstalled", () => {
      console.log("PWA instalada correctamente.");
      if (installButton) {
        installButton.style.display = "none";
      }
      deferredPrompt = null;
    });
  }

  // --- Script para registrar el Service Worker (PWA) ---
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => console.log("Service worker registrado", reg))
          .catch((err) =>
            console.log("Error al registrar service worker", err)
          );
      });
    }
  }

  // --- Script para el Autoplay del reproductor ---
  function initializeRadioPlayer() {
    const radioPlayer = document.getElementById("radio-audio");
    if (radioPlayer) {
      radioPlayer.play().catch(() => {
        console.log(
          "La reproducción automática fue bloqueada por el navegador."
        );
      });
    }
  }

  // --- Inicialización de todos los scripts ---
  initializeMobileMenu();
  initializePWAInstall();
  registerServiceWorker();
  initializeRadioPlayer();
});
