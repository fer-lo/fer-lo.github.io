import styles from './Tabs.module.css';

const CATS = [
  { value: 'todos', label: 'Todo', color: 'var(--brass)' },
  { value: 'libro', label: 'Libros', color: 'var(--libro)' },
  { value: 'comic', label: 'Cómics', color: 'var(--comic)' },
  { value: 'manga', label: 'Manga', color: 'var(--manga)' },
];

export function Tabs({ cat, onChange }) {
  return (
    <nav className={styles.tabs}>
      {CATS.map((c) => (
        <button
          key={c.value}
          className={cat === c.value ? styles.active : ''}
          onClick={() => onChange(c.value)}
        >
          <span className={styles.dot} style={{ background: c.color }} />
          {c.label}
        </button>
      ))}
    </nav>
  );
}
