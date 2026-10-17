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

/* ─────────────────────────────────────────────
   Colorful + smooth + compact-font styles
   (.ops-root.dx prefix => ui-theme.css ko override karta hai)
───────────────────────────────────────────── */
const OPS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.ops-root.dx {
  --indigo:#6366f1; --violet:#8b5cf6; --pink:#ec4899; --amber:#f59e0b; --emerald:#10b981; --sky:#0ea5e9; --rose:#f43f5e;
  --ink:#1e1b3a; --muted:#8b8fa8; --line:#ececf6;
  --ease:cubic-bezier(.22,1,.36,1); --spring:cubic-bezier(.34,1.45,.64,1);
  font-family:'DM Sans',sans-serif; font-size:12px; color:var(--ink);
  max-width:860px; margin:0 auto; padding:4px 2px 80px;
}
.ops-root.dx *, .ops-root.dx *::before, .ops-root.dx *::after { box-sizing:border-box; }
@media (prefers-reduced-motion: reduce){ .ops-root.dx *{ animation-duration:.01ms !important; transition-duration:.01ms !important; } }
@keyframes opsIn { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} }
@keyframes opsFlow { 0%,100%{background-position:0 50%} 50%{background-position:100% 50%} }
@keyframes opsPulse { 0%,100%{transform:scale(1); opacity:1} 50%{transform:scale(1.5); opacity:.5} }
@keyframes opsSpin { to{ transform:rotate(360deg) } }
@keyframes opsShimmer { from{background-position:200% 0} to{background-position:-200% 0} }
@keyframes opsRing { 0%{box-shadow:0 0 0 0 rgba(139,92,246,.5)} 100%{box-shadow:0 0 0 14px rgba(139,92,246,0)} }

/* Hero */
.ops-root.dx .ops-hero {
  position:relative; overflow:hidden; padding:18px 20px 20px; margin-bottom:14px; border-radius:22px; color:#fff;
  background:var(--hg); background-size:180% 180%; animation:opsFlow 9s ease-in-out infinite, opsIn .6s var(--ease) both;
  box-shadow:0 18px 40px -16px var(--accent);
}
.ops-root.dx .ops-hero::before { content:''; position:absolute; right:-60px; top:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.16); }
.ops-root.dx .ops-hero::after  { content:''; position:absolute; left:-40px; bottom:-70px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,.1); }
.ops-root.dx .ops-hero-back { position:relative; z-index:1; display:inline-flex; align-items:center; gap:6px; padding:4px 11px; margin-bottom:12px; border-radius:99px; font-size:10.5px; font-weight:700; color:#fff; text-decoration:none; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3); transition:transform .2s var(--spring), background .2s; }
.ops-root.dx .ops-hero-back:hover { background:rgba(255,255,255,.34); transform:translateX(-3px); }
.ops-root.dx .ops-hero-row { position:relative; z-index:1; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.ops-root.dx .ops-hero-tag { display:inline-flex; align-items:center; gap:6px; margin-bottom:6px; padding:3px 10px; border-radius:99px; font-size:10.5px; font-weight:700; background:rgba(255,255,255,.2); }
.ops-root.dx .ops-hero-title { margin:0 0 3px; font-family:'Sora',sans-serif; font-size:19px; font-weight:800; letter-spacing:-.02em; color:#fff; }
.ops-root.dx .ops-hero-sub { margin:0; font-size:11.5px; font-weight:500; color:rgba(255,255,255,.85); }
.ops-root.dx .ops-hero-status { display:inline-flex; align-items:center; gap:7px; padding:6px 14px; border-radius:99px; font-size:11px; font-weight:800; background:rgba(255,255,255,.95); }
.ops-root.dx .ops-hero-status.on  { color:#047857; }
.ops-root.dx .ops-hero-status.off { color:#be123c; }
.ops-root.dx .ops-hero-dot { width:8px; height:8px; border-radius:50%; background:currentColor; animation:opsPulse 1.8s ease-in-out infinite; }

/* Quick links */
.ops-root.dx .ops-quicklinks { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
@media (max-width:640px){ .ops-root.dx .ops-quicklinks { grid-template-columns:repeat(2,1fr); } }
.ops-root.dx .ops-quicklink {
  position:relative; overflow:hidden; display:flex; align-items:center; gap:10px; padding:11px 12px; text-decoration:none; color:var(--ink);
  background:#fff; border:1px solid var(--line); border-radius:16px;
  animation:opsIn .5s var(--ease) both; animation-delay:var(--d);
  transition:transform .3s var(--spring), box-shadow .3s, border-color .2s;
}
.ops-root.dx .ops-quicklink::after { content:''; position:absolute; right:-20px; top:-20px; width:60px; height:60px; border-radius:50%; background:var(--ac); opacity:.1; transition:transform .45s var(--ease); }
.ops-root.dx .ops-quicklink:hover { transform:translateY(-4px); border-color:var(--ac); box-shadow:0 12px 24px -10px var(--ac); }
.ops-root.dx .ops-quicklink:hover::after { transform:scale(2.4); }
.ops-root.dx .ops-quicklink-icon { position:relative; z-index:1; width:32px; height:32px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:10px; color:#fff; background:var(--ac); box-shadow:0 6px 14px -4px var(--ac); transition:transform .3s var(--spring); }
.ops-root.dx .ops-quicklink:hover .ops-quicklink-icon { transform:rotate(-8deg) scale(1.12); }
.ops-root.dx .ops-quicklink-label { font-size:12px; font-weight:700; }
.ops-root.dx .ops-quicklink-sub { font-size:10px; color:var(--muted); font-weight:500; }

/* Skeleton */
.ops-root.dx .ops-skel-wrap { display:grid; gap:12px; }
.ops-root.dx .ops-skel { border-radius:18px; background:linear-gradient(90deg,#f1f0fb 25%,#fbe9f5 50%,#f1f0fb 75%); background-size:300% 100%; animation:opsShimmer 1.6s linear infinite; }

/* Cards */
.ops-root.dx .ops-card {
  position:relative; overflow:hidden; margin-bottom:14px; padding:16px 18px; background:#fff;
  border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 30px -18px var(--cc);
  animation:opsIn .55s var(--ease) both; animation-delay:var(--d);
}
.ops-root.dx .ops-card::before { content:''; position:absolute; left:0; top:0; right:0; height:3px; background:linear-gradient(90deg,var(--cc),var(--pink)); }
.ops-root.dx .ops-card-head-row { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
.ops-root.dx .ops-card-title { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; }
.ops-root.dx .ops-card-sub { margin-top:1px; font-size:10.5px; color:var(--muted); }
.ops-root.dx .ops-dirty-dot { width:9px; height:9px; border-radius:50%; background:var(--amber); animation:opsPulse 1.5s ease-in-out infinite; }

/* Toggle */
.ops-root.dx .ops-toggle { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:14px; padding:12px 14px; border-radius:14px; background:linear-gradient(135deg,#ecfdf5,#eff6ff); border:1px solid #d1fae5; }
.ops-root.dx .ops-toggle-title { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; }
.ops-root.dx .ops-toggle-sub { margin-top:2px; font-size:10.5px; color:#5b6086; line-height:1.4; }
.ops-root.dx .ops-switch { position:relative; width:46px; height:26px; flex-shrink:0; padding:0; border:none; border-radius:99px; cursor:pointer; background:#d6d8ea; transition:background .3s, box-shadow .3s; }
.ops-root.dx .ops-switch.on { background:linear-gradient(135deg,var(--emerald),var(--sky)); box-shadow:0 6px 14px -4px var(--emerald); }
.ops-root.dx .ops-switch:disabled { opacity:.6; cursor:not-allowed; }
.ops-root.dx .ops-switch-knob { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 2px 6px rgba(0,0,0,.22); transition:transform .35s var(--spring); }
.ops-root.dx .ops-switch.on .ops-switch-knob { transform:translateX(20px); }

/* Fields */
.ops-root.dx .ops-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }
.ops-root.dx .ops-field { padding:11px 12px; border-radius:14px; background:#fafaff; border:1px solid var(--line); border-top:3px solid var(--fc); animation:opsIn .5s var(--ease) both; animation-delay:calc(var(--i) * 70ms + 120ms); transition:transform .25s var(--spring), box-shadow .25s; }
.ops-root.dx .ops-field:focus-within { transform:translateY(-2px); box-shadow:0 10px 22px -12px var(--fc); background:#fff; }
.ops-root.dx .ops-field label { display:block; margin-bottom:6px; font-size:10.5px; font-weight:700; color:#4b5280; }
.ops-root.dx .ops-field input { width:100%; padding:8px 10px; font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:700; color:var(--ink); background:#fff; border:1.5px solid #e3e5f5; border-radius:10px; outline:none; transition:border-color .2s, box-shadow .2s; }
.ops-root.dx .ops-field input:focus { border-color:var(--fc); box-shadow:0 0 0 4px color-mix(in srgb, var(--fc) 18%, transparent); }
.ops-root.dx .ops-field input:disabled { color:var(--muted); background:#f3f3fa; cursor:not-allowed; }
.ops-root.dx .ops-field input.has-error { border-color:var(--rose); box-shadow:0 0 0 4px rgba(244,63,94,.12); }
.ops-root.dx .ops-error { display:flex; align-items:center; gap:5px; margin-top:6px; font-size:10.5px; font-weight:600; color:var(--rose); animation:opsIn .25s var(--ease) both; }

.ops-root.dx .ops-info { margin:12px 0 0; padding:9px 12px; font-size:10.5px; line-height:1.5; color:#92400e; background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1px solid #fde68a; border-radius:12px; }

/* Buttons */
.ops-root.dx .ops-save-row { display:flex; justify-content:flex-end; gap:8px; margin-top:14px; }
.ops-root.dx .ops-save, .ops-root.dx .ops-sticky-save {
  min-width:130px; height:38px; padding:0 18px; display:inline-flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:12px; cursor:pointer;
  font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; color:#fff;
  background:linear-gradient(135deg,var(--accent),var(--accent2),var(--pink)); background-size:170% 100%;
  box-shadow:0 8px 20px -8px var(--accent); transition:transform .25s var(--spring), box-shadow .25s, background-position .5s;
}
.ops-root.dx .ops-save:hover:not(:disabled), .ops-root.dx .ops-sticky-save:hover:not(:disabled) { transform:translateY(-2px); background-position:100% 0; box-shadow:0 12px 26px -8px var(--accent); }
.ops-root.dx .ops-save:active { transform:scale(.97); }
.ops-root.dx .ops-save:disabled, .ops-root.dx .ops-sticky-save:disabled { opacity:.7; cursor:not-allowed; }
.ops-root.dx .ops-save.saved { background:linear-gradient(135deg,#059669,#10b981); animation:opsRing .8s ease-out; }
.ops-root.dx .ops-btn-spinner { width:15px; height:15px; border-radius:50%; border:2px solid rgba(255,255,255,.45); border-top-color:#fff; animation:opsSpin .7s linear infinite; }
.ops-root.dx .ops-discard { height:38px; padding:0 16px; border-radius:12px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; color:#6b7094; background:#f1f2fb; border:1px solid #e3e5f5; animation:opsIn .25s var(--ease) both; transition:background .15s, transform .2s var(--spring); }
.ops-root.dx .ops-discard:hover { background:#e6e7f7; transform:translateY(-1px); }

/* Details */
.ops-root.dx .ops-detail-row { display:flex; align-items:center; gap:8px; padding:8px 0; font-size:11.5px; border-bottom:1px dashed #e8e6f8; }
.ops-root.dx .ops-detail-row:last-child { border-bottom:none; }
.ops-root.dx .ops-detail-row strong { min-width:60px; font-size:10.5px; color:var(--sky); }
.ops-root.dx .ops-detail-row span { flex:1; color:#3b3f63; font-weight:500; }
.ops-root.dx .ops-copy-btn { width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center; border:none; border-radius:8px; cursor:pointer; color:var(--sky); background:#e0f2fe; transition:transform .2s var(--spring), background .15s, color .15s; }
.ops-root.dx .ops-copy-btn:hover { color:#fff; background:var(--sky); transform:scale(1.15); }

/* Sound */
.ops-root.dx .ops-sound-icon { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:11px; color:#fff; background:linear-gradient(135deg,var(--violet),var(--pink)); box-shadow:0 8px 16px -6px var(--violet); transition:transform .3s var(--spring); }
.ops-root.dx .ops-sound-icon.playing { animation:opsRing .9s ease-out infinite; transform:scale(1.1); }
.ops-root.dx .ops-sound-actions { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0 4px; }
.ops-root.dx .ops-btn-ghost, .ops-root.dx .ops-btn-solid { height:34px; padding:0 14px; display:inline-flex; align-items:center; gap:6px; border-radius:99px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:700; transition:transform .25s var(--spring), box-shadow .25s; }
.ops-root.dx .ops-btn-ghost { color:#6d28d9; background:#f5f3ff; border:1px solid #ddd6fe; }
.ops-root.dx .ops-btn-ghost:hover { transform:translateY(-2px); box-shadow:0 8px 16px -8px var(--violet); }
.ops-root.dx .ops-btn-solid { color:#fff; border:none; background:linear-gradient(135deg,var(--amber),var(--pink)); box-shadow:0 8px 18px -8px var(--pink); }
.ops-root.dx .ops-btn-solid:hover { transform:translateY(-2px); }

/* Sticky save bar */
.ops-root.dx .ops-sticky-bar { position:fixed; left:0; right:0; bottom:0; z-index:50; padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px)); animation:opsIn .35s var(--spring) both; }
.ops-root.dx .ops-sticky-inner { max-width:560px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 10px 9px 16px; border-radius:18px; color:#fff; background:linear-gradient(120deg,#1e1b4b,#4c1d95,#9d174d); box-shadow:0 18px 40px -10px rgba(76,29,149,.6); }
.ops-root.dx .ops-sticky-label { display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700; }
.ops-root.dx .ops-sticky-label svg { animation:opsSpin 2.4s linear infinite; }
.ops-root.dx .ops-sticky-save { min-width:80px; height:34px; background:#fff; color:#6d28d9; box-shadow:none; }
.ops-root.dx .ops-sticky-save:hover:not(:disabled) { background:#fff; box-shadow:0 8px 18px -6px rgba(255,255,255,.5); }
`;

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
    { to: "/products", label: isGrocery ? "Inventory" : "Menu", sub: `${(isGrocery ? outlet?.totalProducts : outlet?.totalItems) || 0} live`, icon: <FaBoxOpen size={14} />, color: "#6366f1" },
    { to: "/orders", label: "Orders", sub: "Live queue", icon: <FaClipboardList size={14} />, color: "#0ea5e9" },
    { to: "/wallet/transactions", label: "Wallet", sub: "Earnings", icon: <FaWallet size={14} />, color: "#f59e0b" },
    { to: "/", label: "Dashboard", sub: "Overview", icon: <FaTachometerAlt size={14} />, color: "#ec4899" },
  ];

  return (
    <div className="ops-root dx" style={{ "--accent": theme.primary, "--accent2": theme.secondary, "--hg": theme.gradient }}>
      <style>{OPS_STYLES}</style>

      {/* Hero */}
      <div className="ops-hero">
        <Link to="/" className="ops-hero-back">
          <FaArrowLeft size={10} /> Dashboard
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
          <Link key={q.to} to={q.to} className="ops-quicklink" style={{ "--ac": q.color, "--d": `${i * 60}ms` }}>
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