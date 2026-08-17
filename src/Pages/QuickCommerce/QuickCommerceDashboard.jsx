import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSyncAlt,
  FaBoxOpen,
  FaClipboardList,
  FaWallet,
  FaSlidersH,
  FaExclamationTriangle,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtR = (n) => `₹${fmt(n)}`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lightweight count-up for numeric stat values (skips animation if value isn't a plain number)
const useCountUp = (value, duration = 650) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = Number(value) || 0;
    if (prefersReducedMotion()) {
      setDisplay(end);
      return;
    }
    let raf;
    let startTs = null;
    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      setDisplay(Math.round(progress * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
};

const StatValue = ({ value }) => {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0);
  return <>{isNumeric ? fmt(animated) : value ?? 0}</>;
};

const StatusPill = ({ status }) => {
  const map = {
    pending: { bg: "#fef3c7", color: "#92400e", label: "New" },
    confirmed: { bg: "#dbeafe", color: "#1e40af", label: "Preparing" },
    shipped: { bg: "#ede9fe", color: "#6b21a8", label: "Out for delivery" },
    delivered: { bg: "#dcfce7", color: "#166534", label: "Delivered" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  };
  const s = map[(status || "").toLowerCase()] || { bg: "#f1f5f9", color: "#475569", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100 }}>
      {s.label}
    </span>
  );
};

const initials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const QuickCommerceDashboard = () => {
  const context = useContext(MyContext);
  const role = context?.userData?.role;

  // Theme configuration for all seller types
  const getThemeByRole = (role) => {
    const themes = {
      GROCERY_SELLER: {
        primary: "#059669",
        dark: "#064e3b",
        light: "#ecfdf5",
        gradient: "linear-gradient(135deg, #059669 0%, #047857 55%, #065f46 100%)",
        tag: "Quick Grocery",
        icon: "🛒",
      },
      RESTAURANT_SELLER: {
        primary: "#ea580c",
        dark: "#7c2d12",
        light: "#fff7ed",
        gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
        tag: "Quick Restaurant",
        icon: "🍽️",
      },
      FASHION_SELLER: {
        primary: "#ec4899",
        dark: "#831843",
        light: "#fce7f3",
        gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)",
        tag: "Fashion Store",
        icon: "👕",
      },
      ELECTRONICS_SELLER: {
        primary: "#3b82f6",
        dark: "#1e3a8a",
        light: "#dbeafe",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%)",
        tag: "Electronics Store",
        icon: "📱",
      },
      MEDICAL_SELLER: {
        primary: "#ef4444",
        dark: "#7f1d1d",
        light: "#fee2e2",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #b91c1c 100%)",
        tag: "Medical Store",
        icon: "💊",
      },
      BEAUTY_SELLER: {
        primary: "#d946ef",
        dark: "#701a75",
        light: "#fae8ff",
        gradient: "linear-gradient(135deg, #d946ef 0%, #c026d3 55%, #a21caf 100%)",
        tag: "Beauty Store",
        icon: "💄",
      },
      HOME_KITCHEN_SELLER: {
        primary: "#f59e0b",
        dark: "#78350f",
        light: "#fef3c7",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 55%, #b45309 100%)",
        tag: "Home & Kitchen",
        icon: "🏠",
      },
      GIFTS_TOYS_SELLER: {
        primary: "#f472b6",
        dark: "#831843",
        light: "#fce7f3",
        gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 55%, #db2777 100%)",
        tag: "Gifts & Toys",
        icon: "🎁",
      },
      BOOKS_STATIONERY_SELLER: {
        primary: "#8b5cf6",
        dark: "#4c1d95",
        light: "#ede9fe",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 55%, #6d28d9 100%)",
        tag: "Books & Stationery",
        icon: "📚",
      },
      JEWELLERY_SELLER: {
        primary: "#fbbf24",
        dark: "#78350f",
        light: "#fef3c7",
        gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%)",
        tag: "Jewellery Store",
        icon: "💎",
      },
      HARDWARE_SELLER: {
        primary: "#6b7280",
        dark: "#1f2937",
        light: "#f3f4f6",
        gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 55%, #374151 100%)",
        tag: "Hardware Store",
        icon: "🔧",
      },
      AUTOMOBILE_SELLER: {
        primary: "#14b8a6",
        dark: "#134e4a",
        light: "#ccfbf1",
        gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 55%, #0f766e 100%)",
        tag: "Automobile Store",
        icon: "🚗",
      },
    };

    return themes[role] || themes.GROCERY_SELLER; // Fallback to grocery theme
  };

  const theme = getThemeByRole(role);

  // Helper variables for conditional logic
  const isGrocery = role === "GROCERY_SELLER";
  const isRestaurant = role === "RESTAURANT_SELLER";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    fetchDataFromApi("/api/user/seller/quick-commerce/dashboard")
      .then((res) => {
        if (res?.success || res?.error === false) {
          setData(res);
          setError(false);
          setLastUpdated(Date.now());
        } else if (!silent) {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 45000);
    return () => clearInterval(id);
  }, [load]);

  const outlet = data?.outlet;
  const stats = data?.orderStats || {};
  const catalog = data?.catalog || {};
  const recentOrders = data?.recentOrders || [];
  const displayDeliveryMinutes = (isGrocery || isRestaurant) ? 0 : outlet?.deliveryMinutes ?? "—";

  // Generic labels based on seller type
  const getControlLabel = () => (isRestaurant ? "Kitchen controls" : "Store controls");
  const getInventoryLabel = () => (isRestaurant ? "Manage menu" : "Manage inventory");

  const quickActions = [
    { to: "/seller/store-ops", label: getControlLabel(), sub: "Open / pause · delivery SLA", icon: <FaSlidersH size={16} /> },
    { to: "/products", label: getInventoryLabel(), sub: `${catalog.totalItems || 0} items live`, icon: <FaBoxOpen size={16} /> },
    { to: "/orders", label: "Live orders", sub: `${stats.activeOrders || 0} need attention`, highlight: (stats.pendingOrders || 0) > 0, icon: <FaClipboardList size={16} /> },
    { to: "/wallet/transactions", label: "Earnings & wallet", sub: "Payouts & balance", icon: <FaWallet size={16} /> },
  ];

  const statCards = isGrocery
    ? [
        { label: "Today's orders", value: stats.todayOrders, accent: theme.primary },
        { label: "Today's revenue", value: fmtR(stats.todayRevenue), accent: "#0ea5e9" },
        { label: "New orders", value: stats.pendingOrders, accent: "#f59e0b", alert: stats.pendingOrders > 0, to: "/orders" },
        { label: "Low stock", value: catalog.lowStock, accent: "#d97706", alert: catalog.lowStock > 0, to: "/products" },
        { label: "Out of stock", value: catalog.outOfStock, accent: "#ef4444", alert: catalog.outOfStock > 0, to: "/products" },
        { label: "Delivered today", value: stats.deliveredToday, accent: "#6366f1" },
      ]
    : [
        { label: "Today's orders", value: stats.todayOrders, accent: theme.primary },
        { label: "Today's revenue", value: fmtR(stats.todayRevenue), accent: "#0ea5e9" },
        { label: "New orders", value: stats.pendingOrders, accent: "#f59e0b", alert: stats.pendingOrders > 0, to: "/orders" },
        { label: "Preparing", value: stats.preparingOrders, accent: "#8b5cf6" },
        { label: "Unavailable dishes", value: catalog.unavailable, accent: "#ef4444", alert: catalog.unavailable > 0, to: "/products" },
        { label: "Menu items", value: catalog.totalItems, accent: "#6366f1" },
      ];

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return null;
    return new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }, [lastUpdated]);

  return (
    <>
      <style>{QC_STYLES}</style>

      <div className="qc-wrap" style={{ "--accent": theme.primary }}>
        <div className="qc-hero">
          <div className="qc-hero__grid">
            <div>
              <p className="qc-tag">{theme.icon} {theme.tag} · Quick delivery</p>
              <h1 className="qc-title">{greeting}, {context?.userData?.name?.split(" ")[0]} 👋</h1>
              <p className="qc-sub">
                {outlet?.name
                  ? `${outlet.name} — manage your store and deliver fast.`
                  : "Your quick-commerce partner console"}
              </p>
              <div className="qc-status">
                <span className="qc-dot" data-open={outlet?.isOpen !== false} />
                {loading ? "Syncing…" : outlet?.isOpen === false ? "Store paused — not accepting orders" : "Live · Accepting orders"}
              </div>
            </div>
            <div className="qc-hero-pills">
              <div className="qc-pill">
                <div className="qc-pill-lbl">Delivery promise</div>
                <div className="qc-pill-val">{displayDeliveryMinutes} min</div>
              </div>
              <div className="qc-pill">
                <div className="qc-pill-lbl">Min order</div>
                <div className="qc-pill-val">{fmtR(outlet?.minOrderValue)}</div>
              </div>
              {!isGrocery && (
                <div className="qc-pill">
                  <div className="qc-pill-lbl">Avg prep</div>
                  <div className="qc-pill-val">{outlet?.avgPrepMinutes ?? "—"} min</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && !data ? (
          <div className="qc-error-card">
            <FaExclamationTriangle size={22} color="#ef4444" />
            <div>
              <div className="qc-error-title">Could not load your dashboard</div>
              <div className="qc-error-sub">Check your connection and try again.</div>
            </div>
            <button type="button" className="qc-retry" onClick={() => load()}>Retry</button>
          </div>
        ) : (
          <>
            <div className="qc-toolbar">
              <span className="qc-section">Today at a glance</span>
              <div className="qc-toolbar-right">
                {lastUpdatedLabel && !loading && (
                  <span className="qc-updated"><FaClock size={10} /> Updated {lastUpdatedLabel}</span>
                )}
                <button type="button" className="qc-refresh" onClick={() => load(true)} disabled={refreshing}>
                  <FaSyncAlt size={12} className={refreshing ? "qc-spin" : ""} />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="qc-stats">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="qc-skel" />)}</div>
            ) : (
              <div className="qc-stats">
                {statCards.map((c, i) => {
                  const Card = (
                    <>
                      <div className="qc-stat-val"><StatValue value={c.value} /></div>
                      <div className="qc-stat-lbl">{c.label}</div>
                      <div className="qc-stat-bar" style={{ background: c.accent }} />
                      {c.to && <FaChevronRight size={10} className="qc-stat-arrow" />}
                    </>
                  );
                  const className = `qc-stat${c.alert ? " alert" : ""}${c.to ? " clickable" : ""}`;
                  const style = { animationDelay: `${i * 35}ms` };
                  return c.to ? (
                    <Link key={c.label} to={c.to} className={className} style={style}>{Card}</Link>
                  ) : (
                    <div key={c.label} className={className} style={style}>{Card}</div>
                  );
                })}
              </div>
            )}

            <div className="qc-toolbar">
              <span className="qc-section">Quick actions</span>
            </div>
            <div className="qc-actions">
              {quickActions.map((a, i) => (
                <Link key={a.to} to={a.to} className={`qc-action${a.highlight ? " highlight" : ""}`} style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="qc-action-icon" style={{ background: `${theme.primary}14`, color: theme.primary }}>{a.icon}</span>
                  <span>
                    <div className="qc-action-title">{a.label}</div>
                    <div className="qc-action-sub">{a.sub}</div>
                  </span>
                </Link>
              ))}
            </div>

            <div className="qc-panel">
              <div className="qc-panel-head">
                <span className="qc-panel-title">Recent live orders</span>
                <Link to="/orders" className="qc-panel-link">
                  View all <FaChevronRight size={10} />
                </Link>
              </div>
              {loading ? (
                <div style={{ padding: 16 }}><div className="qc-skel" /></div>
              ) : recentOrders.length === 0 ? (
                <div className="qc-empty">
                  <div className="qc-empty-icon">📦</div>
                  No orders yet. When customers order, they appear here in real time.
                </div>
              ) : (
                recentOrders.map((o, i) => (
                  <div key={o._id} className="qc-order" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="qc-order-left">
                      <span className="qc-order-avatar">{initials(o.customerName)}</span>
                      <div>
                        <div className="qc-order-id">#{String(o._id).slice(-8)}</div>
                        <div className="qc-order-meta">{o.customerName} · {o.customerPhone || "—"}</div>
                        <div className="qc-order-meta">{o.address || "Delivery address"}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="qc-order-amt">{fmtR(o.totalAmt)}</div>
                      <div style={{ marginTop: 6 }}><StatusPill status={o.order_status} /></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const QC_STYLES = `
.qc-wrap { animation: qcFade .35s ease; max-width: 100vw; overflow-x: hidden; }
@keyframes qcFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes qcPop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
@keyframes qcSpin { to { transform: rotate(360deg); } }
@keyframes qcShim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes qcPulseDot { 0%,100% { box-shadow: 0 0 0 0 rgba(0,0,0,.12); } 50% { box-shadow: 0 0 0 5px transparent; } }

.qc-hero { position: relative; overflow: hidden; border-radius: 20px; padding: 28px 30px; margin-bottom: 20px; color: #fff; background: var(--accent); }
.qc-hero::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 85% 20%, rgba(255,255,255,.18), transparent 55%); pointer-events: none; }
.qc-hero__grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; }
.qc-tag { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; opacity: .85; margin-bottom: 6px; }
.qc-title { font-size: clamp(20px, 3vw, 28px); font-weight: 800; margin: 0 0 6px; }
.qc-sub { font-size: 13px; opacity: .9; max-width: 520px; line-height: 1.5; }
.qc-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); font-size: 12px; font-weight: 700; }
.qc-dot { width: 8px; height: 8px; border-radius: 50%; background: #fca5a5; box-shadow: 0 0 8px currentColor; animation: qcPulseDot 1.8s ease infinite; }
.qc-dot[data-open="true"] { background: #86efac; }
.qc-hero-pills { display: flex; flex-direction: column; gap: 8px; }
.qc-pill { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 12px; padding: 10px 14px; min-width: 130px; backdrop-filter: blur(8px); }
.qc-pill-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: .75; }
.qc-pill-val { font-size: 18px; font-weight: 800; margin-top: 2px; }

.qc-error-card { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #fecaca; border-radius: 16px; padding: 20px; margin-bottom: 20px; animation: qcPop .3s ease both; }
.qc-error-title { font-size: 14px; font-weight: 700; color: #0f172a; }
.qc-error-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.qc-retry { margin-left: auto; background: #ef4444; color: #fff; border: none; border-radius: 9px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
.qc-retry:hover { filter: brightness(1.08); }

.qc-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.qc-toolbar-right { display: flex; align-items: center; gap: 10px; }
.qc-section { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #64748b; }
.qc-updated { font-size: 11px; color: #94a3b8; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.qc-refresh { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #e2e8f0; background: #fff; color: #334155; font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 9px; cursor: pointer; transition: all .15s ease; }
.qc-refresh:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.qc-refresh:disabled { opacity: .6; cursor: not-allowed; }
.qc-spin { animation: qcSpin .8s linear infinite; }

.qc-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 12px; margin-bottom: 20px; }
.qc-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; position: relative; overflow: hidden; animation: qcPop .35s ease both; text-decoration: none; display: block; transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease; }
.qc-stat.clickable { cursor: pointer; }
.qc-stat.clickable:hover { transform: translateY(-2px); box-shadow: 0 10px 22px -10px rgba(0,0,0,.15); border-color: var(--accent); }
.qc-stat.alert { border-color: #fecaca; background: #fffbfb; }
.qc-stat-val { font-size: 22px; font-weight: 800; color: #0f172a; }
.qc-stat-lbl { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px; }
.qc-stat-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; }
.qc-stat-arrow { position: absolute; top: 12px; right: 12px; color: #cbd5e1; }

.qc-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
.qc-action { display: flex; align-items: center; gap: 12px; text-decoration: none; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; transition: transform .15s, box-shadow .15s, border-color .15s; animation: qcPop .35s ease both; }
.qc-action:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -10px rgba(0,0,0,.12); border-color: var(--accent); }
.qc-action:active { transform: translateY(0) scale(.98); }
.qc-action.highlight { border-color: #fcd34d; background: #fffbeb; }
.qc-action-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qc-action-title { font-size: 14px; font-weight: 700; color: #0f172a; }
.qc-action-sub { font-size: 12px; color: #64748b; margin-top: 4px; }

.qc-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
.qc-panel-head { padding: 16px 18px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
.qc-panel-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.qc-panel-link { font-size: 12px; font-weight: 700; color: var(--accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.qc-panel-link:hover { text-decoration: underline; }
.qc-order { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #f8fafc; animation: qcPop .3s ease both; }
.qc-order:last-child { border-bottom: none; }
.qc-order-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.qc-order-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qc-order-id { font-family: monospace; font-size: 11px; color: var(--accent); font-weight: 700; }
.qc-order-meta { font-size: 12px; color: #64748b; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
.qc-order-amt { font-size: 14px; font-weight: 800; color: #0f172a; }
.qc-empty { text-align: center; padding: 32px; color: #94a3b8; font-size: 13px; }
.qc-empty-icon { font-size: 28px; margin-bottom: 8px; }

.qc-skel { height: 72px; border-radius: 14px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: qcShim 1.2s infinite; }

@media (max-width: 720px) {
  .qc-hero__grid { grid-template-columns: 1fr; }
  .qc-hero-pills { flex-direction: row; flex-wrap: wrap; }
  .qc-pill { flex: 1; min-width: 110px; }
}

@media (max-width: 640px) {
  .qc-hero { padding: 20px 18px; border-radius: 16px; }
  .qc-stats { grid-template-columns: repeat(2, 1fr); }
  .qc-actions { grid-template-columns: 1fr; }
  .qc-toolbar { align-items: flex-start; }
  .qc-order-meta { max-width: 150px; }
}

@media (max-width: 400px) {
  .qc-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
  .qc-stat { padding: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .qc-wrap, .qc-stat, .qc-action, .qc-order, .qc-skel, .qc-dot, .qc-spin, .qc-error-card { animation: none !important; }
  .qc-stat, .qc-action, .qc-refresh { transition: none !important; }
}
`;

export default QuickCommerceDashboard;