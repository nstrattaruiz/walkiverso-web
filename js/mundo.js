// Walkurio en 3D: el planeta de la portada (Three.js).
// Planeta procedural, nubes, atmósfera, anillo de polvo de hadas, lunas, estrellas y el viaje de entrada.
// Las regiones son las categorías de la tienda: cada una es un punto del planeta que se puede tocar.
import * as THREE from './vendor/three.module.min.js';

// Ruido simplex 3D (Ashima Arts / Stefan Gustavson, licencia MIT)
const RUIDO = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.5;float s=0.0;for(int i=0;i<5;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}
`;

const VERT_PLANETA = /* glsl */`
varying vec3 vPos; varying vec3 vN; varying vec3 vView;
void main(){
  vPos = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = cameraPosition - w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

// Paleta fría de la marca: azul noche, celeste, verde pantano y blanco
const FRAG_PLANETA = /* glsl */`
uniform float uTime; uniform vec3 uSol;
varying vec3 vPos; varying vec3 vN; varying vec3 vView;
${RUIDO}
void main(){
  vec3 p = normalize(vPos);
  float h = fbm(p * 1.6 + vec3(3.1, 1.7, 0.4));
  float det = fbm(p * 6.5 + 11.0);
  vec3 hondo = vec3(0.004, 0.06, 0.27);
  vec3 mar = vec3(0.05, 0.20, 0.50);
  vec3 costa = vec3(0.57, 0.82, 0.96);
  vec3 pantano = vec3(0.80, 0.88, 0.85);
  vec3 musgo = vec3(0.40, 0.58, 0.56);
  vec3 bosque = vec3(0.13, 0.29, 0.34);
  vec3 nieve = vec3(0.96, 0.98, 1.0);
  float orilla = 0.04;
  float tierra = smoothstep(orilla - 0.005, orilla + 0.005, h);
  vec3 agua = mix(hondo, mar, smoothstep(-0.45, orilla, h));
  agua = mix(agua, costa, smoothstep(orilla - 0.07, orilla, h) * 0.75);
  float t = clamp((h - orilla) * 2.6 + det * 0.35, 0.0, 1.0);
  vec3 suelo = mix(pantano, musgo, smoothstep(0.05, 0.4, t));
  suelo = mix(suelo, bosque, smoothstep(0.35, 0.75, t + det * 0.3));
  suelo = mix(suelo, nieve, smoothstep(0.40, 0.50, h + det * 0.05));
  vec3 col = mix(agua, suelo, tierra);
  col = mix(col, nieve, smoothstep(0.86, 0.95, abs(p.y) + det * 0.1));

  vec3 N = normalize(vN); vec3 V = normalize(vView);
  float luz = smoothstep(-0.2, 0.65, dot(N, uSol));
  vec3 c = col * (0.10 + 0.95 * luz);
  // Bosques que brillan de noche (Musgoluz)
  float chispa = smoothstep(0.55, 0.95, snoise(p * 42.0)) * tierra * smoothstep(0.1, 0.5, t);
  c += costa * chispa * (0.55 + 0.45 * sin(uTime * 2.3 + p.x * 37.0 + p.z * 23.0)) * (1.0 - luz) * 1.1;
  // Brillo del sol sobre el agua
  vec3 H = normalize(uSol + V);
  c += vec3(0.85, 0.93, 1.0) * pow(max(dot(N, H), 0.0), 48.0) * (1.0 - tierra) * luz * 0.55;
  // Borde celeste
  c += costa * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.55;
  gl_FragColor = vec4(c, 1.0);
}`;

const FRAG_NUBES = /* glsl */`
uniform float uTime; uniform vec3 uSol;
varying vec3 vPos; varying vec3 vN; varying vec3 vView;
${RUIDO}
void main(){
  vec3 p = normalize(vPos);
  float n = fbm(p * 2.4 + vec3(uTime * 0.015, 0.0, uTime * 0.008));
  float a = smoothstep(0.12, 0.55, n) * 0.6;
  float luz = smoothstep(-0.2, 0.7, dot(normalize(vN), uSol));
  gl_FragColor = vec4(vec3(0.92, 0.97, 1.0) * (0.15 + 0.9 * luz), a * (0.25 + 0.75 * luz));
}`;

const VERT_ATMOS = /* glsl */`
varying vec3 vNormal;
void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG_ATMOS = /* glsl */`
uniform vec3 uColor; varying vec3 vNormal;
void main(){ float i = pow(max(0.0, 0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0); gl_FragColor = vec4(uColor, 1.0) * i * 1.05; }`;

// Puntos suaves (estrellas, polvo, anillo, faros de las regiones)
const VERT_PUNTOS = /* glsl */`
attribute float aTam; attribute float aFase; attribute vec3 aColor;
uniform float uTime; uniform float uPx; uniform float uDeriva; uniform float uTitila;
varying vec3 vColor; varying float vAlfa;
void main(){
  vec3 pos = position;
  pos += uDeriva * vec3(sin(uTime * 0.3 + aFase * 6.0), cos(uTime * 0.25 + aFase * 5.0), sin(uTime * 0.2 + aFase * 4.0)) * 0.08;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aTam * uPx / -mv.z;
  vColor = aColor;
  vAlfa = 1.0 - uTitila * (0.5 + 0.5 * sin(uTime * (1.0 + aFase * 2.0) + aFase * 30.0));
  gl_Position = projectionMatrix * mv;
}`;
const FRAG_PUNTOS = /* glsl */`
uniform float uOpacidad; varying vec3 vColor; varying float vAlfa;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  float a = smoothstep(0.5, 0.0, d); a *= a;
  gl_FragColor = vec4(vColor, a * vAlfa * uOpacidad);
}`;

const CELESTE = new THREE.Color('#92d2f5');
const PANTANO = new THREE.Color('#cce1da');
const BLANCO = new THREE.Color('#ffffff');
const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mezclar = (a, b, t) => a + (b - a) * t;

function nubeDePuntos({ cantidad, posicion, tam, colores, uniformes = {} }) {
  const pos = new Float32Array(cantidad * 3);
  const tams = new Float32Array(cantidad);
  const fases = new Float32Array(cantidad);
  const cols = new Float32Array(cantidad * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < cantidad; i++) {
    posicion(v, i);
    v.toArray(pos, i * 3);
    tams[i] = tam();
    fases[i] = Math.random();
    colores[Math.floor(Math.random() * colores.length)].toArray(cols, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aTam', new THREE.BufferAttribute(tams, 1));
  g.setAttribute('aFase', new THREE.BufferAttribute(fases, 1));
  g.setAttribute('aColor', new THREE.BufferAttribute(cols, 3));
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT_PUNTOS, fragmentShader: FRAG_PUNTOS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uOpacidad: { value: 1 }, uDeriva: { value: 0 }, uTitila: { value: 0 }, ...uniformes },
  });
  return new THREE.Points(g, m);
}

/** Dirección (x, y, z) de un punto del planeta según latitud y longitud en radianes. */
const direccion = (lat, lon) => new THREE.Vector3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));

export function crearMundo(canvas, { capaPines, alSeleccionar, alTocarPlaneta } = {}) {
  // "inicio": el planeta es la puerta a Walkurio · "walkurio": mapa con regiones
  let modoActual = 'inicio';
  const movil = matchMedia('(pointer: coarse)').matches;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, alpha: true, powerPreference: 'high-performance' });
  const px = Math.min(devicePixelRatio || 1, movil ? 1.5 : 1.75);
  renderer.setPixelRatio(px);
  renderer.setClearColor(0x000000, 0);

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(38, 1, 0.1, 500);
  camara.position.set(0, 0, 70);
  const sol = new THREE.Vector3(-0.82, 0.38, 0.45).normalize();
  const reloj = { t: 0 };
  const todos = [];
  const comun = (m) => { todos.push(m); return m; };

  // ---------- Planeta (gira con el arrastre)
  const giro = new THREE.Group();
  giro.rotation.set(0.32, -0.6, 0);
  escena.add(giro);
  const seg = movil ? 96 : 144;
  const esfera = new THREE.SphereGeometry(1, seg, seg);
  const planeta = new THREE.Mesh(esfera, comun(new THREE.ShaderMaterial({
    vertexShader: VERT_PLANETA, fragmentShader: FRAG_PLANETA, uniforms: { uTime: { value: 0 }, uSol: { value: sol } },
  })));
  giro.add(planeta);
  const nubes = new THREE.Mesh(new THREE.SphereGeometry(1.022, 96, 96), comun(new THREE.ShaderMaterial({
    vertexShader: VERT_PLANETA, fragmentShader: FRAG_NUBES, transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uSol: { value: sol } },
  })));
  giro.add(nubes);
  const atmosfera = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 64), new THREE.ShaderMaterial({
    vertexShader: VERT_ATMOS, fragmentShader: FRAG_ATMOS, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color('#7cc4f0') } },
  }));
  escena.add(atmosfera);

  // ---------- Anillo de polvo de hadas
  const anillo = nubeDePuntos({
    cantidad: movil ? 1600 : 3200,
    posicion: (v) => { const a = Math.random() * Math.PI * 2; const r = 1.55 + Math.pow(Math.random(), 1.6) * 0.75; v.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.03, Math.sin(a) * r); },
    tam: () => 14 + Math.random() * 26,
    colores: [CELESTE, BLANCO, PANTANO, CELESTE],
    uniformes: { uTitila: { value: 0.5 } },
  });
  const ejeAnillo = new THREE.Group();
  ejeAnillo.rotation.set(1.22, 0, 0.32);
  ejeAnillo.add(anillo);
  escena.add(ejeAnillo);
  todos.push(anillo.material);

  // ---------- Polvo que flota alrededor
  const polvo = nubeDePuntos({
    cantidad: movil ? 220 : 420,
    posicion: (v) => { v.randomDirection().multiplyScalar(1.35 + Math.random() * 2.6); },
    tam: () => 12 + Math.random() * 22,
    colores: [CELESTE, BLANCO, PANTANO],
    uniformes: { uDeriva: { value: 1 }, uTitila: { value: 0.8 } },
  });
  escena.add(polvo);
  todos.push(polvo.material);

  // ---------- Estrellas
  const estrellas = nubeDePuntos({
    cantidad: movil ? 1400 : 2600,
    posicion: (v) => { v.randomDirection().multiplyScalar(80 + Math.random() * 160); },
    tam: () => 220 + Math.random() * 420,
    colores: [BLANCO, BLANCO, CELESTE, PANTANO],
    uniformes: { uTitila: { value: 0.55 } },
  });
  escena.add(estrellas);
  todos.push(estrellas.material);

  // ---------- Lunas: una pálida y un cristal
  escena.add(new THREE.AmbientLight('#7fa6d9', 0.5));
  const luzSol = new THREE.DirectionalLight('#ffffff', 2.2);
  luzSol.position.copy(sol).multiplyScalar(10);
  escena.add(luzSol);
  const luna = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 32), new THREE.MeshStandardMaterial({ color: '#dfe9f2', roughness: 0.9 }));
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshStandardMaterial({ color: '#92d2f5', emissive: '#2b6fa8', emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.3, flatShading: true }));
  escena.add(luna, cristal);

  // ---------- Estelas del viaje de entrada
  const nEstelas = movil ? 380 : 700;
  const estelas = new Float32Array(nEstelas * 6);
  const datosEstela = Array.from({ length: nEstelas }, () => ({ a: Math.random() * Math.PI * 2, r: 1.5 + Math.random() * 22, z: -Math.random() * 160 }));
  const gEstelas = new THREE.BufferGeometry();
  gEstelas.setAttribute('position', new THREE.BufferAttribute(estelas, 3));
  const mEstelas = new THREE.LineBasicMaterial({ color: '#a9dcfa', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const lineas = new THREE.LineSegments(gEstelas, mEstelas);
  lineas.frustumCulled = false;
  escena.add(lineas);
  let velocidad = 0;

  // ---------- Regiones (categorías)
  let regiones = [];
  let faros = null;
  function setRegiones(lista) {
    regiones = lista.map((r, i) => {
      // Espiral dorada: reparte las regiones sin que se pisen, dentro de latitudes "habitables"
      const lat = Math.asin(((i + 0.5) / Math.max(lista.length, 1)) * 1.3 - 0.65);
      const lon = i * 2.39996 + 0.4;
      return { ...r, lat, lon, dir: direccion(lat, lon) };
    });
    if (faros) giro.remove(faros);
    faros = nubeDePuntos({
      cantidad: regiones.length,
      posicion: (v, i) => v.copy(regiones[i].dir).multiplyScalar(1.03),
      tam: () => 80,
      colores: [CELESTE],
      uniformes: { uTitila: { value: 0.6 } },
    });
    faros.material.depthTest = true;
    giro.add(faros);
    todos.push(faros.material);
    capaPines.innerHTML = regiones.map((r, i) => `
      <button type="button" class="wk-pin" data-i="${i}" aria-label="Región ${r.name}">
        <span class="wk-pin__punto" aria-hidden="true">${i + 1}</span><span class="wk-pin__nombre">${r.name.replace(/[<>&]/g, '')}</span>
      </button>`).join('');
  }
  capaPines?.addEventListener('click', (e) => {
    const b = e.target.closest('.wk-pin');
    if (!b) return;
    enfocar(Number(b.dataset.i));
  });

  // ---------- Encuadre (planeta a la derecha en compu, abajo en celular)
  const encuadre = { distancia: 4.2, dx: 0, dy: 0 };
  // Corrimiento extra cuando hay una región abierta (la tarjeta tapa un costado)
  const corrimiento = { dx: 0, dy: 0, x: 0, y: 0 };
  let ancho = 1, alto = 1;
  function medir() {
    ancho = canvas.clientWidth || innerWidth;
    alto = canvas.clientHeight || innerHeight;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    const t = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const zoom = modoActual === 'walkurio' ? 1.12 : 1;
    if (ancho >= 1000) {
      encuadre.distancia = 1 / (0.40 * zoom * t);
      encuadre.dx = -0.19; encuadre.dy = 0;
    } else if (ancho >= 750) {
      encuadre.distancia = Math.max(1 / (0.34 * zoom * t), 1 / (0.42 * zoom * t * camara.aspect));
      encuadre.dx = -0.14; encuadre.dy = -0.04;
    } else {
      encuadre.distancia = Math.max(1 / (0.36 * zoom * t), 1 / (0.66 * zoom * t * camara.aspect));
      encuadre.dx = 0; encuadre.dy = -0.27;
    }
  }
  medir();
  new ResizeObserver(medir).observe(canvas);

  // ---------- Arrastrar para girar
  const estado = { arrastrando: false, x: 0, y: 0, vx: 0, vy: 0, objetivo: null, quieto: 0, mx: 0, my: 0 };
  const rayo = new THREE.Raycaster();
  const tocaPlaneta = (e) => {
    const r = canvas.getBoundingClientRect();
    rayo.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camara);
    return rayo.intersectObject(planeta).length > 0;
  };
  let inicioToque = null;
  canvas.addEventListener('pointerdown', (e) => {
    inicioToque = { x: e.clientX, y: e.clientY };
    estado.arrastrando = true; estado.x = e.clientX; estado.y = e.clientY; estado.objetivo = null;
    if (e.pointerType === 'mouse') canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-arrastrando');
  });
  canvas.addEventListener('pointermove', (e) => {
    estado.mx = (e.clientX / ancho) * 2 - 1; estado.my = (e.clientY / alto) * 2 - 1;
    if (!estado.arrastrando) return;
    const dx = e.clientX - estado.x; const dy = e.clientY - estado.y;
    estado.x = e.clientX; estado.y = e.clientY;
    estado.vx = dx * 0.0055; estado.vy = e.pointerType === 'mouse' ? dy * 0.004 : 0;
    giro.rotation.y += estado.vx;
    giro.rotation.x = THREE.MathUtils.clamp(giro.rotation.x + estado.vy, -0.75, 0.75);
    estado.quieto = 0;
  });
  const soltar = () => { estado.arrastrando = false; canvas.classList.remove('is-arrastrando'); };
  canvas.addEventListener('pointerup', (e) => {
    soltar();
    const quieto = inicioToque && Math.hypot(e.clientX - inicioToque.x, e.clientY - inicioToque.y) < 6;
    if (quieto && modoActual === 'inicio' && tocaPlaneta(e)) alTocarPlaneta?.();
  });
  canvas.addEventListener('mousemove', (e) => {
    if (modoActual === 'inicio' && !estado.arrastrando) canvas.classList.toggle('sobre-planeta', tocaPlaneta(e));
  });
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('pointerleave', () => { if (!canvas.hasPointerCapture?.(0)) soltar(); estado.mx = 0; estado.my = 0; });

  function enfocar(i) {
    const r = regiones[i];
    if (!r) return;
    // Girar para que la región quede de frente: primero longitud (Y), después latitud (X)
    const actual = giro.rotation.y;
    let y = -r.lon;
    y += Math.round((actual - y) / (Math.PI * 2)) * Math.PI * 2;
    estado.objetivo = { x: THREE.MathUtils.clamp(r.lat, -0.9, 0.9), y };
    estado.vx = 0; estado.vy = 0;
    capaPines.querySelectorAll('.wk-pin').forEach((b) => b.classList.toggle('is-activo', Number(b.dataset.i) === i));
    corrimiento.dx = ancho >= 750 ? 0.13 : 0; corrimiento.dy = ancho >= 750 ? 0 : 0.5;
    alSeleccionar?.(r, i);
  }
  function soltarFoco() {
    corrimiento.dx = 0; corrimiento.dy = 0;
    capaPines.querySelectorAll('.wk-pin.is-activo').forEach((b) => b.classList.remove('is-activo'));
  }

  // ---------- Viaje de entrada
  const viaje = { desde: 70, t: reducido ? 1 : 0, activo: false, dur: 2.8, fin: null };
  function entrar({ rapido = false } = {}) {
    return new Promise((ok) => {
      if (reducido || rapido) { viaje.t = 1; viaje.activo = false; ok(); return; }
      viaje.t = 0; viaje.activo = true; viaje.fin = ok;
    });
  }
  const enIntro = () => !viaje.activo && viaje.t === 0;

  // ---------- Bucle
  let corriendo = true;
  let ultimo = performance.now();
  const v = new THREE.Vector3(); const n = new THREE.Vector3(); const aCam = new THREE.Vector3();
  const pines = () => capaPines?.children ?? [];
  function cuadro(ahora) {
    if (!corriendo) return;
    requestAnimationFrame(cuadro);
    const dt = Math.min((ahora - ultimo) / 1000, 0.05);
    ultimo = ahora;
    reloj.t += dt;
    todos.forEach((m) => { if (m.uniforms?.uTime) m.uniforms.uTime.value = reloj.t; if (m.uniforms?.uPx) m.uniforms.uPx.value = px * (alto / 900); });

    // Viaje: la cámara se acerca y las estelas se estiran
    let k = 1;
    if (viaje.activo) {
      viaje.t = Math.min(1, viaje.t + dt / viaje.dur);
      if (viaje.t >= 1) { viaje.activo = false; viaje.fin?.(); }
    }
    if (viaje.activo || enIntro()) {
      k = suave(viaje.t);
      velocidad = enIntro() ? 6 : Math.sin(Math.min(viaje.t * 1.15, 1) * Math.PI) * 140 + 4;
      mEstelas.opacity = enIntro() ? 0.25 : Math.min(0.9, velocidad / 120);
    } else if (mEstelas.opacity > 0) {
      mEstelas.opacity = Math.max(0, mEstelas.opacity - dt * 2);
      velocidad *= 0.9;
    }
    if (mEstelas.opacity > 0.001) {
      for (let i = 0; i < nEstelas; i++) {
        const d = datosEstela[i];
        d.z += velocidad * dt;
        if (d.z > camara.position.z - 1) d.z -= 160;
        const largo = 0.15 + velocidad * 0.035;
        const x = Math.cos(d.a) * d.r; const y = Math.sin(d.a) * d.r;
        estelas.set([x, y, d.z, x, y, d.z - largo], i * 6);
      }
      gEstelas.attributes.position.needsUpdate = true;
    }
    lineas.visible = mEstelas.opacity > 0.001;

    // Cámara: distancia y encuadre según el avance del viaje (centrado durante la intro)
    const dist = mezclar(viaje.desde, encuadre.distancia, k);
    const px2 = !movil && !enIntro() ? estado.mx * 0.12 : 0;
    const py2 = !movil && !enIntro() ? -estado.my * 0.08 : 0;
    camara.position.x += (px2 - camara.position.x) * 0.05;
    camara.position.y += (py2 - camara.position.y) * 0.05;
    camara.position.z = dist;
    camara.lookAt(0, 0, 0);
    corrimiento.x += (corrimiento.dx - corrimiento.x) * Math.min(1, dt * 3);
    corrimiento.y += (corrimiento.dy - corrimiento.y) * Math.min(1, dt * 3);
    camara.setViewOffset(ancho, alto, (encuadre.dx + corrimiento.x) * ancho * k, (encuadre.dy + corrimiento.y) * alto * k, ancho, alto);

    // Giro del planeta: foco en una región, inercia o rotación lenta
    if (estado.objetivo) {
      giro.rotation.y += (estado.objetivo.y - giro.rotation.y) * Math.min(1, dt * 3.2);
      giro.rotation.x += (estado.objetivo.x - giro.rotation.x) * Math.min(1, dt * 3.2);
    } else if (!estado.arrastrando) {
      estado.vx *= 0.94; estado.vy *= 0.9;
      giro.rotation.y += estado.vx + (reducido ? 0 : dt * 0.06);
      giro.rotation.x = THREE.MathUtils.clamp(giro.rotation.x + estado.vy, -0.75, 0.75);
    }
    nubes.rotation.y += dt * 0.012;
    ejeAnillo.rotation.y += dt * 0.025;
    anillo.rotation.y += dt * 0.04;
    polvo.rotation.y -= dt * 0.015;
    estrellas.rotation.y += dt * 0.002;
    const tl = reloj.t * 0.22;
    luna.position.set(Math.cos(tl) * 2.25, Math.sin(tl * 0.7) * 0.35, Math.sin(tl) * 2.25);
    const tc = reloj.t * 0.34 + 2;
    cristal.position.set(Math.cos(tc) * 1.55, 0.55 + Math.sin(tc * 1.3) * 0.12, Math.sin(tc) * 1.55);
    cristal.rotation.x += dt * 0.8; cristal.rotation.y += dt * 1.1;

    renderer.render(escena, camara);

    // Pines HTML sobre el planeta: se esconden del lado de atrás
    if (k > 0.95 && regiones.length && modoActual === 'walkurio') {
      giro.updateMatrixWorld();
      const lista = pines();
      for (let i = 0; i < regiones.length; i++) {
        const el = lista[i];
        if (!el) continue;
        v.copy(regiones[i].dir).multiplyScalar(1.03).applyMatrix4(giro.matrixWorld);
        n.copy(v).normalize();
        aCam.copy(camara.position).sub(v).normalize();
        const frente = n.dot(aCam);
        v.project(camara);
        const x = (v.x * 0.5 + 0.5) * ancho; const y = (-v.y * 0.5 + 0.5) * alto;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        const visible = frente > 0.18;
        el.style.opacity = visible ? Math.min(1, (frente - 0.18) * 4).toFixed(2) : '0';
        el.tabIndex = visible ? 0 : -1;
        el.classList.toggle('is-oculto', !visible);
      }
    }
  }
  requestAnimationFrame(cuadro);

  return {
    entrar,
    setRegiones,
    /** Cambia entre la portada del inicio y el mapa de Walkurio. */
    modo(m) {
      if (m === modoActual) return;
      modoActual = m;
      canvas.classList.remove('sobre-planeta');
      if (m !== 'walkurio') { soltarFoco(); estado.objetivo = null; }
      medir();
    },
    enfocar,
    soltarFoco,
    /** Pausa el render cuando la portada no se ve (ahorra batería). */
    activo(si) {
      if (si === corriendo) return;
      corriendo = si;
      if (si) { ultimo = performance.now(); requestAnimationFrame(cuadro); }
    },
  };
}
