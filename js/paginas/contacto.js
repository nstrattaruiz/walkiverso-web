// Contacto: escribís una carta; al enviarla se pliega, entra en un sobre, se sella y sale volando.
import { tienda, T, $, $$, esc, app, estado, revelar, reducido, aviso, espera } from '../base.js';
import { rafaga } from '../polvo.js';

export function contacto() {
  document.title = `Contacto · ${estado.info.name}`;
  const c = estado.info.contact;
  const wa = (c.whatsapp || '').replace(/\D/g, '').replace(/^0/, '598');
  const datos = [
    { icono: 'i-taller', titulo: T.contacto.taller, texto: c.location || T.contacto.tallerTexto },
    c.email && { icono: 'i-mail', titulo: 'Email', texto: c.email, href: `mailto:${c.email}` },
    wa && { icono: 'i-wa', titulo: 'WhatsApp', texto: T.contacto.horario, href: `https://wa.me/${wa}${c.whatsappMessage ? `?text=${encodeURIComponent(c.whatsappMessage)}` : ''}`, fuera: true },
    c.phone && { icono: 'i-phone', titulo: 'Teléfono', texto: c.phone, href: `tel:${c.phone.replace(/\s/g, '')}` },
  ].filter(Boolean);
  const redes = [['instagram', 'i-ig'], ['facebook', 'i-fb']].filter(([k]) => c[k]);

  app.innerHTML = `
    <section class="wk-contacto-pag">
      <div class="wk-contacto-pag__cielo" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
      <div class="contenedor wk-contacto">
        <div class="wk-contacto__intro">
          <p class="wk-antetitulo">${esc(T.contacto.antetitulo)}</p>
          <h1>${T.contacto.titulo.split(' ').map((w, i) => `<span class="wk-palabra" style="--i:${i}">${esc(w)}</span>`).join(' ')}</h1>
          <p class="wk-contacto__bajada">${esc(T.contacto.bajada)}</p>
          <ul class="wk-contacto__datos">
            ${datos.map((d, i) => `<li data-rev style="--d:${i * 80}ms">${d.href ? `<a href="${esc(d.href)}"${d.fuera ? ' target="_blank" rel="noopener"' : ''}>` : '<div>'}
              <span class="wk-contacto__icono" aria-hidden="true"><svg><use href="#${d.icono}"/></svg></span>
              <span><small>${esc(d.titulo)}</small><strong>${esc(d.texto)}</strong></span>${d.href ? '</a>' : '</div>'}</li>`).join('')}
          </ul>
          ${redes.length ? `<div class="wk-contacto__redes"><small>${esc(T.contacto.seguinos)}</small>${redes.map(([k, i]) => `<a href="${esc(c[k])}" target="_blank" rel="noopener" aria-label="${k}"><svg aria-hidden="true"><use href="#${i}"/></svg></a>`).join('')}</div>` : ''}
        </div>

        <div class="wk-escritorio">
          <form class="wk-misiva" id="carta" data-rev>
            <span class="wk-misiva__luz" aria-hidden="true"></span>
            <span class="wk-misiva__rama wk-misiva__rama--a" aria-hidden="true"></span>
            <span class="wk-misiva__rama wk-misiva__rama--b" aria-hidden="true"></span>
            <div class="wk-misiva__cab">
              <span class="wk-lacre" aria-hidden="true">W</span>
              <div><p class="wk-antetitulo">${esc(T.contacto.formAnte)}</p><h2>${esc(T.contacto.formTitulo)}</h2></div>
            </div>
            <div class="wk-misiva__campos">
              <label class="wk-flotante"><input name="name" required autocomplete="name" placeholder=" "><span>Nombre</span></label>
              <label class="wk-flotante"><input name="email" type="email" required autocomplete="email" placeholder=" "><span>Email</span></label>
              <label class="wk-flotante"><input name="phone" type="tel" autocomplete="tel" placeholder=" "><span>Teléfono (opcional)</span></label>
              <label class="wk-flotante wk-flotante--select"><select name="asunto">${T.contacto.asuntos.map((a) => `<option>${esc(a)}</option>`).join('')}</select><span>Asunto</span></label>
              <label class="wk-flotante wk-flotante--texto"><textarea name="message" rows="5" required placeholder=" "></textarea><span>Tu mensaje</span></label>
            </div>
            <div class="wk-misiva__pie">
              <small>${esc(T.contacto.nota)}</small>
              <button class="wk-lacre-boton"><span class="wk-lacre" aria-hidden="true">W</span><span>${esc(T.contacto.enviar)}</span></button>
            </div>
          </form>
          <div class="wk-sobre" aria-hidden="true"><span class="wk-sobre__fondo"></span><span class="wk-sobre__frente"></span><span class="wk-sobre__solapa"></span><span class="wk-lacre wk-sobre__lacre">W</span></div>
          <div class="wk-carta-enviada" id="enviada" tabindex="-1" hidden>
            <span class="wk-carta-enviada__estela" aria-hidden="true"></span>
            <h2>${esc(T.contacto.exito)}</h2>
            <p>${esc(T.contacto.exitoTexto)}</p>
            <button type="button" class="wk-btn wk-btn--linea" id="otra-carta">${esc(T.contacto.otro)}</button>
          </div>
        </div>
      </div>
    </section>`;

  const form = $('#carta');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = form.querySelector('.wk-lacre-boton');
    b.disabled = true;
    try {
      await tienda.contacto(Object.fromEntries(new FormData(form)));
      await volarCarta();
      $('#enviada').hidden = false;
      $('#enviada').focus({ preventScroll: true });
      rafaga($('#enviada h2'), 30);
    } catch (err) { aviso(err.message); }
    b.disabled = false;
  });
  $('#otra-carta').addEventListener('click', () => {
    form.reset();
    $('#enviada').hidden = true;
    $('.wk-escritorio').classList.remove('is-enviada');
    form.getAnimations().forEach((a) => a.cancel());
    $('.wk-sobre').getAnimations().forEach((a) => a.cancel());
    $('.wk-sobre').classList.remove('is-cerrado', 'is-visible');
    form.querySelector('textarea').focus();
  });
  revelar();
}

/** Plegar la carta → sobre → lacre → vuelo. */
async function volarCarta() {
  const esc = $('.wk-escritorio');
  const carta = $('#carta');
  const sobre = $('.wk-sobre');
  if (reducido) { esc.classList.add('is-enviada'); return; }
  // Primero la carta queda en el centro de la pantalla, para ver todo el viaje
  carta.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await espera(550);
  esc.classList.add('is-enviada');
  const fin = { fill: 'forwards', easing: 'cubic-bezier(0.6, 0, 0.3, 1)' };
  // 1. La carta se pliega en tres y se achica al tamaño del sobre
  await carta.animate([
    { transform: 'none', opacity: 1 },
    { transform: 'perspective(900px) rotateX(18deg) scaleY(0.36)', opacity: 1, offset: 0.5 },
    { transform: 'perspective(900px) translateY(40px) scale(0.5, 0.18)', opacity: 0 },
  ], { duration: 900, ...fin }).finished;
  // 2. Aparece el sobre, se cierra la solapa y cae el lacre
  sobre.classList.add('is-visible');
  await espera(350);
  sobre.classList.add('is-cerrado');
  await espera(650);
  rafaga(sobre.querySelector('.wk-sobre__lacre'), 18);
  await espera(350);
  // 3. Sale volando entre las estrellas
  await sobre.animate([
    { transform: 'translate(-50%, -50%)', opacity: 1 },
    { transform: 'translate(-40%, -70%) rotate(-6deg) scale(0.95)', opacity: 1, offset: 0.25 },
    { transform: 'translate(160%, -420%) rotate(18deg) scale(0.2)', opacity: 0 },
  ], { duration: 1300, ...fin }).finished;
}
