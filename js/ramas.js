/**
 * Walkiverso · Raíces (dibujo del usuario: referencias/ramas_vector.svg)
 * Copiado del tema de Shopify (assets/wk-ramas.js). Las usan la entrada, el hero y las ramas de fondo de cada sección.
 * - Cada raíz es el mismo dibujo, colocado desde un borde (semilla), girado y escalado;
 *   con sentido -1 se refleja para que no se vean todas iguales.
 * - Crece desde el borde: una máscara con el frente difuminado la va descubriendo
 *   (.wk-rama__reveal, animado con CSS en cada sección).
 * - Nunca se pisan: cada raíz se prueba contra las ya colocadas; si choca, se achica
 *   y se reintenta, y si no entra, se descarta. Solo cambia el color (lo pone el CSS).
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const CELL = 40;
let uid = 0;

/** Dibujo original: 227 × 491. Brota del borde izquierdo (x = 0); el ancla es su centro */
const ART = { width: 227, height: 491, anchorY: 245 };
const PATHS = [
  "M69 26L53 18L31 18L30 19L29 18L28 19L15 19L5 28L2 29L0 31L0 42L12 34L18 26L29 26L30 25L47 25L48 26L50 26L52 28L58 30L68 39L73 47L81 55L82 57L82 64L83 65L83 79L79 83L79 84L71 91L68 92L63 96L54 96L53 97L28 97L27 98L23 98L20 100L18 100L14 102L11 102L10 103L0 105L0 120L5 117L10 116L19 111L27 110L36 105L40 105L41 104L50 104L51 103L62 102L63 101L83 101L84 100L86 100L88 98L92 97L95 94L96 92L97 67L95 63L95 60L94 59L93 54L86 46L86 45L84 44L75 34Z",
  "M41 55L39 51L31 43L29 42L21 42L21 44L25 47L25 51L26 52L26 59L25 61L19 67L6 67L0 62L0 70L6 71L7 72L19 72L20 71L30 71L31 70L33 70L40 65L41 63Z",
  "M44 158L40 160L34 161L29 164L27 164L17 168L12 173L10 177L10 179L8 181L5 179L0 178L0 197L1 197L9 205L16 209L17 211L19 212L20 215L23 217L28 223L31 224L33 227L48 237L58 247L65 252L69 256L70 259L73 263L74 263L78 267L79 304L80 305L80 309L73 317L72 320L67 325L65 325L49 333L47 333L43 335L24 335L19 333L3 317L2 315L2 304L14 293L15 293L21 286L23 285L32 286L40 289L42 292L42 298L43 297L43 290L44 289L44 283L41 281L39 281L34 277L21 277L11 282L2 288L0 291L0 328L5 332L13 336L20 343L32 343L33 342L54 342L55 341L60 341L65 338L67 338L72 335L74 335L80 332L84 325L95 311L95 309L96 308L96 302L95 301L95 287L96 286L101 289L109 296L114 298L116 301L116 303L119 306L122 307L131 316L132 319L136 324L138 329L146 341L146 354L143 361L143 364L142 365L141 370L136 381L128 387L126 387L115 396L109 399L104 404L101 405L92 414L91 416L91 425L97 436L99 437L104 437L105 438L119 438L120 437L122 437L127 432L126 430L126 425L119 421L113 420L111 421L110 425L112 426L118 425L119 426L120 431L116 434L108 434L103 428L103 416L121 398L122 396L137 393L138 392L146 390L152 386L159 367L159 364L160 363L160 353L162 351L170 351L176 347L190 347L195 353L195 359L192 362L187 362L185 363L188 366L195 366L201 360L204 359L203 349L201 348L198 344L192 339L169 339L168 340L166 340L165 339L159 339L158 338L156 339L155 338L155 332L154 331L154 329L148 321L144 313L143 308L130 297L131 295L135 294L141 289L146 289L148 288L155 281L161 278L165 273L167 268L170 264L170 255L172 253L172 248L170 246L170 238L169 237L169 233L168 232L168 230L165 226L163 218L157 208L150 201L143 196L129 196L128 197L127 196L126 197L118 197L115 199L115 200L111 204L110 204L105 209L103 209L100 212L98 216L95 219L95 221L94 222L94 227L96 231L100 234L106 236L108 238L118 240L122 237L127 230L127 224L125 221L125 219L123 219L121 223L120 228L116 233L113 233L109 231L107 227L103 224L106 220L107 217L112 212L118 211L122 208L138 208L139 209L143 209L151 218L152 224L155 230L155 236L156 237L156 239L158 241L158 251L157 252L154 263L152 266L152 268L148 274L144 274L143 275L137 276L127 280L116 279L115 278L110 277L107 275L101 274L93 267L92 267L77 252L75 248L71 245L68 238L64 234L64 233L58 229L53 224L50 219L47 217L46 215L28 197L22 193L18 193L17 192L17 190L21 186L23 182L34 171L37 170L43 165L45 165L46 164L51 164L56 162L64 162L67 164L69 164L73 168L74 170L74 181L73 183L69 186L67 186L61 182L61 180L64 177L67 179L69 179L69 174L68 172L63 171L61 172L55 179L55 182L63 189L76 189L78 187L86 170L81 164L78 162L70 160L66 157Z"
];

/** Vértices del dibujo, para medir choques entre raíces */
const VERTICES = PATHS.flatMap((d) => [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]));

/**
 * Estilo único de raíz para todo el sitio. Se mantiene por compatibilidad con quienes lo
 * importan; el tamaño sale del largo de cada semilla.
 */
export const RAMA_STYLE = {
  maxDepth: 0,
  baseWidth: () => 0,
};

function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

/**
 * @param {SVGSVGElement} svg
 * @param {object} options
 * @param {number} options.w - ancho del área
 * @param {number} options.h - alto del área
 * @param {Array<[number, number, number, number, number]>} options.seeds - [x, y, ángulo hacia afuera del borde, largo, sentido (1 o -1)]
 * @param {number} [options.delay] - demora inicial (s)
 * @param {boolean} [options.instant] - crecer rápido (al redimensionar)
 * @param {number} [options.gap] - separación mínima extra entre raíces (px)
 */
export function growBranches(svg, { w, h, seeds, delay = 0.3, instant = false, gap = 0 }) {
  const grid = new Map();
  const defs = el('defs', {});
  const shapes = document.createDocumentFragment();

  // Frente de crecimiento difuminado (compartido por todas las raíces de este svg)
  const fadeId = `wk-rama-fade-${++uid}`;
  const fade = el('linearGradient', { id: fadeId, x1: 0, x2: 1, y1: 0, y2: 0 });
  fade.append(el('stop', { offset: 0.78, 'stop-color': '#fff' }), el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }));
  defs.appendChild(fade);

  const project = (x, y, angle, scale, dir) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return VERTICES.map(([px, py]) => {
      const lx = px * scale;
      const ly = (py - ART.anchorY) * scale * dir;
      return [x + lx * cos - ly * sin, y + lx * sin + ly * cos];
    });
  };

  const collides = (points, radius) => {
    for (const [x, y] of points) {
      const cx = Math.floor(x / CELL);
      const cy = Math.floor(y / CELL);
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        for (let gy = cy - 1; gy <= cy + 1; gy++) {
          for (const [ox, oy, or] of grid.get(`${gx},${gy}`) || []) {
            const min = radius + or;
            if ((x - ox) ** 2 + (y - oy) ** 2 < min * min) return true;
          }
        }
      }
    }
    return false;
  };

  const occupy = (points, radius) => {
    for (const [x, y] of points) {
      const key = `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push([x, y, radius]);
    }
  };

  /**
   * El dibujo tiene los extremos cortados en recto sobre su borde izquierdo (x = 0). Si la raíz
   * sale girada, ese corte se ve como pedazos sueltos: por eso sale siempre derecha desde el
   * borde más cercano, y el corte queda unos píxeles afuera de la pantalla.
   */
  const snapToEdge = (x, y, angle, scale) => {
    if (!w || !h) return [x, y, angle];
    const inset = 4 * scale;
    const edges = [
      [Math.abs(x), () => [-inset, y, 0]],
      [Math.abs(w - x), () => [w + inset, y, Math.PI]],
      [Math.abs(h - y), () => [x, h + inset, -Math.PI / 2]],
      [Math.abs(y), () => [x, -inset, Math.PI / 2]],
    ];
    return edges.sort((a, b) => a[0] - b[0])[0][1]();
  };

  seeds.forEach(([seedX, seedY, seedAngle, length, dir = 1], i) => {
    const flip = dir < 0 ? -1 : 1;
    let scale = (length * 0.85) / ART.width;
    let points = null;
    let x = seedX;
    let y = seedY;
    let angle = seedAngle;
    for (let tries = 0; tries < 4; tries++, scale *= 0.8) {
      [x, y, angle] = snapToEdge(seedX, seedY, seedAngle, scale);
      const candidate = project(x, y, angle, scale, flip);
      if (!collides(candidate, 9 * scale + gap / 2)) {
        points = candidate;
        break;
      }
    }
    if (!points) return;
    occupy(points, 9 * scale + gap / 2);

    const id = `wk-rama-${++uid}`;
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -20, y: -40, width: ART.width + 120, height: ART.height + 80 });
    const reveal = el('rect', { class: 'wk-rama__reveal', x: -10, y: -30, width: ART.width + 90, height: ART.height + 60, fill: `url(#${fadeId})` });
    reveal.style.setProperty('--delay', `${instant ? 0 : (delay + i * 0.35).toFixed(2)}s`);
    reveal.style.setProperty('--dur', `${instant ? 0.6 : 2.6}s`);
    mask.appendChild(reveal);
    defs.appendChild(mask);

    const deg = (angle * 180) / Math.PI;
    const group = el('g', {
      transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(2)}) scale(${scale.toFixed(4)} ${(scale * flip).toFixed(4)}) translate(0 ${-ART.anchorY})`,
    });
    // Lado de la pantalla del que sale (las secciones pueden tratar distinto a cada lado)
    const side = w && x > w / 2 ? 'wk-rama--derecha' : 'wk-rama--izquierda';
    const art = el('g', { class: `wk-rama ${side}`, mask: `url(#${id})` });
    for (const d of PATHS) art.appendChild(el('path', { d }));
    group.appendChild(art);
    shapes.appendChild(group);
  });

  svg.replaceChildren(defs, shapes);
}

/**
 * Ramas de fondo para cualquier sección: <span class="wk-ramas-fondo" data-esquinas="tr,bl" data-semilla="7"></span>
 * (versión de wk-branches.js). Crecen una vez cuando la sección entra en pantalla.
 * Esquinas: tl | tr | bl | br | l | r. Agregar la clase wk-ramas-fondo--luz en fondos oscuros.
 */
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
let observador;
export function ramasDeFondo(raiz = document) {
  observador ??= new IntersectionObserver((entradas) => entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-grown');
    observador.unobserve(e.target);
  }), { threshold: 0.15 });
  raiz.querySelectorAll('.wk-ramas-fondo:not([data-listo])').forEach((host) => {
    host.dataset.listo = '1';
    const svg = el('svg', { 'aria-hidden': 'true', focusable: 'false' });
    host.replaceChildren(svg);
    let ancho = 0;
    const armar = () => {
      const { width: w, height: h } = host.getBoundingClientRect();
      if (!w || !h || Math.abs(w - ancho) < 40) return;
      ancho = w;
      const chico = w < 750;
      const alcance = Math.min(Math.min(w, h) * (chico ? 0.42 : 0.38), 360);
      let esquinas = (host.dataset.esquinas || 'tr,bl').split(',').map((c) => c.trim());
      if (chico) esquinas = esquinas.slice(0, 1);
      const origen = {
        tl: [0, h * 0.08, 0.5, 1], tr: [w, h * 0.08, Math.PI - 0.5, -1],
        bl: [0, h * 0.94, -0.45, 1], br: [w, h * 0.94, Math.PI + 0.45, -1],
        l: [0, h * 0.5, -0.15, 1], r: [w, h * 0.5, Math.PI + 0.15, -1],
      };
      const semilla = Number(host.dataset.semilla) || 7;
      const seeds = esquinas.filter((c) => origen[c]).map((c, i) => [...origen[c].slice(0, 3), alcance * (0.85 + ((semilla * (i + 3)) % 7) / 30), origen[c][3]]);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      growBranches(svg, { w, h, seeds, delay: 0.1 });
    };
    new ResizeObserver(armar).observe(host);
    armar();
    if (reducido) host.classList.add('is-grown'); else observador.observe(host);
  });
}
