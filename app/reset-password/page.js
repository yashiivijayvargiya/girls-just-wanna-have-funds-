'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');

  // The link Supabase emails logs the user in automatically (a "recovery"
  // session) once this page loads. We just wait for that session to exist
  // before letting them set a new password.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setStatus('loading');
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus('error');
      return;
    }
    setStatus('done');
  }

  return (
    <main className="login-page">
      <header className="site-header auth-header">
        <Link className="brand-mark" href="/" aria-label="Girls Just Wanna Have Funds home">
          <span className="brand-kicker">THE BUSINESS CLUB</span>
          <span className="brand-name">girls just wanna have funds<span className="brand-dot">.</span></span>
        </Link>
        <Link className="auth-back" href="/">Back to welcome</Link>
      </header>
      <div className="auth-wrap">
        <p className="auth-eyebrow">ALMOST THERE</p>
        <h1>Set a new password</h1>
        {status === 'done' ? (
          <div className="card">
            <p>Your password's been updated.</p>
            <div className="btn-row"><Link className="btn btn-primary" href="/login">Log in</Link></div>
          </div>
        ) : !ready ? (
          <div className="card">
            <p className="muted">Opening your reset link… if this sits here for more than a few seconds, the link may have expired — request a new one.</p>
            <div className="btn-row"><Link className="btn btn-ghost" href="/forgot-password">Request a new link</Link></div>
          </div>
        ) : (
          <form className="card" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <label>New password</label>
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label>Confirm new password</label>
              <input required type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="btn-row">
              <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Saving…' : 'Save new password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
