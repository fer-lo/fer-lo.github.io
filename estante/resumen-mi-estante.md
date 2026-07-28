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

## Sincronización entre dispositivos — EN PROGRESO (Supabase)

Se decidió ir directo por la opción Supabase (backend gratuito hosteado, la app se sigue sirviendo estática desde GitHub Pages). Estado exacto al cortar:

### Archivos
- La app ahora vive en `estante/` con `index.html`, `styles.css`, `app.js` (ya no existe `biblioteca.html`, fue reemplazado — commit ya pusheado a `main`).
- El código de Supabase (cliente, mapeo de filas, login, CRUD) **ya está escrito en `app.js` e `index.html`**, pero commiteado solo LOCALMENTE, no pusheado — el login todavía no es funcional (ver bloqueo abajo), así que no se subió para no romper la versión pública.

### Proyecto Supabase
- URL: `https://asevcnpqptmncjewekry.supabase.co`
- Publishable (anon) key ya está hardcodeada en `app.js` (es pública/segura de exponer en cliente, no es la `service_role`).
- **Falta correr el SQL** que crea la tabla `items` + políticas RLS (por usuario, vía `auth.uid()`). El bloque SQL completo se le pasó al usuario en el chat — si no se corrió todavía, hay que volver a generarlo o buscarlo en el historial de esta conversación antes de continuar. Sin esta tabla, cualquier login que funcione no va a poder leer/guardar libros.

### Login: por qué es OTP de 6 dígitos y no magic link
- Se implementó primero con magic link (click en el mail) pero falló con `otp_expired` — Gmail escanea/pre-visita los links de seguridad y gasta el token de un solo uso antes de que el usuario lo clickee. Es un problema conocido de Supabase + Gmail.
- Se cambió el flujo a **código de 6 dígitos escrito a mano** (`signInWithOtp` + `verifyOtp` con `type: 'email'`), inmune a ese problema. El HTML ya tiene el segundo form (`#codeForm`) y el JS ya maneja los dos pasos.

### Bloqueo actual: falta SMTP propio
- Supabase no deja editar las plantillas de email (necesario para agregar `{{ .Token }}`, que es lo que muestra el código de 6 dígitos en el mail) sin conectar un proveedor SMTP propio — el servicio de email interno de Supabase es solo para pruebas.
- Se eligió **Resend** (gratis, sin tarjeta, dominio de pruebas `onboarding@resend.dev` que no requiere verificar dominio propio).
- Pasos pendientes en Resend + Supabase:
  1. Crear cuenta en resend.com y generar una API key (`re_...`).
  2. En Supabase: **Project Settings → Authentication → SMTP Settings** → activar "Enable Custom SMTP" con host `smtp.resend.com`, puerto `465`, usuario `resend`, password = la API key de Resend, sender `onboarding@resend.dev`.
  3. En Supabase: **Authentication → Email Templates → Magic Link** → agregar `{{ .Token }}` en el cuerpo del mail (ej. "Tu código de acceso es: {{ .Token }}") y guardar.
  4. Ya con eso, probar el login end-to-end: pedir código, revisar mail de `holaferfi@gmail.com`, ingresar el código de 6 dígitos en la app.

### También pendiente (config de auth, ya explicada al usuario, no confirmado si se hizo)
- En Supabase → Authentication → URL Configuration: Site URL = `https://fer-lo.github.io/estante/`, y agregar `http://localhost:8934/*` a Redirect URLs (para poder seguir probando en local). Esto ya no es estrictamente necesario para el flujo de código de 6 dígitos (no depende de redirect), pero no está de más tenerlo configurado.

## Siguiente paso al retomar con Claude Code

1. Confirmar si se corrió el SQL de la tabla `items` (si no, correrlo — está en el historial de esta conversación).
2. Terminar de conectar Resend como SMTP en Supabase y agregar `{{ .Token }}` al template de Magic Link.
3. Probar el login completo en local (`python3 -m http.server` en `estante/` + navegador) con `holaferfi@gmail.com`.
4. Una vez que el login y el guardado/lectura de libros funcionen end-to-end, pushear los cambios de `app.js`/`index.html`/`styles.css` que ya están commiteados localmente (o hacer un nuevo commit si hay más cambios).
5. Mantener el resto de la app (UI, búsqueda, lomos) sin cambios — solo cambió de dónde se lee/escribe la biblioteca.
