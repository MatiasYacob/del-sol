// #==========# IMPORTACIONES #==========#
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { HomePage } from '../pages/HomePage';

interface Session {
  user: { id: string; name: string; username: string; roles: string[]; locales: { id: string; nombre: string }[] };
  csrfToken: string;
  createdAt: number;
  lastActivityAt: number;
}

const IDLE_MS = 5 * 60 * 60 * 1000;
const ABSOLUTE_MS = 6 * 60 * 60 * 1000;

// #==========# LOGIN Y RESTAURACIÓN DE SESIÓN #==========#
export function AuthApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lastActivity = useRef(0);
  const lastSent = useRef(0);

  const accept = useCallback((value: Session) => {
    lastActivity.current = value.lastActivityAt;
    lastSent.current = value.lastActivityAt;
    setSession(value);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/me', { signal: controller.signal, credentials: 'include' })
      .then(async response => {
        if (response.ok) accept(await response.json());
        else if (response.status !== 401) setError('No pudimos consultar tu sesión. Intentá nuevamente.');
      })
      .catch(() => { if (!controller.signal.aborted) setError('No se pudo conectar con el servidor.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [accept]);

  // #==========# ACTIVIDAD Y VENCIMIENTO #==========#
  useEffect(() => {
    if (!session) return;
    let pending = false;
    const controller = new AbortController();
    const expired = () => Date.now() >= Math.min(session.createdAt + ABSOLUTE_MS, lastActivity.current + IDLE_MS);
    const expire = () => { setSession(null); setError('Tu sesión venció. Volvé a iniciar sesión.'); };
    // Sincroniza otras pestañas y detecta revocaciones sin renovar actividad.
    const check = () => {
      fetch('/api/auth/me', { credentials: 'include', signal: controller.signal })
        .then(async response => {
          if (response.status === 401) { expire(); return; }
          if (response.ok) {
            const current: Session = await response.json();
            lastActivity.current = current.lastActivityAt;
          } else if (expired()) expire();
        }).catch(() => { if (!controller.signal.aborted && expired()) expire(); });
    };
    const activity = (event: Event) => {
      if (!event.isTrusted || document.visibilityState !== 'visible') return;
      if (expired()) { check(); return; }
      if (pending || Date.now() - lastSent.current < 60000) return;
      pending = true;
      fetch('/api/auth/activity', {
        method: 'POST', credentials: 'include', signal: controller.signal,
        headers: { 'X-CSRF-Token': session.csrfToken },
      }).then(response => {
        if (response.ok) { lastActivity.current = Date.now(); lastSent.current = lastActivity.current; }
        else if (response.status === 401) expire();
      }).catch(() => {}).finally(() => { pending = false; });
    };
    window.addEventListener('pointerdown', activity);
    window.addEventListener('keydown', activity);
    window.addEventListener('scroll', activity, true);
    window.addEventListener('focus', check);
    const timer = window.setInterval(check, 30000);
    return () => {
      controller.abort();
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('keydown', activity);
      window.removeEventListener('scroll', activity, true);
      window.removeEventListener('focus', check);
      window.clearInterval(timer);
    };
  }, [session]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
      });
      if (!response.ok) {
        setError(response.status === 401 ? 'Usuario o contraseña incorrectos.' : response.status === 429 ? 'Demasiados intentos. Esperá un minuto antes de volver a intentar.' : 'No se pudo iniciar sesión. Revisá que el servidor esté disponible.');
        return;
      }
      accept(await response.json());
    } catch { setError('No se pudo conectar con el servidor.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (!session) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': session.csrfToken } });
      if (response.ok || response.status === 401) setSession(null);
      else setError('No se pudo cerrar la sesión. Intentá nuevamente.');
    } catch { setError('No se pudo conectar para cerrar la sesión.'); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="login-shell" role="status">Comprobando sesión…</main>;
  if (session) return <><div className="session-bar"><span>Sesión de <strong>{session.user.name}</strong></span><button onClick={logout} disabled={busy}>Cerrar sesión</button>{error && <p role="alert">{error}</p>}</div><HomePage /></>;

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <img className="login-logo" src="/logo-del-sol.png" alt="Distribuidora Del Sol" width="112" height="112" />
        <p className="eyebrow">SISTEMA DE GESTIÓN</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="intro">Ingresá con tu usuario para continuar.</p>
        <form onSubmit={login} className="login-form">
          <label htmlFor="username">Usuario</label>
          <input id="username" name="username" autoComplete="username" maxLength={100} required disabled={busy} />
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" maxLength={256} required disabled={busy} />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
      </section>
    </main>
  );
}
