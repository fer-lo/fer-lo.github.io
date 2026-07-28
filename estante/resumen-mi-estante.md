# Mi Estante — resumen del proyecto

Webapp personal para registrar libros, cómics y manga que voy leyendo. Un solo archivo HTML autocontenido (HTML + CSS + JS, sin build), hosteado en GitHub Pages.

## Estado actual

- **Archivo**: `biblioteca.html` (un solo archivo, sin dependencias externas de build).
- **Hosting**: GitHub Pages (estático, sin backend).
- **Persistencia actual**: `localStorage` del navegador → **cada dispositivo tiene su propia copia, no sincronizan entre sí.** Este es el problema pendiente a resolver (ver más abajo).
- **Diseño**: estantería de libros. Cada título es un "lomo" vertical con color según categoría (azul = libro, naranja = cómic, morado = manga), con texto rotado tipo lomo real. El grosor del lomo varía según páginas/capítulos reales cuando existen, más una variación orgánica basada en el título para que nunca se vean todos iguales. Los lomos están agrupados en "slots" de altura fija (230px) para que la tabla de madera del estante quede siempre justo debajo de todos, sin cruzarlos.

## Categorías y estados

- Categorías: `libro`, `comic`, `manga`.
- Pestañas: **Todo** (las tres juntas, orden cronológico por defecto = orden en que se agregaron), Libros, Cómics, Manga.
- Estado de lectura por item: `pendiente`, `leyendo`, `completado`, `abandonado`.
- Valoración: 1-5 estrellas.
- Notas de texto libres.
- **No hay tracking de progreso** (páginas leídas, capítulo actual, etc.) — decisión explícita: el campo `total` (páginas/capítulos) se guarda solo internamente para calcular el ancho del lomo, nunca se pide ni se edita manualmente en la UI.

## Búsqueda automática de datos

Al añadir un título, se busca en APIs públicas (sin API key) para traer portada, autor, año y páginas/capítulos:

- **Libros y cómics** → [Open Library Search API](https://openlibrary.org/dev/docs/api/search)
  `GET https://openlibrary.org/search.json?q=...`
  - No siempre trae el número de páginas en el resultado de búsqueda. Por eso, al pulsar "Añadir", si falta ese dato se hace una segunda consulta a las ediciones de la obra:
    `GET https://openlibrary.org{workKey}/editions.json?limit=10` y se toma el primer `number_of_pages` disponible.
- **Manga** → [AniList GraphQL API](https://docs.anilist.co/)
  `POST https://graphql.anilist.co` (sin key, requiere `Content-Type: application/json`).

### Historial de por qué se eligieron estas APIs
- Se probó primero **Google Books API** sin key para libros/cómics → falló con errores 403/429 porque sin key comparte una cuota anónima muy limitada entre todas las apps del mundo. Se reemplazó por Open Library (sin key, sin ese límite).
- Se probó primero **Jikan (MyAnimeList)** para manga → fallaba con "Failed to fetch" de forma intermitente por problemas de CORS/rate limiting desde el navegador. Se reemplazó por AniList (CORS estable, documentado para uso desde frontend).

Si en el futuro cualquiera de las dos vuelve a fallar, el patrón a seguir es el mismo: buscar una alternativa sin API key con CORS confiable, no volver a las anteriores.

## Modelo de datos (cada item guardado)

```json
{
  "id": "id_...",
  "category": "libro | comic | manga",
  "title": "string",
  "authors": "string",
  "cover": "url de imagen",
  "description": "string (opcional)",
  "year": "string",
  "total": "number (páginas o capítulos, solo interno para el ancho del lomo)",
  "current": 0,
  "status": "pendiente | leyendo | completado | abandonado",
  "rating": "0-5",
  "notes": "string",
  "dateAdded": "timestamp",
  "dateFinished": "timestamp | null"
}
```

## Pendiente: sincronización entre dispositivos

**Problema**: `localStorage` es por navegador/dispositivo. GitHub Pages es solo hosting estático, no tiene backend propio. Por eso el celular y la compu no comparten datos.

**Opciones evaluadas** (de más simple a más completa):

1. **Exportar/Importar manual** — botones para descargar/cargar un `.json` con toda la biblioteca. Cero infraestructura nueva, pero sincronización manual (hay que pasar el archivo a mano cada vez).
2. **Backend gratuito (Firebase o Supabase)** — base de datos en la nube pensada para apps solo-frontend. Requiere: cuenta gratuita, autenticación simple (email o anónima con código propio), reglas de seguridad para que solo el dueño lea/escriba sus datos, y cambiar `loadLibrary()`/`saveLibrary()` para hablar con ese servicio en vez de `localStorage`. **Recomendada** para este caso: sincroniza en tiempo real, plan gratuito de sobra, la app sigue siendo estática y se puede seguir hosteando en GitHub Pages.
3. **Gist privado de GitHub como "base de datos"** — guardar el JSON en un Gist privado y leer/escribir vía la API de GitHub con un token personal (permisos limitados solo a Gists). No suma servicios nuevos, pero hay que manejar el token con cuidado y no sincroniza en tiempo real (hay que refrescar).
4. **Servidor propio + base de datos** (Node/Python en Render, Railway, etc.) — más esfuerzo del necesario para este caso de uso personal.

**Decisión sugerida**: implementar la opción 2 (Firebase o Supabase) cuando se retome el proyecto, salvo que se prefiera algo más rápido de armar (en ese caso, opción 1 como parche temporal).

## Siguiente paso al retomar con Claude Code

1. Confirmar si se quiere ir directo a Supabase/Firebase o primero un export/import manual como solución rápida.
2. Si es Supabase/Firebase: crear proyecto, definir tabla/colección `items` con el modelo de datos de arriba, activar autenticación simple, y reemplazar las funciones `loadLibrary()` / `saveLibrary()` del archivo `biblioteca.html` por llamadas a esa API, agregando una pantalla mínima de login.
3. Mantener el resto de la app (UI, búsqueda, lomos) sin cambios — solo cambia de dónde se lee/escribe la biblioteca.
