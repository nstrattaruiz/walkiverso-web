// Paisaje nocturno del inicio en capas (parallax): cielo, luna, montañas lejanas, colinas, bosque y suelo.
// Al bajar, las capas se mueven a distinta velocidad y "entrás" al bosque, hasta que todo es noche
// y el polvo del viaje toma la escena. Hecho en SVG (sin fotos); se puede reemplazar por ilustraciones.
const ANCHO = 1600, ALTO = 1000;

function azarDe(semilla) { let s = semilla; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

/** Línea de cerros: suma de ondas + ruido, cerrada hacia abajo. */
function cerros(semilla, base, amp, ondas) {
  const r = azarDe(semilla);
  const fases = ondas.map(() => r() * Math.PI * 2);
  const pts = [];
  for (let x = -20; x <= ANCHO + 20; x += 16) {
    let y = base;
    ondas.forEach(([f, a], i) => { y -= Math.sin((x / ANCHO) * Math.PI * 2 * f + fases[i]) * amp * a; });
    y += (r() - 0.5) * amp * 0.08;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M-20,${ALTO + 40} L${pts.join(' L')} L${ANCHO + 20},${ALTO + 40} Z`;
}

/** Bosque: pinos y árboles redondos sobre una línea. */
function bosque(semilla, base, alto, cantidad, redondos = 0.3) {
  const r = azarDe(semilla);
  let d = `M-20,${ALTO + 40} L-20,${base} `;
  const arboles = [];
  for (let i = 0; i < cantidad; i++) {
    const x = (i / cantidad) * (ANCHO + 80) - 40 + (r() - 0.5) * 30;
    const h = alto * (0.55 + r() * 0.6);
    const w = h * (0.28 + r() * 0.12);
    const y0 = base + (r() - 0.5) * 18;
    if (r() < redondos) {
      // árbol redondo con tronco
      arboles.push(`M${x - 3},${y0} L${x - 3},${y0 - h * 0.45} L${x + 3},${y0 - h * 0.45} L${x + 3},${y0} Z`);
      const rad = w * 0.95;
      arboles.push(`M${x - rad},${y0 - h * 0.55} a${rad},${rad * 0.95} 0 1,1 ${rad * 2},0 a${rad},${rad * 0.6} 0 1,1 ${-rad * 2},0 Z`);
    } else {
      // pino de tres pisos
      let p = `M${x},${y0 - h} `;
      for (let k = 1; k <= 3; k++) { const yy = y0 - h + (h * k) / 3; const ww = (w * k) / 3 + w * 0.15; p += `L${x + ww},${yy} L${x + ww * 0.45},${yy} `; }
      p += `L${x + w * 0.12},${y0} L${x - w * 0.12},${y0} `;
      for (let k = 3; k >= 1; k--) { const yy = y0 - h + (h * k) / 3; const ww = (w * k) / 3 + w * 0.15; p += `L${x - ww * 0.45},${yy} L${x - ww},${yy} `; }
      arboles.push(`${p}Z`);
    }
  }
  d += `L${ANCHO + 20},${base} L${ANCHO + 20},${ALTO + 40} Z`;
  return [d, ...arboles].join(' ');
}

const capa = (prof, contenido, clase = '') => `
  <div class="wv-capa ${clase}" data-prof="${prof}" aria-hidden="true">
    <svg viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="xMidYMax slice" focusable="false">${contenido}</svg>
  </div>`;

/** Marcado del paisaje (va dentro del primer capítulo del inicio). */
export const marcadoPaisaje = () => `
  <div class="wv-paisaje" aria-hidden="true">
    <div class="wv-capa wv-capa--cielo" data-prof="0.85"><span class="wv-luna"></span></div>
    ${capa(0.7, `<path d="${cerros(11, 640, 120, [[1.3, 1], [3.1, 0.35], [7, 0.12]])}" fill="url(#cerro-lejos)"/>`)}
    ${capa(0.55, `<path d="${cerros(23, 720, 90, [[1.9, 1], [4.3, 0.4], [9, 0.1]])}" fill="#0d2a78"/>`, 'wv-capa--niebla')}
    ${capa(0.4, `<path d="${bosque(5, 800, 120, 46, 0.25)}" fill="#081f5e"/>`, 'wv-capa--niebla')}
    ${capa(0.22, `<path d="${bosque(17, 880, 190, 30, 0.4)}" fill="#04154a"/>`)}
    ${capa(0.05, `<path d="${bosque(29, 960, 290, 16, 0.5)}" fill="#010d36"/>`)}
    <svg width="0" height="0" focusable="false"><defs>
      <linearGradient id="cerro-lejos" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a56b4"/><stop offset="1" stop-color="#132f80"/></linearGradient>
    </defs></svg>
  </div>`;

/** Mueve las capas con el scroll. Devuelve la función para soltarlo. */
export function moverPaisaje(raiz) {
  const capas = [...raiz.querySelectorAll('.wv-capa')].map((el) => [el, Number(el.dataset.prof)]);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let raf = 0;
  const pintar = () => {
    raf = 0;
    const y = Math.min(scrollY, innerHeight * 1.4);
    for (const [el, k] of capas) el.style.transform = `translate3d(0, ${(y * k).toFixed(1)}px, 0)`;
    raiz.style.setProperty('--bajada', Math.min(1, y / innerHeight).toFixed(3));
  };
  const alScroll = () => { if (!raf) raf = requestAnimationFrame(pintar); };
  addEventListener('scroll', alScroll, { passive: true });
  pintar();
  return () => removeEventListener('scroll', alScroll);
}

/** La linde del bosque: silueta de árboles donde termina el papel y empieza la noche (pie en páginas claras). */
export function lindeDelBosque() {
  return `<svg class="wv-pie__linde" viewBox="0 0 ${ANCHO} 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <path d="${bosque(41, 230, 150, 34, 0.45).replace(/1040/g, '300')}" fill="#6f84b8" opacity=".35" transform="translate(0,-28)"/>
    <path d="${bosque(13, 250, 190, 26, 0.5).replace(/1040/g, '300')}" fill="#02040c"/>
  </svg>`;
}
