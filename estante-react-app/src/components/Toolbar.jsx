import styles from './Toolbar.module.css';

const STATUSES = [
  { value: 'todos', label: 'Todos' },
  { value: 'leyendo', label: 'Leyendo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' },
  { value: 'abandonado', label: 'Abandonado' },
];

export function Toolbar({ status, onStatusChange, sort, onSortChange, onAdd }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.chips}>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`${styles.chip} ${status === s.value ? styles.active : ''}`}
            onClick={() => onStatusChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="added-asc">Orden de agregado</option>
        <option value="recent">Añadido recientemente</option>
        <option value="title">Título (A-Z)</option>
        <option value="rating">Valoración</option>
      </select>
      <button className={styles.addBtn} onClick={onAdd}>+ Añadir</button>
    </div>
  );
}
