// Portada del Walkiverso: la entrada "El bosque despierta" + el hero (como el de la web de Shopify).
// Entrada (cada vez que se llega al inicio): noche con niebla, las raíces crecen desde los bordes,
// las luciérnagas se juntan en el centro y aparece "Walkiverso". La primera vez espera que toques;
// después se abre sola. Al abrirse, las raíces se corren como un telón y las luciérnagas se dispersan.
// Hero: fotos que se alternan, raíces desde la izquierda, polvo que gira alrededor del mouse.
import { growBranches } from './ramas.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;
const suave = (t) => 1 - Math.pow(1 - t, 3);

/** Halo de luz pre-dibujado (como en wk-hero.js) */
function sprite([r, g, b]) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g2 = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g2.addColorStop(0, 'rgba(255,255,255,1)');
  g2.addColorStop(0.12, `rgba(${r},${g},${b},0.95)`);
  g2.addColorStop(0.35, `rgba(${r},${g},${b},0.28)`);
  g2.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = g2; x.fillRect(0, 0, 64, 64);
  return c;
}
const PALETA = [[146, 214, 255], [204, 225, 218], [255, 255, 255], [120, 190, 255]];
const SPRITES = PALETA.map(sprite);

/** Polvo de hadas sobre un canvas: flota, gira alrededor del mouse y estalla al tocar. */
function crearPolvo(canvas, { cantidad = 70 } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, motas = [], raf = 0, vivo = true, visible = true;
  const puntero = { x: -9999, y: -9999, activo: false };
  const imán = { activo: false, x: 0, y: 0, fuerza: 0 };
  const mota = (x, y, tipo = null) => {
    const a = Math.random() * Math.PI * 2;
    const v = tipo === 'estallido' ? 1.5 + Math.random() * 4.5 : 0;
    const estrella = Math.random() < (tipo ? 0.35 : 0.14);
    return {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (tipo ? 0.5 : 0), estrella,
      r: (W < 750 ? 0.85 : 1) * (estrella ? 2.5 + Math.random() * 3.5 : 0.6 + Math.random() * 1.6),
      c: Math.floor(Math.random() * PALETA.length), rot: Math.random() * Math.PI, giro: (Math.random() - 0.5) * 0.03,
      tit: 1.2 + Math.random() * 3, sube: 0.08 + Math.random() * 0.3, fase: Math.random() * Math.PI * 2,
      alfa: 0.35 + Math.random() * 0.6, vida: tipo ? 1 : Infinity, decae: tipo ? 0.006 + Math.random() * 0.01 : 0,
    };
  };
  const medir = () => {
    const r = canvas.getBoundingClientRect();
    const px = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * px); canvas.height = Math.round(H * px);
    ctx.setTransform(px, 0, 0, px, 0, 0);
    if (!motas.length) motas = Array.from({ length: Math.round(cantidad * (W < 750 ? 0.55 : 1)) }, () => mota(Math.random() * W, Math.random() * H));
  };
  medir();
  const ro = new ResizeObserver(medir); ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; bucle(); }); io.observe(canvas);
  const mover = (e) => { const r = canvas.getBoundingClientRect(); puntero.x = e.clientX - r.left; puntero.y = e.clientY - r.top; puntero.activo = true; };
  const salir = () => { puntero.activo = false; };
  canvas.parentElement.addEventListener('pointermove', mover);
  canvas.parentElement.addEventListener('pointerleave', salir);
  function cuadro(t0) {
    raf = 0;
    if (!vivo || !visible || document.hidden) return;
    const t = t0 / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = motas.length - 1; i >= 0; i--) {
      const m = motas[i];
      const efimera = m.vida !== Infinity;
      if (efimera) { m.vida -= m.decae; m.vx *= 0.955; m.vy = m.vy * 0.955 + 0.012; if (m.vida <= 0) { motas.splice(i, 1); continue; } }
      else { m.vx *= 0.94; m.vy *= 0.94; }
      // Remolino alrededor del cursor
      if (puntero.activo) {
        const dx = puntero.x - m.x, dy = puntero.y - m.y, d = Math.hypot(dx, dy);
        if (d < 190 && d > 1) { const f = (1 - d / 190) * (efimera ? 0.04 : 0.11); m.vx += (dx / d) * f - (dy / d) * f * 0.9; m.vy += (dy / d) * f + (dx / d) * f * 0.9; }
      }
      // Imán: las luciérnagas se juntan (entrada)
      if (imán.activo) {
        const dx = imán.x - m.x, dy = imán.y - m.y, d = Math.hypot(dx, dy) || 1;
        m.vx += (dx / d) * imán.fuerza - (dy / d) * imán.fuerza * 0.6;
        m.vy += (dy / d) * imán.fuerza + (dx / d) * imán.fuerza * 0.6;
      }
      m.x += m.vx + Math.sin(t * 0.6 + m.fase) * 0.25;
      m.y += m.vy - (efimera ? 0 : m.sube);
      m.rot += m.giro;
      if (!efimera) {
        if (m.y < -20) { m.y = H + 20; m.x = Math.random() * W; }
        if (m.x < -20) m.x = W + 20;
        if (m.x > W + 20) m.x = -20;
      }
      const brillo = 0.55 + 0.45 * Math.sin(t * m.tit + m.fase);
      const a = m.alfa * brillo * (efimera ? m.vida : 1);
      const halo = m.r * (m.estrella ? 5 : 7);
      ctx.globalAlpha = a;
      ctx.drawImage(SPRITES[m.c], m.x - halo, m.y - halo, halo * 2, halo * 2);
      if (m.estrella) {
        const [r, g, b] = PALETA[m.c];
        const s = m.r * (1.6 + brillo * 1.4);
        ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.rot);
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fillStyle = `rgb(${Math.round(r + (255 - r) * 0.6)},${Math.round(g + (255 - g) * 0.6)},${Math.round(b + (255 - b) * 0.6)})`; ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
    bucle();
  }
  function bucle() { if (!raf && vivo && visible && !document.hidden && !reducido) raf = requestAnimationFrame(cuadro); }
  if (reducido) requestAnimationFrame(cuadro); else bucle();
  document.addEventListener('visibilitychange', bucle);
  return {
    estallido(x, y, n = 34) { for (let i = 0; i < n; i++) motas.push(mota(x, y, 'estallido')); bucle(); },
    juntar(x, y, fuerza) { Object.assign(imán, { activo: fuerza > 0, x, y, fuerza }); },
    dispersar(x, y) {
      imán.activo = false;
      for (const m of motas) { const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy) || 1; m.vx += (dx / d) * (6 + Math.random() * 6); m.vy += (dy / d) * (6 + Math.random() * 6); }
    },
    get W() { return W; }, get H() { return H; },
    destruir() { vivo = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', bucle); canvas.parentElement?.removeEventListener('pointermove', mover); },
  };
}

/** Raíces de la entrada: desde los cuatro bordes hacia el centro. */
function raicesEntrada(svg, w, h) {
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const chico = w < 750;
  const alcance = Math.min(w, h) * (chico ? 0.62 : 0.5);
  const seeds = chico ? [
    [0, h * 0.2, 0.3, alcance, 1], [w, h * 0.12, Math.PI - 0.3, alcance * 0.9, -1],
    [0, h * 0.78, -0.3, alcance * 0.95, -1], [w, h * 0.88, Math.PI + 0.3, alcance, 1],
    [w * 0.5, 0, Math.PI / 2, alcance * 0.7, 1], [w * 0.45, h, -Math.PI / 2, alcance * 0.7, -1],
  ] : [
    [0, h * 0.14, 0.35, alcance, 1], [0, h * 0.62, -0.1, alcance * 0.85, -1],
    [w, h * 0.1, Math.PI - 0.35, alcance * 0.95, -1], [w, h * 0.7, Math.PI + 0.1, alcance * 0.9, 1],
    [w * 0.3, h, -1.3, alcance * 0.8, 1], [w * 0.72, h, -Math.PI + 1.3, alcance * 0.8, -1],
    [w * 0.34, 0, 1.25, alcance * 0.7, -1], [w * 0.66, 0, Math.PI - 1.25, alcance * 0.72, 1],
  ];
  growBranches(svg, { w, h, seeds, delay: 0.15, gap: chico ? 16 : 36 });
}

/** Raíces del hero (las mismas semillas que en Shopify). */
function raicesHero(svg, w, h, rapido = false) {
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const chico = w < 750;
  const alcance = Math.min(w, h) * (chico ? 0.5 : 0.46);
  const seeds = chico
    ? [[w * 0.04, h, -1.25, alcance * 0.9, 1], [w, h * 0.16, Math.PI - 0.35, alcance * 0.75, -1], [w * 0.97, h, -Math.PI + 1.3, alcance * 0.7, -1]]
    : [[w * 0.03, h, -1.3, alcance, 1], [w, h * 0.12, Math.PI - 0.3, alcance * 0.95, -1], [w, h * 0.92, Math.PI + 0.45, alcance * 0.8, 1], [0, h * 0.34, -0.12, alcance * 0.62, -1]];
  growBranches(svg, { w, h, seeds, instant: rapido, gap: chico ? 24 : 56 });
}

export function crearPortada(seccion, { esperarToque = false, alAbrir } = {}) {
  const velo = seccion.querySelector('.wk-velo');
  const lienzoVelo = velo.querySelector('canvas');
  const svgVelo = velo.querySelector('.wk-velo__raices');
  const tocar = velo.querySelector('.wk-velo__tocar');
  const saltar = velo.querySelector('.wk-velo__saltar');
  const hero = seccion.querySelector('.wk-hero');
  const svgHero = hero.querySelector('.wk-hero__raices');
  const polvoHero = crearPolvo(hero.querySelector('.wk-hero__polvo'), { cantidad: 72 });
  const polvoVelo = crearPolvo(lienzoVelo, { cantidad: 110 });
  let fase = 'creciendo', espera = 0;

  // Fotos del hero: se alternan solas
  const fotos = [...hero.querySelectorAll('.wk-hero__foto')];
  let actual = 0;
  const rotar = fotos.length > 1 ? setInterval(() => {
    fotos[actual].classList.remove('is-activa');
    actual = (actual + 1) % fotos.length;
    fotos[actual].classList.add('is-activa');
  }, 6000) : 0;

  const medirVelo = () => raicesEntrada(svgVelo, velo.clientWidth, velo.clientHeight);
  let anchoHero = 0;
  const medirHero = (rapido) => { const w = hero.clientWidth; if (Math.abs(w - anchoHero) < 40) return; anchoHero = w; raicesHero(svgHero, w, hero.clientHeight, rapido); };
  medirVelo();
  medirHero(false);
  const ro = new ResizeObserver(() => medirHero(true)); ro.observe(hero);

  // Parallax suave del hero con el mouse
  const mover = (e) => {
    if (tactil || reducido) return;
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    hero.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  hero.addEventListener('pointermove', mover);
  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const r = hero.getBoundingClientRect();
    polvoHero.estallido(e.clientX - r.left, e.clientY - r.top);
  });

  // ---------- Secuencia de la entrada
  const listo = () => { fase = 'abierta'; velo.hidden = true; seccion.classList.add('is-abierta'); polvoVelo.destruir(); alAbrir?.(); };
  if (reducido) { listo(); hero.classList.add('is-lista'); }
  else {
    requestAnimationFrame(() => velo.classList.add('is-creciendo'));
    // Las luciérnagas se juntan en el centro mientras crecen las raíces
    setTimeout(() => polvoVelo.juntar(polvoVelo.W / 2, polvoVelo.H / 2, 0.05), 700);
    setTimeout(() => velo.classList.add('is-nombre'), 1500);
    if (esperarToque) espera = setTimeout(() => { fase = 'esperando'; velo.classList.add('is-esperando'); tocar.hidden = false; tocar.focus({ preventScroll: true }); }, 2600);
    else espera = setTimeout(() => abrir(), 2900);
  }

  async function abrir(rapido = false) {
    if (fase === 'abriendo' || fase === 'abierta') return;
    clearTimeout(espera);
    fase = 'abriendo';
    tocar.hidden = true;
    velo.classList.remove('is-esperando');
    velo.classList.add('is-creciendo', 'is-nombre', 'is-abriendo');
    if (rapido) velo.classList.add('is-rapido');
    polvoVelo.dispersar(polvoVelo.W / 2, polvoVelo.H / 2);
    hero.classList.add('is-lista');
    await new Promise((r) => setTimeout(r, rapido ? 500 : 1500));
    listo();
  }
  tocar.addEventListener('click', () => abrir());
  saltar.addEventListener('click', () => abrir(true));
  velo.addEventListener('click', (e) => { if (fase === 'esperando' && !e.target.closest('button')) abrir(); });
  const apurar = () => { if (fase === 'creciendo' || fase === 'esperando') abrir(true); };
  addEventListener('wheel', apurar, { passive: true });
  addEventListener('touchmove', apurar, { passive: true });
  const tecla = (e) => { if (['Escape', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && fase !== 'abierta' && !e.target.closest?.('a')) { e.preventDefault(); abrir(e.key !== 'Enter'); } };
  addEventListener('keydown', tecla);

  return {
    destruir() {
      clearTimeout(espera); clearInterval(rotar);
      ro.disconnect();
      polvoHero.destruir(); polvoVelo.destruir();
      removeEventListener('wheel', apurar); removeEventListener('touchmove', apurar); removeEventListener('keydown', tecla);
    },
  };
}

/** Marcado de la portada (lo usa paginas/inicio.js). */
export const marcadoPortada = ({ esc, T, info, imagenes }) => `
  <section class="wk-portada" id="entrada" aria-label="${esc(info.name)}">
    <div class="wk-hero">
      <div class="wk-hero__fondo" aria-hidden="true">
        ${imagenes.map((src, i) => `<img class="wk-hero__foto${i === 0 ? ' is-activa' : ''}" src="${esc(src)}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`).join('')}
        <span class="wk-hero__aura"></span>
        <span class="wk-hero__sombra"></span>
      </div>
      <svg class="wk-hero__raices" aria-hidden="true" focusable="false"></svg>
      <canvas class="wk-hero__polvo" aria-hidden="true"></canvas>
      <div class="wk-hero__contenido">
        <p class="wk-hero__ante"><span aria-hidden="true"></span>${esc(T.hero.antetitulo)}</p>
        <h1 class="wk-hero__titulo2" aria-label="${esc(T.hero.titulo)}">${(() => { let n = 0; return T.hero.titulo.split(' ').map((w) => `<span class="wk-hero__palabra" aria-hidden="true">${[...w].map((c) => `<span class="wk-hero__letra" style="--i:${n++}">${esc(c)}</span>`).join('')}</span>`).join(' '); })()}</h1>
        <p class="wk-hero__texto">${esc(T.hero.bajada)}</p>
        <div class="wk-hero__acciones">
          <a class="wk-btn wk-btn--luz wk-btn--grande-hero" href="/tienda" data-link><span>${esc(T.hero.boton)}</span><svg aria-hidden="true"><use href="#i-flecha"/></svg></a>
          <a class="wk-enlace" href="/walkurio" data-link>${esc(T.hero.boton2)}</a>
        </div>
      </div>
      <a class="wk-hero__bajar" href="#recorrer"><span>${esc(T.entrada.bajar)}</span><i aria-hidden="true"></i></a>
    </div>

    <div class="wk-velo" aria-hidden="false">
      <span class="wk-velo__niebla" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="wk-velo__luna" aria-hidden="true"></span>
      <svg class="wk-velo__raices" aria-hidden="true" focusable="false"></svg>
      <canvas class="wk-velo__luces" aria-hidden="true"></canvas>
      <p class="wk-velo__nombre" aria-hidden="true">${[...info.name].map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join('')}</p>
      <p class="wk-velo__lema" aria-hidden="true">${esc(T.entrada.lema)}</p>
      <button type="button" class="wk-velo__tocar" hidden><span class="wk-velo__luciernaga" aria-hidden="true"></span>${esc(T.entrada.tocar)}</button>
      <button type="button" class="wk-velo__saltar">${esc(T.entrada.saltar)}</button>
    </div>
  </section>`;
