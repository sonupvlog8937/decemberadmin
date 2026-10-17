import { useEffect, useState } from "react";
import { fetchDataFromApi, editData } from "../utils/api";
import OrderSoundNotifier from "../Components/OrderSoundNotifier";
import "../Components/ui-theme.css";

const CUSTOMER_FEES = [
  { key: "shippingFee",       label: "Shipping Fee (₹)",         ph: "50",  hint: "Fee charged for shipping",      color: "#6366f1" },
  { key: "deliveryFee",       label: "Delivery Fee (₹)",         ph: "30",  hint: "Fee charged for delivery",      color: "#0ea5e9" },
  { key: "freeShippingAbove", label: "Free Shipping Above (₹)",  ph: "500", hint: "Min order for FREE shipping",   color: "#10b981" },
];

const GO_MARKET_FEES = [
  { key: "goMarketShippingFee",       label: "Go Market Shipping Fee (₹)",       ph: "25", hint: "Flat shipping fee for Go Market orders",              color: "#f59e0b" },
  { key: "goMarketBaseDeliveryFee",   label: "Go Market Base Delivery Fee (₹)",  ph: "10", hint: "Starting delivery fee (added to distance-based fee)", color: "#f97316" },
  { key: "goMarketDeliveryFeePerKm",  label: "Go Market Delivery Fee / km (₹)",  ph: "8",  hint: "Per-kilometer delivery fee (Distance × Rate)",        color: "#ec4899" },
  { key: "goMarketRiderFeePerKm",     label: "Go Market Rider Fee / km (₹)",     ph: "6",  hint: "Per-kilometer rider earning for Go Market deliveries", color: "#8b5cf6" },
  { key: "goMarketRiderPickupFee",    label: "Go Market Rider Pickup Fee (₹)",   ph: "10", hint: "Flat pickup earning added to rider delivery earning",  color: "#14b8a6" },
];

const CommerceSettings = () => {
  const [form, setForm] = useState({
    shippingFee: 0,
    deliveryFee: 0,
    freeShippingAbove: 0,
    goMarketShippingFee: 0,
    goMarketBaseDeliveryFee: 0,
    goMarketDeliveryFeePerKm: 0,
    goMarketRiderFeePerKm: 0,
    goMarketRiderPickupFee: 0,
    firstOrderFreeDelivery: true,
    collections: [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchDataFromApi("/api/settings/commerce").then((res) => {
      if (res?.data) {
        setForm({
          ...res.data,
          collections: res.data.collections || [],
          firstOrderFreeDelivery: res.data.firstOrderFreeDelivery === true, // Strict check
        });
      }
    });
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateCollection = (index, patch) =>
    setForm((f) => ({
      ...f,
      collections: f.collections.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    console.log("💾 Saving commerce settings:", form);
    const result = await editData("/api/settings/commerce", form);
    console.log("✅ Save result:", result);
    const body = result?.data || result;
    if (body?.success || body?.error === false) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
    setSaving(false);
  };

  // plain render helper (not a component) so inputs never lose focus while typing
  const renderFee = (f, i) => (
    <div key={f.key} className="cs-field" style={{ "--fc": f.color, "--i": i }}>
      <label>{f.label}</label>
      <input
        type="number"
        min="0"
        className="cs-input"
        value={form[f.key]}
        onChange={(e) => set(f.key, Number(e.target.value))}
        placeholder={f.ph}
      />
      <p className="cs-hint">{f.hint}</p>
    </div>
  );

  return (
    <form className="cs-page dx" onSubmit={save}>
      <div className="cs-hero">
        <h2>💰 Commerce Settings</h2>
        <p>Manage shipping fees, delivery fees, and free shipping threshold for your store.</p>
      </div>

      {/* Shipping & Delivery Fees */}
      <div className="cs-card" style={{ "--cc": "#6366f1", "--d": "0ms" }}>
        <div className="cs-card-head">
          <h3 className="cs-card-title"><span className="cs-chip-icon">📦</span> Shipping & Delivery</h3>
        </div>

        <div className="cs-sub">Customer fees</div>
        <div className="cs-grid">{CUSTOMER_FEES.map(renderFee)}</div>

        <div className="cs-sub">Go Market</div>
        <div className="cs-grid">{GO_MARKET_FEES.map(renderFee)}</div>

        <div className="cs-info">
          💡 <strong>Info:</strong> When order total ≥ "Free Shipping Above" amount, both
          shipping and delivery fees become FREE automatically.
        </div>

        {/* First Order Free Delivery Toggle */}
        <div className="cs-promo">
          <div>
            <h4>🎁 First Order Free Delivery</h4>
            <p>When enabled, customers won't pay shipping & delivery fees on their first order</p>
          </div>
          <label className="cs-switch">
            <input
              type="checkbox"
              checked={form.firstOrderFreeDelivery}
              onChange={(e) => set("firstOrderFreeDelivery", e.target.checked)}
            />
            <span className="cs-switch-track" />
            <span className="cs-switch-knob" />
          </label>
        </div>
      </div>

      {/* Dynamic Collections */}
      <div className="cs-card" style={{ "--cc": "#ec4899", "--d": "80ms" }}>
        <div className="cs-card-head">
          <h3 className="cs-card-title"><span className="cs-chip-icon">🎯</span> Dynamic Collections</h3>
          <button
            type="button"
            className="cs-btn-add"
            onClick={() =>
              set("collections", [
                ...form.collections,
                { title: "", type: "mixed", categoryId: "", image: "", isActive: true },
              ])
            }
          >
            + Add Collection
          </button>
        </div>

        <div className="cs-coll-list">
          {form.collections.map((c, i) => (
            <div key={i} className="cs-coll-row">
              <div>
                <label>Title</label>
                <input
                  className="cs-input"
                  placeholder="Collection name"
                  value={c.title}
                  onChange={(e) => updateCollection(i, { title: e.target.value })}
                />
              </div>

              <div>
                <label>Type</label>
                <select
                  className="cs-input"
                  value={c.type}
                  onChange={(e) => updateCollection(i, { type: e.target.value })}
                >
                  <option value="mixed">Mixed</option>
                  <option value="grocery">Grocery</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              <div>
                <label>Category ID</label>
                <input
                  className="cs-input"
                  placeholder="Optional"
                  value={c.categoryId}
                  onChange={(e) => updateCollection(i, { categoryId: e.target.value })}
                />
              </div>

              <div>
                <label>Image URL</label>
                <input
                  className="cs-input"
                  placeholder="https://..."
                  value={c.image}
                  onChange={(e) => updateCollection(i, { image: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="cs-btn-remove"
                onClick={() => set("collections", form.collections.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
          ))}

          {form.collections.length === 0 && (
            <div className="cs-empty">
              No collections added yet. Click "Add Collection" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Order Notification Sound */}
      <div className="cs-card" style={{ "--cc": "#f59e0b", "--d": "160ms" }}>
        <div className="cs-card-head">
          <h3 className="cs-card-title"><span className="cs-chip-icon">🔔</span> Order Notifications</h3>
        </div>
        <p className="cs-desc">
          Control sound alerts for new orders. Enable to get instant audio notifications when orders arrive.
        </p>
        <OrderSoundNotifier inline={true} />
      </div>

      {/* Save Button */}
      <button type="submit" disabled={saving} className={`cs-save${saved ? " saved" : ""}`}>
        {saving ? (
          <><span className="cs-spinner" /> Saving...</>
        ) : saved ? (
          "✓ Saved"
        ) : (
          "💾 Save Settings"
        )}
      </button>
    </form>
  );
};

export default CommerceSettings;