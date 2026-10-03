// Polvo de hadas por toda la web: sigue al mouse (y al dedo en celular) y cada toque suelta un destello.
// Sin movimiento reducido. Todo en un solo canvas fijo que solo dibuja cuando hay chispas.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const colores = ['196,214,255', '232,238,255', '255,255,255', '150,180,250', '246,226,180'];
let ctx, lienzo, px = 1, chispas = [], anillos = [], activo = false;

function prender() {
  if (ctx || reducido) return !!ctx;
  lienzo = document.createElement('canvas');
  lienzo.className = 'wk-polvo';
  lienzo.setAttribute('aria-hidden', 'true');
  document.body.append(lienzo);
  ctx = lienzo.getContext('2d');
  const medir = () => { px = Math.min(devicePixelRatio || 1, 2); lienzo.width = innerWidth * px; lienzo.height = innerHeight * px; };
  medir();
  addEventListener('resize', medir);
  return true;
}
function soltar(x, y, n, fuerza = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (Math.random() * 0.6 + 0.2) * fuerza;
    chispas.push({
      x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8,
      vx: fuerza > 1 ? Math.cos(a) * v * 2 : (Math.random() - 0.5) * 0.6, vy: fuerza > 1 ? Math.sin(a) * v * 2 : Math.random() * 0.6 + 0.2,
      v: 1, r: Math.random() * 1.1 + 0.4, c: colores[Math.floor(Math.random() * colores.length)], estrella: Math.random() < 0.12,
    });
  }
  if (chispas.length > 220) chispas.splice(0, chispas.length - 220);
  if (!activo) { activo = true; requestAnimationFrame(cuadro); }
}
function estrella(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4; const rr = i % 2 ? r * 0.35 : r * 2.4;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}
function cuadro() {
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  chispas = chispas.filter((s) => (s.v -= 0.022) > 0);
  anillos = anillos.filter((a) => (a.v -= 0.04) > 0);
  ctx.shadowBlur = 8 * px;
  for (const s of chispas) {
    s.x += s.vx; s.y += s.vy; s.vx *= 0.97; s.vy = s.vy * 0.97 + 0.01;
    ctx.fillStyle = `rgba(${s.c},${s.v.toFixed(3)})`;
    ctx.shadowColor = `rgba(170,195,255,${(s.v * 0.6).toFixed(3)})`;
    if (s.estrella) estrella(s.x * px, s.y * px, s.r * px * s.v);
    else { ctx.beginPath(); ctx.arc(s.x * px, s.y * px, s.r * px * s.v, 0, Math.PI * 2); ctx.fill(); }
  }
  for (const a of anillos) {
    ctx.strokeStyle = `rgba(146,210,245,${(a.v * 0.7).toFixed(3)})`;
    ctx.lineWidth = 1.5 * px;
    ctx.beginPath(); ctx.arc(a.x * px, a.y * px, (1 - a.v) * 34 * px, 0, Math.PI * 2); ctx.stroke();
  }
  if (chispas.length || anillos.length) requestAnimationFrame(cuadro);
  else { activo = false; ctx.clearRect(0, 0, lienzo.width, lienzo.height); }
}

export function polvoDeHadas() {
  if (!prender()) return;
  let ux = 0, uy = 0;
  const seguir = (x, y, max) => {
    const d = Math.hypot(x - ux, y - uy);
    ux = x; uy = y;
    const n = Math.min(max, Math.floor(d / 26));
    if (n) soltar(x, y, n);
  };
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') seguir(e.clientX, e.clientY, 2); }, { passive: true });
  addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) seguir(t.clientX, t.clientY, 2); }, { passive: true });
  addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { ux = t.clientX; uy = t.clientY; } }, { passive: true });
  // Destello en cada toque (salvo al escribir)
  addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    soltar(e.clientX, e.clientY, 5, 1.6);
  }, { passive: true });
}

/** Ráfaga de chispas desde un elemento (al agregar al carrito, al enviar un formulario…). */
export function rafaga(el, cantidad = 26) {
  if (!el || !prender()) return;
  const r = el.getBoundingClientRect();
  soltar(r.left + r.width / 2, r.top + r.height / 2, cantidad, 3.2);
}
