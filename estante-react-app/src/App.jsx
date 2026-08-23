import { useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { useAuth } from './hooks/useAuth';
import { useLibrary } from './hooks/useLibrary';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { Toolbar } from './components/Toolbar';
import { Shelf } from './components/Shelf';
import { AddModal } from './components/AddModal';
import { DetailModal } from './components/DetailModal';

function EstanteApp({ session, signOut }) {
  const { library, addItem, updateItem, deleteItem } = useLibrary(session);
  const [cat, setCat] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [sort, setSort] = useState('added-asc');
  const [addModalCat, setAddModalCat] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  function handleCatChange(newCat) {
    setCat(newCat);
    setSort(newCat === 'todos' ? 'added-asc' : 'recent');
  }

  const selectedItem = library.find((i) => i.id === selectedId) || null;

  return (
    <>
      <Header email={session.user.email} onLogout={signOut} library={library} />
      <Tabs cat={cat} onChange={handleCatChange} />
      <Toolbar
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        onAdd={() => setAddModalCat(cat === 'todos' ? 'libro' : cat)}
      />
      <Shelf
        library={library}
        cat={cat}
        status={status}
        sort={sort}
        onSpineClick={setSelectedId}
        onEmptyAdd={() => setAddModalCat(cat === 'todos' ? 'libro' : cat)}
      />

      {addModalCat && (
        <AddModal
          initialCat={addModalCat}
          onClose={() => setAddModalCat(null)}
          onAdd={addItem}
        />
      )}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onSave={updateItem}
          onDelete={deleteItem}
        />
      )}
    </>
  );
}

function App() {
  const auth = useAuth();
  return (
    <AuthGate {...auth}>
      <EstanteApp session={auth.session} signOut={auth.signOut} />
    </AuthGate>
  );
}

export default App;
