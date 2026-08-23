import { CAT_UNIT, STATUS_ICON, STATUS_COLOR, hashHeight, spineWidth } from '../lib/spineMath';

export function Spine({ item, onClick }) {
  const h = hashHeight(item.title);
  const w = spineWidth(item);
  const tip = item.title + (item.total ? ` · ${item.total} ${CAT_UNIT[item.category]}` : '');

  return (
    <div className="spine-slot">
      <div
        className={`spine ${item.category} ${item.status === 'abandonado' ? 'abandonado' : ''}`}
        style={{ height: h, width: w }}
        title={tip}
        onClick={onClick}
      >
        <span className="status-mark" style={{ background: STATUS_COLOR[item.status] }}>
          {STATUS_ICON[item.status]}
        </span>
        <div className="band" />
        <div className="title">{item.title}</div>
        <div className="band bottom" />
      </div>
    </div>
  );
}
