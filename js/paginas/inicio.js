// Inicio: "El viaje".
// Un paisaje nocturno en capas (parallax) donde el polvo de hadas forma el nombre del Walkiverso;
// al bajar entrás al bosque y el polvo se transforma, capítulo a capítulo, en las criaturas reales,
// una bitácora, el árbol de raíces de Milarko y Walkurio. Al final se deshace en el cielo de la tienda:
// recién salidos → deseo (bola de cristal) → espejos (videos) → voces → preguntas → Walkiver.
import { tienda, T, $, $$, esc, app, estado, categoria, colecciones, foto, sinFoto, precio, tarjeta, fantasmas, revelar, contarHasta, textoPlano, modal, aviso, reducido, tactil, espera, botonFavorito, icono, flecha, ui } from '../base.js';
import { videos, resenas, preguntas, enlaces, pestanas as pestanasExtra, heroImagenes } from '../config.js';
import { seccionDeseo, activarDeseo } from './deseo.js';
import { marcadoPaisaje, moverPaisaje } from '../paisaje.js';
import { repintarFavoritos } from '../cuenta.js';
import { rafaga } from '../polvo.js';

const lado = ['', 'izq', 'der', 'izq', 'izq'];

export async function inicio() {
  const info = estado.info;
  document.title = info.seo.title || info.name;
  document.documentElement.classList.remove('con-entrada');
  const duendes = categoria('duendes');
  const cols = colecciones().filter((c) => c.productCount);
  const destino = [categoria('criaturas'), categoria('bitacoras'), duendes, null];
  const otras = cols.filter((c) => !['criaturas', 'bitacoras', duendes?.handle].includes(c.handle));
  const tabs = [['nuevos', T.recientes.pestanas.nuevos], ['ofertas', T.recientes.pestanas.ofertas],
    ...pestanasExtra.map(categoria).filter((c) => c?.productCount).map((c) => [c.handle, c.name])];

  app.innerHTML = `
    <canvas class="wv-viaje" id="viaje" aria-hidden="true"></canvas>

    <section class="wv-portal" data-capitulo="0" aria-label="${esc(info.name)}">
      ${marcadoPaisaje()}
      <div class="wv-portal__texto">
        <h1 class="wv-portal__nombre"><img src="img/logo.svg" alt="${esc(info.name)}" width="600" height="160"></h1>
        <p class="wv-portal__lema">${esc(T.viaje.lema)}</p>
      </div>
      <a class="wv-portal__bajar" href="#cap-1"><span>${esc(T.viaje.bajar)}</span><i aria-hidden="true"></i></a>
    </section>

    ${T.viaje.capitulos.map((c, i) => {
      const n = i + 1;
      const col = destino[i];
      const href = n === 4 ? '/walkurio' : col ? `/categoria/${col.handle}` : '/tienda';
      return `
      <section class="wv-cap wv-cap--${lado[n]}" id="cap-${n}" data-capitulo="${n}" aria-labelledby="cap-${n}-titulo">
        <div class="wv-cap__texto">
          <p class="wv-cap__ante" data-rev>${esc(c.ante)}</p>
          <h2 class="wv-cap__titulo" id="cap-${n}-titulo" data-rev style="--d:80ms">${esc(c.titulo)}</h2>
          <p class="wv-cap__bajada" data-rev style="--d:160ms">${esc(c.texto)}</p>
          ${n === 3 ? '<p class="wv-cap__contador" id="contador-duendes" aria-live="polite"></p>' : ''}
          <div class="wv-cap__acciones" data-rev style="--d:240ms">
            ${n === 3
              ? `<button type="button" class="wv-btn wv-btn--luz wv-btn--lg" id="elegir-duende">${esc(c.boton)}</button>${duendes ? `<a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/categoria/${esc(duendes.handle)}" data-link>${esc(T.duendes.todos)}</a>` : ''}`
              : `<a class="wv-btn wv-btn--luz wv-btn--lg" href="${href}" data-link>${esc(c.boton)}${flecha()}</a>`}
          </div>
          ${n === 1 && otras.length ? `<p class="wv-cap__tambien" data-rev style="--d:320ms"><span>${esc(T.viaje.tambien)}</span>${otras.map((x) => `<a href="/categoria/${esc(x.handle)}" data-link>${esc(x.name)}</a>`).join('')}</p>` : ''}
        </div>
        ${n <= 2 ? `<img class="wv-cap__respaldo" src="${esc(heroImagenes[n - 1] ?? heroImagenes[0])}" alt="" loading="lazy">` : ''}
      </section>`;
    }).join('')}

    <section class="wv-section wv-cielo" data-capitulo="5" aria-labelledby="recientes-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow wv-eyebrow--luz">${esc(T.recientes.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="recientes-titulo">${esc(T.recientes.titulo)}</h2><p class="wv-lead">${esc(T.recientes.bajada)}</p></div>
          <div class="wv-chips" role="tablist" aria-label="${esc(T.recientes.titulo)}" id="pestanas">
            ${tabs.map(([k, v], i) => `<button type="button" class="wv-chip" role="tab" data-pestana="${esc(k)}" aria-selected="${i === 0}">${esc(v)}</button>`).join('')}
          </div>
        </div>
        <div class="wv-grid" id="recientes" role="tabpanel">${fantasmas(4)}</div>
        <div class="wv-cielo__todo"><a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/tienda" data-link>${esc(T.recientes.boton)}${flecha()}</a></div>
      </div>
    </section>

    ${seccionDeseo()}

    <section class="wk-videos" aria-labelledby="videos-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow wv-eyebrow--luz">${esc(T.videos.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="videos-titulo">${esc(T.videos.titulo)}</h2><p class="wv-lead">${esc(T.videos.bajada)}</p></div>
          <a class="wv-btn wv-btn--outline-light" href="${esc(info.contact.instagram || enlaces.instagram)}" target="_blank" rel="noopener">${icono('i-ig')}${esc(T.videos.boton)}</a>
        </div>
        <ul class="wk-reels" id="pista-reels" role="list" style="--n:${videos.length}">
          ${videos.map((v, i) => {
            const id = idYoutube(v.url);
            return `<li class="wk-reel" style="--i:${i}">
              <${id ? `button type="button" data-video="${esc(id)}"` : `a href="${esc(v.url || info.contact.instagram || enlaces.instagram)}" target="_blank" rel="noopener"`} class="wk-reel__carta" aria-label="Ver video: ${esc(v.titulo)}">
                <span class="wk-reel__media">${id ? `<img src="https://i.ytimg.com/vi/${esc(id)}/oar2.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg'" alt="" loading="lazy">` : '<span class="wk-reel__dibujo" aria-hidden="true"></span>'}</span>
                <span class="wk-reel__sombra" aria-hidden="true"></span>
                <span class="wk-reel__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span>
                <span class="wk-reel__titulo">${esc(v.titulo)}</span>
              </${id ? 'button' : 'a'}>
            </li>`;
          }).join('')}
        </ul>
        ${navCarrusel('pista-reels')}
      </div>
    </section>

    <section class="wv-section wv-voces" aria-labelledby="resenas-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--center" data-rev>
          <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.resenas.antetitulo)}</p>
          <h2 class="wv-h2 wv-h2--xl" id="resenas-titulo">${esc(T.resenas.titulo)}</h2>
        </div>
        <div class="wv-reviews">${resenas.slice(0, 3).map(resena).join('')}</div>
        <div class="wv-cielo__todo"><button type="button" class="wv-btn wv-btn--outline-light" id="dejar-resena">${icono('i-pluma')}${esc(T.resenas.boton)}</button></div>
      </div>
    </section>

    <section class="wv-section" aria-labelledby="faq-titulo">
      <div class="wv-container wv-faq-wrap">
        <div class="wv-head wv-head--center" data-rev>
          <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.preguntas.antetitulo)}</p>
          <h2 class="wv-h2 wv-h2--xl" id="faq-titulo">${esc(T.preguntas.titulo)}</h2>
          <label class="wv-toolbar__search wv-oraculo"><span class="wk-oraculo__orbe" aria-hidden="true"></span><input type="search" id="oraculo" placeholder="${esc(T.preguntas.oraculo)}" aria-label="${esc(T.preguntas.oraculo)}" autocomplete="off"></label>
        </div>
        <div class="wv-faq" id="faq">
          ${preguntas.map(([q, a], i) => `
            <details class="wv-faq__item" data-rev style="--d:${i * 50}ms" data-texto="${esc(`${q} ${a}`.toLowerCase())}"${i === 0 ? ' open' : ''}>
              <summary>${esc(q)}<span class="wv-faq__icon" aria-hidden="true">${icono('i-mas')}</span></summary>
              <p>${esc(a)}</p>
            </details>`).join('')}
          <p class="wv-search__none" id="faq-nada" hidden><strong>${esc(T.preguntas.nada)}</strong></p>
        </div>
        <p class="wv-lead wv-faq__otra">${esc(T.preguntas.otra)} <a class="wv-link wv-link--luz" href="/contacto" data-link>${esc(T.preguntas.escribinos)} ${icono('i-flecha')}</a></p>
      </div>
    </section>

    <section class="wv-walkiver" aria-labelledby="walkiver-titulo">
      <div class="wv-container wv-walkiver__grid">
        <div data-rev>
          <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.walkiverBanda.antetitulo)}</p>
          <h2 class="wv-h2" id="walkiver-titulo">${esc(T.walkiverBanda.titulo)}</h2>
          <p>${esc(T.walkiverBanda.bajada)}</p>
          <div class="wv-walkiver__ctas">
            <a class="wv-btn wv-btn--luz wv-btn--lg" href="${esc(enlaces.walkiver)}">${esc(T.walkiverBanda.boton)}${flecha()}</a>
            ${categoria('cursos') ? `<a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/cursos" data-link>${esc(T.walkiverBanda.boton2)}</a>` : ''}
          </div>
        </div>
        <div class="wv-walkiver__float" aria-hidden="true">
          <img class="wv-float wv-float--libro" src="walkiver/assets/wkv-ebook-portada.webp" alt="" loading="lazy">
        </div>
      </div>
    </section>`;

  // El viaje (WebGL). Sin WebGL quedan el logo y las fotos de respaldo.
  const soltarPaisaje = moverPaisaje(app.querySelector('.wv-portal'));
  let viaje = null;
  ui.alSalir = () => { viaje?.destruir(); soltarPaisaje(); document.body.classList.remove('con-viaje'); };
  import('../viaje.js')
    .then(({ crearViaje }) => crearViaje($('#viaje'), { logo: 'img/logo.svg', criaturas: heroImagenes }))
    .then((v) => { if ($('#viaje')) { viaje = v; document.body.classList.add('con-viaje'); } else v.destruir(); })
    .catch((e) => console.warn('Sin viaje 3D:', e));

  activarDeseo(app.querySelector('.wk-deseo'));
  activarCarrusel($('#pista-reels'));
  activarRecientes();
  activarVideos();
  activarResenas();
  activarPreguntas();
  revelar();
  if (duendes?.productCount) {
    const { items } = await tienda.productos.listar({ categoria: duendes.handle, porPagina: 16, soloDisponibles: true }).catch(() => ({ items: [], total: 0 }));
    contarHasta($('#contador-duendes'), items.length, T.duendes.contador);
    $('#elegir-duende')?.addEventListener('click', () => ritualDuende(items));
  }
}

// ---------------------------------------------------------------- carruseles (flechas y barra abajo)
const navCarrusel = (id, texto = '') => `
  <div class="wk-nav-carrusel" data-carrusel="${id}">
    ${texto ? `<p class="wk-nav-carrusel__texto">${esc(texto)}</p>` : ''}
    <button type="button" class="wk-nav-carrusel__flecha" data-mover="-1" aria-controls="${id}" aria-label="Anteriores"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <span class="wk-nav-carrusel__barra" aria-hidden="true"><i></i></span>
    <button type="button" class="wk-nav-carrusel__flecha" data-mover="1" aria-controls="${id}" aria-label="Siguientes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  </div>`;
function activarCarrusel(pista) {
  if (!pista) return;
  const nav = app.querySelector(`[data-carrusel="${pista.id}"]`);
  if (!nav) return;
  const barra = nav.querySelector('.wk-nav-carrusel__barra i');
  const [antes, despues] = nav.querySelectorAll('[data-mover]');
  const actualizar = () => {
    const max = pista.scrollWidth - pista.clientWidth;
    const k = max > 0 ? pista.scrollLeft / max : 0;
    const visible = max > 0 ? pista.clientWidth / pista.scrollWidth : 1;
    barra.style.width = `${(visible * 100).toFixed(1)}%`;
    barra.style.transform = `translateX(${((k * (1 - visible)) / visible * 100).toFixed(1)}%)`;
    antes.disabled = pista.scrollLeft < 4;
    despues.disabled = pista.scrollLeft > max - 4;
    nav.hidden = max <= 4 && !nav.querySelector('.wk-nav-carrusel__texto');
  };
  pista.addEventListener('scroll', actualizar, { passive: true });
  new ResizeObserver(actualizar).observe(pista);
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mover]');
    if (b) pista.scrollBy({ left: Number(b.dataset.mover) * pista.clientWidth * 0.85, behavior: reducido ? 'auto' : 'smooth' });
  });
  arrastrable(pista);
  actualizar();
}

const frente = (p, nombre, i) => `
  <span class="wk-carta__foto">${foto(p.image, p.title, 640) || sinFoto(p.title)}</span>
  <span class="wk-carta__marco" aria-hidden="true"></span>
  <span class="wk-carta__num">Nº ${String(i + 1).padStart(2, '0')}</span>
  ${p.available ? '' : `<span class="wk-carta__sello">${esc(T.recientes.adoptada)}</span>`}
  <span class="wk-carta__nombre">${esc(nombre)}</span>
  <button type="button" class="wk-carta__girar" aria-pressed="false" aria-label="Dar vuelta la carta de ${esc(p.title)}"><svg aria-hidden="true"><use href="#i-girar"/></svg></button>`;
const dorso = (p) => `
  ${botonFavorito(p, 'wk-carta__fav')}
  <small>${esc(T.duendes.antetitulo)}</small>
  <h3>${esc(p.title)}</h3>
  <p>${esc(textoPlano(p.description, 110))}</p>
  ${precio(p)}
  ${p.available ? `<button type="button" class="wv-btn wv-btn--luz wv-btn--sm" data-agregar="${esc(p.handle)}">${esc(T.duendes.adoptar)}</button>` : `<p class="wk-carta__hogar">${esc(T.recientes.adoptada)}</p>`}
  <a href="/producto/${esc(p.handle)}" data-link class="wk-carta__link">${esc(T.duendes.conocer)} →</a>`;

/**
 * "Que un duende te elija": las cartas forman una rueda de luz que gira y se frena sola en un duende;
 * su carta viene al centro y se da vuelta.
 */
async function ritualDuende(lista) {
  const candidatos = lista.slice(0, 10);
  if (!candidatos.length) return;
  const n = candidatos.length;
  const k = Math.floor(Math.random() * n);
  const capa = document.createElement('div');
  capa.className = 'wk-ritual';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-label', T.duendes.elegir);
  capa.innerHTML = `
    <div class="wk-ritual__velo"></div>
    <div class="wk-ritual__halo" aria-hidden="true"></div>
    <div class="wk-ritual__rueda" aria-hidden="true">
      ${candidatos.map((p, i) => `<div class="wk-ritual__carta" style="--a:${((i * 360) / n).toFixed(2)}deg;--i:${i}"><div class="wk-carta__cara wk-carta__cara--frente">${frente(p, p.title.replace(/^duende\s+(de(l)?\s+)?/i, ''), i)}</div></div>`).join('')}
    </div>
    <p class="wk-ritual__texto" aria-live="polite">${esc(T.duendes.eligiendo)}</p>
    <button type="button" class="wk-modal__cerrar wk-ritual__cerrar" aria-label="${esc(T.duendes.cerrar)}"><svg aria-hidden="true"><use href="#i-cerrar"/></svg></button>`;
  document.body.append(capa);
  document.body.classList.add('con-modal');
  const previo = document.activeElement;
  const cerrar = () => {
    capa.classList.add('is-cerrando');
    document.body.classList.remove('con-modal');
    removeEventListener('keydown', tecla);
    setTimeout(() => capa.remove(), 450);
    previo?.focus?.();
  };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  addEventListener('keydown', tecla);
  capa.addEventListener('click', (e) => {
    if (e.target.closest('.wk-ritual__velo, .wk-ritual__cerrar, [data-cerrar-ritual], a[data-link]')) cerrar();
    if (e.target.closest('[data-otra-vez]')) { capa.remove(); document.body.classList.remove('con-modal'); removeEventListener('keydown', tecla); ritualDuende(lista); }
  });
  capa.querySelector('.wk-ritual__cerrar').focus({ preventScroll: true });

  requestAnimationFrame(() => requestAnimationFrame(() => capa.classList.add('is-abierta')));
  await espera(reducido ? 0 : 1000);
  // La rueda gira y se frena con el elegido arriba
  const rueda = capa.querySelector('.wk-ritual__rueda');
  const giro = 1080 + ((360 - (k * 360) / n) % 360);
  if (!reducido) {
    await rueda.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${giro}deg)` }], { duration: 4200, easing: 'cubic-bezier(0.22, 0.61, 0.08, 1)', fill: 'forwards' }).finished.catch(() => {});
  }
  if (!capa.isConnected) return;
  const cartas = $$('.wk-ritual__carta', capa);
  cartas.forEach((c, i) => c.classList.add(i === k ? 'is-elegida' : 'is-desvanece'));
  rafaga(cartas[k], 36);
  await espera(reducido ? 0 : 650);
  if (!capa.isConnected) return;
  // Su carta viene al centro y se da vuelta
  const p = candidatos[k];
  capa.classList.add('is-revela');
  capa.querySelector('.wk-ritual__texto').textContent = T.duendes.elegido(p.title);
  capa.insertAdjacentHTML('beforeend', `
    <div class="wk-ritual__elegida">
      <article class="wk-carta wk-carta--grande">
        <div class="wk-carta__giro">
          <div class="wk-carta__cara wk-carta__cara--frente">${frente(p, p.title.replace(/^duende\s+(de(l)?\s+)?/i, ''), k)}</div>
          <div class="wk-carta__cara wk-carta__cara--dorso">${dorso(p)}</div>
        </div>
      </article>
      <div class="wk-ritual__acciones"><button type="button" class="wv-btn wv-btn--outline-light" data-otra-vez>${icono('i-girar')}${esc(T.duendes.otraVez)}</button></div>
    </div>`);
  repintarFavoritos();
  const grande = capa.querySelector('.wk-carta--grande');
  await espera(reducido ? 0 : 900);
  grande.classList.add('is-girada');
  rafaga(grande, 30);
}

/** Con mouse, la pista se puede arrastrar (en táctiles ya se desliza sola). */
function arrastrable(pista) {
  if (tactil) return;
  let x0 = 0, s0 = 0, abajo = false;
  pista.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('a, button')) return;
    abajo = true; x0 = e.clientX; s0 = pista.scrollLeft; pista.dataset.arrastro = '0';
  });
  addEventListener('pointermove', (e) => {
    if (!abajo) return;
    const d = e.clientX - x0;
    if (Math.abs(d) > 6) { pista.dataset.arrastro = '1'; pista.classList.add('is-arrastrando'); }
    pista.scrollLeft = s0 - d;
  });
  addEventListener('pointerup', () => {
    abajo = false; pista.classList.remove('is-arrastrando');
    setTimeout(() => { pista.dataset.arrastro = '0'; }, 0);
  });
}

// ---------------------------------------------------------------- recién salidos (pestañas)
function activarRecientes() {
  const lista = $('#recientes');
  const pestanas = $('#pestanas');
  const cache = {};
  const consulta = {
    nuevos: () => tienda.productos.listar({ porPagina: 8 }).then((r) => r.items),
    ofertas: () => tienda.productos.listar({ porPagina: 48, soloDisponibles: true }).then((r) => r.items.filter((p) => p.compareAtPrice > p.price).slice(0, 8)),
  };
  const traer = (k) => (consulta[k] ?? (() => tienda.productos.listar({ categoria: k, porPagina: 8 }).then((r) => r.items)))();
  const mostrar = async (b) => {
    $$('[role=tab]', pestanas).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    const k = b.dataset.pestana;
    lista.style.opacity = '.35';
    const [items] = await Promise.all([cache[k] ??= traer(k).catch(() => []), espera(reducido ? 0 : 180)]);
    if (!lista.isConnected) return;
    lista.innerHTML = items.length ? items.map(tarjeta).join('') : `<div class="wv-empty" style="grid-column:1/-1"><p>${esc(T.recientes.vacio)}</p></div>`;
    lista.style.opacity = '';
    repintarFavoritos();
    revelar();
  };
  pestanas.addEventListener('click', (e) => { const b = e.target.closest('[role=tab]'); if (b) mostrar(b); });
  pestanas.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const tabs = $$('[role=tab]', pestanas);
    const i = tabs.indexOf(document.activeElement);
    const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    sig.focus(); mostrar(sig);
  });
  mostrar($('[role=tab]', pestanas));
}

// ---------------------------------------------------------------- videos
const idYoutube = (u) => /(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(u ?? '')?.[1] ?? '';
function activarVideos() {
  $('#pista-reels').addEventListener('click', (e) => {
    if ($('#pista-reels').dataset.arrastro === '1') return;
    const b = e.target.closest('[data-video]');
    if (!b) return;
    modal(`<div class="wk-video-marco"><iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0&playsinline=1" title="${esc(b.getAttribute('aria-label'))}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`, 'wk-modal--video');
  });
}

// ---------------------------------------------------------------- reseñas
const estrellas = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="i${i < n ? ' is-llena' : ''}" aria-hidden="true"><use href="#i-estrella"/></svg>`).join('');
const resena = (r, i) => `
  <figure class="wv-review" data-rev style="--d:${i * 90}ms">
    <span class="wv-review__stars" aria-label="${r.estrellas} de 5">${estrellas(r.estrellas)}</span>
    <blockquote>“${esc(r.texto)}”</blockquote>
    <figcaption><span class="wv-review__avatar" aria-hidden="true">${esc(r.nombre[0])}</span><span><strong>${esc(r.nombre)}</strong> · ${esc(r.lugar)}${r.adopto ? `<br>${esc(T.resenas.adopto)} ${esc(r.adopto)}` : ''}</span></figcaption>
  </figure>`;
function activarResenas() {
  $('#dejar-resena').addEventListener('click', () => {
    const m = modal(`
      <form class="wk-form-resena" id="form-resena">
        <p class="wv-eyebrow">${esc(T.resenas.antetitulo)}</p>
        <h2>${esc(T.resenas.formTitulo)}</h2>
        <p>${esc(T.resenas.formTexto)}</p>
        <fieldset class="wk-elegir-estrellas"><legend>Tu puntaje</legend>
          ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="estrellas" value="${n}" id="e${n}"${n === 5 ? ' checked' : ''}><label for="e${n}" aria-label="${n} estrellas"><svg aria-hidden="true"><use href="#i-estrella"/></svg></label>`).join('')}
        </fieldset>
        <div class="wk-campos-2">
          <label class="wk-campo"><span>Nombre</span><input name="name" required autocomplete="name"></label>
          <label class="wk-campo"><span>Ciudad</span><input name="lugar" autocomplete="address-level2"></label>
        </div>
        <label class="wk-campo"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="wk-campo"><span>¿Qué pieza adoptaste?</span><input name="pieza"></label>
        <label class="wk-campo"><span>Tu reseña</span><textarea name="message" required rows="4"></textarea></label>
        <small class="wk-nota">${esc(T.resenas.formNota)}</small>
        <button class="wv-btn wv-btn--primary wv-btn--lg">${esc(T.resenas.enviar)}${flecha()}</button>
      </form>`, 'wk-modal--form');
    m.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const b = e.target.querySelector('button:not([data-cerrar])');
      b.disabled = true;
      try {
        const d = Object.fromEntries(new FormData(e.target));
        await tienda.contacto({ ...d, tipo: 'Reseña', message: `★${d.estrellas} · ${d.message}` });
        rafaga(b, 40);
        e.target.innerHTML = `<div class="wv-empty"><i class="wv-orbe-luz wv-orbe-luz--grande" aria-hidden="true"></i><h3>${esc(T.resenas.gracias)}</h3></div>`;
      } catch (err) { aviso(err.message); b.disabled = false; }
    });
  });
}

// ---------------------------------------------------------------- preguntas (el oráculo filtra)
function activarPreguntas() {
  const lista = $('#faq');
  const normal = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  $('#oraculo').addEventListener('input', (e) => {
    const q = normal(e.target.value.trim());
    let hay = 0;
    $$('.wv-faq__item', lista).forEach((p) => {
      const ok = !q || q.split(/\s+/).every((w) => normal(p.dataset.texto).includes(w));
      p.hidden = !ok;
      if (ok) hay++;
      p.classList.add('is-in');
    });
    $('#faq-nada').hidden = hay > 0;
    $('.wv-oraculo').classList.toggle('is-pensando', !!q);
    // Si queda una sola respuesta, el oráculo la abre
    const visibles = $$('.wv-faq__item:not([hidden])', lista);
    if (q && visibles.length === 1) visibles[0].open = true;
  });
}
