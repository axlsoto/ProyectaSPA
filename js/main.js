/* PROYECTA SpA — comportamiento de la página.
   Cuatro trabajos, en este orden:
     1. Cajón de navegación en móvil
     2. Desplazamiento suave de los anclajes
     3. Selector de punto de entrada (la portada)
     4. Aparición al hacer scroll

   El acordeón de preguntas frecuentes NO está aquí: usa
   <details name="faq">, que da acordeón exclusivo y accesibilidad
   nativa sin JavaScript. */

const MQ_MOVIL = window.matchMedia('(max-width: 768px)');
const MQ_MENOS_MOVIMIENTO = window.matchMedia('(prefers-reduced-motion: reduce)');

function msCajon() {
  // Espejo del token --t-drawer en styles/styles.css. Si cambia allá,
  // cambia acá.
  return MQ_MENOS_MOVIMIENTO.matches ? 0 : 340;
}

/* -----------------------------------------------------------------
   1. Cajón de navegación
   ----------------------------------------------------------------- */
const barra = document.querySelector('.barra');
const barraToggle = document.getElementById('navToggle');
const barraLinks = document.getElementById('navLinks');
let temporizadorCajon = null;

function abrirCajon() {
  clearTimeout(temporizadorCajon);
  barraLinks.classList.add('abierto');
  barraToggle.classList.add('abierto');
  barraToggle.setAttribute('aria-expanded', 'true');
  barraToggle.setAttribute('aria-label', 'Cerrar menú');
  document.body.classList.add('nav-abierto');
}

function cerrarCajon() {
  return new Promise(resolver => {
    if (!barraLinks.classList.contains('abierto')) {
      resolver();
      return;
    }

    clearTimeout(temporizadorCajon);
    barraLinks.classList.remove('abierto');
    barraToggle.classList.remove('abierto');
    barraToggle.setAttribute('aria-expanded', 'false');
    barraToggle.setAttribute('aria-label', 'Abrir menú');

    temporizadorCajon = setTimeout(() => {
      document.body.classList.remove('nav-abierto');
      resolver();
    }, msCajon());
  });
}

barraToggle.addEventListener('click', () => {
  if (barraLinks.classList.contains('abierto')) {
    cerrarCajon();
  } else {
    abrirCajon();
  }
});

document.addEventListener('click', evento => {
  if (!barraLinks.classList.contains('abierto')) return;
  if (barra.contains(evento.target)) return;
  cerrarCajon();
});

document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape') cerrarCajon();
});

/* -----------------------------------------------------------------
   2. Anclajes
   El desplazamiento espera a que el cajón termine de cerrarse, para
   que el destino no quede debajo de la barra.
   ----------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(enlace => {
  enlace.addEventListener('click', async evento => {
    const ancla = enlace.getAttribute('href');
    if (!ancla || ancla === '#') return;

    const destino = document.querySelector(ancla);
    if (!destino) return;

    evento.preventDefault();

    if (MQ_MOVIL.matches && barraLinks.classList.contains('abierto')) {
      await cerrarCajon();
    }

    destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* -----------------------------------------------------------------
   3. Selector de punto de entrada
   Cada botón declara en data-desde la posición del hito donde entra
   el proyecto (la misma escala que usa .eje-hitos: cuatro columnas,
   punto al centro de cada una) y en data-hito su índice. Al elegir
   una situación, el tramo ámbar cubre desde ese punto hasta el
   cierre y se marcan los hitos que quedan dentro del acompañamiento.
   ----------------------------------------------------------------- */
const entrada = document.getElementById('entrada');
const opciones = Array.from(entrada.querySelectorAll('[role="tab"]'));
const hitos = Array.from(entrada.querySelectorAll('.eje-hito'));

function elegirEntrada(opcion, moverFoco) {
  opciones.forEach(otra => {
    const activa = otra === opcion;
    otra.setAttribute('aria-selected', activa ? 'true' : 'false');
    otra.tabIndex = activa ? 0 : -1;
    document.getElementById(otra.getAttribute('aria-controls')).hidden = !activa;
  });

  entrada.style.setProperty('--desde', opcion.dataset.desde);

  const primerHito = Number(opcion.dataset.hito);
  hitos.forEach((hito, indice) => {
    hito.classList.toggle('eje-hito--cubierto', indice >= primerHito);
  });

  if (moverFoco) opcion.focus();
}

opciones.forEach(opcion => {
  opcion.addEventListener('click', () => elegirEntrada(opcion, false));
});

entrada.querySelector('[role="tablist"]').addEventListener('keydown', evento => {
  const actual = opciones.indexOf(document.activeElement);
  if (actual === -1) return;

  let siguiente = null;
  if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') siguiente = (actual + 1) % opciones.length;
  if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') siguiente = (actual - 1 + opciones.length) % opciones.length;
  if (evento.key === 'Home') siguiente = 0;
  if (evento.key === 'End') siguiente = opciones.length - 1;
  if (siguiente === null) return;

  evento.preventDefault();
  elegirEntrada(opciones[siguiente], true);
});

/* -----------------------------------------------------------------
   4. Aparición al hacer scroll
   Se oculta desde JavaScript, nunca desde la hoja de estilos: sin JS
   —o con prefers-reduced-motion— el contenido queda visible.
   ----------------------------------------------------------------- */
if (!MQ_MENOS_MOVIMIENTO.matches && 'IntersectionObserver' in window) {
  const porRevelar = document.querySelectorAll('.revela');
  porRevelar.forEach(elemento => elemento.classList.add('esta-oculto'));

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(visible => {
      if (!visible.isIntersecting) return;
      visible.target.classList.remove('esta-oculto');
      obs.unobserve(visible.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

  porRevelar.forEach(elemento => observador.observe(elemento));
}
