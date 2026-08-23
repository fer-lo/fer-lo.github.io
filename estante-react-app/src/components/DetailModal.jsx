import { useState } from 'react';
import { CAT_LABEL, STATUS_LABEL } from '../lib/spineMath';

export function DetailModal({ item, onClose, onSave, onDelete }) {
  const [status, setStatus] = useState(item.status);
  const [rating, setRating] = useState(item.rating || 0);
  const [notes, setNotes] = useState(item.notes || '');

  async function handleSave() {
    const updated = { ...item, status, rating, notes };
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
    <div className="overlay">
      <div className="modal">
        <div className="modal-head">
          <h2>{CAT_LABEL[item.category]}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-top">
            <img className="detail-cover" src={item.cover || ''} onError={(e) => { e.target.style.visibility = 'hidden'; }} />
            <div className="dt-meta">
              <h3>{item.title}</h3>
              <div className="authors">{item.authors} {item.year ? '· ' + item.year : ''}</div>
              <div className="desc">{(item.description || '').slice(0, 300) || 'Sin descripción.'}</div>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.keys(STATUS_LABEL).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Valoración</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>★</span>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Notas</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="delete-btn" onClick={handleDelete}>Eliminar</button>
              <button className="save-btn" onClick={handleSave}>Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
