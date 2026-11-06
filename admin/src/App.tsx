import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { api } from './api';
import { Dashboard } from './Dashboard';
import { configured, supabase } from './supabase';

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!configured) return setReady(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAdmin(null);
    if (session) api.isAdmin().then(setAdmin);
  }, [session]);

  if (!configured) return <Setup />;
  if (!ready) return <div className="center muted">Yükleniyor…</div>;
  if (!session) return <Login />;
  if (admin === null) return <div className="center muted">Yetki kontrol ediliyor…</div>;
  if (!admin)
    return (
      <div className="center">
        <div className="card narrow">
          <h2>Yetki yok</h2>
          <p className="muted">
            <b>{session.user.email}</b> admin listesinde değil. Supabase SQL Editor'da şunu çalıştırın:
          </p>
          <pre>{`insert into public.admins (email) values ('${session.user.email}');`}</pre>
          <div className="row">
            <button onClick={() => api.isAdmin().then(setAdmin)}>Tekrar dene</button>
            <button className="ghost" onClick={() => supabase.auth.signOut()}>
              Çıkış
            </button>
          </div>
        </div>
      </div>
    );
  return <Dashboard email={session.user.email ?? ''} />;
}

function Setup() {
  return (
    <div className="center">
      <div className="card narrow">
        <h2>🐝 Hapla Admin — kurulum gerekli</h2>
        <p className="muted">
          Proje klasöründe <code>.env</code> dosyası bulunamadı ya da Supabase bilgileri eksik. <code>.env.example</code>{' '}
          dosyasını <code>.env</code> adıyla kopyalayıp Supabase proje adresini ve anon anahtarını yazın, sonra paneli
          yeniden başlatın.
        </p>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message === 'Invalid login credentials' ? 'E-posta ya da şifre hatalı.' : error.message);
    setBusy(false);
  };

  return (
    <div className="center">
      <form className="card narrow" onSubmit={submit}>
        <h2>🐝 Hapla Admin</h2>
        <p className="muted">Kart içeriğini yönetmek için giriş yapın.</p>
        <label>
          E-posta
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Şifre
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </div>
  );
}
