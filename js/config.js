// Configuración de Walkiverso: qué categoría de la tienda cumple cada rol y los contenidos
// que la plataforma todavía no deja cargar desde el panel (videos, reseñas y preguntas).

// Handles de las categorías principales (se crean en el panel con estos handles).
// Todas las DEMÁS categorías son regiones de Walkurio (aparecen como puntos en el planeta).
export const categoriasClave = {
  criaturas: 'criaturas',
  objetos: 'objetos',
  duendes: 'duendes',
  cursos: 'cursos',
};
// Categorías que no son regiones ni se muestran como colección (ej.: el e-book de Walkiver)
export const categoriasOcultas = ['ebooks'];

export const enlaces = {
  walkiver: '/walkiver/',
  instagram: 'https://www.instagram.com/walkiverso',
  youtube: 'https://www.youtube.com/@walkiver',
};

// Videos del taller ("Magia en movimiento"). Sin URL se muestran como "Muy pronto".
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
  { nombre: 'Sofía', lugar: 'Colonia', estrellas: 5, texto: 'Se la regalé a mi hermana y lloró. El empaque, la carta, todo es especial.', adopto: 'Polilla Nebli' },
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
