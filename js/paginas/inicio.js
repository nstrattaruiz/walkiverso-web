// Inicio: puertas (Criaturas / Objetos) → duendes → recién salidos → deseo → videos → reseñas → preguntas.
import { tienda, T, $, $$, esc, app, estado, categoria, foto, sinFoto, precio, tarjeta, fantasmas, revelar, contarHasta, textoPlano, agregarRapido, modal, aviso, acordeon, romano, reducido, tactil, espera } from '../base.js';
import { videos, resenas, preguntas, enlaces } from '../config.js';
import { seccionDeseo, activarDeseo } from './deseo.js';
import { rafaga } from '../polvo.js';

export async function inicio() {
  document.title = estado.info.seo.title || estado.info.name;
  const criaturas = categoria('criaturas');
  const objetos = categoria('objetos');
  const duendes = categoria('duendes');
  const puertas = [criaturas, objetos].filter((c) => c?.productCount);

  app.innerHTML = `
    ${puertas.length ? `
    <section class="wk-seccion wk-puertas-sec" id="recorrer">
      <div class="contenedor"><div class="wk-titulo wk-titulo--centro" data-rev><p class="wk-antetitulo">${esc(T.categorias.antetitulo)}</p><h2>${esc(T.categorias.titulo)}</h2></div></div>
      <div class="wk-puertas">
        ${puertas.map((c, i) => `
          <a class="wk-puerta" href="/categoria/${esc(c.handle)}" data-link data-tono="${i}" data-rev style="--d:${i * 120}ms" data-puerta="${esc(c.handle)}">
            <span class="wk-puerta__fondo">${c.image ? foto(c.image, c.name, 1600, '', '(max-width: 750px) 100vw, 50vw') : '<span class="wk-puerta__escena" aria-hidden="true"><i></i><i></i><i></i></span>'}</span>
            <span class="wk-puerta__luz" aria-hidden="true"></span>
            <span class="wk-puerta__abanico" aria-hidden="true"></span>
            <span class="wk-puerta__texto">
              <small>${String(i + 1).padStart(2, '0')}</small>
              <strong>${esc(c.name)}</strong>
              ${c.description ? `<span class="wk-puerta__desc">${esc(c.description)}</span>` : ''}
              <em>${esc(T.categorias.piezas(c.productCount))}</em>
              <span class="wk-btn wk-btn--vidrio">${esc(T.categorias.boton)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></span>
            </span>
          </a>`).join('')}
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
          ${Object.entries(T.recientes.pestanas).filter(([k]) => !['criaturas', 'objetos'].includes(k) || categoria(k)?.productCount)
            .map(([k, v], i) => `<button type="button" role="tab" data-pestana="${k}" aria-selected="${i === 0}">${esc(v)}</button>`).join('')}
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
      <div class="wk-videos__pista">
        ${videos.map((v, i) => {
          const id = idYoutube(v.url);
          return `<button type="button" class="wk-reel${id ? '' : ' is-pronto'}" data-rev style="--d:${i * 90}ms" ${id ? `data-video="${esc(id)}"` : 'disabled'} aria-label="${esc(v.titulo)}${id ? '' : ` · ${T.videos.pronto}`}">
            ${id ? `<img src="https://i.ytimg.com/vi/${esc(id)}/hq720.jpg" alt="" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg'">` : '<span class="wk-reel__niebla" aria-hidden="true"></span>'}
            <span class="wk-reel__play" aria-hidden="true">${id ? '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>' : '<svg><use href="#i-chispa"/></svg>'}</span>
            <span class="wk-reel__pie"><small>${id ? '' : esc(T.videos.pronto)}</small><strong>${esc(v.titulo)}</strong></span>
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
          const fila = resenas.filter((_, i) => i % 2 === f);
          const cartas = fila.map(resena).join('');
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

  activarDeseo(app.querySelector('.wk-deseo'));
  activarPuertas();
  activarRecientes();
  activarVideos();
  activarResenas();
  activarPreguntas();
  revelar();
  if (duendes?.productCount) await activarDuendes(duendes);
}

// ---------------------------------------------------------------- puertas
async function activarPuertas() {
  for (const el of $$('[data-puerta]', app)) {
    // Tres piezas de la colección se abren en abanico al pasar por la puerta
    tienda.productos.listar({ categoria: el.dataset.puerta, porPagina: 3, soloDisponibles: true }).then(({ items }) => {
      el.querySelector('.wk-puerta__abanico').innerHTML = items.map((p, i) => `<span style="--n:${i}">${foto(p.image, p.title, 320) || sinFoto(p.title)}</span>`).join('');
    }).catch(() => {});
    if (!tactil) {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }
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
  // Primero los que buscan hogar
  const orden = [...items.filter((p) => p.available), ...items.filter((p) => !p.available)];
  pista.innerHTML = orden.map((p, i) => carta(p, i)).join('');
  const quedan = disponibles?.total ?? orden.filter((p) => p.available).length;
  contarHasta($('#contador-duendes'), quedan, T.duendes.contador);

  pista.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-agregar]')) return;
    const c = e.target.closest('.wk-carta');
    if (!c || pista.dataset.arrastro === '1') return;
    c.classList.toggle('is-girada');
    c.querySelector('.wk-carta__girar')?.setAttribute('aria-pressed', String(c.classList.contains('is-girada')));
  });
  arrastrable(pista);
  $$('[data-mover]', pista.parentElement).forEach((b) => b.addEventListener('click', () => {
    pista.scrollBy({ left: Number(b.dataset.mover) * pista.clientWidth * 0.8, behavior: reducido ? 'auto' : 'smooth' });
  }));

  // "Que un duende te elija": recorre las cartas como una ruleta y se detiene en uno
  $('#elegir-duende').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    const cartas = $$('.wk-carta:not(.is-hogar)', pista);
    if (!cartas.length || b.disabled) return;
    b.disabled = true;
    const etiqueta = b.querySelector('span');
    etiqueta.textContent = T.duendes.eligiendo;
    $$('.wk-carta', pista).forEach((c) => c.classList.remove('is-girada', 'is-elegida'));
    const final = Math.floor(Math.random() * cartas.length);
    const vueltas = reducido ? 0 : cartas.length * 2 + final;
    for (let i = 0; i <= vueltas; i++) {
      const c = cartas[i % cartas.length];
      cartas.forEach((x) => x.classList.toggle('is-ruleta', x === c));
      if (i % 2 === 0) c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      await espera(70 + Math.pow(i / Math.max(vueltas, 1), 3) * 380);
    }
    const elegida = cartas[final];
    cartas.forEach((x) => x.classList.remove('is-ruleta'));
    elegida.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    await espera(350);
    elegida.classList.add('is-elegida', 'is-girada');
    rafaga(elegida, 40);
    etiqueta.textContent = T.duendes.elegido(elegida.dataset.nombre);
    b.disabled = false;
    setTimeout(() => { etiqueta.textContent = T.duendes.elegir; }, 5000);
  });
}

function carta(p, i) {
  const nombre = p.title.replace(/^duende\s+(de(l)?\s+)?/i, '');
  return `
  <article class="wk-carta${p.available ? '' : ' is-hogar'}" data-nombre="${esc(p.title)}" style="--i:${i}">
    <div class="wk-carta__giro">
      <div class="wk-carta__cara wk-carta__cara--frente">
        <span class="wk-carta__foto">${foto(p.image, p.title, 640) || sinFoto(p.title)}</span>
        <span class="wk-carta__marco" aria-hidden="true"></span>
        <span class="wk-carta__num">Nº ${String(i + 1).padStart(2, '0')}</span>
        ${p.available ? '' : `<span class="wk-carta__sello">${esc(T.recientes.adoptada)}</span>`}
        <span class="wk-carta__nombre">${esc(nombre)}</span>
        <button type="button" class="wk-carta__girar" aria-pressed="false" aria-label="Dar vuelta la carta de ${esc(p.title)}"><svg aria-hidden="true"><use href="#i-girar"/></svg></button>
      </div>
      <div class="wk-carta__cara wk-carta__cara--dorso">
        <small>${esc(T.duendes.antetitulo)}</small>
        <h3>${esc(p.title)}</h3>
        <p>${esc(textoPlano(p.description, 110))}</p>
        ${precio(p)}
        ${p.available ? `<button type="button" class="wk-btn wk-btn--luz" data-agregar="${esc(p.handle)}">${esc(T.duendes.adoptar)}</button>` : `<p class="wk-carta__hogar">${esc(T.recientes.adoptada)}</p>`}
        <a href="/producto/${esc(p.handle)}" data-link class="wk-carta__link">${esc(T.duendes.conocer)} →</a>
      </div>
    </div>
  </article>`;
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
    criaturas: () => tienda.productos.listar({ categoria: categoria('criaturas').handle, porPagina: 8 }).then((r) => r.items),
    objetos: () => tienda.productos.listar({ categoria: categoria('objetos').handle, porPagina: 8 }).then((r) => r.items),
  };
  const mover = (b) => {
    pestanas.style.setProperty('--x', `${b.offsetLeft}px`);
    pestanas.style.setProperty('--w', `${b.offsetWidth}px`);
  };
  const mostrar = async (b) => {
    $$('[role=tab]', pestanas).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    mover(b);
    const k = b.dataset.pestana;
    lista.classList.add('is-cambiando');
    const [items] = await Promise.all([cache[k] ??= consulta[k]().catch(() => []), espera(reducido ? 0 : 220)]);
    lista.innerHTML = items.length ? items.map(tarjeta).join('') : `<p class="vacio">${esc(T.recientes.vacio)}</p>`;
    lista.classList.remove('is-cambiando');
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
  $('.wk-videos__pista').addEventListener('click', (e) => {
    const b = e.target.closest('[data-video]');
    if (!b) return;
    modal(`<div class="wk-video-marco"><iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0&playsinline=1" title="${esc(b.getAttribute('aria-label'))}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`, 'wk-modal--video');
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
