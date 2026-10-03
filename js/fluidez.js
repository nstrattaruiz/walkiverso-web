// Fluidez: scroll suave con inercia (Lenis) y botones magnéticos (el mouse deja un polvo de hadas sutil: polvo.js).
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
