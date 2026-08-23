export async function searchOpenLibrary(q) {
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`);
  if (!res.ok) throw new Error('Open Library respondió con estado ' + res.status);
  const data = await res.json();
  return (data.docs || []).map((d) => {
    let desc = '';
    if (d.first_sentence) desc = Array.isArray(d.first_sentence) ? d.first_sentence[0] : d.first_sentence;
    return {
      title: d.title || 'Sin título',
      authors: (d.author_name || []).join(', ') || 'Autor desconocido',
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : '',
      description: desc,
      year: d.first_publish_year ? String(d.first_publish_year) : '',
      total: d.number_of_pages_median || 0,
      workKey: d.key || '',
    };
  });
}

export async function fetchOpenLibraryPages(workKey) {
  if (!workKey) return 0;
  try {
    const res = await fetch(`https://openlibrary.org${workKey}/editions.json?limit=10`);
    if (!res.ok) return 0;
    const data = await res.json();
    for (const ed of data.entries || []) {
      if (ed.number_of_pages) return ed.number_of_pages;
    }
  } catch (e) { console.warn('No se pudo obtener el número de páginas', e); }
  return 0;
}

export async function searchManga(q) {
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
    body: JSON.stringify({ query, variables: { search: q } }),
  });
  if (!res.ok) throw new Error('AniList respondió con estado ' + res.status);
  const data = await res.json();
  const list = (data.data && data.data.Page && data.data.Page.media) || [];
  return list.map((m) => {
    const authors = (m.staff && m.staff.edges ? m.staff.edges : [])
      .filter((e) => /story|art/i.test(e.role || ''))
      .map((e) => e.node.name.full)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');
    return {
      title: (m.title && (m.title.english || m.title.romaji)) || 'Sin título',
      authors: authors || 'Autor desconocido',
      cover: m.coverImage ? m.coverImage.large : '',
      description: (m.description || '').replace(/<[^>]+>/g, ''),
      year: m.startDate && m.startDate.year ? String(m.startDate.year) : '',
      total: m.chapters || 0,
    };
  });
}
