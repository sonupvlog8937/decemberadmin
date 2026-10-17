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
import AnimatedNumber from "../../Components/AnimatedNumber";
import "../Dashboard/dashboard-theme.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtR = (n) => `₹${fmt(n)}`;

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

// Theme configuration for all seller types
const THEMES = {
  GROCERY_SELLER: { primary: "#059669", gradient: "linear-gradient(120deg, #059669 0%, #10b981 35%, #14b8a6 65%, #0ea5e9 100%)", tag: "Quick Grocery", icon: "🛒" },
  RESTAURANT_SELLER: { primary: "#ea580c", gradient: "linear-gradient(120deg, #ef4444 0%, #f97316 40%, #f59e0b 70%, #ec4899 100%)", tag: "Quick Restaurant", icon: "🍽️" },
  FASHION_SELLER: { primary: "#ec4899", gradient: "linear-gradient(120deg, #ec4899 0%, #d946ef 40%, #8b5cf6 70%, #f43f5e 100%)", tag: "Fashion Store", icon: "👕" },
  ELECTRONICS_SELLER: { primary: "#3b82f6", gradient: "linear-gradient(120deg, #2563eb 0%, #3b82f6 35%, #6366f1 68%, #06b6d4 100%)", tag: "Electronics Store", icon: "📱" },
  MEDICAL_SELLER: { primary: "#ef4444", gradient: "linear-gradient(120deg, #ef4444 0%, #f43f5e 38%, #ec4899 70%, #f97316 100%)", tag: "Medical Store", icon: "💊" },
  BEAUTY_SELLER: { primary: "#d946ef", gradient: "linear-gradient(120deg, #d946ef 0%, #c026d3 35%, #ec4899 68%, #8b5cf6 100%)", tag: "Beauty Store", icon: "💄" },
  HOME_KITCHEN_SELLER: { primary: "#f59e0b", gradient: "linear-gradient(120deg, #f59e0b 0%, #f97316 38%, #ef4444 70%, #ec4899 100%)", tag: "Home & Kitchen", icon: "🏠" },
  GIFTS_TOYS_SELLER: { primary: "#f472b6", gradient: "linear-gradient(120deg, #f472b6 0%, #ec4899 38%, #a855f7 70%, #6366f1 100%)", tag: "Gifts & Toys", icon: "🎁" },
  BOOKS_STATIONERY_SELLER: { primary: "#8b5cf6", gradient: "linear-gradient(120deg, #8b5cf6 0%, #6366f1 38%, #0ea5e9 70%, #14b8a6 100%)", tag: "Books & Stationery", icon: "📚" },
  JEWELLERY_SELLER: { primary: "#f59e0b", gradient: "linear-gradient(120deg, #fbbf24 0%, #f59e0b 35%, #f97316 68%, #ec4899 100%)", tag: "Jewellery Store", icon: "💎" },
  HARDWARE_SELLER: { primary: "#6366f1", gradient: "linear-gradient(120deg, #475569 0%, #6366f1 40%, #0ea5e9 72%, #14b8a6 100%)", tag: "Hardware Store", icon: "🔧" },
  AUTOMOBILE_SELLER: { primary: "#14b8a6", gradient: "linear-gradient(120deg, #0d9488 0%, #14b8a6 35%, #0ea5e9 68%, #6366f1 100%)", tag: "Automobile Store", icon: "🚗" },
};

const QuickCommerceDashboard = () => {
  const context = useContext(MyContext);
  const role = context?.userData?.role;
  const theme = THEMES[role] || THEMES.GROCERY_SELLER;

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
  const displayDeliveryMinutes = isGrocery || isRestaurant ? 0 : outlet?.deliveryMinutes ?? "—";

  // Generic labels based on seller type
  const getControlLabel = () => (isRestaurant ? "Kitchen controls" : "Store controls");
  const getInventoryLabel = () => (isRestaurant ? "Manage menu" : "Manage inventory");

  const quickActions = [
    { to: "/seller/store-ops", label: getControlLabel(), sub: "Open / pause · delivery SLA", icon: <FaSlidersH size={15} />, color: "#6366f1" },
    { to: "/products", label: getInventoryLabel(), sub: `${catalog.totalItems || 0} items live`, icon: <FaBoxOpen size={15} />, color: "#0ea5e9" },
    { to: "/orders", label: "Live orders", sub: `${stats.activeOrders || 0} need attention`, highlight: (stats.pendingOrders || 0) > 0, icon: <FaClipboardList size={15} />, color: "#f59e0b" },
    { to: "/wallet/transactions", label: "Earnings & wallet", sub: "Payouts & balance", icon: <FaWallet size={15} />, color: "#10b981" },
  ];

  const statCards = isGrocery
    ? [
        { label: "Today's orders", value: stats.todayOrders, accent: "#6366f1" },
        { label: "Today's revenue", value: fmtR(stats.todayRevenue), accent: "#10b981" },
        { label: "New orders", value: stats.pendingOrders, accent: "#f59e0b", alert: stats.pendingOrders > 0, to: "/orders" },
        { label: "Low stock", value: catalog.lowStock, accent: "#f97316", alert: catalog.lowStock > 0, to: "/products" },
        { label: "Out of stock", value: catalog.outOfStock, accent: "#f43f5e", alert: catalog.outOfStock > 0, to: "/products" },
        { label: "Delivered today", value: stats.deliveredToday, accent: "#0ea5e9" },
      ]
    : [
        { label: "Today's orders", value: stats.todayOrders, accent: "#6366f1" },
        { label: "Today's revenue", value: fmtR(stats.todayRevenue), accent: "#10b981" },
        { label: "New orders", value: stats.pendingOrders, accent: "#f59e0b", alert: stats.pendingOrders > 0, to: "/orders" },
        { label: "Preparing", value: stats.preparingOrders, accent: "#8b5cf6" },
        { label: "Unavailable dishes", value: catalog.unavailable, accent: "#f43f5e", alert: catalog.unavailable > 0, to: "/products" },
        { label: "Menu items", value: catalog.totalItems, accent: "#0ea5e9" },
      ];

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return null;
    return new Date(lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }, [lastUpdated]);

  return (
    <div className="qc-wrap dx" style={{ "--accent": theme.primary, "--hg": theme.gradient }}>
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
          <FaExclamationTriangle size={20} color="#f43f5e" />
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
                <FaSyncAlt size={11} style={refreshing ? { animation: "dxSpin .8s linear infinite" } : undefined} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="qc-stats">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="qc-skel" />)}</div>
          ) : (
            <div className="qc-stats">
              {statCards.map((c, i) => {
                const inner = (
                  <>
                    <div className="qc-stat-val"><AnimatedNumber value={c.value ?? 0} /></div>
                    <div className="qc-stat-lbl">{c.label}</div>
                    <div className="qc-stat-bar" />
                    {c.to && <FaChevronRight size={10} className="qc-stat-arrow" />}
                  </>
                );
                const className = `qc-stat${c.alert ? " alert" : ""}${c.to ? " clickable" : ""}`;
                const style = { "--ac": c.accent, "--delay": `${i * 45}ms` };
                return c.to ? (
                  <Link key={c.label} to={c.to} className={className} style={style}>{inner}</Link>
                ) : (
                  <div key={c.label} className={className} style={style}>{inner}</div>
                );
              })}
            </div>
          )}

          <div className="qc-toolbar">
            <span className="qc-section">Quick actions</span>
          </div>
          <div className="qc-actions">
            {quickActions.map((a, i) => (
              <Link
                key={a.to}
                to={a.to}
                className={`qc-action${a.highlight ? " highlight" : ""}`}
                style={{ "--ac": a.color, "--delay": `${i * 50}ms` }}
              >
                <span className="qc-action-icon">{a.icon}</span>
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
              <div style={{ padding: 14 }}><div className="qc-skel" /></div>
            ) : recentOrders.length === 0 ? (
              <div className="qc-empty">
                <div className="qc-empty-icon">📦</div>
                No orders yet. When customers order, they appear here in real time.
              </div>
            ) : (
              recentOrders.map((o, i) => (
                <div key={o._id} className="qc-order" style={{ "--i": i }}>
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
                    <div style={{ marginTop: 5 }}><StatusPill status={o.order_status} /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickCommerceDashboard;