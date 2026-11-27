import { parseAmount, round2 } from './amount';

// Cost of ONE finished piece from a product + its recipe lines.
// lines: [{ material_id, qty, is_packaging }]   materialsById: { id: { unit_cost } }
export function productCosts(product, lines, materialsById) {
  let material = 0;
  let packaging = 0;
  for (const line of lines || []) {
    const m = materialsById[line.material_id];
    const cost = (Number(line.qty) || 0) * (Number(m?.unit_cost) || 0);
    if (line.is_packaging) packaging += cost;
    else material += cost;
  }
  const wastePct = Number(product.waste_pct) || 0;
  const waste = ((material + packaging) * wastePct) / 100;
  const labour = ((Number(product.minutes) || 0) / 60) * (Number(product.hourly_rate) || 0);
  const batch = Math.max(1, Number(product.pieces_per_batch) || 1);
  const per = (n) => round2(n / batch);
  const materialCost = per(material);
  const packagingCost = per(packaging);
  const wasteCost = per(waste);
  const labourCost = per(labour);
  const totalCost = round2(materialCost + packagingCost + wasteCost + labourCost);
  return { materialCost, packagingCost, wasteCost, labourCost, totalCost };
}

// mode 'margin': profit is value% of the SELLING price  -> price = cost / (1 - m)
// mode 'markup': profit is value% ON TOP of cost         -> price = cost * (1 + m)
export function suggestPrice(cost, { mode = 'margin', value = 40, roundTo = 0 } = {}) {
  const c = Number(cost) || 0;
  const v = Number(value) || 0;
  if (c <= 0) return { price: 0, profit: 0, marginPct: null, markupPct: null, ok: false };
  let price;
  if (mode === 'markup') price = c * (1 + v / 100);
  else {
    if (v >= 100) return { price: 0, profit: 0, marginPct: null, markupPct: null, ok: false };
    price = c / (1 - v / 100);
  }
  const step = Number(roundTo) || 0;
  if (step > 0) price = Math.ceil(price / step - 1e-9) * step;
  price = round2(price);
  const profit = round2(price - c);
  return {
    price,
    profit,
    marginPct: price > 0 ? Math.round((profit / price) * 1000) / 10 : null,
    markupPct: Math.round((profit / c) * 1000) / 10,
    ok: true,
  };
}

// Pricing settings in one place, with safe defaults if the migration isn't run yet.
export function pricingOptions(settings, product) {
  const override = product?.margin_override;
  return {
    mode: settings?.pricing_mode === 'markup' ? 'markup' : 'margin',
    value: override !== null && override !== undefined && override !== '' ? Number(override) : Number(settings?.default_margin ?? 40),
    roundTo: Number(settings?.round_to) || 0,
  };
}

export { parseAmount, round2 };
