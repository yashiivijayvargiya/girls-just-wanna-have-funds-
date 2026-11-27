'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useBusiness } from '../../lib/useBusiness';
import { BUSINESS_TYPES } from '../../lib/templates';
import { suggestPrice } from '../../lib/pricing';
import AmountInput from '../../components/AmountInput';
import AppNav from '../../components/AppNav';

export default function SettingsPage() {
  const { session, settings, reloadSettings, ready } = useBusiness();
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && !f) {
      setF({
        business_name: settings.business_name || '',
        currency: settings.currency || '₹',
        business_type: settings.business_type || '',
        pricing_mode: settings.pricing_mode || 'margin',
        default_margin: String(settings.default_margin ?? 40),
        round_to: String(settings.round_to ?? 0),
        hourly_rate: String(settings.hourly_rate ?? 0),
      });
    }
  }, [settings, f]);

  if (!ready || !f) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;

  const example = suggestPrice(100, {
    mode: f.pricing_mode,
    value: Number(f.default_margin) || 0,
    roundTo: Number(f.round_to) || 0,
  });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    const margin = Number(f.default_margin) || 0;
    if (f.pricing_mode === 'margin' && margin >= 100) {
      setSaving(false);
      setMsg({ type: 'err', text: 'A margin has to be under 100%. (A 100% margin would mean a price of infinity.)' });
      return;
    }
    const { error } = await supabase.from('business_settings').upsert({
      user_id: session.user.id,
      business_name: f.business_name.trim(),
      currency: f.currency,
      business_type: f.business_type || null,
      pricing_mode: f.pricing_mode,
      default_margin: margin,
      round_to: Number(f.round_to) || 0,
      hourly_rate: Number(f.hourly_rate) || 0,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      setMsg({ type: 'err', text: 'Could not save: ' + error.message + ' (If it mentions a missing column, run the Phase 1 SQL file in Supabase first.)' });
      return;
    }
    await reloadSettings();
    setMsg({ type: 'ok', text: 'Saved.' });
  }

  return (
    <div className="wrap">
      <AppNav active="settings" />
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Tell the app about your business once. It uses this to ask the right questions and to suggest prices.</p>

      <form className="card" onSubmit={save}>
        <h2 style={{ gridColumn: '1/-1', margin: 0 }}>Your business</h2>
        <div>
          <label>Business name</label>
          <input required value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} />
        </div>
        <div>
          <label>Currency symbol</label>
          <select value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>
            <option value="₹">₹ Rupee</option>
            <option value="$">$ Dollar</option>
            <option value="€">€ Euro</option>
            <option value="£">£ Pound</option>
          </select>
        </div>
        <div className="full">
          <label>What do you make?</label>
          <select value={f.business_type} onChange={(e) => setF({ ...f, business_type: e.target.value })}>
            <option value="">Choose one…</option>
            {Object.entries(BUSINESS_TYPES).map(([id, t]) => (
              <option key={id} value={id}>{t.label}</option>
            ))}
          </select>
          <div className="muted" style={{ marginTop: 5 }}>This decides which questions you are asked when you add a product. You can change it any time; your saved data is not affected.</div>
        </div>

        <h2 style={{ gridColumn: '1/-1', margin: '10px 0 0' }}>Pricing</h2>
        <div>
          <label>Work out my price using</label>
          <select value={f.pricing_mode} onChange={(e) => setF({ ...f, pricing_mode: e.target.value })}>
            <option value="margin">Profit margin (profit as a share of the selling price)</option>
            <option value="markup">Markup (profit added on top of cost)</option>
          </select>
        </div>
        <div>
          <label>Default {f.pricing_mode === 'markup' ? 'markup' : 'margin'} %</label>
          <AmountInput value={f.default_margin} onChange={(v) => setF({ ...f, default_margin: v })} />
        </div>
        <div>
          <label>Round prices up to the nearest</label>
          <select value={f.round_to} onChange={(e) => setF({ ...f, round_to: e.target.value })}>
            <option value="0">Don&apos;t round</option>
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="50">50</option>
          </select>
        </div>
        <div>
          <label>Your time is worth (per hour, optional)</label>
          <AmountInput value={f.hourly_rate} onChange={(v) => setF({ ...f, hourly_rate: v })} placeholder="0 to ignore labour" />
        </div>
        <div className="callout">
          <strong>Example:</strong> a piece that costs you {f.currency}100 to make would be priced at{' '}
          <strong>{example.ok ? `${f.currency}${example.price}` : '—'}</strong>
          {example.ok && <> (your profit: {f.currency}{example.profit}, which is a {example.marginPct}% margin or a {example.markupPct}% markup)</>}.
          <br />
          Margin and markup are not the same thing. At 40%, margin gives {f.currency}166.67 and markup gives {f.currency}140 for the same cost.
        </div>
        <div className="btn-row" style={{ alignItems: 'center' }}>
          {msg.text && <span className={msg.type === 'ok' ? 'msg-ok' : 'msg-err'}>{msg.text}</span>}
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  );
}
