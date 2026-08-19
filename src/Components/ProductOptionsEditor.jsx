import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

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

const ProductOptionsEditor = ({ value = [], onChange, accent = '#111827' }) => {
  const rows = cleanRows(value.length ? value : [{ name: '', label: '', values: [] }]);

       const setRow = (index, patch) => onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const setValue = (rowIndex, valueIndex, patch) => setRow(rowIndex, { values: rows[rowIndex].values.map((v, i) => (i === valueIndex ? { ...v, ...patch } : v)) });
  const addValue = (rowIndex) => setRow(rowIndex, { values: [...rows[rowIndex].values, { label: '', value: '', price: '', oldPrice: '', isDefault: rows[rowIndex].values.length === 0 }] });
  const inputStyle = { width: '100%', height: 42, border: '1px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box', minWidth: 0 };
  return <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fafafa', maxWidth: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 12 }}>
      <div style={{ minWidth: 0, flex: '1 1 200px' }}><div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>Product options with prices</div><div style={{ fontSize: 12, color: '#6b7280' }}>Example: Weight → 500g ₹500, 1000g ₹1200. Customer price changes dynamically.</div></div>
      <button type="button" onClick={() => onChange([...rows, { name: '', label: '', values: [] }])} style={{ flexShrink: 0, border: 'none', borderRadius: 10, background: accent, color: '#fff', padding: '8px 10px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}><FiPlus /> Add option</button>
    </div>
    <div style={{ display: 'grid', gap: 14 }}>
      {rows.map((row, rowIndex) => <div key={rowIndex} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, background: '#fff', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 32px', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input style={inputStyle} value={row.name} onChange={(e) => setRow(rowIndex, { name: e.target.value, label: e.target.value })} placeholder="Option name e.g. Weight" />
          <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== rowIndex))} style={{ width: 32, height: 32, minWidth: 32, padding: 0, borderRadius: 10, border: '1px solid #fee2e2', color: '#dc2626', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }} title="Remove option"><FiTrash2 /></button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {row.values.map((v, valueIndex) => <div key={valueIndex} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, .8fr) minmax(0, .8fr) 30px', gap: 6 }}>
            <input style={inputStyle} value={v.label} onChange={(e) => setValue(rowIndex, valueIndex, { label: e.target.value, value: e.target.value })} placeholder="500g" />
            <input style={inputStyle} type="number" value={v.price} onChange={(e) => setValue(rowIndex, valueIndex, { price: e.target.value })} placeholder="Price ₹" />
            <input style={inputStyle} type="number" value={v.oldPrice} onChange={(e) => setValue(rowIndex, valueIndex, { oldPrice: e.target.value })} placeholder="MRP ₹" />
            <button type="button" onClick={() => setRow(rowIndex, { values: row.values.filter((_, i) => i !== valueIndex) })} style={{ width: 30, height: 42, minWidth: 30, padding: 0, border: '1px solid #fee2e2', color: '#dc2626', background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, cursor: 'pointer' }}><FiTrash2 /></button>
          </div>)}
          <button type="button" onClick={() => addValue(rowIndex)} style={{ border: '1px dashed #cbd5e1', borderRadius: 10, background: '#f8fafc', padding: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>+ Add value and price</button>
        </div>
      </div>)}
    </div>
  </div>;
};

export default ProductOptionsEditor;