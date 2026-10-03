// Transición entre páginas: cae un velo de noche con niebla, el sello de la mano se enciende en el centro
// (como un hechizo) y el velo se disuelve hacia arriba mostrando la página nueva.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
let velo;

function preparar() {
  if (velo) return;
  velo = document.createElement('div');
  velo.className = 'wk-hechizo';
  velo.setAttribute('aria-hidden', 'true');
  velo.innerHTML = '<span class="wk-hechizo__niebla"><i></i><i></i><i></i></span><span class="wk-hechizo__sello"><i class="wk-mano"></i></span>';
  document.body.append(velo);
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cubre la pantalla (x, y: desde dónde nace la luz del sello). */
export async function cubrir(x, y) {
  if (reducido) return;
  preparar();
  velo.style.setProperty('--x', `${x}px`);
  velo.style.setProperty('--y', `${y}px`);
  velo.className = 'wk-hechizo is-cubre';
  await espera(520);
}

/** Descubre la página nueva. */
export async function descubrir() {
  if (reducido || !velo) return;
  velo.className = 'wk-hechizo is-cubre is-descubre';
  await espera(750);
  velo.className = 'wk-hechizo';
}
