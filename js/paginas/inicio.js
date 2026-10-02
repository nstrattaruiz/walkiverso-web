// Inicio: Portal de Raíces → colecciones → duendes → recién salidos → deseo → espejos (videos) → reseñas → preguntas.
import { tienda, T, $, $$, esc, app, estado, ui, categoria, colecciones, foto, sinFoto, precio, tarjeta, fantasmas, revelar, contarHasta, textoPlano, modal, aviso, acordeon, romano, reducido, tactil, espera, botonFavorito } from '../base.js';
import { videos, resenas, preguntas, enlaces, pestanas as pestanasExtra } from '../config.js';
import { seccionDeseo, activarDeseo } from './deseo.js';
import { crearEntrada } from '../entrada.js';
import { repintarFavoritos } from '../cuenta.js';
import { rafaga } from '../polvo.js';

const primeraVez = () => { try { return sessionStorage.getItem('wk-entrada') !== '1'; } catch { return true; } };

export async function inicio() {
  document.title = estado.info.seo.title || estado.info.name;
  const cols = colecciones().filter((c) => c.productCount);
  const duendes = categoria('duendes');
  const tabs = [['nuevos', T.recientes.pestanas.nuevos], ['ofertas', T.recientes.pestanas.ofertas],
    ...pestanasExtra.map(categoria).filter((c) => c?.productCount).map((c) => [c.handle, c.name])];

  app.innerHTML = `
    <section class="wk-entrada" id="entrada" aria-label="${esc(estado.info.name)}">
      <canvas class="wk-entrada__vortice" aria-hidden="true"></canvas>
      <svg class="wk-entrada__raices" aria-hidden="true"></svg>
      <button type="button" class="wk-entrada__tocar" hidden><span class="wk-entrada__tocar-anillo" aria-hidden="true"></span>${esc(T.entrada.tocar)}</button>
      <button type="button" class="wk-entrada__saltar">${esc(T.entrada.saltar)}</button>
      <div class="wk-entrada__texto">
        <p class="wk-antetitulo">${esc(T.hero.antetitulo)}</p>
        <h1 class="wk-hero__titulo">${T.hero.titulo.split(' ').map((w, i) => `<span class="wk-palabra" style="--i:${i}">${esc(w)}</span>`).join(' ')}</h1>
        <p class="wk-hero__bajada">${esc(estado.info.seo.description || T.hero.bajada)}</p>
        <div class="wk-hero__botones">
          <a class="wk-btn wk-btn--luz" href="/tienda" data-link>${esc(T.hero.boton)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
          <a class="wk-btn wk-btn--vidrio" href="/walkurio" data-link><svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(T.hero.boton2)}</a>
        </div>
      </div>
      <a class="wk-mundo__bajar wk-entrada__bajar" href="#recorrer" aria-label="${esc(T.entrada.bajar)}"><span></span></a>
    </section>

    ${cols.length ? `
    <section class="wk-seccion wk-colecciones" id="recorrer">
      <div class="contenedor">
        <div class="wk-titulo wk-titulo--centro" data-rev><p class="wk-antetitulo">${esc(T.categorias.antetitulo)}</p><h2>${esc(T.categorias.titulo)}</h2></div>
        <div class="wk-ventanas">
          ${cols.map((c, i) => `
            <a class="wk-ventana" href="/categoria/${esc(c.handle)}" data-link data-rev style="--d:${i * 70}ms" data-ventana="${esc(c.handle)}">
              <span class="wk-ventana__arco">
                <span class="wk-ventana__vidrio">${c.image ? foto(c.image, c.name, 640) : sinFoto(c.name)}</span>
                <span class="wk-ventana__brillo" aria-hidden="true"></span>
                <span class="wk-ventana__chispas" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              </span>
              <strong>${esc(c.name)}</strong>
              <small>${esc(T.categorias.piezas(c.productCount))}</small>
            </a>`).join('')}
        </div>
        <div class="wk-colecciones__todas" data-rev><a class="wk-btn wk-btn--linea" href="/tienda" data-link><svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(T.categorias.todas)}</a></div>
      </div>
    </section>` : '<span id="recorrer"></span>'}

    ${duendes?.productCount ? `
    <section class="wk-duendes" aria-labelledby="duendes-titulo">
      <div class="wk-duendes__bosque" aria-hidden="true"><span class="wk-ramas wk-ramas--izq"></span><span class="wk-ramas wk-ramas--der"></span>${'<i></i>'.repeat(18)}</div>
      <div class="contenedor wk-duendes__cab" data-rev>
        <p class="wk-antetitulo">${esc(T.duendes.antetitulo)}</p>
        <h2 id="duendes-titulo">${esc(T.duendes.titulo)}</h2>
        <p class="wk-duendes__bajada">${esc(T.duendes.bajada)}</p>
        <p class="wk-duendes__contador" id="contador-duendes" aria-live="polite"></p>
        <div class="wk-duendes__acciones">
          <button type="button" class="wk-btn wk-btn--luz" id="elegir-duende"><svg aria-hidden="true"><use href="#i-chispa"/></svg><span>${esc(T.duendes.elegir)}</span></button>
          <a class="wk-btn wk-btn--vidrio" href="/categoria/${esc(duendes.handle)}" data-link>${esc(T.duendes.todos)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
        </div>
      </div>
      <div class="wk-carrusel">
        <button type="button" class="wk-carrusel__flecha wk-carrusel__flecha--izq" data-mover="-1" aria-label="Anteriores"><svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
        <div class="wk-carrusel__pista" id="pista-duendes" tabindex="0" aria-label="Duendes">${'<span class="wk-carta wk-carta--fantasma"></span>'.repeat(5)}</div>
        <button type="button" class="wk-carrusel__flecha" data-mover="1" aria-label="Siguientes"><svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
      </div>
      <p class="wk-duendes__pista-texto">${esc(T.duendes.girar)}</p>
    </section>` : ''}

    <section class="wk-seccion wk-recientes">
      <div class="contenedor">
        <div class="wk-titulo" data-rev>
          <div><p class="wk-antetitulo">${esc(T.recientes.antetitulo)}</p><h2>${esc(T.recientes.titulo)}</h2><p class="wk-titulo__bajada">${esc(T.recientes.bajada)}</p></div>
          <a class="wk-btn wk-btn--linea" href="/tienda" data-link>${esc(T.recientes.boton)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
        </div>
        <div class="wk-pestanas" role="tablist" aria-label="${esc(T.recientes.titulo)}" data-rev>
          ${tabs.map(([k, v], i) => `<button type="button" role="tab" data-pestana="${esc(k)}" aria-selected="${i === 0}">${esc(v)}</button>`).join('')}
          <span class="wk-pestanas__luz" aria-hidden="true"></span>
        </div>
        <div class="grilla" id="recientes" role="tabpanel">${fantasmas(4)}</div>
      </div>
    </section>

    ${seccionDeseo()}

    <section class="wk-videos" aria-labelledby="videos-titulo">
      <div class="contenedor">
        <div class="wk-titulo" data-rev>
          <div><p class="wk-antetitulo">${esc(T.videos.antetitulo)}</p><h2 id="videos-titulo">${esc(T.videos.titulo)}</h2><p class="wk-titulo__bajada">${esc(T.videos.bajada)}</p></div>
          <div class="wk-videos__links">
            <a class="wk-btn wk-btn--luz" href="${esc(estado.info.contact.instagram || enlaces.instagram)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-ig"/></svg>${esc(T.videos.boton)}</a>
            <a class="wk-btn wk-btn--vidrio" href="${esc(enlaces.walkiver)}#videos">${esc(T.videos.canal)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
          </div>
        </div>
      </div>
      <div class="wk-espejos">
        ${videos.map((v, i) => {
          const id = idYoutube(v.url);
          return `<button type="button" class="wk-espejo${id ? '' : ' is-pronto'}" data-rev style="--d:${i * 90}ms" ${id ? `data-video="${esc(id)}"` : 'disabled'} aria-label="${esc(v.titulo)}${id ? '' : ` · ${T.videos.pronto}`}">
            <span class="wk-espejo__marco" aria-hidden="true">
              <span class="wk-espejo__corona"></span>
              <span class="wk-espejo__vidrio">
                ${id ? `<img src="https://i.ytimg.com/vi/${esc(id)}/hq720.jpg" alt="" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg'">` : '<span class="wk-espejo__niebla"></span>'}
                <span class="wk-espejo__reflejo"></span>
                <span class="wk-espejo__play">${id ? '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>' : '<svg><use href="#i-chispa"/></svg>'}</span>
              </span>
              <span class="wk-espejo__pie"></span>
            </span>
            <span class="wk-espejo__placa"><small>${id ? esc(T.videos.mirar) : esc(T.videos.pronto)}</small><strong>${esc(v.titulo)}</strong></span>
          </button>`;
        }).join('')}
      </div>
    </section>

    <section class="wk-seccion wk-resenas" aria-labelledby="resenas-titulo">
      <div class="contenedor">
        <div class="wk-titulo wk-titulo--centro" data-rev>
          <p class="wk-antetitulo">${esc(T.resenas.antetitulo)}</p><h2 id="resenas-titulo">${esc(T.resenas.titulo)}</h2>
          <div class="wk-resenas__promedio"><span class="wk-estrellas" aria-label="5 de 5">${estrellas(5)}</span><span>${resenas.length} reseñas</span></div>
        </div>
      </div>
      <div class="wk-resenas__filas" aria-label="Reseñas">
        ${[0, 1].map((f) => {
          const cartas = resenas.filter((_, i) => i % 2 === f).map(resena).join('');
          return `<div class="wk-resenas__fila${f ? ' wk-resenas__fila--inversa' : ''}"><div class="wk-resenas__pista">${cartas}<span class="wk-resenas__copia" aria-hidden="true">${cartas}</span></div></div>`;
        }).join('')}
      </div>
      <div class="contenedor wk-resenas__accion"><button type="button" class="wk-btn wk-btn--noche" id="dejar-resena"><svg aria-hidden="true"><use href="#i-pluma"/></svg>${esc(T.resenas.boton)}</button></div>
    </section>

    <section class="wk-seccion wk-faq" aria-labelledby="faq-titulo">
      <div class="contenedor wk-faq__grilla">
        <div class="wk-faq__cab" data-rev>
          <p class="wk-antetitulo">${esc(T.preguntas.antetitulo)}</p>
          <h2 id="faq-titulo">${esc(T.preguntas.titulo)}</h2>
          <label class="wk-oraculo">
            <span class="wk-oraculo__orbe" aria-hidden="true"></span>
            <input type="search" id="oraculo" placeholder="${esc(T.preguntas.oraculo)}" aria-label="${esc(T.preguntas.oraculo)}" autocomplete="off">
          </label>
          <p class="wk-faq__otra">${esc(T.preguntas.otra)} <a href="/contacto" data-link>${esc(T.preguntas.escribinos)} →</a></p>
        </div>
        <div class="wk-faq__lista" id="faq">
          ${preguntas.map(([q, a], i) => `
            <div class="wk-pregunta" data-rev style="--d:${i * 60}ms" data-texto="${esc(`${q} ${a}`.toLowerCase())}">
              <h3><button type="button" data-acordeon aria-expanded="${i === 0}" aria-controls="faq-${i}" id="faq-b-${i}">
                <span class="wk-medalla" aria-hidden="true">${romano(i)}</span><span class="wk-pregunta__q">${esc(q)}</span><span class="wk-pregunta__mas" aria-hidden="true"></span>
              </button></h3>
              <div class="wk-pregunta__r" id="faq-${i}" role="region" aria-labelledby="faq-b-${i}"><div><p>${esc(a)}</p></div></div>
            </div>`).join('')}
          <p class="wk-faq__nada" id="faq-nada" hidden>${esc(T.preguntas.nada)}</p>
        </div>
      </div>
    </section>`;

  // Portal: la primera vez en la sesión espera que lo toques; después se abre solo
  const esperarToque = primeraVez();
  const seccion = $('#entrada');
  document.body.classList.add('en-entrada');
  const entrada = crearEntrada(seccion, {
    esperarToque,
    alAbrir: () => {
      document.body.classList.remove('en-entrada');
      try { sessionStorage.setItem('wk-entrada', '1'); } catch { /* sin almacenamiento */ }
    },
  });
  ui.alSalir = () => { entrada.destruir(); document.body.classList.remove('en-entrada'); };

  activarDeseo(app.querySelector('.wk-deseo'));
  activarVentanas();
  activarRecientes();
  activarVideos();
  activarResenas();
  activarPreguntas();
  revelar();
  if (duendes?.productCount) await activarDuendes(duendes);
}

// ---------------------------------------------------------------- colecciones (ventanas)
function activarVentanas() {
  for (const el of $$('[data-ventana]', app)) {
    if (el.querySelector('img')) continue;
    // Sin imagen de la colección: se usa la foto de su primera pieza
    tienda.productos.listar({ categoria: el.dataset.ventana, porPagina: 1 }).then(({ items }) => {
      const img = items[0]?.image;
      if (img) el.querySelector('.wk-ventana__vidrio').innerHTML = foto(img, items[0].title, 640);
    }).catch(() => {});
  }
}

// ---------------------------------------------------------------- duendes
async function activarDuendes(duendes) {
  const pista = $('#pista-duendes');
  const [{ items }, disponibles] = await Promise.all([
    tienda.productos.listar({ categoria: duendes.handle, porPagina: 16 }),
    tienda.productos.listar({ categoria: duendes.handle, soloDisponibles: true, porPagina: 1 }).catch(() => null),
  ]);
  if (!pista) return;
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
  arrastrable(pista);
  $$('[data-mover]', pista.parentElement).forEach((b) => b.addEventListener('click', () => {
    pista.scrollBy({ left: Number(b.dataset.mover) * pista.clientWidth * 0.8, behavior: reducido ? 'auto' : 'smooth' });
  }));
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
  ${p.available ? `<button type="button" class="wk-btn wk-btn--luz" data-agregar="${esc(p.handle)}">${esc(T.duendes.adoptar)}</button>` : `<p class="wk-carta__hogar">${esc(T.recientes.adoptada)}</p>`}
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
      <div class="wk-ritual__acciones"><button type="button" class="wk-btn wk-btn--vidrio" data-otra-vez><svg aria-hidden="true"><use href="#i-girar"/></svg>${esc(T.duendes.otraVez)}</button></div>
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
  const pestanas = $('.wk-pestanas');
  const cache = {};
  const consulta = {
    nuevos: () => tienda.productos.listar({ porPagina: 8 }).then((r) => r.items),
    ofertas: () => tienda.productos.listar({ porPagina: 48, soloDisponibles: true }).then((r) => r.items.filter((p) => p.compareAtPrice > p.price).slice(0, 8)),
  };
  const traer = (k) => (consulta[k] ?? (() => tienda.productos.listar({ categoria: k, porPagina: 8 }).then((r) => r.items)))();
  const mover = (b) => {
    pestanas.style.setProperty('--x', `${b.offsetLeft}px`);
    pestanas.style.setProperty('--w', `${b.offsetWidth}px`);
  };
  const mostrar = async (b) => {
    $$('[role=tab]', pestanas).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    mover(b);
    const k = b.dataset.pestana;
    lista.classList.add('is-cambiando');
    const [items] = await Promise.all([cache[k] ??= traer(k).catch(() => []), espera(reducido ? 0 : 220)]);
    lista.innerHTML = items.length ? items.map(tarjeta).join('') : `<p class="vacio">${esc(T.recientes.vacio)}</p>`;
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
  addEventListener('resize', () => { const b = $('[aria-selected=true]', pestanas); if (b) mover(b); });
  mostrar($('[role=tab]', pestanas));
}

// ---------------------------------------------------------------- videos
const idYoutube = (u) => /(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(u ?? '')?.[1] ?? '';
function activarVideos() {
  $('.wk-espejos').addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]');
    if (!b) return;
    modal(`<div class="wk-video-marco wk-video-marco--espejo"><iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0&playsinline=1" title="${esc(b.getAttribute('aria-label'))}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`, 'wk-modal--video');
  });
}

// ---------------------------------------------------------------- reseñas
const estrellas = (n) => Array.from({ length: 5 }, (_, i) => `<svg class="${i < n ? 'is-llena' : ''}" aria-hidden="true"><use href="#i-estrella"/></svg>`).join('');
const resena = (r) => `
  <figure class="wk-resena">
    <span class="wk-estrellas" aria-label="${r.estrellas} de 5">${estrellas(r.estrellas)}</span>
    <blockquote>${esc(r.texto)}</blockquote>
    <figcaption><span class="wk-resena__avatar" aria-hidden="true">${esc(r.nombre[0])}</span><span><strong>${esc(r.nombre)}</strong><small>${esc(r.lugar)}${r.adopto ? ` · ${esc(T.resenas.adopto)} ${esc(r.adopto)}` : ''}</small></span></figcaption>
  </figure>`;
function activarResenas() {
  $('#dejar-resena').addEventListener('click', () => {
    const m = modal(`
      <form class="wk-form-resena" id="form-resena">
        <p class="wk-antetitulo">${esc(T.resenas.antetitulo)}</p>
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
        <button class="wk-btn wk-btn--noche wk-btn--grande">${esc(T.resenas.enviar)}</button>
      </form>`, 'wk-modal--form');
    m.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const b = e.target.querySelector('button:not([data-cerrar])');
      b.disabled = true;
      try {
        const d = Object.fromEntries(new FormData(e.target));
        await tienda.contacto({ ...d, tipo: 'Reseña', message: `★${d.estrellas} · ${d.message}` });
        rafaga(b, 40);
        e.target.innerHTML = `<div class="wk-gracias"><span class="wk-gracias__orbe" aria-hidden="true"></span><h2>${esc(T.resenas.gracias)}</h2></div>`;
      } catch (err) { aviso(err.message); b.disabled = false; }
    });
  });
}

// ---------------------------------------------------------------- preguntas (oráculo)
function activarPreguntas() {
  const lista = $('#faq');
  acordeon(lista);
  const normal = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  $('#oraculo').addEventListener('input', (e) => {
    const q = normal(e.target.value.trim());
    let hay = 0;
    $$('.wk-pregunta', lista).forEach((p) => {
      const ok = !q || q.split(/\s+/).every((w) => normal(p.dataset.texto).includes(w));
      p.hidden = !ok;
      if (ok) hay++;
      p.classList.add('is-in');
    });
    $('#faq-nada').hidden = hay > 0;
    $('.wk-oraculo').classList.toggle('is-pensando', !!q);
    // Si queda una sola respuesta, el oráculo la abre
    const visibles = $$('.wk-pregunta:not([hidden]) [data-acordeon]', lista);
    if (q && visibles.length === 1) visibles[0].setAttribute('aria-expanded', 'true');
  });
}
