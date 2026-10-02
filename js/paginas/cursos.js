// Cursos: productos de la categoría "cursos" como libros de hechizos que se abren.
import { tienda, T, $, esc, app, estado, categoria, foto, sinFoto, precio, textoPlano, cabecera, revelar } from '../base.js';

export async function cursos() {
  document.title = `${T.cursos.titulo} · ${estado.info.name}`;
  const c = categoria('cursos');
  app.innerHTML = `
    ${cabecera({ ante: esc(T.cursos.antetitulo), titulo: T.cursos.titulo, bajada: c?.description || T.cursos.bajada, escena: 'taller' })}
    <section class="wk-seccion"><div class="contenedor"><div class="wk-cursos" id="cursos"><span class="wk-cargando wk-cargando--oscuro"></span></div></div></section>`;
  const { items } = c ? await tienda.productos.listar({ categoria: c.handle, porPagina: 24 }) : { items: [] };
  $('#cursos').innerHTML = `${items.map((p, i) => {
    // El texto del producto puede traer una línea de datos ("3 módulos · 6 clases · …")
    const lineas = String(p.description ?? '').split(/<\/p>/).map((l) => textoPlano(l, 400)).filter(Boolean);
    const meta = lineas.find((l) => l.includes('·') && l.length < 90) ?? '';
    const texto = lineas.find((l) => l !== meta) ?? '';
    return `
    <a class="wk-curso" href="/producto/${esc(p.handle)}" data-link data-rev style="--d:${i * 100}ms">
      <span class="wk-curso__libro" aria-hidden="true">
        <span class="wk-curso__tapa">${foto(p.image, p.title, 640) || sinFoto(p.title)}</span>
        <span class="wk-curso__hojas"></span>
      </span>
      <span class="wk-curso__info">
        ${i === 0 ? '<span class="wk-curso__badge">Nuevo</span>' : ''}
        <strong>${esc(p.title)}</strong>
        ${texto ? `<span class="wk-curso__texto">${esc(texto)}</span>` : ''}
        ${meta ? `<span class="wk-curso__meta">${esc(meta)}</span>` : ''}
        <span class="wk-curso__pie">${precio(p)}<span class="wk-btn wk-btn--noche">${esc(T.cursos.ver)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></span></span>
      </span>
    </a>`;
  }).join('')}
    <div class="wk-curso wk-curso--pronto" data-rev><span class="wk-curso__libro" aria-hidden="true"><span class="wk-curso__tapa"><span class="wk-sinfoto" data-tono="1"><svg><use href="#i-chispa"/></svg></span></span></span><span class="wk-curso__info"><strong>${esc(T.cursos.pronto)}</strong></span></div>`;
  revelar();
}
