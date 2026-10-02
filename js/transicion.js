// Transición entre páginas: una tinta de noche con borde vivo se derrama desde donde tocaste,
// en el centro se dibuja un sigilo, y la luz se abre desde el centro mostrando la página nueva.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lienzo, ctx, px = 1, W = 0, H = 0, sigilo;

function preparar() {
  if (ctx) return;
  lienzo = document.createElement('canvas');
  lienzo.className = 'wk-tinta';
  lienzo.setAttribute('aria-hidden', 'true');
  document.body.append(lienzo);
  ctx = lienzo.getContext('2d');
  sigilo = document.createElement('div');
  sigilo.className = 'wk-sigilo';
  sigilo.setAttribute('aria-hidden', 'true');
  sigilo.innerHTML = `<svg viewBox="-60 -60 120 120">
    <circle r="44" pathLength="1"/><circle r="36" pathLength="1" class="fino"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M0-52V-46" transform="rotate(${i * 45})" pathLength="1"/>`).join('')}
    <path class="estrella" d="M0-24C2-9 9-2 24 0 9 2 2 9 0 24-2 9-9 2-24 0-9-2-2-9 0-24Z" pathLength="1"/>
  </svg>`;
  document.body.append(sigilo);
  const medir = () => { px = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; lienzo.width = W * px; lienzo.height = H * px; };
  medir();
  addEventListener('resize', medir);
}

/** Forma orgánica: radio con ondas que se mueven (borde de niebla o raíz). */
function mancha(cx, cy, r, t) {
  ctx.beginPath();
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.09 * Math.sin(a * 5 + t * 4) + 0.05 * Math.sin(a * 11 - t * 6) + 0.035 * Math.sin(a * 17 + t * 9);
    const x = cx + Math.cos(a) * r * k, y = cy + Math.sin(a) * r * k;
    if (i) ctx.lineTo(x * px, y * px); else ctx.moveTo(x * px, y * px);
  }
  ctx.closePath();
}
function pintarNoche() {
  const g = ctx.createRadialGradient(W / 2 * px, H / 2 * px, 0, W / 2 * px, H / 2 * px, Math.hypot(W, H) / 2 * px);
  g.addColorStop(0, '#0b2a7a'); g.addColorStop(0.45, '#021a62'); g.addColorStop(1, '#000a2c');
  ctx.fillStyle = g;
}
function chispasBorde(cx, cy, r, t, alfa) {
  ctx.fillStyle = `rgba(200,235,255,${alfa})`;
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996 + t * 0.8;
    const rr = r * (1 + 0.09 * Math.sin(a * 5 + t * 4)) + Math.sin(t * 7 + i) * 8;
    ctx.beginPath(); ctx.arc((cx + Math.cos(a) * rr) * px, (cy + Math.sin(a) * rr) * px, (1 + (i % 3)) * px, 0, Math.PI * 2); ctx.fill();
  }
}
const anima = (dur, fn) => new Promise((ok) => {
  const t0 = performance.now();
  const paso = (ahora) => { const k = Math.min(1, (ahora - t0) / dur); fn(k, (ahora - t0) / 1000); if (k < 1) requestAnimationFrame(paso); else ok(); };
  requestAnimationFrame(paso);
});
const entrar = (k) => k * k * (3 - 2 * k);

/** Cubre la pantalla desde (x, y). */
export async function cubrir(x, y) {
  if (reducido) return;
  preparar();
  lienzo.classList.add('is-activa');
  const max = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) * 1.25;
  await anima(560, (k, t) => {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    const r = max * entrar(k);
    pintarNoche(); mancha(x, y, r, t); ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(146,210,245,0.9)'; ctx.shadowBlur = 18 * px;
    ctx.strokeStyle = 'rgba(146,210,245,0.55)'; ctx.lineWidth = 2 * px; mancha(x, y, r, t); ctx.stroke(); ctx.restore();
    chispasBorde(x, y, r, t, 0.8 * (1 - k * 0.6));
  });
  sigilo.classList.remove('is-sale'); void sigilo.offsetWidth;
  sigilo.classList.add('is-dibuja');
}

/** Descubre la página nueva: la luz se abre desde el centro. */
export async function descubrir() {
  if (reducido || !ctx) return;
  sigilo.classList.add('is-sale');
  const max = Math.hypot(W, H) * 0.62;
  await anima(700, (k, t) => {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    pintarNoche(); ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    const r = max * entrar(k);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; mancha(W / 2, H / 2, r, t + 3); ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(146,210,245,1)'; ctx.shadowBlur = 24 * px;
    ctx.strokeStyle = `rgba(200,235,255,${0.8 * (1 - k)})`; ctx.lineWidth = 2.5 * px; mancha(W / 2, H / 2, r, t + 3); ctx.stroke(); ctx.restore();
    chispasBorde(W / 2, H / 2, r, t, 0.9 * (1 - k));
  });
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  lienzo.classList.remove('is-activa');
  sigilo.classList.remove('is-dibuja', 'is-sale');
}
