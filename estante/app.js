const STORAGE_KEY = 'mi-estante-biblioteca-v1';
const CAT_LABEL = { libro:'Libro', comic:'Cómic', manga:'Manga' };
const CAT_UNIT = { libro:'páginas', comic:'números', manga:'capítulos' };
const STATUS_LABEL = { pendiente:'Pendiente', leyendo:'Leyendo', completado:'Completado', abandonado:'Abandonado' };
const STATUS_ICON = { pendiente:'○', leyendo:'●', completado:'✓', abandonado:'×' };

let library = loadLibrary();
let state = { cat:'todos', status:'todos', sort:'added-asc' };

function loadLibrary(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ console.error('Error leyendo almacenamiento', e); return []; }
}
function saveLibrary(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(library)); }
  catch(e){ console.error('Error guardando', e); alert('No se pudo guardar. Revisa el almacenamiento del navegador.'); }
}
function uid(){ return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }

// ---------- Rendering ----------
function renderLedger(){
  const total = library.length;
  const leyendo = library.filter(i=>i.status==='leyendo').length;
  const completado = library.filter(i=>i.status==='completado').length;
  document.getElementById('ledger').innerHTML = `
    <div><b>${total}</b>total</div>
    <div><b>${leyendo}</b>leyendo</div>
    <div><b>${completado}</b>terminados</div>
  `;
}

function hashStr(str){
  let h=0; for(let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) % 100000;
  return h;
}
function hashHeight(str){
  return 178 + (hashStr(str) % 46); // 178-224, look at the title
}
function spineWidth(item){
  // base procedural variety from the title (so spines never look uniform even without page data)
  const base = 36 + (hashStr(item.title + '#w') % 20); // 36-55
  const total = Number(item.total) || 0;
  const bonus = total > 0 ? Math.min(34, total / 14) : 0; // thicker for longer works
  return Math.round(Math.min(88, base + bonus));
}

function renderShelf(){
  const shelf = document.getElementById('shelf');
  let items = state.cat === 'todos' ? library.slice() : library.filter(i => i.category === state.cat);
  if(state.status !== 'todos') items = items.filter(i => i.status === state.status);

  if(state.sort === 'title') items.sort((a,b)=> a.title.localeCompare(b.title));
  else if(state.sort === 'rating') items.sort((a,b)=> (b.rating||0)-(a.rating||0));
  else if(state.sort === 'added-asc') items.sort((a,b)=> a.dateAdded - b.dateAdded);
  else items.sort((a,b)=> b.dateAdded - a.dateAdded);

  if(items.length === 0){
    const label = state.cat === 'todos' ? 'título' : CAT_LABEL[state.cat].toLowerCase();
    shelf.innerHTML = `
      <div class="empty-shelf">
        <div class="display">Este estante está vacío</div>
        <div>Busca tu primer ${label} para empezar a llenarlo.</div>
        <button id="emptyAddBtn">+ Añadir ${label}</button>
      </div>`;
    document.getElementById('emptyAddBtn').addEventListener('click', ()=> openSearch(state.cat === 'todos' ? 'libro' : state.cat));
    return;
  }

  shelf.innerHTML = items.map(item => {
    const h = hashHeight(item.title);
    const w = spineWidth(item);
    const tip = escapeHtml(item.title) + (item.total ? ` · ${item.total} ${CAT_UNIT[item.category]}` : '');
    return `
      <div class="spine-slot">
        <div class="spine ${item.category} ${item.status==='abandonado'?'abandonado':''}" data-id="${item.id}"
             style="height:${h}px; width:${w}px;" title="${tip}">
          <span class="status-mark" style="background:${statusColor(item.status)}">${STATUS_ICON[item.status]}</span>
          <div class="band"></div>
          <div class="title">${escapeHtml(item.title)}</div>
          <div class="band bottom"></div>
        </div>
      </div>`;
  }).join('');

  shelf.querySelectorAll('.spine').forEach(el=>{
    el.addEventListener('click', ()=> openDetail(el.dataset.id));
  });
}
function statusColor(s){
  return { pendiente:'#6b6b60', leyendo:'var(--brass)', completado:'var(--ok)', abandonado:'var(--danger)' }[s];
}
function escapeHtml(str){
  const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML;
}

function renderAll(){ renderLedger(); renderShelf(); }

// ---------- Tabs & filters ----------
document.getElementById('tabs').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  state.cat = btn.dataset.cat;
  state.sort = state.cat === 'todos' ? 'added-asc' : 'recent';
  document.getElementById('sortSelect').value = state.sort;
  renderShelf();
});
document.getElementById('statusChips').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  document.querySelectorAll('#statusChips .chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  state.status = btn.dataset.status;
  renderShelf();
});
document.getElementById('sortSelect').addEventListener('change', e=>{
  state.sort = e.target.value; renderShelf();
});

// ---------- Search modal ----------
let searchCat = 'libro';
function openSearch(cat){
  searchCat = cat || state.cat;
  document.querySelectorAll('#catPicker button').forEach(b=>{
    b.classList.toggle('active', b.dataset.cat === searchCat);
  });
  document.getElementById('results').innerHTML = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchOverlay').style.display = 'flex';
  document.getElementById('searchInput').focus();
}
document.getElementById('openAdd').addEventListener('click', ()=> openSearch(state.cat === 'todos' ? 'libro' : state.cat));
document.getElementById('closeSearch').addEventListener('click', ()=>{
  document.getElementById('searchOverlay').style.display = 'none';
});
document.getElementById('catPicker').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  searchCat = btn.dataset.cat;
  document.querySelectorAll('#catPicker button').forEach(b=>b.classList.toggle('active', b===btn));
});
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });

async function doSearch(){
  const q = document.getElementById('searchInput').value.trim();
  const results = document.getElementById('results');
  if(!q){ return; }
  results.innerHTML = `<div class="hint">Buscando…</div>`;
  try{
    const items = searchCat === 'manga' ? await searchManga(q) : await searchGoogleBooks(q);
    if(items.length === 0){
      results.innerHTML = `<div class="hint">Sin resultados. Prueba otra búsqueda o añade manualmente.</div>`;
      return;
    }
    results.innerHTML = items.map((it, idx)=>`
      <div class="result-item">
        <img src="${it.cover || ''}" onerror="this.style.visibility='hidden'">
        <div class="r-info">
          <div class="r-title">${escapeHtml(it.title)}</div>
          <div class="r-meta">${escapeHtml(it.authors)} ${it.year ? '· '+it.year : ''}</div>
        </div>
        <button data-idx="${idx}">Añadir</button>
      </div>`).join('');
    results.querySelectorAll('button[data-idx]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        addFromResult(items[Number(btn.dataset.idx)], btn);
      });
    });
  }catch(err){
    console.error(err);
    results.innerHTML = `<div class="hint">No se pudo buscar (¿sin conexión?). Prueba de nuevo o añade manualmente.</div>`;
  }
}

async function searchGoogleBooks(q){
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`);
  if(!res.ok) throw new Error('Open Library respondió con estado ' + res.status);
  const data = await res.json();
  return (data.docs || []).map(d=>{
    let desc = '';
    if(d.first_sentence){
      desc = Array.isArray(d.first_sentence) ? d.first_sentence[0] : d.first_sentence;
    }
    return {
      title: d.title || 'Sin título',
      authors: (d.author_name || []).join(', ') || 'Autor desconocido',
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : '',
      description: desc,
      year: d.first_publish_year ? String(d.first_publish_year) : '',
      total: d.number_of_pages_median || 0,
      workKey: d.key || ''
    };
  });
}

async function fetchOpenLibraryPages(workKey){
  if(!workKey) return 0;
  try{
    const res = await fetch(`https://openlibrary.org${workKey}/editions.json?limit=10`);
    if(!res.ok) return 0;
    const data = await res.json();
    const editions = data.entries || [];
    for(const ed of editions){
      if(ed.number_of_pages) return ed.number_of_pages;
    }
  }catch(e){ console.warn('No se pudo obtener el número de páginas', e); }
  return 0;
}

async function searchManga(q){
  const query = `
    query ($search: String) {
      Page(perPage: 8) {
        media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
          title { romaji english }
          coverImage { large }
          description
          chapters
          startDate { year }
          staff(perPage: 4) { edges { role node { name { full } } } }
        }
      }
    }`;
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables: { search: q } })
  });
  if(!res.ok) throw new Error('AniList respondió con estado ' + res.status);
  const data = await res.json();
  const list = (data.data && data.data.Page && data.data.Page.media) || [];
  return list.map(m=>{
    const authors = (m.staff && m.staff.edges ? m.staff.edges : [])
      .filter(e => /story|art/i.test(e.role || ''))
      .map(e => e.node.name.full)
      .filter((v,i,a)=> a.indexOf(v)===i)
      .join(', ');
    return {
      title: (m.title && (m.title.english || m.title.romaji)) || 'Sin título',
      authors: authors || 'Autor desconocido',
      cover: m.coverImage ? m.coverImage.large : '',
      description: (m.description || '').replace(/<[^>]+>/g, ''),
      year: m.startDate && m.startDate.year ? String(m.startDate.year) : '',
      total: m.chapters || 0
    };
  });
}

async function addFromResult(it, btn){
  let total = it.total || 0;
  if(!total && it.workKey && (searchCat === 'libro' || searchCat === 'comic')){
    if(btn){ btn.textContent = 'Buscando páginas…'; btn.disabled = true; }
    total = await fetchOpenLibraryPages(it.workKey);
  }
  const item = {
    id: uid(),
    category: searchCat,
    title: it.title,
    authors: it.authors,
    cover: it.cover,
    description: it.description,
    year: it.year,
    total: total || 0,
    current: 0,
    status: 'pendiente',
    rating: 0,
    notes: '',
    dateAdded: Date.now(),
    dateFinished: null
  };
  library.push(item);
  saveLibrary();
  document.getElementById('searchOverlay').style.display = 'none';
  renderAll();
}

// ---------- Manual add ----------
document.getElementById('manualBtn').addEventListener('click', ()=>{
  document.getElementById('searchOverlay').style.display = 'none';
  openManualForm();
});

function openManualForm(){
  document.getElementById('detailModalTitle').textContent = 'Añadir manualmente';
  document.getElementById('detailBody').innerHTML = `
    <div class="form-grid">
      <div class="cat-picker" id="manualCatPicker">
        <button data-cat="libro" class="active libro">Libro</button>
        <button data-cat="comic" class="comic">Cómic</button>
        <button data-cat="manga" class="manga">Manga</button>
      </div>
      <div class="field"><label>Título</label><input id="mTitle" type="text"></div>
      <div class="field"><label>Autor(es)</label><input id="mAuthors" type="text"></div>
      <div class="field"><label>URL de portada (opcional)</label><input id="mCover" type="text" placeholder="https://..."></div>
      <div class="field"><label>Año</label><input id="mYear" type="text"></div>
      <div class="form-actions">
        <span></span>
        <button class="save-btn" id="mSave">Añadir a mi biblioteca</button>
      </div>
    </div>`;
  let mCat = 'libro';
  document.getElementById('manualCatPicker').addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    mCat = btn.dataset.cat;
    document.querySelectorAll('#manualCatPicker button').forEach(b=>b.classList.toggle('active', b===btn));
  });
  document.getElementById('mSave').addEventListener('click', ()=>{
    const title = document.getElementById('mTitle').value.trim();
    if(!title){ alert('El título es obligatorio.'); return; }
    const item = {
      id: uid(), category: mCat, title,
      authors: document.getElementById('mAuthors').value.trim() || 'Autor desconocido',
      cover: document.getElementById('mCover').value.trim(),
      description: '', year: document.getElementById('mYear').value.trim(),
      total: 0,
      current: 0, status: 'pendiente', rating: 0, notes: '',
      dateAdded: Date.now(), dateFinished: null
    };
    library.push(item); saveLibrary();
    document.getElementById('detailOverlay').style.display = 'none';
    renderAll();
  });
  document.getElementById('detailOverlay').style.display = 'flex';
}

// ---------- Detail / edit modal ----------
function openDetail(id){
  const item = library.find(i=>i.id===id);
  if(!item) return;
  document.getElementById('detailModalTitle').textContent = CAT_LABEL[item.category];
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-top">
      <img class="detail-cover" src="${item.cover||''}" onerror="this.style.visibility='hidden'">
      <div class="dt-meta">
        <h3>${escapeHtml(item.title)}</h3>
        <div class="authors">${escapeHtml(item.authors)} ${item.year? '· '+escapeHtml(item.year):''}</div>
        <div class="desc">${escapeHtml((item.description||'').slice(0,300)) || 'Sin descripción.'}</div>
      </div>
    </div>
    <div class="form-grid">
      <div class="field">
        <label>Estado</label>
        <select id="dStatus">
          ${Object.keys(STATUS_LABEL).map(s=>`<option value="${s}" ${s===item.status?'selected':''}>${STATUS_LABEL[s]}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Valoración</label>
        <div class="stars" id="dStars">
          ${[1,2,3,4,5].map(n=>`<span data-n="${n}" class="${n<=(item.rating||0)?'on':''}">★</span>`).join('')}
        </div>
      </div>
      <div class="field"><label>Notas</label><textarea id="dNotes" rows="3">${escapeHtml(item.notes||'')}</textarea></div>
      <div class="form-actions">
        <button class="delete-btn" id="dDelete">Eliminar</button>
        <button class="save-btn" id="dSave">Guardar cambios</button>
      </div>
    </div>`;

  let rating = item.rating || 0;
  document.getElementById('dStars').addEventListener('click', e=>{
    const s = e.target.closest('span'); if(!s) return;
    rating = Number(s.dataset.n);
    document.querySelectorAll('#dStars span').forEach(sp=> sp.classList.toggle('on', Number(sp.dataset.n)<=rating));
  });
  document.getElementById('dSave').addEventListener('click', ()=>{
    item.status = document.getElementById('dStatus').value;
    item.rating = rating;
    item.notes = document.getElementById('dNotes').value;
    if(item.status === 'completado' && !item.dateFinished) item.dateFinished = Date.now();
    saveLibrary();
    document.getElementById('detailOverlay').style.display = 'none';
    renderAll();
  });
  document.getElementById('dDelete').addEventListener('click', ()=>{
    if(!confirm('¿Eliminar este título de tu biblioteca?')) return;
    library = library.filter(i=>i.id!==id);
    saveLibrary();
    document.getElementById('detailOverlay').style.display = 'none';
    renderAll();
  });
  document.getElementById('detailOverlay').style.display = 'flex';
}
document.getElementById('closeDetail').addEventListener('click', ()=>{
  document.getElementById('detailOverlay').style.display = 'none';
});
document.getElementById('searchOverlay').addEventListener('click', e=>{
  if(e.target.id === 'searchOverlay') e.target.style.display = 'none';
});
document.getElementById('detailOverlay').addEventListener('click', e=>{
  if(e.target.id === 'detailOverlay') e.target.style.display = 'none';
});

renderAll();
