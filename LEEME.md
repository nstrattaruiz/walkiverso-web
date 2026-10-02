# Walkiverso · web nueva (plataforma)

Tienda de Walkiverso en HTML, CSS y JS para la plataforma, con la firma NS.
Cada página es una experiencia propia, conectada por una transición mágica (un círculo de cielo que se abre desde donde tocás).

## Recorrido
| Página | Experiencia |
|---|---|
| **Portal** (primera visita) | Anillo de luz y viaje a velocidad luz hasta Walkurio. Una vez por sesión; "Saltar intro" lo omite. |
| **Inicio** `/` | Planeta 3D (se arrastra; al tocarlo te lleva a Walkurio) → **Criaturas / Objetos** (dos puertas que se expanden, con luz que sigue al mouse y abanico de piezas) → **Duendes** (cartas coleccionables que se dan vuelta + "Que un duende te elija", ruleta que elige uno al azar) → **Recién salidos** (pestañas Novedades / Ofertas / Criaturas / Objetos, agregar rápido con vuelo al carrito) → **Pedile un deseo** (orbe de cristal que se ilumina mientras escribís y ritual en pasos; se mantiene apretado para soltar el deseo) → **Videos** (reels que se abren en un visor) → **Reseñas** (dos filas flotantes + formulario con estrellas) → **Preguntas** (oráculo que filtra mientras escribís). |
| **Walkurio** `/walkurio` | El planeta como mapa: cada región es un punto; al tocarlo gira y muestra quién vive ahí. Debajo, la guía de regiones. `/walkurio#solantera` abre directo esa región. |
| **Tienda** `/tienda`, `/categoria/:handle` | Cabecera con escena propia (bosque, taller, región con su planeta), colecciones y regiones, búsqueda y orden. |
| **Ficha** `/producto/:handle` | Galería en relieve, certificado de origen, "Adoptar" con vuelo al carrito y barra de compra fija. |
| **Cursos** `/cursos` | Cada curso es un libro que se abre al pasar. |
| **Deseos** `/deseos` | El ritual del deseo a pantalla completa. |
| **Contacto** `/contacto` | Una carta: al enviarla se pliega, entra en un sobre, se sella con lacre plateado y sale volando. |
| **Búsqueda** (lupa, `/` o Ctrl+K) | Busca piezas en vivo y lugares del Walkiverso. |
| **Walkiver** `/walkiver/` y `/walkiver/somos-mitos/` | **Copia exacta** de la web de Walkiver del tema de Shopify (mismo diseño, textos y animaciones). |

En toda la web: polvo de hadas que sigue al mouse y al dedo, y un destello en cada toque.

## Para el panel de la tienda
- **Categorías con estos handles** (se pueden cambiar en `js/config.js`): `criaturas`, `objetos`, `duendes`, `cursos`. Un producto puede estar en varias (ej.: un duende en *criaturas*, *duendes* y *colinas-milarko*).
- **Todas las demás categorías son regiones de Walkurio** (aparecen solas en el planeta). Su orden es el número de la región. La categoría `ebooks` se oculta (es del e-book de Walkiver).
- **E-book de Walkiver:** producto con handle `somos-mitos-ebook`. Su precio en pesos aparece en la página del e-book y "Comprar desde Uruguay" lo agrega al carrito. El link de PayPal y el precio en dólares siguen como estaban en Shopify.
- **Menú principal:** Tienda (con hijos Criaturas / Objetos / Duendes / Toda la tienda: se muestra como desplegable con fotos), Walkurio (`/walkurio`), Cursos (`/cursos`), Deseos (`/deseos`), Walkiver (`/walkiver/`), Contacto (`/contacto`).
- Los **deseos**, **reseñas** y mensajes de **contacto** (también los de Walkiver) llegan al panel como mensajes, con un campo `tipo` (Solicitud / Reseña).

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | Estructura: firma NS, portal, planeta, búsqueda, transición, carrito, pie |
| `css/walkiverso.css` | Base, botones, portal, planeta, tarjetas, ficha, carrito, pie |
| `css/secciones.css` | Cada experiencia (puertas, cartas, orbe, reels, reseñas, oráculo, carta y sobre, cursos, búsqueda…) |
| `js/app.js` | Arranque, rutas con transición, menú desplegable, búsqueda, carrito |
| `js/base.js` | Datos de la tienda, tarjetas, vuelo al carrito, modales |
| `js/paginas/*.js` | Una por página: inicio, deseo, walkurio, tienda, ficha, cursos, contacto |
| `js/mundo.js` | Walkurio en 3D (Three.js) |
| `js/polvo.js` | Polvo de hadas y destellos |
| `js/config.js` | Handles de categorías, **videos, reseñas y preguntas** (la plataforma todavía no deja cargarlos) |
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
| Imagen de **Criaturas** y **Objetos** | 1600 × 1200 px, motivo a la derecha | Panel → categoría (fondo de las puertas del inicio) |
| Imagen de cada región | 800 × 800 px | Panel → categoría (círculo de la guía de regiones y del menú) |
| Tu foto para "Sobre mí" de Walkiver (`walkiver.png`) | la misma de Shopify | Reemplazar `walkiver/assets/wkv-retrato.webp` (hoy se ve la del tema) |

## Pendiente
- Textos marcados (P) en `js/textos.js`, y videos / reseñas / preguntas reales en `js/config.js`.
- "Finalizar compra" avisa que el pago llega en la próxima etapa: cuando exista, conectar `tienda.checkout(...)`.
