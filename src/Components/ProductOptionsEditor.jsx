import React from 'react';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';

const asValueRows = (values = []) => (Array.isArray(values) ? values : String(values || '').split(','))
  .map((value, index) => {
    if (value && typeof value === 'object') {
      const label = String(value.label || value.value || value.name || '').trim();
      return { label, value: String(value.value || label).trim(), price: value.price ?? '', oldPrice: value.oldPrice ?? '', isDefault: Boolean(value.isDefault) || index === 0 };
    }
    const label = String(value || '').trim();
    return { label, value: label, price: '', oldPrice: '', isDefault: index === 0 };
  });

const cleanRows = (rows = []) => rows.map((row) => ({
  name: String(row?.name || row?.label || '').trim(),
  label: String(row?.label || row?.name || '').trim(),
  values: asValueRows(row?.values),
}));

export const normalizeProductOptionsForSubmit = (rows = []) =>
  cleanRows(rows).map((row) => ({
    name: row.name,
    label: row.label || row.name,
    values: row.values
      .map((v, index) => ({ label: String(v.label || v.value || '').trim(), value: String(v.value || v.label || '').trim(), price: Math.max(0, Number(v.price) || 0), oldPrice: Math.max(0, Number(v.oldPrice) || 0), isDefault: Boolean(v.isDefault) || index === 0 }))
      .filter((v) => v.label),
  })).filter((row) => row.name && row.values.length > 0);

const PALETTE = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];

const CSS = `
@keyframes poeIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes poeRow { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

.poe, .poe * { box-sizing: border-box; }
.poe {
  font-family: inherit; max-width: 100%; padding: 12px; border-radius: 16px;
  background: linear-gradient(135deg, #eef2ff 0%, #fdf2f8 50%, #ecfdf5 100%);
  border: 1px solid #e0e7ff; animation: poeIn .35s ease both;
}
.poe-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.poe-title { min-width: 0; flex: 1 1 180px; }
.poe-title h4 { margin: 0; font-size: 13px; font-weight: 800; color: #1e1b4b; display: flex; align-items: center; gap: 6px; }
.poe-title p { margin: 3px 0 0; font-size: 11px; line-height: 1.4; color: #6b7280; }

.poe-btn {
  border: none; cursor: pointer; font-weight: 700; font-size: 11.5px; border-radius: 10px; font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, background .18s ease, color .18s ease;
}
.poe-btn:hover { transform: translateY(-1px); }
.poe-btn:active { transform: scale(.96); }
.poe-add {
  flex-shrink: 0; padding: 8px 12px; color: #fff;
  background: #6366f1;
  background: linear-gradient(135deg, var(--accent), #ec4899);
  box-shadow: 0 6px 14px -6px rgba(99,102,241,.6);
}
.poe-add:hover { filter: brightness(1.08); box-shadow: 0 10px 18px -8px rgba(236,72,153,.6); }

.poe-list { display: grid; gap: 12px; }
.poe-card {
  position: relative; background: #fff; border-radius: 14px; padding: 10px 10px 10px 14px;
  border: 1px solid #e5e7eb;
  border: 1px solid color-mix(in srgb, var(--c) 22%, #e5e7eb);
  box-shadow: 0 4px 14px -8px rgba(0,0,0,.25);
  box-shadow: 0 4px 14px -8px color-mix(in srgb, var(--c) 55%, transparent);
  animation: poeIn .32s ease both; transition: box-shadow .2s ease, transform .2s ease;
  overflow: hidden;
}
.poe-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: var(--c);
  background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 40%, #fff));
}
.poe-card:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -10px rgba(0,0,0,.3); box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--c) 65%, transparent); }

.poe-name-row { display: grid; grid-template-columns: minmax(0,1fr) auto 32px; gap: 8px; align-items: center; margin-bottom: 10px; }
.poe-badge {
  font-size: 10.5px; font-weight: 800; padding: 4px 8px; border-radius: 999px; color: #fff;
  background: var(--c); white-space: nowrap; letter-spacing: .2px;
}
.poe-values { display: grid; gap: 8px; }
.poe-value-row {
  display: grid; gap: 6px; align-items: center; animation: poeRow .28s ease both;
  grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr) minmax(0,.8fr) 32px;
  grid-template-areas: 'label price mrp del';
}
.poe-value-row .f-label { grid-area: label; }
.poe-value-row .f-price { grid-area: price; }
.poe-value-row .f-mrp { grid-area: mrp; }
.poe-value-row .f-del { grid-area: del; }

.poe-input {
  width: 100%; min-width: 0; height: 36px; padding: 0 10px; font-size: 12px; font-family: inherit; color: #111827;
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px; outline: none;
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
}
.poe-input::placeholder { color: #9ca3af; }
.poe-input:hover { background: #fff; }
.poe-input:focus { background: #fff; border-color: var(--c); box-shadow: 0 0 0 3px rgba(99,102,241,.18); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
.poe-input.name { font-weight: 700; font-size: 12.5px; }
.poe-input.price:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.18); }
.poe-input.mrp:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.18); }
.poe-input[type=number]::-webkit-outer-spin-button, .poe-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.poe-input[type=number] { -moz-appearance: textfield; }

.poe-del {
  width: 32px; height: 32px; min-width: 32px; padding: 0; font-size: 13px; color: #ef4444;
  background: #fff1f2; border: 1px solid #fecdd3;
}
.poe-del:hover { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 6px 12px -6px rgba(239,68,68,.7); }
.poe-del.small { height: 36px; }

.poe-addval {
  width: 100%; padding: 9px; color: var(--c); font-size: 11.5px;
  background: #f8fafc; border: 1.5px dashed #cbd5e1;
  background: color-mix(in srgb, var(--c) 7%, #fff); border: 1.5px dashed color-mix(in srgb, var(--c) 45%, #fff);
}
.poe-addval:hover { background: #f1f5f9; background: color-mix(in srgb, var(--c) 14%, #fff); box-shadow: 0 6px 14px -8px var(--c); }

@media (max-width: 520px) {
  .poe { padding: 10px; border-radius: 14px; }
  .poe-add { width: 100%; padding: 9px 12px; }
  .poe-card { padding: 10px 8px 10px 12px; }
  .poe-value-row {
    grid-template-columns: minmax(0,1fr) minmax(0,1fr) 32px;
    grid-template-areas: 'label label del' 'price mrp .';
  }
}
@media (prefers-reduced-motion: reduce) {
  .poe, .poe-card, .poe-value-row { animation: none !important; }
  .poe-btn, .poe-input, .poe-card { transition: none !important; }
}
`;

const ProductOptionsEditor = ({ value = [], onChange, accent = '#6366f1' }) => {
  const rows = cleanRows(value.length ? value : [{ name: '', label: '', values: [] }]);

  const setRow = (index, patch) => onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const setValue = (rowIndex, valueIndex, patch) => setRow(rowIndex, { values: rows[rowIndex].values.map((v, i) => (i === valueIndex ? { ...v, ...patch } : v)) });
  const addValue = (rowIndex) => setRow(rowIndex, { values: [...rows[rowIndex].values, { label: '', value: '', price: '', oldPrice: '', isDefault: rows[rowIndex].values.length === 0 }] });

  return (
    <div className="poe" style={{ '--accent': accent }}>
      <style>{CSS}</style>

      <div className="poe-head">
        <div className="poe-title">
          <h4><FiTag style={{ color: '#ec4899' }} /> Product options with prices</h4>
          <p>Example: Weight → 500g ₹500, 1000g ₹1200. Customer price changes dynamically.</p>
        </div>
        <button type="button" className="poe-btn poe-add" onClick={() => onChange([...rows, { name: '', label: '', values: [] }])}>
          <FiPlus /> Add option
        </button>
      </div>

      <div className="poe-list">
        {rows.map((row, rowIndex) => {
          const color = PALETTE[rowIndex % PALETTE.length];
          return (
            <div key={rowIndex} className="poe-card" style={{ '--c': color }}>
              <div className="poe-name-row">
                <input
                  className="poe-input name"
                  value={row.name}
                  onChange={(e) => setRow(rowIndex, { name: e.target.value, label: e.target.value })}
                  placeholder="Option name e.g. Weight"
                />
                <span className="poe-badge">{row.values.length} {row.values.length === 1 ? 'value' : 'values'}</span>
                <button type="button" className="poe-btn poe-del" title="Remove option" aria-label="Remove option" onClick={() => onChange(rows.filter((_, i) => i !== rowIndex))}>
                  <FiTrash2 />
                </button>
              </div>

              <div className="poe-values">
                {row.values.map((v, valueIndex) => (
                  <div key={valueIndex} className="poe-value-row">
                    <input className="poe-input f-label" value={v.label} onChange={(e) => setValue(rowIndex, valueIndex, { label: e.target.value, value: e.target.value })} placeholder="500g" />
                    <input className="poe-input price f-price" type="number" inputMode="decimal" value={v.price} onChange={(e) => setValue(rowIndex, valueIndex, { price: e.target.value })} placeholder="Price ₹" />
                    <input className="poe-input mrp f-mrp" type="number" inputMode="decimal" value={v.oldPrice} onChange={(e) => setValue(rowIndex, valueIndex, { oldPrice: e.target.value })} placeholder="MRP ₹" />
                    <button type="button" className="poe-btn poe-del small f-del" title="Remove value" aria-label="Remove value" onClick={() => setRow(rowIndex, { values: row.values.filter((_, i) => i !== valueIndex) })}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button type="button" className="poe-btn poe-addval" onClick={() => addValue(rowIndex)}>
                  <FiPlus /> Add value and price
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductOptionsEditor;