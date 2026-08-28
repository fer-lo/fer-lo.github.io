import styles from './Shelf.module.css';
import { CAT_UNIT, STATUS_ICON, STATUS_COLOR, hashHeight, spineWidth } from '../lib/spineMath';

export function Spine({ item, onClick }) {
  const h = hashHeight(item.title);
  const w = spineWidth(item);
  const tip = item.title + (item.total ? ` · ${item.total} ${CAT_UNIT[item.category]}` : '');

  return (
    <div className={styles.slot}>
      <div
        className={`${styles.spine} ${styles[item.category]} ${item.status === 'abandonado' ? styles.abandonado : ''}`}
        style={{ height: h, width: w }}
        title={tip}
        onClick={onClick}
      >
        <span className={styles.statusMark} style={{ background: STATUS_COLOR[item.status] }}>
          {STATUS_ICON[item.status]}
        </span>
        <div className={styles.band} />
        <div className={styles.title}>{item.title}</div>
        <div className={`${styles.band} ${styles.bandBottom}`} />
      </div>
    </div>
  );
}
