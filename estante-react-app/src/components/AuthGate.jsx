import { useState } from 'react';
import { Modal, modalStyles as s } from './Modal';

export function AuthGate({ session, loading, signIn, signUp, children }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  if (loading) return <p>Cargando…</p>;
  if (session) return children;

  async function handleSignIn(e) {
    e.preventDefault();
    setMessage('Entrando…');
    const { error } = await signIn(email, password);
    setMessage(error ? 'Error: ' + error.message : '');
  }

  async function handleSignUp() {
    if (!email || !password) {
      setMessage('Completá email y contraseña.');
      return;
    }
    setMessage('Creando cuenta…');
    const { error } = await signUp(email, password);
    setMessage(error ? 'Error: ' + error.message : 'Cuenta creada.');
  }

  return (
    <Modal title="Mi Estante">
      <p className={s.note} style={{ margin: '0 0 16px' }}>
        Iniciá sesión para acceder a tu biblioteca.
      </p>
      <form className={s.formGrid} onSubmit={handleSignIn}>
        <div className={s.field}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
          />
        </div>
        <div className={s.field}>
          <label>Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className={s.actions}>
          <button type="button" className={s.linkBtn} onClick={handleSignUp}>
            Crear cuenta
          </button>
          <button type="submit" className={s.saveBtn}>Entrar</button>
        </div>
        <div className={s.note} style={{ textAlign: 'center' }}>{message}</div>
      </form>
    </Modal>
  );
}
