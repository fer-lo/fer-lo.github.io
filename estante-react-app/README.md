# Mi Estante — versión React (código fuente)

Migración de `estante/` (HTML/CSS/JS vanilla) a React + Vite, hecha como ejercicio de aprendizaje ("armar un proyecto React de cero"). Convive con `estante/` en producción — no la reemplaza (todavía).

**Esta carpeta es el código fuente y nunca se sirve directamente.** El sitio publicado en `https://fer-lo.github.io/estante-react/` sale de la carpeta hermana `../estante-react/`, que se genera y commitea automáticamente vía GitHub Actions (ver `.github/workflows/deploy-estante-react.yml`) en cada push a `main` que toque esta carpeta. Nunca hay que buildear y commitear `dist/` a mano.

## Cómo correrla en desarrollo

```bash
npm install
npm run dev
```

Necesita un `.env` con las credenciales de Supabase (no se commitea — ver `.env.example` como plantilla):

```
VITE_SUPABASE_URL=https://asevcnpqptmncjewekry.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

`npm run build` compila hacia `dist/` (ignorado por git) — sirve para verificar que compila sin tocar la carpeta publicada. Solo CI escribe el sitio real, pasando `BUILD_OUT_DIR=../estante-react` (ver `vite.config.js`).

## Estado (2026-08-23)

Migración funcional **completa y probada end-to-end**: login (email+contraseña contra Supabase), listar/filtrar/ordenar libros, buscar en Open Library/AniList y agregar (por búsqueda o manual), editar estado/rating/notas, eliminar. Usa las mismas tablas y el mismo proyecto de Supabase que `estante/` (comparten datos).

### Estructura del código
- `src/lib/supabaseClient.js` — cliente de Supabase (usa `import.meta.env`, no hardcodeado).
- `src/hooks/useAuth.js` — sesión, login, signup, logout.
- `src/hooks/useLibrary.js` — estado de la biblioteca + CRUD contra la tabla `items`.
- `src/lib/bookSearch.js` — búsquedas a Open Library / AniList (sin cambios de lógica respecto a la versión vieja).
- `src/lib/spineMath.js` — cálculo de alto/ancho de lomos + labels de categorías/estados.
- `src/components/` — `AuthGate`, `Header`, `Tabs`, `Toolbar`, `Shelf` + `Spine`, `AddModal` (búsqueda + alta manual), `DetailModal` (editar/eliminar).

### Deploy
- Workflow: `.github/workflows/deploy-estante-react.yml` — en cada push a `main` que toque `estante-react-app/**`, instala dependencias, corre `npm run build` con `BUILD_OUT_DIR=../estante-react` (más las env vars de Supabase inline en el workflow — son la `anon key` pública, no secretas) y commitea el resultado con `stefanzweifel/git-auto-commit-action`.
- Solo CI escribe `estante-react/`. Los builds locales van a `dist/` (ignorado por git), así que verificar que compila nunca ensucia el working tree ni pisa lo que deployó el bot.
- GitHub Pages sigue sirviendo todo el repo desde la raíz de `main` (configuración sin cambios) — `estante-react/` es simplemente una carpeta más que Pages sirve tal cual, igual que `estante/`.
- `vite.config.js` tiene `base: './'` (rutas relativas) para que funcione sin importar el subpath.

### Pendiente para reemplazar a la versión vieja
- Confirmar que el workflow de Actions corre bien y el sitio en `/estante-react/` funciona en producción real (no solo local).
- Una vez confirmado, decidir si se reemplaza `estante/` por esta versión o se dejan ambas conviviendo.
- Detalle menor: favicon sigue siendo el default de Vite (no el de la app vieja).

### Notas de la migración (por si sirven al retomar)
- Node se actualizó a v24 (LTS) vía `nvm` porque la versión vieja (v14) era incompatible con Vite.
- El `confirm()` nativo del botón "Eliminar" no se puede probar con el navegador de test de Claude Code (los diálogos nativos están deshabilitados ahí) — no es un bug, funciona bien en un navegador real.
