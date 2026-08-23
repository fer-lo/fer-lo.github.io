const STATUSES = [
  { value: 'todos', label: 'Todos' },
  { value: 'leyendo', label: 'Leyendo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' },
  { value: 'abandonado', label: 'Abandonado' },
];

export function Toolbar({ status, onStatusChange, sort, onSortChange, onAdd }) {
  return (
    <div className="toolbar">
      <div className="chips">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={'chip' + (status === s.value ? ' active' : '')}
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
      <button className="add-btn" onClick={onAdd}>+ Añadir</button>
    </div>
  );
}
