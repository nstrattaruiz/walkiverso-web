// Compra: /checkout (datos, entrega, pago, cupón y resumen) y /pedido (el pedido con su estado).
// Medios de pago y envíos: los que se habilitan en el panel. Precios, stock, cupones y recargos los calcula la plataforma.
import { tienda, $, esc, app, estado, cabecera, icono, flecha, aviso, foto, sinFoto } from '../base.js';
import { rafaga } from '../polvo.js';

const dinero = (c, moneda) => tienda.formatear(c, moneda);
const lineasHtml = (lineas, moneda) => lineas.map((l) => `
  <div class="wv-compra__linea">
    <span>${l.quantity} × ${esc(l.title)}${l.variantTitle ? ` <small>${esc(l.variantTitle)}</small>` : ''}</span>
    <strong>${dinero(l.totalCents, moneda)}</strong>
  </div>`).join('');

export async function checkout() {
  document.title = `Finalizar compra · ${estado.info.name}`;
  if (typeof tienda.checkout?.opciones !== 'function') {
    app.innerHTML = `${cabecera({ ante: 'Tu compra', titulo: 'Muy pronto', bajada: 'El pago se habilita en la próxima etapa de la plataforma.' })}`;
    return;
  }
  const [carro, op] = await Promise.all([tienda.carrito.ver(), tienda.checkout.opciones()]);
  if (!carro.lines.length) {
    app.innerHTML = `${cabecera({ ante: 'Tu compra', titulo: 'Tu carrito está vacío', bajada: 'Las criaturas esperan un hogar.', extra: `<div class="wv-page-head__ctas"><a class="wv-btn wv-btn--primary wv-btn--lg" href="/tienda" data-link>Ver la tienda${flecha()}</a></div>` })}`;
    return;
  }
  if (!op.payments.length) {
    app.innerHTML = `${cabecera({ ante: 'Tu compra', titulo: 'Escribinos para comprar', bajada: 'Todavía no se puede pagar online. Escribinos y coordinamos tu pedido.', extra: `<div class="wv-page-head__ctas"><a class="wv-btn wv-btn--primary wv-btn--lg" href="/contacto" data-link>Contacto${flecha()}</a></div>` })}`;
    return;
  }
  const radio = (name, value, titulo, detalle, checked) => `
    <label class="wv-opcion"><input type="radio" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''} required>
      <span class="wv-opcion__marca" aria-hidden="true"></span>
      <span class="wv-opcion__texto"><strong>${esc(titulo)}</strong>${detalle ? `<small>${esc(detalle)}</small>` : ''}</span></label>`;
  const precioEnvio = (e) => (e.priceCents ? dinero(e.priceCents, op.currency) : 'Gratis') + (e.freeOverCents ? ` · gratis desde ${dinero(e.freeOverCents, op.currency)}` : '');

  app.innerHTML = `
    <section class="wv-compra wv-container">
      <form class="wv-compra__form" id="compra" novalidate>
        <p class="wv-eyebrow">Tu compra</p>
        <h1 class="wv-h1">Finalizar compra</h1>
        <fieldset class="wv-compra__bloque"><legend>Tus datos</legend>
          <label class="wv-field"><span>Nombre y apellido</span><input name="nombre" required autocomplete="name"></label>
          <div class="wv-compra__dos">
            <label class="wv-field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
            <label class="wv-field"><span>Teléfono</span><input name="telefono" type="tel" autocomplete="tel"></label>
          </div>
        </fieldset>
        ${op.shipping.length ? `<fieldset class="wv-compra__bloque"><legend>Entrega</legend>
          ${op.shipping.map((e, i) => radio('envio', e.id, e.name, [precioEnvio(e), e.description].filter(Boolean).join(' · '), i === 0)).join('')}
          <label class="wv-field" id="direccion-campo"><span>Dirección de envío</span><input name="direccion" autocomplete="street-address"></label>
        </fieldset>` : ''}
        <fieldset class="wv-compra__bloque"><legend>Pago</legend>
          ${op.payments.map((p, i) => radio('pago', p.method, p.label, p.online ? 'Pagás online de forma segura' : 'Te mostramos cómo pagar al confirmar', i === 0)).join('')}
        </fieldset>
        <fieldset class="wv-compra__bloque"><legend>Cupón y nota</legend>
          <div class="wv-compra__cupon"><label class="wv-field"><span>Código de descuento</span><input name="cupon" autocomplete="off"></label>
            <button type="button" class="wv-btn wv-btn--ghost" id="aplicar">Aplicar</button></div>
          <label class="wv-field"><span>Nota para el pedido (opcional)</span><textarea name="nota" rows="3"></textarea></label>
        </fieldset>
        <p class="error" id="error" role="alert"></p>
        <button class="wv-btn wv-btn--primary wv-btn--lg wv-btn--block" id="confirmar">Confirmar pedido${flecha()}</button>
      </form>
      <aside class="wv-compra__resumen" id="resumen" aria-live="polite"><span class="wk-cargando"></span></aside>
    </section>`;

  const form = $('#compra');
  const datos = () => Object.fromEntries(new FormData(form));
  const envioDe = (id) => op.shipping.find((e) => e.id === id);
  let cupon = '';
  const resumen = async () => {
    const d = datos();
    if ($('#direccion-campo')) $('#direccion-campo').hidden = !d.envio || envioDe(d.envio)?.pickup;
    try {
      const t = await tienda.checkout.cotizar({ metodoPago: d.pago, envio: d.envio || null, cupon: cupon || null });
      $('#error').textContent = '';
      $('#resumen').innerHTML = `
        <h2>Tu pedido</h2>
        ${lineasHtml(t.lines, t.currency)}
        <dl class="wv-totals">
          <div class="wv-totals__note"><dt>Subtotal</dt><dd>${dinero(t.subtotalCents, t.currency)}</dd></div>
          ${t.discountCents ? `<div class="wv-totals__note"><dt>Cupón ${esc(t.coupon)}</dt><dd>− ${dinero(t.discountCents, t.currency)}</dd></div>` : ''}
          ${t.shippingMethod ? `<div class="wv-totals__note"><dt>${esc(t.shippingMethod)}</dt><dd>${t.shippingCents ? dinero(t.shippingCents, t.currency) : 'Gratis'}</dd></div>` : ''}
          ${t.paymentAdjustCents ? `<div class="wv-totals__note"><dt>${esc(t.paymentAdjustLabel || 'Ajuste por medio de pago')}</dt><dd>${t.paymentAdjustCents < 0 ? '− ' : ''}${dinero(Math.abs(t.paymentAdjustCents), t.currency)}</dd></div>` : ''}
          <div class="wv-compra__total"><dt>Total</dt><dd>${dinero(t.totalCents, t.currency)}</dd></div>
        </dl>
        <p class="wv-drawer__legal">${icono('i-sello')} Cada pieza viaja con su certificado de autenticidad.</p>`;
    } catch (e) {
      if (cupon) { cupon = ''; form.cupon.value = ''; }
      $('#error').textContent = e.message;
    }
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'envio' || e.target.name === 'pago') resumen(); });
  $('#aplicar').addEventListener('click', () => { cupon = form.cupon.value.trim(); resumen(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = datos();
    if (!d.nombre || !d.email) { $('#error').textContent = 'Completá tu nombre y tu email.'; return; }
    const b = $('#confirmar');
    b.classList.add('is-loading');
    b.disabled = true;
    $('#error').textContent = '';
    try {
      const r = await tienda.checkout.confirmar({
        metodoPago: d.pago, envio: d.envio || null, cupon: cupon || null, direccion: d.direccion, nota: d.nota,
        cliente: { nombre: d.nombre, email: d.email, telefono: d.telefono }, volver: '/pedido',
      });
      rafaga(b, 40);
      // Pago online (Mercado Pago, PayPal): a pagar. Efectivo o transferencia: al pedido con las instrucciones.
      if (r.payUrl) { location.href = r.payUrl; return; }
      const BASE = window.WK_BASE || '';
      history.pushState(null, '', `${BASE}/pedido?pedido=${encodeURIComponent(r.token)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      $('#error').textContent = err.message;
      b.classList.remove('is-loading');
      b.disabled = false;
    }
  });
  resumen();
}

/** El pedido, con el código privado que vuelve en la dirección (?pedido=...). Si se pagó online, la plataforma lo confirma. */
export async function pedido(token) {
  if (!token || typeof tienda.checkout?.pedido !== 'function') throw new Error('404');
  const o = await tienda.checkout.pedido(token);
  document.title = `Pedido #${o.number} · ${estado.info.name}`;
  const pagado = o.paymentStatus === 'paid';
  const cancelado = o.status === 'cancelled';
  const titulo = cancelado ? 'Pedido cancelado' : pagado ? '¡Gracias por tu compra!' : '¡Recibimos tu pedido!';
  app.innerHTML = `
    <section class="wv-pedido wv-container">
      <div class="wv-pedido__sello" aria-hidden="true"><i class="wv-orbe-luz wv-orbe-luz--grande"></i></div>
      <p class="wv-eyebrow">Pedido #${o.number}</p>
      <h1 class="wv-h1">${titulo}</h1>
      <p class="wv-lead">${esc(o.paymentLabel)} · ${cancelado ? 'cancelado' : pagado ? 'pagado' : 'pendiente de pago'}${o.shippingMethod ? ` · ${esc(o.shippingMethod)}` : ''}</p>
      ${o.instructions && !cancelado ? `<div class="wv-pedido__instrucciones"><strong>Cómo pagar</strong><p>${esc(o.instructions).replace(/\n/g, '<br>')}</p></div>` : ''}
      ${o.payUrl ? `<p><a class="wv-btn wv-btn--primary wv-btn--lg" href="${esc(o.payUrl)}">Pagar ahora${flecha()}</a></p>` : ''}
      <div class="wv-compra__resumen">
        ${o.lines.map((l) => `
          <div class="wv-pedido__linea">
            <span class="wv-line__img">${l.image ? `<img src="${esc(l.image)}" alt="">` : sinFoto(l.title)}</span>
            <span>${l.quantity} × ${esc(l.title)}${l.variantTitle ? ` <small>${esc(l.variantTitle)}</small>` : ''}</span>
            <strong>${dinero(l.totalCents, o.currency)}</strong>
          </div>`).join('')}
        <dl class="wv-totals">
          ${o.shippingMethod ? `<div class="wv-totals__note"><dt>${esc(o.shippingMethod)}</dt><dd>${o.shippingCents ? dinero(o.shippingCents, o.currency) : 'Gratis'}</dd></div>` : ''}
          ${o.discountCents ? `<div class="wv-totals__note"><dt>Descuento</dt><dd>− ${dinero(o.discountCents, o.currency)}</dd></div>` : ''}
          ${o.paymentAdjustCents ? `<div class="wv-totals__note"><dt>Ajuste por medio de pago</dt><dd>${o.paymentAdjustCents < 0 ? '− ' : ''}${dinero(Math.abs(o.paymentAdjustCents), o.currency)}</dd></div>` : ''}
          <div class="wv-compra__total"><dt>Total</dt><dd>${dinero(o.totalCents, o.currency)}</dd></div>
        </dl>
      </div>
      <p class="wv-pedido__nota">Te escribimos a <strong>${esc(o.customerEmail || '')}</strong> con las novedades. Guardá esta página para ver el estado de tu pedido.</p>
      <div class="wv-page-head__ctas"><a class="wv-btn wv-btn--ghost wv-btn--lg" href="/tienda" data-link>Seguir mirando${flecha()}</a></div>
    </section>`;
  if (pagado) aviso('¡Pago confirmado! Tu criatura ya tiene hogar.');
}
