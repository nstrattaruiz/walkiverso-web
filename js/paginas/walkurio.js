// Walkurio: el planeta como mapa (puntos = regiones) + guía de regiones debajo.
import { tienda, T, $, $$, esc, app, estado, regiones, numeroRegion, foto, sinFoto, precio, revelar, reducido } from '../base.js';

/** Tarjeta de la región elegida sobre el planeta. */
export async function mostrarRegion(r, alCerrar) {
  const el = $('#region');
  el.hidden = false;
  el.innerHTML = `
    <button type="button" class="wk-region__cerrar" aria-label="Cerrar"><svg aria-hidden="true"><use href="#i-cerrar"/></svg></button>
    <p class="wk-antetitulo">${esc(T.region.antetitulo)} · ${numeroRegion(r)}</p>
    <h2>${esc(r.name)}</h2>
    ${r.description ? `<p class="wk-region__texto">${esc(r.description)}</p>` : ''}
    <div class="wk-region__habitantes" id="region-habitantes"><span class="wk-cargando"></span></div>
    <a class="wv-btn wv-btn--luz" href="/categoria/${esc(r.handle)}" data-link>${esc(T.region.explorar)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></a>`;
  requestAnimationFrame(() => el.classList.add('is-abierta'));
  $('#mundo').classList.add('con-region');
  el.querySelector('.wk-region__cerrar').addEventListener('click', () => { cerrarRegion(); alCerrar?.(); });
  const { items } = await tienda.productos.listar({ categoria: r.handle, porPagina: 3, soloDisponibles: true }).catch(() => ({ items: [] }));
  const lista = $('#region-habitantes');
  if (!lista) return;
  lista.innerHTML = items.length ? items.map((p) => `
    <a href="/producto/${esc(p.handle)}" data-link class="wk-mini">
      <span class="wk-mini__foto">${foto(p.image, p.title, 320) || sinFoto(p.title)}</span>
      <span><strong>${esc(p.title)}</strong>${precio(p)}</span>
    </a>`).join('') : `<p class="wk-region__vacia">${esc(T.region.vacia)}</p>`;
}
export function cerrarRegion() {
  const el = $('#region');
  el.classList.remove('is-abierta');
  $('#mundo').classList.remove('con-region');
  setTimeout(() => { if (!el.classList.contains('is-abierta')) el.hidden = true; }, 400);
}

export async function walkurio(mundo) {
  document.title = `${T.walkurio.titulo} · ${estado.info.name}`;
  const zonas = regiones();
  app.innerHTML = `
    <section class="wk-seccion wk-guia" id="guia">
      <div class="contenedor">
        <div class="wk-titulo wk-titulo--centro" data-rev><p class="wk-antetitulo">${esc(T.walkurio.antetitulo)}</p><h2>${esc(T.walkurio.guia)}</h2><p>${esc(T.walkurio.guiaBajada)}</p></div>
        <ol class="wk-guia__lista">
          ${zonas.map((c, i) => `
            <li data-rev style="--d:${(i % 3) * 80}ms">
              <button type="button" class="wk-reg" data-region="${i}" data-tono="${i % 3}">
                <span class="wk-reg__foto">${c.image ? foto(c.image, c.name, 320) : '<span class="wk-reg__orbe" aria-hidden="true"></span>'}</span>
                <span class="wk-reg__num">${numeroRegion(c)}</span>
                <span class="wk-reg__info"><strong>${esc(c.name)}</strong>${c.description ? `<span>${esc(c.description)}</span>` : ''}<small>${esc(T.categorias.piezas(c.productCount))} · ${esc(T.walkurio.verEnMapa)}</small></span>
                <svg class="wk-reg__flecha" aria-hidden="true"><use href="#i-planeta"/></svg>
              </button>
            </li>`).join('')}
        </ol>
      </div>
    </section>`;
  app.querySelector('.wk-guia__lista').addEventListener('click', (e) => {
    const b = e.target.closest('[data-region]');
    if (!b) return;
    window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
    setTimeout(() => mundo?.enfocar(Number(b.dataset.region)), reducido ? 0 : 500);
  });
  revelar();
  // /walkurio#solantera abre directo esa región
  const h = decodeURIComponent(location.hash.slice(1));
  const i = zonas.findIndex((c) => c.handle === h);
  if (i >= 0) setTimeout(() => mundo?.enfocar(i), 900);
}
