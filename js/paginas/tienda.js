// Tienda y colecciones: /tienda, /categoria/:handle (Bitácoras, Criaturas, Duendes Milarko… o una región de Walkurio).
// A la izquierda, la tarjeta de categorías (como en la tienda actual); en celular, una fila que se desliza.
import { tienda, T, $, $$, esc, app, estado, colecciones, regiones, esRegion, numeroRegion, tarjeta, fantasmas, cabecera, revelar, foto, sinFoto } from '../base.js';
import { categoriasClave, categoriasObjeto, categoriasOcultas } from '../config.js';
import { repintarFavoritos } from '../cuenta.js';

const escenaDe = (c) => {
  if (!c) return 'cielo';
  if (esRegion(c)) return 'region';
  if (categoriasObjeto.includes(c.handle)) return 'taller';
  if (c.handle === categoriasClave.duendes) return 'bosque';
  return 'bosque';
};
const miniaturas = new Map();

export async function catalogo(handle, buscarInicial = '') {
  const c = handle ? estado.categorias.find((x) => x.handle === handle) : null;
  if (handle && !c) throw new Error('404');
  document.title = `${c?.name ?? T.tienda.titulo} · ${estado.info.name}`;
  const region = esRegion(c);
  const cols = colecciones().filter((x) => x.productCount);
  const zonas = regiones().filter((x) => x.productCount);
  const item = (x, icono) => `<a class="wk-cats__item" href="${x ? `/categoria/${esc(x.handle)}` : '/tienda'}" data-link${(x?.handle ?? null) === (handle ?? null) ? ' aria-current="page"' : ''}${x ? ` data-mini="${esc(x.handle)}"` : ''}>
      <span class="wk-cats__mini">${icono ?? (x.image ? foto(x.image, x.name, 320) : sinFoto(x.name))}</span>
      <span>${esc(x?.name ?? T.categorias.todas)}</span>
    </a>`;

  app.innerHTML = `
    ${cabecera({
      ante: region ? `${esc(T.region.antetitulo)} · ${numeroRegion(c)}` : c ? esc(T.tienda.colecciones) : esc(estado.info.name),
      titulo: c?.name ?? T.tienda.titulo,
      bajada: c?.description || T.tienda.bajada,
      escena: escenaDe(c),
      extra: region ? `<a class="wk-btn wk-btn--vidrio wk-cabecera__boton" href="/walkurio#${esc(c.handle)}" data-link><svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(T.walkurio.verEnMapa)}</a>` : '',
    })}
    <section class="wk-seccion wk-seccion--catalogo"><span class="wk-ramas-fondo" data-esquinas="tl,br" data-semilla="21"></span><div class="contenedor wk-tienda">
      <aside class="wk-tienda__lado" data-rev>
        <nav class="wk-cats" aria-label="${esc(T.tienda.colecciones)}">
          <p class="wk-cats__titulo"><span aria-hidden="true"><svg><use href="#i-caja"/></svg></span>${esc(T.tienda.categorias)}</p>
          ${item(null, '<span class="wk-cats__todas" aria-hidden="true"><svg><use href="#i-chispa"/></svg></span>')}
          ${cols.map((x) => item(x)).join('')}
        </nav>
        ${zonas.length ? `<nav class="wk-cats wk-cats--regiones" aria-label="${esc(T.tienda.regiones)}">
          <p class="wk-cats__titulo"><span aria-hidden="true"><svg><use href="#i-planeta"/></svg></span>${esc(T.tienda.regiones)}</p>
          ${zonas.map((x) => `<a class="wk-cats__region" href="/categoria/${esc(x.handle)}" data-link${x.handle === handle ? ' aria-current="page"' : ''}><small>${numeroRegion(x)}</small>${esc(x.name)}</a>`).join('')}
        </nav>` : ''}
      </aside>
      <div class="wk-tienda__piezas">
        <div class="wk-filtros" data-rev>
          <label class="wk-buscar"><svg aria-hidden="true"><use href="#i-buscar"/></svg><input type="search" id="buscar" value="${esc(buscarInicial)}" placeholder="${esc(T.tienda.buscar)}" aria-label="${esc(T.tienda.buscar)}"></label>
          <label class="wk-orden"><span class="visually-hidden">Ordenar</span><select id="orden">${Object.entries(T.tienda.orden).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
        </div>
        <p class="wk-resultado" id="resultado" aria-live="polite"></p>
        <div class="grilla grilla--tienda" id="lista">${fantasmas(6)}</div>
        <div class="wk-mas"><button type="button" class="wk-btn wk-btn--linea" id="mas" hidden>${esc(T.tienda.mas)}</button></div>
      </div>
    </div></section>`;

  // Miniaturas: sin imagen de la colección, la foto de su primera pieza
  $$('[data-mini]').forEach(async (a) => {
    if (a.querySelector('img')) return;
    const h = a.dataset.mini;
    if (!miniaturas.has(h)) miniaturas.set(h, tienda.productos.listar({ categoria: h, porPagina: 1 }).then((r) => r.items[0]).catch(() => null));
    const p = await miniaturas.get(h);
    if (p?.image) a.querySelector('.wk-cats__mini').innerHTML = foto(p.image, p.title, 320);
  });

  const st = { pagina: 1, buscar: buscarInicial, orden: 'recientes' };
  const ocultas = new Set(categoriasOcultas);
  const cargar = async (sumar = false) => {
    const lista = $('#lista');
    if (!sumar) lista.classList.add('is-cambiando');
    const { items, pages, total } = await tienda.productos.listar({
      categoria: handle, buscar: st.buscar || undefined, orden: st.orden === 'recientes' ? undefined : st.orden, pagina: st.pagina, porPagina: 24,
    });
    if (!$('#lista')) return;
    // En "Todas las piezas" no aparecen cursos ni e-books
    const visibles = handle ? items : items.filter((p) => !(p.categories ?? []).some((x) => ocultas.has(typeof x === 'string' ? x : x?.handle)));
    const html = visibles.map(tarjeta).join('');
    if (sumar) lista.insertAdjacentHTML('beforeend', html);
    else lista.innerHTML = html || `<p class="vacio"><span class="wk-vacio__orbe" aria-hidden="true"></span>${esc(T.tienda.vacio)}</p>`;
    lista.classList.remove('is-cambiando');
    $('#resultado').textContent = st.buscar ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para «${st.buscar}»` : '';
    $('#mas').hidden = st.pagina >= pages;
    repintarFavoritos();
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
