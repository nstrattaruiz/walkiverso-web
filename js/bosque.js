// El bosque vivo: fondo de la web (adaptado de "Walkiverso fondo").
// Capas pintadas una sola vez en canvas (cielo, árboles lejanos, claro con sendero, ramas en primer plano)
// que después solo se mueven: siguen al mouse con distinta inercia, se mecen con el viento, la niebla respira,
// hay luciérnagas y polvo que se apartan del cursor, y ojos de criaturas que parpadean y se esconden si te acercás.
// Al entrar, las ramas se abren como un telón.

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (s, dt) => 1 - Math.pow(1 - s, dt * 60); // suavizado independiente de los fps
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const setT = (o, s) => { if (o._t !== s) { o.el.style.transform = s; o._t = s; } };
const setO = (o, v) => { v = Math.round(v * 1000) / 1000; if (o._o !== v) { o.el.style.opacity = v; o._o = v; } };
const wind = (t) => Math.sin(t * 0.27) * 0.55 + Math.sin(t * 0.61 + 1.7) * 0.3 + Math.sin(t * 1.33 + 0.4) * 0.15;

const MARCADO = `
  <div class="wb-capa" data-l="sky"><canvas data-c="sky"></canvas></div>
  <div class="wb-capa wb-glow" data-l="glow"></div>
  <div class="wb-capa wb-niebla wb-niebla--1" data-l="fog1"></div>
  <div class="wb-capa" data-l="far"><canvas data-c="far"></canvas></div>
  <div class="wb-capa" data-l="mid">
    <canvas data-c="mid"></canvas>
    <div class="wb-ojos" data-x=".27" data-y=".6" style="left:27%;top:60%;--s:7px"><i></i><i></i></div>
    <div class="wb-ojos" data-x=".71" data-y=".625" style="left:71%;top:62.5%;--s:9px"><i></i><i></i></div>
    <div class="wb-ojos" data-x=".57" data-y=".545" style="left:57%;top:54.5%;--s:4px"><i></i><i></i></div>
  </div>
  <div class="wb-capa wb-niebla wb-niebla--2" data-l="fog2"></div>
  <canvas class="wb-motas" data-c="motas"></canvas>
  <div class="wb-capa" data-l="fore"><canvas data-c="izq" class="wb-izq"></canvas><canvas data-c="der" class="wb-der"></canvas></div>
  <div class="wb-capa" data-l="front"><canvas data-c="fl" class="wb-fl"></canvas><canvas data-c="fr" class="wb-fr"></canvas></div>
  <div class="wb-vineta"></div>
  <div class="wb-sombra" data-o="sombra"></div>`;

export function crearBosque(raiz) {
  raiz.innerHTML = MARCADO;
  const $ = (s) => raiz.querySelector(s);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOBILE = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
  const LOWEND = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const Q = { dpr: Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 1.75), pdpr: Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : 1.5), max: REDUCED ? 14 : MOBILE ? 55 : LOWEND ? 80 : 150, level: 0 };
  Q.active = Q.max;
  let vw = innerWidth, vh = innerHeight;
  // Estado: drift (viento), depth (profundidad), open (telón abierto), cam (cámara adentro), world (luces y criaturas)
  const S = { drift: 1, depth: 1, open: 1, cam: 0, world: 1 };
  let T = 0, camZ = 0, scrollS = 0, vivo = true, activo = true, raf = 0, ultimo = performance.now();
  const curtain = { o: 1, v: 0, r: 0, rv: 0 };
  let objetivoAbrir = 1;

  // ---------------------------------------------------------------- dibujo procedural (una sola vez)
  function prep(cv, res) {
    const w = cv.offsetWidth, h = cv.offsetHeight, d = Q.dpr * res;
    cv.width = Math.max(1, Math.round(w * d)); cv.height = Math.max(1, Math.round(h * d));
    const ctx = cv.getContext('2d');
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    return { ctx, w, h };
  }
  function leafCluster(ctx, r, x, y, ang, o, mult = 1) {
    const n = Math.round(o.leaves * mult * (0.6 + r() * 0.8));
    for (let i = 0; i < n; i++) {
      const d = r() * o.leafSpread, a = r() * 6.2832, s = o.leafSize * (0.55 + r() * 0.7);
      ctx.save();
      ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8);
      ctx.rotate(ang + (r() - 0.5) * 2.4);
      ctx.fillStyle = o.leafColors[(r() * o.leafColors.length) | 0];
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 0.5, -s * 0.28, s, 0);
      ctx.quadraticCurveTo(s * 0.5, s * 0.28, 0, 0);
      ctx.fill(); ctx.restore();
    }
  }
  function drawBranch(ctx, r, x, y, ang, len, w, depth, o) {
    const a2 = ang + (r() - 0.5) * o.bend;
    const x2 = x + Math.cos(a2) * len, y2 = y + Math.sin(a2) * len;
    const off = (r() - 0.5) * len * 0.25;
    const mx = (x + x2) / 2 + Math.cos(ang + 1.5708) * off, my = (y + y2) / 2 + Math.sin(ang + 1.5708) * off;
    ctx.strokeStyle = o.bark; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
    const endAng = Math.atan2(y2 - my, x2 - mx);
    if (depth <= 0 || len < o.min) { if (o.leaves) leafCluster(ctx, r, x2, y2, endAng, o); return; }
    if (o.leaves && depth <= o.leafDepth && r() < 0.6) leafCluster(ctx, r, mx, my, endAng, o, 0.6);
    const kids = r() < o.fork3 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const spread = (i - (kids - 1) / 2) * o.spread + (r() - 0.5) * o.jitter;
      drawBranch(ctx, r, x2, y2, endAng + spread + o.gravity, len * (o.decay + r() * 0.15), Math.max(0.6, w * o.thin), depth - 1, o);
    }
  }
  function drawSky() {
    const { ctx, w, h } = prep($('[data-c=sky]'), 0.5), r = rng(1);
    let g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#02040c'); g.addColorStop(0.45, '#071230'); g.addColorStop(0.6, '#0c1c44'); g.addColorStop(1, '#03060f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.53;
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
    g.addColorStop(0, 'rgba(190,212,255,.36)'); g.addColorStop(0.12, 'rgba(140,175,240,.16)'); g.addColorStop(0.4, 'rgba(60,90,170,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(cx, -h * 0.15); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const a = 1.5708 - 0.36 + i * 0.12 + (r() - 0.5) * 0.05, e = 0.012 + r() * 0.02, L = h * 1.3;
      const rg = ctx.createLinearGradient(0, 0, 0, L);
      rg.addColorStop(0, 'rgba(170,200,250,.05)'); rg.addColorStop(1, 'rgba(170,200,250,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - e) * L, Math.sin(a - e) * L); ctx.lineTo(Math.cos(a + e) * L, Math.sin(a + e) * L); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#e6eeff';
    for (let i = 0, n = Math.round((80 * w) / 1600); i < n; i++) {
      ctx.globalAlpha = 0.15 + r() * 0.35;
      ctx.beginPath(); ctx.arc(r() * w, r() * h * 0.42, 0.4 + r() * 0.8, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawFar() {
    const { ctx, w, h } = prep($('[data-c=far]'), 0.75), r = rng(3), k = w / 1600;
    const o = { bark: 'rgba(26,40,82,.5)', leaves: 6, leafColors: ['rgba(30,46,92,.4)', 'rgba(36,54,104,.35)'], leafSpread: 14 * k, leafSize: 10 * k, leafDepth: 1, min: 6, bend: 0.3, spread: 0.5, jitter: 0.3, gravity: 0, decay: 0.7, thin: 0.65, fork3: 0.2 };
    for (let i = 0; i < 26; i++) {
      const x = r() * w, tw = (4 + r() * 12) * k, al = 0.3 + r() * 0.35;
      ctx.fillStyle = `rgba(${(16 + r() * 8) | 0},${(26 + r() * 12) | 0},${(58 + r() * 18) | 0},${al})`;
      ctx.beginPath(); ctx.moveTo(x - tw / 2, h); ctx.lineTo(x - tw * 0.22, -10); ctx.lineTo(x + tw * 0.22, -10); ctx.lineTo(x + tw / 2, h); ctx.fill();
      o.bark = ctx.fillStyle;
      for (let j = 0; j < 3; j++) drawBranch(ctx, r, x, h * (0.08 + r() * 0.38), -1.5708 + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6), (30 + r() * 50) * k, tw * 0.3, 3, o);
    }
    const g = ctx.createLinearGradient(0, h * 0.45, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, 'rgba(80,105,170,.16)'); g.addColorStop(1, 'rgba(4,9,24,.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  function drawMid() {
    const { ctx, w, h } = prep($('[data-c=mid]'), 1), r = rng(7), k = w / 1600, hz = h * 0.585;
    ctx.fillStyle = '#04081a';
    ctx.beginPath(); ctx.moveTo(0, hz + 30 * k);
    ctx.bezierCurveTo(w * 0.25, hz - 10 * k, w * 0.4, hz + 12 * k, w * 0.5, hz + 4 * k);
    ctx.bezierCurveTo(w * 0.62, hz - 4 * k, w * 0.78, hz - 14 * k, w, hz + 26 * k);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    const vx = w * 0.5, vy = hz + 5 * k;
    const g = ctx.createLinearGradient(0, vy, 0, h);
    g.addColorStop(0, 'rgba(190,210,250,.24)'); g.addColorStop(1, 'rgba(105,130,195,.04)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(vx - 3 * k, vy);
    ctx.quadraticCurveTo(vx - 50 * k, hz + (h - hz) * 0.5, w * 0.3, h); ctx.lineTo(w * 0.7, h);
    ctx.quadraticCurveTo(vx + 60 * k, hz + (h - hz) * 0.5, vx + 3 * k, vy); ctx.fill();
    ctx.strokeStyle = '#060c22'; ctx.lineWidth = 1.2 * k + 0.4;
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = hz + 20 * k + r() * (h - hz), s = (4 + r() * 10) * k * (y / h);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (r() - 0.5) * s, y - s * 0.6, x + (r() - 0.5) * s * 0.8, y - s); ctx.stroke();
    }
    const o = { bark: '#050b1d', leaves: 16, leafColors: ['#070e24', '#09122c', '#0c1734', '#101d3e'], leafSpread: 26 * k, leafSize: 18 * k, leafDepth: 3, min: 8 * k, bend: 0.3, spread: 0.55, jitter: 0.35, gravity: -0.04, decay: 0.72, thin: 0.66, fork3: 0.3 };
    [0.12, 0.2, 0.8, 0.9].forEach((px) => {
      const x = px * w, tw = (34 + r() * 30) * k;
      ctx.fillStyle = '#050b1d';
      ctx.beginPath(); ctx.moveTo(x - tw / 2, h); ctx.quadraticCurveTo(x - tw * 0.3, h * 0.5, x - tw * 0.18, h * 0.08);
      ctx.lineTo(x + tw * 0.18, h * 0.08); ctx.quadraticCurveTo(x + tw * 0.3, h * 0.5, x + tw / 2, h); ctx.fill();
      for (let j = 0; j < 4; j++) drawBranch(ctx, r, x, h * (0.1 + j * 0.1 + r() * 0.05), -1.5708 + (px < 0.5 ? 1 : -1) * (0.5 + r() * 0.5), (90 + r() * 70) * k, tw * 0.28, 4, o);
    });
  }
  function drawCurtain(cv, seed, mirror) {
    const { ctx, w, h } = prep(cv, 1), r = rng(seed), k = clamp(w / 1100, 0.55, 1.3);
    if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const o = { bark: '#02040c', leafColors: ['#03060f', '#050a1a', '#070e24', '#09122c', '#0c1734', '#0f1a3c'], min: 10 * k, bend: 0.35, spread: 0.55, jitter: 0.35, gravity: 0, decay: 0.72, thin: 0.66, fork3: 0.3, leaves: 22, leafSpread: 30 * k, leafSize: 22 * k, leafDepth: 3 };
    const mass = { ...o, leaves: 30, leafSpread: 60 * k, leafSize: 30 * k };
    for (let i = 0; i < 40; i++) leafCluster(ctx, r, r() * w * 0.12, r() * h, r() * 6.28, mass);
    for (let i = 0; i < 8; i++) {
      const y = h * (0.06 + i * 0.125 + (r() - 0.5) * 0.05);
      drawBranch(ctx, r, -10, y, (0.5 - y / h) * 0.7 + (r() - 0.5) * 0.35, w * (0.26 + r() * 0.12), (14 + r() * 12) * k, 5, o);
    }
    ctx.globalCompositeOperation = 'source-atop';
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(100,130,200,.05)'); g.addColorStop(1, 'rgba(140,175,240,.16)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawFront(cv, seed, flip) {
    // Baja resolución a propósito: el reescalado hace de desenfoque de profundidad
    const { ctx, w, h } = prep(cv, 0.35), r = rng(seed), k = clamp(w / 900, 0.5, 1.4);
    if (flip) { ctx.translate(w, h); ctx.scale(-1, -1); }
    if ('filter' in ctx) ctx.filter = 'blur(1.5px)';
    const o = { bark: '#02030a', leafColors: ['#02030a', '#03050f', '#040714', '#050918'], min: 14 * k, bend: 0.3, spread: 0.6, jitter: 0.3, gravity: 0.05, decay: 0.7, thin: 0.64, fork3: 0.25, leaves: 14, leafSpread: 70 * k, leafSize: 60 * k, leafDepth: 2 };
    drawBranch(ctx, r, -20, h * 0.15, 0.35, w * 0.45, 34 * k, 4, o);
    drawBranch(ctx, r, w * 0.1, -20, 1.1, h * 0.5, 26 * k, 3, o);
  }
  function drawAll() {
    drawSky(); drawFar(); drawMid();
    drawFront($('[data-c=fl]'), 5, false); drawFront($('[data-c=fr]'), 9, true);
    sizeParticles();
  }

  // ---------------------------------------------------------------- capas con profundidad (cada una con su inercia)
  const Lyr = (l, lerp, amp, depth, op) => ({ el: $(`[data-l=${l}]`), lerp, amp, depth, op, mx: 0, my: 0, _t: '', _o: -1 });
  const LAYERS = [
    Lyr('sky', 0.01, 10, 0.03),
    Lyr('glow', 0.01, 10, 0.05, () => 0.12 + S.depth * 0.18 + curtain.o * 0.55 + S.world * 0.15),
    Lyr('far', 0.015, 18, 0.1),
    Lyr('fog1', 0.018, 22, 0.14, () => 0.25 + S.depth * 0.5 + S.world * 0.25),
    Lyr('mid', 0.025, 34, 0.26),
    Lyr('fog2', 0.035, 50, 0.45, () => (0.2 + S.depth * 0.5) * (1 - S.world * 0.35)),
    Lyr('fore', 0.05, 70, 0.9, () => 1 - smooth(0.4, 1, camZ) * 0.7),
    Lyr('front', 0.06, 110, 1.5, () => 0.95 - smooth(0.15, 0.9, camZ) * 0.55),
  ];
  const FORE = LAYERS[6];
  const cvL = { el: $('[data-c=izq]'), _t: '' }, cvR = { el: $('[data-c=der]'), _t: '' };
  const cvFL = { el: $('[data-c=fl]'), _t: '' }, cvFR = { el: $('[data-c=fr]'), _t: '' };
  const sombra = { el: $('[data-o=sombra]'), _o: -1 };

  // ---------------------------------------------------------------- mouse: objetivo vs. actual
  const mouse = { nx: 0, ny: 0, x: vw / 2, y: vh / 2, moved: false, vx: 0 };
  const alMover = (e) => {
    if (e.pointerType === 'touch') return;
    mouse.vx = e.clientX - mouse.x;
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / vw) * 2 - 1; mouse.ny = (e.clientY / vh) * 2 - 1;
    mouse.moved = true;
  };
  addEventListener('pointermove', alMover, { passive: true });

  // ---------------------------------------------------------------- criaturas: respiran, parpadean, se esconden
  const ojos = [...raiz.querySelectorAll('.wb-ojos')].map((el) => ({ el, _t: '', _o: -1, px: +el.dataset.x, py: +el.dataset.y, ph: Math.random() * 6.28, next: 2 + Math.random() * 4, bt: -1, shy: 0, vis: 0, lx: 0 }));
  function updateOjos(dt) {
    const mid = LAYERS[4];
    for (const c of ojos) {
      const breath = REDUCED ? 1 : 1 + Math.sin(T * 1.1 + c.ph) * 0.025;
      let bl = 1;
      if (T > c.next && c.bt < 0) c.bt = 0;
      if (c.bt >= 0) {
        c.bt += dt; const u = c.bt / 0.22;
        if (u >= 1) { c.bt = -1; c.next = T + (Math.random() < 0.25 ? 0.25 : 2.5 + Math.random() * 5); } else bl = 1 - Math.sin(u * Math.PI) * 0.92;
      }
      const sx = (-0.08 + c.px * 1.16) * vw, sy = (-0.08 + c.py * 1.16) * vh;
      const near = FINE && mouse.moved && Math.hypot(mouse.x - sx, mouse.y - sy) < 170 ? 1 : 0;
      c.shy += (near - c.shy) * damp(near ? 0.05 : 0.01, dt);
      const vis = (0.35 * S.depth * (1 - curtain.o) + S.world * 0.9) * (1 - c.shy * 0.85) * (1 - smooth(0.2, 0.8, camZ));
      c.vis += (vis - c.vis) * damp(0.03, dt);
      c.lx += ((REDUCED ? 0 : mid.mx * 3) - c.lx) * damp(0.04, dt);
      setT(c, `translate3d(${c.lx.toFixed(2)}px,${(mid.my * 1.5).toFixed(2)}px,0) scale(${breath.toFixed(4)},${(breath * bl).toFixed(4)})`);
      setO(c, c.vis);
    }
  }

  // ---------------------------------------------------------------- polvo y luciérnagas
  const pcv = $('[data-c=motas]'), pctx = pcv.getContext('2d');
  let pw = vw, ph = vh;
  function sprite(r, g, b, size, core) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(core, `rgba(${r},${g},${b},.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, size, size); return c;
  }
  const SPR_DUST = sprite(210, 225, 255, 32, 0.25), SPR_FLY = sprite(240, 200, 120, 64, 0.12);
  const P = [];
  const spawn = (p) => {
    p.x = Math.random() * pw; p.y = Math.random() * ph; p.z = 0.25 + Math.random() * 0.75;
    p.vx = 0; p.vy = 0; p.a = Math.random() * 6.283; p.ph = Math.random() * 6.283;
    p.fly = Math.random() < 0.14; p.s = p.fly ? 10 + p.z * 16 : 1.5 + p.z * 3.2; p.sx = p.x; p.sy = p.y;
    return p;
  };
  function sizeParticles() {
    const ow = pw, oh = ph;
    pw = pcv.offsetWidth; ph = pcv.offsetHeight;
    pcv.width = Math.round(pw * Q.pdpr); pcv.height = Math.round(ph * Q.pdpr);
    pctx.setTransform(Q.pdpr, 0, 0, Q.pdpr, 0, 0);
    if (!P.length) for (let i = 0; i < Q.max; i++) P.push(spawn({}));
    else for (const p of P) { p.x *= pw / ow; p.y *= ph / oh; }
  }
  const cur = { x: vw / 2, y: vh / 2 };
  function updateParticles(dt) {
    pctx.clearRect(0, 0, pw, ph);
    cur.x += (mouse.x - cur.x) * damp(0.12, dt); cur.y += (mouse.y - cur.y) * damp(0.12, dt);
    const dustVis = REDUCED ? 0.5 : 0.15 * S.depth + 0.85 * S.world, flyVis = REDUCED ? 0 : S.world;
    const dn = dt * 60, fr = Math.pow(0.96, dn), mot = REDUCED ? 0.25 : 1;
    const depthOn = REDUCED ? 0 : 0.25 + 0.75 * S.depth;
    const parX = -FORE.mx * 60 * depthOn, parY = -FORE.my * 34 * depthOn;
    const cx = pw / 2, cy = ph * 0.54, R = 140, R2 = R * R, rep = FINE && mouse.moved;
    pctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < Q.active; i++) {
      const p = P[i];
      p.a += (Math.sin(T * 0.3 + p.ph) * 0.02 + (Math.random() - 0.5) * 0.06) * dn;
      const acc = (p.fly ? 0.012 : 0.006) * p.z * mot;
      p.vx += Math.cos(p.a) * acc * dn;
      p.vy += (Math.sin(p.a) * acc - (p.fly ? 0.001 : 0.0025) * p.z * mot) * dn;
      if (rep) {
        const dx = p.sx - cur.x, dy = p.sy - cur.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / R) ** 2 * 0.35 * p.z * dn; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
      p.vx *= fr; p.vy *= fr; p.x += p.vx * dn; p.y += p.vy * dn;
      if (p.y < -30) { p.y = ph + 30; p.x = Math.random() * pw; } else if (p.y > ph + 30) p.y = -30;
      if (p.x < -30) p.x = pw + 30; else if (p.x > pw + 30) p.x = -30;
      const cs = 1 + camZ * p.z * 0.35;
      p.sx = cx + (p.x - cx) * cs + parX * p.z;
      p.sy = cy + (p.y - cy) * cs + parY * p.z;
      let a;
      if (p.fly) a = (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(T * (0.8 + p.z * 0.6) + p.ph), 2)) * flyVis * 0.9;
      else a = (0.25 + 0.35 * p.z) * dustVis;
      if (p.sx < -40 || p.sx > pw + 40 || p.sy < -40 || p.sy > ph + 40) continue;
      pctx.globalAlpha = a;
      pctx.drawImage(p.fly ? SPR_FLY : SPR_DUST, p.sx - p.s / 2, p.sy - p.s / 2, p.s, p.s);
    }
    pctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- mundo: cámara, capas, ramas
  function updateWorld(dt) {
    const drift = REDUCED ? 0 : S.drift, depthOn = REDUCED ? 0 : 0.25 + 0.75 * S.depth;
    if (!FINE) { mouse.nx = Math.sin(T * 0.07) * 0.3; mouse.ny = Math.sin(T * 0.05 + 1) * 0.15; }
    scrollS += (scrollY - scrollS) * (REDUCED ? 1 : damp(0.09, dt));
    const sp = clamp(scrollS / (vh * 2.5), 0, 1);
    const camT = S.cam + sp * 0.35;
    camZ = REDUCED ? camT : camZ + (camT - camZ) * damp(0.045, dt);
    S.open += (objetivoAbrir - S.open) * damp(REDUCED ? 1 : 0.025, dt);
    // Resorte de apertura: pesado, con un pequeño rebote
    const steps = Math.ceil(dt / (1 / 120)), h = dt / steps;
    const rotT = wind(T) * 0.8 * drift + (REDUCED ? 0 : FORE.mx * 1.2);
    mouse.vx *= 0.5;
    for (let i = 0; i < steps; i++) {
      curtain.v += (10 * (S.open - curtain.o) - 4.4 * curtain.v) * h; curtain.o += curtain.v * h;
      curtain.rv += (6 * (rotT - curtain.r) - 2.6 * curtain.rv) * h; curtain.r += curtain.rv * h;
    }
    if (REDUCED) { curtain.o = S.open; curtain.r = 0; }
    for (let i = 0; i < LAYERS.length; i++) {
      const L = LAYERS[i], d = damp(L.lerp, dt);
      L.mx += (mouse.nx - L.mx) * d; L.my += (mouse.ny - L.my) * d;
      const amp = L.amp * depthOn;
      const x = -L.mx * amp + Math.sin(T * 0.11 + i) * 1.2 * drift * Math.min(1, L.depth * 2);
      const y = -L.my * amp * 0.55 + Math.sin(T * 0.37 + i * 1.3) * 1.6 * drift * Math.min(1, L.depth * 2) - Math.min(scrollS, vh * 3) * L.depth * 0.03;
      setT(L, `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${(1 + camZ * L.depth * 0.5).toFixed(4)})`);
      if (L.op) setO(L, clamp(L.op(), 0, 1));
    }
    const o = curtain.o, micro = Math.sin(T * 0.9) * drift, microY = Math.sin(T * 0.7 + 2) * drift;
    setT(cvL, `translate3d(${(-o * vw * 0.55 + micro).toFixed(2)}px,${microY.toFixed(2)}px,0) rotate(${(-o * 7 + curtain.r).toFixed(3)}deg)`);
    setT(cvR, `translate3d(${(o * vw * 0.55 - micro).toFixed(2)}px,${(-microY).toFixed(2)}px,0) rotate(${(o * 7 - curtain.r * 0.9).toFixed(3)}deg)`);
    setT(cvFL, `translate3d(${(-o * vw * 0.22).toFixed(2)}px,${(-o * vh * 0.14).toFixed(2)}px,0) rotate(${(curtain.r * 1.4 - o * 4).toFixed(3)}deg)`);
    setT(cvFR, `translate3d(${(o * vw * 0.22).toFixed(2)}px,${(o * vh * 0.14).toFixed(2)}px,0) rotate(${(-curtain.r * 1.2 + o * 4).toFixed(3)}deg)`);
    // Al bajar, el bosque queda detrás de una penumbra para que el contenido se lea
    setO(sombra, smooth(vh * 0.2, vh * 1.1, scrollS) * 0.62);
  }

  // ---------------------------------------------------------------- rendimiento: si cae el fps, se simplifica
  let mAcc = 0, mN = 0;
  function monitor(raw) {
    if (T < 1.5 || raw > 0.25) return;
    mAcc += raw; mN++;
    if (mN < 120) return;
    const avg = mAcc / mN; mAcc = 0; mN = 0;
    if (avg > 1 / 45 && Q.level < 3) {
      Q.level++;
      Q.active = Math.max(10, Math.floor(Q.active * 0.55));
      if (Q.level >= 2 && Q.pdpr > 1) { Q.pdpr = 1; sizeParticles(); }
      raiz.classList.add(`q${Q.level}`);
    }
  }
  function cuadro(now) {
    raf = 0;
    if (!vivo || !activo || document.hidden) return;
    const raw = (now - ultimo) / 1000; ultimo = now;
    monitor(raw);
    const dt = Math.min(raw, 0.1);
    T += dt;
    updateWorld(dt); updateOjos(dt); updateParticles(dt);
    raf = requestAnimationFrame(cuadro);
  }
  const seguir = () => { if (!raf && vivo && activo && !document.hidden) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro); } };
  document.addEventListener('visibilitychange', seguir);

  let rT = 0, lastW = vw, lastH = vh;
  const alRedimensionar = () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      vw = innerWidth; vh = innerHeight;
      if (vw === lastW && Math.abs(vh - lastH) < 120) { sizeParticles(); return; } // barra del navegador del celular
      lastW = vw; lastH = vh;
      drawAll();
    }, 200);
  };
  addEventListener('resize', alRedimensionar);
  drawAll();
  seguir();

  return {
    /** Abre las ramas (telón). */
    abrir(rapido = false) { objetivoAbrir = 1; if (rapido) { S.open = 1; curtain.o = 1; } },
    /** Cierra las ramas (para la entrada del inicio). */
    cerrar() {},
    /** Prende o apaga el bosque (en las páginas claras no se dibuja). */
    activo(si) { activo = si; raiz.classList.toggle('is-apagado', !si); if (si) seguir(); },
    destruir() { vivo = false; cancelAnimationFrame(raf); removeEventListener('pointermove', alMover); removeEventListener('resize', alRedimensionar); document.removeEventListener('visibilitychange', seguir); },
  };
}
