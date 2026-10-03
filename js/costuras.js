// Costuras entre secciones: en vez de un corte recto, cada sección empieza con un borde de colinas suaves
// que se apoya sobre la anterior. Sobre el borde corre un hilo de luz y suben luciérnagas que pasan de una
// sección a la otra. Al bajar, las colinas se corren despacio (parallax), así el paso se siente vivo.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Colinas periódicas (sin cortes al repetirse): suma de ondas con períodos enteros. */
function colinas(semilla) {
  const W = 1440, H = 70, N = 144;
  let s = semilla * 9301 + 49297;
  const azar = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const f = [azar() * 6.28, azar() * 6.28, azar() * 6.28];
  const amp = [11 + azar() * 6, 6 + azar() * 4, 2.5 + azar() * 2];
  const per = [2 + Math.floor(azar() * 2), 4 + Math.floor(azar() * 2), 9 + Math.floor(azar() * 3)];
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * W;
    const t = (i / N) * Math.PI * 2;
    const y = 38 + amp[0] * Math.sin(per[0] * t + f[0]) + amp[1] * Math.sin(per[1] * t + f[1]) + amp[2] * Math.sin(per[2] * t + f[2]);
    pts.push([x.toFixed(1), Math.max(6, Math.min(H - 6, y)).toFixed(1)]);
  }
  const linea = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const svg = (cuerpo) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'>${cuerpo}</svg>`)}")`;
  return {
    mascara: svg(`<path d='${linea} L${W} ${H} L0 ${H} Z' fill='black'/>`),
    hilo: svg(`<path d='${linea}' fill='none' stroke='rgb(138,216,255)' stroke-width='1.6' stroke-linecap='round' vector-effect='non-scaling-stroke'/>`),
  };
}

const esOscura = (el) => {
  const c = getComputedStyle(el);
  const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c.backgroundColor);
  if (m && (m[4] === undefined || Number(m[4]) > 0.5)) return (Number(m[1]) * 0.3 + Number(m[2]) * 0.59 + Number(m[3]) * 0.11) < 100;
  return c.backgroundImage !== 'none';
};

/** Cose las secciones de la página actual (y el pie). */
export function coser(app) {
  const pie = document.querySelector('.pie');
  const mundoVisible = document.body.classList.contains('con-mundo');
  const secciones = [...app.children].filter((el) => el.matches('section, .wk-portada, .contenedor.ficha, article, div.wk-seccion') && el.offsetHeight > 0);
  const lista = [...secciones, pie].filter(Boolean);
  lista.forEach((sec, i) => {
    if (sec.dataset.cosida || sec.matches('.wk-portada, .wk-entrada')) return;
    const primera = i === 0 && sec !== pie;
    // La primera sección solo se cose si arriba hay algo (el planeta de Walkurio)
    if (primera && !mundoVisible) return;
    if (sec.matches('.contenedor.ficha, article')) return;
    sec.dataset.cosida = '1';
    // Las secciones claras sin fondo propio necesitan uno para tapar a la anterior
    const c = getComputedStyle(sec);
    if (c.backgroundColor === 'rgba(0, 0, 0, 0)' && c.backgroundImage === 'none') sec.style.backgroundColor = '#fff';
    const { mascara, hilo } = colinas(i * 7 + (sec.className.length % 13) + 3);
    sec.classList.add('wk-cosida');
    sec.style.setProperty('--ola', mascara);
    sec.style.setProperty('--ola-x', `${(i * 337) % 1440}px`);
    // El hilo de luz y las luciérnagas viven afuera de la sección (la máscara las recortaría)
    const borde = document.createElement('div');
    borde.className = `wk-borde${esOscura(sec) ? ' wk-borde--oscuro' : ''}`;
    borde.setAttribute('aria-hidden', 'true');
    borde.style.setProperty('--hilo', hilo);
    borde.style.setProperty('--ola-x', `${(i * 337) % 1440}px`);
    borde.innerHTML = `<span class="wk-borde__hilo"></span><span class="wk-borde__luces">${Array.from({ length: 7 }, (_, k) => `<i style="--x:${(8 + k * 14 + ((i * 17 + k * 23) % 9)).toFixed(0)}%;--d:${((k * 1.7 + i) % 6).toFixed(1)}s;--t:${(5 + ((k + i) % 4) * 1.3).toFixed(1)}s"></i>`).join('')}</span>`;
    sec.before(borde);
  });
}

// Las colinas se corren despacio al bajar
if (!reducido) {
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; document.documentElement.style.setProperty('--desliz', `${(scrollY * -0.08).toFixed(1)}px`); });
  }, { passive: true });
}
