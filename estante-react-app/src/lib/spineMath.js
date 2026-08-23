function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

export function hashHeight(str) {
  return 178 + (hashStr(str) % 46);
}

export function spineWidth(item) {
  const base = 36 + (hashStr(item.title + '#w') % 20);
  const total = Number(item.total) || 0;
  const bonus = total > 0 ? Math.min(34, total / 14) : 0;
  return Math.round(Math.min(88, base + bonus));
}

export const CAT_LABEL = { libro: 'Libro', comic: 'Cómic', manga: 'Manga' };
export const CAT_UNIT = { libro: 'páginas', comic: 'números', manga: 'capítulos' };
export const STATUS_LABEL = { pendiente: 'Pendiente', leyendo: 'Leyendo', completado: 'Completado', abandonado: 'Abandonado' };
export const STATUS_ICON = { pendiente: '○', leyendo: '●', completado: '✓', abandonado: '×' };
export const STATUS_COLOR = { pendiente: '#6b6b60', leyendo: 'var(--brass)', completado: 'var(--ok)', abandonado: 'var(--danger)' };
