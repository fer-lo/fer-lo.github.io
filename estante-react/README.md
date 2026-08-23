# Mi Estante — versión React

Migración de `estante/` (HTML/CSS/JS vanilla) a React + Vite, hecha como ejercicio de aprendizaje ("armar un proyecto React de cero"). **No reemplaza todavía a `estante/`, que sigue siendo la versión en producción en GitHub Pages.**

## Cómo correrla

```bash
npm install
npm run dev
```

Necesita un `.env` con las credenciales de Supabase (no se commitea — ver `.env.example` como plantilla):

```
VITE_SUPABASE_URL=https://asevcnpqptmncjewekry.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Estado (2026-08-23)

Migración funcional **completa y probada end-to-end**: login (email+contraseña contra Supabase), listar/filtrar/ordenar libros, buscar en Open Library/AniList y agregar (por búsqueda o manual), editar estado/rating/notas, eliminar. Usa las mismas tablas y el mismo proyecto de Supabase que `estante/` (comparten datos).

### Estructura
- `src/lib/supabaseClient.js` — cliente de Supabase (usa `import.meta.env`, no hardcodeado).
- `src/hooks/useAuth.js` — sesión, login, signup, logout.
- `src/hooks/useLibrary.js` — estado de la biblioteca + CRUD contra la tabla `items`.
- `src/lib/bookSearch.js` — búsquedas a Open Library / AniList (sin cambios de lógica respecto a la versión vieja).
- `src/lib/spineMath.js` — cálculo de alto/ancho de lomos + labels de categorías/estados.
- `src/components/` — `AuthGate`, `Header`, `Tabs`, `Toolbar`, `Shelf` + `Spine`, `AddModal` (búsqueda + alta manual), `DetailModal` (editar/eliminar).

### Pendiente para reemplazar a la versión vieja
1. Correr `npm run build` y confirmar que compila sin errores (nunca se probó el build de producción, solo `npm run dev`).
2. Decidir estrategia de deploy a GitHub Pages: build manual + commit de `dist/`, vs. GitHub Actions que compile automáticamente en cada push (esto se dejó sin decidir, quedó pendiente de conversación).
3. Una vez confirmado que la versión React funciona igual en producción, decidir si se reemplaza `estante/` por esta o se dejan ambas un tiempo.
4. Detalles menores: favicon sigue siendo el default de Vite (no el de la app vieja).

### Notas de la migración (por si sirven al retomar)
- Node se actualizó a v24 (LTS) vía `nvm` porque la versión vieja (v14) era incompatible con Vite.
- El `confirm()` nativo del botón "Eliminar" no se puede probar con el navegador de test de Claude Code (los diálogos nativos están deshabilitados ahí) — no es un bug, funciona bien en un navegador real.
