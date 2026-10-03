// Cuentas de clientes y favoritos.
// - Favoritos: funcionan siempre. Sin cuenta se guardan en este dispositivo; con cuenta, en la cuenta.
// - Cuentas: usan tienda.cuenta (ingresar / registrar / salir / favoritos). La plataforma todavía no la tiene:
//   mientras tanto la página muestra "muy pronto" (en la tienda de ejemplo se simula para poder probarla).
import { tienda, T, $, $$, esc, app, estado, ui, cabecera, tarjeta, fantasmas, revelar, aviso, modal } from './base.js';
import { rafaga } from './polvo.js';

const KEY = 'wk-favoritos';
const leer = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify([...favs])); } catch { /* sin almacenamiento */ } };
let favs = new Set(leer());
let cliente = null;
export const hayCuentas = () => !!tienda.cuenta;
export const clienteActual = () => cliente;

export async function iniciarCuenta() {
  if (tienda.cuenta) {
    try {
      cliente = await tienda.cuenta.yo();
      if (cliente) await fusionar();
    } catch { cliente = null; }
  }
  repintarFavoritos();
}
/** Al entrar a la cuenta, los favoritos del dispositivo se suman a los de la cuenta. */
async function fusionar() {
  const remotos = await tienda.cuenta.favoritos.listar();
  for (const h of favs) if (!remotos.includes(h)) await tienda.cuenta.favoritos.agregar(h);
  favs = new Set([...remotos, ...favs]);
  guardar();
}

export const favoritos = {
  lista: () => [...favs],
  tiene: (h) => favs.has(h),
  async alternar(h) {
    const ahora = !favs.has(h);
    if (ahora) favs.add(h); else favs.delete(h);
    guardar();
    repintarFavoritos();
    if (cliente) await (ahora ? tienda.cuenta.favoritos.agregar(h) : tienda.cuenta.favoritos.quitar(h)).catch(() => {});
    return ahora;
  },
};

/** Marca los corazones y el contador del header (se llama después de cada página). */
export function repintarFavoritos() {
  $$('[data-fav]').forEach((b) => b.setAttribute('aria-pressed', String(favs.has(b.dataset.fav))));
  const c = $('#contador-fav');
  if (c) { c.textContent = favs.size; c.hidden = !favs.size; }
  $('#abrir-cuenta')?.classList.toggle('is-dentro', !!cliente);
  $('#abrir-cuenta')?.setAttribute('aria-label', cliente ? `Mi cuenta (${cliente.name})` : 'Ingresar a mi cuenta');
  const etiqueta = $('#abrir-cuenta span'); if (etiqueta) etiqueta.textContent = cliente ? cliente.name.split(' ')[0] : T.cuenta.ingresar;
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-fav]');
  if (!b) return;
  e.preventDefault();
  const ahora = await favoritos.alternar(b.dataset.fav);
  b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
  if (ahora) { rafaga(b, 18); aviso(T.cuenta.guardado); }
  // En la página de favoritos, quitar uno lo saca de la lista
  if (!ahora && document.documentElement.dataset.pagina === 'favoritos') {
    const t = b.closest('.wv-card');
    t?.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.9)' }], { duration: 350 }).finished.then(() => { t.remove(); if (!favs.size) favoritosPagina(); });
  }
});

// ---------------------------------------------------------------- páginas
export async function favoritosPagina() {
  document.title = `${T.cuenta.favoritos} · ${estado.info.name}`;
  const lista = [...favs];
  app.innerHTML = `
    ${cabecera({ ante: esc(T.cuenta.favAnte), titulo: T.cuenta.favoritos, bajada: T.cuenta.favBajada, escena: 'cielo' })}
    <section class="wv-section wv-section--tight"><div class="wv-container">
      ${!cliente && hayCuentas() ? `<p class="wk-nota-cuenta"><svg aria-hidden="true"><use href="#i-usuario"/></svg>${esc(T.cuenta.favNota)} <button type="button" class="wk-nota-cuenta__ir" data-acceso="ingresar">${esc(T.cuenta.ingresar)} →</button></p>` : ''}
      <div class="wv-grid" id="lista-fav">${lista.length ? fantasmas(Math.min(lista.length, 4)) : ''}</div>
      ${lista.length ? '' : `<div class="wk-vacio-fav"><i class="wv-orbe-luz wv-orbe-luz--grande" aria-hidden="true"></i><h2>${esc(T.cuenta.favVacio)}</h2><p>${esc(T.cuenta.favVacioTexto)}</p><a class="wv-btn wv-btn--primary" href="/tienda" data-link>${esc(T.cuenta.explorar)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a></div>`}
    </div></section>`;
  if (!lista.length) return;
  const items = (await Promise.all(lista.map((h) => tienda.productos.uno(h).catch(() => null)))).filter(Boolean);
  const el = $('#lista-fav');
  if (!el) return;
  el.innerHTML = items.map(tarjeta).join('');
  repintarFavoritos();
  revelar();
}

export async function cuentaPagina() {
  document.title = `${T.cuenta.titulo} · ${estado.info.name}`;
  if (cliente) {
    app.innerHTML = `
      ${cabecera({ ante: esc(T.cuenta.titulo), titulo: `${T.cuenta.hola}, ${cliente.name}`, bajada: cliente.email })}
      <section class="wv-section wv-section--tight"><div class="wv-container wk-panel-cuenta">
        <a class="wk-panel-cuenta__item" href="/favoritos" data-link><svg aria-hidden="true"><use href="#i-corazon"/></svg><strong>${esc(T.cuenta.favoritos)}</strong><span>${favs.size} ${favs.size === 1 ? 'pieza' : 'piezas'}</span></a>
        <div class="wk-panel-cuenta__item is-pronto"><svg aria-hidden="true"><use href="#i-bag"/></svg><strong>${esc(T.cuenta.pedidos)}</strong><span>${esc(T.cuenta.pedidosPronto)}</span></div>
        <button type="button" class="wk-panel-cuenta__item" id="salir"><svg aria-hidden="true"><use href="#i-girar"/></svg><strong>${esc(T.cuenta.salir)}</strong><span>${esc(T.cuenta.salirTexto)}</span></button>
      </div></section>`;
    $('#salir').addEventListener('click', async () => { await tienda.cuenta.salir(); cliente = null; repintarFavoritos(); ui.navegar('/'); });
    revelar();
    return;
  }
  // Sin sesión, /cuenta muestra la tienda y abre el acceso encima
  history.replaceState(null, '', `${window.WK_BASE || ''}/tienda`);
  await ui.catalogo?.(null);
  abrirAcceso();
}

/** Ingresar / crear cuenta en una ventana emergente (sin salir de la página). */
export function abrirAcceso(modo = 'ingresar') {
  if (cliente) { ui.navegar('/cuenta'); return; }
  const activa = hayCuentas();
  const m = modal(`
    <div class="wv-acceso">
      <span class="wv-acceso__luz" aria-hidden="true"></span>
      <p class="wv-eyebrow">${esc(T.cuenta.titulo)}</p>
      <h2 class="wv-acceso__titulo">${esc(T.cuenta.bienvenida)}</h2>
      <p class="wv-acceso__bajada">${esc(T.cuenta.bajada)}</p>
      <div class="wk-acceso__pestanas" role="tablist">
        <button type="button" role="tab" aria-selected="${modo === 'ingresar'}" data-modo="ingresar">${esc(T.cuenta.ingresar)}</button>
        <button type="button" role="tab" aria-selected="${modo === 'registrar'}" data-modo="registrar">${esc(T.cuenta.crear)}</button>
      </div>
      ${activa ? '' : `<p class="wk-acceso__pronto"><svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(T.cuenta.pronto)}</p>`}
      <form class="wk-acceso__form" id="acceso">
        <label class="wk-campo wk-campo--nombre"${modo === 'registrar' ? '' : ' hidden'}><span>Nombre</span><input name="name" autocomplete="name"${modo === 'registrar' ? ' required' : ''}></label>
        <label class="wk-campo"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="wk-campo"><span>Contraseña</span><input name="password" type="password" required minlength="6" autocomplete="${modo === 'registrar' ? 'new-password' : 'current-password'}"></label>
        <button class="wv-btn wv-btn--primary wv-btn--lg wv-btn--block"${activa ? '' : ' disabled'}><span>${esc(modo === 'registrar' ? T.cuenta.crear : T.cuenta.ingresar)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
        <p class="error" id="error-cuenta" role="alert"></p>
      </form>
      <ul class="wk-acceso__beneficios">${T.cuenta.beneficios.map((b) => `<li><svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(b)}</li>`).join('')}</ul>
    </div>`, 'wv-modal-acceso');
  const form = m.querySelector('#acceso');
  m.querySelector('.wk-acceso__pestanas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-modo]');
    if (!b) return;
    modo = b.dataset.modo;
    m.querySelectorAll('[data-modo]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    form.querySelector('.wk-campo--nombre').hidden = modo !== 'registrar';
    form.name.required = modo === 'registrar';
    form.password.autocomplete = modo === 'registrar' ? 'new-password' : 'current-password';
    form.querySelector('button span').textContent = modo === 'registrar' ? T.cuenta.crear : T.cuenta.ingresar;
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activa) return;
    const b = form.querySelector('button');
    b.disabled = true;
    m.querySelector('#error-cuenta').textContent = '';
    try {
      const d = Object.fromEntries(new FormData(form));
      cliente = await (modo === 'registrar' ? tienda.cuenta.registrar(d) : tienda.cuenta.ingresar(d));
      await fusionar();
      repintarFavoritos();
      rafaga(b, 30);
      aviso(`${T.cuenta.hola}, ${cliente.name.split(' ')[0]}`);
      setTimeout(() => m.cerrar(), 500);
    } catch (err) { m.querySelector('#error-cuenta').textContent = err.message; b.disabled = false; }
  });
}

// Botón "Ingresar" de la barra y enlaces [data-acceso]: abren la ventana en lugar de ir a otra página
document.addEventListener('click', (e) => {
  const a = e.target.closest('#abrir-cuenta, [data-acceso]');
  if (!a || cliente) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  abrirAcceso(a.dataset.acceso || 'ingresar');
}, true);
