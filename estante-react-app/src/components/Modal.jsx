import { useEffect } from 'react';
import styles from './Modal.module.css';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    if (!onClose) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      <div className={styles.modal}>
        <div className={styles.head}>
          <h2>{title}</h2>
          {onClose && <button className={styles.closeBtn} onClick={onClose}>✕</button>}
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export { styles as modalStyles };
