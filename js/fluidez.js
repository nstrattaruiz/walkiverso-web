// Fluidez: scroll suave con inercia (Lenis), cursor con masa y botones magnéticos.
// Todo con suavizado independiente de los fps, así se siente igual de fluido en cualquier pantalla.
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const damp = (s, dt) => 1 - Math.pow(1 - s, dt * 60);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** Capas con scroll propio: la rueda del mouse les pertenece a ellas, no a la página. */
const PROPIO = '.wv-drawer, .ns-panel, .wv-modal, .wk-modal, .wk-ritual, .wk-region, .wv-search__results, [data-scroll-propio]';

export async function iniciarFluidez() {
  let lenis = null;
  if (!REDUCED) {
    try {
      const { default: Lenis } = await import('https://unpkg.com/lenis@1.1.13/dist/lenis.mjs');
      lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: 0.9, syncTouch: false, prevent: (n) => !!n.closest?.(PROPIO) });
      document.documentElement.classList.add('con-lenis');
      // Con un panel abierto, la página no se mueve
      new MutationObserver(() => {
        const quieta = document.documentElement.classList.contains('wv-layer-open') || document.documentElement.classList.contains('ns-menu-open') || document.body.classList.contains('con-modal') || document.body.classList.contains('en-entrada');
        if (quieta) lenis.stop(); else lenis.start();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      new MutationObserver(() => {
        const quieta = document.body.classList.contains('con-modal') || document.body.classList.contains('en-entrada');
        if (quieta) lenis.stop(); else if (!document.documentElement.classList.contains('wv-layer-open')) lenis.start();
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) { console.warn('Sin scroll suave:', e); }
  }

  // ---------------------------------------------------------------- cursor con masa
  const cursor = document.getElementById('cursor');
  const usaCursor = FINE && !REDUCED && cursor;
  if (usaCursor) document.documentElement.classList.add('con-cursor');
  const punto = cursor?.querySelector('.wv-cursor__punto'), aro = cursor?.querySelector('.wv-cursor__aro');
  const m = { x: innerWidth / 2, y: innerHeight / 2, movio: false, dentro: true, abajo: false, sobre: false };
  const c = { dx: m.x, dy: m.y, rx: m.x, ry: m.y, s: 1, sv: 0, st: 0, ang: 0, op: 0, ds: 1 };
  if (usaCursor) {
    addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; m.x = e.clientX; m.y = e.clientY; m.movio = true; m.dentro = true; }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) m.dentro = false; });
    document.addEventListener('pointerover', (e) => {
      const s = !!e.target.closest?.('a, button, [role=tab], summary, label, input, select, textarea, [data-magnet]');
      if (s !== m.sobre) { m.sobre = s; cursor.classList.toggle('is-sobre', s); }
    });
    addEventListener('pointerdown', () => { m.abajo = true; });
    addEventListener('pointerup', () => { m.abajo = false; });
  }

  // ---------------------------------------------------------------- botones magnéticos (se acercan apenas y vuelven con resorte)
  const imanes = new Map();
  if (FINE && !REDUCED) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest?.('.wv-btn, .wv-iconbtn, .wv-cartbtn, .ns-menu-btn, [data-magnet]');
      for (const [x, st] of imanes) if (x !== el) { st.tx = 0; st.ty = 0; }
      if (!el) return;
      const r = el.getBoundingClientRect();
      let st = imanes.get(el);
      if (!st) { st = { x: 0, y: 0, tx: 0, ty: 0 }; imanes.set(el, st); }
      const fuerza = el.dataset.magnet ? Number(el.dataset.magnet) : 0.22;
      st.tx = clamp((e.clientX - r.left - r.width / 2) * fuerza, -10, 10);
      st.ty = clamp((e.clientY - r.top - r.height / 2) * fuerza, -8, 8);
    }, { passive: true });
  }

  let ultimo = performance.now();
  const cuadro = (now) => {
    const dt = Math.min((now - ultimo) / 1000, 0.1); ultimo = now;
    lenis?.raf(now);
    if (usaCursor) {
      c.dx += (m.x - c.dx) * damp(0.35, dt); c.dy += (m.y - c.dy) * damp(0.35, dt);
      const px = c.rx, py = c.ry;
      c.rx += (m.x - c.rx) * damp(0.13, dt); c.ry += (m.y - c.ry) * damp(0.13, dt);
      const vx = (c.rx - px) / dt, vy = (c.ry - py) / dt, sp = Math.hypot(vx, vy);
      c.st += (Math.min(sp / 2600, 0.22) - c.st) * damp(0.15, dt);
      if (sp > 30) c.ang = Math.atan2(vy, vx);
      // Resorte de escala entre estados: reposo / sobre algo / apretando
      const ts = m.abajo ? 0.78 : m.sobre ? 1.8 : 1;
      const pasos = Math.ceil(dt / (1 / 120)), h = dt / pasos;
      for (let i = 0; i < pasos; i++) { c.sv += (170 * (ts - c.s) - 17 * c.sv) * h; c.s += c.sv * h; }
      c.ds += ((m.sobre ? 0 : 1) - c.ds) * damp(0.12, dt);
      c.op += ((m.movio && m.dentro ? 1 : 0) - c.op) * damp(0.06, dt);
      cursor.style.opacity = c.op.toFixed(3);
      punto.style.transform = `translate3d(${c.dx.toFixed(2)}px,${c.dy.toFixed(2)}px,0) scale(${c.ds.toFixed(3)})`;
      aro.style.transform = `translate3d(${c.rx.toFixed(2)}px,${c.ry.toFixed(2)}px,0) rotate(${c.ang.toFixed(3)}rad) scale(${(c.s * (1 + c.st)).toFixed(3)},${(c.s * (1 - c.st)).toFixed(3)})`;
    }
    for (const [el, st] of imanes) {
      st.x += (st.tx - st.x) * damp(st.tx || st.ty ? 0.16 : 0.07, dt);
      st.y += (st.ty - st.y) * damp(st.tx || st.ty ? 0.16 : 0.07, dt);
      if (!el.isConnected || (Math.abs(st.x) < 0.02 && Math.abs(st.y) < 0.02 && !st.tx && !st.ty)) { el.style.translate = ''; imanes.delete(el); continue; }
      el.style.translate = `${st.x.toFixed(2)}px ${st.y.toFixed(2)}px`;
    }
    requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);

  return {
    lenis,
    /** Ir arriba de golpe (al cambiar de página). */
    arriba() { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else scrollTo(0, 0); },
    /** Scroll suave hasta un elemento. */
    ir(el) { if (lenis) lenis.scrollTo(el, { duration: 1.8, offset: -40 }); else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); },
  };
}
