// El Portal de Raíces: la entrada del Walkiverso (se abre cada vez que se llega al inicio).
// Raíces que crecen desde los bordes y forman un anillo, runas que se encienden y un vórtice (WebGL) que se abre.
// La primera vez en la sesión espera a que toques el portal; después se abre solo. Abierto, queda de fondo de la portada.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uAbre; uniform vec2 uCentro; uniform float uFlash;
uniform vec2 uOndaPos; uniform float uOnda;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
void main(){
  float m = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - uCentro) / m;
  float r = length(uv); float ang = atan(uv.y, uv.x);
  float R = mix(0.0, 0.27, smoothstep(0.0, 0.35, uAbre)) + pow(smoothstep(0.35, 1.0, uAbre), 2.0) * 2.2;
  // Remolino: el ángulo gira más cerca del centro
  float giro = ang + 2.4 / (r + 0.18) - uT * 0.35;
  vec2 q = vec2(cos(giro), sin(giro)) * r;
  float n = fbm(q * 3.2 + vec2(uT * 0.05, -uT * 0.04));
  float n2 = fbm(q * 7.0 - uT * 0.12);
  vec3 noche = vec3(0.004, 0.035, 0.16);
  vec3 azul = vec3(0.03, 0.14, 0.45);
  vec3 celeste = vec3(0.57, 0.82, 0.96);
  vec3 pantano = vec3(0.80, 0.88, 0.85);
  vec3 col = mix(azul, celeste, smoothstep(0.38, 0.88, n));
  col = mix(col, pantano, smoothstep(0.62, 0.95, n2) * 0.45);
  float brazos = 0.5 + 0.5 * sin(ang * 3.0 + 7.0 / (r + 0.2) - uT * 1.1 + n * 5.0);
  col += celeste * brazos * 0.22;
  // Corazón de luz
  float abre = smoothstep(0.0, 0.3, uAbre);
  col += vec3(0.92, 0.97, 1.0) * exp(-r * r / (0.003 + R * R * 0.06)) * abre * (1.0 - 0.7 * smoothstep(0.5, 1.0, uAbre));
  float dentro = 1.0 - smoothstep(R * 0.86, R, r);
  float aro = exp(-pow((r - R) / (0.010 + R * 0.025), 2.0)) * abre;
  // Cielo de afuera con estrellas
  vec3 fondo = noche * (1.15 - r * 0.5);
  vec2 celda = floor(gl_FragCoord.xy / 2.0);
  fondo += step(0.9975, hash(celda)) * (0.45 + 0.55 * sin(uT * 2.5 + hash(celda + 3.0) * 30.0)) * 0.9;
  fondo += celeste * fbm(uv * 2.0 + uT * 0.02) * 0.06;
  // Abierto del todo: el remolino queda de fondo, más calmo, para que se lean los textos
  float calma = smoothstep(0.82, 1.0, uAbre);
  col = mix(col, col * 0.42 + noche * 0.45, calma);
  vec3 c = mix(fondo, col, dentro) + celeste * aro * 1.3;
  // Onda donde se toca
  float d = length((gl_FragCoord.xy - uOndaPos) / m);
  c += celeste * exp(-pow((d - uOnda * 0.55) / 0.018, 2.0)) * exp(-uOnda * 1.6) * 0.8;
  c = mix(c, vec3(0.94, 0.98, 1.0), uFlash);
  c *= 1.0 - 0.35 * smoothstep(0.55, 1.25, length((gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / m, uRes.y / m)));
  gl_FragColor = vec4(c, 1.0);
}`;

const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SIGILOS = [
  'M0-7V7M-4-3 4 3', 'M-5-6 0 6 5-6', 'M0-7V7M0-2 5-6M0 2 5 6', 'M-5 0A5 5 0 1 0 5 0A5 5 0 1 0-5 0M0-7V7',
  'M-5-6H5L-5 6H5', 'M0-7 5 0 0 7-5 0Z', 'M-5 6V-6L5 6V-6', 'M0-7V7M-5-3H5M-3 3H3',
];

/** Curva suave por varios puntos (Catmull-Rom → Bézier). */
function camino(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2.map((v) => v.toFixed(1))}`;
  }
  return d;
}
/** Rulo de raíz: espiral que termina hacia adentro (como las ramas de la marca). */
function rulo(x, y, dir, largo, sentido) {
  const pts = [[x, y]];
  const cx = x + Math.cos(dir) * largo, cy = y + Math.sin(dir) * largo;
  const r0 = largo * 0.42;
  const a0 = dir + Math.PI * (sentido > 0 ? -0.5 : 0.5);
  for (let k = 1; k <= 14; k++) {
    const t = k / 14;
    const a = a0 + sentido * t * Math.PI * 2.6;
    const rr = r0 * (1 - t * 0.85);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return pts;
}

export function crearEntrada(seccion, { esperarToque = false, alAbrir } = {}) {
  const lienzo = seccion.querySelector('.wk-entrada__vortice');
  const svg = seccion.querySelector('.wk-entrada__raices');
  const tocar = seccion.querySelector('.wk-entrada__tocar');
  const saltar = seccion.querySelector('.wk-entrada__saltar');
  const px = Math.min(devicePixelRatio || 1, tactil ? 1 : 1.5);
  let W = 1, H = 1, gl = null, prog = null, u = {}, raf = 0, visible = true, vivo = true;
  const st = { abre: 0, flash: 0, t0: performance.now(), fase: 'creciendo', abrirDesde: 0, abrirDur: 1900, cx: 0, cy: 0, mx: 0, my: 0, onda: 99, ox: 0, oy: 0 };

  // ---------- WebGL
  try {
    gl = lienzo.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['uRes', 'uT', 'uAbre', 'uCentro', 'uFlash', 'uOndaPos', 'uOnda']) u[n] = gl.getUniformLocation(prog, n);
  } catch (e) {
    console.warn('Portal sin WebGL:', e);
    gl = null;
    seccion.classList.add('sin-webgl');
  }

  // ---------- Raíces y runas
  function dibujarRaices() {
    const R = Math.min(W, H) * 0.27;
    const cx = W / 2, cy = H / 2;
    const lejos = Math.hypot(W, H) / 2 + 60;
    const n = W < 750 ? 7 : 10;
    let semilla = 7;
    const azar = () => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; };
    const raices = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (azar() - 0.5) * 0.35 - Math.PI / 2;
      const dx = Math.cos(a), dy = Math.sin(a), px2 = -dy, py2 = dx;
      const fase = azar() * Math.PI * 2;
      const pts = [];
      for (let k = 0; k <= 9; k++) {
        const t = k / 9;
        const dist = lejos + (R * 1.04 - lejos) * t;
        const ond = Math.sin(t * Math.PI * 2.2 + fase) * R * 0.22 * (1 - t * 0.8);
        pts.push([cx + dx * dist + px2 * ond, cy + dy * dist + py2 * ond]);
      }
      const ancho = 3 + azar() * 4;
      raices.push({ d: camino(pts), ancho, demora: azar() * 0.35 });
      // Ramitas con rulo
      for (const t of [0.42, 0.68]) {
        const k = Math.round(t * 9);
        const [bx, by] = pts[k];
        const lado = azar() > 0.5 ? 1 : -1;
        const dir = a + Math.PI + lado * (0.9 + azar() * 0.5);
        raices.push({ d: camino(rulo(bx, by, dir, R * (0.18 + azar() * 0.14), lado)), ancho: ancho * 0.55, demora: 0.5 + t * 0.6 + azar() * 0.2 });
      }
    }
    // Anillo del portal (dos aros, uno cortado)
    const aro = (rr) => `M${cx + rr},${cy} A${rr},${rr} 0 1 1 ${cx - rr},${cy} A${rr},${rr} 0 1 1 ${cx + rr},${cy}`;
    const runas = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R * 1.2, y = cy + Math.sin(a) * R * 1.2;
      return `<g class="wk-runa" style="--i:${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})"><path d="${SIGILOS[i % SIGILOS.length]}"/></g>`;
    }).join('');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `
      <g class="wk-raices">${raices.map((r) => `<path class="wk-raiz" d="${r.d}" style="--w:${r.ancho.toFixed(1)};--d:${r.demora.toFixed(2)}s"/>`).join('')}</g>
      <g class="wk-raices wk-raices--luz">${raices.map((r) => `<path class="wk-raiz" d="${r.d}" style="--w:${(r.ancho * 0.35).toFixed(1)};--d:${r.demora.toFixed(2)}s"/>`).join('')}</g>
      <path class="wk-aro" d="${aro(R * 1.06)}"/><path class="wk-aro wk-aro--fino" d="${aro(R * 1.32)}"/>
      <g class="wk-runas">${runas}</g>`;
    svg.querySelectorAll('.wk-raiz, .wk-aro').forEach((p) => { const l = p.getTotalLength(); p.style.setProperty('--l', l.toFixed(0)); });
    seccion.style.setProperty('--r', `${R}px`);
  }

  function medir() {
    W = seccion.clientWidth || innerWidth;
    H = seccion.clientHeight || innerHeight;
    lienzo.width = W * px; lienzo.height = H * px;
    st.cx = W / 2; st.cy = H / 2;
    if (gl) gl.viewport(0, 0, lienzo.width, lienzo.height);
    dibujarRaices();
  }
  medir();
  const ro = new ResizeObserver(() => { if (Math.abs(seccion.clientWidth - W) > 2 || Math.abs(seccion.clientHeight - H) > 60) medir(); });
  ro.observe(seccion);

  // ---------- Secuencia
  requestAnimationFrame(() => seccion.classList.add('is-creciendo'));
  let espera = null;
  if (reducido) { st.abre = 1; terminar(); }
  else if (esperarToque) espera = setTimeout(() => { if (st.fase === 'creciendo') { st.fase = 'esperando'; seccion.classList.add('is-esperando'); tocar.hidden = false; tocar.focus({ preventScroll: true }); } }, 2300);
  else espera = setTimeout(() => abrir(), 2500);

  function abrir(rapido = false) {
    if (st.fase === 'abriendo' || st.fase === 'abierta') return;
    clearTimeout(espera);
    st.fase = 'abriendo';
    st.desde = Math.max(st.abre, 0.35);
    st.abrirDesde = performance.now();
    st.abrirDur = rapido ? 600 : 1900;
    tocar.hidden = true;
    seccion.classList.remove('is-esperando');
    seccion.classList.add('is-creciendo', 'is-abriendo');
  }
  function terminar() {
    st.fase = 'abierta';
    seccion.classList.add('is-creciendo', 'is-abierta');
    seccion.classList.remove('is-abriendo');
    alAbrir?.();
  }
  tocar.addEventListener('click', () => abrir());
  saltar.addEventListener('click', () => abrir(true));
  lienzo.addEventListener('click', () => { if (st.fase === 'esperando') abrir(); });
  const apurar = () => { if (st.fase === 'creciendo' || st.fase === 'esperando') abrir(true); };
  addEventListener('wheel', apurar, { passive: true });
  addEventListener('touchmove', apurar, { passive: true });
  const tecla = (e) => { if (['Escape', 'ArrowDown', 'PageDown', ' '].includes(e.key) && st.fase !== 'abierta' && !e.target.closest?.('button')) abrir(true); };
  addEventListener('keydown', tecla);

  // Mouse y ondas (con el portal abierto)
  const mover = (e) => { st.mx = (e.clientX / innerWidth - 0.5) * 2; st.my = (e.clientY / innerHeight - 0.5) * 2; };
  addEventListener('pointermove', mover, { passive: true });
  seccion.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const r = seccion.getBoundingClientRect();
    st.ox = e.clientX - r.left; st.oy = e.clientY - r.top; st.onda = 0;
  });

  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && vivo) { cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro); } });
  io.observe(seccion);
  const oculto = () => { if (!document.hidden && visible && vivo) { cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro); } };
  document.addEventListener('visibilitychange', oculto);

  let ultimo = performance.now();
  function cuadro(ahora) {
    if (!vivo || !visible || document.hidden) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    const t = (ahora - st.t0) / 1000;
    if (st.fase === 'creciendo' || st.fase === 'esperando') {
      // Se enciende el vórtice adentro del anillo, y late mientras espera
      st.abre = Math.min(0.35, Math.max(0, (t - 1.1) / 1.2) * 0.35) + (st.fase === 'esperando' ? Math.sin(t * 2.4) * 0.015 : 0);
    } else if (st.fase === 'abriendo') {
      const k = Math.min(1, (ahora - st.abrirDesde) / st.abrirDur);
      st.abre = st.desde + (1 - st.desde) * suave(k);
      st.flash = Math.max(0, 1 - Math.abs(k - 0.45) * 4.5) * 0.55;
      if (k >= 1) { st.flash = 0; terminar(); }
    }
    st.onda += dt;
    // Con el portal abierto, el centro del remolino sigue un poco al mouse
    const objX = W / 2 + (st.fase === 'abierta' ? st.mx * W * 0.06 : 0);
    const objY = H / 2 + (st.fase === 'abierta' ? st.my * H * 0.06 : 0);
    st.cx += (objX - st.cx) * 0.04; st.cy += (objY - st.cy) * 0.04;
    if (gl) {
      gl.uniform2f(u.uRes, lienzo.width, lienzo.height);
      gl.uniform1f(u.uT, t);
      gl.uniform1f(u.uAbre, st.abre);
      gl.uniform2f(u.uCentro, st.cx * px, (H - st.cy) * px);
      gl.uniform1f(u.uFlash, st.flash);
      gl.uniform2f(u.uOndaPos, st.ox * px, (H - st.oy) * px);
      gl.uniform1f(u.uOnda, st.onda);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else if (st.fase === 'abriendo' && st.abre >= 1) terminar();
    raf = requestAnimationFrame(cuadro);
  }
  raf = requestAnimationFrame(cuadro);

  return {
    abrir,
    destruir() {
      vivo = false;
      cancelAnimationFrame(raf);
      clearTimeout(espera);
      ro.disconnect(); io.disconnect();
      removeEventListener('wheel', apurar); removeEventListener('touchmove', apurar);
      removeEventListener('keydown', tecla); removeEventListener('pointermove', mover);
      document.removeEventListener('visibilitychange', oculto);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
