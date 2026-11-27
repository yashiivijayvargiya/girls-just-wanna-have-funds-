// Calculator-style amounts: "90+70+80", "(10+5)*2", "2^3" all work.
export function tryEvaluate(str) {
  const s = String(str ?? '').trim();
  if (s === '') return null;
  // Only digits, + - * / ^ ( ) . and spaces - so this can only ever do arithmetic.
  if (!/^[0-9+\-*/^(). ]+$/.test(s)) return null;
  const jsExpr = s.replace(/\^/g, '**');
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + jsExpr + ')')();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export function parseAmount(str) {
  if (str === '' || str === null || str === undefined) return 0;
  const evaluated = tryEvaluate(str);
  if (evaluated !== null) return evaluated;
  const n = Number(str);
  return isNaN(n) ? 0 : n;
}

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
