// Textos de marca de Walkiverso (los que no vienen de la tienda).
// Los marcados (P) son PROVISORIOS; el resto son los de la web actual en Shopify.
export const textos = {
  portal: {
    linea: 'Un planeta pequeño y extraño te está esperando', // (P)
    cargando: 'Abriendo el portal…',
    entrar: 'Entrar al Walkiverso',
    saltar: 'Saltar intro',
  },
  hero: {
    antetitulo: 'Taller de criaturas · Hecho a mano',
    titulo: 'Arte, Magia y Reciclaje',
    bajada: 'Criaturas y objetos esculpidos a mano con materiales reciclados. Piezas únicas, con nombre propio, que llegan desde Walkurio hasta tu casa.',
    boton: 'Ver la tienda',
    boton2: 'Visitar Walkurio',
    planeta: 'Tocá el planeta para visitarlo',
  },
  walkurio: {
    antetitulo: 'Cartografía del Walkiverso',
    titulo: 'Walkurio',
    bajada: 'Un planeta pequeño y extraño donde conviven las criaturas del Walkiverso. Recorré sus regiones, descubrí quién vive en cada rincón y adoptá a la criatura que te elija.',
    boton: 'Recorrer las regiones',
    pista: 'Arrastrá el planeta · Tocá una región',
    pistaTactil: 'Deslizá el planeta · Tocá una región',
    guia: 'Guía de regiones',
    guiaBajada: 'Tocá una región para verla en el planeta.',
    verEnMapa: 'Ver en el planeta',
  },
  region: { antetitulo: 'Región de Walkurio', explorar: 'Explorar región', vacia: 'Nadie vive acá todavía… por ahora.' },
  categorias: { antetitulo: 'Explorá', titulo: 'Habitantes del Walkiverso', boton: 'Ver colección', piezas: (n) => `${n} ${n === 1 ? 'pieza' : 'piezas'}` },
  duendes: {
    antetitulo: 'Del bosque de Milarko',
    titulo: 'Los duendes buscan hogar',
    bajada: 'Cada duende nace único, con nombre propio y un don. Cuando uno encuentra hogar, no vuelve a aparecer otro igual.',
    contador: (n) => (n === 1 ? 'Queda un solo duende buscando hogar' : `Quedan ${n} duendes buscando hogar`),
    elegir: 'Que un duende te elija', // (P)
    eligiendo: 'Escuchando al bosque…', // (P)
    elegido: (n) => `${n} te eligió`, // (P)
    girar: 'Tocá la carta para conocerlo', // (P)
    adoptar: 'Adoptar',
    conocer: 'Conocerlo',
    todos: 'Conocer a todos los duendes',
  },
  recientes: {
    antetitulo: 'Novedades', titulo: 'Recién salidos del taller',
    bajada: 'Cada criatura es única e irrepetible: cuando encuentra hogar, no vuelve a existir otra igual.',
    pestanas: { nuevos: 'Novedades', ofertas: 'Ofertas', criaturas: 'Criaturas', objetos: 'Objetos' },
    boton: 'Ver toda la tienda', adoptada: 'Adoptada', vacio: 'Por ahora no hay piezas acá.',
  },
  deseo: {
    antetitulo: 'Solicitudes',
    titulo: 'Pedile un deseo al Walkiverso',
    bajada: 'Tus ideas pueden inspirar a las próximas criaturas y objetos del taller.',
    preguntas: [
      ['¿Cómo funcionan las solicitudes?', '<p>A través de este formulario podés enviarnos una solicitud para futuras creaciones del Walkiverso.</p><p>Cada creación es única: las criaturas se desarrollan por <strong>personajes</strong> y los objetos por <strong>diseños</strong>. Por ese motivo no realizamos encargos personalizados ni aceptamos pagos anticipados.</p><p>Estos aportes nos ayudan a entender qué creaciones despiertan más interés dentro de la comunidad.</p>'],
      ['¿Qué pasa con las solicitudes?', '<p>A comienzos de cada semana revisamos las solicitudes que nos llegan.</p><p>Según nuestro tiempo y disponibilidad, algunas pueden transformarse en nuevas piezas dentro del Walkiverso. Cada una se crea de forma artesanal.</p>'],
      ['¿Cómo enterarte si llega una nueva pieza?', '<p>Cuando una nueva criatura u objeto esté listo, lo anunciamos en nuestro <strong>Instagram (@walkiverso)</strong> y queda disponible acá mismo en la <strong>web</strong> para su compra inmediata.</p>'],
    ],
    empezar: 'Solicitar una creación',
    paso1: '¿Qué te gustaría ver nacer?', // (P)
    criatura: ['Una criatura', 'Un ser con nombre, carácter y un don'], // (P)
    objeto: ['Un objeto', 'Una bitácora, un frasco, algo con magia'], // (P)
    paso2: 'Contale tu deseo al orbe', // (P)
    ayuda2: 'Cómo es, dónde viviría, qué la hace especial. Mientras escribís, el orbe se llena de luz.', // (P)
    referencia: 'Link a una imagen de referencia (opcional)',
    paso3: '¿A dónde te avisamos?', // (P)
    soltar: 'Mantené apretado para soltar el deseo', // (P)
    soltarCorto: 'Soltar el deseo',
    exito: '¡Tu deseo llegó al taller!',
    exitoTexto: 'Revisamos las solicitudes a comienzos de cada semana.',
    otro: 'Pedir otro deseo',
    nota: 'No es un encargo: es una idea que puede inspirar las próximas creaciones.',
  },
  videos: {
    antetitulo: 'Desde el taller', titulo: 'Magia en movimiento',
    bajada: 'Así nacen las criaturas: del cartón reciclado a su primera mirada.',
    boton: 'Seguinos en Instagram', canal: 'Más vídeos en el canal de Walkiver', pronto: 'Muy pronto',
  },
  resenas: {
    antetitulo: 'Voces de Walkurio', titulo: 'Lo que dicen quienes adoptaron', adopto: 'Adoptó a',
    boton: 'Dejá tu reseña', formTitulo: 'Contanos cómo te fue',
    formTexto: 'Tu experiencia ayuda a que otras criaturas encuentren hogar.',
    formNota: 'Leemos cada reseña antes de publicarla. Tu email no se muestra.',
    enviar: 'Enviar reseña', gracias: '¡Gracias! Recibimos tu reseña y la vamos a leer con mucho cariño.',
  },
  preguntas: {
    antetitulo: 'Preguntas frecuentes', titulo: 'Lo que siempre nos preguntan', // (P)
    oraculo: 'Preguntale al oráculo…', // (P)
    nada: 'El oráculo no sabe esa… todavía.', // (P)
    otra: '¿No encontraste tu respuesta?', escribinos: 'Escribinos',
  },
  tienda: {
    titulo: 'Tienda', bajada: 'Todas las criaturas y objetos del Walkiverso.', // (P)
    buscar: 'Buscar en la tienda', todo: 'Todo', colecciones: 'Colecciones', regiones: 'Regiones',
    vacio: 'No encontramos nada por acá.', mas: 'Ver más',
    orden: { recientes: 'Más nuevos', 'price-asc': 'Menor precio', 'price-desc': 'Mayor precio' },
  },
  ficha: {
    agregar: 'Adoptar', agregarObjeto: 'Agregar al carrito', agotado: 'Ya encontró hogar', elegir: 'Elegí una opción',
    unica: 'Pieza única', relacionados: 'Vecinos de la misma región',
    certificado: 'Certificado de origen', origen: 'Región de origen', pieza: 'Pieza Nº',
    hecho: 'Hecha a mano con materiales reciclados', // (P)
  },
  cursos: {
    antetitulo: 'Aprendé en el taller de Walkiver', titulo: 'Cursos',
    bajada: 'Criaturas, objetos y secretos del taller, paso a paso y a tu ritmo.',
    ver: 'Ver el curso', pronto: 'Pronto, más cursos',
  },
  contacto: {
    antetitulo: 'Correo de raíces', titulo: 'Escribinos',
    bajada: '¿Tenés una pregunta sobre una pieza, un envío o una idea para una criatura nueva? Contanos y te respondemos desde el taller.',
    asuntos: ['Consulta sobre una pieza', 'Envíos', 'Solicitudes y sugerencias', 'Prensa y colaboraciones', 'Otro'],
    querido: 'Querido Walkiverso:', // (P)
    firma: 'Con cariño,', // (P)
    enviar: 'Enviar mensaje',
    nota: 'Recordá que no hacemos encargos personalizados ni pedimos pagos por adelantado.',
    exito: '¡Tu mensaje ya está en camino!', exitoTexto: 'Te respondemos desde el taller lo antes posible.', otro: 'Escribir otra carta',
    taller: 'El taller', tallerTexto: 'Uruguay · Envíos a todo el país', horario: 'Lunes a viernes, 10 a 18 h', seguinos: 'Seguinos',
  },
  buscar: {
    titulo: '¿Qué buscás en el Walkiverso?', // (P)
    placeholder: 'Una criatura, un objeto, una región…', // (P)
    sugerencias: 'Caminos', productos: 'Piezas', paginas: 'Lugares', nada: 'Ni rastro de eso en el Walkiverso.', todo: 'Ver todos los resultados',
  },
  noEncontrado: { titulo: 'Esta región no está en el mapa', bajada: 'Parece que te perdiste entre las estrellas.', boton: 'Volver al inicio' },
};
