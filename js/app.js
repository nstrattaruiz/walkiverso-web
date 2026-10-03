// Walkiverso · web para la plataforma (Kit NS).
// Todos los datos salen de la tienda con el SDK: el cliente los cambia desde su panel.
// Estructura y experiencia de PULSO (barra de anuncios, menú grande, carrito, buscador, pie) con la magia de Walkiverso.
// Rutas: /  ·  /walkurio  ·  /tienda  ·  /categoria/:handle  ·  /producto/:handle  ·  /cursos  ·  /contacto  ·  /favoritos  ·  /cuenta  ·  /legal/:tipo
// (Walkiver vive aparte en /walkiver/ y /walkiver/somos-mitos/)
import { tienda, T, $, $$, esc, app, estado, ui, reducido, tactil, espera, regiones, colecciones, coleccionDe, foto, sinFoto, cabecera, revelar, agregarRapido, aviso, icono, flecha, imagenColeccion, tonoColeccion } from './base.js';
import { polvoDeHadas } from './polvo.js';
import { inicio } from './paginas/inicio.js';
import { catalogo } from './paginas/tienda.js';
import { ficha } from './paginas/ficha.js';
import { walkurio, mostrarRegion, cerrarRegion } from './paginas/walkurio.js';
import { cursos } from './paginas/cursos.js';
import { iniciarCuenta, favoritosPagina, cuentaPagina, repintarFavoritos } from './cuenta.js';
import { cubrir, descubrir } from './transicion.js';
import { ramasDeFondo } from './ramas.js';
import { contacto } from './paginas/contacto.js';
import { crearBosque } from './bosque.js';
import { preguntas } from './config.js';
import { lindeDelBosque } from './paisaje.js';
import { iniciarFluidez } from './fluidez.js';

let rutaActual = '';
let mundo = null;
let mundoPromesa = null;
/** En GitHub Pages la web vive en una subcarpeta (/repo); en la plataforma, en la raíz. */
const BASE = window.WK_BASE || '';
const camino = () => location.pathname.slice(BASE.length) || '/';
const seccionDe = (p = camino()) => p.split('/').filter(Boolean)[0] ?? '';
const conMundo = (s) => s === 'walkurio'; // el planeta vive solo en Walkurio

// ---------------------------------------------------------------- arranque
async function arrancar() {
  const [info, categorias] = await Promise.all([tienda.info(), tienda.categorias()]);
  Object.assign(estado, { info, categorias });
  document.title = info.seo.title || info.name;
  $('#marca').alt = info.name;
  if (info.logo) $('#marca').outerHTML = `<img src="${esc(info.logo.url ?? info.logo)}" alt="${esc(info.name)}" height="36">`;
  if (info.colors?.primary) document.documentElement.style.setProperty('--celeste', info.colors.primary);
  if (info.colors?.dark) document.documentElement.style.setProperty('--noche', info.colors.dark);
  if (info.favicon) document.head.insertAdjacentHTML('beforeend', `<link rel="icon" href="${esc(info.favicon)}">`);
  if (info.seo.description) $('meta[name=description]').content = info.seo.description;
  if (tienda.demo) $('#demo').hidden = false;

  pintarBarraAnuncios();
  pintarMenus();
  pintarHablemos();
  pintarPie();
  pintarCookies();
  pintarMundo();

  tienda.carrito.alCambiar(pintarCarrito);
  pintarCarrito(await tienda.carrito.ver(), false);
  window.addEventListener('popstate', () => { if (location.pathname !== rutaActual) ruta(); });
  polvoDeHadas();
  ui.bosque = crearBosque($('#bosque'));
  ui.fluidez = await iniciarFluidez();
  await iniciarCuenta();
  await ruta();
  if (new URLSearchParams(location.search).has('carrito')) abrirCarrito();
}

// ---------------------------------------------------------------- barra de anuncios (se va con el scroll)
function pintarBarraAnuncios() {
  if (!$('.wv-topbar')) { document.documentElement.style.setProperty('--wv-top', '0px'); return; }
  const a = estado.info.announcement;
  const frases = a?.text ? [a.text, ...T.cinta.slice(1, 3)] : T.cinta;
  $('#topbar-texto').textContent = frases.join('. ');
  const vuelta = frases.map((f) => `<span>${esc(f)}</span><i class="wk-mano"></i>`).join('');
  $('#topbar').innerHTML = vuelta.repeat(4);
  const barra = $('.wv-topbar');
  const raiz = document.documentElement;
  let raf = 0;
  const sync = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => raiz.style.setProperty('--wv-top', `${Math.max(0, barra.offsetHeight - scrollY)}px`));
  };
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync, { passive: true });
  sync();
}

// ---------------------------------------------------------------- mundo 3D (Walkurio)
function prenderMundo() {
  if (mundoPromesa) return mundoPromesa;
  mundoPromesa = (async () => {
    try {
      const { crearMundo } = await import('./mundo.js');
      mundo = crearMundo($('#lienzo'), {
        capaPines: $('#pines'),
        alSeleccionar: (r) => mostrarRegion(r, () => mundo.soltarFoco()),
      });
      mundo.setRegiones(regiones());
      mundo.modo('walkurio');
      const ver = () => mundo.activo(!document.hidden && document.body.classList.contains('con-mundo') && mundoVisible);
      let mundoVisible = true;
      new IntersectionObserver(([e]) => { mundoVisible = e.isIntersecting; ver(); }).observe($('#mundo'));
      document.addEventListener('visibilitychange', ver);
      ui.mundoVer = ver;
    } catch (e) {
      console.warn('Sin 3D:', e);
      document.body.classList.add('sin-3d');
    }
  })();
  return mundoPromesa;
}

/** Cada vez que se entra a Walkurio, el viaje entre las estrellas hasta el planeta. */
async function viajarAWalkurio() {
  await prenderMundo();
  $('#mundo').classList.remove('is-listo');
  ui.mundoVer?.();
  await mundo?.entrar({ rapido: false });
  $('#mundo').classList.add('is-listo');
}

function pintarMundo() {
  $('#wkr-ante').textContent = T.walkurio.antetitulo;
  $('#wkr-titulo').textContent = T.walkurio.titulo;
  $('#wkr-bajada').textContent = T.walkurio.bajada;
  $('#wkr-boton').innerHTML = `${icono('i-chispa')}${esc(T.walkurio.boton)}`;
  $('#wkr-pista span').textContent = tactil ? T.walkurio.pistaTactil : T.walkurio.pista;
  let siguiente = 0;
  $('#wkr-boton').addEventListener('click', () => {
    const n = regiones().length;
    if (!mundo || !n) return;
    mundo.enfocar(siguiente % n);
    siguiente++;
  });
}

// ---------------------------------------------------------------- menús
const hrefDe = (l) => ({ category: `/categoria/${l.handle}`, product: `/producto/${l.handle}`, catalog: '/tienda', home: '/' })[l.kind] ?? l.url ?? '/';
const esExterno = (u) => /^https?:/i.test(u);
const esAparte = (u) => /^\/walkiver(\/|$)/.test(u); // páginas propias fuera de esta app
const enlace = (l, extra = '') => {
  const href = typeof l === 'string' ? l : hrefDe(l);
  return `<a href="${esc(href)}"${esExterno(href) ? ' target="_blank" rel="noopener"' : esAparte(href) ? '' : ' data-link'}${extra}>`;
};

function pintarMenus() {
  const info = estado.info;
  const main = info.menus.main.length ? info.menus.main
    // Si el panel todavía no tiene menú cargado, la web muestra el recorrido completo
    : [{ label: 'Tienda', kind: 'catalog', children: [] }, { label: 'Walkurio', kind: 'url', url: '/walkurio', children: [] }, { label: 'Cursos', kind: 'url', url: '/cursos', children: [] }, { label: 'Walkiver', kind: 'url', url: '/walkiver/', children: [] }, { label: 'Contacto', kind: 'url', url: '/contacto', children: [] }];
  $('#nav').innerHTML = main.map((l) => `${enlace(l)}${esc(l.label)}</a>`).join('');
  $('#panel-nav').innerHTML = [...main, { label: T.cuenta.favoritos, url: '/favoritos' }].map((l, i) =>
    `${enlace(l, ` style="--i:${i}"`)}<small>${String(i + 1).padStart(2, '0')}</small><span>${esc(l.label)}</span><i class="wv-menu__go" aria-hidden="true"></i></a>`).join('');
  $('#menu-cats').innerHTML = colecciones().filter((c) => c.productCount).slice(0, 6).map((c, i) => `
    <a class="wv-menu__cat wv-tono--${tonoColeccion(i)}" href="/categoria/${esc(c.handle)}" data-link style="--i:${i}">
      ${imagenColeccion(c).includes('wv-orbe-luz') ? '' : `<span class="wv-menu__cat-img">${imagenColeccion(c)}</span>`}
      <strong>${esc(c.name)}</strong><span>${esc(T.categorias.piezas(c.productCount))}</span>
    </a>`).join('');
}

function pintarHablemos() {
  const c = estado.info.contact;
  const wa = (c.whatsapp || '').replace(/\D/g, '').replace(/^0/, '598');
  $('#hablemos').insertAdjacentHTML('beforeend', [
    c.phone && `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${icono('i-phone')}${esc(c.phone)}</a>`,
    wa && `<a href="https://wa.me/${wa}${c.whatsappMessage ? `?text=${encodeURIComponent(c.whatsappMessage)}` : ''}" target="_blank" rel="noopener">${icono('i-wa')}WhatsApp</a>`,
    c.email && `<a href="mailto:${esc(c.email)}">${icono('i-mail')}${esc(c.email)}</a>`,
    `<a class="wv-btn wv-btn--luz wv-btn--sm" href="/contacto" data-link>${esc(T.contacto.enviar)}</a>`,
  ].filter(Boolean).join(''));
}

// ---------------------------------------------------------------- pie: el claro del bosque (con las preguntas)
function pintarPie() {
  const info = estado.info;
  const c = info.contact;
  const redes = [['instagram', 'i-ig', 'Instagram'], ['facebook', 'i-fb', 'Facebook']].filter(([k]) => c[k]);
  $('#pie').innerHTML = `
    ${lindeDelBosque()}
    <span class="wk-ramas-fondo wk-ramas-fondo--luz wv-pie__raices" data-esquinas="bl,br" data-semilla="77"></span>
    <div class="wv-pie__luciernagas" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--x:${(i * 61) % 100}%;--y:${20 + ((i * 37) % 70)}%;--d:${(i % 7) * -1.3}s;--t:${7 + (i % 5) * 1.6}s"></i>`).join('')}</div>
    <div class="wv-container wv-pie__preguntas">
      <div class="wv-pie__cab">
        <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.preguntas.antetitulo)}</p>
        <h2 class="wv-pie__titulo">${esc(T.preguntas.titulo)}</h2>
        <label class="wv-toolbar__search wv-oraculo"><span class="wk-oraculo__orbe" aria-hidden="true"></span><input type="search" id="oraculo" placeholder="${esc(T.preguntas.oraculo)}" aria-label="${esc(T.preguntas.oraculo)}" autocomplete="off"></label>
        <p class="wv-pie__otra">${esc(T.preguntas.otra)} <a href="/contacto" data-link>${esc(T.preguntas.escribinos)} →</a></p>
      </div>
      <div class="wv-faq" id="faq">
        ${[0, 1].map((col) => `<div class="wv-faq__col">${preguntas.filter((_, k) => k % 2 === col).map(([q, a]) => `
          <details class="wv-faq__item" data-texto="${esc(`${q} ${a}`.toLowerCase())}">
            <summary>${esc(q)}<span class="wv-faq__icon" aria-hidden="true">${icono('i-mas')}</span></summary>
            <p>${esc(a)}</p>
          </details>`).join('')}</div>`).join('')}
        <p class="wv-search__none" id="faq-nada" hidden><strong>${esc(T.preguntas.nada)}</strong></p>
      </div>
    </div>
    <div class="wv-pie__luna">
      <span class="wv-pie__halo" aria-hidden="true"></span>
      <a href="/" data-link aria-label="${esc(info.name)}, ir al inicio"><img class="wv-pie__logo" src="img/logo.svg" alt="${esc(info.name)}" width="520" height="140" loading="lazy"></a>
      <p class="wv-pie__lema">${esc(T.viaje.lema)}</p>
    </div>
    <div class="wv-container wv-pie__grid">
      ${info.menus.footer.map((l) => `
        <nav class="wv-footer__col" aria-label="${esc(l.label)}">
          <h2>${esc(l.label)}</h2>
          ${(l.children?.length ? l.children : [l]).map((x) => `${enlace(x)}${esc(x.label)}</a>`).join('')}
        </nav>`).join('')}
      ${redes.length || c.email ? `
        <div class="wv-footer__col">
          <h2>Seguinos</h2>
          ${redes.map(([k, i, n]) => `<a href="${esc(c[k])}" target="_blank" rel="noopener">${icono(i)}${n}</a>`).join('')}
          ${c.email ? `<a href="mailto:${esc(c.email)}">${icono('i-mail')}${esc(c.email)}</a>` : ''}
        </div>` : ''}
    </div>
    <div class="wv-container wv-footer__bottom">
      <p>© ${new Date().getFullYear()} ${esc(info.name)} · Hecho a mano en Uruguay</p>
      <div>${info.legal.map((l) => `<a href="/legal/${l.kind}" data-link>${esc(l.title)}</a>`).join('')}</div>
    </div>`;
  ramasDeFondo($('#pie'));
  // El oráculo filtra las preguntas; si queda una sola, la abre
  const lista = $('#faq');
  const normal = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  $('#oraculo').addEventListener('input', (e) => {
    const q = normal(e.target.value.trim());
    let hay = 0;
    $$('.wv-faq__item', lista).forEach((p) => { const ok = !q || q.split(/\s+/).every((w) => normal(p.dataset.texto).includes(w)); p.hidden = !ok; if (ok) hay++; });
    $('#faq-nada').hidden = hay > 0;
    $('.wv-oraculo', $('#pie')).classList.toggle('is-pensando', !!q);
    const visibles = $$('.wv-faq__item:not([hidden])', lista);
    if (q && visibles.length === 1) visibles[0].open = true;
  });
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
  el.innerHTML = `<p><strong>Cookies del Walkiverso.</strong> ${esc(ck.text || 'Usamos cookies para que la tienda funcione y, si aceptás, para medir las visitas.')}
    ${privacidad ? `<a href="/legal/privacy" data-link>${esc(privacidad.title)}</a>` : ''}</p>
    <div>${ck.mode === 'consent' ? `<button class="wv-btn wv-btn--outline-light wv-btn--sm" data-cookies="necesarias">${esc(ck.rejectText || 'Solo necesarias')}</button>` : ''}
    <button class="wv-btn wv-btn--luz wv-btn--sm" data-cookies="todas">${esc(ck.acceptText || (ck.mode === 'consent' ? 'Aceptar' : 'Entendido'))}</button></div>`;
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
  if (misma && url.hash) { history.pushState(null, '', destino); const el = document.getElementById(decodeURIComponent(url.hash.slice(1))); if (el) ui.fluidez?.ir(el); return; }
  if (misma && url.search === location.search) { window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' }); return; }
  navegando = true;
  await cubrir(x, y);
  history.pushState(null, '', destino);
  await ruta();
  await descubrir();
  navegando = false;
}
ui.navegar = (href) => navegar(href);
ui.catalogo = (h, q) => catalogo(h, q);

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  cerrarBusqueda();
  cerrarCarrito();
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
  ui.fluidez ? ui.fluidez.ir(destino) : destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth' });
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
  ui.alSalir?.();
  ui.alSalir = null;
  const cuerpo = document.body.classList;
  cuerpo.toggle('con-mundo', conMundo(seccion));
  cuerpo.toggle('es-inicio', ['', 'index.html'].includes(seccion));
  cuerpo.toggle('es-walkurio', seccion === 'walkurio');
  // Tienda, ficha y cuenta: claras como papel. El resto vive en el bosque de noche.
  const clara = ['tienda', 'categoria', 'producto', 'favoritos', 'cuenta', 'legal', 'carrito'].includes(seccion);
  cuerpo.toggle('tema-claro', clara);
  ui.bosque?.activo(!clara && seccion !== 'walkurio');
  if (!['', 'index.html'].includes(seccion)) ui.bosque?.abrir(true);
  document.documentElement.dataset.pagina = seccion || 'inicio';
  document.documentElement.classList.remove('arranca-con-mundo');
  cerrarRegion();
  if (conMundo(seccion)) viajarAWalkurio();
  else mundo?.activo(false);
  // Enlace activo en la barra y en el menú grande
  $$('#nav a, #panel-nav a').forEach((a) => {
    const h = a.getAttribute('href');
    const activo = h === '/' ? !seccion : h === '/tienda' ? ['tienda', 'categoria', 'producto'].includes(seccion) : camino().startsWith(h.replace(/\/$/, '')) && h !== '/';
    a.classList.toggle('is-active', activo);
    if (activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  ui.fluidez ? ui.fluidez.arriba() : window.scrollTo(0, 0);
  try {
    if (seccion === 'producto' && valor) await ficha(valor);
    else if (seccion === 'categoria' && valor) await catalogo(valor);
    else if (seccion === 'tienda') await catalogo(null, params.get('buscar') ?? '');
    else if (seccion === 'walkurio') await walkurio(await prenderMundo().then(() => mundo));
    else if (seccion === 'cursos') await cursos();
    else if (seccion === 'favoritos') await favoritosPagina();
    else if (seccion === 'cuenta') await cuentaPagina();
    else if (seccion === 'contacto') contacto();
    else if (seccion === 'legal' && valor) await legal(valor);
    else if (seccion === 'carrito') await carritoRuta(valor);
    else if (['', 'index.html'].includes(seccion)) await inicio();
    else throw new Error('404');
  } catch (e) {
    if (e.message !== '404') console.warn(e);
    noEncontrado();
  }
  app.classList.remove('is-entering'); void app.offsetWidth; app.classList.add('is-entering');
  repintarFavoritos();
  ramasDeFondo(app);
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
  app.innerHTML = `${cabecera({ ante: estado.info.name, titulo: l.title })}<article class="wv-container wv-legal">${l.html}</article>`;
}
function noEncontrado() {
  document.title = `${T.noEncontrado.titulo} · ${estado.info.name}`;
  app.innerHTML = `${cabecera({ ante: '404', titulo: T.noEncontrado.titulo, bajada: T.noEncontrado.bajada, extra: `<div class="wv-page-head__ctas"><a class="wv-btn wv-btn--primary wv-btn--lg" href="/" data-link>${esc(T.noEncontrado.boton)}${flecha()}</a><a class="wv-btn wv-btn--ghost wv-btn--lg" href="/tienda" data-link>${esc(T.recientes.boton)}</a></div>` })}`;
}

// ---------------------------------------------------------------- buscador (modal como PULSO)
const lugares = () => [
  { titulo: 'Tienda', texto: T.tienda.bajada, href: '/tienda', icono: 'i-bag' },
  ...colecciones().filter((c) => c.productCount).map((c) => ({ titulo: c.name, texto: T.categorias.piezas(c.productCount), href: `/categoria/${c.handle}`, icono: 'i-chispa' })),
  { titulo: 'Walkurio', texto: T.walkurio.antetitulo, href: '/walkurio', icono: 'i-planeta' },
  ...regiones().map((c) => ({ titulo: c.name, texto: T.region.antetitulo, href: `/categoria/${c.handle}`, icono: 'i-pin' })),
  { titulo: T.cursos.titulo, texto: T.cursos.antetitulo, href: '/cursos', icono: 'i-bitacora' },
  { titulo: 'Walkiver', texto: 'Sobre mí, e-book y vídeos', href: '/walkiver/', icono: 'i-pluma', aparte: true },
  { titulo: 'Contacto', texto: T.contacto.titulo, href: '/contacto', icono: 'i-mail' },
];
const normal = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
let previoBusqueda;
function abrirBusqueda() {
  const b = $('#busqueda');
  if (b.classList.contains('is-open')) return;
  previoBusqueda = document.activeElement;
  b.hidden = false;
  document.documentElement.classList.add('wv-layer-open');
  requestAnimationFrame(() => b.classList.add('is-open'));
  buscar($('#q').value);
  setTimeout(() => $('#q').focus(), 50);
}
function cerrarBusqueda() {
  const b = $('#busqueda');
  if (!b.classList.contains('is-open')) return;
  b.classList.remove('is-open');
  if (!$('#carrito').classList.contains('is-open')) document.documentElement.classList.remove('wv-layer-open');
  setTimeout(() => { b.hidden = true; }, 350);
  previoBusqueda?.focus?.();
}
let turno = 0;
async function buscar(q) {
  const yo = ++turno;
  const res = $('#busqueda-res');
  const n = normal(q.trim());
  const pags = lugares().filter((l) => !n || normal(`${l.titulo} ${l.texto}`).includes(n)).slice(0, n ? 5 : 8);
  const htmlLugares = pags.length ? `<p class="wv-search__hint">${n ? esc(T.buscar.paginas) : esc(T.buscar.sugerencias)}</p><div class="wv-chips">${pags.map((l) => `<a class="wv-chip" href="${esc(l.href)}"${l.aparte ? '' : ' data-link'}>${icono(l.icono)}${esc(l.titulo)}</a>`).join('')}</div>` : '';
  if (!n) { res.innerHTML = htmlLugares; return; }
  res.innerHTML = `${htmlLugares}<p class="wv-search__hint">${esc(T.buscar.productos)}</p><span class="wk-cargando wk-cargando--oscuro"></span>`;
  await espera(150);
  if (yo !== turno) return;
  const { items, total } = await tienda.productos.listar({ buscar: q.trim(), porPagina: 6 }).catch(() => ({ items: [], total: 0 }));
  if (yo !== turno) return;
  res.innerHTML = `${htmlLugares}<p class="wv-search__hint">${esc(T.buscar.productos)}</p>
    ${items.length ? `<div class="wv-results">${items.map((p, i) => `
      <a class="wv-result" href="/producto/${esc(p.handle)}" data-link style="animation-delay:${i * 40}ms">
        <span class="wv-result__img">${foto(p.image, p.title, 320) || sinFoto(p.title)}</span>
        <span class="wv-result__text"><strong>${esc(p.title)}</strong><small>${esc(coleccionDe(p)?.name ?? '')}</small></span>
        <span class="wv-result__price">${tienda.formatear(p.price, p.currency)}</span>
      </a>`).join('')}</div>
    ${total > items.length ? `<a class="wv-link" href="/tienda?buscar=${encodeURIComponent(q.trim())}" data-link>${esc(T.buscar.todo)} (${total}) ${icono('i-flecha')}</a>` : ''}`
    : `<div class="wv-search__none"><strong>${esc(T.buscar.nada)}</strong><span>Probá con otra palabra o explorá la tienda.</span></div>`}`;
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
  if (e.key === 'Escape') { cerrarBusqueda(); cerrarCarrito(); }
  const escribiendo = e.target.closest?.('input, textarea, select, [contenteditable]');
  if (!escribiendo && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); abrirBusqueda(); }
});

// ---------------------------------------------------------------- tarjetas con relieve (solo mouse)
if (!tactil && !reducido) {
  let actual = null;
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest?.('.wv-card:not(.wv-card--fantasma), .wk-carta, .wv-cat, .wv-spin__card, .wv-acceso');
    if (actual && actual !== t) { actual.style.removeProperty('--mx'); actual.style.removeProperty('--my'); actual.style.removeProperty('--rx'); actual.style.removeProperty('--ry'); actual = null; }
    if (!t) return;
    actual = t;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    if (t.classList.contains('wk-carta')) {
      t.style.setProperty('--rx', `${((0.5 - y) * 12).toFixed(2)}deg`);
      t.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(2)}deg`);
    }
  }, { passive: true });
}

// ---------------------------------------------------------------- carrito (firma NS 4, panel de PULSO)
const carrito = $('#carrito');
const velo = $('#carrito-velo');
function abrirCarrito() {
  velo.hidden = false;
  carrito.inert = false;
  carrito.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('wv-layer-open');
  requestAnimationFrame(() => { carrito.classList.add('is-open'); velo.classList.add('is-on'); });
  $('#cerrar-carrito').focus();
}
ui.abrirCarrito = abrirCarrito;
function cerrarCarrito() {
  if (!carrito.classList.contains('is-open')) return;
  carrito.classList.remove('is-open');
  velo.classList.remove('is-on');
  carrito.inert = true;
  carrito.setAttribute('aria-hidden', 'true');
  if (!$('#busqueda').classList.contains('is-open')) document.documentElement.classList.remove('wv-layer-open');
  setTimeout(() => { velo.hidden = true; }, 350);
}
$('#abrir-carrito').addEventListener('click', abrirCarrito);
$('#cerrar-carrito').addEventListener('click', cerrarCarrito);
velo.addEventListener('click', cerrarCarrito);

function pintarCarrito(c, saltar = true) {
  const cont = $('#contador');
  cont.textContent = c.itemCount;
  cont.hidden = !c.itemCount;
  if (saltar) { cont.classList.remove('is-bump'); void cont.offsetWidth; cont.classList.add('is-bump'); }
  $('#carrito-cuenta').textContent = c.itemCount ? `${c.itemCount} ${c.itemCount === 1 ? 'pieza' : 'piezas'}` : '';
  $('#carrito-lineas').innerHTML = c.lines.length ? `<div class="wv-lines">${c.lines.map((l) => `
    <div class="wv-line">
      <a href="/producto/${esc(l.handle)}" data-link class="wv-line__img">${l.image ? `<img src="${esc(l.image.sizes?.['320'] ?? l.image.url)}" alt="">` : sinFoto(l.title)}</a>
      <div class="wv-line__info">
        <a class="wv-line__name" href="/producto/${esc(l.handle)}" data-link>${esc(l.title)}</a>
        ${l.variantTitle ? `<span class="wv-line__sku">${esc(l.variantTitle)}</span>` : ''}
        <span class="wv-line__calc">${tienda.formatear(l.price, c.currency)} c/u</span>
        <div class="wv-qty wv-qty--sm">
          <button type="button" class="wv-qty__btn" data-linea="${l.line}" data-cant="${l.quantity - 1}" aria-label="Quitar uno">${icono('i-menos')}</button>
          <span class="wv-qty__input">${l.quantity}</span>
          <button type="button" class="wv-qty__btn" data-linea="${l.line}" data-cant="${l.quantity + 1}" aria-label="Agregar uno"${l.maxQuantity !== null && l.quantity >= l.maxQuantity ? ' disabled' : ''}>${icono('i-mas')}</button>
        </div>
      </div>
      <div class="wv-line__end">
        <strong>${tienda.formatear(l.total, c.currency)}</strong>
        <button type="button" class="wv-line__remove" data-linea="${l.line}" data-cant="0" aria-label="Quitar ${esc(l.title)}">${icono('i-basura')}</button>
      </div>
    </div>`).join('')}</div>`
    : `<div class="wv-empty"><i class="wv-orbe-luz wv-orbe-luz--grande" aria-hidden="true"></i><h3>Tu carrito está vacío… por ahora</h3><p>Las criaturas esperan un hogar. Elegí la tuya.</p><a class="wv-btn wv-btn--primary" href="/tienda" data-link>Explorar la tienda${flecha()}</a></div>`;
  $('#carrito-pie').innerHTML = c.lines.length ? `
    <dl class="wv-totals">
      <div><dt>Total</dt><dd>${tienda.formatear(c.total, c.currency)}</dd></div>
      <div class="wv-totals__note"><dt>Envío</dt><dd>Se calcula al finalizar</dd></div>
    </dl>
    <button class="wv-btn wv-btn--primary wv-btn--lg wv-btn--block" id="finalizar">Finalizar compra${flecha()}</button>
    <p class="wv-drawer__legal">${icono('i-sello')} Cada pieza viaja con su certificado de autenticidad.</p>` : '';
  $('#carrito-pie').hidden = !c.lines.length;
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
