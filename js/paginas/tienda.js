// Tienda y colecciones (catálogo de PULSO): /tienda, /categoria/:handle (Bitácoras, Criaturas, Duendes Milarko… o una región de Walkurio).
// A la izquierda, filtros fijos (colecciones, regiones y el planeta); arriba, buscador + orden; en celular, colecciones en una fila de chips.
import { tienda, T, $, esc, app, estado, colecciones, regiones, esRegion, numeroRegion, tarjeta, fantasmas, cabecera, revelar, icono, flecha } from '../base.js';
import { categoriasOcultas } from '../config.js';
import { repintarFavoritos } from '../cuenta.js';

export async function catalogo(handle, buscarInicial = '') {
  const c = handle ? estado.categorias.find((x) => x.handle === handle) : null;
  if (handle && !c) throw new Error('404');
  document.title = `${c?.name ?? T.tienda.titulo} · ${estado.info.name}`;
  const region = esRegion(c);
  const cols = colecciones().filter((x) => x.productCount);
  const zonas = regiones().filter((x) => x.productCount);
  const filtro = (x, ic) => `<a href="${x ? `/categoria/${esc(x.handle)}` : '/tienda'}" data-link class="${(x?.handle ?? null) === (handle ?? null) ? 'is-on' : ''}"${(x?.handle ?? null) === (handle ?? null) ? ' aria-current="page"' : ''}>${icono(ic)}${esc(x?.name ?? T.categorias.todas)}${x ? `<span>${x.productCount}</span>` : ''}</a>`;
  const chip = (x) => `<a class="wv-chip${(x?.handle ?? null) === (handle ?? null) ? ' is-on' : ''}" href="${x ? `/categoria/${esc(x.handle)}` : '/tienda'}" data-link>${esc(x?.name ?? T.tienda.todo)}${x ? `<span>${x.productCount}</span>` : ''}</a>`;

  app.innerHTML = `
    ${cabecera({
      ante: region ? `${esc(T.region.antetitulo)} · ${numeroRegion(c)}` : c ? esc(T.tienda.colecciones) : esc(estado.info.name),
      titulo: c?.name ?? T.tienda.titulo,
      bajada: c?.description || T.tienda.bajada,
      extra: `${region ? `<div class="wv-page-head__ctas"><a class="wv-btn wv-btn--ghost" href="/walkurio" data-link>${icono('i-planeta')}${esc(T.walkurio.verEnMapa)}</a></div>` : ''}
        <nav class="wv-catalog__cats-mobile" aria-label="${esc(T.tienda.colecciones)}"><div class="wv-chips">${chip(null)}${cols.map(chip).join('')}${zonas.map(chip).join('')}</div></nav>`,
    }).replace('wv-page-head"', 'wv-page-head wv-page-head--catalog"')}
    <div class="wv-container wv-catalog">
      <aside class="wv-catalog__side" aria-label="Filtros">
        <nav class="wv-filter" aria-label="${esc(T.tienda.colecciones)}">
          <p class="wv-filter__title">${esc(T.tienda.colecciones)}</p>
          <div class="wv-filter__cats">${filtro(null, 'i-chispa')}${cols.map((x) => filtro(x, 'i-criatura')).join('')}</div>
        </nav>
        ${zonas.length ? `
        <nav class="wv-filter" aria-label="${esc(T.tienda.regiones)}">
          <p class="wv-filter__title">${esc(T.tienda.regiones)}</p>
          <div class="wv-filter__cats">${zonas.map((x) => filtro(x, 'i-pin').replace(`${icono('i-pin')}`, `${icono('i-pin')}<small>${numeroRegion(x)}</small> `)).join('')}</div>
        </nav>` : ''}
        <a class="wv-filter__promo" href="/walkurio" data-link>
          <i class="wk-mano" aria-hidden="true"></i>
          <strong>${esc(T.walkurio.titulo)}</strong>
          <p>${esc(T.hero.planeta)}</p>
          <span class="wv-btn wv-btn--luz wv-btn--sm">${esc(T.walkurio.boton)}${flecha()}</span>
        </a>
      </aside>
      <div class="wv-catalog__main">
        <div class="wv-toolbar">
          <label class="wv-toolbar__search">${icono('i-buscar')}<input type="search" id="buscar" value="${esc(buscarInicial)}" placeholder="${esc(T.tienda.buscar)}" aria-label="${esc(T.tienda.buscar)}"></label>
          <label class="wv-select"><span class="visually-hidden">Ordenar</span><select id="orden">${Object.entries(T.tienda.orden).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>${icono('i-abajo')}</label>
        </div>
        <div class="wv-toolbar__meta"><p id="resultado" aria-live="polite"></p><div class="wv-chips" id="activos"></div></div>
        <div class="wv-grid wv-grid--3" id="lista">${fantasmas(6)}</div>
        <div class="wv-catalog__mas"><button type="button" class="wv-btn wv-btn--ghost wv-btn--lg" id="mas" hidden>${esc(T.tienda.mas)}</button></div>
      </div>
    </div>`;

  const st = { pagina: 1, buscar: buscarInicial, orden: 'recientes' };
  const ocultas = new Set(categoriasOcultas);
  const sinOcultas = estado.categorias.filter((x) => ocultas.has(x.handle)).reduce((n, x) => n + x.productCount, 0);
  const cargar = async (sumar = false) => {
    const lista = $('#lista');
    if (!sumar) lista.style.opacity = '.35';
    const { items, pages, total } = await tienda.productos.listar({
      categoria: handle, buscar: st.buscar || undefined, orden: st.orden === 'recientes' ? undefined : st.orden, pagina: st.pagina, porPagina: 24,
    });
    if (!$('#lista')) return;
    // En "Todas las piezas" no aparecen cursos ni e-books
    const visibles = handle ? items : items.filter((p) => !(p.categories ?? []).some((x) => ocultas.has(typeof x === 'string' ? x : x?.handle)));
    const html = visibles.map(tarjeta).join('');
    if (sumar) lista.insertAdjacentHTML('beforeend', html);
    else lista.innerHTML = html || `<div class="wv-empty" style="grid-column:1/-1"><i class="wk-mano wk-mano--vacio" aria-hidden="true"></i><h3>${esc(T.tienda.vacio)}</h3><p>Probá con otra palabra o explorá otra colección.</p><a class="wv-btn wv-btn--primary" href="/tienda" data-link>${esc(T.categorias.todas)}${flecha()}</a></div>`;
    lista.style.opacity = '';
    const n = handle || st.buscar ? total : Math.max(0, total - sinOcultas);
    $('#resultado').textContent = st.buscar ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para «${st.buscar}»` : `${n} ${n === 1 ? 'pieza' : 'piezas'}`;
    $('#activos').innerHTML = st.buscar ? `<button type="button" class="wv-chip is-on" id="limpiar">${esc(st.buscar)} ${icono('i-cerrar')}</button>` : '';
    $('#mas').hidden = st.pagina >= pages;
    repintarFavoritos();
    revelar();
  };
  let demora;
  $('#buscar').addEventListener('input', (e) => {
    clearTimeout(demora);
    demora = setTimeout(() => { st.buscar = e.target.value.trim(); st.pagina = 1; cargar(); }, 280);
  });
  $('#activos').addEventListener('click', (e) => {
    if (!e.target.closest('#limpiar')) return;
    $('#buscar').value = ''; st.buscar = ''; st.pagina = 1; cargar();
  });
  $('#orden').addEventListener('change', (e) => { st.orden = e.target.value; st.pagina = 1; cargar(); });
  $('#mas').addEventListener('click', () => { st.pagina++; cargar(true); });
  revelar();
  await cargar();
}
