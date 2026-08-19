import React from "react";

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
    <div style={{ marginBottom: 16, maxWidth: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Specifications</label>
        <button
          type="button"
          onClick={addRow}
          style={{
            border: `1px solid ${accent}`,
            color: accent,
            background: "#fff",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          + Add row
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px" }}>
        Add details like weight, brand, ingredients, spice level, etc. Shown on the product page.
      </p>
      {rows.map((row, index) => (
        <div key={index} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) 34px", gap: 6, marginBottom: 8 }}>
          <input
            placeholder="Label (e.g. Weight)"
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 10px", fontSize: 13, minWidth: 0, boxSizing: "border-box", width: "100%" }}
          />
          <input
            placeholder="Value (e.g. 500 g)"
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 10px", fontSize: 13, minWidth: 0, boxSizing: "border-box", width: "100%" }}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            style={{
              border: "1px solid #fecaca",
              background: "#fff",
              color: "#dc2626",
              borderRadius: 10,
              width: 34,
              minWidth: 34,
              padding: 0,
              cursor: "pointer",
              fontWeight: 700,
            }}
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