import { useState } from 'react';
import { Modal, modalStyles as s } from './Modal';
import styles from './DetailModal.module.css';
import { CAT_LABEL, STATUS_LABEL } from '../lib/spineMath';

export function DetailModal({ item, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.notes || '');

  async function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) { alert('El título no puede quedar vacío.'); return; }
    const updated = { ...item, title: cleanTitle, status, notes };
    if (status === 'completado' && !item.dateFinished) updated.dateFinished = Date.now();
    const { error } = await onSave(updated);
    if (error) { alert('No se pudieron guardar los cambios.'); return; }
    onClose();
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este título de tu biblioteca?')) return;
    const { error } = await onDelete(item.id);
    if (error) { alert('No se pudo eliminar.'); return; }
    onClose();
  }

  return (
    <Modal title={CAT_LABEL[item.category]} onClose={onClose}>
      <div className={styles.top}>
        <img className={styles.cover} src={item.cover || ''} onError={(e) => { e.target.style.visibility = 'hidden'; }} />
        <div className={styles.meta}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Título"
          />
          <div className={styles.authors}>{item.authors} {item.year ? '· ' + item.year : ''}</div>
          <div className={styles.desc}>{(item.description || '').slice(0, 300) || 'Sin descripción.'}</div>
        </div>
      </div>
      <div className={s.formGrid}>
        <div className={s.field}>
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.keys(STATUS_LABEL).map((st) => (
              <option key={st} value={st}>{STATUS_LABEL[st]}</option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label>Notas</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className={s.actions}>
          <button className={s.deleteBtn} onClick={handleDelete}>Eliminar</button>
          <button className={s.saveBtn} onClick={handleSave}>Guardar cambios</button>
        </div>
      </div>
    </Modal>
  );
}
