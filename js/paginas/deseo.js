// "Pedile un deseo al Walkiverso": orbe de cristal + ritual en pasos. Se usa en el inicio y en /deseos.
// El deseo llega al panel como mensaje de contacto (tipo "Solicitud").
import { tienda, T, $, $$, esc, app, estado, revelar, acordeon, romano, reducido, aviso, espera } from '../base.js';
import { rafaga } from '../polvo.js';
import { crearOrbe3D } from '../orbe3d.js';

export const seccionDeseo = ({ pagina = false } = {}) => `
  <section class="wk-deseo${pagina ? ' wk-deseo--pagina' : ''}" id="deseo" aria-labelledby="deseo-titulo">
    <div class="wk-deseo__cielo" aria-hidden="true"></div>
    <span class="wk-ramas-fondo wk-ramas-fondo--luz" data-esquinas="tl,br" data-semilla="41"></span>
    <div class="contenedor wk-deseo__grilla">
      <div class="wk-deseo__orbe-col" data-rev>
        <div class="wk-orbe" aria-hidden="true">
          <canvas class="wk-orbe__lienzo"></canvas>
          <svg class="wk-orbe__pedestal" viewBox="0 0 200 150">
            <defs>
              <linearGradient id="ped-metal" x1="0" x2="1"><stop offset="0" stop-color="#0b2470"/><stop offset=".35" stop-color="#3b6fd8"/><stop offset=".55" stop-color="#1a44a8"/><stop offset="1" stop-color="#0a1f62"/></linearGradient>
              <linearGradient id="ped-sombra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5cc8"/><stop offset="1" stop-color="#071a52"/></linearGradient>
              <radialGradient id="ped-luz" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e6f6ff"/><stop offset=".45" stop-color="#92d2f5"/><stop offset="1" stop-color="#2a6fd0"/></radialGradient>
            </defs>
            <path d="M30 108 L24 126 Q100 142 176 126 L170 108 Q100 120 30 108Z" fill="url(#ped-metal)"/>
            <ellipse cx="100" cy="108" rx="70" ry="10" fill="url(#ped-sombra)"/>
            <path d="M60 84 L56 100 Q100 110 144 100 L140 84Z" fill="url(#ped-metal)"/>
            <ellipse cx="100" cy="84" rx="40" ry="7" fill="url(#ped-sombra)"/>
            <path d="M88 52 Q93 66 90 80 L110 80 Q107 66 112 52Z" fill="url(#ped-metal)"/>
            <path d="M34 16 Q38 50 100 56 Q162 50 166 16Z" fill="url(#ped-metal)"/>
            <ellipse class="wk-orbe__copa" cx="100" cy="16" rx="66" ry="11" fill="url(#ped-luz)"/>
          </svg>
        </div>
        <p class="wk-antetitulo">${esc(T.deseo.antetitulo)}</p>
        <${pagina ? 'h1' : 'h2'} id="deseo-titulo">${esc(T.deseo.titulo)}</${pagina ? 'h1' : 'h2'}>
        <p class="wk-deseo__bajada">${esc(T.deseo.bajada)}</p>
      </div>

      <div class="wk-deseo__ritual" data-rev style="--d:120ms" aria-live="polite">
        <div class="wk-deseo__paso is-activo" data-paso="info">
          <div class="wk-deseo__preguntas">
            ${T.deseo.preguntas.map(([q, a], i) => `
              <div class="wk-pregunta wk-pregunta--vidrio">
                <h3><button type="button" data-acordeon aria-expanded="${i === 0}" aria-controls="dq-${i}" id="dq-b-${i}">
                  <span class="wk-medalla" aria-hidden="true">${romano(i)}</span><span class="wk-pregunta__q">${esc(q)}</span><span class="wk-pregunta__mas" aria-hidden="true"></span>
                </button></h3>
                <div class="wk-pregunta__r" id="dq-${i}" role="region" aria-labelledby="dq-b-${i}"><div>${a}</div></div>
              </div>`).join('')}
          </div>
          <button type="button" class="wk-deseo__empezar" data-ir="1">
            <span class="wk-deseo__empezar-icono" aria-hidden="true"><svg><use href="#i-chispa"/></svg></span>
            <span>${esc(T.deseo.empezar)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg>
          </button>
        </div>

        <form class="wk-deseo__form" novalidate>
          <ol class="wk-deseo__progreso" aria-hidden="true"><li></li><li></li><li></li></ol>

          <fieldset class="wk-deseo__paso" data-paso="1">
            <legend>${esc(T.deseo.paso1)}</legend>
            <div class="wk-deseo__opciones">
              ${[['Criatura', T.deseo.criatura, 'i-criatura'], ['Objeto', T.deseo.objeto, 'i-bitacora']].map(([v, [t, d], ic]) => `
                <label class="wk-opcion">
                  <input type="radio" name="creacion" value="${v}" required>
                  <span class="wk-opcion__icono" aria-hidden="true"><svg><use href="#${ic}"/></svg></span>
                  <strong>${esc(t)}</strong><small>${esc(d)}</small>
                </label>`).join('')}
            </div>
            <div class="wk-deseo__nav"><button type="button" class="wk-deseo__volver" data-ir="info">← Volver</button></div>
          </fieldset>

          <fieldset class="wk-deseo__paso" data-paso="2">
            <legend>${esc(T.deseo.paso2)}</legend>
            <p class="wk-deseo__ayuda">${esc(T.deseo.ayuda2)}</p>
            <label class="wk-campo wk-campo--vidrio"><span class="visually-hidden">Tu deseo</span><textarea name="message" rows="5" required minlength="10" placeholder="Soñé con una criatura que…"></textarea></label>
            <label class="wk-campo wk-campo--vidrio"><span>${esc(T.deseo.referencia)}</span><input name="referencia" type="url" inputmode="url" placeholder="https://"></label>
            <div class="wk-deseo__nav">
              <button type="button" class="wk-deseo__volver" data-ir="1">← Volver</button>
              <button type="button" class="wv-btn wv-btn--luz" data-ir="3">Seguir<svg aria-hidden="true"><use href="#i-flecha"/></svg></button>
            </div>
          </fieldset>

          <fieldset class="wk-deseo__paso" data-paso="3">
            <legend>${esc(T.deseo.paso3)}</legend>
            <div class="wk-campos-2">
              <label class="wk-campo wk-campo--vidrio"><span>Nombre</span><input name="name" required autocomplete="name"></label>
              <label class="wk-campo wk-campo--vidrio"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
            </div>
            <p class="wk-deseo__nota">${esc(T.deseo.nota)}</p>
            <button type="submit" class="wk-soltar">
              <span class="wk-soltar__anillo" aria-hidden="true"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="25" pathLength="1"/></svg><svg class="wk-soltar__chispa"><use href="#i-chispa"/></svg></span>
              <span class="wk-soltar__texto"><strong>${esc(T.deseo.soltarCorto)}</strong><small>${esc(T.deseo.soltar)}</small></span>
            </button>
            <div class="wk-deseo__nav"><button type="button" class="wk-deseo__volver" data-ir="2">← Volver</button></div>
          </fieldset>
        </form>

        <div class="wk-deseo__paso wk-deseo__listo" data-paso="listo" tabindex="-1">
          <i class="wv-orbe-luz wv-orbe-luz--grande" aria-hidden="true"></i>
          <h3>${esc(T.deseo.exito)}</h3>
          <p>${esc(T.deseo.exitoTexto)}</p>
          <button type="button" class="wv-btn wv-btn--outline-light" data-ir="1">${esc(T.deseo.otro)}</button>
        </div>
      </div>
    </div>
  </section>`;

export async function deseos() {
  document.title = `${T.deseo.titulo} · ${estado.info.name}`;
  app.innerHTML = seccionDeseo({ pagina: true });
  activarDeseo(app.querySelector('.wk-deseo'));
  revelar();
}

export function activarDeseo(raiz) {
  if (!raiz) return;
  // La bola en 3D; si el navegador no puede, la de antes
  let orbe;
  orbe = crearOrbe3D(raiz.querySelector('.wk-orbe__lienzo'), crearOrbe);
  const form = raiz.querySelector('form');
  const pasos = $$('[data-paso]', raiz);
  acordeon(raiz.querySelector('.wk-deseo__preguntas'));

  const ir = (p) => {
    pasos.forEach((x) => x.classList.toggle('is-activo', x.dataset.paso === String(p)));
    raiz.dataset.estado = p;
    const n = Number(p) || 0;
    $$('.wk-deseo__progreso li', raiz).forEach((li, i) => li.classList.toggle('is-hecho', i < n));
    form.classList.toggle('is-activo', n > 0);
    const activo = pasos.find((x) => x.dataset.paso === String(p));
    activo?.querySelector('input, textarea, button:not(.wk-deseo__volver)')?.focus({ preventScroll: true });
    if (p === 'listo') activo.focus({ preventScroll: true });
    orbe.pulso(0.4);
  };
  const valido = (n) => {
    const campos = $$(`[data-paso="${n}"] :is(input, textarea)`, raiz);
    const malo = campos.find((c) => !c.checkValidity());
    if (malo) { malo.reportValidity(); return false; }
    return true;
  };
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (!b) return;
    const destino = b.dataset.ir;
    if (destino === '3' && !valido(2)) return;
    if (destino === '1' && raiz.dataset.estado === 'listo') form.reset();
    ir(destino);
  });
  // Elegir criatura u objeto ya avanza
  form.addEventListener('change', (e) => {
    if (e.target.name === 'creacion') { orbe.pulso(0.8); setTimeout(() => ir(2), reducido ? 0 : 380); }
  });
  // El orbe se llena de luz mientras escribís
  form.message.addEventListener('input', (e) => { orbe.energia(Math.min(1, e.target.value.length / 220)); orbe.pulso(0.12); });

  // Mantener apretado para soltar el deseo (con teclado alcanza con Enter)
  const boton = form.querySelector('.wk-soltar');
  let t0 = 0, raf = 0, sostenido = false;
  const progreso = (v) => boton.style.setProperty('--p', v.toFixed(3));
  const cancelar = () => { cancelAnimationFrame(raf); sostenido = false; boton.classList.remove('is-cargando'); progreso(0); };
  boton.addEventListener('pointerdown', (e) => {
    if (!valido(3)) return;
    e.preventDefault();
    sostenido = true; t0 = performance.now(); boton.classList.add('is-cargando');
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / 1300);
      progreso(k); orbe.energia(0.4 + k * 0.6);
      if (k >= 1) { cancelar(); enviar(); return; }
      if (sostenido) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => boton.addEventListener(ev, () => { if (sostenido) cancelar(); }));
  form.addEventListener('submit', (e) => { e.preventDefault(); if (valido(3)) enviar(); });

  let enviando = false;
  async function enviar() {
    if (enviando) return;
    enviando = true;
    const d = Object.fromEntries(new FormData(form));
    try {
      await tienda.contacto({ ...d, tipo: 'Solicitud', message: `[${d.creacion}] ${d.message}${d.referencia ? `\nReferencia: ${d.referencia}` : ''}` });
      await orbe.soltar(raiz.querySelector('.wk-orbe'));
      rafaga(raiz.querySelector('.wk-orbe'), 50);
      ir('listo');
      orbe.energia(0.2);
    } catch (err) { aviso(err.message); }
    enviando = false;
  }
}

/** Orbe de cristal en 2D: niebla que gira adentro; más energía = más luz y más velocidad. */
function crearOrbe(lienzo) {
  const ctx = lienzo.getContext('2d');
  let px = 1, lado = 300, e = 0.15, objetivo = 0.15, pulsoV = 0, flash = 0, sobre = 0, visible = true;
  const nieblas = Array.from({ length: 46 }, (_, i) => ({
    a: Math.random() * Math.PI * 2, r: 0.15 + Math.random() * 0.65, v: (Math.random() * 0.5 + 0.2) * (i % 2 ? 1 : -1),
    t: 0.18 + Math.random() * 0.3, c: ['255,255,255', '204,225,218', '230,246,255', '146,210,245'][i % 4], y: (Math.random() - 0.5) * 0.9,
  }));
  const chispas = Array.from({ length: 26 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.8, f: Math.random() * 6 }));
  // Puntos de la constelación (x, y relativos al radio; g = estrella grande)
  const constelacion = [[-0.72, 0.12], [-0.5, -0.02], [-0.28, -0.16, 1], [-0.06, -0.24], [0.16, -0.3], [0.38, -0.36, 1], [0.6, -0.4]];
  const estrella4 = (x, y, r) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; const rr = i % 2 ? r * 0.3 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  };
  const medir = () => {
    px = Math.min(devicePixelRatio || 1, 2);
    lado = lienzo.clientWidth || 300;
    lienzo.width = lado * px; lienzo.height = lado * px;
  };
  medir();
  new ResizeObserver(medir).observe(lienzo);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(cuadro); }).observe(lienzo);
  lienzo.parentElement.addEventListener('pointerenter', () => { sobre = 1; });
  lienzo.parentElement.addEventListener('pointerleave', () => { sobre = 0; });
  let t = 0, ultimo = performance.now();
  function cuadro(ahora) {
    if (!visible) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora; t += dt;
    e += (objetivo + sobre * 0.12 - e) * Math.min(1, dt * 2);
    pulsoV *= 0.94; flash *= 0.92;
    const k = Math.min(1.4, e + pulsoV);
    const W = lado * px; const c = W / 2; const R = W * 0.36;
    ctx.clearRect(0, 0, W, W);
    // Aura
    const aura = ctx.createRadialGradient(c, c, R * 0.6, c, c, Math.min(c, R * (1.2 + k * 0.2)));
    aura.addColorStop(0, `rgba(146,210,245,${0.18 + k * 0.35})`); aura.addColorStop(1, 'rgba(146,210,245,0)');
    ctx.fillStyle = aura; ctx.fillRect(0, 0, W, W);
    // Anillos de órbita
    ctx.save(); ctx.translate(c, c); ctx.rotate(-0.35);
    ctx.strokeStyle = `rgba(204,225,218,${0.18 + k * 0.2})`; ctx.lineWidth = 1 * px;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.32, R * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(0.8); ctx.beginPath(); ctx.ellipse(0, 0, R * 1.22, R * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // Esfera
    ctx.save();
    ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.clip();
    // Vidrio celeste claro, más oscuro abajo (como la referencia)
    const base = ctx.createRadialGradient(c - R * 0.35, c - R * 0.45, R * 0.05, c, c, R * 1.05);
    base.addColorStop(0, '#b9e3f8'); base.addColorStop(0.35, '#69ace0'); base.addColorStop(0.75, '#2c6cc0'); base.addColorStop(1, '#173f96');
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, W);
    const abajo = ctx.createLinearGradient(0, c - R * 0.1, 0, c + R);
    abajo.addColorStop(0, 'rgba(14,52,140,0)'); abajo.addColorStop(1, 'rgba(10,40,120,0.55)');
    ctx.fillStyle = abajo; ctx.fillRect(0, 0, W, W);
    ctx.globalCompositeOperation = 'lighter';
    for (const n of nieblas) {
      n.a += n.v * dt * (0.4 + k * 2.2);
      const x = c + Math.cos(n.a) * n.r * R; const y = c + (Math.sin(n.a) * 0.45 + n.y) * n.r * R;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * n.t * (1 + k * 0.5));
      g.addColorStop(0, `rgba(${n.c},${(0.015 + k * 0.045).toFixed(3)})`); g.addColorStop(1, `rgba(${n.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    }
    for (const s of chispas) {
      s.a += dt * (0.3 + k); const x = c + Math.cos(s.a) * s.r * R; const y = c + Math.sin(s.a * 1.3) * s.r * R * 0.7;
      const al = (0.3 + 0.7 * Math.abs(Math.sin(t * 2 + s.f))) * (0.2 + k * 0.8);
      ctx.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, (0.8 + k) * px, 0, Math.PI * 2); ctx.fill();
    }
    if (flash > 0.01) { ctx.fillStyle = `rgba(230,245,255,${flash.toFixed(3)})`; ctx.fillRect(0, 0, W, W); }
    ctx.globalCompositeOperation = 'source-over';
    // Constelación que cruza la esfera
    ctx.strokeStyle = `rgba(255,255,255,${(0.18 + k * 0.25).toFixed(3)})`; ctx.lineWidth = 0.8 * px;
    ctx.beginPath();
    constelacion.forEach(([x, y], i) => { const X = c + x * R, Y = c + y * R; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke();
    constelacion.forEach(([x, y, g], i) => {
      const X = c + x * R, Y = c + y * R;
      const al = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.7);
      ctx.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`;
      if (g) estrella4(X, Y, (3.2 + k * 2) * px * al); else { ctx.beginPath(); ctx.arc(X, Y, (1.4 + k * 0.6) * px, 0, Math.PI * 2); ctx.fill(); }
    });
    // Brillo del cristal
    const brillo = ctx.createRadialGradient(c - R * 0.38, c - R * 0.45, 0, c - R * 0.38, c - R * 0.45, R * 0.55);
    brillo.addColorStop(0, 'rgba(255,255,255,0.55)'); brillo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = brillo; ctx.fillRect(0, 0, W, W);
    ctx.restore();
    ctx.strokeStyle = `rgba(204,225,218,${0.35 + k * 0.3})`; ctx.lineWidth = 1.5 * px;
    ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.stroke();
    if (!reducido) requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
  return {
    energia(v) { objetivo = v; if (reducido) requestAnimationFrame(cuadro); },
    pulso(v) { pulsoV = Math.min(0.8, pulsoV + v); },
    /** El deseo sale del orbe como una luz que sube hasta perderse. */
    async soltar(el) {
      flash = 1; pulsoV = 0.8;
      if (reducido) return;
      const r = el.getBoundingClientRect();
      const luz = document.createElement('span');
      luz.className = 'wk-deseo-luz';
      luz.style.left = `${r.left + r.width / 2}px`; luz.style.top = `${r.top + r.height / 2}px`;
      document.body.append(luz);
      luz.animate([
        { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.4)', opacity: 1, offset: 0.2 },
        { transform: `translate(calc(-50% + 60px), calc(-50% - ${r.top + 200}px)) scale(0.3)`, opacity: 0 },
      ], { duration: 1600, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' }).finished.then(() => luz.remove());
      await espera(900);
    },
  };
}
