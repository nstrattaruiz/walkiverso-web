// Tienda y colecciones: /tienda, /categoria/:handle (criaturas, objetos, duendes o una región de Walkurio).
import { tienda, T, $, $$, esc, app, estado, categoria, regiones, esRegion, numeroRegion, tarjeta, fantasmas, cabecera, revelar } from '../base.js';
import { categoriasClave, categoriasOcultas } from '../config.js';

const escenaDe = (c) => {
  if (!c) return 'cielo';
  if (c.handle === categoriasClave.criaturas) return 'bosque';
  if (c.handle === categoriasClave.objetos) return 'taller';
  if (c.handle === categoriasClave.duendes) return 'bosque';
  if (esRegion(c)) return 'region';
  return 'cielo';
};

export async function catalogo(handle, buscarInicial = '') {
  const c = handle ? estado.categorias.find((x) => x.handle === handle) : null;
  if (handle && !c) throw new Error('404');
  document.title = `${c?.name ?? T.tienda.titulo} · ${estado.info.name}`;
  const region = esRegion(c);
  const colecciones = ['criaturas', 'objetos', 'duendes'].map(categoria).filter((x) => x?.productCount);
  const zonas = regiones().filter((x) => x.productCount);
  const chip = (x) => `<a href="/categoria/${esc(x.handle)}" data-link${x.handle === handle ? ' aria-current="page"' : ''}>${esc(x.name)}<small>${x.productCount}</small></a>`;

  app.innerHTML = `
    ${cabecera({
      ante: region ? `${esc(T.region.antetitulo)} · ${numeroRegion(c)}` : c ? esc(T.tienda.colecciones) : esc(estado.info.name),
      titulo: c?.name ?? T.tienda.titulo,
      bajada: c?.description || T.tienda.bajada,
      escena: escenaDe(c),
      extra: region ? `<a class="wk-btn wk-btn--vidrio wk-cabecera__boton" href="/walkurio#${esc(c.handle)}" data-link><svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(T.walkurio.verEnMapa)}</a>` : '',
    })}
    <section class="wk-seccion wk-seccion--catalogo"><div class="contenedor">
      <div class="wk-filtros" data-rev>
        <div class="wk-filtros__grupos">
          <nav class="chips" aria-label="${esc(T.tienda.colecciones)}">
            <a href="/tienda" data-link${!handle ? ' aria-current="page"' : ''}>${esc(T.tienda.todo)}</a>
            ${colecciones.map(chip).join('')}
          </nav>
          ${zonas.length ? `<nav class="chips chips--regiones" aria-label="${esc(T.tienda.regiones)}"><span class="chips__etiqueta"><svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(T.tienda.regiones)}</span>${zonas.map(chip).join('')}</nav>` : ''}
        </div>
        <div class="wk-filtros__der">
          <label class="wk-buscar"><svg aria-hidden="true"><use href="#i-buscar"/></svg><input type="search" id="buscar" value="${esc(buscarInicial)}" placeholder="${esc(T.tienda.buscar)}" aria-label="${esc(T.tienda.buscar)}"></label>
          <label class="wk-orden"><span class="visually-hidden">Ordenar</span><select id="orden">${Object.entries(T.tienda.orden).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
        </div>
      </div>
      <p class="wk-resultado" id="resultado" aria-live="polite"></p>
      <div class="grilla" id="lista">${fantasmas(8)}</div>
      <div class="wk-mas"><button type="button" class="wk-btn wk-btn--linea" id="mas" hidden>${esc(T.tienda.mas)}</button></div>
    </div></section>`;

  const st = { pagina: 1, buscar: buscarInicial, orden: 'recientes' };
  const ocultas = new Set(categoriasOcultas);
  const cargar = async (sumar = false) => {
    const lista = $('#lista');
    if (!sumar) lista.classList.add('is-cambiando');
    const { items, pages, total } = await tienda.productos.listar({
      categoria: handle, buscar: st.buscar || undefined, orden: st.orden === 'recientes' ? undefined : st.orden, pagina: st.pagina, porPagina: 24,
    });
    if (!$('#lista')) return;
    // En "Todo" no se muestran las piezas de categorías ocultas (ej.: e-books de Walkiver)
    const visibles = handle ? items : items.filter((p) => !(p.categories ?? []).some((x) => ocultas.has(typeof x === 'string' ? x : x?.handle)));
    const html = visibles.map(tarjeta).join('');
    if (sumar) lista.insertAdjacentHTML('beforeend', html);
    else lista.innerHTML = html || `<p class="vacio"><span class="wk-vacio__orbe" aria-hidden="true"></span>${esc(T.tienda.vacio)}</p>`;
    lista.classList.remove('is-cambiando');
    $('#resultado').textContent = st.buscar ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para «${st.buscar}»` : '';
    $('#mas').hidden = st.pagina >= pages;
    revelar();
  };
  let espera;
  $('#buscar').addEventListener('input', (e) => {
    clearTimeout(espera);
    espera = setTimeout(() => { st.buscar = e.target.value.trim(); st.pagina = 1; cargar(); }, 280);
  });
  $('#orden').addEventListener('change', (e) => { st.orden = e.target.value; st.pagina = 1; cargar(); });
  $('#mas').addEventListener('click', () => { st.pagina++; cargar(true); });
  revelar();
  await cargar();
}
