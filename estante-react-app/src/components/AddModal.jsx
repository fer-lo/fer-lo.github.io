import { useState } from 'react';
import { Modal, modalStyles as s } from './Modal';
import styles from './AddModal.module.css';
import { searchOpenLibrary, fetchOpenLibraryPages, searchManga } from '../lib/bookSearch';

const CATS = [
  { value: 'libro', label: 'Libro', cls: 'catLibro' },
  { value: 'comic', label: 'Cómic', cls: 'catComic' },
  { value: 'manga', label: 'Manga', cls: 'catManga' },
];

function CatPicker({ cat, onChange }) {
  return (
    <div className={s.catPicker}>
      {CATS.map((c) => (
        <button
          key={c.value}
          className={`${s[c.cls]} ${cat === c.value ? s.active : ''}`}
          onClick={() => onChange(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function AddModal({ initialCat, onClose, onAdd }) {
  const [view, setView] = useState('search');
  const [cat, setCat] = useState(initialCat || 'libro');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hint, setHint] = useState('');
  const [addingIdx, setAddingIdx] = useState(null);

  async function doSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setHint('Buscando…');
    setResults([]);
    try {
      const items = cat === 'manga' ? await searchManga(query) : await searchOpenLibrary(query);
      if (items.length === 0) { setHint('Sin resultados. Prueba otra búsqueda o añade manualmente.'); return; }
      setHint('');
      setResults(items);
    } catch (err) {
      console.error(err);
      setHint('No se pudo buscar (¿sin conexión?). Prueba de nuevo o añade manualmente.');
    }
  }

  async function pickResult(it, idx) {
    setAddingIdx(idx);
    let total = it.total || 0;
    if (!total && it.workKey && cat !== 'manga') {
      total = await fetchOpenLibraryPages(it.workKey);
    }
    const { error } = await onAdd({
      category: cat, title: it.title, authors: it.authors, cover: it.cover,
      description: it.description, year: it.year, total: total || 0,
      current: 0, status: 'pendiente', rating: 0, notes: '',
      dateAdded: Date.now(), dateFinished: null,
    });
    setAddingIdx(null);
    if (error) { alert('No se pudo guardar. Intenta de nuevo.'); return; }
    onClose();
  }

  return (
    <Modal title={view === 'search' ? 'Añadir a tu biblioteca' : 'Añadir manualmente'} onClose={onClose}>
      <CatPicker cat={cat} onChange={setCat} />

      {view === 'search' ? (
        <>
          <form className={styles.searchRow} onSubmit={doSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Título, autor..."
              autoFocus
            />
            <button type="submit">Buscar</button>
          </form>
          <div className={styles.results}>
            {hint && <div className={styles.hint}>{hint}</div>}
            {results.map((it, idx) => (
              <div className={styles.resultItem} key={idx}>
                <img src={it.cover || ''} onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                <div className={styles.info}>
                  <div className={styles.title}>{it.title}</div>
                  <div className={styles.metaLine}>{it.authors} {it.year ? '· ' + it.year : ''}</div>
                </div>
                <button className={styles.addBtn} onClick={() => pickResult(it, idx)} disabled={addingIdx !== null}>
                  {addingIdx === idx ? 'Buscando páginas…' : 'Añadir'}
                </button>
              </div>
            ))}
          </div>
          <div className={styles.manualLink}>
            <button className={s.linkBtn} onClick={() => setView('manual')}>
              ¿No lo encuentras? Añadir manualmente
            </button>
          </div>
        </>
      ) : (
        <ManualAddForm cat={cat} onAdd={onAdd} onClose={onClose} />
      )}
    </Modal>
  );
}

function ManualAddForm({ cat, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [cover, setCover] = useState('');
  const [year, setYear] = useState('');

  async function save() {
    if (!title.trim()) { alert('El título es obligatorio.'); return; }
    const { error } = await onAdd({
      category: cat, title: title.trim(),
      authors: authors.trim() || 'Autor desconocido',
      cover: cover.trim(), description: '', year: year.trim(),
      total: 0, current: 0, status: 'pendiente', rating: 0, notes: '',
      dateAdded: Date.now(), dateFinished: null,
    });
    if (error) { alert('No se pudo guardar. Intenta de nuevo.'); return; }
    onClose();
  }

  return (
    <div className={s.formGrid}>
      <div className={s.field}><label>Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className={s.field}><label>Autor(es)</label><input value={authors} onChange={(e) => setAuthors(e.target.value)} /></div>
      <div className={s.field}><label>URL de portada (opcional)</label><input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://..." /></div>
      <div className={s.field}><label>Año</label><input value={year} onChange={(e) => setYear(e.target.value)} /></div>
      <div className={s.actions}>
        <span />
        <button className={s.saveBtn} onClick={save}>Añadir a mi biblioteca</button>
      </div>
    </div>
  );
}
