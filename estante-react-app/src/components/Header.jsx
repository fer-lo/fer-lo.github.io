import styles from './Header.module.css';

export function Header({ email, onLogout, library }) {
  const total = library.length;
  const leyendo = library.filter((i) => i.status === 'leyendo').length;
  const completado = library.filter((i) => i.status === 'completado').length;

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1>Mi Estante</h1>
        <span className={styles.tag}>registro de lectura</span>
      </div>
      <div className={styles.account}>
        <span>{email}</span>
        <button onClick={onLogout}>Salir</button>
      </div>
      <div className={styles.ledger}>
        <div><b>{total}</b>total</div>
        <div><b>{leyendo}</b>leyendo</div>
        <div><b>{completado}</b>terminados</div>
      </div>
    </header>
  );
}
