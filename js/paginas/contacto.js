// Contacto: un sobre mensajero flota junto a la carta. Al enviar, el mensaje se dobla y entra en el sobre,
// se sella con la mano y el sobre sale volando entre las estrellas dejando una estela de luz.
import { tienda, T, $, esc, app, estado, revelar, reducido, aviso, espera } from '../base.js';
import { rafaga } from '../polvo.js';

const sobre = () => `
  <div class="wk-mensajero" aria-hidden="true">
    <span class="wk-mensajero__halo"></span>
    <span class="wk-mensajero__chispas"><i></i><i></i><i></i><i></i><i></i></span>
    <span class="wk-mensajero__cuerpo">
      <span class="wk-mensajero__fondo"></span>
      <span class="wk-mensajero__papel"></span>
      <span class="wk-mensajero__frente"></span>
      <span class="wk-mensajero__solapa"></span>
      <span class="wk-mensajero__lacre"><i class="wk-mano"></i></span>
    </span>
  </div>`;

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
      <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="bl,tr" data-semilla="31"></span>
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
          ${sobre()}
          <form class="wk-misiva" id="carta" data-rev>
            <div class="wk-misiva__cab">
              <p class="wk-antetitulo">${esc(T.contacto.formAnte)}</p><h2>${esc(T.contacto.formTitulo)}</h2>
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
              <button class="wk-btn wk-btn--luz wk-btn--grande-hero"><span>${esc(T.contacto.enviar)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
            </div>
          </form>
          <div class="wk-carta-enviada" id="enviada" tabindex="-1" hidden>
            <i class="wk-mano wk-mano--vacio" aria-hidden="true"></i>
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
    const b = form.querySelector('button');
    b.disabled = true;
    try {
      await tienda.contacto(Object.fromEntries(new FormData(form)));
      await enviarSobre();
      form.hidden = true;
      $('#enviada').hidden = false;
      $('#enviada').focus({ preventScroll: true });
      rafaga($('#enviada h2'), 30);
    } catch (err) { aviso(err.message); }
    b.disabled = false;
  });
  $('#otra-carta').addEventListener('click', async () => {
    form.reset();
    $('#enviada').hidden = true;
    form.hidden = false;
    form.getAnimations().forEach((a) => a.cancel());
    const m = $('.wk-mensajero');
    m.getAnimations().forEach((a) => a.cancel());
    m.className = 'wk-mensajero is-vuelve';
    await espera(900);
    m.className = 'wk-mensajero';
    form.querySelector('input').focus();
  });
  revelar();
}

/** El mensaje se dobla y entra al sobre → se sella → el sobre vuela. */
async function enviarSobre() {
  const form = $('#carta');
  const m = $('.wk-mensajero');
  if (reducido) return;
  m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await espera(500);
  const a = form.getBoundingClientRect();
  const b = m.querySelector('.wk-mensajero__cuerpo').getBoundingClientRect();
  // 1. Se abre el sobre y el contenido de la carta se dobla volando hacia él
  m.classList.add('is-abierto');
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  await form.animate([
    { transform: 'none', opacity: 1, filter: 'none' },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) perspective(900px) rotateX(35deg) scale(0.55)`, opacity: 0.8, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0, filter: 'blur(4px)' },
  ], { duration: 950, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'forwards' }).finished;
  // 2. Se cierra la solapa y la mano sella
  m.classList.add('is-cargado');
  await espera(380);
  m.classList.add('is-cerrado');
  await espera(520);
  m.classList.add('is-sellado');
  rafaga(m.querySelector('.wk-mensajero__lacre'), 22);
  await espera(650);
  // 3. Vuela en arco dejando una estela de luz
  const estela = setInterval(() => rafaga(m.querySelector('.wk-mensajero__cuerpo'), 6), 90);
  await m.animate([
    { transform: 'none', opacity: 1 },
    { transform: 'translate(-30px, 30px) rotate(-8deg) scale(1.04)', opacity: 1, offset: 0.15 },
    { transform: 'translate(40vw, -55vh) rotate(16deg) scale(0.55)', opacity: 0.9, offset: 0.7 },
    { transform: 'translate(70vw, -95vh) rotate(24deg) scale(0.2)', opacity: 0 },
  ], { duration: 1700, easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'forwards' }).finished;
  clearInterval(estela);
  m.className = 'wk-mensajero is-ido';
}
