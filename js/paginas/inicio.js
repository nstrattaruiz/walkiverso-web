// Inicio con la estructura de PULSO y la magia de Walkiverso:
// entrada "El bosque despierta" → hero (texto + mosaico de piezas) → banda → colecciones en mosaico →
// tres piezas destacadas → duendes (cartas) → recién salidos → cómo nace una criatura → reseñas →
// deseo (bola de cristal) → espejos (videos) → preguntas → Walkiver.
import { tienda, T, $, $$, esc, app, estado, categoria, colecciones, regiones, foto, sinFoto, precio, precioBloque, tarjeta, fantasmas, revelar, contarHasta, textoPlano, modal, aviso, reducido, tactil, espera, botonFavorito, icono, flecha, insignias, imagenColeccion, tonoColeccion, esObjeto, ui } from '../base.js';
import { videos, resenas, preguntas, enlaces, pestanas as pestanasExtra, heroImagenes } from '../config.js';
import { seccionDeseo, activarDeseo } from './deseo.js';
import { crearPortada, marcadoVelo } from '../entrada.js';
import { repintarFavoritos } from '../cuenta.js';
import { rafaga } from '../polvo.js';

const primeraVez = () => { try { return sessionStorage.getItem('wk-entrada') !== '1'; } catch { return true; } };
const linea = (texto, i, extra = '') => `<span class="wv-hero__line${extra}"><span style="--l:${i}">${texto}</span></span>`;

export async function inicio() {
  const info = estado.info;
  document.title = info.seo.title || info.name;
  const duendes = categoria('duendes');
  const cols = colecciones().filter((c) => c.productCount)
    .sort((a, b) => (b.handle === 'criaturas') - (a.handle === 'criaturas'))
    .slice(0, 6);
  const total = cols.reduce((n, c) => n + (c.handle === 'criaturas' ? 0 : c.productCount), 0) || cols[0]?.productCount || 0;
  const tabs = [['nuevos', T.recientes.pestanas.nuevos], ['ofertas', T.recientes.pestanas.ofertas],
    ...pestanasExtra.map(categoria).filter((c) => c?.productCount).map((c) => [c.handle, c.name])];
  const deCol = (h) => (categoria(h)?.productCount ? `/categoria/${h}` : '/tienda');
  const [pal1, pal2, ...resto] = T.hero.titulo.split(' ');

  app.innerHTML = `
    <section class="wk-portada" id="entrada" aria-label="${esc(info.name)}">
      <div class="wv-hero">
        <div class="wv-hero__estrellas" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 100}%;animation-delay:${-(i % 7) * 0.6}s"></i>`).join('')}</div>
        <svg class="wv-hero__raices wk-hero__raices" aria-hidden="true" focusable="false"></svg>
        <canvas class="wv-hero__polvo" aria-hidden="true"></canvas>
        <div class="wv-container wv-hero__grid">
          <div class="wv-hero__copy">
            <p class="wv-hero__eyebrow"><span class="wv-live" aria-hidden="true"></span>${esc(T.hero.antetitulo)}</p>
            <h1 class="wv-hero__title" aria-label="${esc(T.hero.titulo)}">
              <span aria-hidden="true">${linea(esc(pal1), 0)}${linea(`${esc(pal2)} <i class="wk-mano"></i>`, 1, ' wv-hero__line--accent')}${linea(`${esc(resto.join(' '))}.`, 2)}</span>
            </h1>
            <p class="wv-hero__lead">${esc(T.hero.bajada)}</p>
            <div class="wv-hero__ctas">
              <a class="wv-btn wv-btn--luz wv-btn--lg" href="/tienda" data-link>${esc(T.hero.boton)}${flecha()}</a>
              <a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/walkurio" data-link>${icono('i-planeta')}${esc(T.hero.boton2)}</a>
            </div>
            <ul class="wv-hero__proof">
              <li><strong id="prueba-piezas">${total}</strong>${esc(T.prueba.piezas)}</li>
              <li><strong>100%</strong>${esc(T.prueba.mano)}</li>
              ${regiones().length ? `<li><strong>${regiones().length}</strong>${esc(T.prueba.regiones)}</li>` : ''}
            </ul>
          </div>
          <div class="wv-hero__art">
            <a class="wv-tile wv-tile--a wv-tile--recorte" href="${deCol('mandragoras')}" data-link aria-label="Mandrágoras"><img src="${esc(heroImagenes[0])}" alt="" fetchpriority="high"><span class="wv-tile__tag">Mandrágoras</span></a>
            <a class="wv-tile wv-tile--b wv-tile--recorte" href="${deCol('bitacoras')}" data-link aria-label="Bitácoras"><img src="${esc(heroImagenes[1] ?? heroImagenes[0])}" alt=""><span class="wv-tile__tag">Bitácoras</span></a>
            <a class="wv-tile wv-tile--c" href="/tienda" data-link id="hero-pieza" aria-label="${esc(T.recientes.titulo)}">${sinFoto('Walkiverso')}</a>
            <span class="wv-tile wv-tile--d" aria-hidden="true"><i class="wk-mano"></i></span>
            <span class="wv-chipf wv-chipf--1">${icono('i-chispa')}${esc(T.chips.unicas)}</span>
            <span class="wv-chipf wv-chipf--2">${icono('i-camion')}${esc(T.chips.envios)}</span>
            <span class="wv-chipf wv-chipf--3">${icono('i-hoja')}${esc(T.chips.reciclado)}</span>
            <span class="wv-chipf wv-chipf--4">${esc(T.chips.uno)}</span>
          </div>
        </div>
      </div>
      ${marcadoVelo({ esc, T, info })}
    </section>

    <div class="wv-band-wrap" aria-hidden="true"><div class="wv-band"><div class="wv-band__track">${[...T.cinta, ...T.cinta, ...T.cinta, ...T.cinta].map((t) => `<span>${esc(t)}</span><i class="wk-mano"></i>`).join('')}</div></div></div>

    ${cols.length ? `
    <section class="wv-section" id="recorrer" aria-labelledby="cols-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow">${icono('i-chispa')}${esc(T.categorias.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="cols-titulo">${esc(T.categorias.titulo)}</h2></div>
          <a class="wv-link" href="/tienda" data-link>${esc(T.categorias.todas)} ${icono('i-flecha')}</a>
        </div>
        <div class="wv-cats">
          ${cols.map((c, i) => `
            <a class="wv-cat wv-tono--${tonoColeccion(i)}" href="/categoria/${esc(c.handle)}" data-link data-rev style="--d:${i * 70}ms" data-col="${esc(c.handle)}">
              <span class="wv-cat__img" aria-hidden="true">${imagenColeccion(c)}</span>
              <span class="wv-cat__arrow" aria-hidden="true">${icono('i-diagonal')}</span>
              <span class="wv-cat__count">${esc(T.categorias.piezas(c.productCount))}</span>
              <strong class="wv-cat__name">${esc(c.name)}</strong>
              ${c.description ? `<span class="wv-cat__desc">${esc(textoPlano(c.description, 90))}</span>` : ''}
            </a>`).join('')}
        </div>
      </div>
    </section>` : '<span id="recorrer"></span>'}

    <section class="wv-section wv-spin" aria-labelledby="spin-titulo">
      <span class="wk-ramas-fondo" data-esquinas="tr" data-semilla="5"></span>
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow">${icono('i-chispa')}${esc(T.destacadas.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="spin-titulo">${esc(T.destacadas.titulo)}</h2><p class="wv-lead">${esc(T.destacadas.bajada)}</p></div>
          <a class="wv-btn wv-btn--ghost" href="/tienda" data-link>${esc(T.recientes.boton)}${flecha()}</a>
        </div>
        <div class="wv-spin__grid" id="destacadas">${'<span class="wv-spin__card wv-card--fantasma" aria-hidden="true"></span>'.repeat(3)}</div>
      </div>
    </section>

    ${duendes?.productCount ? `
    <section class="wk-duendes" aria-labelledby="duendes-titulo">
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tr,bl" data-semilla="9"></span><div class="wk-duendes__bosque" aria-hidden="true">${'<i></i>'.repeat(18)}</div>
      <div class="wv-container wk-duendes__cab" data-rev>
        <p class="wv-eyebrow wv-eyebrow--luz">${icono('i-chispa')}${esc(T.duendes.antetitulo)}</p>
        <h2 class="wv-h2 wv-h2--xl" id="duendes-titulo">${esc(T.duendes.titulo)}</h2>
        <p class="wk-duendes__bajada">${esc(T.duendes.bajada)}</p>
        <p class="wk-duendes__contador" id="contador-duendes" aria-live="polite"></p>
        <div class="wk-duendes__acciones">
          <button type="button" class="wv-btn wv-btn--luz wv-btn--lg" id="elegir-duende">${icono('i-chispa')}<span>${esc(T.duendes.elegir)}</span></button>
          <a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/categoria/${esc(duendes.handle)}" data-link>${esc(T.duendes.todos)}${flecha()}</a>
        </div>
      </div>
      <div class="wk-carrusel">
        <div class="wk-carrusel__pista" id="pista-duendes" tabindex="0" aria-label="Duendes">${'<span class="wk-carta wk-carta--fantasma"></span>'.repeat(5)}</div>
      </div>
      ${navCarrusel('pista-duendes', T.duendes.girar)}
    </section>` : ''}

    <section class="wv-section" aria-labelledby="recientes-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow">${icono('i-chispa')}${esc(T.recientes.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="recientes-titulo">${esc(T.recientes.titulo)}</h2><p class="wv-lead">${esc(T.recientes.bajada)}</p></div>
          <div class="wv-chips" role="tablist" aria-label="${esc(T.recientes.titulo)}" id="pestanas">
            ${tabs.map(([k, v], i) => `<button type="button" class="wv-chip" role="tab" data-pestana="${esc(k)}" aria-selected="${i === 0}">${esc(v)}</button>`).join('')}
          </div>
        </div>
        <div class="wv-grid" id="recientes" role="tabpanel">${fantasmas(4)}</div>
      </div>
    </section>

    <section class="wv-section wv-steps-wrap" aria-labelledby="pasos-titulo">
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tl,br" data-semilla="17"></span>
      <div class="wv-container">
        <div class="wv-head" data-rev><p class="wv-eyebrow">${icono('i-chispa')}${esc(T.pasos.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="pasos-titulo">${esc(T.pasos.titulo)}</h2><p class="wv-lead">${esc(T.pasos.bajada)}</p></div>
        <ol class="wv-steps">
          ${T.pasos.lista.map(([t, p], i) => `<li class="wv-step" data-rev style="--d:${i * 90}ms"><span class="wv-step__n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="wv-section" aria-labelledby="resenas-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow">${icono('i-chispa')}${esc(T.resenas.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="resenas-titulo">${esc(T.resenas.titulo)}</h2></div>
          <button type="button" class="wv-btn wv-btn--ghost" id="dejar-resena">${icono('i-pluma')}${esc(T.resenas.boton)}</button>
        </div>
        <div class="wv-reviews">${resenas.slice(0, 3).map(resena).join('')}</div>
      </div>
    </section>

    ${seccionDeseo()}

    <section class="wk-videos" aria-labelledby="videos-titulo">
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tl,br" data-semilla="23"></span>
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow wv-eyebrow--luz">${icono('i-chispa')}${esc(T.videos.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="videos-titulo">${esc(T.videos.titulo)}</h2><p class="wv-lead">${esc(T.videos.bajada)}</p></div>
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

    <section class="wv-section" aria-labelledby="faq-titulo">
      <div class="wv-container wv-faq-wrap">
        <div class="wv-head" data-rev>
          <p class="wv-eyebrow">${icono('i-chispa')}${esc(T.preguntas.antetitulo)}</p>
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
        <p class="wv-lead">${esc(T.preguntas.otra)} <a class="wv-link" href="/contacto" data-link>${esc(T.preguntas.escribinos)} ${icono('i-flecha')}</a></p>
      </div>
    </section>

    <section class="wv-walkiver" aria-labelledby="walkiver-titulo">
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tl" data-semilla="31"></span>
      <div class="wv-container wv-walkiver__grid">
        <div data-rev>
          <p class="wv-eyebrow">${icono('i-pluma')}${esc(T.walkiverBanda.antetitulo)}</p>
          <h2 class="wv-h2" id="walkiver-titulo">${esc(T.walkiverBanda.titulo)}</h2>
          <p>${esc(T.walkiverBanda.bajada)}</p>
          <div class="wv-walkiver__ctas">
            <a class="wv-btn wv-btn--luz wv-btn--lg" href="${esc(enlaces.walkiver)}">${esc(T.walkiverBanda.boton)}${flecha()}</a>
            ${categoria('cursos') ? `<a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/cursos" data-link>${esc(T.walkiverBanda.boton2)}</a>` : ''}
          </div>
        </div>
        <div class="wv-walkiver__float" aria-hidden="true">
          <img class="wv-float wv-float--libro" src="walkiver/assets/wkv-ebook-portada.webp" alt="" loading="lazy">
          <img class="wv-float wv-float--a" src="img/mandragora.webp" alt="" loading="lazy">
          <img class="wv-float wv-float--b" src="img/bitacora.webp" alt="" loading="lazy">
          <span class="wv-float wv-float--sello"><i class="wk-mano"></i></span>
        </div>
      </div>
    </section>`;

  // Entrada: la primera vez en la sesión espera que la toques; después se abre sola
  const seccion = $('#entrada');
  document.body.classList.add('en-entrada');
  const entrada = crearPortada(seccion, {
    esperarToque: primeraVez(),
    alAbrir: () => {
      document.body.classList.remove('en-entrada');
      try { sessionStorage.setItem('wk-entrada', '1'); } catch { /* sin almacenamiento */ }
    },
  });
  ui.alSalir = () => { entrada.destruir(); document.body.classList.remove('en-entrada'); };

  activarDeseo(app.querySelector('.wk-deseo'));
  activarCarrusel($('#pista-reels'));
  activarRecientes();
  activarVideos();
  activarResenas();
  activarPreguntas();
  revelar();
  contarHasta($('#prueba-piezas'), total, String);
  destacadas(duendes);
  fotosColecciones(cols);
  if (duendes?.productCount) await activarDuendes(duendes);
}

// ---------------------------------------------------------------- tres piezas destacadas (+ foto del hero)
async function destacadas(duendes) {
  const caja = $('#destacadas');
  const [nuevas, ofertas, dd] = await Promise.all([
    tienda.productos.listar({ porPagina: 8, soloDisponibles: true }).then((r) => r.items).catch(() => []),
    tienda.productos.listar({ porPagina: 48, soloDisponibles: true }).then((r) => r.items.filter((p) => p.compareAtPrice > p.price)).catch(() => []),
    duendes ? tienda.productos.listar({ categoria: duendes.handle, porPagina: 4, soloDisponibles: true }).then((r) => r.items).catch(() => []) : [],
  ]);
  if (!caja?.isConnected) return;
  const usadas = new Set();
  const tomar = (lista) => { const p = lista.find((x) => !usadas.has(x.handle)); if (p) usadas.add(p.handle); return p; };
  const elegidas = [
    [tomar(nuevas), T.destacadas.nueva, 'luz'],
    [tomar(ofertas) ?? tomar(nuevas), ofertas.length ? T.destacadas.oferta : T.destacadas.unica, 'pantano'],
    [tomar(dd) ?? tomar(nuevas), dd.length ? T.destacadas.duende : T.destacadas.nueva, 'azul'],
  ].filter(([p]) => p);
  caja.innerHTML = elegidas.map(([p, tag, tono], i) => `
    <article class="wv-spin__card wv-spin__card--${tono}" data-rev style="--d:${i * 90}ms">
      <span class="wv-spin__tag">${esc(tag)}</span>
      ${botonFavorito(p)}
      <a class="wv-spin__img" href="/producto/${esc(p.handle)}" data-link tabindex="-1" aria-hidden="true">${foto(p.image, p.title, 960) || sinFoto(p.title)}<span class="wv-card__luz"></span></a>
      <div class="wv-spin__body">
        <h3><a href="/producto/${esc(p.handle)}" data-link>${esc(p.title)}</a></h3>
        <p class="wv-spin__note">${esc(textoPlano(p.description, 110))}</p>
        <div class="wv-spin__row">
          ${precioBloque(p)}
          <button type="button" class="wv-btn wv-btn--primary wv-btn--sm" data-agregar="${esc(p.handle)}">${esc(esObjeto(p) ? T.ficha.agregarObjeto : T.ficha.agregar)}${flecha()}</button>
        </div>
      </div>
    </article>`).join('');
  repintarFavoritos();
  revelar();
  // La foto chica del hero: la pieza más nueva
  const p = nuevas[0];
  const tile = $('#hero-pieza');
  if (p && tile) {
    tile.href = `/producto/${p.handle}`;
    tile.setAttribute('aria-label', p.title);
    tile.innerHTML = `${foto(p.image, p.title, 640) || sinFoto(p.title)}<span class="wv-tile__tag">${esc(p.title)}</span>`;
  }
}

/** Colecciones sin recorte propio: la foto de una de sus piezas, como una carta flotando. */
function fotosColecciones(cols) {
  for (const c of cols) {
    const caja = $(`[data-col="${CSS.escape(c.handle)}"] .wv-cat__img`, app);
    if (!caja || caja.querySelector('img')) continue;
    tienda.productos.listar({ categoria: c.handle, porPagina: 1, soloDisponibles: true }).then(({ items }) => {
      if (items[0]?.image && caja.isConnected) { caja.classList.add('wv-cat__img--foto'); caja.innerHTML = foto(items[0].image, '', 640); }
    }).catch(() => {});
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

// ---------------------------------------------------------------- duendes
async function activarDuendes(duendes) {
  const pista = $('#pista-duendes');
  const [{ items }, disponibles] = await Promise.all([
    tienda.productos.listar({ categoria: duendes.handle, porPagina: 16 }),
    tienda.productos.listar({ categoria: duendes.handle, soloDisponibles: true, porPagina: 1 }).catch(() => null),
  ]);
  if (!pista?.isConnected) return;
  const orden = [...items.filter((p) => p.available), ...items.filter((p) => !p.available)];
  pista.innerHTML = orden.map((p, i) => carta(p, i)).join('');
  repintarFavoritos();
  const quedan = disponibles?.total ?? orden.filter((p) => p.available).length;
  contarHasta($('#contador-duendes'), quedan, T.duendes.contador);

  pista.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-agregar], [data-fav]')) return;
    const c = e.target.closest('.wk-carta');
    if (!c || pista.dataset.arrastro === '1') return;
    c.classList.toggle('is-girada');
    c.querySelector('.wk-carta__girar')?.setAttribute('aria-pressed', String(c.classList.contains('is-girada')));
  });
  activarCarrusel(pista);
  $('#elegir-duende').addEventListener('click', () => ritualDuende(orden.filter((p) => p.available)));
}

function carta(p, i) {
  const nombre = p.title.replace(/^duende\s+(de(l)?\s+)?/i, '');
  return `
  <article class="wk-carta${p.available ? '' : ' is-hogar'}" data-nombre="${esc(p.title)}" style="--i:${i}">
    <div class="wk-carta__giro">
      <div class="wk-carta__cara wk-carta__cara--frente">${frente(p, nombre, i)}</div>
      <div class="wk-carta__cara wk-carta__cara--dorso">${dorso(p)}</div>
    </div>
  </article>`;
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
        e.target.innerHTML = `<div class="wv-empty"><i class="wk-mano wk-mano--vacio" aria-hidden="true"></i><h3>${esc(T.resenas.gracias)}</h3></div>`;
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
