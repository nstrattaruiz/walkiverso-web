// Cursos: cada curso es un grimorio en la noche del taller. El libro flota, se abre al pasar y sus hojas brillan.
import { tienda, T, $, esc, app, estado, categoria, foto, sinFoto, precio, textoPlano, cabecera, revelar } from '../base.js';

export async function cursos() {
  document.title = `${T.cursos.titulo} · ${estado.info.name}`;
  const c = categoria('cursos');
  app.innerHTML = `
    ${cabecera({ ante: esc(T.cursos.antetitulo), titulo: T.cursos.titulo, bajada: c?.description || T.cursos.bajada, escena: 'taller' })}
    <section class="wk-cursos-sec">
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tr,bl" data-semilla="91"></span>
      <div class="contenedor"><div class="wk-cursos" id="cursos"><span class="wk-cargando"></span></div></div>
    </section>`;
  const { items } = c ? await tienda.productos.listar({ categoria: c.handle, porPagina: 24 }) : { items: [] };
  if (!$('#cursos')) return;
  $('#cursos').innerHTML = `${items.map((p, i) => {
    // El texto del producto puede traer una línea de datos ("3 módulos · 6 clases · Acceso para siempre")
    const lineas = String(p.description ?? '').split(/<\/p>/).map((l) => textoPlano(l, 400)).filter(Boolean);
    const meta = lineas.find((l) => l.includes('·') && l.length < 90) ?? '';
    const texto = lineas.find((l) => l !== meta) ?? '';
    return `
    <a class="wk-grimorio" href="/producto/${esc(p.handle)}" data-link data-rev style="--d:${i * 100}ms">
      <span class="wk-grimorio__escena" aria-hidden="true">
        <span class="wk-grimorio__luz"></span>
        <span class="wk-grimorio__libro">
          <span class="wk-grimorio__hojas"><i></i><i></i><i></i></span>
          <span class="wk-grimorio__tapa">${foto(p.image, p.title, 640) || sinFoto(p.title)}<span class="wk-grimorio__lomo"></span></span>
        </span>
        <span class="wk-grimorio__polvo"><i></i><i></i><i></i><i></i><i></i><i></i></span>
      </span>
      <span class="wk-grimorio__info">
        ${i === 0 ? `<span class="wk-grimorio__sello"><i class="wk-mano"></i>Nuevo</span>` : ''}
        <strong>${esc(p.title)}</strong>
        ${texto ? `<span class="wk-grimorio__texto">${esc(texto)}</span>` : ''}
        ${meta ? `<span class="wk-grimorio__meta">${meta.split('·').map((m) => `<em>${esc(m.trim())}</em>`).join('')}</span>` : ''}
        <span class="wk-grimorio__pie">${precio(p)}<span class="wk-btn wk-btn--luz">${esc(T.cursos.ver)}<svg aria-hidden="true"><use href="#i-flecha"/></svg></span></span>
      </span>
    </a>`;
  }).join('')}
    <div class="wk-grimorio wk-grimorio--pronto" data-rev><i class="wk-mano" aria-hidden="true"></i><strong>${esc(T.cursos.pronto)}</strong></div>`;
  revelar();
}
