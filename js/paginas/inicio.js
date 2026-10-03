// Inicio: "El viaje", en el bosque vivo.
// Las ramas se abren como un telón y el polvo de hadas escribe el nombre. Al bajar, el polvo se divide en dos:
// la criatura (mandrágora) y el objeto (bitácora), cada uno es la puerta a su colección. Después forma el árbol
// de Milarko (ritual de duendes) y Walkurio, y se deshace en el cielo de la tienda:
// recién salidos → deseo (bola de cristal) → espejos (videos) → voces (carrusel) → Walkiver. Las preguntas viven en el pie.
import { tienda, T, $, $$, esc, app, estado, categoria, foto, sinFoto, precio, tarjeta, fantasmas, revelar, contarHasta, textoPlano, modal, aviso, reducido, tactil, espera, botonFavorito, icono, flecha, ui } from '../base.js';
import { videos, resenas, enlaces, pestanas as pestanasExtra, heroImagenes, categoriasObjeto } from '../config.js';
import { seccionDeseo, activarDeseo } from './deseo.js';
import { repintarFavoritos } from '../cuenta.js';
import { rafaga } from '../polvo.js';

export async function inicio() {
  const info = estado.info;
  document.title = info.seo.title || info.name;
  document.documentElement.classList.remove('con-entrada');
  const duendes = categoria('duendes');
  const criaturas = categoria('criaturas');
  const objetos = categoriasObjeto.map(categoria).filter((c) => c?.productCount);
  const hrefObjetos = objetos.length === 1 ? `/categoria/${objetos[0].handle}` : '/tienda';
  const [cap1, cap2, cap3] = T.viaje.capitulos;
  const piezas = (c) => (c?.productCount ? T.categorias.piezas(c.productCount) : '');
  const accesos = [
    { titulo: T.accesos.tienda, texto: T.accesos.tiendaTexto, href: '/tienda', icono: 'i-bag' },
    criaturas && { titulo: criaturas.name, texto: piezas(criaturas) || T.accesos.criaturasTexto, href: `/categoria/${criaturas.handle}`, icono: 'i-criatura' },
    objetos.length && { titulo: T.viaje.lados.objetos.titulo, texto: objetos.map((c) => c.name).join(' · '), href: hrefObjetos, icono: 'i-bitacora' },
    duendes && { titulo: duendes.name, texto: piezas(duendes) || T.accesos.duendesTexto, href: `/categoria/${duendes.handle}`, icono: 'i-chispa' },
    categoria('cursos') && { titulo: T.cursos.titulo, texto: T.accesos.cursosTexto, href: '/cursos', icono: 'i-pluma' },
    { titulo: 'Contacto', texto: T.accesos.contactoTexto, href: '/contacto', icono: 'i-mail' },
  ].filter(Boolean);
  const tabs = [['nuevos', T.recientes.pestanas.nuevos], ['ofertas', T.recientes.pestanas.ofertas],
    ...pestanasExtra.map(categoria).filter((c) => c?.productCount).map((c) => [c.handle, c.name])];
  const lado = (k, href, n, i) => `
    <a class="wv-duo__lado wv-duo__lado--${k}" href="${href}" data-link data-lado="${i}">
      <img class="wv-duo__respaldo" src="${esc(heroImagenes[i < 0 ? 0 : 1] ?? heroImagenes[0])}" alt="" loading="lazy">
      <span class="wv-duo__pie" data-rev>
        <span class="wv-duo__cuenta">${n ? esc(T.categorias.piezas(n)) : ''}</span>
        <strong>${esc(T.viaje.lados[k].titulo)}</strong>
        <span class="wv-duo__texto">${esc(T.viaje.lados[k].texto)}</span>
        <span class="wv-duo__ir">${esc(T.viaje.lados[k].boton)} ${icono('i-flecha')}</span>
      </span>
    </a>`;

  app.innerHTML = `
    <canvas class="wv-viaje" id="viaje" aria-hidden="true"></canvas>

    <section class="wv-portal" data-capitulo="0" aria-label="${esc(info.name)}">
      <div class="wv-portal__texto">
        <p class="wv-portal__ante">${esc(T.portal2.ante)}</p>
        <h1 class="wv-portal__frase">${esc(T.hero.titulo)}</h1>
        <p class="wv-portal__bajada">${esc(T.portal2.bajada)}</p>
        <div class="wv-portal__ctas">
          <a class="wv-btn wv-btn--luz wv-btn--lg" href="/tienda" data-link>${esc(T.portal2.tienda)}${flecha()}</a>
          ${criaturas ? `<a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/categoria/${esc(criaturas.handle)}" data-link>${esc(T.portal2.criaturas)}</a>` : ''}
        </div>
        <ul class="wv-portal__confianza">${T.portal2.confianza.map((c) => `<li>${icono('i-chispa')}${esc(c)}</li>`).join('')}</ul>
      </div>
      <a class="wv-portal__bajar" href="#accesos"><span>${esc(T.viaje.bajar)}</span><i aria-hidden="true"></i></a>
    </section>

    <section class="wv-accesos" id="accesos" aria-labelledby="accesos-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--center" data-rev>
          <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.accesos.ante)}</p>
          <h2 class="wv-h2" id="accesos-titulo">${esc(T.accesos.titulo)}</h2>
        </div>
        <nav class="wv-accesos__grid" aria-label="${esc(T.accesos.titulo)}">
          ${accesos.map((a, k) => `
            <a class="wv-acceso" href="${esc(a.href)}"${a.aparte ? '' : ' data-link'} data-rev style="--d:${k * 70}ms">
              <span class="wv-acceso__icono">${icono(a.icono)}</span>
              <span class="wv-acceso__texto"><strong>${esc(a.titulo)}</strong><small>${esc(a.texto)}</small></span>
              <span class="wv-acceso__ir">${icono('i-flecha')}</span>
            </a>`).join('')}
        </nav>
      </div>
    </section>

    <section class="wv-duo" id="cap-1" data-capitulo="1" aria-labelledby="cap-1-titulo">
      <div class="wv-duo__cab">
        <p class="wv-cap__ante" data-rev>${esc(cap1.ante)}</p>
        <h2 class="wv-cap__titulo" id="cap-1-titulo" data-rev style="--d:80ms">${esc(cap1.titulo)}</h2>
        <p class="wv-cap__bajada" data-rev style="--d:160ms">${esc(cap1.texto)}</p>
      </div>
      <div class="wv-duo__lados">
        ${lado('criaturas', criaturas ? `/categoria/${criaturas.handle}` : '/tienda', criaturas?.productCount, -1)}
        ${lado('objetos', hrefObjetos, objetos.reduce((n, c) => n + c.productCount, 0), 1)}
      </div>
    </section>

    <section class="wv-cap wv-cap--izq" id="cap-2" data-capitulo="2" aria-labelledby="cap-2-titulo">
      <div class="wv-cap__texto">
        <p class="wv-cap__ante" data-rev>${esc(cap2.ante)}</p>
        <h2 class="wv-cap__titulo" id="cap-2-titulo" data-rev style="--d:80ms">${esc(cap2.titulo)}</h2>
        <p class="wv-cap__bajada" data-rev style="--d:160ms">${esc(cap2.texto)}</p>
        <p class="wv-cap__contador" id="contador-duendes" aria-live="polite"></p>
        <div class="wv-cap__acciones" data-rev style="--d:240ms">
          <button type="button" class="wv-btn wv-btn--luz wv-btn--lg" id="elegir-duende">${esc(cap2.boton)}</button>
          ${duendes ? `<a class="wv-btn wv-btn--outline-light wv-btn--lg" href="/categoria/${esc(duendes.handle)}" data-link>${esc(T.duendes.todos)}</a>` : ''}
        </div>
      </div>
    </section>

    <section class="wv-cap wv-cap--izq" id="cap-3" data-capitulo="3" aria-labelledby="cap-3-titulo">
      <div class="wv-cap__texto">
        <p class="wv-cap__ante" data-rev>${esc(cap3.ante)}</p>
        <h2 class="wv-cap__titulo" id="cap-3-titulo" data-rev style="--d:80ms">${esc(cap3.titulo)}</h2>
        <p class="wv-cap__bajada" data-rev style="--d:160ms">${esc(cap3.texto)}</p>
        <div class="wv-cap__acciones" data-rev style="--d:240ms"><a class="wv-btn wv-btn--luz wv-btn--lg" href="/walkurio" data-link>${esc(cap3.boton)}${flecha()}</a></div>
      </div>
    </section>

    <div class="wv-umbral" data-capitulo="4" aria-hidden="true"></div>

    <section class="wv-section wv-cielo" aria-labelledby="recientes-titulo">
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

    <section class="wk-videos wv-espejos" aria-labelledby="videos-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--split" data-rev>
          <div><p class="wv-eyebrow wv-eyebrow--luz">${esc(T.videos.antetitulo)}</p><h2 class="wv-h2 wv-h2--xl" id="videos-titulo">${esc(T.videos.titulo)}</h2><p class="wv-lead">${esc(T.videos.bajada)}</p></div>
          <a class="wv-btn wv-btn--outline-light" href="${esc(info.contact.instagram || enlaces.instagram)}" target="_blank" rel="noopener">${icono('i-ig')}${esc(T.videos.boton)}</a>
        </div>
      </div>
      <ul class="wk-reels wv-espejos__pista" id="pista-reels" role="list" style="--n:${videos.length}">
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
      <div class="wv-container">${navCarrusel('pista-reels')}</div>
    </section>

    <section class="wv-section wv-voces" aria-labelledby="resenas-titulo">
      <div class="wv-container">
        <div class="wv-head wv-head--center" data-rev>
          <p class="wv-eyebrow wv-eyebrow--luz">${esc(T.resenas.antetitulo)}</p>
          <h2 class="wv-h2 wv-h2--xl" id="resenas-titulo">${esc(T.resenas.titulo)}</h2>
        </div>
      </div>
      <div class="wv-voces__rio" aria-label="Reseñas">
        ${[0, 1].map((f) => {
          const fila = resenas.filter((_, i) => i % 2 === f).map(resena).join('');
          return `<div class="wv-voces__fila${f ? ' wv-voces__fila--inversa' : ''}"><div class="wv-voces__pista">${fila}<span class="wv-voces__copia" aria-hidden="true">${fila}</span></div></div>`;
        }).join('')}
      </div>
      <div class="wv-cielo__todo"><button type="button" class="wv-btn wv-btn--outline-light" id="dejar-resena">${icono('i-pluma')}${esc(T.resenas.boton)}</button></div>
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

  ui.bosque?.abrir(true);

  // El viaje (WebGL). Sin WebGL quedan el logo y las fotos de respaldo.
  let viaje = null;
  ui.alSalir = () => { viaje?.destruir(); document.body.classList.remove('con-viaje', 'en-entrada'); };
  import('../viaje.js')
    .then(({ crearViaje }) => crearViaje($('#viaje'), { texto: { lineas: ['Arte, Magia', 'y Reciclaje'], movil: ['Arte,', 'Magia y', 'Reciclaje'] }, criaturas: heroImagenes }))
    .then((v) => { if ($('#viaje')) { viaje = v; document.body.classList.add('con-viaje'); } else v.destruir(); })
    .catch((e) => console.warn('Sin viaje 3D:', e));
  // El lado que señalás se acerca
  $$('[data-lado]', app).forEach((a) => {
    a.addEventListener('pointerenter', () => viaje?.enfocar(Number(a.dataset.lado)));
    a.addEventListener('pointerleave', () => viaje?.enfocar(0));
    a.addEventListener('focus', () => viaje?.enfocar(Number(a.dataset.lado)));
    a.addEventListener('blur', () => viaje?.enfocar(0));
  });

  activarDeseo(app.querySelector('.wk-deseo'));
  activarCarrusel($('#pista-reels'));
  activarRecientes();
  activarVideos();
  activarResenas();
  revelar();
  if (duendes?.productCount) {
    const { items } = await tienda.productos.listar({ categoria: duendes.handle, porPagina: 16, soloDisponibles: true }).catch(() => ({ items: [] }));
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
    if (b) pista.scrollBy({ left: Number(b.dataset.mover) * pista.clientWidth * 0.7, behavior: reducido ? 'auto' : 'smooth' });
  });
  arrastrable(pista);
  actualizar();
}

/** Con mouse, la pista se puede arrastrar con inercia (en táctiles ya se desliza sola). */
function arrastrable(pista) {
  if (tactil) return;
  let x0 = 0, s0 = 0, abajo = false, v = 0, ultX = 0, raf = 0;
  pista.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('a, button')) return;
    abajo = true; x0 = e.clientX; ultX = e.clientX; s0 = pista.scrollLeft; v = 0; pista.dataset.arrastro = '0';
    cancelAnimationFrame(raf);
  });
  addEventListener('pointermove', (e) => {
    if (!abajo) return;
    const d = e.clientX - x0;
    v = e.clientX - ultX; ultX = e.clientX;
    if (Math.abs(d) > 6) { pista.dataset.arrastro = '1'; pista.classList.add('is-arrastrando'); }
    pista.scrollLeft = s0 - d;
  });
  addEventListener('pointerup', () => {
    if (!abajo) return;
    abajo = false; pista.classList.remove('is-arrastrando');
    setTimeout(() => { pista.dataset.arrastro = '0'; }, 0);
    // Inercia: sigue deslizando y frena solo
    const seguir = () => { v *= 0.94; pista.scrollLeft -= v; if (Math.abs(v) > 0.3) raf = requestAnimationFrame(seguir); };
    raf = requestAnimationFrame(seguir);
  });
}

// ---------------------------------------------------------------- ritual: "Que un duende te elija"
const frente = (p, nombre, i) => `
  <span class="wk-carta__foto">${foto(p.image, p.title, 640) || sinFoto(p.title)}</span>
  <span class="wk-carta__marco" aria-hidden="true"></span>
  <span class="wk-carta__num">Nº ${String(i + 1).padStart(2, '0')}</span>
  <span class="wk-carta__nombre">${esc(nombre)}</span>`;
const dorso = (p) => `
  ${botonFavorito(p, 'wk-carta__fav')}
  <small>${esc(T.duendes.antetitulo)}</small>
  <h3>${esc(p.title)}</h3>
  <p>${esc(textoPlano(p.description, 110))}</p>
  ${precio(p)}
  ${p.available ? `<button type="button" class="wv-btn wv-btn--luz wv-btn--sm" data-agregar="${esc(p.handle)}">${esc(T.duendes.adoptar)}</button>` : `<p class="wk-carta__hogar">${esc(T.recientes.adoptada)}</p>`}
  <a href="/producto/${esc(p.handle)}" data-link class="wk-carta__link">${esc(T.duendes.conocer)} →</a>`;
const nombreCorto = (t) => t.replace(/^duende\s+(de(l)?\s+)?/i, '');

/**
 * El bosque elige: las cartas de los duendes quedan suspendidas en el aire como hojas,
 * empiezan a girar alrededor de una luz en órbitas que se van cerrando, una a una se deshacen en polvo,
 * y la elegida se acerca, crece y se da vuelta despacio.
 */
async function ritualDuende(lista) {
  const candidatos = lista.slice(0, 9);
  if (!candidatos.length) return;
  const n = candidatos.length;
  const k = Math.floor(Math.random() * n);
  const capa = document.createElement('div');
  capa.className = 'wv-ritual';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-label', T.duendes.elegir);
  capa.innerHTML = `
    <div class="wv-ritual__velo"></div>
    <div class="wv-ritual__luz" aria-hidden="true"></div>
    <div class="wv-ritual__hojas" aria-hidden="true">
      ${candidatos.map((p, i) => `<div class="wv-ritual__hoja"><div class="wk-carta__cara wk-carta__cara--frente">${frente(p, nombreCorto(p.title), i)}</div></div>`).join('')}
    </div>
    <p class="wv-ritual__texto" aria-live="polite">${esc(T.duendes.eligiendo)}</p>
    <button type="button" class="wv-ritual__cerrar" aria-label="${esc(T.duendes.cerrar)}">${icono('i-cerrar')}</button>`;
  document.body.append(capa);
  document.body.classList.add('con-modal');
  const previo = document.activeElement;
  let vivo = true, raf = 0;
  const cerrar = () => {
    vivo = false; cancelAnimationFrame(raf);
    capa.classList.add('is-cerrando');
    document.body.classList.remove('con-modal');
    removeEventListener('keydown', tecla);
    setTimeout(() => capa.remove(), 700);
    previo?.focus?.();
  };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  addEventListener('keydown', tecla);
  capa.addEventListener('click', (e) => {
    if (e.target.closest('.wv-ritual__velo, .wv-ritual__cerrar, a[data-link]')) cerrar();
    if (e.target.closest('[data-otra-vez]')) { vivo = false; capa.remove(); document.body.classList.remove('con-modal'); removeEventListener('keydown', tecla); ritualDuende(lista); }
  });
  capa.querySelector('.wv-ritual__cerrar').focus({ preventScroll: true });
  requestAnimationFrame(() => capa.classList.add('is-abierta'));

  // Cada carta es una hoja con su propio ritmo: ángulo, radio, altura, balanceo
  const hojas = $$('.wv-ritual__hoja', capa).map((el, i) => ({
    el, a: (i / n) * Math.PI * 2 + Math.random() * 0.6, r: 0.9 + Math.random() * 0.5, y: (Math.random() - 0.5) * 0.5,
    fase: Math.random() * 6.28, vel: 0.12 + Math.random() * 0.1, op: 0, polvo: 0, x: 0, yy: 0,
  }));
  const W = () => Math.min(innerWidth * 0.42, 520), H = () => Math.min(innerHeight * 0.3, 260);
  let t = 0, fase = 'flota', ultimo = performance.now();
  const duracion = reducido ? 0.1 : 5.4;
  const elegida = hojas[k];
  const cuadro = (now) => {
    if (!vivo) return;
    const dt = Math.min((now - ultimo) / 1000, 0.05); ultimo = now; t += dt;
    // 0–1.4 s flotan suspendidas · 1.4–5.4 s orbitan y las órbitas se cierran · después se elige
    const giro = Math.min(1, Math.max(0, (t - 1.4) / (duracion - 1.4)));
    const cierre = 1 - giro * giro * (3 - 2 * giro) * 0.55;
    for (const h of hojas) {
      const esta = h === elegida;
      h.op += (1 - h.op) * Math.min(1, dt * 2);
      h.a += dt * (h.vel + Math.sin(giro * Math.PI) * 1.6) * (1 - (fase === 'elige' ? 1 : 0));
      const rx = W() * h.r * cierre, ry = H() * h.r * cierre;
      let x = Math.cos(h.a) * rx, y = Math.sin(h.a) * ry * 0.55 + h.y * H() + Math.sin(t * 1.3 + h.fase) * 10;
      const z = (Math.sin(h.a) + 1) / 2; // adelante / atrás
      let esc2 = 0.72 + z * 0.4, rot = Math.sin(t * 0.9 + h.fase) * 8 + Math.cos(h.a) * 10;
      if (fase === 'elige') {
        if (esta) { h.x += (0 - h.x) * Math.min(1, dt * 2.4); h.yy += (0 - h.yy) * Math.min(1, dt * 2.4); x = h.x; y = h.yy; esc2 = 1.25; rot *= 0.2; }
        else h.polvo = Math.min(1, h.polvo + dt * 1.2);
      } else { h.x = x; h.yy = y; }
      h.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${esc2.toFixed(3)})`;
      h.el.style.zIndex = esta && fase === 'elige' ? 99 : Math.round(z * 50);
      h.el.style.opacity = (h.op * (1 - h.polvo)).toFixed(3);
      h.el.style.filter = h.polvo ? `blur(${(h.polvo * 8).toFixed(1)}px) brightness(${(1 + h.polvo).toFixed(2)})` : (z < 0.4 ? `blur(${((0.4 - z) * 4).toFixed(1)}px)` : '');
      if (h.polvo > 0 && !h.deshecha) { h.deshecha = true; rafaga(h.el, 14); }
    }
    if (fase === 'flota' && t > duracion) { fase = 'elige'; capa.classList.add('is-eligiendo'); }
    if (fase === 'elige' && t > duracion + 1.6) { revelarElegida(); return; }
    raf = requestAnimationFrame(cuadro);
  };
  raf = requestAnimationFrame(cuadro);

  function revelarElegida() {
    const p = candidatos[k];
    capa.classList.add('is-revela');
    capa.querySelector('.wv-ritual__texto').textContent = T.duendes.elegido(p.title);
    elegida.el.style.opacity = '0';
    capa.insertAdjacentHTML('beforeend', `
      <div class="wv-ritual__elegida">
        <article class="wk-carta wk-carta--grande">
          <div class="wk-carta__giro">
            <div class="wk-carta__cara wk-carta__cara--frente">${frente(p, nombreCorto(p.title), k)}</div>
            <div class="wk-carta__cara wk-carta__cara--dorso">${dorso(p)}</div>
          </div>
        </article>
        <div class="wv-ritual__acciones"><button type="button" class="wv-btn wv-btn--outline-light" data-otra-vez>${icono('i-girar')}${esc(T.duendes.otraVez)}</button></div>
      </div>`);
    repintarFavoritos();
    const grande = capa.querySelector('.wk-carta--grande');
    rafaga(grande, 40);
    // Tocar la carta la da vuelta (salvo que toques un botón o enlace)
    grande.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      grande.classList.toggle('is-girada');
      rafaga(grande, 14);
    });
    setTimeout(() => { if (capa.isConnected) { grande.classList.add('is-girada'); rafaga(grande, 30); } }, reducido ? 0 : 1100);
  }
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
    lista.classList.add('is-cambiando');
    const [items] = await Promise.all([cache[k] ??= traer(k).catch(() => []), espera(reducido ? 0 : 260)]);
    if (!lista.isConnected) return;
    lista.innerHTML = items.length ? items.map(tarjeta).join('') : `<div class="wv-empty" style="grid-column:1/-1"><p>${esc(T.recientes.vacio)}</p></div>`;
    lista.classList.remove('is-cambiando');
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

// ---------------------------------------------------------------- reseñas (río de voces que corre solo)
const estrellas = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="i${i < n ? ' is-llena' : ''}" aria-hidden="true"><use href="#i-estrella"/></svg>`).join('');
const resena = (r) => `
  <figure class="wv-review">
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
