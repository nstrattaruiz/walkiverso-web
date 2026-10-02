// Servidor local para ver la web SIN la plataforma (usa la tienda de ejemplo de js/demo).
// Uso:  node .dev/servir.mjs   →  http://localhost:5173
// Con la plataforma, usar lo normal: npm run sitio -- dev --tienda ... --carpeta ...
// Esta carpeta (.dev) es oculta: no se publica.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };
const puerto = Number(process.env.PORT) || 5173;

createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  // El SDK real no existe acá: 404 para que la web use la tienda de ejemplo
  if (ruta.startsWith('/api/')) { res.writeHead(404); res.end(); return; }
  const archivo = normalize(join(raiz, ruta));
  if (!archivo.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
  try {
    // Igual que la plataforma: carpeta con index.html propio, si no el index.html del sitio
    const destino = extname(archivo) ? archivo : await readFile(join(archivo, 'index.html')).then(() => join(archivo, 'index.html'), () => join(raiz, 'index.html'));
    const datos = await readFile(destino);
    res.writeHead(200, { 'Content-Type': tipos[extname(destino)] ?? 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(datos);
  } catch {
    res.writeHead(404); res.end('No encontrado');
  }
}).listen(puerto, () => console.log(`Walkiverso (demo) en http://localhost:${puerto}`));
