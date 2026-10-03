// Núcleo compartido de Walkiverso: datos de la tienda, ayudantes y piezas que usan todas las páginas.
import { textos as T } from './textos.js';
import { categoriasClave, categoriasOcultas, categoriasObjeto, prefijoRegion, imagenesColeccion } from './config.js';
import { rafaga } from './polvo.js';

// SDK de la plataforma. Sin plataforma (carpeta suelta o servidor de demo) se usa la tienda de ejemplo.
export let tienda;
try { ({ tienda } = await import('/api/v1/sdk.js')); } catch { ({ tienda } = await import('./demo/sdk-demo.js')); }

export { T };
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const tactil = matchMedia('(pointer: coarse)').matches;
export const espera = (ms) => new Promise((r) => setTimeout(r, ms));
export const app = document.getElementById('app');

/** Estado que se llena al arrancar (app.js). */
export const estado = { info: null, categorias: [] };
/** Acciones que define app.js (para no importar en círculo). */
export const ui = { abrirCarrito() {}, navegar(url) { location.href = url; } };

// ---------------------------------------------------------------- categorías y regiones
const ocultas = new Set(categoriasOcultas);
export const categoria = (rol) => estado.categorias.find((c) => c.handle === (categoriasClave[rol] ?? rol)) ?? null;
export const esRegion = (c) => !!c && c.handle.startsWith(prefijoRegion);
/** Colecciones de la tienda (Bitácoras, Criaturas, Duendes Milarko…): todo lo que no es región ni está oculto. */
export const colecciones = () => estado.categorias.filter((c) => !esRegion(c) && !ocultas.has(c.handle));
export const regiones = () => estado.categorias.filter(esRegion);
export const numeroRegion = (c) => String(regiones().findIndex((x) => x.handle === c?.handle) + 1).padStart(2, '0');
const handleDe = (c) => (typeof c === 'string' ? c : c?.handle);
/** Región de Walkurio de un producto (la primera de sus categorías que sea región). */
export const regionDe = (p) => {
  for (const c of p.categories ?? []) {
    const r = estado.categorias.find((x) => x.handle === handleDe(c));
    if (esRegion(r)) return r;
  }
  return null;
};
export const esDe = (p, rol) => (p.categories ?? []).some((c) => handleDe(c) === (categoriasClave[rol] ?? rol));
/** Los objetos (bitácoras) se agregan al carrito; las criaturas se adoptan. */
export const esObjeto = (p) => (p.categories ?? []).some((c) => categoriasObjeto.includes(handleDe(c)));

// ---------------------------------------------------------------- piezas
export const foto = (img, alt, ancho = 640, clase = '', sizes = '(max-width: 700px) 50vw, 25vw') => img
  ? `<img${clase ? ` class="${clase}"` : ''} src="${esc(img.sizes?.[String(ancho)] ?? img.url)}"${img.sizes ? ` srcset="${Object.entries(img.sizes).map(([w, u]) => `${esc(u)} ${w}w`).join(', ')}" sizes="${sizes}"` : ''} alt="${esc(img.alt || alt)}" width="${img.width}" height="${img.height}" loading="lazy">`
  : '';
export const hash = (t) => [...String(t)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
/** Mientras no haya foto: un "retrato" de luz con la inicial, en los tonos de la marca. */
export const sinFoto = (titulo, clase = '') => `<span class="wk-sinfoto ${clase}" data-tono="${hash(titulo) % 3}" aria-hidden="true"><i class="wv-orbe-luz"></i></span>`;
/** El sello de la mano (img/mano.png), pintado con el color del texto. */
export const mano = (clase = '') => `<i class="wk-mano ${clase}" aria-hidden="true"></i>`;
export const precio = (p) => `<span class="precio">${tienda.formatear(p.price, p.currency)}${p.compareAtPrice > p.price ? `<s>${tienda.formatear(p.compareAtPrice, p.currency)}</s>` : ''}</span>`;
export const textoPlano = (html, max = 140) => {
  const t = String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).replace(/\s\S*$/, '')}…` : t;
};

/** Colección de la tienda a la que pertenece una pieza (Bitácoras, Criaturas…), sin contar regiones ni ocultas. */
export const coleccionDe = (p) => {
  const lista = colecciones();
  for (const c of p.categories ?? []) {
    const x = lista.find((y) => y.handle === handleDe(c));
    if (x && x.handle !== 'criaturas') return x;
  }
  return lista.find((y) => (p.categories ?? []).some((c) => handleDe(c) === y.handle)) ?? null;
};
/** Imagen de una colección: la del panel, la de config (recortes sin fondo) o el sello de la mano. */
export const imagenColeccion = (c) => (c.image ? foto(c.image, c.name, 640) : imagenesColeccion[c.handle] ? `<img src="${esc(imagenesColeccion[c.handle])}" alt="" loading="lazy">` : '<i class="wv-orbe-luz"></i>');
const tonos = ['noche', 'luz', 'pantano', 'azul', 'niebla', 'abismo'];
export const tonoColeccion = (i) => tonos[i % tonos.length];
export const esUnica = (p) => p.variants?.length === 1 && p.variants[0].stock === 1;
export const icono = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
export const flecha = () => `<span class="wv-btn__arrow">${icono('i-flecha')}</span>`;
const descuento = (p) => (p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0);

/** Insignias de una pieza (adoptada, oferta, pieza única, nueva). */
export const insignias = (p, extra = []) => {
  const l = [...extra];
  if (!p.available) l.push([T.recientes.adoptada, 'light']);
  else {
    if (descuento(p)) l.push([`-${descuento(p)}%`, 'luz']);
    if (esUnica(p)) l.push([T.ficha.unica, 'noche']);
  }
  return l.map(([t, tono]) => `<span class="wv-badge wv-badge--${tono}">${esc(t)}</span>`).join('');
};

/** Precio con presencia: etiqueta, valor y tachado. */
export const precioBloque = (p, etiqueta = '') => `
  <div class="wv-price">
    ${etiqueta ? `<span class="wv-price__label">${esc(etiqueta)}</span>` : ''}
    <strong class="wv-price__value">${tienda.formatear(p.price, p.currency)}${p.compareAtPrice > p.price ? `<s>${tienda.formatear(p.compareAtPrice, p.currency)}</s>` : ''}</strong>
  </div>`;

/** Tarjeta de pieza (estructura de PULSO): foto, insignias, favorito, colección, nombre, precio y compra. */
export const tarjeta = (p, i = 0) => {
  const r = regionDe(p);
  const col = coleccionDe(p);
  const segunda = p.images?.[1];
  const objeto = esObjeto(p);
  return `
  <article class="wv-card" data-rev style="--d:${(i % 4) * 70}ms">
    <a class="wv-card__media" href="/producto/${esc(p.handle)}" data-link tabindex="-1" aria-hidden="true">
      ${foto(p.image, p.title) || sinFoto(p.title)}${segunda ? foto(segunda, p.title, 640, 'wv-card__alt') : ''}
      <span class="wv-card__luz" aria-hidden="true"></span>
    </a>
    <div class="wv-card__badges">${insignias(p)}</div>
    ${botonFavorito(p)}
    <div class="wv-card__body">
      <p class="wv-card__cat">${[col?.name, r?.name].filter(Boolean).map(esc).join(' · ') || 'Walkiverso'}</p>
      <h3 class="wv-card__title"><a href="/producto/${esc(p.handle)}" data-link>${esc(p.title)}</a></h3>
      ${precioBloque(p)}
      ${p.available
        ? `<button type="button" class="wv-btn wv-btn--primary wv-btn--sm wv-btn--block" data-agregar="${esc(p.handle)}">${esc(objeto ? T.ficha.agregarObjeto : T.ficha.agregar)}${flecha()}</button>`
        : `<a class="wv-btn wv-btn--ghost wv-btn--sm wv-btn--block" href="/producto/${esc(p.handle)}" data-link>${esc(T.ficha.agotado)}</a>`}
      <p class="wv-card__foot"><span>${icono('i-hoja')} Hecho a mano</span><span>${esUnica(p) ? '1 de 1' : p.available ? 'Disponible' : 'Adoptada'}</span></p>
    </div>
  </article>`;
};
/** Corazón para guardar en favoritos (lo maneja cuenta.js). */
export const botonFavorito = (p, clase = '') => `<button type="button" class="wv-fav ${clase}" data-fav="${esc(p.handle)}" aria-pressed="false" aria-label="Guardar ${esc(p.title)} en favoritos">${icono('i-corazon')}</button>`;
export const fantasmas = (n = 4) => '<span class="wv-card wv-card--fantasma" aria-hidden="true"></span>'.repeat(n);

/**
 * Cabecera de las páginas internas (como PULSO): antetítulo, título grande y bajada,
 * con tus raíces asomando en la esquina y polvo de luz.
 */
export const cabecera = ({ ante = '', titulo, bajada = '', extra = '', oscura = false }) => `
  <section class="wv-page-head${oscura ? ' wv-page-head--noche' : ''}">
    <span class="wk-ramas-fondo${oscura ? ' wk-ramas-fondo--luz' : ''}" data-esquinas="tr" data-semilla="${hash(titulo) % 97}"></span>
    <div class="wv-container">
      ${ante ? `<p class="wv-eyebrow">${icono('i-chispa')}${ante}</p>` : ''}
      <h1 class="wv-h1">${titulo.split(' ').map((w, i) => `<span class="wk-palabra" style="--i:${i}">${esc(w)}</span>`).join(' ')}</h1>
      ${bajada ? `<p class="wv-lead">${esc(bajada)}</p>` : ''}
      ${extra}
    </div>
  </section>`;

// ---------------------------------------------------------------- carrito con vuelo
/** La pieza vuela hasta el botón del carrito, el contador salta y se abre el carrito (firma NS). */
export async function agregar(variantId, origen, imagenDe) {
  await tienda.carrito.agregar(variantId, 1);
  rafaga(origen);
  await volar(imagenDe ?? origen);
  ui.abrirCarrito();
}
async function volar(el) {
  const destino = document.getElementById('abrir-carrito');
  if (!el || !destino || reducido) return;
  const a = el.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const clon = document.createElement('div');
  clon.className = 'wk-vuelo';
  const img = el.querySelector?.('img, .wk-sinfoto');
  clon.innerHTML = img ? img.outerHTML : '<span class="wk-vuelo__luz"></span>';
  const lado = Math.min(a.width, a.height, 160);
  Object.assign(clon.style, { left: `${a.left + a.width / 2 - lado / 2}px`, top: `${a.top + a.height / 2 - lado / 2}px`, width: `${lado}px`, height: `${lado}px` });
  document.body.append(clon);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = clon.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1, borderRadius: '24px' },
    { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 120}px) scale(0.6) rotate(-8deg)`, opacity: 1, borderRadius: '40%', offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.08) rotate(10deg)`, opacity: 0.2, borderRadius: '50%' },
  ], { duration: 900, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' });
  await anim.finished.catch(() => {});
  clon.remove();
  destino.classList.remove('is-recibe'); void destino.offsetWidth; destino.classList.add('is-recibe');
}
/** Agregar desde una tarjeta: si el producto tiene una sola opción se agrega; si no, se abre su ficha. */
export async function agregarRapido(handle, boton) {
  boton.classList.add('is-cargando');
  try {
    const p = await tienda.productos.uno(handle);
    const disponibles = p.variants.filter((v) => v.available);
    if (p.variants.length > 1 || !disponibles.length) { ui.navegar(`/producto/${handle}`); return; }
    await agregar(disponibles[0].id, boton, boton.closest('.wv-card, .wk-carta, .wv-spin__card')?.querySelector('.wv-card__media, .wk-carta__foto, .wv-spin__img'));
    boton.classList.add('is-done');
    setTimeout(() => boton.classList.remove('is-done'), 1800);
  } catch (e) {
    aviso(e.message);
  } finally {
    boton.classList.remove('is-cargando');
  }
}

// ---------------------------------------------------------------- avisos y modales
export function aviso(texto, { accion = '', href = '' } = {}) {
  const caja = document.getElementById('avisos') ?? document.body;
  const el = document.createElement('div');
  el.className = 'wv-toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="wv-toast__icon">${icono('i-chispa')}</span><span class="wv-toast__text">${esc(texto)}</span>${accion ? `<a class="wv-toast__action" href="${esc(href)}" data-link>${esc(accion)}</a>` : ''}`;
  caja.append(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => el.classList.add('is-out'), 3400);
  setTimeout(() => el.remove(), 3900);
}

/** Modal con fondo de vidrio. Devuelve el contenedor; se cierra con Esc, la X o tocando el fondo. */
export function modal(html, clase = '') {
  const previo = document.activeElement;
  const m = document.createElement('div');
  m.className = `wk-modal ${clase}`;
  m.innerHTML = `<div class="wk-modal__velo" data-cerrar></div>
    <div class="wk-modal__caja" role="dialog" aria-modal="true">
      <button type="button" class="wk-modal__cerrar" data-cerrar aria-label="Cerrar"><svg aria-hidden="true"><use href="#i-cerrar"/></svg></button>
      ${html}
    </div>`;
  document.body.append(m);
  document.body.classList.add('con-modal');
  requestAnimationFrame(() => m.classList.add('is-abierto'));
  const cerrar = () => {
    m.classList.remove('is-abierto');
    document.body.classList.remove('con-modal');
    document.removeEventListener('keydown', tecla);
    setTimeout(() => m.remove(), 400);
    previo?.focus?.();
  };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  m.addEventListener('click', (e) => { if (e.target.closest('[data-cerrar]')) cerrar(); });
  setTimeout(() => m.querySelector('input, textarea, button:not([data-cerrar]), iframe, .wk-modal__cerrar')?.focus(), 60);
  m.cerrar = cerrar;
  return m;
}

// ---------------------------------------------------------------- aparición al bajar
let observador;
export function revelar() {
  if (reducido || !('IntersectionObserver' in window)) { $$('[data-rev]').forEach((el) => el.classList.add('is-in')); return; }
  observador ??= new IntersectionObserver((entradas) => entradas.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); observador.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-rev]:not(.is-in)').forEach((el) => observador.observe(el));
}

/** Número que sube cuando aparece en pantalla. */
export function contarHasta(el, n, texto) {
  if (!el) return;
  if (reducido) { el.textContent = texto(n); return; }
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      el.textContent = texto(Math.max(1, Math.round(n * (1 - Math.pow(1 - k, 3)))));
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }).observe(el);
}

/** Acordeón accesible: botones [data-acordeon] que abren el panel siguiente. */
export function acordeon(raiz, { uno = true } = {}) {
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-acordeon]');
    if (!b || !raiz.contains(b)) return;
    const abrir = b.getAttribute('aria-expanded') !== 'true';
    if (uno) $$('[data-acordeon][aria-expanded="true"]', raiz).forEach((x) => { if (x !== b) x.setAttribute('aria-expanded', 'false'); });
    b.setAttribute('aria-expanded', String(abrir));
  });
}
export const romano = (n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n] ?? String(n + 1);
