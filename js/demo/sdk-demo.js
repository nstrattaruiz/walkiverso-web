// SOLO PARA VER LA WEB SIN LA PLATAFORMA. Imita el SDK (/api/v1/sdk.js) con datos de ejemplo.
// En la plataforma se usa el SDK real y este archivo no se carga. Se puede borrar antes de publicar.
const categorias = [
  { handle: 'bitacoras', name: 'Bitácoras', description: 'Libretas con tapas esculpidas para escribir tus propias crónicas.' },
  { handle: 'criaturas', name: 'Criaturas', description: 'Seres del Walkiverso esculpidos a mano con materiales reciclados.' },
  { handle: 'duendes-milarko', name: 'Duendes Milarko', description: 'Los habitantes traviesos de las Colinas Milarko. Cada uno con nombre propio y un don.' },
  { handle: 'mandragoras', name: 'Mandrágoras', description: 'Criaturas de raíz nacidas en Solantera, siempre medio dormidas.' },
  { handle: 'minidragoras', name: 'Minidrágoras', description: 'Las mandrágoras más pequeñas: caben en la palma de la mano.' },
  { handle: 'pixies', name: 'Pixies', description: 'Seres alados del Bosque de Musgoluz. Pequeños, silenciosos y curiosos.' },
  { handle: 'cursos', name: 'Cursos', description: 'Aprendé en el taller de Walkiver.' },
  { handle: 'ebooks', name: 'E-books', description: '' },
  { handle: 'region-colinas-milarko', name: 'Colinas Milarko', description: 'Lomas redondas y musgosas donde viven los duendes más traviesos del planeta.' },
  { handle: 'region-solantera', name: 'Solantera', description: 'Tierra de raíces profundas. Acá nacen las mandrágoras, siempre medio dormidas.' },
  { handle: 'region-bosque-de-musgoluz', name: 'Bosque de Musgoluz', description: 'Un bosque que brilla de noche. Sus habitantes son pequeños, silenciosos y curiosos.' },
  { handle: 'region-picos-vacuum', name: 'Picos Vacuum', description: 'Montañas de piedra antigua donde duermen las bitácoras que nadie terminó de escribir.' },
  { handle: 'region-lago-espejo', name: 'Lago Espejo', description: 'Aguas quietas que reflejan otro cielo. Dicen que algunas criaturas vienen de ese reflejo.' },
];
const p = (handle, title, cats, price, extra = {}) => ({
  id: handle, handle, title, price, compareAtPrice: extra.compareAtPrice ?? null, currency: 'UYU', available: extra.available ?? true,
  image: null, images: [], categories: cats, tags: [], type: '', vendor: 'Walkiverso', metafields: {},
  description: `<p>${title} es una pieza única, esculpida y pintada a mano con materiales reciclados. Llega con su nombre, su región de origen y su certificado de autenticidad firmado.</p><p>Medidas aproximadas: 14 × 9 × 8 cm.</p>`,
  options: [],
  variants: [{ id: `${handle}-v`, title: 'Única', options: [], price, compareAtPrice: extra.compareAtPrice ?? null, available: extra.available ?? true, stock: 1 }],
  ...extra,
});
const D = ['criaturas', 'duendes-milarko', 'region-colinas-milarko'];
const productos = [
  p('duende-brizo', 'Duende Brizo', D, 189000),
  p('duende-tilo', 'Duende Tilo', D, 175000, { compareAtPrice: 210000 }),
  p('duende-ramon', 'Duende Ramón', D, 189000, { available: false }),
  p('duende-de-proteccion', 'Duende de Protección', D, 205000),
  p('duende-espiritual', 'Duende Espiritual', D, 198000),
  p('duende-del-amor', 'Duende del Amor', D, 198000),
  p('duende-sadybud', 'Duende Sadybud', D, 215000),
  p('duende-pimpollo', 'Duende Pimpollo', D, 169000),
  p('mandragora-tuna', 'Mandrágora Tuna', ['criaturas', 'mandragoras', 'region-solantera'], 145000),
  p('mandragora-ocre', 'Mandrágora Ocre', ['criaturas', 'mandragoras', 'region-solantera'], 152000),
  p('minidragora-brote', 'Minidrágora Brote', ['criaturas', 'minidragoras', 'region-solantera'], 98000),
  p('minidragora-lila', 'Minidrágora Lila', ['criaturas', 'minidragoras', 'region-solantera'], 98000, { compareAtPrice: 115000 }),
  p('pixie-nebli', 'Pixie Nebli', ['criaturas', 'pixies', 'region-bosque-de-musgoluz'], 126000),
  p('pixie-aleta', 'Pixie Aleta', ['criaturas', 'pixies', 'region-lago-espejo'], 132000),
  p('bitacora-corpus-vacuum', 'Bitácora · Corpus Vacuum', ['bitacoras', 'region-picos-vacuum'], 312000),
  p('bitacora-del-cartografo', 'Bitácora del Cartógrafo', ['bitacoras', 'region-picos-vacuum'], 289000, { compareAtPrice: 340000 }),
  p('bitacora-de-niebla', 'Bitácora de Niebla', ['bitacoras', 'region-lago-espejo'], 276000, {
    options: [{ name: 'Hojas', values: ['Lisas', 'Rayadas'] }],
    variants: [
      { id: 'bn-l', title: 'Lisas', options: ['Lisas'], price: 276000, available: true, stock: 1 },
      { id: 'bn-r', title: 'Rayadas', options: ['Rayadas'], price: 276000, available: true, stock: 1 },
    ],
  }),
  p('curso-de-mandragoras', 'Curso de Mandrágoras', ['cursos'], 120000, {
    description: '<p>Aprendé a darle vida a tu propia mandrágora con pasta de cartón reciclado, alambre y acrílicos, paso a paso y a tu ritmo.</p><p>3 módulos · 6 clases · Acceso para siempre</p>',
    variants: [{ id: 'curso-mandragoras-v', title: 'Curso', options: [], price: 120000, available: true, stock: null }],
  }),
  p('somos-mitos-ebook', 'Somos Mitos · E-book', ['ebooks'], 39900, {
    compareAtPrice: 49900,
    variants: [{ id: 'ebook-v', title: 'PDF', options: [], price: 39900, compareAtPrice: 49900, available: true, stock: null }],
  }),
];
const variantes = new Map(productos.flatMap((x) => x.variants.map((v) => [v.id, { v, x }])));
const KEY = 'wk-demo-carrito';
let lineas = (() => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; } })();
const oyentes = new Set();
const espera = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const normal = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function armarCarrito() {
  const lines = lineas.filter((l) => variantes.has(l.variantId)).map((l, i) => {
    const { v, x } = variantes.get(l.variantId);
    return { line: i, variantId: v.id, handle: x.handle, title: x.title, variantTitle: x.variants.length > 1 ? v.title : '', quantity: l.quantity, price: v.price, total: v.price * l.quantity, image: x.image, maxQuantity: v.stock ?? null };
  });
  const total = lines.reduce((s, l) => s + l.total, 0);
  return { currency: 'UYU', itemCount: lines.reduce((s, l) => s + l.quantity, 0), subtotal: total, total, note: '', lines };
}
function guardar() {
  try { sessionStorage.setItem(KEY, JSON.stringify(lineas)); } catch { /* sin almacenamiento */ }
  const c = armarCarrito();
  oyentes.forEach((fn) => fn(c));
  return c;
}
const enlaceCat = (h) => ({ label: categorias.find((c) => c.handle === h).name, kind: 'category', handle: h, children: [] });

export const tienda = {
  demo: true,
  async info() {
    await espera();
    return {
      name: 'Walkiverso', currency: 'UYU', logo: null, favicon: null,
      colors: { primary: '#92d2f5', dark: '#021a62' },
      seo: { title: 'Walkiverso · Criaturas hechas a mano', description: 'Criaturas y objetos esculpidos a mano con materiales reciclados. Piezas únicas que llegan desde Walkurio hasta tu casa.' },
      contact: { phone: '099 123 456', email: 'hola@walkiverso.com', whatsapp: '099123456', whatsappMessage: '¡Hola Walkiverso!', instagram: 'https://www.instagram.com/walkiverso', facebook: 'https://www.facebook.com/walkiverso', location: 'Montevideo, Uruguay' },
      announcement: null,
      cookies: { mode: 'notice', text: 'Usamos cookies para que la tienda funcione.', acceptText: 'Entendido' },
      legal: [{ kind: 'privacy', title: 'Privacidad' }, { kind: 'terms', title: 'Términos' }, { kind: 'returns', title: 'Cambios y devoluciones' }],
      analytics: {},
      menus: {
        main: [
          { label: 'Tienda', kind: 'catalog', children: [{ label: 'Todas las piezas', kind: 'catalog', children: [] }, ...['bitacoras', 'criaturas', 'duendes-milarko', 'mandragoras', 'minidragoras', 'pixies'].map(enlaceCat)] },
          { label: 'Walkurio', kind: 'url', url: '/walkurio', children: [] },
          { label: 'Cursos', kind: 'url', url: '/cursos', children: [] },
          { label: 'Walkiver', kind: 'url', url: '/walkiver/', children: [] },
          { label: 'Contacto', kind: 'url', url: '/contacto', children: [] },
        ],
        footer: [
          { label: 'Tienda', children: ['bitacoras', 'criaturas', 'duendes-milarko', 'mandragoras', 'minidragoras', 'pixies'].map(enlaceCat) },
          { label: 'Walkurio', children: categorias.filter((c) => c.handle.startsWith('region-')).map((c) => enlaceCat(c.handle)) },
          { label: 'Walkiverso', children: [{ label: 'Cursos', kind: 'url', url: '/cursos' }, { label: 'Walkiver', kind: 'url', url: '/walkiver/' }, { label: 'Contacto', kind: 'url', url: '/contacto' }] },
        ],
      },
    };
  },
  async categorias() {
    await espera();
    return categorias.map((r) => ({ ...r, image: null, productCount: productos.filter((x) => x.categories.includes(r.handle)).length }));
  },
  productos: {
    async listar({ categoria, buscar, orden, soloDisponibles, pagina = 1, porPagina = 24 } = {}) {
      await espera();
      const q = normal(buscar);
      let items = productos.filter((x) => (!categoria || x.categories.includes(categoria)) && (!soloDisponibles || x.available) && (!q || normal(x.title).includes(q)));
      if (orden === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
      if (orden === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
      const pages = Math.max(1, Math.ceil(items.length / porPagina));
      return { items: items.slice((pagina - 1) * porPagina, pagina * porPagina), total: items.length, page: pagina, pages };
    },
    async uno(handle) {
      await espera();
      const x = productos.find((y) => y.handle === handle);
      if (!x) throw new Error('No encontramos este producto');
      return x;
    },
  },
  carrito: {
    async ver() { return armarCarrito(); },
    async agregar(variantId, cantidad = 1) {
      await espera();
      const { v } = variantes.get(variantId) ?? {};
      if (!v?.available) throw new Error('Este producto ya no está disponible');
      const l = lineas.find((y) => y.variantId === variantId);
      const nueva = (l?.quantity ?? 0) + cantidad;
      if (v.stock != null && nueva > v.stock) throw new Error(v.stock === 1 ? 'Es una pieza única: ya está en tu carrito' : `Solo quedan ${v.stock} unidades`);
      if (l) l.quantity = nueva; else lineas.push({ variantId, quantity: cantidad });
      return guardar();
    },
    async cambiar(linea, cantidad) {
      await espera(60);
      if (cantidad <= 0) lineas.splice(linea, 1); else lineas[linea].quantity = cantidad;
      return guardar();
    },
    async vaciar() { lineas = []; return guardar(); },
    async nota() { return armarCarrito(); },
    alCambiar(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
  },
  cuenta: {
    _leer() { try { return JSON.parse(localStorage.getItem('wk-demo-cuenta')) || null; } catch { return null; } },
    _guardar(c) { try { localStorage.setItem('wk-demo-cuenta', JSON.stringify(c)); } catch { /* sin almacenamiento */ } return c; },
    async yo() { await espera(80); return this._leer(); },
    async ingresar({ email, password }) {
      await espera(500);
      if (!email || !password || password.length < 6) throw new Error('Revisá tu email y tu contraseña (mínimo 6 caracteres).');
      const c = this._leer();
      return this._guardar(c?.email === email ? c : { name: email.split('@')[0], email, favoritos: [] });
    },
    async registrar({ name, email, password }) {
      await espera(600);
      if (!password || password.length < 6) throw new Error('La contraseña tiene que tener al menos 6 caracteres.');
      return this._guardar({ name, email, favoritos: this._leer()?.favoritos ?? [] });
    },
    async salir() { await espera(150); try { localStorage.removeItem('wk-demo-cuenta'); } catch { /* sin almacenamiento */ } },
    favoritos: {
      async listar() { return tienda.cuenta._leer()?.favoritos ?? []; },
      async agregar(h) { const c = tienda.cuenta._leer(); if (c && !c.favoritos.includes(h)) { c.favoritos.push(h); tienda.cuenta._guardar(c); } },
      async quitar(h) { const c = tienda.cuenta._leer(); if (c) { c.favoritos = c.favoritos.filter((x) => x !== h); tienda.cuenta._guardar(c); } },
    },
  },
  async contacto(datos) { await espera(500); console.info('[demo] mensaje al panel:', datos); return { ok: true }; },
  async legal(tipo) {
    await espera();
    const t = { privacy: 'Privacidad', terms: 'Términos', returns: 'Cambios y devoluciones' }[tipo];
    if (!t) throw new Error('No existe');
    return { title: t, html: '<p>Texto de ejemplo. En la plataforma, este contenido lo carga la tienda desde su panel.</p>' };
  },
  formatear(centesimos, moneda = 'UYU') {
    const n = new Intl.NumberFormat('es-UY', { maximumFractionDigits: centesimos % 100 ? 2 : 0, minimumFractionDigits: centesimos % 100 ? 2 : 0 }).format(centesimos / 100);
    return `${moneda === 'USD' ? 'US$' : '$'} ${n}`;
  },
};
