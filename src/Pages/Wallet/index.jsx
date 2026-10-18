import React, { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi, postData } from "../../utils/api";
import {
  FiRefreshCw, FiTrendingUp, FiTrendingDown, FiFilter, FiDownload, FiSearch,
  FiChevronDown, FiInfo, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiArrowUpRight, FiArrowDownLeft, FiActivity, FiUsers, FiEye, FiEyeOff,
} from "react-icons/fi";
import { MdOutlineWallet, MdOutlinePercent, MdOutlineAccountBalance, MdOutlineShield } from "react-icons/md";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { BsGraphUp, BsLightningCharge } from "react-icons/bs";

const SELLER_ROLES = ["SELLER", "GROCERY_SELLER", "RESTAURANT_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const isSellerRole = (role) => SELLER_ROLES.includes(role);

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = {
  indigo: "#6366F1", sky: "#0EA5E9", emerald: "#10B981", amber: "#F59E0B",
  orange: "#F97316", pink: "#EC4899", violet: "#8B5CF6", rose: "#F43F5E",
};
const TYPE_META = {
  DEPOSIT:    { c: COLORS.sky,    label: "Deposit",    icon: <FiArrowDownLeft size={15} /> },
  WITHDRAW:   { c: COLORS.orange, label: "Withdrawal", icon: <FiArrowUpRight size={15} /> },
  COMMISSION: { c: COLORS.violet, label: "Commission", icon: <BsGraphUp size={13} /> },
};
const STATUS_META = {
  PENDING:  { c: COLORS.amber,   label: "Pending",  icon: <FiClock size={10} /> },
  APPROVED: { c: COLORS.emerald, label: "Approved", icon: <FiCheckCircle size={10} /> },
  REJECTED: { c: COLORS.rose,    label: "Rejected", icon: <FiXCircle size={10} /> },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => (v || 0).toLocaleString("en-IN");
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimCounter({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = Number(value) || 0;
    const dur = 1000;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{fmt(display)}</>;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = COLORS.emerald, height = 32 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 76, h = height;
  const xy = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * h]);
  const pts = xy.map((p) => p.join(",")).join(" ");
  const areaD = `M0,${h} L${xy.map((p) => p.join(",")).join(" L")} L${w},${h} Z`;
  const id = `g${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="spark-line" />
    </svg>
  );
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return <span className="badge" style={{ "--c": m.c }}>{m.icon} {m.label}</span>;
}

function TypePill({ type }) {
  const m = TYPE_META[type] || TYPE_META.WITHDRAW;
  return <span className="badge" style={{ "--c": m.c }}>{m.icon} {m.label}</span>;
}

function TypeIcon({ type, size = 36 }) {
  const m = TYPE_META[type] || TYPE_META.WITHDRAW;
  return <div className="ticon" style={{ "--c": m.c, width: size, height: size }}>{m.icon}</div>;
}

function StatCard({ icon, label, value, color, sub, trend, sparkData, delay = 0 }) {
  return (
    <div className="card lift stat" style={{ "--c": color, animationDelay: `${delay}ms` }}>
      <div className="stat-top">
        <div className="ticon" style={{ "--c": color, width: 38, height: 38 }}>{icon}</div>
        {sparkData && <Sparkline data={sparkData} color={color} />}
      </div>
      <p className="lbl">{label}</p>
      <div className="stat-val">
        <RiMoneyRupeeCircleLine size={15} color={color} />
        <span><AnimCounter value={value} /></span>
      </div>
      {(sub || trend !== undefined) && (
        <div className="stat-sub">
          {trend !== undefined && (
            <span style={{ color: trend >= 0 ? COLORS.emerald : COLORS.rose, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
              {trend >= 0 ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
      <span className="stat-glow" />
    </div>
  );
}

function Tabs({ items, value, onChange }) {
  const idx = Math.max(0, items.findIndex(([k]) => k === value));
  return (
    <div className="tabs" style={{ "--n": items.length, "--i": idx }}>
      <span className="ind" />
      {items.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)} className={value === k ? "on" : ""}>{l}</button>
      ))}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
.wp{--ink:#1E1B4B;--mut:#6B7280;--soft:#9CA3AF;--line:#E7E9F8;
  min-height:100vh;font-family:'Outfit',sans-serif;font-size:12px;color:var(--ink);
  background:linear-gradient(160deg,#F5F3FF 0%,#EFF6FF 45%,#FFF1F2 100%);position:relative;overflow:hidden}
.wp *{box-sizing:border-box;margin:0;padding:0}
.wp button,.wp input,.wp textarea{font-family:inherit}
.wp button{cursor:pointer}
.wp-in{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:22px 16px 56px}

.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.4;pointer-events:none;animation:float 16s ease-in-out infinite}
.b1{width:320px;height:320px;background:#C4B5FD;top:-90px;left:-70px}
.b2{width:280px;height:280px;background:#FBCFE8;top:30%;right:-80px;animation-delay:-5s}
.b3{width:300px;height:300px;background:#A5F3FC;bottom:-90px;left:25%;animation-delay:-9s}

@keyframes float{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(24px,-28px) scale(1.08)}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.45)}50%{box-shadow:0 0 0 6px rgba(245,158,11,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes draw{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
@keyframes shine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(320%) skewX(-20deg)}}

.rise{animation:rise .5s cubic-bezier(.2,.8,.2,1) both}
.spark-line{stroke-dasharray:200;animation:draw 1.2s ease both}
.spin{animation:spin 1s linear infinite}

/* header */
.hd{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.hd-l{display:flex;align-items:center;gap:10px}
.logo{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;color:#fff;
  background:linear-gradient(135deg,#6366F1,#EC4899);box-shadow:0 6px 16px rgba(99,102,241,.35)}
.hd h1{font-size:17px;font-weight:700;line-height:1.1}
.hd small{font-size:11px;color:var(--mut)}
.hd-r{display:flex;gap:8px}

/* buttons */
.btn{height:34px;padding:0 13px;border-radius:10px;border:1px solid transparent;font-size:12px;font-weight:600;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .18s,box-shadow .18s,background .18s}
.btn:hover:not(:disabled){transform:translateY(-1px)}
.btn:active:not(:disabled){transform:scale(.97)}
.btn:disabled{opacity:.7;cursor:not-allowed}
.btn-soft{background:#fff;color:var(--mut);border-color:var(--line)}
.btn-soft:hover{background:#F5F3FF;color:#6366F1;border-color:#C7D2FE}
.btn-ind{background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE}
.btn-ind:hover:not(:disabled){box-shadow:0 6px 14px rgba(99,102,241,.2)}
.btn-ok{background:#ECFDF5;color:#059669;border-color:#A7F3D0}
.btn-no{background:#FFF1F2;color:#E11D48;border-color:#FECDD3}
.btn-ok:hover{background:#D1FAE5}.btn-no:hover{background:#FFE4E6}
.btn-sm{height:28px;padding:0 10px;font-size:11px}
.btn-big{height:44px;width:100%;font-size:13px;color:#fff;border:none;position:relative;overflow:hidden}
.btn-big::after{content:"";position:absolute;top:0;bottom:0;width:30%;background:rgba(255,255,255,.35);transform:translateX(-120%) skewX(-20deg)}
.btn-big:hover:not(:disabled)::after{animation:shine .8s ease}

/* cards */
.card{background:rgba(255,255,255,.85);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:16px;padding:16px;
  box-shadow:0 2px 10px rgba(99,102,241,.06);animation:rise .5s cubic-bezier(.2,.8,.2,1) both}
.lift{transition:transform .25s,box-shadow .25s,border-color .25s}
.lift:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(99,102,241,.14);border-color:#C7D2FE}

.lbl{font-size:10.5px;font-weight:600;color:var(--mut);letter-spacing:.04em;margin:12px 0 4px}
.badge{--c:#6366F1;display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:100px;font-size:10.5px;font-weight:600;
  color:var(--c);background:color-mix(in srgb,var(--c) 12%,white);border:1px solid color-mix(in srgb,var(--c) 22%,white)}
.ticon{--c:#6366F1;border-radius:11px;display:grid;place-items:center;flex-shrink:0;color:var(--c);
  background:color-mix(in srgb,var(--c) 13%,white);border:1px solid color-mix(in srgb,var(--c) 22%,white);transition:transform .25s}
.lift:hover .ticon,.row:hover .ticon{transform:rotate(-8deg) scale(1.08)}

/* hero */
.hero{border:none;color:#fff;position:relative;overflow:hidden;padding:20px;margin-bottom:16px;
  background:linear-gradient(120deg,#6366F1,#8B5CF6,#EC4899,#F97316);background-size:300% 300%;animation:rise .5s both,shift 12s ease infinite;
  box-shadow:0 14px 36px rgba(139,92,246,.35)}
.hero .c1,.hero .c2{position:absolute;border-radius:50%;background:rgba(255,255,255,.12)}
.hero .c1{width:190px;height:190px;top:-70px;right:-50px}
.hero .c2{width:120px;height:120px;bottom:-40px;left:42%;background:rgba(255,255,255,.08)}
.hero-top{display:flex;justify-content:space-between;align-items:center;position:relative}
.hero-lbl{font-size:11px;font-weight:500;opacity:.85;letter-spacing:.06em}
.hero-btn{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);transition:background .2s,transform .2s}
.hero-btn:hover{background:rgba(255,255,255,.32);transform:scale(1.08)}
.hero-bal{display:flex;align-items:baseline;gap:5px;margin:6px 0 2px;position:relative}
.hero-bal span{font-size:34px;font-weight:800;letter-spacing:-.02em;line-height:1}
.hero-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:14px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.25);position:relative}
.hero-grid small{display:flex;align-items:center;gap:4px;font-size:10.5px;opacity:.8;margin-bottom:2px}
.hero-grid b{font-size:14px;font-weight:700}

/* stat */
.stat{position:relative;overflow:hidden}
.stat-top{display:flex;justify-content:space-between;align-items:flex-start}
.stat-val{display:flex;align-items:center;gap:3px;font-size:21px;font-weight:800}
.stat-sub{display:flex;gap:6px;align-items:center;margin-top:6px;font-size:10.5px;color:var(--soft)}
.stat-glow{position:absolute;right:-30px;bottom:-30px;width:90px;height:90px;border-radius:50%;background:var(--c);opacity:.09;transition:transform .4s,opacity .4s}
.stat:hover .stat-glow{transform:scale(1.8);opacity:.14}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:18px}

/* tabs */
.tabs{--n:3;--i:0;position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);gap:0;padding:4px;margin-bottom:14px;
  background:rgba(255,255,255,.8);border:1px solid var(--line);border-radius:12px;width:fit-content;min-width:min(100%,300px)}
.tabs button{position:relative;z-index:1;padding:7px 14px;border:none;background:none;border-radius:9px;font-size:12px;font-weight:600;color:var(--mut);transition:color .25s;white-space:nowrap}
.tabs button.on{color:#fff}
.tabs .ind{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px)/var(--n));border-radius:9px;
  background:linear-gradient(135deg,#6366F1,#EC4899);box-shadow:0 4px 12px rgba(236,72,153,.3);
  transform:translateX(calc(var(--i)*100%));transition:transform .35s cubic-bezier(.4,1.3,.5,1)}

/* rows */
.sec-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sec-h h3{font-size:13px;font-weight:700;display:flex;align-items:center;gap:7px}
.link{background:none;border:none;color:#6366F1;font-size:11.5px;font-weight:600;transition:transform .2s}
.link:hover{transform:translateX(3px)}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 8px;border-radius:12px;
  animation:rise .45s cubic-bezier(.2,.8,.2,1) both;transition:background .2s,transform .2s}
.row:hover{background:linear-gradient(90deg,#F5F3FF,#FFF1F2);transform:translateX(3px)}
.row+.row{border-top:1px solid #F3F4FB}
.row-l{display:flex;align-items:center;gap:10px;min-width:0}
.row-t{font-size:12.5px;font-weight:600}
.row-s{font-size:10.5px;color:var(--soft);margin-top:2px}
.row-r{text-align:right;flex-shrink:0}
.amt{font-size:13px;font-weight:800}
.empty{text-align:center;padding:32px 0;color:#C4C7E0}
.empty p{font-size:12px;margin-top:6px}

/* chips */
.chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.chip{--c:#6366F1;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;color:var(--mut);background:#fff;border:1px solid var(--line);transition:all .2s}
.chip:hover{border-color:var(--c);color:var(--c);transform:translateY(-1px)}
.chip.on{color:#fff;background:var(--c);border-color:var(--c);box-shadow:0 4px 10px color-mix(in srgb,var(--c) 40%,transparent)}
.chip-k{font-size:10px;font-weight:600;color:var(--soft);letter-spacing:.06em}

/* form */
.field-l{display:block;font-size:10.5px;font-weight:600;color:var(--mut);letter-spacing:.04em;margin-bottom:6px}
.inp{width:100%;height:40px;padding:0 12px;border-radius:10px;border:1px solid var(--line);background:#FAFAFF;font-size:13px;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
.inp:focus{border-color:#8B5CF6;background:#fff;box-shadow:0 0 0 3px rgba(139,92,246,.15)}
.inp::placeholder{color:#C7C9E0}
textarea.inp{height:70px;padding:10px 12px;resize:none;line-height:1.5}
.amt-in{font-size:18px;font-weight:700;height:48px;padding-left:30px}
.type-btn{--c:#6366F1;height:48px;border-radius:12px;border:1.5px solid var(--line);background:#fff;color:var(--soft);font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .25s}
.type-btn:hover{border-color:var(--c);color:var(--c)}
.type-btn.on{color:var(--c);border-color:var(--c);background:color-mix(in srgb,var(--c) 9%,white);box-shadow:0 6px 16px color-mix(in srgb,var(--c) 22%,transparent);transform:translateY(-2px)}
.info{display:flex;gap:9px;padding:10px 12px;border-radius:10px;background:linear-gradient(90deg,#EEF2FF,#FDF2F8);border:1px solid #E0E7FF;margin-bottom:16px}
.info p{font-size:11px;color:var(--mut);line-height:1.5}

/* admin */
.seller{padding:0;overflow:hidden}
.seller-h{width:100%;display:flex;align-items:center;gap:12px;padding:13px 16px;background:none;border:none;text-align:left}
.avatar{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;transition:transform .25s}
.seller-h:hover .avatar{transform:rotate(-6deg) scale(1.06)}
.store{font-size:10.5px;padding:2px 8px;border-radius:100px;color:#DB2777;background:#FDF2F8;border:1px solid #FBCFE8;font-weight:600}
.pend{font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:100px;color:#B45309;background:#FEF3C7;border:1px solid #FDE68A;animation:pulse 2s infinite}
.exp{border-top:1px solid #F1F2FB;padding:0 16px 14px;animation:rise .35s ease both;background:linear-gradient(180deg,#FAFAFF,#fff)}
.mini{display:flex;gap:22px;flex-wrap:wrap;padding:12px 0;border-bottom:1px dashed var(--line)}
.mini small{display:block;font-size:10px;color:var(--soft);font-weight:600;letter-spacing:.05em;margin-bottom:2px}
.mini b{font-size:13px;font-weight:700}
.search{position:relative;flex:1 1 220px}
.search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%)}
.search .inp{padding-left:34px}

/* modal */
.modal-bg{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(30,27,75,.45);backdrop-filter:blur(6px);animation:fade .2s both}
.modal{width:90%;max-width:360px;padding:24px;border-radius:20px;background:#fff;box-shadow:0 24px 60px rgba(30,27,75,.3);animation:pop .3s cubic-bezier(.2,1.2,.4,1) both}
.modal h3{font-size:15px;font-weight:700;margin-bottom:6px}
.modal p{font-size:12px;color:var(--mut);line-height:1.6;margin-bottom:20px}

::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#C7D2FE;border-radius:3px}
@media(max-width:640px){.hero-bal span{font-size:28px}.row-r .amt{font-size:12px}}
@media(prefers-reduced-motion:reduce){.wp *,.wp *::before,.wp *::after{animation:none!important;transition:none!important}}
`;

// ─── Main Page ────────────────────────────────────────────────────────────────
const WalletPage = () => {
  const context = useContext(MyContext);
  const isAdmin = context?.userData?.role === "ADMIN";
  const sellerStore = context?.userData?.storeProfile?.storeName || "";

  const [overview, setOverview] = useState({ wallet: {}, transactions: [] });
  const [allSellers, setAllSellers] = useState([]);
  const [amount, setAmount] = useState("");
  const [reqType, setReqType] = useState("DEPOSIT");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchSeller, setSearchSeller] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminTab, setAdminTab] = useState("pending");
  const [expandedSeller, setExpandedSeller] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [res, usersRes] = await Promise.all([
        fetchDataFromApi("/api/user/wallet/overview"),
        isAdmin ? fetchDataFromApi("/api/user/getAllUsers?page=1&limit=500") : Promise.resolve(null),
      ]);
      if (res?.success) setOverview(res);
      if (isAdmin && usersRes?.success)
        setAllSellers((usersRes.users || []).filter((u) => isSellerRole(u.role)));
    } catch {
      // silent fail
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [isAdmin]);

  const txns = overview?.transactions || [];
  const totalIn = txns.filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED").reduce((a, t) => a + t.amount, 0);
  const totalOut = txns.filter((t) => t.type === "WITHDRAW" && t.status === "APPROVED").reduce((a, t) => a + t.amount, 0);
  const pendingAmt = txns.filter((t) => t.status === "PENDING").reduce((a, t) => a + t.amount, 0);
  const sparkDeposit = txns.filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED").slice(-7).map((t) => t.amount);
  const sparkWithdraw = txns.filter((t) => t.type === "WITHDRAW" && t.status === "APPROVED").slice(-7).map((t) => t.amount);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return context?.alertBox("error", "Enter a valid amount");
    if (reqType === "WITHDRAW" && Number(amount) > (overview?.wallet?.availableBalance || 0))
      return context?.alertBox("error", "Amount exceeds available balance");
    setIsSubmitting(true);
    try {
      const res = await postData("/api/user/wallet/request", { type: reqType, amount: Number(amount), note });
      if (res?.success) {
        context?.alertBox("success", "Request submitted successfully!");
        setAmount(""); setNote("");
        await loadData();
      } else {
        context?.alertBox("error", res?.message || "Request failed");
      }
    } catch {
      context?.alertBox("error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmAction = (sellerId, trxId, status) => setConfirming({ sellerId, trxId, status });

  const executeAction = async () => {
    if (!confirming) return;
    const { sellerId, trxId, status } = confirming;
    setConfirming(null);
    const res = await editData("/api/user/wallet/request/approve", { sellerId, transactionId: trxId, status });
    if (res?.success) {
      context?.alertBox("success", `Transaction ${status.toLowerCase()}`);
      loadData();
    } else {
      context?.alertBox("error", res?.message || "Action failed");
    }
  };

  const filteredTxns = txns.filter(
    (t) => (filterStatus === "ALL" || t.status === filterStatus) && (filterType === "ALL" || t.type === filterType)
  );

  const pendingCount = allSellers.reduce(
    (a, s) => a + (s.walletTransactions || []).filter((t) => t.status === "PENDING").length, 0);

  const filteredSellers = allSellers.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchSeller.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchSeller.toLowerCase())
  );

  const displayedSellers =
    adminTab === "pending"
      ? filteredSellers.filter((s) => (s.walletTransactions || []).some((t) => t.status === "PENDING"))
      : filteredSellers;

  const exportCSV = () => {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Date", "Type", "Amount", "Status", "Note"]];
    txns.forEach((t) => rows.push([fmtDate(t.createdAt), t.type, t.amount, t.status, t.note || ""]));
    const csv = rows.map((r) => r.map(q).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "wallet_transactions.csv";
    a.click();
  };

  const amtColor = (type) => (TYPE_META[type] || TYPE_META.WITHDRAW).c;
  const sign = (type) => (type === "WITHDRAW" ? "−" : "+");
  const rowTitle = { DEPOSIT: "Money Deposited", COMMISSION: "Commission", WITHDRAW: "Withdrawal" };

  const adminStats = [
    { icon: <FiUsers size={16} />, label: "Total Sellers", value: allSellers.length, color: COLORS.indigo, plain: true },
    { icon: <FiAlertCircle size={16} />, label: "Pending Requests", value: pendingCount, color: COLORS.amber, plain: true },
    { icon: <MdOutlineAccountBalance size={16} />, label: "Total Balance", color: COLORS.emerald,
      value: allSellers.reduce((a, s) => a + (s.wallet?.availableBalance || 0), 0) },
    { icon: <BsLightningCharge size={16} />, label: "Pending Amount", color: COLORS.pink,
      value: allSellers.reduce((a, s) => a + (s.walletTransactions || []).filter((t) => t.status === "PENDING").reduce((b, t) => b + t.amount, 0), 0) },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="wp">
      <style>{CSS}</style>
      <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />

      <div className="wp-in">
        {/* Header */}
        <div className="hd rise">
          <div>
            <div className="hd-l">
              <div className="logo"><MdOutlineWallet size={18} /></div>
              <div>
                <h1>{isAdmin ? "Wallet Management" : "My Wallet"}</h1>
                {!isAdmin && sellerStore && <small>{sellerStore}</small>}
                {isAdmin && (
                  <small style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                    {allSellers.length} sellers registered
                    {pendingCount > 0 && <span className="pend">{pendingCount} pending</span>}
                  </small>
                )}
              </div>
            </div>
          </div>
          <div className="hd-r">
            {!isAdmin && (
              <button onClick={exportCSV} className="btn btn-soft"><FiDownload size={13} /> Export</button>
            )}
            <button onClick={loadData} disabled={isRefreshing} className="btn btn-ind">
              <FiRefreshCw size={12} className={isRefreshing ? "spin" : ""} />
              {isRefreshing ? "Syncing…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="info">
          <MdOutlinePercent size={15} color={COLORS.indigo} />
          <p>
            Seller commission rate: {overview?.commissionRate ?? 20}% on applicable orders.
          </p>
        </div>

        {/* ── SELLER VIEW ── */}
        {!isAdmin && (
          <>
            <div className="card hero">
              <span className="c1" /><span className="c2" />
              <div className="hero-top">
                <span className="hero-lbl">AVAILABLE BALANCE</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="hero-btn" onClick={() => setShowBalance(!showBalance)} title="Toggle balance">
                    {showBalance ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                  </button>
                  <div className="hero-btn"><MdOutlineShield size={13} /></div>
                </div>
              </div>
              <div className="hero-bal">
                <RiMoneyRupeeCircleLine size={22} style={{ opacity: 0.85 }} />
                <span>{showBalance ? <AnimCounter value={overview?.wallet?.availableBalance} /> : "••••••"}</span>
              </div>
              <div className="hero-grid">
                {[
                  { label: "Total Deposited", val: overview?.wallet?.totalDeposited, icon: <FiArrowDownLeft size={11} /> },
                  { label: "Total Withdrawn", val: overview?.wallet?.totalWithdrawn, icon: <FiArrowUpRight size={11} /> },
                  { label: "Commission Paid", val: overview?.wallet?.totalCommissionPaid, icon: <MdOutlinePercent size={11} /> },
                  { label: "Pending", val: pendingAmt, icon: <FiClock size={11} /> },
                ].map((it) => (
                  <div key={it.label}>
                    <small>{it.icon} {it.label}</small>
                    <b>₹{showBalance ? fmt(it.val) : "•••"}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats">
              <StatCard icon={<FiArrowDownLeft size={17} />} label="Total In" value={totalIn} color={COLORS.sky} sub="Approved deposits" trend={2.4} sparkData={sparkDeposit} delay={0} />
              <StatCard icon={<FiArrowUpRight size={17} />} label="Total Out" value={totalOut} color={COLORS.orange} sub="Approved withdrawals" sparkData={sparkWithdraw} delay={70} />
              <StatCard icon={<FiClock size={17} />} label="Pending" value={pendingAmt} color={COLORS.amber} sub="Awaiting approval" delay={140} />
              <StatCard icon={<BsGraphUp size={16} />} label="Commission" value={overview?.wallet?.pendingCommission} color={COLORS.violet} sub="Under review" delay={210} />
            </div>

            <Tabs
              items={[["overview", "Overview"], ["transactions", "History"], ["request", "New Request"]]}
              value={activeTab} onChange={setActiveTab}
            />

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="card lift" key="ov">
                <div className="sec-h">
                  <h3><FiActivity size={14} color={COLORS.pink} /> Recent Activity</h3>
                  <button className="link" onClick={() => setActiveTab("transactions")}>View all →</button>
                </div>
                {txns.length === 0 ? (
                  <div className="empty"><MdOutlineWallet size={34} /><p>No transactions yet</p></div>
                ) : (
                  txns.slice(0, 5).map((t, i) => (
                    <div key={t._id} className="row" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="row-l">
                        <TypeIcon type={t.type} />
                        <div>
                          <p className="row-t">{rowTitle[t.type] || "Withdrawal"}</p>
                          <p className="row-s">{fmtDate(t.createdAt)}</p>
                        </div>
                      </div>
                      <div className="row-r">
                        <p className="amt" style={{ color: amtColor(t.type) }}>{sign(t.type)}₹{fmt(t.amount)}</p>
                        <div style={{ marginTop: 3 }}><StatusBadge status={t.status} /></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* History */}
            {activeTab === "transactions" && (
              <div className="card" key="hist">
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div className="chips">
                    <span className="chip-k">STATUS</span>
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`chip ${filterStatus === s ? "on" : ""}`}
                        style={{ "--c": s === "ALL" ? COLORS.indigo : STATUS_META[s].c }}>
                        {s === "ALL" ? "All" : STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                  <div className="chips">
                    <span className="chip-k">TYPE</span>
                    {["ALL", "DEPOSIT", "WITHDRAW", "COMMISSION"].map((t) => (
                      <button key={t} onClick={() => setFilterType(t)}
                        className={`chip ${filterType === t ? "on" : ""}`}
                        style={{ "--c": t === "ALL" ? COLORS.indigo : TYPE_META[t].c }}>
                        {t === "ALL" ? "All" : TYPE_META[t].label}
                      </button>
                    ))}
                  </div>
                  <button onClick={exportCSV} className="btn btn-soft btn-sm"><FiDownload size={11} /> CSV</button>
                </div>

                <p className="row-s" style={{ marginBottom: 8 }}>
                  {filteredTxns.length} transaction{filteredTxns.length !== 1 ? "s" : ""}
                </p>

                {filteredTxns.length === 0 ? (
                  <div className="empty"><FiFilter size={30} /><p>No matching transactions</p></div>
                ) : (
                  filteredTxns.map((t, i) => (
                    <div key={t._id} className="row" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                      <div className="row-l">
                        <TypeIcon type={t.type} size={38} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                            <p className="row-t">{t.type === "COMMISSION" ? "Commission Earned" : (TYPE_META[t.type] || TYPE_META.WITHDRAW).label}</p>
                            <TypePill type={t.type} />
                          </div>
                          <p className="row-s">{fmtDate(t.createdAt)}{t.note ? ` · ${t.note}` : ""}</p>
                        </div>
                      </div>
                      <div className="row-r">
                        <p className="amt" style={{ color: amtColor(t.type) }}>{sign(t.type)}₹{fmt(t.amount)}</p>
                        <div style={{ marginTop: 4 }}><StatusBadge status={t.status} /></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* New request */}
            {activeTab === "request" && (
              <div style={{ maxWidth: 480 }} key="req">
                <div className="card">
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>New Wallet Request</h3>
                  <p className="row-s" style={{ marginBottom: 18 }}>Submit a deposit or withdrawal request</p>

                  <span className="field-l">REQUEST TYPE</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { k: "DEPOSIT", label: "Deposit", icon: <FiArrowDownLeft size={15} />, c: COLORS.sky },
                      { k: "WITHDRAW", label: "Withdrawal", icon: <FiArrowUpRight size={15} />, c: COLORS.orange },
                    ].map(({ k, label, icon, c }) => (
                      <button key={k} type="button" onClick={() => setReqType(k)}
                        className={`type-btn ${reqType === k ? "on" : ""}`} style={{ "--c": c }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={submitRequest}>
                    <span className="field-l">AMOUNT (₹)</span>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.violet, fontSize: 16, fontWeight: 700 }}>₹</span>
                      <input type="number" min="1" className="inp amt-in" value={amount}
                        onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                    </div>

                    {reqType === "WITHDRAW" && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                        <span className="row-s">Available</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.emerald }}>₹{fmt(overview?.wallet?.availableBalance)}</span>
                      </div>
                    )}

                    <div className="chips" style={{ margin: "10px 0 16px" }}>
                      <span className="chip-k">QUICK</span>
                      {[500, 1000, 2000, 5000, 10000, 25000].map((q, i) => (
                        <button key={q} type="button" onClick={() => setAmount(String(q))}
                          className={`chip ${Number(amount) === q ? "on" : ""}`}
                          style={{ "--c": [COLORS.indigo, COLORS.pink, COLORS.sky, COLORS.emerald, COLORS.amber, COLORS.violet][i] }}>
                          ₹{q.toLocaleString("en-IN")}
                        </button>
                      ))}
                    </div>

                    <span className="field-l">NOTE (OPTIONAL)</span>
                    <textarea className="inp" value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note for this request…" style={{ marginBottom: 16 }} />

                    <div className="info">
                      <FiInfo size={13} color={COLORS.indigo} style={{ flexShrink: 0, marginTop: 2 }} />
                      <p>Requests are reviewed within 24–48 hours. You'll be notified once processed.</p>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-big"
                      style={{ background: reqType === "DEPOSIT"
                        ? "linear-gradient(135deg,#0EA5E9,#6366F1)"
                        : "linear-gradient(135deg,#F97316,#EC4899)" }}>
                      {isSubmitting ? "Submitting…" : reqType === "DEPOSIT" ? "Submit Deposit Request" : "Submit Withdrawal Request"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ADMIN VIEW ── */}
        {isAdmin && (
          <>
            <div className="stats">
              {adminStats.map((c, i) => (
                <div key={c.label} className="card lift stat" style={{ "--c": c.color, animationDelay: `${i * 70}ms` }}>
                  <div className="ticon" style={{ "--c": c.color, width: 36, height: 36 }}>{c.icon}</div>
                  <p className="lbl">{c.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800 }}>
                    {c.plain ? <AnimCounter value={c.value} /> : <>₹<AnimCounter value={c.value} /></>}
                  </p>
                  <span className="stat-glow" />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div className="search">
                <FiSearch size={13} color={COLORS.violet} />
                <input className="inp" value={searchSeller} onChange={(e) => setSearchSeller(e.target.value)} placeholder="Search sellers…" />
              </div>
              <div style={{ marginBottom: 0 }}>
                <Tabs items={[["pending", "Pending"], ["all", "All Sellers"]]} value={adminTab} onChange={setAdminTab} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayedSellers.length === 0 && (
                <div className="card empty" style={{ padding: "44px 16px" }}>
                  <FiUsers size={34} />
                  <p>{adminTab === "pending" ? "No pending requests 🎉" : "No sellers found"}</p>
                </div>
              )}

              {displayedSellers.map((seller, si) => {
                const pendingTxns = (seller.walletTransactions || []).filter((t) => t.status === "PENDING");
                const allTxns = seller.walletTransactions || [];
                const isExp = expandedSeller === seller._id;
                const hue = ((seller.name?.charCodeAt(0) || 65) * 37) % 360;
                return (
                  <div key={seller._id} className="card lift seller" style={{ animationDelay: `${Math.min(si, 10) * 50}ms` }}>
                    <button className="seller-h" onClick={() => setExpandedSeller(isExp ? null : seller._id)}>
                      <div className="avatar" style={{ background: `linear-gradient(135deg,hsl(${hue},75%,58%),hsl(${(hue + 50) % 360},80%,62%))` }}>
                        {seller.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{seller.name}</span>
                          {seller.storeProfile?.storeName && <span className="store">{seller.storeProfile.storeName}</span>}
                        </div>
                        <p className="row-s">{seller.email}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.emerald }}>₹{fmt(seller.wallet?.availableBalance)}</p>
                          <p className="row-s" style={{ marginTop: 0 }}>balance</p>
                        </div>
                        {pendingTxns.length > 0 && <span className="pend">{pendingTxns.length} pending</span>}
                        <FiChevronDown size={15} color={COLORS.indigo}
                          style={{ transition: "transform .3s", transform: isExp ? "rotate(180deg)" : "none" }} />
                      </div>
                    </button>

                    {isExp && (
                      <div className="exp">
                        <div className="mini">
                          {[
                            ["DEPOSITED", seller.wallet?.totalDeposited, COLORS.sky],
                            ["WITHDRAWN", seller.wallet?.totalWithdrawn, COLORS.orange],
                            ["COMMISSION", seller.wallet?.totalCommissionPaid, COLORS.violet],
                            ["TXNS", allTxns.length, COLORS.pink],
                          ].map(([l, v, c]) => (
                            <div key={l}>
                              <small>{l}</small>
                              <b style={{ color: c }}>{l === "TXNS" ? v : `₹${fmt(v)}`}</b>
                            </div>
                          ))}
                        </div>

                        {allTxns.length === 0 ? (
                          <p className="empty" style={{ padding: "18px 0" }}>No transactions</p>
                        ) : (
                          <div style={{ marginTop: 8 }}>
                            {allTxns.slice().reverse().map((t, i) => (
                              <div key={t._id} className="row" style={{ flexWrap: "wrap", animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                                <div className="row-l">
                                  <TypePill type={t.type} />
                                  <span style={{ fontSize: 13, fontWeight: 700 }}>₹{fmt(t.amount)}</span>
                                  {t.note && <span className="row-s" style={{ marginTop: 0 }}>— {t.note}</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span className="row-s" style={{ marginTop: 0 }}>{fmtDate(t.createdAt)}</span>
                                  <StatusBadge status={t.status} />
                                  {t.status === "PENDING" && (
                                    <>
                                      <button onClick={() => confirmAction(seller._id, t._id, "APPROVED")} className="btn btn-ok btn-sm">
                                        <FiCheckCircle size={11} /> Approve
                                      </button>
                                      <button onClick={() => confirmAction(seller._id, t._id, "REJECTED")} className="btn btn-no btn-sm">
                                        <FiXCircle size={11} /> Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirming && (
        <div className="modal-bg" onClick={() => setConfirming(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="ticon" style={{ "--c": confirming.status === "APPROVED" ? COLORS.emerald : COLORS.rose, width: 46, height: 46, marginBottom: 14 }}>
              {confirming.status === "APPROVED" ? <FiCheckCircle size={22} /> : <FiXCircle size={22} />}
            </div>
            <h3>{confirming.status === "APPROVED" ? "Approve Transaction?" : "Reject Transaction?"}</h3>
            <p>
              {confirming.status === "APPROVED"
                ? "This will approve the transaction and update the seller's wallet balance."
                : "This will reject the transaction. This action cannot be undone."}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-soft" style={{ flex: 1, height: 40 }} onClick={() => setConfirming(null)}>Cancel</button>
              <button className="btn" onClick={executeAction} style={{ flex: 2, height: 40, color: "#fff",
                background: confirming.status === "APPROVED"
                  ? "linear-gradient(135deg,#10B981,#0EA5E9)"
                  : "linear-gradient(135deg,#F43F5E,#F97316)" }}>
                {confirming.status === "APPROVED" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;