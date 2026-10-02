// Walkiverso · web para la plataforma (Kit NS).
// Todos los datos salen de la tienda con el SDK: el cliente los cambia desde su panel.
// Rutas: /  ·  /walkurio  ·  /tienda  ·  /categoria/:handle  ·  /producto/:handle  ·  /cursos  ·  /deseos  ·  /contacto  ·  /legal/:tipo
// (Walkiver vive aparte en /walkiver/ y /walkiver/somos-mitos/)
import { tienda, T, $, $$, esc, app, estado, ui, reducido, tactil, espera, regiones, categoria, foto, sinFoto, precio, cabecera, revelar, agregarRapido, aviso } from './base.js';
import { polvoDeHadas } from './polvo.js';
import { inicio } from './paginas/inicio.js';
import { catalogo } from './paginas/tienda.js';
import { ficha } from './paginas/ficha.js';
import { walkurio, mostrarRegion, cerrarRegion } from './paginas/walkurio.js';
import { cursos } from './paginas/cursos.js';
import { deseos } from './paginas/deseo.js';
import { contacto } from './paginas/contacto.js';

let rutaActual = '';
let mundo = null;
let mundoPromesa = null;
/** En GitHub Pages la web vive en una subcarpeta (/repo); en la plataforma, en la raíz. */
const BASE = window.WK_BASE || '';
const camino = () => location.pathname.slice(BASE.length) || '/';
const seccionDe = (p = camino()) => p.split('/').filter(Boolean)[0] ?? '';
const conMundo = (s) => s === '' || s === 'index.html' || s === 'walkurio';

// ---------------------------------------------------------------- arranque
async function arrancar() {
  const conPortal = ['', 'index.html'].includes(seccionDe()) && !reducido && !visto();
  if (conPortal) abrirPortal();

  const [info, categorias] = await Promise.all([tienda.info(), tienda.categorias()]);
  Object.assign(estado, { info, categorias });
  document.title = info.seo.title || info.name;
  $('#marca').textContent = info.name;
  if (info.logo) $('#marca').outerHTML = `<img src="${esc(info.logo.url ?? info.logo)}" alt="${esc(info.name)}" height="36">`;
  $('#pie-marca').textContent = info.name;
  $('#pie-bajada').textContent = info.seo.description || '';
  $('#pie-nombre').textContent = `© ${new Date().getFullYear()} ${info.name}`;
  if (info.colors?.primary) document.documentElement.style.setProperty('--celeste', info.colors.primary);
  if (info.colors?.dark) document.documentElement.style.setProperty('--noche', info.colors.dark);
  if (info.favicon) document.head.insertAdjacentHTML('beforeend', `<link rel="icon" href="${esc(info.favicon)}">`);
  if (info.seo.description) $('meta[name=description]').content = info.seo.description;
  if (tienda.demo) $('#demo').hidden = false;

  pintarMenus();
  pintarHablemos();
  pintarAviso();
  pintarCookies();
  pintarMundo();
  $('#pie-legales').innerHTML = info.legal.map((l) => `<a href="/legal/${l.kind}" data-link>${esc(l.title)}</a>`).join('');

  tienda.carrito.alCambiar(pintarCarrito);
  pintarCarrito(await tienda.carrito.ver());
  window.addEventListener('popstate', () => { if (location.pathname !== rutaActual) ruta(); });
  polvoDeHadas();
  await ruta();
  if (conPortal) portalListo();
  if (new URLSearchParams(location.search).has('carrito')) abrirCarrito();
}

// ---------------------------------------------------------------- portal de entrada
const visto = () => { try { return sessionStorage.getItem('wk-portal') === '1'; } catch { return false; } };
function abrirPortal() {
  $('#portal-linea').textContent = T.portal.linea;
  $('#portal-carga').textContent = T.portal.cargando;
  $('#portal-saltar').textContent = T.portal.saltar;
  $('#portal').hidden = false;
  document.body.classList.add('en-portal');
  $('#portal-entrar').addEventListener('click', () => cruzarPortal(false));
  $('#portal-saltar').addEventListener('click', () => cruzarPortal(true));
}
async function portalListo() {
  await mundoPromesa;
  const b = $('#portal-entrar');
  $('#portal-marca').textContent = estado.info.name;
  b.disabled = false;
  b.innerHTML = `<span>${esc(T.portal.entrar)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg>`;
  $('#portal').classList.add('is-listo');
  b.focus({ preventScroll: true });
}
async function cruzarPortal(rapido) {
  const p = $('#portal');
  if (p.classList.contains('is-entrando')) return;
  try { sessionStorage.setItem('wk-portal', '1'); } catch { /* sin almacenamiento */ }
  p.classList.add('is-entrando');
  await mundoPromesa;
  const viaje = mundo ? mundo.entrar({ rapido }) : Promise.resolve();
  setTimeout(() => { p.hidden = true; document.body.classList.remove('en-portal'); }, rapido ? 350 : 1600);
  await viaje;
  $('#mundo').classList.add('is-listo');
}

// ---------------------------------------------------------------- mundo 3D (inicio y Walkurio)
function prenderMundo() {
  if (mundoPromesa) return mundoPromesa;
  mundoPromesa = (async () => {
    try {
      const { crearMundo } = await import('./mundo.js');
      mundo = crearMundo($('#lienzo'), {
        capaPines: $('#pines'),
        alSeleccionar: (r) => mostrarRegion(r, () => mundo.soltarFoco()),
        alTocarPlaneta: () => ui.navegar('/walkurio'),
      });
      mundo.setRegiones(regiones());
      mundo.modo(seccionDe() === 'walkurio' ? 'walkurio' : 'inicio');
      const ver = () => mundo.activo(!document.hidden && document.body.classList.contains('con-mundo') && mundoVisible);
      let mundoVisible = true;
      new IntersectionObserver(([e]) => { mundoVisible = e.isIntersecting; ver(); }).observe($('#mundo'));
      document.addEventListener('visibilitychange', ver);
      ui.mundoVer = ver;
    } catch (e) {
      console.warn('Sin 3D:', e);
      document.body.classList.add('sin-3d');
    }
    if (!document.body.classList.contains('en-portal')) {
      await mundo?.entrar({ rapido: true });
      $('#mundo').classList.add('is-listo');
    }
  })();
  return mundoPromesa;
}

function pintarMundo() {
  // Inicio
  $('#hero-ante').textContent = T.hero.antetitulo;
  $('#hero-titulo').innerHTML = T.hero.titulo.split(' ').map((w, i) => `<span class="wk-palabra" style="--i:${i}">${esc(w)}</span>`).join(' ');
  $('#hero-bajada').textContent = T.hero.bajada;
  $('#hero-boton').innerHTML = `${esc(T.hero.boton)}<svg aria-hidden="true"><use href="#i-flecha"/></svg>`;
  $('#hero-boton2').innerHTML = `<svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(T.hero.boton2)}`;
  $('#hero-planeta span').textContent = T.hero.planeta;
  // Walkurio
  $('#wkr-ante').textContent = T.walkurio.antetitulo;
  $('#wkr-titulo').textContent = T.walkurio.titulo;
  $('#wkr-bajada').textContent = T.walkurio.bajada;
  $('#wkr-boton').innerHTML = `<svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(T.walkurio.boton)}`;
  $('#wkr-pista span').textContent = tactil ? T.walkurio.pistaTactil : T.walkurio.pista;
  let siguiente = 0;
  $('#wkr-boton').addEventListener('click', () => {
    const n = regiones().length;
    if (!mundo || !n) return;
    mundo.enfocar(siguiente % n);
    siguiente++;
  });
}

// ---------------------------------------------------------------- menús (con desplegable de colecciones)
const hrefDe = (l) => ({ category: `/categoria/${l.handle}`, product: `/producto/${l.handle}`, catalog: '/tienda', home: '/' })[l.kind] ?? l.url ?? '/';
const esExterno = (u) => /^https?:/i.test(u);
const esAparte = (u) => /^\/walkiver(\/|$)/.test(u); // páginas propias fuera de esta app
const enlace = (l, extra = '') => {
  const href = hrefDe(l);
  return `<a href="${esc(href)}"${esExterno(href) ? ' target="_blank" rel="noopener"' : esAparte(href) ? '' : ' data-link'}${extra}>`;
};

function pintarMenus() {
  const info = estado.info;
  const main = info.menus.main.length ? info.menus.main
    : [{ label: 'Tienda', kind: 'catalog', children: [] }, { label: 'Walkurio', kind: 'url', url: '/walkurio', children: [] }, { label: 'Contacto', kind: 'url', url: '/contacto', children: [] }];
  $('#nav').innerHTML = main.map((l, i) => l.children?.length ? `
    <div class="wk-desplegable" data-desplegable>
      <button type="button" class="wk-desplegable__boton" aria-expanded="false" aria-controls="mega-${i}">${esc(l.label)}<svg aria-hidden="true"><use href="#i-abajo"/></svg></button>
      <div class="wk-mega" id="mega-${i}">
        <div class="wk-mega__items">
          ${l.children.map((c) => {
            const cat = c.kind === 'category' ? estado.categorias.find((x) => x.handle === c.handle) : null;
            return `${enlace(c, ' class="wk-mega__item"')}
              <span class="wk-mega__foto">${cat?.image ? foto(cat.image, cat.name, 320) : sinFoto(c.label)}</span>
              <span><strong>${esc(c.label)}</strong>${cat ? `<small>${cat.productCount} piezas</small>` : ''}</span></a>`;
          }).join('')}
        </div>
        <a class="wk-mega__destacado" href="/walkurio" data-link>
          <span class="wk-mega__planeta" aria-hidden="true"></span>
          <small>${esc(T.walkurio.antetitulo)}</small><strong>${esc(T.walkurio.titulo)}</strong>
          <span>${esc(T.walkurio.boton)} →</span>
        </a>
      </div>
    </div>` : `${enlace(l)}${esc(l.label)}</a>`).join('');
  // El menú grande (☰) muestra también los hijos
  $('#panel-nav').innerHTML = main.map((l, i) =>
    `${enlace(l, ` style="--i:${i}"`)}<small>${String(i + 1).padStart(2, '0')}</small>${esc(l.label)}</a>${l.children?.length ? `<div class="wk-panel-hijos" style="--i:${i}">${l.children.map((c) => `${enlace(c)}${esc(c.label)}</a>`).join('')}</div>` : ''}`).join('');
  $('#pie-menu').innerHTML = info.menus.footer.map((l) => l.children?.length
    ? `<div><strong>${esc(l.label)}</strong><ul>${l.children.map((c) => `<li>${enlace(c)}${esc(c.label)}</a></li>`).join('')}</ul></div>`
    : `<div>${enlace(l)}${esc(l.label)}</a></div>`).join('');

  // Desplegables: con mouse se abren al pasar; con teclado o toque, al apretar
  $$('[data-desplegable]').forEach((d) => {
    const b = d.querySelector('button');
    const abrir = (si) => { b.setAttribute('aria-expanded', String(si)); d.classList.toggle('is-abierto', si); };
    let t;
    if (!tactil) {
      d.addEventListener('pointerenter', () => { clearTimeout(t); abrir(true); });
      d.addEventListener('pointerleave', () => { t = setTimeout(() => abrir(false), 180); });
    }
    b.addEventListener('click', () => abrir(b.getAttribute('aria-expanded') !== 'true'));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { abrir(false); b.focus(); } });
    d.addEventListener('focusout', (e) => { if (!d.contains(e.relatedTarget)) abrir(false); });
    d.addEventListener('click', (e) => { if (e.target.closest('a')) abrir(false); });
  });
}

function pintarHablemos() {
  const c = estado.info.contact;
  const wa = (c.whatsapp || '').replace(/\D/g, '').replace(/^0/, '598');
  const redes = [['instagram', 'i-ig'], ['facebook', 'i-fb']].filter(([k]) => c[k]);
  $('#hablemos').insertAdjacentHTML('beforeend', [
    c.phone && `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}"><svg aria-hidden="true"><use href="#i-phone"/></svg>${esc(c.phone)}</a>`,
    wa && `<a href="https://wa.me/${wa}${c.whatsappMessage ? `?text=${encodeURIComponent(c.whatsappMessage)}` : ''}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>WhatsApp</a>`,
    c.email && `<a href="mailto:${esc(c.email)}"><svg aria-hidden="true"><use href="#i-mail"/></svg>${esc(c.email)}</a>`,
    c.location && `<p><svg aria-hidden="true"><use href="#i-pin"/></svg>${esc(c.location)}</p>`,
    redes.length && `<div class="ns-panel__social">${redes.map(([k, i]) => `<a href="${esc(c[k])}" target="_blank" rel="noopener" aria-label="${k}"><svg aria-hidden="true"><use href="#${i}"/></svg></a>`).join('')}</div>`,
  ].filter(Boolean).join(''));
  if (!$('#hablemos').querySelector('a, p:not(.ns-panel__label)')) $('#hablemos').hidden = true;
}

function pintarAviso() {
  const a = estado.info.announcement;
  if (!a?.text) return;
  $('#aviso').innerHTML = `<svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(a.text)}${a.buttonText && a.link ? ` <a href="${esc(a.link)}">${esc(a.buttonText)} →</a>` : ''}`;
  $('#aviso').hidden = false;
  document.body.classList.add('con-aviso');
}

// ---------------------------------------------------------------- cookies y medición
function pintarCookies() {
  const info = estado.info;
  const ck = info.cookies;
  const eleccion = (() => { try { return localStorage.getItem('cookies'); } catch { return null; } })();
  if (!ck || ck.mode === 'notice' || eleccion === 'todas') cargarMedicion();
  if (!ck || eleccion) return;
  const el = $('#cookies');
  const privacidad = info.legal.find((l) => l.kind === 'privacy');
  el.innerHTML = `<p>${esc(ck.text || 'Usamos cookies para que la tienda funcione y, si aceptás, para medir las visitas.')}
    ${privacidad ? `<a href="/legal/privacy" data-link>${esc(privacidad.title)}</a>` : ''}</p>
    <div>${ck.mode === 'consent' ? `<button class="wk-btn wk-btn--vidrio" data-cookies="necesarias">${esc(ck.rejectText || 'Solo necesarias')}</button>` : ''}
    <button class="wk-btn wk-btn--luz" data-cookies="todas">${esc(ck.acceptText || (ck.mode === 'consent' ? 'Aceptar' : 'Entendido'))}</button></div>`;
  el.hidden = false;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cookies]');
    if (!b) return;
    try { localStorage.setItem('cookies', b.dataset.cookies); } catch { /* sin almacenamiento */ }
    el.hidden = true;
    if (b.dataset.cookies === 'todas' && ck.mode === 'consent') cargarMedicion();
  });
}
function cargarMedicion() {
  const { ga4, metaPixel } = estado.info.analytics ?? {};
  if (ga4 && /^G-[A-Z0-9]+$/.test(ga4)) {
    const s = document.createElement('script');
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
    document.head.append(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', ga4);
  }
  if (metaPixel && /^\d+$/.test(metaPixel)) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', metaPixel); window.fbq('track', 'PageView');
  }
}

// ---------------------------------------------------------------- navegación con transición
let navegando = false;
async function navegar(href, x = innerWidth / 2, y = innerHeight / 2) {
  if (navegando) return;
  const destino = href.startsWith('/') ? BASE + href : href;
  const url = new URL(destino, location.href);
  const misma = url.pathname === location.pathname;
  if (misma && url.hash) { history.pushState(null, '', destino); document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth' }); return; }
  if (misma && url.search === location.search) { window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' }); return; }
  navegando = true;
  const velo = $('#transicion');
  if (!reducido) {
    velo.style.setProperty('--x', `${x}px`);
    velo.style.setProperty('--y', `${y}px`);
    velo.className = 'wk-transicion is-cubre';
    await espera(520);
  }
  history.pushState(null, '', destino);
  await ruta();
  if (!reducido) {
    velo.className = 'wk-transicion is-descubre';
    await espera(650);
    velo.className = 'wk-transicion';
  }
  navegando = false;
}
ui.navegar = (href) => navegar(href);

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  cerrarBusqueda();
  navegar(a.getAttribute('href'), e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
});
// Enlaces absolutos fuera de la app (ej.: /walkiver/) cuando la web vive en una subcarpeta
if (BASE) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="/"]:not([data-link])');
    if (!a || a.getAttribute('href').startsWith(`${BASE}/`) || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    location.href = BASE + a.getAttribute('href');
  });
}
// Anclas dentro de la página: scroll suave sin cambiar de ruta
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const destino = document.getElementById(a.getAttribute('href').slice(1));
  if (!destino) return;
  e.preventDefault();
  destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth' });
});
// Agregar al carrito desde cualquier tarjeta o carta
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-agregar]');
  if (!b) return;
  e.preventDefault();
  agregarRapido(b.dataset.agregar, b);
});

async function ruta() {
  rutaActual = location.pathname;
  const partes = camino().split('/').filter(Boolean).map(decodeURIComponent);
  const [seccion = '', valor] = partes;
  const params = new URLSearchParams(location.search);
  const cuerpo = document.body.classList;
  cuerpo.toggle('con-mundo', conMundo(seccion));
  cuerpo.toggle('es-inicio', ['', 'index.html'].includes(seccion));
  cuerpo.toggle('es-walkurio', seccion === 'walkurio');
  cuerpo.toggle('tope-claro', seccion === 'producto');
  document.documentElement.dataset.pagina = seccion || 'inicio';
  document.documentElement.classList.remove('arranca-con-mundo');
  cerrarRegion();
  if (conMundo(seccion)) {
    prenderMundo().then(() => { mundo?.modo(seccion === 'walkurio' ? 'walkurio' : 'inicio'); ui.mundoVer?.(); });
  } else mundo?.activo(false);
  $$('#nav a, #nav .wk-desplegable__boton').forEach((a) => {
    const h = a.getAttribute('href');
    const activo = h ? (h === '/' ? !seccion : camino().startsWith(h.replace(/\/$/, '')) && h !== '/') : seccion === 'tienda' || seccion === 'categoria';
    a.classList.toggle('is-activo', activo);
  });
  window.scrollTo(0, 0);
  try {
    if (seccion === 'producto' && valor) await ficha(valor);
    else if (seccion === 'categoria' && valor) await catalogo(valor);
    else if (seccion === 'tienda') await catalogo(null, params.get('buscar') ?? '');
    else if (seccion === 'walkurio') await walkurio(await prenderMundo().then(() => mundo));
    else if (seccion === 'cursos') await cursos();
    else if (seccion === 'deseos') await deseos();
    else if (seccion === 'contacto') contacto();
    else if (seccion === 'legal' && valor) await legal(valor);
    else if (seccion === 'carrito') await carritoRuta(valor);
    else if (['', 'index.html'].includes(seccion)) await inicio();
    else throw new Error('404');
  } catch (e) {
    if (e.message !== '404') console.warn(e);
    noEncontrado();
  }
  revelar();
  app.focus({ preventScroll: true });
}

/** /carrito/agregar/<producto>:1 (lo usan los botones de compra de Walkiver) y /carrito. */
async function carritoRuta(accion) {
  const [, item] = location.pathname.split('/agregar/');
  history.replaceState(null, '', `${BASE}/tienda`);
  await catalogo(null);
  if (accion === 'agregar' && item) {
    const [handle] = decodeURIComponent(item).split(':');
    try {
      const p = await tienda.productos.uno(handle);
      const v = p.variants.find((x) => x.available);
      if (!v) throw new Error(`${p.title} no está disponible en este momento.`);
      await tienda.carrito.agregar(v.id, 1);
    } catch (e) { aviso(e.message); }
  }
  abrirCarrito();
}

async function legal(tipo) {
  const l = await tienda.legal(tipo);
  document.title = `${l.title} · ${estado.info.name}`;
  app.innerHTML = `${cabecera({ titulo: l.title, escena: 'niebla' })}<article class="contenedor legal">${l.html}</article>`;
}
function noEncontrado() {
  document.title = `${T.noEncontrado.titulo} · ${estado.info.name}`;
  app.innerHTML = `${cabecera({ ante: '404', titulo: T.noEncontrado.titulo, bajada: T.noEncontrado.bajada, escena: 'perdido', extra: `<a class="wk-btn wk-btn--luz wk-cabecera__boton" href="/" data-link>${esc(T.noEncontrado.boton)}</a>` })}`;
}

// ---------------------------------------------------------------- búsqueda global
const lugares = () => [
  { titulo: 'Walkurio', texto: T.walkurio.antetitulo, href: '/walkurio', icono: 'i-planeta' },
  { titulo: 'Tienda', texto: T.tienda.bajada, href: '/tienda', icono: 'i-bag' },
  ...['criaturas', 'objetos', 'duendes'].map(categoria).filter(Boolean).map((c) => ({ titulo: c.name, texto: `${c.productCount} piezas`, href: `/categoria/${c.handle}`, icono: 'i-chispa' })),
  ...regiones().map((c) => ({ titulo: c.name, texto: T.region.antetitulo, href: `/categoria/${c.handle}`, icono: 'i-pin' })),
  { titulo: T.cursos.titulo, texto: T.cursos.antetitulo, href: '/cursos', icono: 'i-bitacora' },
  { titulo: 'Pedí un deseo', texto: T.deseo.titulo, href: '/deseos', icono: 'i-chispa' },
  { titulo: 'Walkiver', texto: 'Sobre mí, e-book y vídeos', href: '/walkiver/', icono: 'i-pluma', aparte: true },
  { titulo: 'Contacto', texto: T.contacto.titulo, href: '/contacto', icono: 'i-mail' },
];
const normal = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
let previoBusqueda;
function abrirBusqueda() {
  const b = $('#busqueda');
  if (b.classList.contains('is-abierta')) return;
  previoBusqueda = document.activeElement;
  b.hidden = false;
  document.body.classList.add('con-busqueda');
  requestAnimationFrame(() => b.classList.add('is-abierta'));
  $('#busqueda-titulo').textContent = T.buscar.titulo;
  $('#q').placeholder = T.buscar.placeholder;
  buscar('');
  setTimeout(() => $('#q').focus(), 50);
}
function cerrarBusqueda() {
  const b = $('#busqueda');
  if (!b.classList.contains('is-abierta')) return;
  b.classList.remove('is-abierta');
  document.body.classList.remove('con-busqueda');
  setTimeout(() => { b.hidden = true; }, 400);
  previoBusqueda?.focus?.();
}
let turno = 0;
async function buscar(q) {
  const yo = ++turno;
  const res = $('#busqueda-res');
  const n = normal(q.trim());
  const pags = lugares().filter((l) => !n || normal(`${l.titulo} ${l.texto}`).includes(n)).slice(0, n ? 6 : 8);
  const htmlLugares = pags.length ? `<div class="wk-busqueda__grupo"><p class="wk-busqueda__etiqueta">${n ? esc(T.buscar.paginas) : esc(T.buscar.sugerencias)}</p><div class="wk-busqueda__lugares">${pags.map((l) => `<a href="${esc(l.href)}"${l.aparte ? '' : ' data-link'}><svg aria-hidden="true"><use href="#${l.icono}"/></svg><span><strong>${esc(l.titulo)}</strong><small>${esc(l.texto)}</small></span></a>`).join('')}</div></div>` : '';
  if (!n) { res.innerHTML = htmlLugares; return; }
  res.innerHTML = `${htmlLugares}<div class="wk-busqueda__grupo"><p class="wk-busqueda__etiqueta">${esc(T.buscar.productos)}</p><span class="wk-cargando"></span></div>`;
  await espera(160);
  if (yo !== turno) return;
  const { items, total } = await tienda.productos.listar({ buscar: q.trim(), porPagina: 6 }).catch(() => ({ items: [], total: 0 }));
  if (yo !== turno) return;
  res.innerHTML = `${htmlLugares}<div class="wk-busqueda__grupo"><p class="wk-busqueda__etiqueta">${esc(T.buscar.productos)}</p>
    ${items.length ? `<div class="wk-busqueda__piezas">${items.map((p, i) => `<a href="/producto/${esc(p.handle)}" data-link style="--i:${i}"><span class="wk-busqueda__foto">${foto(p.image, p.title, 320) || sinFoto(p.title)}</span><span><strong>${esc(p.title)}</strong>${precio(p)}</span></a>`).join('')}</div>
    ${total > items.length ? `<a class="wk-btn wk-btn--vidrio" href="/tienda?buscar=${encodeURIComponent(q.trim())}" data-link>${esc(T.buscar.todo)} (${total})<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>` : ''}`
    : `<p class="wk-busqueda__nada">${esc(T.buscar.nada)}</p>`}</div>`;
}
$('#abrir-busqueda').addEventListener('click', abrirBusqueda);
$('#busqueda').addEventListener('click', (e) => { if (e.target.closest('[data-cerrar-busqueda]')) cerrarBusqueda(); });
$('#q').addEventListener('input', (e) => buscar(e.target.value));
$('#busqueda-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#q').value.trim();
  if (!q) return;
  cerrarBusqueda();
  navegar(`/tienda?buscar=${encodeURIComponent(q)}`);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarBusqueda();
  const escribiendo = e.target.closest?.('input, textarea, select, [contenteditable]');
  if (!escribiendo && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); abrirBusqueda(); }
});

// ---------------------------------------------------------------- tarjetas con relieve (solo mouse)
if (!tactil && !reducido) {
  let actual = null;
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest?.('.tarjeta:not(.tarjeta--fantasma), .ficha__principal, .wk-carta, .wk-curso, .wk-certificado');
    if (actual && actual !== t) { actual.style.removeProperty('--rx'); actual.style.removeProperty('--ry'); actual = null; }
    if (!t) return;
    actual = t;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    const fuerza = t.classList.contains('ficha__principal') ? 6 : t.classList.contains('wk-carta') ? 12 : 8;
    t.style.setProperty('--rx', `${((0.5 - y) * fuerza).toFixed(2)}deg`);
    t.style.setProperty('--ry', `${((x - 0.5) * fuerza).toFixed(2)}deg`);
    t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  }, { passive: true });
}

// ---------------------------------------------------------------- carrito (firma NS 4)
const carrito = $('#carrito');
const velo = $('#carrito-velo');
function abrirCarrito() {
  velo.hidden = false;
  carrito.inert = false;
  carrito.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => carrito.classList.add('is-open'));
  $('#cerrar-carrito').focus();
}
ui.abrirCarrito = abrirCarrito;
function cerrarCarrito() {
  carrito.classList.remove('is-open');
  carrito.inert = true;
  carrito.setAttribute('aria-hidden', 'true');
  velo.hidden = true;
}
$('#abrir-carrito').addEventListener('click', abrirCarrito);
$('#cerrar-carrito').addEventListener('click', cerrarCarrito);
velo.addEventListener('click', cerrarCarrito);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && carrito.classList.contains('is-open')) cerrarCarrito(); });
carrito.addEventListener('click', (e) => { if (e.target.closest('a[data-link]')) cerrarCarrito(); });

function pintarCarrito(c) {
  const cont = $('#contador');
  if (cont.textContent !== String(c.itemCount)) { cont.textContent = c.itemCount; cont.classList.remove('is-salta'); void cont.offsetWidth; cont.classList.add('is-salta'); }
  $('#carrito-lineas').innerHTML = c.lines.length ? c.lines.map((l) => `
    <div class="linea">
      <a href="/producto/${esc(l.handle)}" data-link class="linea__foto">${l.image ? `<img src="${esc(l.image.sizes?.['320'] ?? l.image.url)}" alt="">` : sinFoto(l.title)}</a>
      <div><strong>${esc(l.title)}</strong>${l.variantTitle ? `<small>${esc(l.variantTitle)}</small>` : ''}
        <span class="cantidad"><button data-linea="${l.line}" data-cant="${l.quantity - 1}" aria-label="Quitar uno">−</button>${l.quantity}<button data-linea="${l.line}" data-cant="${l.quantity + 1}" aria-label="Agregar uno"${l.maxQuantity !== null && l.quantity >= l.maxQuantity ? ' disabled' : ''}>+</button></span>
      </div>
      <strong>${tienda.formatear(l.total, c.currency)}</strong>
    </div>`).join('') : `<div class="carrito__vacio"><span class="wk-sinfoto" data-tono="1" aria-hidden="true"><svg><use href="#i-chispa"/></svg></span><p>Tu carrito está vacío… por ahora.</p><a class="wk-btn wk-btn--linea" href="/tienda" data-link>Explorar la tienda</a></div>`;
  $('#carrito-pie').innerHTML = c.lines.length
    ? `<div class="carrito__total"><span>Total</span><strong>${tienda.formatear(c.total, c.currency)}</strong></div>
       <button class="wk-btn wk-btn--noche wk-btn--grande" id="finalizar">Finalizar compra</button>`
    : '';
}
$('#carrito-lineas').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-linea]');
  if (b) await tienda.carrito.cambiar(Number(b.dataset.linea), Number(b.dataset.cant)).catch((err) => aviso(err.message));
});
$('#carrito-pie').addEventListener('click', (e) => {
  // El pago se conecta cuando la plataforma tenga checkout (tienda.checkout)
  if (e.target.closest('#finalizar')) aviso('El pago se habilita en la próxima etapa de la plataforma.');
});

arrancar();
