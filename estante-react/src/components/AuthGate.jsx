import { useState } from 'react';

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
    <div className="overlay" style={{ display: 'flex' }}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <h2>Mi Estante</h2>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '0 0 16px' }}>
            Iniciá sesión para acceder a tu biblioteca.
          </p>
          <form className="form-grid" onSubmit={handleSignIn}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
              />
            </div>
            <div className="field">
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
            <div className="form-actions">
              <button
                type="button"
                onClick={handleSignUp}
                style={{ color: 'var(--muted)', fontSize: 12.5, textDecoration: 'underline' }}
              >
                Crear cuenta
              </button>
              <button type="submit" className="save-btn">Entrar</button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12.5, textAlign: 'center' }}>
              {message}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
