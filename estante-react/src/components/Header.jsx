export function Header({ email, onLogout, library }) {
  const total = library.length;
  const leyendo = library.filter((i) => i.status === 'leyendo').length;
  const completado = library.filter((i) => i.status === 'completado').length;

  return (
    <header>
      <div className="brand">
        <h1>Mi Estante</h1>
        <span className="tag">registro de lectura</span>
      </div>
      <div className="account">
        <span>{email}</span>
        <button onClick={onLogout}>Salir</button>
      </div>
      <div className="ledger">
        <div><b>{total}</b>total</div>
        <div><b>{leyendo}</b>leyendo</div>
        <div><b>{completado}</b>terminados</div>
      </div>
    </header>
  );
}
