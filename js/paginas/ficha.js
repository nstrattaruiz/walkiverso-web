// Ficha de producto: galería en relieve, certificado de origen y "Adoptar" con vuelo al carrito.
import { tienda, T, $, $$, esc, app, estado, regionDe, esDe, numeroRegion, foto, sinFoto, precio, tarjeta, revelar, agregar, hash } from '../base.js';

export async function ficha(handle) {
  const p = await tienda.productos.uno(handle);
  document.title = `${p.title} · ${estado.info.name}`;
  const r = regionDe(p);
  const esCriatura = esDe(p, 'criaturas') || esDe(p, 'duendes');
  const elegido = [...(p.variants.find((v) => v.available)?.options ?? p.variants[0].options)];
  const unica = p.variants.length === 1 && p.variants[0].stock === 1;
  const fotos = p.images?.length ? p.images : (p.image ? [p.image] : []);
  const numero = p.variants[0]?.sku || String(hash(p.handle) % 9000 + 1000);
  const textoBoton = esCriatura ? T.ficha.agregar : T.ficha.agregarObjeto;

  app.innerHTML = `
    <div class="wk-ficha-fondo" aria-hidden="true"></div>
    <div class="contenedor ficha">
      <nav class="ficha__migas" aria-label="Estás en"><a href="/tienda" data-link>${esc(T.tienda.titulo)}</a>${r ? `<span>/</span><a href="/categoria/${esc(r.handle)}" data-link>${esc(r.name)}</a>` : ''}<span>/</span><span aria-current="page">${esc(p.title)}</span></nav>
      <div class="ficha__galeria">
        <div class="ficha__principal" id="principal">
          <span class="ficha__aura" aria-hidden="true"></span>
          ${fotos.length ? foto(fotos[0], p.title, 1024, '', '(max-width: 900px) 100vw, 55vw') : sinFoto(p.title)}
          <span class="tarjeta__brillo" aria-hidden="true"></span>
        </div>
        ${fotos.length > 1 ? `<div class="ficha__miniaturas">${fotos.map((f, i) => `<button type="button" data-foto="${i}" aria-label="Ver foto ${i + 1}" aria-pressed="${i === 0}">${foto(f, p.title, 320)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="ficha__info">
        ${r ? `<a class="wk-sello" href="/categoria/${esc(r.handle)}" data-link><svg aria-hidden="true"><use href="#i-planeta"/></svg>${esc(r.name)}</a>` : ''}
        <h1>${esc(p.title)}</h1>
        <div class="ficha__precio" id="precio">${precio(p)}</div>
        ${unica ? `<p class="ficha__unica"><svg aria-hidden="true"><use href="#i-chispa"/></svg>${esc(T.ficha.unica)}</p>` : ''}
        ${p.options.map((o, i) => `
          <div class="opcion"><strong>${esc(o.name)}</strong>
            <div class="opcion__valores" data-opcion="${i}">${o.values.map((v) => `<button type="button" aria-pressed="${v === elegido[i]}" data-valor="${esc(v)}">${esc(v)}</button>`).join('')}</div>
          </div>`).join('')}
        <button class="wk-btn wk-btn--noche wk-btn--grande wk-btn--adoptar" id="agregar"><svg aria-hidden="true"><use href="#i-bag"/></svg><span>${esc(textoBoton)}</span></button>
        <p class="error" id="error" role="alert"></p>

        ${esCriatura || r ? `
        <div class="wk-certificado" data-rev>
          <span class="wk-certificado__sello" aria-hidden="true"><svg><use href="#i-chispa"/></svg></span>
          <p class="wk-certificado__titulo">${esc(T.ficha.certificado)}</p>
          <dl>
            <div><dt>Nombre</dt><dd>${esc(p.title)}</dd></div>
            ${r ? `<div><dt>${esc(T.ficha.origen)}</dt><dd>${esc(r.name)} · ${numeroRegion(r)}</dd></div>` : ''}
            <div><dt>${esc(T.ficha.pieza)}</dt><dd>${esc(numero)}</dd></div>
          </dl>
          <p class="wk-certificado__pie">${esc(T.ficha.hecho)}</p>
        </div>` : ''}

        <div class="descripcion">${p.description ?? ''}</div>
      </div>
    </div>
    <div class="wk-barra-compra" id="barra-compra" aria-hidden="true">
      <span class="wk-barra-compra__foto">${fotos.length ? foto(fotos[0], '', 320) : sinFoto(p.title)}</span>
      <span class="wk-barra-compra__nombre"><strong>${esc(p.title)}</strong><span id="barra-precio">${precio(p)}</span></span>
      <button type="button" class="wk-btn wk-btn--luz" id="agregar-barra" tabindex="-1">${esc(textoBoton)}</button>
    </div>
    <section class="wk-seccion" id="vecinos" hidden><div class="contenedor">
      <div class="wk-titulo"><div><p class="wk-antetitulo">${r ? esc(r.name) : ''}</p><h2>${esc(T.ficha.relacionados)}</h2></div></div>
      <div class="grilla" id="vecinos-lista"></div>
    </div></section>`;

  const variante = () => p.variants.find((v) => v.options.every((x, i) => x === elegido[i])) ?? null;
  const actualizar = () => {
    const v = variante();
    const b = $('#agregar');
    b.disabled = !v?.available;
    $('#agregar-barra').disabled = !v?.available;
    b.querySelector('span').textContent = !v ? T.ficha.elegir : v.available ? textoBoton : T.ficha.agotado;
    if (v) {
      const html = precio({ ...p, price: v.price, compareAtPrice: v.compareAtPrice });
      $('#precio').innerHTML = html; $('#barra-precio').innerHTML = html;
    }
  };
  $$('[data-opcion]', app).forEach((grupo) => grupo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-valor]');
    if (!b) return;
    elegido[Number(grupo.dataset.opcion)] = b.dataset.valor;
    grupo.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    actualizar();
  }));
  $('.ficha__miniaturas')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-foto]');
    if (!b) return;
    const img = $('#principal img');
    const f = fotos[Number(b.dataset.foto)];
    img.animate([{ opacity: 0.2, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
    img.src = f.sizes?.['1024'] ?? f.url;
    img.srcset = f.sizes ? Object.entries(f.sizes).map(([w, u]) => `${u} ${w}w`).join(', ') : '';
    $$('.ficha__miniaturas button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });
  const comprar = async (b) => {
    $('#error').textContent = '';
    b.classList.add('is-cargando');
    try { await agregar(variante().id, b, $('#principal')); } catch (err) { $('#error').textContent = err.message; }
    b.classList.remove('is-cargando');
  };
  $('#agregar').addEventListener('click', (e) => comprar(e.currentTarget));
  $('#agregar-barra').addEventListener('click', (e) => comprar(e.currentTarget));
  actualizar();

  // Barra de compra fija cuando el botón principal sale de la pantalla
  const barra = $('#barra-compra');
  new IntersectionObserver(([en]) => {
    const ver = !en.isIntersecting && en.boundingClientRect.top < 0;
    barra.classList.toggle('is-visible', ver);
    barra.setAttribute('aria-hidden', String(!ver));
    $('#agregar-barra').tabIndex = ver ? 0 : -1;
  }).observe($('#agregar'));

  revelar();
  if (r) {
    const { items } = await tienda.productos.listar({ categoria: r.handle, porPagina: 5 }).catch(() => ({ items: [] }));
    const otros = items.filter((x) => x.handle !== p.handle).slice(0, 4);
    if (otros.length && $('#vecinos')) { $('#vecinos-lista').innerHTML = otros.map(tarjeta).join(''); $('#vecinos').hidden = false; revelar(); }
  }
}
