'use client';
import { tryEvaluate, round2 } from '../lib/amount';

// Text box that works like a calculator: type 90+70+80, press Enter or click away -> 240.
export default function AmountInput({ value, onChange, ...rest }) {
  function resolve() {
    const v = tryEvaluate(value);
    if (v !== null) onChange(String(round2(v)));
  }
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={resolve}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          resolve();
        }
      }}
      {...rest}
    />
  );
}
