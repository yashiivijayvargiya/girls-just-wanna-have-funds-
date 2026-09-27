'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { business_name: businessName } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setStatus('error');
      return;
    }
    // If a session came back immediately, email confirmation is off in this
    // Supabase project — save their business name right away and go in.
    if (data.session) {
      await supabase
        .from('business_settings')
        .upsert({ user_id: data.user.id, business_name: businessName, currency: '₹' });
      window.location.href = '/dashboard';
      return;
    }
    setStatus('sent');
  }

  return (
    <div className="auth-wrap">
      <h1>Create your account</h1>
      <p className="muted">Free — your data is private to you.</p>
      {status === 'sent' ? (
        <div className="card">
          <p>Check <strong>{email}</strong> for a confirmation link, then come back and log in.</p>
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <label>Business name</label>
            <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Fringe" />
          </div>
          <div>
            <label>Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating account…' : 'Sign up'}
            </button>
          </div>
        </form>
      )}
      <p className="muted">Already have an account? <Link href="/login">Log in</Link></p>
    </div>
  );
}
