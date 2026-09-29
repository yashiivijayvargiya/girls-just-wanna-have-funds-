'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    window.location.href = '/dashboard';
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
        <p className="auth-eyebrow">YOUR BUSINESS, IN GOOD HANDS</p>
        <h1>Log in</h1>
      <form className="card" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Link className="muted" href="/forgot-password" style={{ fontSize: 12.5 }}>Forgot password?</Link>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>
        <p className="muted auth-footnote">New here? <Link href="/signup">Create an account</Link></p>
      </div>
    </main>
  );
}
