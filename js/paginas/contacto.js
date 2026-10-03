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
              <button class="wv-btn wv-btn--luz wv-btn--lg"><span>${esc(T.contacto.enviar)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
            </div>
          </form>
          <div class="wk-carta-enviada" id="enviada" tabindex="-1" hidden>
            <span class="wk-carta-enviada__estrella" aria-hidden="true"><i class="wv-orbe-luz wv-orbe-luz--grande"></i></span>
            <h2>${esc(T.contacto.exito)}</h2>
            <p>${esc(T.contacto.exitoTexto)}</p>
            <button type="button" class="wv-btn wv-btn--ghost" id="otra-carta">${esc(T.contacto.otro)}</button>
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
      rafaga($('#enviada .wv-orbe-luz'), 30);
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

/**
 * El envío es un hechizo: las letras de la carta se encienden, el sobre baja al centro y crece,
 * la carta se pliega y entra, se cierra y se sella, y el sobre sale volando en arco con una estela
 * hasta convertirse en una estrella que titila.
 */
async function enviarSobre() {
  const form = $('#carta');
  const m = $('.wk-mensajero');
  if (reducido) return;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await espera(550);
  // 1. Las palabras se encienden y sueltan polvo, campo por campo
  form.classList.add('is-encantada');
  const campos = [...form.querySelectorAll('.wk-flotante')];
  campos.forEach((c, i) => setTimeout(() => rafaga(c, 10), i * 140));
  await espera(campos.length * 140 + 500);
  // 2. El sobre baja al centro de la carta y crece
  const a = form.getBoundingClientRect();
  const cuerpo = m.querySelector('.wk-mensajero__cuerpo').getBoundingClientRect();
  const dx = a.left + a.width / 2 - (cuerpo.left + cuerpo.width / 2);
  const dy = a.top + a.height / 2 - (cuerpo.top + cuerpo.height / 2);
  const centro = `translate(${dx}px, ${dy}px) scale(2.1)`;
  m.classList.add('is-abierto');
  const bajar = m.animate([{ transform: 'none' }, { transform: centro }], { duration: 1000, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards' });
  // 3. La carta se pliega en tres y entra al sobre
  await espera(350);
  await form.animate([
    { transform: 'none', opacity: 1, filter: 'none' },
    { transform: 'perspective(1000px) rotateX(55deg) scale(.7)', opacity: .9, filter: 'brightness(1.4)', offset: .45 },
    { transform: 'perspective(1000px) rotateX(80deg) scale(.18) translateY(40px)', opacity: 0, filter: 'brightness(2) blur(6px)' },
  ], { duration: 1100, easing: 'cubic-bezier(.6, 0, .3, 1)', fill: 'forwards' }).finished;
  await bajar.finished;
  rafaga(m.querySelector('.wk-mensajero__cuerpo'), 18);
  // 4. Se cierra y se sella
  m.classList.add('is-cargado');
  await espera(420);
  m.classList.add('is-cerrado');
  await espera(560);
  m.classList.add('is-sellado');
  rafaga(m.querySelector('.wk-mensajero__lacre'), 30);
  await espera(800);
  // 5. Vuela en arco con estela y se vuelve estrella
  const fx = innerWidth * .38, fy = -innerHeight * .62;
  const estela = setInterval(() => rafaga(m.querySelector('.wk-mensajero__cuerpo'), 7), 70);
  await m.animate([
    { transform: centro },
    { transform: `translate(${dx - 30}px, ${dy + 26}px) rotate(-10deg) scale(2.2)`, offset: .14 },
    { transform: `translate(${dx + fx * .45}px, ${dy + fy * .55}px) rotate(14deg) scale(1.1)`, offset: .6 },
    { transform: `translate(${dx + fx}px, ${dy + fy}px) rotate(26deg) scale(.08)`, opacity: .2 },
  ], { duration: 2100, easing: 'cubic-bezier(.45, 0, .25, 1)', fill: 'forwards' }).finished;
  clearInterval(estela);
  const fin = m.querySelector('.wk-mensajero__cuerpo').getBoundingClientRect();
  const estrella = document.createElement('span');
  estrella.className = 'wv-estrella-envio';
  estrella.style.left = `${fin.left + fin.width / 2}px`;
  estrella.style.top = `${Math.max(40, fin.top + fin.height / 2)}px`;
  document.body.append(estrella);
  setTimeout(() => estrella.remove(), 3200);
  m.className = 'wk-mensajero is-ido';
  m.getAnimations().forEach((x) => x.cancel());
  form.classList.remove('is-encantada');
}
