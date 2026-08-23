const CATS = [
  { value: 'todos', label: 'Todo', color: 'var(--brass)' },
  { value: 'libro', label: 'Libros', color: 'var(--libro)' },
  { value: 'comic', label: 'Cómics', color: 'var(--comic)' },
  { value: 'manga', label: 'Manga', color: 'var(--manga)' },
];

export function Tabs({ cat, onChange }) {
  return (
    <nav className="tabs">
      {CATS.map((c) => (
        <button
          key={c.value}
          className={cat === c.value ? 'active' : ''}
          onClick={() => onChange(c.value)}
        >
          <span className="dot" style={{ background: c.color }} />
          {c.label}
        </button>
      ))}
    </nav>
  );
}
