/* ================================================================
   TON 618 — main.js
   Módulos:
     1. Header scroll → clase .scrolled para blur
     2. Canvas de estrellas → campo de partículas animado
     3. Bandcamp placeholder → se oculta si el iframe carga
================================================================ */

/* ── 1. HEADER: efecto scroll ─────────────────────────────────
   Agrega la clase .scrolled al header cuando el usuario
   hace scroll, activando el backdrop-blur definido en CSS.
─────────────────────────────────────────────────────────────── */
(function initScrollHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const THRESHOLD = 40; // píxeles de scroll para activar el blur

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Ejecutar al inicio por si la página carga con scroll
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── 2. CANVAS: campo de estrellas animado ────────────────────
   Genera partículas (estrellas) que se mueven lentamente
   hacia afuera desde el centro, simulando la distorsión
   espacial alrededor de un agujero negro.

   Paleta: blancas puras + algunas con tinte naranja-acento.
─────────────────────────────────────────────────────────────── */
(function initStarField() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Configuración general
  const CONFIG = {
    starCount:     880,    // cantidad de estrellas
    minRadius:     0.4,    // radio mínimo de cada estrella (px)
    maxRadius:     0.80,    // radio máximo
    speedMin:      0.03,   // velocidad de deriva mínima
    speedMax:      0.78,   // velocidad de deriva máxima
    accentRatio:   0.23,   // fracción de estrellas con color acento
    accentColor:   '#e05a1a',
    whiteColor:    '#f0ece4',
  };

  let stars = [];
  let W, H, cx, cy;

  /* Ajusta el canvas al tamaño del hero (su contenedor) */
  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    cx = W / 2;
    cy = H / 2;
  }

  /* Crea una estrella con posición y velocidad aleatorias */
  function createStar(index, total) {
    const angle  = Math.random() * Math.PI * 2;
    // Distancia inicial al centro (evitamos el centro exacto)
    const dist   = (0.05 + Math.random() * 0.95) * Math.min(W, H) * 0.5;

    const isAccent = index < total * CONFIG.accentRatio;

    return {
      angle,
      dist,
      speed:   CONFIG.speedMin + Math.random() * (CONFIG.speedMax - CONFIG.speedMin),
      radius:  CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      opacity: 0.3 + Math.random() * 0.7,
      color:   isAccent ? CONFIG.accentColor : CONFIG.whiteColor,
      // Usamos ángulo + distancia para posicionar en coordenadas polares
    };
  }

  /* Inicializa todas las estrellas */
  function initStars() {
    stars = Array.from(
      { length: CONFIG.starCount },
      (_, i) => createStar(i, CONFIG.starCount)
    );
  }

  /* Frame de animación */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    stars.forEach(star => {
      // Actualiza la distancia al centro (movimiento radial lento)
      star.dist += star.speed;

      // Si sale del canvas, renace cerca del centro
      const maxDist = Math.sqrt(cx * cx + cy * cy) + 20;
      if (star.dist > maxDist) {
        star.dist  = (0.02 + Math.random() * 0.08) * Math.min(W, H) * 0.5;
        star.angle = Math.random() * Math.PI * 2;
      }

      // Convierte coordenadas polares → cartesianas
      const x = cx + Math.cos(star.angle) * star.dist;
      const y = cy + Math.sin(star.angle) * star.dist;

      // Dibuja la estrella
      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle   = star.color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  /* Arranca el canvas */
  function start() {
    resize();
    initStars();
    animate();
  }

  /* Redimensiona sin recrear todas las estrellas */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
    }, 150);
  }, { passive: true });

  start();
})();


/* ── 3. BANDCAMP PLACEHOLDER ──────────────────────────────────
   Oculta el div placeholder cuando el iframe de Bandcamp
   termina de cargar. Si el src es el placeholder genérico,
   lo mantiene visible para que se vea en desarrollo.
─────────────────────────────────────────────────────────────── */
(function initPlayerPlaceholder() {
  const iframe      = document.querySelector('.bandcamp-player');
  const placeholder = document.getElementById('playerPlaceholder');
  if (!iframe || !placeholder) return;

  // Detectamos si el src contiene el ID real de Bandcamp
  const hasSrc = iframe.src && !iframe.src.includes('XXXXXXXXX');

  if (hasSrc) {
    // Iframe real: ocultamos el placeholder cuando cargue
    iframe.addEventListener('load', () => {
      placeholder.style.opacity = '0';
      setTimeout(() => { placeholder.style.display = 'none'; }, 400);
    });
  }
  // Si el src es el placeholder genérico, el div permanece visible.
})();