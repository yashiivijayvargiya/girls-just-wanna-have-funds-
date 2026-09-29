'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      setStatus('error');
      return;
    }
    setStatus('sent');
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
        <p className="auth-eyebrow">LOCKED OUT? LET'S FIX THAT</p>
        <h1>Reset your password</h1>
        {status === 'sent' ? (
          <div className="card">
            <p>
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
              Check your inbox (and spam folder) and follow the link to set a new password.
            </p>
          </div>
        ) : (
          <form className="card" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <label>Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="btn-row">
              <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}
        <p className="muted auth-footnote"><Link href="/login">Back to log in</Link></p>
      </div>
    </main>
  );
}
