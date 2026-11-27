'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabaseClient';
import { useBusiness } from '../../lib/useBusiness';
import { categoriesFor, UNITS } from '../../lib/templates';
import { parseAmount, round2 } from '../../lib/amount';
import AmountInput from '../../components/AmountInput';
import AppNav from '../../components/AppNav';

const today = () => new Date().toISOString().slice(0, 10);
const blankPurchase = () => ({
  materialId: '', name: '', variant: '', category: '', unit: 'piece',
  packs: '1', perPack: '1', paid: '', extra: '', date: today(), supplier: '',
});
const norm = (s) => String(s || '').trim().toLowerCase();

export default function MaterialsPage() {
  const { session, settings, ready } = useBusiness();
  const [materials, setMaterials] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [f, setF] = useState(blankPurchase());
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const currency = settings?.currency || '₹';
  const categories = useMemo(() => categoriesFor(settings?.business_type), [settings]);
  const money = (n) => currency + round2(n).toLocaleString('en-IN');

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const [m, p] = await Promise.all([
      supabase.from('materials').select('*').eq('user_id', uid).order('name'),
      supabase
        .from('purchases')
        .select('*, materials(name, variant, unit)')
        .eq('user_id', uid)
        .order('purchase_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(300),
    ]);
    if (m.error) {
      setLoadError(m.error.message);
      return;
    }
    setLoadError('');
    setMaterials(m.data || []);
    setPurchases(p.data || []);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const picked = materials.find((m) => m.id === f.materialId);
  const units = parseAmount(f.packs) * parseAmount(f.perPack);
  const total = parseAmount(f.paid) + parseAmount(f.extra);
  const perUnit = units > 0 ? total / units : 0;

  function pickMaterial(id) {
    const m = materials.find((x) => x.id === id);
    if (!m) setF({ ...f, materialId: '', name: '', variant: '', category: '', unit: 'piece' });
    else setF({ ...f, materialId: id, name: m.name, variant: m.variant, category: m.category, unit: m.unit });
  }

  async function savePurchase(e) {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!(units > 0)) return setMsg({ type: 'err', text: 'How many did you get? The quantity has to be more than 0.' });
    if (!f.materialId && !f.name.trim()) return setMsg({ type: 'err', text: 'Give this material a name.' });
    setSaving(true);
    try {
      const uid = session.user.id;
      // Buying something you already have? Add to it instead of making a duplicate.
      let mat = picked;
      if (!mat) mat = materials.find((m) => norm(m.name) === norm(f.name) && norm(m.variant) === norm(f.variant));

      let materialId;
      if (mat) {
        const oldStock = Number(mat.stock) || 0;
        const newStock = oldStock + units;
        // average cost across what you hold, so prices stay realistic as your supplier's change
        const newCost = oldStock > 0 ? (oldStock * Number(mat.unit_cost) + total) / newStock : total / units;
        const { error } = await supabase
          .from('materials')
          .update({ stock: newStock, unit_cost: newCost, updated_at: new Date().toISOString() })
          .eq('id', mat.id);
        if (error) throw error;
        materialId = mat.id;
      } else {
        const { data, error } = await supabase
          .from('materials')
          .insert({
            user_id: uid, name: f.name.trim(), variant: f.variant.trim(),
            category: f.category || 'Other', unit: f.unit, stock: units, unit_cost: total / units,
          })
          .select()
          .single();
        if (error) throw error;
        materialId = data.id;
      }
      const { error: pErr } = await supabase.from('purchases').insert({
        user_id: uid, material_id: materialId, purchase_date: f.date || today(), supplier: f.supplier.trim(),
        packs: parseAmount(f.packs), units_per_pack: parseAmount(f.perPack), units,
        paid: parseAmount(f.paid), extra_cost: parseAmount(f.extra), total_cost: total,
      });
      if (pErr) throw pErr;
      setF({ ...blankPurchase(), date: f.date });
      setMsg({ type: 'ok', text: mat ? `Added to ${mat.name}${mat.variant ? ' (' + mat.variant + ')' : ''}.` : 'New material saved.' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: 'Could not save: ' + (err.message || err) });
    }
    setSaving(false);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('materials')
      .update({
        name: editing.name.trim(), variant: editing.variant.trim(), category: editing.category, unit: editing.unit,
        stock: parseAmount(editing.stock), unit_cost: parseAmount(editing.unit_cost), notes: editing.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editing.id);
    if (error) return setMsg({ type: 'err', text: 'Could not save: ' + error.message });
    setEditing(null);
    setMsg({ type: 'ok', text: 'Material updated.' });
    load();
  }

  async function remove(m) {
    if (!confirm(`Delete ${m.name}? Its purchase history will be deleted too.`)) return;
    const { error } = await supabase.from('materials').delete().eq('id', m.id);
    if (error) {
      return setMsg({
        type: 'err',
        text: error.message.includes('violates foreign key')
          ? `${m.name} is used in one of your products, so it can't be deleted. Remove it from that product first.`
          : 'Could not delete: ' + error.message,
      });
    }
    load();
  }

  // Rebuilt from your database every time, so it always includes every purchase so far.
  function exportExcel() {
    if (!materials.length) return alert('Nothing to export yet.');
    const matRows = materials.map((m) => ({
      Name: m.name, Variant: m.variant, Category: m.category, Unit: m.unit,
      'In stock': Number(m.stock), 'Cost per unit': round2(m.unit_cost), 'Stock value': round2(m.stock * m.unit_cost), Notes: m.notes,
    }));
    const purRows = purchases.map((p) => ({
      Date: p.purchase_date, Material: p.materials?.name || '', Variant: p.materials?.variant || '', Supplier: p.supplier,
      Packs: Number(p.packs), 'Units per pack': Number(p.units_per_pack), 'Total units': Number(p.units),
      Paid: Number(p.paid), 'Extra (shipping etc.)': Number(p.extra_cost), 'Total cost': Number(p.total_cost),
      'Cost per unit': Number(p.units) > 0 ? round2(p.total_cost / p.units) : 0,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matRows), 'Materials');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(purRows), 'Purchase history');
    const name = (settings?.business_name || 'my-business').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    XLSX.writeFile(wb, `${name}-materials.xlsx`);
  }

  const shown = materials.filter((m) => {
    const q = search.toLowerCase();
    return !q || `${m.name} ${m.variant} ${m.category}`.toLowerCase().includes(q);
  });

  if (!ready) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;

  return (
    <div className="wrap">
      <AppNav active="materials" />
      <h1 className="page-title">Materials</h1>
      <p className="page-sub">
        Log everything you buy. The app works out what one bead, one gram or one metre costs you, keeps track of stock, and uses these costs to price your products.
      </p>

      {loadError && (
        <div className="card">
          <p className="msg-err">Could not load your materials: {loadError}</p>
          <p className="muted">If this says a table doesn&apos;t exist, run the Phase 1 SQL file in Supabase (SQL Editor) and refresh.</p>
        </div>
      )}

      <form className="card" onSubmit={savePurchase}>
        <h2 style={{ gridColumn: '1/-1', margin: 0 }}>Log a purchase</h2>
        <div className="full">
          <label>Material</label>
          <select value={f.materialId} onChange={(e) => pickMaterial(e.target.value)}>
            <option value="">＋ New material</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name}{m.variant ? ' — ' + m.variant : ''}</option>
            ))}
          </select>
        </div>
        <div className="grid-4">
          <div>
            <label>Name</label>
            <input value={f.name} disabled={!!picked} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Glass beads" />
          </div>
          <div>
            <label>Size / colour / type</label>
            <input value={f.variant} disabled={!!picked} onChange={(e) => setF({ ...f, variant: e.target.value })} placeholder="e.g. 6mm pink" />
          </div>
          <div>
            <label>Category</label>
            <select value={f.category} disabled={!!picked} onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Counted in</label>
            <select value={f.unit} disabled={!!picked} onChange={(e) => setF({ ...f, unit: e.target.value })}>
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-4">
          <div>
            <label>Packs / lots bought</label>
            <AmountInput value={f.packs} onChange={(v) => setF({ ...f, packs: v })} />
          </div>
          <div>
            <label>Units in each pack</label>
            <AmountInput value={f.perPack} onChange={(v) => setF({ ...f, perPack: v })} placeholder="e.g. 100" />
          </div>
          <div>
            <label>Total paid (all packs)</label>
            <AmountInput value={f.paid} onChange={(v) => setF({ ...f, paid: v })} placeholder="e.g. 80*3" />
          </div>
          <div>
            <label>Shipping share (optional)</label>
            <AmountInput value={f.extra} onChange={(v) => setF({ ...f, extra: v })} placeholder="e.g. 540/18*3" />
          </div>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </div>
        <div>
          <label>Supplier (optional)</label>
          <input value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} />
        </div>
        <div className="callout">
          {units > 0 && total > 0 ? (
            <>
              You are adding <strong>{round2(units)} {picked?.unit || f.unit}</strong> at <strong>{money(perUnit)} each</strong>
              {picked && Number(picked.stock) > 0 && <> (you already hold {round2(picked.stock)} at {money(picked.unit_cost)}; the new average cost will be {money((Number(picked.stock) * Number(picked.unit_cost) + total) / (Number(picked.stock) + units))})</>}.
            </>
          ) : (
            <>Example: 3 packs, 10 pairs in each pack, paid 240 in total → 30 pairs at {currency}8 each. You can type sums like <strong>80*3</strong> in the money boxes.</>
          )}
        </div>
        <div className="btn-row" style={{ alignItems: 'center' }}>
          {msg.text && <span className={msg.type === 'ok' ? 'msg-ok' : 'msg-err'}>{msg.text}</span>}
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save purchase'}</button>
        </div>
      </form>

      {editing && (
        <form className="card" onSubmit={saveEdit}>
          <h2 style={{ gridColumn: '1/-1', margin: 0 }}>Edit material</h2>
          <div><label>Name</label><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div><label>Size / colour / type</label><input value={editing.variant} onChange={(e) => setEditing({ ...editing, variant: e.target.value })} /></div>
          <div>
            <label>Category</label>
            <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {[...new Set([editing.category, ...categories].filter(Boolean))].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Counted in</label>
            <select value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })}>
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div><label>In stock</label><AmountInput value={String(editing.stock)} onChange={(v) => setEditing({ ...editing, stock: v })} /></div>
          <div><label>Cost per unit</label><AmountInput value={String(round2(editing.unit_cost))} onChange={(v) => setEditing({ ...editing, unit_cost: v })} /></div>
          <div className="full"><label>Notes</label><input value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        </form>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Your materials ({materials.length})</h2>
          <button className="btn btn-ghost" type="button" onClick={exportExcel}>Download Excel</button>
        </div>
        <input type="search" placeholder="Search materials…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
        {shown.length === 0 ? (
          <div className="empty">{materials.length ? 'Nothing matches your search.' : 'No materials yet. Log your first purchase above.'}</div>
        ) : shown.map((m) => (
          <div className="row-card" key={m.id}>
            <div>
              <div className="title">{m.name}{m.variant ? ` — ${m.variant}` : ''}</div>
              <div className="meta">
                {m.category || 'Uncategorised'} · <strong>{round2(m.stock)} {m.unit}</strong> in stock · {money(m.unit_cost)} per {m.unit} · worth {money(m.stock * m.unit_cost)}
              </div>
            </div>
            <div className="row-actions">
              <button onClick={() => { setEditing({ ...m }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
              <button onClick={() => remove(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Purchase history</h2>
        {purchases.length === 0 ? (
          <div className="empty">Nothing logged yet.</div>
        ) : purchases.slice(0, 30).map((p) => (
          <div className="row-card" key={p.id}>
            <div>
              <div className="title">{p.materials?.name}{p.materials?.variant ? ` — ${p.materials.variant}` : ''}</div>
              <div className="meta">
                {p.purchase_date}{p.supplier ? ` · ${p.supplier}` : ''} · {round2(p.units)} {p.materials?.unit} for {money(p.total_cost)}
                {Number(p.units) > 0 ? ` (${money(p.total_cost / p.units)} each)` : ''}
              </div>
            </div>
          </div>
        ))}
        {purchases.length > 30 && <p className="muted">Showing the latest 30. The Excel download has all of them.</p>}
      </div>
    </div>
  );
}
