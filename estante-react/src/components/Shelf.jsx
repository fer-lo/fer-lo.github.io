import { Spine } from './Spine';
import { CAT_LABEL } from '../lib/spineMath';

export function Shelf({ library, cat, status, sort, onSpineClick, onEmptyAdd }) {
  let items = cat === 'todos' ? library.slice() : library.filter((i) => i.category === cat);
  if (status !== 'todos') items = items.filter((i) => i.status === status);

  if (sort === 'title') items.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'rating') items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  else if (sort === 'added-asc') items.sort((a, b) => a.dateAdded - b.dateAdded);
  else items.sort((a, b) => b.dateAdded - a.dateAdded);

  if (items.length === 0) {
    const label = cat === 'todos' ? 'título' : CAT_LABEL[cat].toLowerCase();
    return (
      <div className="shelf-wrap">
        <div className="shelf">
          <div className="empty-shelf">
            <div className="display">Este estante está vacío</div>
            <div>Busca tu primer {label} para empezar a llenarlo.</div>
            <button onClick={onEmptyAdd}>+ Añadir {label}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shelf-wrap">
      <div className="shelf">
        {items.map((item) => (
          <Spine key={item.id} item={item} onClick={() => onSpineClick(item.id)} />
        ))}
      </div>
    </div>
  );
}
