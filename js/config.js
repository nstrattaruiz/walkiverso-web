// Configuración de Walkiverso: qué categoría de la tienda cumple cada rol y los contenidos
// que la plataforma todavía no deja cargar desde el panel (videos, reseñas y preguntas).

// Categorías con un rol especial (por handle, como se crean en el panel)
export const categoriasClave = {
  duendes: 'duendes-milarko', // sección "Los duendes buscan hogar"
  cursos: 'cursos',           // página /cursos
};
// Pestañas de "Recién salidos" (además de Novedades y Ofertas)
export const pestanas = ['criaturas', 'bitacoras'];
// Categorías de objetos: sus piezas se "agregan al carrito" (las demás se "adoptan")
export const categoriasObjeto = ['bitacoras'];
// Las categorías cuyo handle empieza así son REGIONES de Walkurio (puntos del planeta), no colecciones de la tienda.
// Ej.: nombre "Solantera", handle "region-solantera".
export const prefijoRegion = 'region-';
// Categorías que no se muestran como colección de la tienda
export const categoriasOcultas = ['ebooks', 'cursos'];

export const enlaces = {
  walkiver: '/walkiver/',
  instagram: 'https://www.instagram.com/walkiverso',
  youtube: 'https://www.youtube.com/@walkiver',
};

// Videos del taller (espejos mágicos). Sin URL se muestran como "Muy pronto".
export const videos = [
  { url: 'https://www.youtube.com/shorts/5DDQchotJdw', titulo: 'Nace una mandrágora' },
  { url: '', titulo: 'Pintando a Sadybud' },
  { url: '', titulo: 'Bitácora Corpus Vacuum' },
  { url: '', titulo: 'Un día en el taller' },
];

// Reseñas (PROVISORIAS, de ejemplo como en la web actual: reemplazar por reales)
export const resenas = [
  { nombre: 'Carolina', lugar: 'Montevideo', estrellas: 5, texto: 'Mi mandrágora llegó perfecta y tiene una personalidad hermosa. Ya es parte de la familia.', adopto: 'Mandrágora Tuna' },
  { nombre: 'Martín', lugar: 'Canelones', estrellas: 5, texto: 'El detalle de cada pieza es increíble, se nota el amor en cada hoja.', adopto: 'Duende Brizo' },
  { nombre: 'Lucía', lugar: 'Maldonado', estrellas: 5, texto: 'La bitácora es una obra de arte, y el certificado un detalle mágico.', adopto: 'Bitácora · Corpus Vacuum' },
  { nombre: 'Sofía', lugar: 'Colonia', estrellas: 5, texto: 'Se la regalé a mi hermana y lloró. El empaque, la carta, todo es especial.', adopto: 'Pixie Nebli' },
  { nombre: 'Diego', lugar: 'Paysandú', estrellas: 5, texto: 'Nunca vi algo así hecho con cartón reciclado. Una pieza única de verdad.', adopto: 'Duende Tilo' },
  { nombre: 'Valentina', lugar: 'Rocha', estrellas: 5, texto: 'Mi duende vigila mi escritorio todos los días. Gracias por tanta magia.', adopto: 'Duende Ramón' },
];

// Preguntas frecuentes (PROVISORIAS: revisar y completar)
export const preguntas = [
  ['¿Cada pieza es realmente única?', 'Sí. Cada criatura y cada objeto se esculpe y se pinta a mano, sin moldes. Cuando una pieza encuentra hogar, no vuelve a existir otra igual.'],
  ['¿Con qué materiales están hechas?', 'Con materiales reciclados: cartón, pasta de papel, telas, alambre y frascos rescatados, terminados con acrílicos y barniz para que duren muchos años.'],
  ['¿Hacen envíos?', 'Enviamos a todo Uruguay. Por ahora las piezas físicas no salen del país; los cursos y los e-books sí se pueden comprar desde el exterior.'],
  ['¿Hacen encargos personalizados?', 'No hacemos encargos ni pedimos pagos por adelantado. Si soñás con una criatura u objeto, pedile un deseo al Walkiverso: tus ideas inspiran las próximas creaciones.'],
  ['¿Las piezas traen certificado?', 'Sí. Cada pieza llega con su certificado de autenticidad firmado, con su nombre y su región de origen en Walkurio.'],
  ['¿Cómo cuido a mi criatura?', 'Lejos de la humedad y del sol directo. Para limpiarla alcanza con un pincel seco y suave. No la mojes.'],
  ['¿Qué medios de pago aceptan?', 'Mercado Pago, tarjetas, Abitab o RedPagos, y en cuotas. Desde el exterior, PayPal (para cursos y e-books).'],
];

// ---------------------------------------------------------------- fotos de la portada
// PROVISORIAS: hoy apuntan a las fotos publicadas en la tienda de Shopify (no se descargaron).
// Cuando se cierre Shopify, subir los archivos a img/ y cambiar estas rutas (ej.: 'img/hero-1.webp').
const SHOPIFY = 'https://walkiverso-u8kifld3.myshopify.com/cdn/shop/files/';
// Figuras del hero (recortes sin fondo, se alternan solas). PNG o WebP transparente, ~1400 px de alto.
export const heroImagenes = ['img/mandragora.webp', 'img/bitacora.webp'];
// "Habitantes del Walkiverso": las dos puertas. Imagen de compu (2400 × 1000) y de celular (1000 × 1250).
export const puertas = [
  { handle: 'criaturas', titulo: 'Criaturas', imagen: `${SHOPIFY}criaturas-categoriapc-mandragora-mandrake-harrypotter-halloween.webp?width=1800`, imagenMovil: `${SHOPIFY}criaturas-categoria-mandragora-mandrake-harrypotter-halloween.webp?width=1000` },
  { handle: 'bitacoras', titulo: 'Objetos', imagen: `${SHOPIFY}objetos-categoriapc-bitacora-diario-journal-halloween.webp?width=1800`, imagenMovil: `${SHOPIFY}objetos-categoria-bitacora-diario-journal-halloween.webp?width=1000` },
];
