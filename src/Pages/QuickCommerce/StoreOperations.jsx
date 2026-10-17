import React, { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaClipboardList,
  FaWallet,
  FaTachometerAlt,
  FaVolumeUp,
  FaVolumeMute,
  FaLockOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaRegCopy,
  FaSyncAlt,
  FaStore,
  FaUtensils,
} from "react-icons/fa";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";
import "../../Components/ui-theme.css";

const STORAGE_KEY = "orderSoundNotifications:v1";

const readSettings = () => {
  const fallback = { enabled: true, unlocked: false };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
};

const writeSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const playProfessionalOrderTone = (audioCtxRef) => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  const ctx = audioCtxRef.current || new AudioContextClass();
  audioCtxRef.current = ctx;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.28, now + 0.025);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
  master.connect(ctx.destination);

  const notes = [659.25, 880, 1174.66, 880];
  notes.forEach((freq, idx) => {
    const start = now + idx * 0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx === 2 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(idx === 2 ? 0.5 : 0.35, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + 0.32);
  });

  const sparkle = ctx.createOscillator();
  const sparkleGain = ctx.createGain();
  sparkle.type = "sine";
  sparkle.frequency.setValueAtTime(1760, now + 0.52);
  sparkleGain.gain.setValueAtTime(0.0001, now + 0.52);
  sparkleGain.gain.exponentialRampToValueAtTime(0.18, now + 0.56);
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  sparkle.connect(sparkleGain);
  sparkleGain.connect(master);
  sparkle.start(now + 0.52);
  sparkle.stop(now + 0.95);
  return true;
};

const StoreOperations = () => {
  const context = useContext(MyContext);
  const role = context?.userData?.role;
  const isGrocery = role === "GROCERY_SELLER";
  const isFixedDelivery = role === "GROCERY_SELLER" || role === "RESTAURANT_SELLER";
  const theme = isGrocery
    ? {
        primary: "#059669",
        secondary: "#0ea5e9",
        gradient: "linear-gradient(120deg, #059669 0%, #10b981 32%, #14b8a6 62%, #0ea5e9 100%)",
        title: "Grocery store operations",
        icon: <FaStore />,
      }
    : {
        primary: "#ea580c",
        secondary: "#ec4899",
        gradient: "linear-gradient(120deg, #ef4444 0%, #f97316 38%, #f59e0b 68%, #ec4899 100%)",
        title: "Restaurant kitchen operations",
        icon: <FaUtensils />,
      };

  const [outlet, setOutlet] = useState(null);
  const [kind, setKind] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    isOpen: true,
    deliveryMinutes: 15,
    minOrderValue: 99,
    avgPrepMinutes: 25,
  });
  const [soundSettings, setSoundSettings] = useState(() => readSettings());
  const [testPlaying, setTestPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const initialFormRef = useRef(null);

  const load = () => {
    setLoading(true);
    fetchDataFromApi("/api/user/seller/quick-commerce/outlet")
      .then((res) => {
        if (res?.outlet) {
          setOutlet(res.outlet);
          setKind(res.kind);
          const loaded = {
            isOpen: res.outlet.isOpen !== false,
            deliveryMinutes: res.outlet.deliveryMinutes ?? (isGrocery ? 15 : 30),
            minOrderValue: res.outlet.minOrderValue ?? (isGrocery ? 99 : 149),
            avgPrepMinutes: res.outlet.avgPrepMinutes ?? 25,
          };
          setForm(loaded);
          initialFormRef.current = loaded;
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [isGrocery]);

  useEffect(() => {
    writeSettings(soundSettings);
  }, [soundSettings]);

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(initialFormRef.current) !== JSON.stringify(form);
  }, [form]);

  const validate = () => {
    const errs = {};
    if (form.minOrderValue === "" || Number(form.minOrderValue) < 0) errs.minOrderValue = "Enter a valid amount";
    if (!isFixedDelivery) {
      const dm = Number(form.deliveryMinutes);
      if (form.deliveryMinutes === "" || dm < 0 || dm > 120) errs.deliveryMinutes = "Must be between 0–120 minutes";
    }
    if (!isGrocery) {
      const pm = Number(form.avgPrepMinutes);
      if (form.avgPrepMinutes === "" || pm < 5 || pm > 90) errs.avgPrepMinutes = "Must be between 5–90 minutes";
    }
    return errs;
  };

  const onFieldChange = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const save = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      context.alertBox("error", Object.values(errs)[0]);
      return;
    }
    setErrors({});
    setSaving(true);
    const payload = {
      isOpen: form.isOpen,
      minOrderValue: Number(form.minOrderValue),
    };
    if (!isFixedDelivery) payload.deliveryMinutes = Number(form.deliveryMinutes);
    if (!isGrocery) payload.avgPrepMinutes = Number(form.avgPrepMinutes);

    editData("/api/user/seller/quick-commerce/outlet", payload).then((res) => {
      const body = res?.data || res;
      if (body?.success || body?.error === false) {
        context.alertBox("success", body.message || "Settings saved");
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
        load();
      } else {
        context.alertBox("error", body?.message || "Could not save");
      }
    }).finally(() => setSaving(false));
  };

  const discardChanges = () => {
    if (initialFormRef.current) setForm(initialFormRef.current);
    setErrors({});
  };

  const toggleOpen = () => {
    const next = !form.isOpen;
    setForm((f) => ({ ...f, isOpen: next }));
    setSaving(true);
    editData("/api/user/seller/quick-commerce/outlet", { isOpen: next }).then((res) => {
      const body = res?.data || res;
      if (body?.success || body?.error === false) {
        context.alertBox("success", body.message || (next ? "Now accepting orders" : "Store paused"));
        load();
      }
    }).finally(() => setSaving(false));
  };

  const unlockAudio = useCallback(() => {
    playProfessionalOrderTone(audioCtxRef);
    setSoundSettings((prev) => ({ ...prev, unlocked: true, enabled: true }));
    toast.success("Order sound enabled");
  }, []);

  const toggleSoundEnabled = () => {
    setSoundSettings((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      if (next.enabled && !prev.unlocked) {
        setTimeout(unlockAudio, 0);
      }
      return next;
    });
  };

  const testSound = () => {
    playProfessionalOrderTone(audioCtxRef);
    setTestPlaying(true);
    setTimeout(() => setTestPlaying(false), 1000);
    toast.success("Test sound played");
  };

  const copyAddress = () => {
    if (!outlet?.address) return;
    navigator.clipboard?.writeText(outlet.address);
    toast.success("Address copied");
  };

  const quickLinks = [
    { to: "/products", label: isGrocery ? "Inventory" : "Menu", sub: `${(isGrocery ? outlet?.totalProducts : outlet?.totalItems) || 0} live`, icon: <FaBoxOpen size={15} />, color: "#6366f1" },
    { to: "/orders", label: "Orders", sub: "Live queue", icon: <FaClipboardList size={15} />, color: "#0ea5e9" },
    { to: "/wallet/transactions", label: "Wallet", sub: "Earnings", icon: <FaWallet size={15} />, color: "#f59e0b" },
    { to: "/", label: "Dashboard", sub: "Overview", icon: <FaTachometerAlt size={15} />, color: "#ec4899" },
  ];

  return (
    <div className="ops-root dx" style={{ "--accent": theme.primary, "--accent2": theme.secondary, "--hg": theme.gradient }}>
      {/* Hero */}
      <div className="ops-hero">
        <Link to="/" className="ops-hero-back">
          <FaArrowLeft size={11} /> Dashboard
        </Link>
        <div className="ops-hero-row">
          <div>
            <div className="ops-hero-tag">{theme.icon} {kind === "grocery" ? "Dark store" : "Kitchen"} settings</div>
            <h1 className="ops-hero-title">{theme.title}</h1>
            <p className="ops-hero-sub">{outlet?.name || "Manage delivery, availability and alerts"}</p>
          </div>
          <div className={`ops-hero-status${form.isOpen ? " on" : " off"}`}>
            <span className="ops-hero-dot" />
            {loading ? "Syncing…" : form.isOpen ? "Live" : "Paused"}
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="ops-quicklinks">
        {quickLinks.map((q, i) => (
          <Link key={q.to} to={q.to} className="ops-quicklink" style={{ "--ac": q.color, "--d": `${i * 50}ms` }}>
            <span className="ops-quicklink-icon">{q.icon}</span>
            <span>
              <div className="ops-quicklink-label">{q.label}</div>
              <div className="ops-quicklink-sub">{q.sub}</div>
            </span>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="ops-skel-wrap">
          <div className="ops-skel" style={{ height: 90 }} />
          <div className="ops-skel" style={{ height: 160 }} />
          <div className="ops-skel" style={{ height: 100 }} />
        </div>
      ) : (
        <>
          <div className="ops-card" style={{ "--cc": theme.primary, "--d": "0ms" }}>
            <div className="ops-toggle">
              <div>
                <div className="ops-toggle-title">{form.isOpen ? "Accepting orders" : "Paused"}</div>
                <div className="ops-toggle-sub">
                  {form.isOpen
                    ? "Customers can place orders on the app right now."
                    : "Your outlet is hidden from new orders until you resume."}
                </div>
              </div>
              <button
                type="button"
                className={`ops-switch ${form.isOpen ? "on" : "off"}`}
                onClick={toggleOpen}
                disabled={saving}
                aria-label="Toggle store open"
              >
                <span className="ops-switch-knob" />
              </button>
            </div>

            <div className="ops-grid">
              <div className="ops-field" style={{ "--fc": "#6366f1", "--i": 0 }}>
                <label>⏱️ Delivery promise (minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  disabled={isFixedDelivery}
                  value={isFixedDelivery ? 0 : form.deliveryMinutes}
                  onChange={onFieldChange("deliveryMinutes")}
                  className={errors.deliveryMinutes ? "has-error" : ""}
                />
                {errors.deliveryMinutes && <div className="ops-error"><FaExclamationCircle size={11} /> {errors.deliveryMinutes}</div>}
              </div>
              <div className="ops-field" style={{ "--fc": "#f59e0b", "--i": 1 }}>
                <label>🛒 Minimum order (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderValue}
                  onChange={onFieldChange("minOrderValue")}
                  className={errors.minOrderValue ? "has-error" : ""}
                />
                {errors.minOrderValue && <div className="ops-error"><FaExclamationCircle size={11} /> {errors.minOrderValue}</div>}
              </div>
              {!isGrocery && (
                <div className="ops-field" style={{ "--fc": "#ec4899", "--i": 2 }}>
                  <label>🍳 Average prep time (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={form.avgPrepMinutes}
                    onChange={onFieldChange("avgPrepMinutes")}
                    className={errors.avgPrepMinutes ? "has-error" : ""}
                  />
                  {errors.avgPrepMinutes && <div className="ops-error"><FaExclamationCircle size={11} /> {errors.avgPrepMinutes}</div>}
                </div>
              )}
            </div>

            {isFixedDelivery && (
              <p className="ops-info">
                Delivery promise is managed by the platform and cannot be changed from this panel.
              </p>
            )}
            <p className="ops-info">
              Tip: Keep delivery promise realistic — customers see this on checkout, similar to quick-commerce apps like Blinkit or Flipkart Minutes.
            </p>

            <div className="ops-save-row">
              {isDirty && (
                <button type="button" className="ops-discard" onClick={discardChanges} disabled={saving}>
                  Discard
                </button>
              )}
              <button type="button" className={`ops-save${saved ? " saved" : ""}`} onClick={save} disabled={saving}>
                {saving ? (
                  <span className="ops-btn-spinner" />
                ) : saved ? (
                  <><FaCheckCircle size={13} /> Saved</>
                ) : (
                  "Save delivery settings"
                )}
              </button>
            </div>
          </div>

          <div className="ops-card" style={{ "--cc": "#0ea5e9", "--d": "80ms" }}>
            <div className="ops-card-head-row">
              <div className="ops-card-title">📍 Outlet details</div>
              {isDirty && <span className="ops-dirty-dot" title="Unsaved changes" />}
            </div>
            <div className="ops-detail-row">
              <strong>Address:</strong>
              <span>{outlet?.address || "—"}</span>
              {outlet?.address && (
                <button type="button" className="ops-copy-btn" onClick={copyAddress} aria-label="Copy address">
                  <FaRegCopy size={11} />
                </button>
              )}
            </div>
            <div className="ops-detail-row">
              <strong>Catalog:</strong>
              <span>{isGrocery ? `${outlet?.totalProducts || 0} products` : `${outlet?.totalItems || 0} menu items`}</span>
            </div>
          </div>

          <div className="ops-card" style={{ "--cc": "#8b5cf6", "--d": "160ms", "--ac": "#8b5cf6" }}>
            <div className="ops-card-head-row" style={{ paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`ops-sound-icon${testPlaying ? " playing" : ""}`}>
                  {soundSettings.enabled ? <FaVolumeUp size={15} /> : <FaVolumeMute size={15} />}
                </span>
                <div>
                  <div className="ops-card-title">New order sound notifications</div>
                  <div className="ops-card-sub">
                    {soundSettings.enabled ? "Sound notifications are ON" : "Sound notifications are OFF"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`ops-switch ${soundSettings.enabled ? "on" : "off"}`}
                onClick={toggleSoundEnabled}
                aria-label="Toggle sound notifications"
              >
                <span className="ops-switch-knob" />
              </button>
            </div>

            <div className="ops-sound-actions">
              <button type="button" onClick={testSound} className="ops-btn-ghost">
                <FaVolumeUp size={12} /> Test sound
              </button>
              {soundSettings.enabled && !soundSettings.unlocked && (
                <button type="button" onClick={unlockAudio} className="ops-btn-solid">
                  <FaLockOpen size={12} /> Enable sound
                </button>
              )}
            </div>

            <div className="ops-info">
              ℹ️ <strong>Tip:</strong> Enable notifications to get a sound alert whenever a new order arrives. This helps you respond quickly to customer orders.
            </div>
          </div>
        </>
      )}

      {/* Mobile sticky save bar */}
      {!loading && isDirty && (
        <div className="ops-sticky-bar">
          <div className="ops-sticky-inner">
            <span className="ops-sticky-label"><FaSyncAlt size={11} /> Unsaved changes</span>
            <button type="button" className="ops-sticky-save" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOperations;