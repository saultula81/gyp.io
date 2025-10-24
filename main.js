document.addEventListener("DOMContentLoaded", () => {
  // --- Script para el menú hamburguesa en móvil ---
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
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
});
