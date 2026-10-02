# Walkiverso · web nueva (plataforma)

Tienda de Walkiverso en HTML, CSS y JS para la plataforma, con la firma NS.
Cada página es una experiencia propia, conectada por una transición mágica.

## Recorrido
| Página | Experiencia |
|---|---|
| **Inicio** `/` | **Entrada "El bosque despierta"** (cada vez que se vuelve al inicio): noche con niebla y luna, tus raíces crecen desde los bordes, las luciérnagas se juntan y aparece "Walkiverso". La primera vez espera que toques; después se abre sola, y las raíces se abren como un telón. Luego el **hero** (como el de Shopify: fotos que se alternan, raíces a la izquierda, polvo que gira con el mouse) → **Habitantes** (puertas Criaturas / Objetos) → **Duendes Milarko** (cartas + ritual "Que un duende te elija") → **recién salidos** → **pedile un deseo** → **reels** (carrusel en arco) → **reseñas** → **preguntas**. |
| **Walkurio** `/walkurio` | El planeta 3D (viaje entre estrellas cada vez que se entra) con sus regiones y la guía. |
| **Tienda** `/tienda`, `/categoria/:handle` | Tarjeta de **Categorías** al costado (fila deslizable en celular) + regiones, búsqueda y orden. |
| **Ficha** `/producto/:handle` | Galería en relieve, certificado de origen, "Adoptar" (criaturas) o "Agregar al carrito" (bitácoras), favorito. |
| **Favoritos** `/favoritos` · **Cuenta** `/cuenta` | Corazón en cada pieza. Sin cuenta se guardan en el dispositivo; con cuenta, en la cuenta. |
| **Cursos** `/cursos` · **Contacto** `/contacto` | Libros que se abren · formulario que se pliega en un sobre sellado y sale volando. |
| **Walkiver** `/walkiver/` | Copia exacta de la web de Walkiver, con linterna que sigue al mouse. |

Entre páginas: tinta de noche que se derrama desde donde tocaste, un sigilo que se dibuja y la luz que se abre.
Letra: Cormorant Garamond solo en el hero y los títulos grandes; el resto en Jost (sin cursivas). Walkiver mantiene sus fuentes.
Tus raíces (`ramas_vector.svg`, `js/ramas.js`) crecen en las secciones claras y oscuras, como en Shopify.
Fotos del hero y de las puertas: en `js/config.js`. **Hoy son PROVISORIAS** y apuntan a las fotos publicadas en Shopify; al cerrarlo, subir los archivos a `img/` y cambiar las rutas.

## Para el panel de la tienda
- **Categorías de la tienda:** Bitácoras (`bitacoras`), Criaturas (`criaturas`), Duendes Milarko (`duendes-milarko`), Mandrágoras (`mandragoras`), Minidrágoras (`minidragoras`), Pixies (`pixies`). Aparecen solas en el inicio, en el menú y en la tienda.
- **Regiones de Walkurio:** categorías cuyo handle empieza con `region-` (ej.: nombre "Solantera", handle `region-solantera`). Son los puntos del planeta. Cada producto va en su colección y en su región.
- **Cursos:** categoría `cursos`. **E-book de Walkiver:** producto `somos-mitos-ebook` (categoría `ebooks`).
- Los roles y handles se cambian en `js/config.js`.
- **Cuentas de clientes:** la página está lista y espera `tienda.cuenta` en el SDK (`yo`, `ingresar`, `registrar`, `salir`, `favoritos.listar/agregar/quitar`). Hasta que la plataforma la tenga, muestra "muy pronto" y los favoritos se guardan en el dispositivo. En la demo está simulada para poder probarla.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | Estructura: firma NS, planeta de Walkurio, búsqueda, carrito, pie |
| `css/walkiverso.css` | Base, botones, planeta, tarjetas, ficha, carrito, pie |
| `css/secciones.css` | Menú desplegable, búsqueda, modales, cartas, deseo, reseñas, oráculo, cursos, contacto… |
| `css/experiencias.css` | Portal, colecciones, ritual, espejos, bola de cristal, contacto, tienda, favoritos, cuenta, transición |
| `js/app.js` | Arranque, rutas, menú, búsqueda, carrito |
| `js/entrada.js` | Portal de Raíces (WebGL + SVG) |
| `js/transicion.js` | Transición entre páginas |
| `js/cuenta.js` | Cuenta y favoritos |
| `js/base.js` | Datos de la tienda, tarjetas, vuelo al carrito, modales |
| `js/paginas/*.js` | Una por página: inicio, deseo, walkurio, tienda, ficha, cursos, contacto |
| `js/mundo.js` | Walkurio en 3D (Three.js) |
| `js/polvo.js` | Polvo de hadas y destellos |
| `js/config.js` | Handles de categorías y **videos, reseñas y preguntas** (la plataforma todavía no deja cargarlos) |
| `js/textos.js` | Textos de marca. Los marcados (P) son provisorios; el resto son los de la web de Shopify |
| `walkiver/` | Web de Walkiver (HTML generado desde el tema) + `plataforma.js` que la conecta con la tienda |
| `img/ramas.svg` | Ramas de la marca (de `referencias/ramas_vector.svg`) |
| `js/demo/sdk-demo.js`, `.dev/servir.mjs` | Tienda de ejemplo y servidor para verla sin la plataforma |

## Verla
- **Vista previa en línea:** https://nstrattaruiz.github.io/walkiverso-web/ (repo: https://github.com/nstrattaruiz/walkiverso-web). Cada push a `main` se publica solo en 1–2 minutos (`.github/workflows/pages.yml`). Usa la tienda de ejemplo.
- **Sin la plataforma (demo):** `node .dev/servir.mjs` y abrir `http://localhost:5173`.
- **Con la plataforma:** `npm run sitio -- dev --tienda walkiverso.localhost --carpeta "<esta carpeta>"`.

## Imágenes
Todo se ve bien sin fotos (cada pieza muestra un "retrato" de luz con su inicial). Lo ideal:

| Imagen | Medida | Dónde |
|---|---|---|
| Foto principal de cada producto | 2000 × 2000 px | Panel → producto (se recorta a 4:5 en tarjetas y a 5:7 en las cartas de duendes: dejar aire arriba y abajo) |
| Segunda foto (ambientada) | 2000 × 2000 px | Panel → producto (aparece al pasar el mouse) |
| Imagen de cada colección | 900 × 1300 px (vertical), motivo centrado y arriba | Panel → categoría (ventana en arco del inicio y miniatura de la tienda). Sin imagen se usa la foto de su primera pieza |
| Imagen de cada región | 800 × 800 px | Panel → categoría (círculo de la guía de regiones) |
| Tu foto para "Sobre mí" de Walkiver (`walkiver.png`) | la misma de Shopify | Reemplazar `walkiver/assets/wkv-retrato.webp` (hoy se ve la del tema) |

## Pendiente
- Textos marcados (P) en `js/textos.js`, y videos / reseñas / preguntas reales en `js/config.js`.
- "Finalizar compra" avisa que el pago llega en la próxima etapa: cuando exista, conectar `tienda.checkout(...)`.
- Cuentas de clientes: conectar cuando la plataforma tenga `tienda.cuenta`.
