// El viaje: una nube de polvo de hadas (WebGL) que acompaña el scroll del inicio y se transforma
// en el nombre del Walkiverso, en las criaturas reales (tomando los colores de sus fotos), en un árbol de raíces,
// en Walkurio y al final se deshace en un cielo de estrellas.
// Cada forma es un "capítulo" del inicio ([data-capitulo]); entre uno y otro el polvo se dispersa y se vuelve a juntar.
import * as THREE from './vendor/three.module.min.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const chico = () => innerWidth < 750;
const azar = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

/** Carga una imagen y devuelve sus píxeles. */
async function pixeles(src, ancho) {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  const k = ancho / img.naturalWidth;
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, c.width, c.height);
  return { img, w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
}

/** Puntos sobre la parte visible de una imagen (alfa), con el color y una profundidad según el brillo. */
function desdeImagen({ w, h, d }, n, alto, profundidad = 0.5) {
  const llenos = [];
  // Más polvo donde la foto tiene luz: así aparecen los rasgos (ojos, tallado, hojas)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    if (d[o + 3] < 140) continue;
    const lum = (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255;
    if (azar() < 0.12 + Math.pow(lum, 1.3) * 1.6) llenos.push(y * w + x);
  }
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const k = alto / h;
  for (let i = 0; i < n; i++) {
    const j = llenos[Math.floor(azar() * llenos.length)] ?? 0;
    const px = j % w, py = Math.floor(j / w), o = j * 4;
    const r = d[o] / 255, g = d[o + 1] / 255, b = d[o + 2] / 255;
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    pos.set([(px - w / 2 + azar() - 0.5) * k, (h / 2 - py + azar() - 0.5) * k, (lum - 0.45) * profundidad + (azar() - 0.5) * 0.12], i * 3);
    // Un poco más de luz para que brille sobre la noche
    col.set([r * 0.9 + 0.04, g * 0.9 + 0.05, b * 0.95 + 0.09], i * 3);
  }
  return { pos, col };
}

/** Árbol de raíces de luz: ramas hacia arriba y raíces hacia abajo. */
function arbol(n) {
  const segs = [];
  const crecer = (x, y, a, largo, grosor, nivel, signo) => {
    const x2 = x + Math.cos(a) * largo, y2 = y + Math.sin(a) * largo * signo;
    segs.push([x, y, x2, y2, grosor]);
    if (nivel === 0) return;
    const hijos = nivel > 3 ? 2 : 2 + (azar() < 0.4 ? 1 : 0);
    for (let i = 0; i < hijos; i++) crecer(x2, y2, a + (azar() - 0.5) * 1.3 + (i - (hijos - 1) / 2) * 0.55, largo * (0.66 + azar() * 0.12), grosor * 0.62, nivel - 1, signo);
  };
  crecer(0, -0.2, Math.PI / 2, 0.9, 0.12, 6, 1);   // copa
  crecer(0, -0.2, Math.PI / 2, 0.45, 0.1, 5, -1);  // raíces
  const total = segs.reduce((t, s) => t + Math.hypot(s[2] - s[0], s[3] - s[1]) * (0.4 + s[4] * 6), 0);
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let i = 0;
  for (const [x1, y1, x2, y2, gr] of segs) {
    const cuota = Math.round(n * (Math.hypot(x2 - x1, y2 - y1) * (0.4 + gr * 6)) / total);
    for (let k = 0; k < cuota && i < n; k++, i++) {
      const t = azar();
      const sx = (azar() - 0.5) * gr, sz = (azar() - 0.5) * gr;
      pos.set([x1 + (x2 - x1) * t + sx, y1 + (y2 - y1) * t + sx * 0.3, sz], i * 3);
      const raiz = y1 < -0.2;
      col.set(raiz ? [0.78, 0.92, 0.84] : azar() < 0.3 ? [0.98, 0.82, 0.52] : [0.62, 0.86, 0.72], i * 3);
    }
  }
  for (; i < n; i++) { // luciérnagas alrededor
    const a = azar() * Math.PI * 2, r = 0.6 + azar() * 1.3;
    pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.9 + 0.4, (azar() - 0.5) * 1.2], i * 3);
    col.set([1, 0.9, 0.6], i * 3);
  }
  return { pos, col };
}

/** Walkurio: superficie de esfera con continentes y un anillo. */
function planeta(n) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const R = 1.35;
  for (let i = 0; i < n; i++) {
    if (i < n * 0.22) {
      const a = azar() * Math.PI * 2, r = R * (1.45 + azar() * 0.45);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      pos.set([x, z * 0.18 + x * 0.12, z], i * 3);
      col.set([0.92, 0.82, 0.6], i * 3);
      continue;
    }
    const u = azar() * 2 - 1, t = azar() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const x = s * Math.cos(t), y = u, z = s * Math.sin(t);
    pos.set([x * R, y * R, z * R], i * 3);
    const tierra = Math.sin(x * 4.1 + y * 2.3) + Math.sin(z * 5.2 - x * 1.7) + Math.sin(y * 6.1 + z * 2.2) > 0.6;
    col.set(tierra ? [0.6, 0.86, 0.62] : [0.3, 0.6, 0.72], i * 3);
  }
  return { pos, col };
}

/** El cielo final: estrellas por todo el fondo. */
function cielo(n) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos.set([(azar() - 0.5) * 16, (azar() - 0.5) * 10, -2 - azar() * 6], i * 3);
    col.set(azar() < 0.3 ? [0.98, 0.84, 0.58] : [0.84, 0.94, 0.88], i * 3);
  }
  return { pos, col };
}

const VERT = /* glsl */`
  attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4; attribute vec3 p5;
  attribute vec3 c0; attribute vec3 c1; attribute vec3 c2; attribute vec3 c3; attribute vec3 c4; attribute vec3 c5;
  attribute vec4 rnd;
  uniform float uS; uniform float uT; uniform float uPx; uniform float uTam; uniform vec3 uMouse; uniform float uLuz; uniform float uAura;
  varying vec3 vCol; varying float vAlfa;
  float paso(float i) { float t = clamp(uS - i, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
  void main() {
    float t1 = paso(0.0), t2 = paso(1.0), t3 = paso(2.0), t4 = paso(3.0), t5 = paso(4.0);
    vec3 p = mix(position, p1, t1); p = mix(p, p2, t2); p = mix(p, p3, t3); p = mix(p, p4, t4); p = mix(p, p5, t5);
    vec3 c = mix(c0, c1, t1); c = mix(c, c2, t2); c = mix(c, c3, t3); c = mix(c, c4, t4); c = mix(c, c5, t5);
    // En medio de cada cambio el polvo se dispersa en un remolino y se vuelve a juntar
    float viaje = sin(3.14159 * fract(clamp(uS, 0.0, 4.999)));
    vec3 dir = normalize(rnd.xyz - 0.5 + 0.0001);
    float ang = uT * (0.3 + rnd.w * 0.5) + rnd.w * 6.28;
    p += dir * viaje * (0.6 + rnd.w * 1.4) + vec3(cos(ang), sin(ang), 0.0) * viaje * 0.35;
    p += dir * uAura * (0.08 + rnd.w * 0.35);
    // Respiración: cada mota flota un poco en su lugar
    p += 0.018 * vec3(sin(uT * 1.3 + rnd.x * 30.0), cos(uT * 1.1 + rnd.y * 30.0), sin(uT * 0.9 + rnd.z * 30.0));
    vec4 mundo = modelMatrix * vec4(p, 1.0);
    // El mouse aparta el polvo como una mano en el agua
    vec3 d = mundo.xyz - uMouse; float dist = length(d.xy);
    mundo.xy += normalize(d.xy + 0.0001) * smoothstep(0.9, 0.0, dist) * 0.35;
    vec4 mv = viewMatrix * mundo;
    gl_Position = projectionMatrix * mv;
    float tit = 0.65 + 0.35 * sin(uT * (1.5 + rnd.y * 3.0) + rnd.x * 40.0);
    gl_PointSize = uTam * uPx * (0.55 + rnd.z * 1.1) * (1.0 + viaje * 0.6) / -mv.z;
    vCol = c * uLuz; vAlfa = tit * (1.0 - uAura * (0.75 - rnd.w * 0.5));
  }`;
const FRAG = /* glsl */`
  varying vec3 vCol; varying float vAlfa;
  void main() {
    vec2 q = gl_PointCoord - 0.5; float r = length(q);
    float a = smoothstep(0.5, 0.0, r); a = a * a;
    gl_FragColor = vec4(vCol * (0.55 + a * 0.8), a * vAlfa * 0.75);
  }`;

/**
 * Crea el viaje en un canvas fijo. `formas`: rutas de las imágenes de las criaturas (sin fondo).
 * Devuelve { destruir }.
 */
export async function crearViaje(canvas, { logo, criaturas }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camara.position.set(0, 0, 8);

  const N = chico() ? 9000 : 18000;
  const [imgLogo, ...imgs] = await Promise.all([pixeles(logo, 520), ...criaturas.map((c) => pixeles(c, 340))]);
  // Capítulo I: la mitad del polvo forma la criatura (izquierda) y la otra mitad el objeto (derecha)
  const SEP = chico() ? 0.62 : 2.1, ALTO_DUO = chico() ? 1.45 : 2.5;
  const izq = desdeImagen(imgs[0], N / 2, ALTO_DUO, 0.3), der = desdeImagen(imgs[1] ?? imgs[0], N / 2, ALTO_DUO * 0.9, 0.25);
  const duo = { pos: new Float32Array(N * 3), col: new Float32Array(N * 3) };
  for (let i = 0; i < N / 2; i++) {
    duo.pos.set([izq.pos[i * 3] - SEP, izq.pos[i * 3 + 1], izq.pos[i * 3 + 2]], i * 3); duo.col.set(izq.col.subarray(i * 3, i * 3 + 3), i * 3);
    const j = i + N / 2;
    duo.pos.set([der.pos[i * 3] + SEP, der.pos[i * 3 + 1], der.pos[i * 3 + 2]], j * 3); duo.col.set(der.col.subarray(i * 3, i * 3 + 3), j * 3);
  }
  const estrellas = cielo(N);
  const formas = [desdeImagen(imgLogo, N, 1.1, 0.2), duo, arbol(N), planeta(N), estrellas, estrellas];
  // El nombre arranca con un brillo celeste parejo
  for (let i = 0; i < N; i++) formas[0].col.set(azar() < 0.25 ? [0.98, 0.84, 0.56] : [0.86, 0.95, 0.9], i * 3);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(formas[0].pos, 3));
  formas.slice(1).forEach((f, i) => geo.setAttribute(`p${i + 1}`, new THREE.BufferAttribute(f.pos, 3)));
  formas.forEach((f, i) => geo.setAttribute(`c${i}`, new THREE.BufferAttribute(f.col, 3)));
  const rnd = new Float32Array(N * 4);
  for (let i = 0; i < rnd.length; i++) rnd[i] = azar();
  geo.setAttribute('rnd', new THREE.BufferAttribute(rnd, 4));
  const uniforms = {
    uS: { value: 0 }, uT: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uTam: { value: chico() ? 30 : 34 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uLuz: { value: 1 }, uAura: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const nube = new THREE.Points(geo, material);
  nube.frustumCulled = false;
  escena.add(nube);

  // Cuando el polvo se acomoda, la criatura real se materializa en su lugar
  const apariciones = [[1, imgs[0], ALTO_DUO, -SEP], [1, imgs[1] ?? imgs[0], ALTO_DUO * 0.9, SEP]].map(([etapa, im, alto, x]) => {
    const tex = new THREE.Texture(im.img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    const plano = new THREE.Mesh(new THREE.PlaneGeometry((alto * im.w) / im.h, alto), mat);
    plano.position.set(x, 0, -0.05);
    plano.renderOrder = -1;
    nube.add(plano);
    return { etapa, plano, mat, tex, lado: Math.sign(x), foco: 0 };
  });

  // Dónde se ubica la forma en cada capítulo (deja lugar al texto)
  const lugares = () => chico()
    ? [[0, 0.75, 0.42], [0, -0.32, 1], [0, 0.55, 0.4], [0, 1, 0.6], [0, 0, 1], [0, 0, 1]]
    : [[0, 0.5, 1.35], [0, -0.2, 1], [1.6, -0.35, 0.78], [1.55, 0, 1], [0, 0, 1], [0, 0, 1]];

  const medir = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  };
  medir();
  addEventListener('resize', medir);

  // Etapa según el scroll: interpolada entre los centros de los capítulos
  const capitulos = [...document.querySelectorAll('[data-capitulo]')];
  let objetivo = 0, s = 0, vivo = true, raf = 0, luz = 1, foco = 0;
  const leer = () => {
    const centro = innerHeight / 2;
    const centros = capitulos.map((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
    let e = 0;
    if (centros[0] >= centro) e = 0;
    else if (centros[centros.length - 1] <= centro) e = centros.length - 1;
    else for (let i = 0; i < centros.length - 1; i++) if (centros[i] < centro && centros[i + 1] >= centro) { const f = (centro - centros[i]) / (centros[i + 1] - centros[i]); e = i + Math.min(1, Math.max(0, (f - 0.28) / 0.44)); break; }
    objetivo = e;
    // Pasado el último capítulo, el cielo queda de fondo, tenue
    const ultimo = capitulos[capitulos.length - 1].getBoundingClientRect();
    luz = ultimo.bottom < innerHeight * 0.4 ? 0.45 : 1;
  };
  addEventListener('scroll', leer, { passive: true });
  leer();

  const mouse = new THREE.Vector2(0, 0), mouseSuave = new THREE.Vector2(0, 0), mouseMundo = new THREE.Vector3(99, 99, 0);
  const mover = (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    // Proyección del mouse al plano z = 0
    const v = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camara).sub(camara.position).normalize();
    const t = -camara.position.z / v.z;
    mouseMundo.copy(camara.position).addScaledVector(v, t);
  };
  addEventListener('pointermove', mover, { passive: true });

  // Entrada: el polvo llega de todas partes y forma el nombre
  let entrada = reducido ? 1 : 0;
  const reloj = new THREE.Clock();
  const cuadro = () => {
    raf = 0;
    if (!vivo) return;
    const dt = Math.min(reloj.getDelta(), 0.05);
    uniforms.uT.value += dt;
    entrada = Math.min(1, entrada + dt / 2.6);
    s += (objetivo - s) * (1 - Math.pow(0.0015, dt));
    // Mientras entra, finge venir desde el cielo (etapa "negativa" = dispersión)
    uniforms.uS.value = s;
    mouseSuave.lerp(mouse, Math.min(1, dt * 2.2));
    uniforms.uMouse.value.lerp(mouseMundo, Math.min(1, dt * 6));
    const L = lugares();
    const i = Math.min(Math.floor(s), L.length - 2), f = s - i, k = f * f * (3 - 2 * f);
    const [x, y, e] = L[i].map((v, j) => v + (L[i + 1][j] - v) * k);
    nube.position.set(x, y, 0);
    const llegada = 1 - Math.pow(1 - entrada, 3);
    nube.scale.setScalar(e * (0.6 + 0.4 * llegada));
    uniforms.uLuz.value += ((luz * llegada) - uniforms.uLuz.value) * Math.min(1, dt * 4);
    uniforms.uTam.value = (chico() ? 30 : 34) * (0.3 + 0.7 * llegada);
    nube.rotation.y = Math.sin(uniforms.uT.value * 0.25) * 0.16 + mouseSuave.x * 0.16 + (s > 2.5 && s < 3.6 ? uniforms.uT.value * 0.15 : 0);
    nube.rotation.x = -mouseSuave.y * 0.1;
    let visible = 0;
    for (const a of apariciones) {
      const o = Math.max(0, 1 - Math.abs(s - a.etapa) * 6) * llegada;
      a.mat.opacity += (o - a.mat.opacity) * Math.min(1, dt * 5);
      a.plano.visible = a.mat.opacity > 0.01;
      a.foco += ((foco === a.lado ? 1 : 0) - a.foco) * Math.min(1, dt * 4);
      a.plano.scale.setScalar(0.985 + Math.sin(uniforms.uT.value * 0.8 + a.lado) * 0.012 + a.foco * 0.07);
      a.plano.position.z = -0.05 + a.foco * 0.3;
      visible = Math.max(visible, a.mat.opacity);
    }
    // Con la criatura presente, el polvo queda como un aura de chispas
    uniforms.uAura.value = visible;
    renderer.render(escena, camara);
    if (!document.hidden) raf = requestAnimationFrame(cuadro);
  };
  const seguir = () => { if (!raf && vivo && !document.hidden) raf = requestAnimationFrame(cuadro); };
  document.addEventListener('visibilitychange', seguir);
  seguir();
  canvas.classList.add('is-listo');

  return {
    /** -1 criatura, 1 objeto, 0 ninguno: el lado que se acerca. */
    enfocar(lado) { foco = lado; },
    destruir() {
      vivo = false; cancelAnimationFrame(raf);
      removeEventListener('scroll', leer); removeEventListener('resize', medir); removeEventListener('pointermove', mover);
      document.removeEventListener('visibilitychange', seguir);
      geo.dispose(); material.dispose(); apariciones.forEach((a) => { a.tex.dispose(); a.mat.dispose(); a.plano.geometry.dispose(); }); renderer.dispose();
    },
  };
}
