'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { parseAmount, round2 } from '../lib/amount';
import { productCosts, suggestPrice, pricingOptions } from '../lib/pricing';
import AmountInput from './AmountInput';

let uidCounter = 0;
const uid = () => `l${Date.now()}_${uidCounter++}`;

// The "interview": one question per step, then time & extras, then the price.
export default function ProductWizard({ template, materials, settings, userId, initial, onSaved, onCancel }) {
  const questions = template.questions;
  const total = questions.length + 2;
  const currency = settings.currency || '₹';
  const money = (n) => currency + round2(n).toLocaleString('en-IN');
  const materialsById = useMemo(() => Object.fromEntries(materials.map((m) => [m.id, m])), [materials]);

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [lines, setLines] = useState(() => {
    const out = {};
    questions.forEach((q) => { out[q.key] = []; });
    (initial?.lines || []).forEach((l) => {
      const key = out[l.step_key] ? l.step_key : questions[0].key;
      out[key].push({ uid: uid(), material_id: l.material_id, qty: String(l.qty) });
    });
    return out;
  });
  const [extras, setExtras] = useState({
    minutes: String(initial?.product.minutes ?? ''),
    hourly: String(initial?.product.hourly_rate ?? settings.hourly_rate ?? 0),
    waste: String(initial?.product.waste_pct ?? template.defaultWaste ?? 0),
    batch: String(initial?.product.pieces_per_batch ?? 1),
  });
  const [name, setName] = useState(initial?.product.name || '');
  const [notes, setNotes] = useState(initial?.product.notes || '');
  const [marginOverride, setMarginOverride] = useState(
    initial?.product.margin_override !== null && initial?.product.margin_override !== undefined ? String(initial.product.margin_override) : ''
  );

  const flatLines = useMemo(
    () =>
      questions.flatMap((q) =>
        (lines[q.key] || [])
          .filter((l) => l.material_id && parseAmount(l.qty) > 0)
          .map((l) => ({ material_id: l.material_id, qty: parseAmount(l.qty), step_key: q.key, is_packaging: !!q.packaging }))
      ),
    [lines, questions]
  );

  const productLike = {
    waste_pct: parseAmount(extras.waste),
    minutes: parseAmount(extras.minutes),
    hourly_rate: parseAmount(extras.hourly),
    pieces_per_batch: template.asksBatch ? Math.max(1, parseAmount(extras.batch) || 1) : 1,
  };
  const costs = productCosts(productLike, flatLines, materialsById);
  const opts = pricingOptions(settings, { margin_override: marginOverride === '' ? null : parseAmount(marginOverride) });
  const price = suggestPrice(costs.totalCost, opts);
  const modeWord = opts.mode === 'markup' ? 'markup' : 'margin';

  function setStepLines(key, next) {
    setLines({ ...lines, [key]: next });
  }

  async function save() {
    setError('');
    if (!name.trim()) return setError('Give your product a name first.');
    if (flatLines.length === 0) return setError('Add at least one material (go back to a step and pick one).');
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        name: name.trim(),
        notes: notes.trim(),
        pieces_per_batch: productLike.pieces_per_batch,
        minutes: productLike.minutes,
        hourly_rate: productLike.hourly_rate,
        waste_pct: productLike.waste_pct,
        margin_override: marginOverride === '' ? null : parseAmount(marginOverride),
        updated_at: new Date().toISOString(),
      };
      let productId = initial?.product.id;
      if (productId) {
        const { error: e1 } = await supabase.from('products').update(payload).eq('id', productId);
        if (e1) throw e1;
      } else {
        const { data, error: e1 } = await supabase.from('products').insert(payload).select().single();
        if (e1) throw e1;
        productId = data.id;
      }
      const newRows = flatLines.map((l) => ({ ...l, user_id: userId, product_id: productId }));
      const { error: e2 } = await supabase.from('recipe_lines').insert(newRows);
      if (e2) throw e2;
      // only remove the old lines once the new ones are safely saved
      const oldIds = (initial?.lines || []).map((l) => l.id);
      if (oldIds.length) {
        const { error: e3 } = await supabase.from('recipe_lines').delete().in('id', oldIds);
        if (e3) throw e3;
      }
      onSaved();
    } catch (err) {
      setError('Could not save: ' + (err.message || err));
      setSaving(false);
    }
  }

  const q = step < questions.length ? questions[step] : null;

  return (
    <div className="card">
      <div className="wizard-progress">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={'wizard-dot' + (i < step ? ' done' : i === step ? ' now' : '')} />
        ))}
      </div>
      <div className="muted" style={{ marginBottom: 6 }}>
        {initial ? 'Editing' : 'New product'} · Step {step + 1} of {total}
      </div>

      {q && (
        <>
          <h2 className="wizard-q" style={{ fontFamily: 'inherit' }}>{q.title}</h2>
          <p className="page-sub" style={{ marginBottom: 16 }}>{q.help}</p>
          {(lines[q.key] || []).map((l) => {
            const m = materialsById[l.material_id];
            const suggested = materials.filter((x) => q.categories.includes(x.category));
            const rest = materials.filter((x) => !q.categories.includes(x.category));
            return (
              <div className="line-row" key={l.uid}>
                <div className="line-material">
                  <label>Material</label>
                  <select
                    value={l.material_id}
                    onChange={(e) => setStepLines(q.key, lines[q.key].map((x) => (x.uid === l.uid ? { ...x, material_id: e.target.value } : x)))}
                  >
                    <option value="">Choose…</option>
                    {suggested.length > 0 && (
                      <optgroup label="Suggested for this step">
                        {suggested.map((x) => <option key={x.id} value={x.id}>{x.name}{x.variant ? ' — ' + x.variant : ''}</option>)}
                      </optgroup>
                    )}
                    {rest.length > 0 && (
                      <optgroup label="Everything else">
                        {rest.map((x) => <option key={x.id} value={x.id}>{x.name}{x.variant ? ' — ' + x.variant : ''}</option>)}
                      </optgroup>
                    )}
                  </select>
                  {m && <div className="line-unit">{money(m.unit_cost)} per {m.unit}</div>}
                </div>
                <div>
                  <label>How many{m ? ` (${m.unit})` : ''}</label>
                  <AmountInput
                    value={l.qty}
                    onChange={(v) => setStepLines(q.key, lines[q.key].map((x) => (x.uid === l.uid ? { ...x, qty: v } : x)))}
                    placeholder="e.g. 14"
                  />
                </div>
                <button type="button" className="line-remove" onClick={() => setStepLines(q.key, lines[q.key].filter((x) => x.uid !== l.uid))}>Remove</button>
              </div>
            );
          })}
          <button type="button" className="btn btn-ghost" onClick={() => setStepLines(q.key, [...(lines[q.key] || []), { uid: uid(), material_id: '', qty: '' }])}>
            ＋ Add {(lines[q.key] || []).length ? 'another' : 'a material'}
          </button>
          <p className="muted" style={{ marginTop: 12 }}>
            Don&apos;t see what you used? <Link href="/materials">Add it on the Materials page</Link> (your progress here won&apos;t be kept), or skip this step.
          </p>
        </>
      )}

      {step === questions.length && (
        <>
          <h2 className="wizard-q" style={{ fontFamily: 'inherit' }}>Time and extras</h2>
          <p className="page-sub">All optional. Your own time is a real cost, and handmade sellers often underprice by leaving it out.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label>Minutes it takes to make {template.asksBatch ? 'the whole batch' : 'one'}</label>
              <AmountInput value={extras.minutes} onChange={(v) => setExtras({ ...extras, minutes: v })} placeholder="e.g. 45 or 2*60" />
            </div>
            <div>
              <label>Your time is worth (per hour)</label>
              <AmountInput value={extras.hourly} onChange={(v) => setExtras({ ...extras, hourly: v })} />
            </div>
            <div>
              <label>Wastage % (ruined pieces, offcuts)</label>
              <AmountInput value={extras.waste} onChange={(v) => setExtras({ ...extras, waste: v })} />
            </div>
            {template.asksBatch && (
              <div>
                <label>How many pieces does this make?</label>
                <AmountInput value={extras.batch} onChange={(v) => setExtras({ ...extras, batch: v })} />
              </div>
            )}
          </form>
        </>
      )}

      {step === questions.length + 1 && (
        <>
          <h2 className="wizard-q" style={{ fontFamily: 'inherit' }}>Name it and see the price</h2>
          <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 14 }}>
            <div className="full">
              <label>Product name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pink star bracelet" />
            </div>
            <div className="full">
              <label>Notes (optional)</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <label>Use a different {modeWord} for this product (optional)</label>
              <AmountInput value={marginOverride} onChange={setMarginOverride} placeholder={`Your default is ${settings.default_margin ?? 40}%`} />
            </div>
          </form>
          <table className="breakdown">
            <tbody>
              <tr><td>Materials</td><td>{money(costs.materialCost)}</td></tr>
              <tr><td>Packaging</td><td>{money(costs.packagingCost)}</td></tr>
              <tr><td>Wastage</td><td>{money(costs.wasteCost)}</td></tr>
              <tr><td>Your time</td><td>{money(costs.labourCost)}</td></tr>
              <tr className="total"><td>Cost to make one</td><td>{money(costs.totalCost)}</td></tr>
            </tbody>
          </table>
          <div className="price-box">
            {price.ok ? (
              <>
                <div className="muted">SUGGESTED PRICE at {opts.value}% {modeWord}</div>
                <div className="big">{money(price.price)}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  You keep {money(price.profit)} on each one. That is a {price.marginPct}% margin and a {price.markupPct}% markup.
                </div>
              </>
            ) : (
              <div className="muted">Add materials to see a suggested price.</div>
            )}
          </div>
          {error && <p className="msg-err" style={{ marginTop: 12 }}>{error}</p>}
        </>
      )}

      <div className="wizard-nav">
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        </div>
        {step < total - 1 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            {q && (lines[q.key] || []).length === 0 ? 'Skip this step' : 'Next'}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
        )}
      </div>
    </div>
  );
}
