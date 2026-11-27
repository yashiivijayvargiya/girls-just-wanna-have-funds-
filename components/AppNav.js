'use client';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import './app-sections.css';

const LINKS = [
  { id: 'orders', href: '/dashboard', label: 'Orders' },
  { id: 'materials', href: '/materials', label: 'Materials' },
  { id: 'products', href: '/products', label: 'Products' },
  { id: 'settings', href: '/settings', label: 'Settings' },
];

export default function AppNav({ active, showLogout = true }) {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }
  return (
    <nav className="app-nav" aria-label="Main sections">
      <div className="app-nav-links">
        {LINKS.map((l) => (
          <Link key={l.id} href={l.href} className={'app-nav-link' + (active === l.id ? ' active' : '')}>
            {l.label}
          </Link>
        ))}
      </div>
      {showLogout && (
        <button type="button" className="app-nav-logout" onClick={logout}>Log out</button>
      )}
    </nav>
  );
}
