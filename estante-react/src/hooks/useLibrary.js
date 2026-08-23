import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function rowToItem(row) {
  return {
    id: row.id, category: row.category, title: row.title, authors: row.authors,
    cover: row.cover, description: row.description, year: row.year,
    total: row.total, current: row.current, status: row.status, rating: row.rating,
    notes: row.notes, dateAdded: row.date_added, dateFinished: row.date_finished
  };
}
function itemToRow(item) {
  return {
    category: item.category, title: item.title, authors: item.authors,
    cover: item.cover, description: item.description, year: item.year,
    total: item.total, current: item.current, status: item.status, rating: item.rating,
    notes: item.notes, date_added: item.dateAdded, date_finished: item.dateFinished
  };
}

export function useLibrary(session) {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('items').select('*').order('date_added', { ascending: true });
    if (error) { console.error('Error cargando biblioteca', error); setLibrary([]); }
    else setLibrary(data.map(rowToItem));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) refresh();
    else setLibrary([]);
  }, [session, refresh]);

  async function addItem(item) {
    const { data, error } = await supabase.from('items').insert(itemToRow(item)).select().single();
    if (error) return { error };
    setLibrary((lib) => [...lib, rowToItem(data)]);
    return { error: null };
  }

  async function updateItem(item) {
    const { error } = await supabase.from('items').update(itemToRow(item)).eq('id', item.id);
    if (!error) setLibrary((lib) => lib.map((i) => (i.id === item.id ? item : i)));
    return { error };
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) setLibrary((lib) => lib.filter((i) => i.id !== id));
    return { error };
  }

  return { library, loading, addItem, updateItem, deleteItem };
}
