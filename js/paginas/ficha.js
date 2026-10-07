// Ficha de producto (PDP de PULSO): galería con miniaturas a la izquierda, caja de precio con "Pieza única",
// datos de origen, compra con vuelo al carrito, beneficios, tres bloques (descripción, certificado, región) y vecinos.
import { tienda, T, $, $$, esc, app, estado, regionDe, coleccionDe, esObjeto, textoAgregar, esUnica, botonFavorito, numeroRegion, foto, sinFoto, precioBloque, insignias, tarjeta, revelar, agregar, hash, icono, flecha, textoPlano } from '../base.js';

export async function ficha(handle) {
  const p = await tienda.productos.uno(handle);
  document.title = `${p.title} · ${estado.info.name}`;
  const r = regionDe(p);
  const col = coleccionDe(p);
  const esCriatura = !esObjeto(p);
  const elegido = [...(p.variants.find((v) => v.available)?.options ?? p.variants[0].options)];
  const unica = esUnica(p);
  const fotos = p.images?.length ? p.images : (p.image ? [p.image] : []);
  const numero = p.variants[0]?.sku || String(hash(p.handle) % 9000 + 1000);
  const textoBoton = textoAgregar(p);
  const corto = textoPlano(p.description, 180);

  app.innerHTML = `
    <section class="wv-pdp">
      <div class="wv-container">
        <ol class="wv-crumbs" aria-label="Estás en">
          <li><a href="/" data-link>Inicio</a></li>
          <li><a href="/tienda" data-link>${esc(T.tienda.titulo)}</a></li>
          ${col ? `<li><a href="/categoria/${esc(col.handle)}" data-link>${esc(col.name)}</a></li>` : ''}
          <li aria-current="page">${esc(p.title)}</li>
        </ol>
        <div class="wv-pdp__grid">
          <div class="wv-gallery${fotos.length > 1 ? '' : ' wv-gallery--sola'}">
            <div class="wv-gallery__main" id="principal">
              ${fotos.length ? foto(fotos[0], p.title, 1024, '', '(max-width: 1099px) 100vw, 55vw') : sinFoto(p.title)}
              <span class="wv-card__luz" aria-hidden="true"></span>
              <div class="wv-card__badges">${insignias(p)}</div>
            </div>
            ${fotos.length > 1 ? `<div class="wv-gallery__thumbs">${fotos.slice(0, 5).map((f, i) => `<button type="button" class="wv-gallery__thumb${i === 0 ? ' is-on' : ''}" data-foto="${i}" aria-label="Ver foto ${i + 1}" aria-pressed="${i === 0}">${foto(f, p.title, 320)}</button>`).join('')}</div>` : ''}
          </div>

          <div class="wv-pdp__info">
            <div class="wv-pdp__cat">
              ${col ? `<a class="wv-badge wv-badge--light" href="/categoria/${esc(col.handle)}" data-link>${esc(col.name)}</a>` : ''}
              ${r ? `<a class="wv-badge wv-badge--pantano" href="/categoria/${esc(r.handle)}" data-link>${icono('i-pin')}${esc(r.name)}</a>` : ''}
            </div>
            <h1 class="wv-pdp__title">${esc(p.title)}</h1>
            ${corto ? `<p class="wv-pdp__short">${esc(corto)}</p>` : ''}

            <div class="wv-pdp__price">
              <div id="precio">${precioBloque(p, unica ? T.ficha.unica : 'Precio')}</div>
              ${unica
                ? `<div class="wv-pdp__unique"><span>${esc(T.ficha.pieza)}</span><strong>${esc(numero)}</strong><small>1 de 1 · no se repite</small></div>`
                : `<div class="wv-pdp__unique wv-pdp__unique--luz"><span>Hecha a mano</span><strong>${p.available ? 'Disponible' : 'Adoptada'}</strong><small>${esc(T.ficha.hecho)}</small></div>`}
            </div>

            <dl class="wv-pdp__facts">
              <div><dt>${esc(T.ficha.origen)}</dt><dd>${r ? `<a href="/categoria/${esc(r.handle)}" data-link>${esc(r.name)}</a> · ${numeroRegion(r)}` : 'Walkiverso'}</dd></div>
              <div><dt>Disponibilidad</dt><dd id="disponible">${p.available ? (unica ? 'Última y única' : 'Disponible') : esc(T.ficha.agotado)}</dd></div>
            </dl>

            ${p.options.length && p.variants.length > 1 ? p.options.map((o, i) => `
              <div class="wv-pdp__variants"><p class="wv-filter__title">${esc(o.name)}</p>
                <div class="wv-chips" data-opcion="${i}">${o.values.map((v) => `<button type="button" class="wv-chip${v === elegido[i] ? ' is-on' : ''}" aria-pressed="${v === elegido[i]}" data-valor="${esc(v)}">${esc(v)}</button>`).join('')}</div>
              </div>`).join('') : ''}

            <div class="wv-pdp__buy">
              <button class="wv-btn wv-btn--primary wv-btn--lg wv-btn--block" id="agregar">${icono('i-bag')}<span>${esc(textoBoton)}</span>${flecha()}</button>
              ${botonFavorito(p)}
            </div>
            <p class="error" id="error" role="alert"></p>

            <ul class="wv-pdp__perks">
              <li>${icono('i-hoja')}Hecha a mano, sin moldes</li>
              <li>${icono('i-sello')}${esc(T.ficha.certificado)}</li>
              <li>${icono('i-camion')}Envíos a todo Uruguay</li>
              <li>${icono('i-girar')}Materiales reciclados</li>
            </ul>
          </div>
        </div>

        <div class="wv-pdp__details">
          <article class="wv-pdp__block" data-rev>
            <h2>Sobre ${esc(esCriatura ? 'esta criatura' : 'este objeto')}</h2>
            <div class="wv-rich">${p.description || `<p>${esc(T.ficha.hecho)}.</p>`}</div>
          </article>
          ${esCriatura || r ? `
          <article class="wv-pdp__block wv-pdp__block--cert" data-rev style="--d:90ms">
            <h2>${esc(T.ficha.certificado)}</h2>
            <dl class="wv-specs">
              <div><dt>Nombre</dt><dd>${esc(p.title)}</dd></div>
              ${r ? `<div><dt>${esc(T.ficha.origen)}</dt><dd>${esc(r.name)} · ${numeroRegion(r)}</dd></div>` : ''}
              <div><dt>${esc(T.ficha.pieza)}</dt><dd>${esc(numero)}</dd></div>
              <div><dt>Hecha por</dt><dd>Walkiver</dd></div>
            </dl>
            <p>${esc(T.ficha.hecho)}.</p>
            <i class="wk-mano" aria-hidden="true"></i>
          </article>` : ''}
          <article class="wv-pdp__block wv-pdp__block--region" data-rev style="--d:180ms">
            <h2>${r ? `Desde ${esc(r.name)}` : 'Cuidados'}</h2>
            <p>${r && r.description ? esc(textoPlano(r.description, 220)) : 'Lejos de la humedad y del sol directo. Para limpiarla alcanza con un pincel seco y suave.'}</p>
            ${r ? `<a class="wv-link" href="/walkurio" data-link>${esc(T.walkurio.verEnMapa)} ${icono('i-flecha')}</a>` : `<a class="wv-link" href="/contacto" data-link>¿Dudas? Escribinos ${icono('i-flecha')}</a>`}
          </article>
        </div>
      </div>
    </section>

    <div class="wv-buybar" id="barra-compra" aria-hidden="true">
      <div><strong id="barra-precio">${tienda.formatear(p.price, p.currency)}</strong><span>${esc(p.title)}</span></div>
      <button type="button" class="wv-btn wv-btn--luz wv-btn--sm" id="agregar-barra" tabindex="-1">${esc(textoBoton)}${flecha()}</button>
    </div>

    <section class="wv-related" id="vecinos" hidden><div class="wv-container">
      <div class="wv-head wv-head--split"><div><p class="wv-eyebrow">${icono('i-chispa')}${r ? esc(r.name) : esc(col?.name ?? 'Walkiverso')}</p><h2 class="wv-h2">${esc(r ? T.ficha.relacionados : 'También te puede elegir')}</h2></div>
      <a class="wv-link" href="${r ? `/categoria/${esc(r.handle)}` : col ? `/categoria/${esc(col.handle)}` : '/tienda'}" data-link>Ver todas ${icono('i-flecha')}</a></div>
      <div class="wv-grid" id="vecinos-lista"></div>
    </div></section>`;

  const variante = () => p.variants.find((v) => v.options.every((x, i) => x === elegido[i])) ?? null;
  const actualizar = () => {
    const v = variante();
    const b = $('#agregar');
    b.disabled = !v?.available;
    $('#agregar-barra').disabled = !v?.available;
    b.querySelector('span').textContent = !v ? T.ficha.elegir : v.available ? textoBoton : T.ficha.agotado;
    if (v) {
      $('#precio').innerHTML = precioBloque({ ...p, price: v.price, compareAtPrice: v.compareAtPrice }, unica ? T.ficha.unica : 'Precio');
      $('#barra-precio').textContent = tienda.formatear(v.price, p.currency);
    }
  };
  $$('[data-opcion]', app).forEach((grupo) => grupo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-valor]');
    if (!b) return;
    elegido[Number(grupo.dataset.opcion)] = b.dataset.valor;
    grupo.querySelectorAll('button').forEach((x) => { x.setAttribute('aria-pressed', String(x === b)); x.classList.toggle('is-on', x === b); });
    actualizar();
  }));
  $('.wv-gallery__thumbs')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-foto]');
    if (!b) return;
    const img = $('#principal > img');
    const f = fotos[Number(b.dataset.foto)];
    img.classList.remove('is-swap'); void img.offsetWidth; img.classList.add('is-swap');
    img.src = f.sizes?.['1024'] ?? f.url;
    img.srcset = f.sizes ? Object.entries(f.sizes).map(([w, u]) => `${u} ${w}w`).join(', ') : '';
    $$('.wv-gallery__thumb').forEach((x) => { x.setAttribute('aria-pressed', String(x === b)); x.classList.toggle('is-on', x === b); });
  });
  // Luz que sigue al mouse sobre la foto
  const principal = $('#principal');
  principal.addEventListener('pointermove', (e) => {
    const q = principal.getBoundingClientRect();
    principal.style.setProperty('--mx', `${((e.clientX - q.left) / q.width * 100).toFixed(1)}%`);
    principal.style.setProperty('--my', `${((e.clientY - q.top) / q.height * 100).toFixed(1)}%`);
  });
  const comprar = async (b) => {
    $('#error').textContent = '';
    b.classList.add('is-loading');
    try {
      await agregar(variante().id, b, principal);
      b.classList.add('is-done');
      setTimeout(() => b.classList.remove('is-done'), 1800);
    } catch (err) { $('#error').textContent = err.message; }
    b.classList.remove('is-loading');
  };
  $('#agregar').addEventListener('click', (e) => comprar(e.currentTarget));
  $('#agregar-barra').addEventListener('click', (e) => comprar(e.currentTarget));
  actualizar();

  // Barra de compra fija (celular) cuando el botón principal sale de la pantalla
  const barra = $('#barra-compra');
  new IntersectionObserver(([en]) => {
    const ver = !en.isIntersecting && en.boundingClientRect.top < 0;
    barra.classList.toggle('is-on', ver);
    barra.setAttribute('aria-hidden', String(!ver));
    $('#agregar-barra').tabIndex = ver ? 0 : -1;
  }).observe($('#agregar'));

  revelar();
  const de = r ?? col;
  if (de) {
    const { items } = await tienda.productos.listar({ categoria: de.handle, porPagina: 5 }).catch(() => ({ items: [] }));
    const otros = items.filter((x) => x.handle !== p.handle).slice(0, 4);
    if (otros.length && $('#vecinos')) { $('#vecinos-lista').innerHTML = otros.map(tarjeta).join(''); $('#vecinos').hidden = false; revelar(); }
  }
}
