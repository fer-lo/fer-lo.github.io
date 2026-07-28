# Mi Estante — resumen del proyecto

Webapp personal para registrar libros, cómics y manga que voy leyendo. Un solo archivo HTML autocontenido (HTML + CSS + JS, sin build), hosteado en GitHub Pages.

## Estado actual

- **Archivos**: `estante/index.html`, `estante/styles.css`, `estante/app.js` (separados; antes era un solo `biblioteca.html`).
- **Hosting**: GitHub Pages (estático, sin servidor propio).
- **Persistencia**: **Supabase** (Postgres + Auth), sincroniza entre dispositivos. Ver detalle en la sección de Supabase más abajo.
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

## Modelo de datos (tabla `items` en Supabase, camelCase en JS ↔ snake_case en DB)

```json
{
  "id": "uuid (generado por Supabase)",
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
  "dateAdded": "timestamp (bigint, Date.now())",
  "dateFinished": "timestamp | null"
}
```
En la tabla `items` los campos son snake_case (`date_added`, `date_finished`); `app.js` tiene `rowToItem()`/`itemToRow()` para mapear entre uno y otro.

## Sincronización entre dispositivos — RESUELTO con Supabase

- **Proyecto**: `https://asevcnpqptmncjewekry.supabase.co`. La publishable (anon) key está hardcodeada en `app.js` (es pública/segura de exponer en cliente, no confundir con la `service_role`).
- **Tabla `items`**: ya creada, con RLS (row level security) para que cada usuario solo vea/edite sus propias filas (`user_id = auth.uid()`, con default `auth.uid()` en el insert).
- **Auth**: login con **email + contraseña** (`signUp` / `signInWithPassword` de Supabase). Se eligió este método, no magic link ni OTP por mail, porque:
  - El magic link falló con `otp_expired` — Gmail escanea/pre-visita los links de seguridad y gasta el token de un solo uso antes de que el usuario lo clickee (problema conocido Supabase + Gmail).
  - El código OTP de 6 dígitos por mail funcionaba, pero Supabase exige conectar un SMTP propio (Resend, etc.) para poder editar el template de email y mostrar el código — fricción innecesaria para una app de un solo usuario.
  - Con email+contraseña no se manda ningún mail: hace falta tener **"Confirm email" desactivado** en Supabase (Authentication → Providers → Email), si no el signup pide una confirmación por mail que no puede llegar sin SMTP.
- **UI de login**: overlay a pantalla completa (`#authOverlay` en `index.html`) con un solo form (email + contraseña) y dos botones: "Crear cuenta" (signup) y "Entrar" (signin). Mientras no hay sesión, tapa el resto de la app.
- **Recuperar contraseña**: no hay flujo de "olvidé mi contraseña" implementado (requeriría mail/SMTP). Si se olvida, resetearla a mano desde el dashboard de Supabase (Authentication → Users → editar usuario) o borrar el usuario y crear uno nuevo (se pierde el `user_id`, así que se perderían los items asociados — mejor resetear la contraseña, no borrar el usuario, si ya hay datos cargados).
- **Probado end-to-end** (crear cuenta, login, agregar libro, editar estado/rating, recargar y ver que persiste, borrar) el 2026-07-28 en local, funcionando correctamente.

## Siguiente paso al retomar con Claude Code

- La sincronización ya está resuelta y en uso. Si se retoma el proyecto, probablemente sea para features nuevas (ej. export/import, edición de más campos, mejoras de UI) más que para temas de auth/backend.
- Si en algún momento se quiere agregar recuperación de contraseña por mail, ahí sí retomar la idea de conectar Resend como SMTP en Supabase (ver Authentication → Email Templates y Authentication → SMTP Settings del dashboard).
