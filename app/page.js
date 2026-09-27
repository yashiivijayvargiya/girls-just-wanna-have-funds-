'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabaseClient';

const emptyForm = {
  id: null, name: '', city: '', products: '', total: '', delivery: '',
  material: '', packaging: '', shipping: '', other: '',
  order_date: new Date().toISOString().slice(0, 10),
  payment: 'unpaid', paid_amount: '', status: 'pending', notes: '',
};

function rupee(n, symbol) {
  return symbol + Number(n || 0).toLocaleString('en-IN');
}

export default function Dashboard() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [payFilter, setPayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ business_name: '', currency: '₹' });

  // --- auth ---------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) window.location.href = '/login';
  }, [session]);

  // --- data loading + realtime ---------------------------------------
  const loadAll = useCallback(async (userId) => {
    const [{ data: s }, { data: o }] = await Promise.all([
      supabase.from('business_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (s) { setSettings(s); setSettingsForm({ business_name: s.business_name, currency: s.currency }); }
    else setShowSettings(true);
    setOrders(o || []);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    loadAll(session.user.id);
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
        () => loadAll(session.user.id))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session, loadAll]);

  // --- derived numbers -------------------------------------------------
  const stats = useMemo(() => {
    const pendingCount = orders.filter((o) => o.status !== 'completed').length;
    const unpaidTotal = orders.reduce((s, o) => s + (o.payment !== 'paid' ? o.total - (o.paid_amount || 0) : 0), 0);
    const monthKey = new Date().toISOString().slice(0, 7);
    const thisMonth = orders.filter((o) => (o.order_date || '').startsWith(monthKey)).length;
    const yearKey = String(new Date().getFullYear());
    const yearProfit = orders.reduce((s, o) => s + ((o.order_date || '').startsWith(yearKey) ? o.profit || 0 : 0), 0);
    return { pendingCount, unpaidTotal, thisMonth, yearProfit };
  }, [orders]);

  const monthView = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() + monthOffset);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const list = orders.filter((o) => (o.order_date || '').startsWith(key));
    const profit = list.reduce((s, o) => s + (o.profit || 0), 0);
    return { label, profit, count: list.length };
  }, [orders, monthOffset]);

  const filtered = useMemo(() => orders.filter((o) => {
    if (payFilter !== 'all' && o.payment !== payFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    const q = search.toLowerCase();
    if (q && !((o.name || '').toLowerCase().includes(q) || (o.products || '').toLowerCase().includes(q))) return false;
    return true;
  }), [orders, payFilter, statusFilter, search]);

  const currency = settings?.currency || '₹';

  // --- profit preview while typing -------------------------------------
  const previewProfit = useMemo(() => {
    const total = Number(form.total) || 0, delivery = Number(form.delivery) || 0;
    const costs = (Number(form.material) || 0) + (Number(form.packaging) || 0) + (Number(form.shipping) || 0) + (Number(form.other) || 0);
    return total + delivery - costs;
  }, [form]);

  // --- actions -----------------------------------------------------
  async function saveOrder(e) {
    e.preventDefault();
    const total = Number(form.total) || 0, delivery = Number(form.delivery) || 0;
    const material = Number(form.material) || 0, packaging = Number(form.packaging) || 0;
    const shipping = Number(form.shipping) || 0, other = Number(form.other) || 0;
    const profit = total + delivery - (material + packaging + shipping + other);
    const paid_amount = form.payment === 'paid' ? total : form.payment === 'partial' ? Number(form.paid_amount) || 0 : 0;
    const row = {
      user_id: session.user.id, name: form.name.trim(), city: form.city.trim(), products: form.products.trim(),
      total, delivery, material, packaging, shipping, other, profit,
      order_date: form.order_date, payment: form.payment, paid_amount, status: form.status, notes: form.notes.trim(),
      updated_at: new Date().toISOString(),
    };
    const query = form.id
      ? supabase.from('orders').update(row).eq('id', form.id)
      : supabase.from('orders').insert(row);
    const { error } = await query;
    if (error) { alert('Could not save: ' + error.message); return; }
    setForm(emptyForm);
    loadAll(session.user.id);
  }

  function editOrder(o) {
    setForm({
      id: o.id, name: o.name || '', city: o.city || '', products: o.products || '',
      total: o.total || '', delivery: o.delivery || '', material: o.material || '', packaging: o.packaging || '',
      shipping: o.shipping || '', other: o.other || '', order_date: o.order_date || '',
      payment: o.payment || 'unpaid', paid_amount: o.paid_amount || '', status: o.status || 'pending', notes: o.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function markPaid(o) {
    await supabase.from('orders').update({ payment: 'paid', paid_amount: o.total }).eq('id', o.id);
    loadAll(session.user.id);
  }
  async function markCompleted(o) {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', o.id);
    loadAll(session.user.id);
  }
  async function deleteOrder(o) {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    await supabase.from('orders').delete().eq('id', o.id);
    loadAll(session.user.id);
  }

  async function saveSettings(e) {
    e.preventDefault();
    const { error } = await supabase.from('business_settings').upsert({
      user_id: session.user.id, business_name: settingsForm.business_name, currency: settingsForm.currency,
      updated_at: new Date().toISOString(),
    });
    if (error) { alert('Could not save settings: ' + error.message); return; }
    setShowSettings(false);
    loadAll(session.user.id);
  }

  function exportExcel() {
    if (!orders.length) { alert('No orders to export yet.'); return; }
    const rows = orders.map((o) => ({
      Date: o.order_date || '', Customer: o.name || '', City: o.city || '', Products: o.products || '',
      'Order Total': o.total, 'Delivery Charge': o.delivery, 'Raw Material Cost': o.material,
      'Packaging Cost': o.packaging, 'Shipping Cost': o.shipping, 'Other Cost': o.other, Profit: o.profit,
      'Payment Status': o.payment, 'Amount Paid': o.paid_amount, 'Order Status': o.status, Notes: o.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const name = (settings?.business_name || 'orders').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    XLSX.writeFile(wb, `${name}-orders-backup.xlsx`);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (session === undefined) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;
  if (!session) return null;

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>{settings?.business_name || 'Your Business'}</h1>
          <p className="muted">
            {session.user.email} · <a href="#" onClick={(e) => { e.preventDefault(); setShowSettings(true); }}>business settings</a> ·{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>log out</a>
          </p>
        </div>
        <div className="stats">
          <div className="stat warn"><b>{rupee(stats.unpaidTotal, currency)}</b><small>OWED TO YOU</small></div>
          <div className="stat"><b>{stats.pendingCount}</b><small>PENDING ORDERS</small></div>
          <div className="stat"><b>{stats.thisMonth}</b><small>ORDERS THIS MONTH</small></div>
          <div className="stat"><b>{rupee(stats.yearProfit, currency)}</b><small>PROFIT THIS YEAR</small></div>
        </div>
      </header>

      {showSettings && (
        <div className="card">
          <h2>Business settings</h2>
          <form onSubmit={saveSettings} style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div>
              <label>Business name</label>
              <input required value={settingsForm.business_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, business_name: e.target.value })} />
            </div>
            <div>
              <label>Currency symbol</label>
              <select value={settingsForm.currency} onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}>
                <option value="₹">₹ Rupee</option>
                <option value="$">$ Dollar</option>
                <option value="€">€ Euro</option>
                <option value="£">£ Pound</option>
              </select>
            </div>
            <div className="btn-row"><button className="btn btn-primary" type="submit">Save</button></div>
          </form>
        </div>
      )}

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost" onClick={() => setMonthOffset((m) => m - 1)}>&larr;</button>
        <div style={{ textAlign: 'center' }}>
          <div className="muted">MONTHLY PROFIT</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{monthView.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--paid)' }}>
            {rupee(monthView.profit, currency)} · {monthView.count} order{monthView.count === 1 ? '' : 's'}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => setMonthOffset((m) => Math.min(0, m + 1))} style={{ visibility: monthOffset < 0 ? 'visible' : 'hidden' }}>&rarr;</button>
      </div>

      <div className="card">
        <h2>{form.id ? 'Edit order' : 'New order'}</h2>
        <form onSubmit={saveOrder}>
          <div><label>Customer name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>City (optional)</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div className="full"><label>Products</label><textarea value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} /></div>
          <div className="row3">
            <div><label>Order total</label><input required type="number" min="0" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
            <div><label>Delivery charge to customer</label><input type="number" min="0" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} /></div>
            <div><label>Date</label><input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} /></div>
          </div>
          <div className="row3 row4">
            <div><label>Raw material cost</label><input type="number" min="0" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
            <div><label>Packaging cost</label><input type="number" min="0" value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })} /></div>
            <div><label>Shipping cost you paid</label><input type="number" min="0" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })} /></div>
            <div><label>Other cost (optional)</label><input type="number" min="0" value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} /></div>
          </div>
          <div className="full muted">
            {(form.total || form.material || form.packaging || form.shipping || form.other) ? `Estimated profit: ${rupee(previewProfit, currency)}` : ''}
          </div>
          <div>
            <label>Payment status</label>
            <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
              <option value="unpaid">Unpaid</option><option value="partial">Partially paid</option><option value="paid">Paid in full</option>
            </select>
          </div>
          {form.payment === 'partial' && (
            <div><label>Amount paid</label><input type="number" min="0" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} /></div>
          )}
          <div><label>Order status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option><option value="completed">Completed</option>
            </select>
          </div>
          <div className="full"><label>Notes (optional)</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="btn-row">
            {form.id && <button type="button" className="btn btn-ghost" onClick={() => setForm(emptyForm)}>Cancel</button>}
            <button type="submit" className="btn btn-primary">{form.id ? 'Save changes' : 'Add order'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Orders</h2>
          <button className="btn btn-ghost" onClick={exportExcel}>Download Excel backup</button>
        </div>
        <div className="filters" style={{ marginTop: 14 }}>
          <input type="search" placeholder="Search by customer or product..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="pill-group">
            {['all', 'unpaid', 'partial', 'paid'].map((v) => (
              <button key={v} className={'pill' + (payFilter === v ? ' active' : '')} onClick={() => setPayFilter(v)}>{v === 'all' ? 'All payments' : v}</button>
            ))}
          </div>
          <div className="pill-group">
            {['all', 'pending', 'completed'].map((v) => (
              <button key={v} className={'pill' + (statusFilter === v ? ' active' : '')} onClick={() => setStatusFilter(v)}>{v === 'all' ? 'All status' : v}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">No orders match yet. Add one above, or clear your filters.</div>
        ) : filtered.map((o) => {
          const due = o.payment !== 'paid' ? o.total - (o.paid_amount || 0) : 0;
          return (
            <div className="order" key={o.id}>
              <div className="order-top">
                <div>
                  <div className="order-name">{o.name || 'Unnamed'}</div>
                  <div className="order-meta">{o.order_date}{o.city ? ` · ${o.city}` : ''}</div>
                  {o.products && <div className="order-meta" style={{ color: 'var(--ink)', fontSize: 13.5 }}>{o.products}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="order-total">{rupee(o.total, currency)}</div>
                  <div className="badges" style={{ marginTop: 6, justifyContent: 'flex-end' }}>
                    <span className={'badge ' + o.payment}>{o.payment === 'partial' ? `Due ${rupee(due, currency)}` : o.payment}</span>
                    <span className={'badge ' + o.status}>{o.status}</span>
                  </div>
                </div>
              </div>
              <div className="order-meta" style={{ marginTop: 8 }}>
                Profit: <strong style={{ color: 'var(--paid)' }}>{rupee(o.profit, currency)}</strong>
              </div>
              {o.notes && <div className="order-meta">{o.notes}</div>}
              <div className="order-actions">
                {o.payment !== 'paid' && <button onClick={() => markPaid(o)}>Mark paid</button>}
                {o.status !== 'completed' && <button onClick={() => markCompleted(o)}>Mark completed</button>}
                <button onClick={() => editOrder(o)}>Edit</button>
                <button onClick={() => deleteOrder(o)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
