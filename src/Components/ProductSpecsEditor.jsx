import React from "react";

const PALETTE = ["#059669", "#6366f1", "#ec4899", "#f59e0b", "#0ea5e9", "#8b5cf6"];

const CSS = `
@keyframes pseIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pseRow { from { opacity: 0; transform: translateX(-8px) scale(.98); } to { opacity: 1; transform: translateX(0) scale(1); } }

.pse, .pse * { box-sizing: border-box; }
.pse {
  font-family: inherit; max-width: 100%; margin-bottom: 16px; padding: 12px; border-radius: 16px;
  background: linear-gradient(135deg, #ecfdf5 0%, #eff6ff 55%, #fdf4ff 100%);
  border: 1px solid #d1fae5; animation: pseIn .35s ease both;
}
.pse-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.pse-head label { font-size: 12.5px; font-weight: 800; color: #064e3b; display: flex; align-items: center; gap: 6px; }
.pse-head label::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #059669; background: linear-gradient(135deg, var(--accent), #ec4899); }
.pse-hint { margin: 0 0 10px; font-size: 11px; line-height: 1.4; color: #6b7280; }

.pse-add {
  border: none; cursor: pointer; flex-shrink: 0; white-space: nowrap; color: #fff; font-family: inherit;
  padding: 6px 12px; font-size: 11.5px; font-weight: 700; border-radius: 9px;
  background: #059669;
  background: linear-gradient(135deg, var(--accent), #0ea5e9);
  box-shadow: 0 6px 14px -6px rgba(5,150,105,.6);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.pse-add:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 10px 18px -8px rgba(14,165,233,.6); }
.pse-add:active { transform: scale(.95); }

.pse-row {
  display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr) 32px; gap: 6px; align-items: center;
  margin-bottom: 8px; padding: 6px 6px 6px 10px; background: #fff; border-radius: 12px;
  border: 1px solid #e5e7eb;
  border: 1px solid color-mix(in srgb, var(--c) 22%, #e5e7eb);
  border-left: 4px solid var(--c);
  box-shadow: 0 4px 12px -8px rgba(0,0,0,.25);
  box-shadow: 0 4px 12px -8px color-mix(in srgb, var(--c) 60%, transparent);
  animation: pseRow .28s ease both; transition: transform .2s ease, box-shadow .2s ease;
}
.pse-row:hover { transform: translateY(-1px); box-shadow: 0 8px 18px -10px rgba(0,0,0,.3); box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--c) 70%, transparent); }

.pse-input {
  width: 100%; min-width: 0; height: 34px; padding: 0 10px; font-size: 12px; font-family: inherit; color: #111827;
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 9px; outline: none;
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
}
.pse-input::placeholder { color: #9ca3af; }
.pse-input:hover { background: #fff; }
.pse-input:focus { background: #fff; border-color: var(--c); box-shadow: 0 0 0 3px rgba(5,150,105,.18); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
.pse-input.key { font-weight: 700; }

.pse-del {
  width: 32px; height: 32px; min-width: 32px; padding: 0; cursor: pointer; font-size: 15px; font-weight: 700; line-height: 1; font-family: inherit;
  color: #ef4444; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 9px;
  transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease;
}
.pse-del:hover { background: #ef4444; color: #fff; border-color: #ef4444; transform: rotate(90deg); box-shadow: 0 6px 12px -6px rgba(239,68,68,.7); }
.pse-del:active { transform: rotate(90deg) scale(.9); }

@media (max-width: 520px) {
  .pse { padding: 10px; border-radius: 14px; }
  .pse-add { width: 100%; padding: 8px 12px; }
  .pse-row { grid-template-columns: minmax(0,1fr) 32px; grid-template-areas: 'key del' 'val val'; }
  .pse-row .key { grid-area: key; }
  .pse-row .val { grid-area: val; }
  .pse-row .pse-del { grid-area: del; }
}
@media (prefers-reduced-motion: reduce) {
  .pse, .pse-row { animation: none !important; }
  .pse-add, .pse-del, .pse-input, .pse-row { transition: none !important; }
}
`;

const ProductSpecsEditor = ({ value = [], onChange, accent = "#059669" }) => {
  const rows = value?.length ? value : [{ key: "", value: "" }];

  const updateRow = (index, field, fieldValue) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [field]: fieldValue } : row));
    onChange(next);
  };

  const addRow = () => onChange([...rows, { key: "", value: "" }]);

  const removeRow = (index) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length ? next : [{ key: "", value: "" }]);
  };

  return (
    <div className="pse" style={{ "--accent": accent }}>
      <style>{CSS}</style>

      <div className="pse-head">
        <label>Specifications</label>
        <button type="button" className="pse-add" onClick={addRow}>
          + Add row
        </button>
      </div>
      <p className="pse-hint">
        Add details like weight, brand, ingredients, spice level, etc. Shown on the product page.
      </p>

      {rows.map((row, index) => (
        <div key={index} className="pse-row" style={{ "--c": PALETTE[index % PALETTE.length] }}>
          <input
            className="pse-input key"
            placeholder="Label (e.g. Weight)"
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
          />
          <input
            className="pse-input val"
            placeholder="Value (e.g. 500 g)"
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
          />
          <button
            type="button"
            className="pse-del"
            onClick={() => removeRow(index)}
            aria-label="Remove specification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductSpecsEditor;