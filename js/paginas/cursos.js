// Cursos: la escuela del taller. Cada curso es un libro antiguo que flota en el bosque y se abre cuando llega a la vista:
// la tapa de cuero gira sobre el lomo y aparecen dos páginas de pergamino (presentación · índice, precio e inscripción).
import { tienda, T, $, $$, esc, app, estado, categoria, foto, sinFoto, textoPlano, revelar, flecha, romano } from '../base.js';
import { rafaga } from '../polvo.js';

export async function cursos() {
  document.title = `${T.cursos.titulo} · ${estado.info.name}`;
  const c = categoria('cursos');
  app.innerHTML = `
    <section class="wv-escuela">
      <header class="wv-escuela__cab">
        <p class="wv-cap__ante" data-rev>${esc(T.cursos.antetitulo)}</p>
        <h1 class="wv-cap__titulo" data-rev style="--d:80ms">${esc(T.cursos.titulo2 ?? 'La escuela del taller')}</h1>
        <p class="wv-cap__bajada" data-rev style="--d:160ms">${esc(c?.description || T.cursos.bajada)}</p>
      </header>
      <div class="wv-escuela__libros" id="cursos"><span class="wk-cargando"></span></div>
    </section>`;
  const { items } = c ? await tienda.productos.listar({ categoria: c.handle, porPagina: 24 }) : { items: [] };
  if (!$('#cursos')) return;
  $('#cursos').innerHTML = `${items.map((p, i) => libro(p, i)).join('')}
    <article class="wv-libro wv-libro--pronto" data-rev>
      <div class="wv-libro__cerrado" aria-hidden="true"><span class="wv-libro__cerradura"></span></div>
      <p>${esc(T.cursos.pronto)}</p>
    </article>`;
  // El libro se abre cuando entra a la vista (una vez)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.add('is-abierto');
    setTimeout(() => rafaga(e.target.querySelector('.wv-libro__lomo') ?? e.target, 26), 900);
  }), { threshold: 0.35 });
  $$('.wv-libro:not(.wv-libro--pronto)').forEach((l) => io.observe(l));
  revelar();
}

function libro(p, i) {
  // El texto del producto puede traer una línea de datos ("3 módulos · 6 clases · Acceso para siempre")
  const lineas = String(p.description ?? '').split(/<\/p>/).map((l) => textoPlano(l, 400)).filter(Boolean);
  const meta = lineas.find((l) => l.includes('·') && l.length < 90) ?? '';
  const texto = lineas.find((l) => l !== meta) ?? '';
  const indice = meta ? meta.split('·').map((m) => m.trim()).filter(Boolean) : ['Paso a paso', 'A tu ritmo', 'Desde tu casa'];
  return `
    <article class="wv-libro" data-rev style="--d:${i * 100}ms">
      <div class="wv-libro__escena">
        <span class="wv-libro__aura" aria-hidden="true"></span>
        <div class="wv-libro__abierto">
          <div class="wv-libro__pagina wv-libro__pagina--izq">
            <span class="wv-libro__foto">${foto(p.image, p.title, 640) || sinFoto(p.title)}</span>
            <p class="wv-libro__ante">${i === 0 ? 'Nuevo · ' : ''}Curso del taller</p>
            <h2 class="wv-libro__titulo">${esc(p.title)}</h2>
            ${texto ? `<p class="wv-libro__texto">${esc(texto)}</p>` : ''}
            <span class="wv-libro__folio">${romano(i * 2)}</span>
          </div>
          <span class="wv-libro__lomo" aria-hidden="true"></span>
          <div class="wv-libro__pagina wv-libro__pagina--der">
            <p class="wv-libro__indice-tit">Índice</p>
            <ol class="wv-libro__indice">${indice.map((m, k) => `<li><span>${romano(k)}</span>${esc(m)}</li>`).join('')}</ol>
            <div class="wv-libro__precio">
              <span>Inscripción</span>
              <strong>${tienda.formatear(p.price, p.currency)}</strong>
            </div>
            <div class="wv-libro__acciones">
              ${p.available ? `<button type="button" class="wv-btn wv-btn--tinta" data-agregar="${esc(p.handle)}">Inscribirme${flecha()}</button>` : ''}
              <a class="wv-libro__ver" href="/producto/${esc(p.handle)}" data-link>${esc(T.cursos.ver)} →</a>
            </div>
            <span class="wv-libro__folio">${romano(i * 2 + 1)}</span>
          </div>
          <div class="wv-libro__tapa" aria-hidden="true">
            <span class="wv-libro__tapa-marco"></span>
            <span class="wv-libro__tapa-titulo">${esc(p.title)}</span>
            <span class="wv-libro__tapa-adorno"></span>
          </div>
        </div>
      </div>
    </article>`;
}
