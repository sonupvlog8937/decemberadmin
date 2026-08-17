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
        dark: "#047857",
        darker: "#065f46",
        bg: "#ecfdf5",
        title: "Grocery store operations",
        icon: <FaStore />,
      }
    : {
        primary: "#ea580c",
        dark: "#c2410c",
        darker: "#7c2d12",
        bg: "#fff7ed",
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
    { to: "/products", label: isGrocery ? "Inventory" : "Menu", sub: `${(isGrocery ? outlet?.totalProducts : outlet?.totalItems) || 0} live`, icon: <FaBoxOpen size={16} /> },
    { to: "/orders", label: "Orders", sub: "Live queue", icon: <FaClipboardList size={16} /> },
    { to: "/wallet/transactions", label: "Wallet", sub: "Earnings", icon: <FaWallet size={16} /> },
    { to: "/", label: "Dashboard", sub: "Overview", icon: <FaTachometerAlt size={16} /> },
  ];

  return (
    <div className="ops-root" style={{ "--accent": theme.primary, "--accent-soft": `${theme.primary}1F`, "--accent-ring": `${theme.primary}33` }}>
      <style>{STORE_OPS_STYLES}</style>

      {/* Hero */}
      <div className="ops-hero" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.dark} 55%, ${theme.darker} 100%)` }}>
        <Link to="/" className="ops-hero-back">
          <FaArrowLeft size={12} /> Dashboard
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
        {quickLinks.map((q) => (
          <Link key={q.to} to={q.to} className="ops-quicklink">
            <span className="ops-quicklink-icon" style={{ background: `${theme.primary}14`, color: theme.primary }}>{q.icon}</span>
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
          <div className="ops-card">
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
              <div className="ops-field">
                <label>Delivery promise (minutes)</label>
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
              <div className="ops-field">
                <label>Minimum order (₹)</label>
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
                <div className="ops-field">
                  <label>Average prep time (minutes)</label>
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
                  <><FaCheckCircle size={14} /> Saved</>
                ) : (
                  "Save delivery settings"
                )}
              </button>
            </div>
          </div>

          <div className="ops-card">
            <div className="ops-card-head-row">
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Outlet details</div>
              {isDirty && <span className="ops-dirty-dot" title="Unsaved changes" />}
            </div>
            <div className="ops-detail-row">
              <strong>Address:</strong>
              <span>{outlet?.address || "—"}</span>
              {outlet?.address && (
                <button type="button" className="ops-copy-btn" onClick={copyAddress} aria-label="Copy address">
                  <FaRegCopy size={12} />
                </button>
              )}
            </div>
            <div className="ops-detail-row" style={{ marginTop: 8 }}>
              <strong>Catalog:</strong>
              <span>{isGrocery ? `${outlet?.totalProducts || 0} products` : `${outlet?.totalItems || 0} menu items`}</span>
            </div>
          </div>

          <div className="ops-card">
            <div className="ops-card-head-row" style={{ paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`ops-sound-icon${testPlaying ? " playing" : ""}`}>
                  {soundSettings.enabled ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>New order sound notifications</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
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
                <FaVolumeUp size={13} /> Test sound
              </button>
              {soundSettings.enabled && !soundSettings.unlocked && (
                <button type="button" onClick={unlockAudio} className="ops-btn-solid">
                  <FaLockOpen size={13} /> Enable sound
                </button>
              )}
            </div>

            <div className="ops-info" style={{ marginTop: 12 }}>
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

const STORE_OPS_STYLES = `
@keyframes opsFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes opsPop { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
@keyframes opsShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
@keyframes opsSpin { to { transform: rotate(360deg); } }
@keyframes opsPulseDot { 0%,100% { box-shadow:0 0 0 0 var(--accent-ring); } 50% { box-shadow:0 0 0 6px transparent; } }
@keyframes opsRing { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
@keyframes opsSlideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }

.ops-root { padding-bottom: 24px; }

.ops-hero { position:relative; overflow:hidden; border-radius:20px; padding:22px 22px 20px; margin-bottom:16px; color:#fff; animation: opsFadeUp .4s ease both; }
.ops-hero::before { content:""; position:absolute; inset:0; background: radial-gradient(circle at 85% 15%, rgba(255,255,255,.18), transparent 55%); pointer-events:none; }
.ops-hero-back { position:relative; z-index:1; display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:rgba(255,255,255,.9); text-decoration:none; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.25); padding:6px 12px; border-radius:999px; transition: background .18s ease, transform .15s ease; }
.ops-hero-back:hover { background:rgba(255,255,255,.24); transform: translateX(-2px); }
.ops-hero-row { position:relative; z-index:1; display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-top:16px; flex-wrap:wrap; }
.ops-hero-tag { font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; opacity:.85; display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.ops-hero-title { font-size:clamp(19px,3vw,25px); font-weight:800; margin:0 0 4px; }
.ops-hero-sub { font-size:13px; opacity:.9; margin:0; }
.ops-hero-status { display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border-radius:999px; font-size:12px; font-weight:700; flex-shrink:0; }
.ops-hero-status.on { background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); }
.ops-hero-status.off { background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.2); }
.ops-hero-dot { width:8px; height:8px; border-radius:50%; background: currentColor; animation: opsPulseDot 1.6s ease infinite; }
.ops-hero-status.on .ops-hero-dot { background:#86efac; }
.ops-hero-status.off .ops-hero-dot { background:#fca5a5; }

.ops-quicklinks { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:20px; }
.ops-quicklink { display:flex; align-items:center; gap:10px; background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:12px 14px; text-decoration:none; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; animation: opsPop .35s ease both; }
.ops-quicklink:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -10px rgba(0,0,0,.15); border-color: var(--accent); }
.ops-quicklink:active { transform: translateY(0) scale(.98); }
.ops-quicklink-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ops-quicklink-label { font-size:13px; font-weight:700; color:#0f172a; }
.ops-quicklink-sub { font-size:11px; color:#64748b; margin-top:1px; }

.ops-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin-bottom:16px; animation: opsFadeUp .4s ease both; }
.ops-card-head-row { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom: 4px; }
.ops-dirty-dot { width:8px; height:8px; border-radius:50%; background: var(--accent); animation: opsPulseDot 1.6s ease infinite; }

.ops-toggle { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px; border-radius:14px; background: var(--accent-soft); border:1px solid var(--accent-ring); }
.ops-toggle-title { font-size:16px; font-weight:700; color:#0f172a; }
.ops-toggle-sub { font-size:12px; color:#64748b; margin-top:4px; }

.ops-switch { width:52px; height:30px; border-radius:999px; border:none; cursor:pointer; position:relative; transition: background .25s ease; flex-shrink:0; }
.ops-switch.on { background: var(--accent); }
.ops-switch.off { background:#cbd5e1; }
.ops-switch:disabled { opacity:.7; cursor:not-allowed; }
.ops-switch-knob { position:absolute; top:3px; left:3px; width:24px; height:24px; border-radius:50%; background:#fff; transition: left .25s cubic-bezier(.4,0,.2,1); box-shadow:0 1px 4px rgba(0,0,0,.25); }
.ops-switch.on .ops-switch-knob { left:25px; }

.ops-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-top:16px; }
.ops-field label { display:block; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
.ops-field input { width:100%; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; font-size:14px; box-sizing:border-box; outline:none; transition: border-color .18s ease, box-shadow .18s ease; }
.ops-field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
.ops-field input:disabled { background:#f8fafc; color:#94a3b8; }
.ops-field input.has-error { border-color:#dc2626; background:#fef2f2; }
.ops-error { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#dc2626; margin-top:6px; animation: opsPop .2s ease both; }

.ops-info { font-size:12px; color:#64748b; line-height:1.6; margin-top:12px; }

.ops-save-row { display:flex; gap:10px; margin-top:18px; }
.ops-save { flex:1; background: var(--accent); color:#fff; border:none; border-radius:10px; padding:12px 20px; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition: filter .18s ease, transform .1s ease, background .3s ease; }
.ops-save:hover:not(:disabled) { filter:brightness(1.06); }
.ops-save:active:not(:disabled) { transform: scale(.98); }
.ops-save:disabled { opacity:.7; cursor:not-allowed; }
.ops-save.saved { background:#059669; }
.ops-discard { background:#fff; border:1px solid #e2e8f0; color:#475569; border-radius:10px; padding:12px 16px; font-size:13px; font-weight:700; cursor:pointer; transition: all .15s ease; }
.ops-discard:hover { border-color:#cbd5e1; background:#f8fafc; }
.ops-btn-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation: opsSpin .7s linear infinite; }

.ops-detail-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; flex-wrap:wrap; }
.ops-copy-btn { border:1px solid #e2e8f0; background:#fff; color:#64748b; width:24px; height:24px; border-radius:7px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition: all .15s ease; }
.ops-copy-btn:hover { border-color: var(--accent); color: var(--accent); }

.ops-sound-icon { width:34px; height:34px; border-radius:10px; background: var(--accent-soft); color: var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ops-sound-icon.playing { animation: opsRing .35s ease 2; }
.ops-sound-actions { display:flex; gap:10px; margin-top:16px; }
.ops-btn-ghost, .ops-btn-solid { flex:1; border-radius:10px; padding:10px 16px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition: all .18s ease; }
.ops-btn-ghost { background:#f1f5f9; border:1px solid #e2e8f0; color:#475569; }
.ops-btn-ghost:hover { background:#e2e8f0; border-color:#cbd5e1; }
.ops-btn-solid { background: var(--accent); border:none; color:#fff; }
.ops-btn-solid:hover { filter:brightness(1.06); }
.ops-btn-ghost:active, .ops-btn-solid:active { transform: scale(.97); }

.ops-skel-wrap { display:flex; flex-direction:column; gap:16px; }
.ops-skel { border-radius:16px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 37%,#f1f5f9 63%); background-size:400px 100%; animation: opsShimmer 1.3s ease infinite; }

.ops-sticky-bar { position: sticky; bottom:0; margin-top:8px; padding:12px 4px calc(12px + env(safe-area-inset-bottom)); background: rgba(255,255,255,.94); backdrop-filter: blur(8px); border-top:1px solid #e2e8f0; animation: opsSlideUp .3s ease both; display:none; }
.ops-sticky-inner { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.ops-sticky-label { font-size:12px; font-weight:700; color:#64748b; display:flex; align-items:center; gap:6px; }
.ops-sticky-save { background: var(--accent); color:#fff; border:none; border-radius:10px; padding:10px 22px; font-size:13px; font-weight:700; cursor:pointer; }
.ops-sticky-save:disabled { opacity:.7; }

@media (max-width: 640px) {
  .ops-hero { padding:18px 16px; border-radius:16px; }
  .ops-hero-row { margin-top: 14px; }
  .ops-card { padding:16px; border-radius:14px; }
  .ops-grid { grid-template-columns: 1fr; }
  .ops-quicklinks { grid-template-columns: repeat(2, 1fr); }
  .ops-save-row { flex-direction: column-reverse; }
  .ops-sound-actions { flex-direction: column; }
  .ops-sticky-bar { display:block; }
}

@media (prefers-reduced-motion: reduce) {
  .ops-hero, .ops-card, .ops-quicklink, .ops-error, .ops-hero-dot, .ops-dirty-dot, .ops-sound-icon.playing, .ops-skel, .ops-btn-spinner, .ops-sticky-bar { animation: none !important; }
  .ops-switch-knob, .ops-quicklink, .ops-save, .ops-copy-btn { transition: none !important; }
}
`;

export default StoreOperations;