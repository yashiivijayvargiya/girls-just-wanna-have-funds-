'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useBusiness } from '../../lib/useBusiness';
import { BUSINESS_TYPES, getTemplate } from '../../lib/templates';
import { productCosts, suggestPrice, pricingOptions } from '../../lib/pricing';
import { round2 } from '../../lib/amount';
import AppNav from '../../components/AppNav';
import ProductWizard from '../../components/ProductWizard';

export default function ProductsPage() {
  const { session, settings, reloadSettings, ready } = useBusiness();
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [wizard, setWizard] = useState(null); // null | { initial: null | {product, lines} }
  const [loadError, setLoadError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const [m, p, l] = await Promise.all([
      supabase.from('materials').select('*').eq('user_id', uid).order('name'),
      supabase.from('products').select('*').eq('user_id', uid).order('name'),
      supabase.from('recipe_lines').select('*').eq('user_id', uid),
    ]);
    const err = m.error || p.error || l.error;
    if (err) return setLoadError(err.message);
    setLoadError('');
    setMaterials(m.data || []);
    setProducts(p.data || []);
    setLines(l.data || []);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const materialsById = useMemo(() => Object.fromEntries(materials.map((m) => [m.id, m])), [materials]);
  const money = (n) => (settings?.currency || '₹') + round2(n).toLocaleString('en-IN');

  async function chooseType(type) {
    const { error } = await supabase.from('business_settings').upsert({
      user_id: session.user.id,
      business_name: settings.business_name || '',
      business_type: type,
      updated_at: new Date().toISOString(),
    });
    if (error) return setMsg('Could not save: ' + error.message);
    reloadSettings();
  }

  async function removeProduct(p) {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return setMsg('Could not delete: ' + error.message);
    load();
  }

  if (!ready) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;

  const template = getTemplate(settings.business_type);

  return (
    <div className="wrap">
      <AppNav active="products" />
      <h1 className="page-title">Products &amp; pricing</h1>
      <p className="page-sub">
        Tell the app what goes into each product and it works out what it costs you to make one, then suggests a price using your default {settings.pricing_mode === 'markup' ? 'markup' : 'margin'}.
      </p>

      {loadError && (
        <div className="card">
          <p className="msg-err">Could not load: {loadError}</p>
          <p className="muted">If this says a table doesn&apos;t exist, run the Phase 1 SQL file in Supabase (SQL Editor) and refresh.</p>
        </div>
      )}
      {msg && <p className="msg-err">{msg}</p>}

      {!template ? (
        <div className="card">
          <h2>First, what do you make?</h2>
          <p className="page-sub" style={{ marginBottom: 16 }}>
            This sets up the right questions for your kind of business. You can change it later in Settings.
          </p>
          <div className="type-cards">
            {Object.entries(BUSINESS_TYPES).map(([id, t]) => (
              <button key={id} type="button" className="type-card" onClick={() => chooseType(id)}>
                <b>{t.label}</b>
                <span>{t.blurb}</span>
              </button>
            ))}
          </div>
        </div>
      ) : wizard ? (
        <ProductWizard
          template={template}
          materials={materials}
          settings={settings}
          userId={session.user.id}
          initial={wizard.initial}
          onCancel={() => setWizard(null)}
          onSaved={() => { setWizard(null); load(); }}
        />
      ) : (
        <>
          {materials.length === 0 ? (
            <div className="card">
              <h2>Add your materials first</h2>
              <p className="page-sub">Prices are worked out from what your materials cost you, so the app needs to know them before you can add a product.</p>
              <Link className="btn btn-primary" href="/materials">Go to Materials</Link>
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <button className="btn btn-primary" type="button" onClick={() => setWizard({ initial: null })}>＋ New product</button>
            </div>
          )}

          <div className="card">
            <h2>Your products ({products.length})</h2>
            {products.length === 0 ? (
              <div className="empty">No products yet.</div>
            ) : products.map((p) => {
              const pLines = lines.filter((l) => l.product_id === p.id);
              const costs = productCosts(p, pLines, materialsById);
              const price = suggestPrice(costs.totalCost, pricingOptions(settings, p));
              return (
                <div className="row-card" key={p.id}>
                  <div>
                    <div className="title">{p.name}</div>
                    <div className="meta">
                      Costs <strong>{money(costs.totalCost)}</strong> to make
                      {' '}(materials {money(costs.materialCost)}, packaging {money(costs.packagingCost)}
                      {costs.wasteCost > 0 ? `, wastage ${money(costs.wasteCost)}` : ''}
                      {costs.labourCost > 0 ? `, your time ${money(costs.labourCost)}` : ''})
                      <br />
                      {price.ok ? <>Suggested price <strong>{money(price.price)}</strong> · you keep {money(price.profit)} ({price.marginPct}% margin)</> : 'Add materials to get a price.'}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button onClick={() => setWizard({ initial: { product: p, lines: pLines } })}>Edit</button>
                    <button onClick={() => removeProduct(p)}>Delete</button>
                  </div>
                </div>
              );
            })}
            {products.length > 0 && (
              <p className="muted">Costs update automatically whenever you log a new purchase, because they are worked out from your current material prices.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
