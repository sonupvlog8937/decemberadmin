import React, { useState, useContext, useEffect, useCallback } from "react";
import { FaPlus } from "react-icons/fa6";
import { Button, Pagination } from "@mui/material";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import "./style.css";
import "./dashboard-theme.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MyContext } from "../../App";
import SearchBox from "../../Components/SearchBox";
import AnimatedNumber from "../../Components/AnimatedNumber";
import { fetchDataFromApi } from "../../utils/api";
import Products from "../Products";
import QuickCommerceDashboard from "../QuickCommerce/QuickCommerceDashboard";
import { Link, useNavigate } from "react-router-dom";

const SELLER_ROLES = ['SELLER', 'GROCERY_SELLER', 'RESTAURANT_SELLER', 'FASHION_SELLER', 'ELECTRONICS_SELLER', 'MEDICAL_SELLER', 'BEAUTY_SELLER', 'HOME_KITCHEN_SELLER', 'GIFTS_TOYS_SELLER', 'BOOKS_STATIONERY_SELLER', 'JEWELLERY_SELLER', 'HARDWARE_SELLER', 'AUTOMOBILE_SELLER'];
const isSellerRole = (role) => SELLER_ROLES.includes(role);

// GoMarket shop sellers - all shop types (grocery, fashion, electronics, etc.)
const GO_MARKET_SHOP_SELLERS = [
  "GROCERY_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER",
  "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER",
  "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconBox      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconOrders   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconPending  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconDelivery = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconConfirm  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><polyline points="20 6 9 17 4 12"/></svg>;
const IconUsers    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconRevenue  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconCategory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTrend    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconStar     = ({ fill = false, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconRefresh  = ({ spin }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    style={spin ? { animation: "spin360 .7s linear infinite" } : {}}>
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);
const IconArrowRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconWallet = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5"/><path d="M21 12h-6a2 2 0 000 4h6v-4z"/></svg>;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, trend, trendLabel, delay = 0, loading }) => (
  <div className="stat-card" style={{ "--ac": accent, "--delay": `${delay}ms` }}>
    <div className="stat-card__top">
      <div className="stat-card__icon">{icon}</div>
      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? "stat-card__trend--up" : "stat-card__trend--down"}`}>
          <IconTrend /><span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    {loading
      ? <div className="stat-card__skel" />
      : <div className="stat-card__value"><AnimatedNumber value={value} /></div>
    }
    <div className="stat-card__label">{label}</div>
    {trendLabel && <div className="stat-card__sublabel">{trendLabel}</div>}
    <div className="stat-card__bar"><span className="stat-card__bar-fill" /></div>
  </div>
);

// ─── Quick Access ─────────────────────────────────────────────────────────────
const QuickAccess = ({ onAddProduct }) => {
  const items = [
    { label: "Products",    icon: <IconBox />,          to: "/products",         color: "#6366f1" },
    { label: "Orders",      icon: <IconOrders />,       to: "/orders",          color: "#0ea5e9" },
    { label: "Wallet",      icon: <IconWallet />,       to: "/wallet/transactions",          color: "#10b981" },
    { label: "Users",       icon: <IconUsers />,        to: "/users",           color: "#8b5cf6" },
    { label: "Categories",  icon: <IconCategory />,     to: "/category/list",        color: "#f97316" },
    { label: "Reviews",     icon: <IconStar fill />,    to: "/reviews",         color: "#ec4899" },
    { label: "Add Product", icon: <FaPlus size={15} />, onClick: onAddProduct,   color: "#14b8a6" },
    { label: "Analytics",   icon: <IconRevenue />,      to: "/order-analytics", color: "#f59e0b" },
  ];
  return (
    <div className="qa-grid">
      {items.map((it, i) => it.onClick ? (
        <button key={it.label} type="button" onClick={it.onClick} className="qa-card" style={{ "--qc": it.color, "--d": `${i * 45}ms` }}>
          <span className="qa-card__icon">{it.icon}</span>
          <span className="qa-card__label">{it.label}</span>
        </button>
      ) : (
        <Link key={it.label} to={it.to} className="qa-card" style={{ "--qc": it.color, "--d": `${i * 45}ms` }}>
          <span className="qa-card__icon">{it.icon}</span>
          <span className="qa-card__label">{it.label}</span>
        </Link>
      ))}
    </div>
  );
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    pending:   { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    confirmed: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
    delivered: { bg: "#dcfce7", text: "#166534", dot: "#10b981" },
    cancelled: { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" },
    shipped:   { bg: "#ede9fe", text: "#6b21a8", dot: "#8b5cf6" },
  };
  const s = map[status?.toLowerCase()] || { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.text, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
};

// ─── Mini Star Row ────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 12 }) => {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: r >= i ? "#fbbf24" : "#e2e8f0", display: "inline-flex" }}>
          <IconStar fill={r >= i} size={size} />
        </span>
      ))}
    </div>
  );
};

// ─── Reviews Section Component ────────────────────────────────────────────────
const ReviewsSection = ({ reviews, loading, onRefresh, refreshing }) => {
  const total = reviews.length;
  const avg = total > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : "0.0";
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const n = Math.round(Number(r.rating) || 0);
    if (n >= 1 && n <= 5) breakdown[n]++;
  });
  const recent = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const barBg = (star) =>
    star >= 4 ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
    : star === 3 ? "linear-gradient(90deg,#f97316,#fb923c)"
    : "linear-gradient(90deg,#f43f5e,#fb7185)";

  return (
    <div className="reviews-section">
      <div className="reviews-section__header">
        <div>
          <h2 className="dash-card__title">
            <span style={{ color: "#ec4899", display: "inline-flex" }}><IconStar fill size={15} /></span>
            Customer Reviews
            <span className="rev-live-dot" />
          </h2>
          <p className="dash-card__sub">
            {total > 0 ? `${total} total · avg ${avg} ★` : "No reviews yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} disabled={refreshing} className="rev-refresh-btn">
            <IconRefresh spin={refreshing} />
            {refreshing ? "Updating…" : "Refresh"}
          </button>
          <Link to="/reviews" className="rev-viewall-btn">
            View All <IconArrowRight />
          </Link>
        </div>
      </div>

      <div className="reviews-section__body">
        <div className="reviews-stats">
          <div className="reviews-avg-card">
            <div className="reviews-avg-number">
              {loading ? <span className="rev-skel rev-skel--lg" /> : avg}
            </div>
            <StarRow rating={Number(avg)} size={16} />
            <p className="reviews-avg-sub">
              {loading ? <span className="rev-skel rev-skel--sm" /> : `Based on ${total} reviews`}
            </p>
          </div>

          <div className="reviews-breakdown">
            {[5, 4, 3, 2, 1].map(star => {
              const count = breakdown[star];
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="rev-bar-row">
                  <span className="rev-bar-label">
                    {star}<IconStar fill size={9} />
                  </span>
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill" style={{ width: loading ? "0%" : `${pct}%`, background: barBg(star) }} />
                  </div>
                  <span className="rev-bar-count">{loading ? "—" : count}</span>
                </div>
              );
            })}
          </div>

          <div className="reviews-chips">
            {[
              { label: "Total",  val: total,                        color: "#6366f1", bg: "linear-gradient(135deg,#eef2ff,#f5f3ff)" },
              { label: "5 Star", val: breakdown[5],                 color: "#d97706", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)" },
              { label: "Low",    val: breakdown[1] + breakdown[2],  color: "#e11d48", bg: "linear-gradient(135deg,#fff1f2,#ffe4e6)" },
            ].map(c => (
              <div key={c.label} className="rev-chip" style={{ background: c.bg }}>
                <span className="rev-chip__val" style={{ color: c.color }}>
                  {loading ? "—" : <AnimatedNumber value={c.val} />}
                </span>
                <span className="rev-chip__label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-list">
          <p className="reviews-list__title">Recent reviews</p>
          {loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} className="rev-card-skel">
                  <div className="rev-skel rev-skel--avatar" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="rev-skel rev-skel--line" />
                    <div className="rev-skel rev-skel--line-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rev-empty">
              <IconStar size={34} />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div>
              {recent.map((r, i) => (
                <div key={r._id || i} className="rev-card" style={{ "--i": i }}>
                  <div className="rev-card__avatar">
                    {r.image
                      ? <img src={r.image} alt={r.userName} />
                      : <span>{r.userName?.[0]?.toUpperCase() || "U"}</span>
                    }
                  </div>
                  <div className="rev-card__body">
                    <div className="rev-card__top">
                      <span className="rev-card__name">{r.userName || "Anonymous"}</span>
                      <StarRow rating={Number(r.rating)} size={11} />
                      <span className="rev-card__date">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                      </span>
                    </div>
                    <p className="rev-card__text">
                      {r.review?.length > 90 ? r.review.slice(0, 90) + "…" : r.review || "—"}
                    </p>
                  </div>
                </div>
              ))}
              <Link to="/reviews" className="rev-seemore">
                See all {total} reviews →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VICE ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const VaStat = ({ icon, label, value, accent, delay = 0, onClick, loading }) => (
  <div
    onClick={onClick}
    className={`va-stat-card${onClick ? " is-click" : ""}`}
    style={{ "--ac": accent, "--delay": `${delay}ms` }}>
    <div className="va-stat-icon">{icon}</div>
    <div className="va-stat-content">
      {loading ? <div className="va-skel va-skel-lg" /> : <div className="va-stat-value"><AnimatedNumber value={value} /></div>}
      <div className="va-stat-label">{label}</div>
    </div>
  </div>
);

const VA_STATUS = {
  pending:   { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', icon: '✓' },
  shipped:   { bg: '#ede9fe', color: '#6b21a8', icon: '🚚' },
  delivered: { bg: '#d1fae5', color: '#065f46', icon: '✅' },
  cancelled: { bg: '#ffe4e6', color: '#9f1239', icon: '✕' },
};

const ViceAdminDashboard = ({ context }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const fetchDashboardData = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    Promise.all([
      fetchDataFromApi('/api/order/order-list?page=1&limit=1000'),
      fetchDataFromApi('/api/order/order-list?page=1&limit=10'),
    ]).then(([allOrdersRes, recentRes]) => {
      const allOrders = allOrdersRes?.data || [];

      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter(o => o.order_status?.toLowerCase() === 'pending').length;
      const confirmedOrders = allOrders.filter(o => o.order_status?.toLowerCase() === 'confirmed').length;
      const shippedOrders = allOrders.filter(o => o.order_status?.toLowerCase() === 'shipped').length;
      const deliveredOrders = allOrders.filter(o => o.order_status?.toLowerCase() === 'delivered').length;
      const cancelledOrders = allOrders.filter(o => o.order_status?.toLowerCase() === 'cancelled').length;
      const totalRevenue = allOrders.filter(o => o.order_status?.toLowerCase() === 'delivered')
        .reduce((sum, o) => sum + (Number(o.totalAmt) || 0), 0);

      setStats({
        totalOrders, pendingOrders, confirmedOrders, shippedOrders,
        deliveredOrders, cancelledOrders, totalRevenue
      });
      setRecentOrders(recentRes?.data || []);
    }).catch(err => {
      console.error('Vice Admin dashboard fetch error:', err);
      setStats({ totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, shippedOrders: 0,
        deliveredOrders: 0, cancelledOrders: 0, totalRevenue: 0 });
      setRecentOrders([]);
    }).finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const fmtCurrency = (n) => {
    const v = Number(n || 0);
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${fmt(v)}`;
  };

  const getStatusColor = (status) =>
    VA_STATUS[status?.toLowerCase() || ''] || { bg: '#f3f4f6', color: '#374151', icon: '●' };

  const filteredOrders = recentOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.order_status?.toLowerCase() === filterStatus;
    const matchesSearch = !searchQuery ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="va-container dx">
      <div className="va-hero">
        <div className="va-hero-content">
          <div className="va-hero-badge">👔 Vice Admin Control Panel</div>
          <h1 className="va-hero-title">
            {greeting}, {context?.userData?.name?.split(" ")[0]} 👋
          </h1>
          <p className="va-hero-subtitle">
            Manage and monitor all orders across the platform. You have full visibility into order operations.
            <span className="va-live-badge">
              <span className="va-live-dot" />
              Live Updates
            </span>
          </p>
          <div className="va-hero-actions">
            <Link to="/orders" className="va-hero-btn va-hero-btn-primary">
              <span>🛍️</span> View All Orders
            </Link>
            <button className="va-hero-btn va-hero-btn-secondary" onClick={() => fetchDashboardData(true)}>
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="va-stats-grid">
        <VaStat icon="📦" label="Total Orders" value={fmt(stats?.totalOrders || 0)}      accent="#3b82f6" delay={0}   loading={loading} onClick={() => navigate('/orders')} />
        <VaStat icon="⏳" label="Pending"      value={fmt(stats?.pendingOrders || 0)}    accent="#f59e0b" delay={70}  loading={loading} onClick={() => navigate('/orders')} />
        <VaStat icon="✓"  label="Confirmed"    value={fmt(stats?.confirmedOrders || 0)}  accent="#06b6d4" delay={140} loading={loading} onClick={() => navigate('/orders')} />
        <VaStat icon="🚚" label="Shipped"      value={fmt(stats?.shippedOrders || 0)}    accent="#8b5cf6" delay={210} loading={loading} onClick={() => navigate('/orders')} />
        <VaStat icon="✅" label="Delivered"    value={fmt(stats?.deliveredOrders || 0)}  accent="#10b981" delay={280} loading={loading} onClick={() => navigate('/orders')} />
        <VaStat icon="💰" label="Total Revenue" value={fmtCurrency(stats?.totalRevenue || 0)} accent="#ec4899" delay={350} loading={loading} />
      </div>

      <div className="va-toolbar">
        <h2 className="va-toolbar-title">Recent Orders</h2>
        <div className="va-toolbar-actions">
          <div className="va-search">
            <span className="va-search-icon">🔍</span>
            <input
              type="text"
              className="va-search-input"
              placeholder="Search by order ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="va-filter-btn" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="va-refresh-btn" onClick={() => fetchDashboardData(true)} disabled={refreshing}>
            <span className="va-refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="va-table-container">
        <div className="va-table-wrapper">
          {loading ? (
            <div className="va-empty">
              <div className="va-empty-icon">⏳</div>
              <div className="va-empty-title">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="va-empty">
              <div className="va-empty-icon">📭</div>
              <div className="va-empty-title">No orders found</div>
              <div className="va-empty-text">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Orders will appear here once customers start placing them'}
              </div>
            </div>
          ) : (
            <table className="va-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Status</th><th>Amount</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const statusStyle = getStatusColor(order.order_status);
                  return (
                    <tr key={order._id} style={{ "--i": idx }}>
                      <td><span className="va-order-id">#{order._id?.slice(-8) || 'N/A'}</span></td>
                      <td>
                        <div className="va-customer-info">
                          <div className="va-customer-avatar">{order.userId?.name?.[0]?.toUpperCase() || 'U'}</div>
                          <div className="va-customer-details">
                            <div className="va-customer-name">{order.userId?.name || 'Guest'}</div>
                            <div className="va-customer-email">{order.userId?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="va-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          <span>{statusStyle.icon}</span>
                          {order.order_status || 'Pending'}
                        </span>
                      </td>
                      <td><div className="va-amount">₹{fmt(order.totalAmt || 0)}</div></td>
                      <td>
                        <div className="va-date">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </div>
                      </td>
                      <td><Link to="/orders" className="va-action-btn">View Details</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DELIVERY RIDER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const DeliveryRiderDashboard = ({ context }) => {
  const [greeting, setGreeting] = useState("Hello");
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const fetchRiderData = () => {
    setLoading(true);
    Promise.all([
      fetchDataFromApi('/api/order/rider/stats'),
      fetchDataFromApi('/api/user/wallet/overview'),
      fetchDataFromApi('/api/order/rider/recent-deliveries?limit=5'),
    ]).then(([statsRes, walletRes, deliveriesRes]) => {
      setStats(statsRes?.stats || statsRes || { totalDelivered: 0, pending: 0, today: 0 });
      setWallet(walletRes?.wallet || { availableBalance: 0 });
      setRecentDeliveries(deliveriesRes?.deliveries || deliveriesRes?.data || []);
    }).catch(err => {
      console.error('Rider data fetch error:', err);
      setStats({ totalDelivered: 0, pending: 0, today: 0 });
      setWallet({ availableBalance: 0 });
      setRecentDeliveries([]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

  const riderCards = [
    { icon: "📦", label: "Total Deliveries", value: fmt(stats?.totalDelivered || 0),           accent: "#10b981" },
    { icon: "⏳", label: "Pending Pickups",  value: fmt(stats?.pending || 0),                   accent: "#f59e0b" },
    { icon: "🗓️", label: "Delivered Today",  value: fmt(stats?.today || 0),                     accent: "#3b82f6" },
    { icon: "💰", label: "Wallet Balance",   value: `₹${fmt(wallet?.availableBalance || 0)}`,   accent: "#ec4899" },
  ];

  return (
    <div className="rider-wrap dx">
      <div className="rider-hero">
        <h1 className="rider-hero__name">{greeting}, {context?.userData?.name?.split(" ")[0]} 🚴</h1>
        <p className="rider-hero__sub" style={{ marginBottom: 0 }}>Your delivery dashboard • Real-time stats</p>
      </div>

      <div className="rider-stats">
        {riderCards.map((c, i) => (
          <div key={c.label} className="rider-stat-card" style={{ "--ac": c.accent, "--delay": `${i * 70}ms` }}>
            <div className="rider-stat-icon">{c.icon}</div>
            {loading ? <div className="rider-skeleton" /> : <div className="rider-stat-value"><AnimatedNumber value={c.value} /></div>}
            <div className="rider-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rider-deliveries">
        <h3>Recent Deliveries</h3>
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="rider-delivery-item">
                <div style={{ flex: 1 }}>
                  <div className="rider-skeleton" style={{ width: '60%', marginBottom: 8 }} />
                  <div className="rider-skeleton" style={{ width: '40%', height: 12 }} />
                </div>
                <div className="rider-skeleton" style={{ width: 70 }} />
              </div>
            ))}
          </>
        ) : recentDeliveries.length === 0 ? (
          <div className="va-empty">
            <div className="va-empty-icon">📭</div>
            <div className="va-empty-title">No deliveries yet</div>
            <div className="va-empty-text">Check Available Orders to start delivering</div>
          </div>
        ) : (
          recentDeliveries.map((d, i) => (
            <div key={i} className="rider-delivery-item" style={{ "--i": i }}>
              <div>
                <div className="rider-delivery-id">Order #{d.orderId || d._id?.slice(-8) || 'N/A'}</div>
                <div className="rider-delivery-date">{d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString('en-IN') : 'Recently'}</div>
              </div>
              <div className="rider-delivery-amount">+₹{Number(d.riderEarning || d.amount || 50).toFixed(0)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const SBox = ({ icon, label, value, accent, sub, loading, delay = 0 }) => (
  <div className="sdb-box" style={{ "--ac": accent, "--delay": `${delay}ms` }}>
    <div className="sdb-box__top">
      <span className="sdb-box__icon">{icon}</span>
      {loading ? <div className="sdb-skel sdb-skel--sm" /> : <span className="sdb-box__value"><AnimatedNumber value={value} /></span>}
    </div>
    <p className="sdb-box__label">{label}</p>
    {sub && <p className="sdb-box__sub">{sub}</p>}
    <div className="sdb-box__bar" />
  </div>
);

const TrxRow = ({ trx, index }) => {
  const isDeposit = trx?.type === "DEPOSIT";
  const statusMap = {
    PENDING:  { bg: "#fef3c7", color: "#92400e" },
    APPROVED: { bg: "#dcfce7", color: "#166534" },
    REJECTED: { bg: "#ffe4e6", color: "#9f1239" },
  };
  const st = statusMap[trx?.status] || statusMap.PENDING;
  return (
    <tr className="sdb-trx__row" style={{ "--i": index }}>
      <td>
        <span className="sdb-trx__type"
          style={{ background: isDeposit ? "#dcfce7" : "#ffe4e6", color: isDeposit ? "#166534" : "#9f1239" }}>
          {isDeposit ? "↓ Deposit" : "↑ Withdraw"}
        </span>
      </td>
      <td className="sdb-trx__amt" style={{ color: isDeposit ? "#16a34a" : "#e11d48" }}>
        {isDeposit ? "+" : "−"}₹{Number(trx?.amount || 0).toLocaleString("en-IN")}
      </td>
      <td><span className="sdb-trx__badge" style={{ background: st.bg, color: st.color }}>{trx?.status}</span></td>
      <td className="sdb-trx__note">{trx?.note || "—"}</td>
      <td className="sdb-trx__date">{trx?.createdAt ? new Date(trx.createdAt).toLocaleDateString("en-IN") : "—"}</td>
    </tr>
  );
};

const SellerDashboard = ({ context }) => {
  const [stats,    setStats]    = useState(null);
  const [wallet,   setWallet]   = useState(null);
  const [trxList,  setTrxList]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [wLoading, setWLoading] = useState(true);
  const [error,    setError]    = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [greeting, setGreeting] = useState("Hello");
  const [showAllTrx, setShowAllTrx] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const fetchStats = () => {
    setLoading(true); setError(null);
    Promise.all([
      fetchDataFromApi("/api/order/seller/orders?page=1&limit=10000"),
      fetchDataFromApi("/api/product/seller/products"),
    ]).then(([ordersRes, productsRes]) => {
      const orders = ordersRes?.data || [];
      const totalProducts = productsRes?.total || productsRes?.products?.length || 0;
      let totalOrders = orders.length, pendingOrders = 0, confirmedOrders = 0;
      let shippedOrders = 0, deliveredOrders = 0, cancelledOrders = 0;
      let totalEarning = 0, pendingEarning = 0;
      for (const o of orders) {
        const st = (o.order_status || "").toLowerCase();
        const amt = Number(o.totalAmt || 0);
        if (st === "pending")   pendingOrders++;
        if (st === "confirmed") { confirmedOrders++; pendingEarning += amt; }
        if (st === "shipped")   { shippedOrders++;   pendingEarning += amt; }
        if (st === "delivered") { deliveredOrders++; totalEarning   += amt; }
        if (st === "cancelled") cancelledOrders++;
      }
      setStats({ totalProducts, totalOrders, pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders, totalEarning, pendingEarning });
      setLastSync(new Date());
    }).catch(() => setError("Network error — check connection")).finally(() => setLoading(false));
  };

  const fetchWallet = () => {
    setWLoading(true);
    fetchDataFromApi("/api/user/wallet/overview").then((res) => {
      if (res?.error === false || res?.success) {
        setWallet(res?.wallet || null);
        setTrxList(res?.transactions || []);
      }
    }).finally(() => setWLoading(false));
  };

  useEffect(() => {
    fetchStats(); fetchWallet();
    const id = setInterval(() => { fetchStats(); fetchWallet(); }, 60000);
    return () => clearInterval(id);
  }, []);

  const fmt  = (n) => Number(n || 0).toLocaleString("en-IN");
  const fmtR = (n) => {
    const v = Number(n || 0);
    if (!v) return "₹0";
    return v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${fmt(v)}`;
  };

  const s = stats || {};
  const visibleTrx = showAllTrx ? trxList : trxList.slice(0, 5);
  const svg = (d) => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{d}</svg>;

  const statBoxes = [
    { icon: <IconBox />,      label: "Total Products",   value: fmt(s.totalProducts),   accent: "#6366f1", sub: "In your store",     delay: 0   },
    { icon: <IconOrders />,   label: "Total Orders",     value: fmt(s.totalOrders),     accent: "#0ea5e9", sub: "All time",          delay: 50  },
    { icon: <IconPending />,  label: "Pending Orders",   value: fmt(s.pendingOrders),   accent: "#f59e0b", sub: "Awaiting action",   delay: 100 },
    { icon: <IconConfirm />,  label: "Confirmed Orders", value: fmt(s.confirmedOrders), accent: "#10b981", sub: "Ready to ship",     delay: 150 },
    { icon: svg(<path d="M5 12h14M12 5l7 7-7 7"/>),
      label: "Shipped",       value: fmt(s.shippedOrders),   accent: "#8b5cf6", sub: "Out for delivery",  delay: 200 },
    { icon: <IconDelivery />, label: "Delivered",        value: fmt(s.deliveredOrders), accent: "#3b82f6", sub: "Completed",         delay: 250 },
    { icon: svg(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
      label: "Cancelled",     value: fmt(s.cancelledOrders), accent: "#f43f5e", sub: "Refunded/closed",   delay: 300 },
    { icon: <IconRevenue />,  label: "Total Earnings",   value: fmtR(s.totalEarning),   accent: "#14b8a6", sub: "Delivered orders",  delay: 350 },
    { icon: svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
      label: "Pending Earn",  value: fmtR(s.pendingEarning), accent: "#ec4899", sub: "Confirmed+shipped", delay: 400 },
  ];

  const walletCards = [
    { label: "Available Balance", val: fmtR(wallet?.availableBalance), accent: "#10b981",
      icon: svg(<><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>) },
    { label: "Total Deposited",   val: fmtR(wallet?.totalDeposited),   accent: "#6366f1",
      icon: svg(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>) },
    { label: "Total Withdrawn",   val: fmtR(wallet?.totalWithdrawn),   accent: "#f59e0b",
      icon: svg(<path d="M5 12h14M12 19l7-7-7-7"/>) },
  ];

  return (
    <div className="sdb-wrap dx">
      <div className="sdb-hero">
        <div className="sdb-hero__dots" />
        <div className="sdb-hero__left">
          <p className="sdb-hero__tag">Seller Dashboard</p>
          <h1 className="sdb-hero__name">{greeting}, {context?.userData?.name?.split(" ")[0]} 👋</h1>
          <p className="sdb-hero__sub">{context?.userData?.storeProfile?.storeName ? `${context.userData.storeProfile.storeName} — live store analytics` : "Your real-time store performance at a glance"}</p>
          <div className="sdb-hero__live"><span className="sdb-dot" />Live · Auto-refresh 60s</div>
        </div>
        <div className="sdb-hero__right">
          <div className="sdb-hero__pill">
            <p className="sdb-hero__pill-lbl">Total Earnings</p>
            <p className="sdb-hero__pill-val">{loading ? "…" : fmtR(s.totalEarning)}</p>
          </div>
          <div className="sdb-hero__pill">
            <p className="sdb-hero__pill-lbl">Orders</p>
            <p className="sdb-hero__pill-val">{loading ? "…" : fmt(s.totalOrders)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="sdb-err">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}<button onClick={fetchStats}>Retry</button>
        </div>
      )}

      <div className="sdb-toolbar">
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Store Overview</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastSync && <span className="sdb-sync">Updated {lastSync.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button className="sdb-refresh" onClick={() => { fetchStats(); fetchWallet(); }} disabled={loading}>
            <IconRefresh spin={loading} />{loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="sdb-grid">{statBoxes.map((b, i) => <SBox key={i} {...b} loading={loading} />)}</div>

      <div className="sdb-toolbar"><div className="sdb-section-lbl" style={{ flex: 1 }}>Wallet & Earnings</div></div>
      <div className="sdb-wallet-grid">
        {walletCards.map((w, i) => (
          <div key={i} className="sdb-wallet-card" style={{ "--ac": w.accent, animationDelay: `${i * 70}ms` }}>
            <div className="sdb-wallet-card__icon">{w.icon}</div>
            <div>
              <p className="sdb-wallet-card__lbl">{w.label}</p>
              {wLoading ? <div className="sdb-skel sdb-skel--md" /> : <p className="sdb-wallet-card__val">{w.val}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="sdb-toolbar"><div className="sdb-section-lbl" style={{ flex: 1 }}>Transaction History</div></div>
      <div className="sdb-trx-wrap">
        <div className="sdb-trx-header">
          <span className="sdb-trx-title">Wallet Transactions</span>
          <span className="sdb-trx-count">{trxList.length} total</span>
        </div>
        {wLoading ? (
          <div style={{ padding: 16 }}>{[1, 2, 3].map(i => <div key={i} className="sdb-skel sdb-skel--md" style={{ marginBottom: 10 }} />)}</div>
        ) : trxList.length === 0 ? (
          <div className="sdb-trx-empty">No transactions yet</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="sdb-trx">
                <thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th></tr></thead>
                <tbody>{visibleTrx.map((trx, i) => <TrxRow key={trx?._id || i} trx={trx} index={i} />)}</tbody>
              </table>
            </div>
            {trxList.length > 5 && (
              <div className="sdb-showall">
                <button onClick={() => setShowAllTrx(p => !p)}>
                  {showAllTrx ? "Show less ↑" : `Show all ${trxList.length} transactions ↓`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="sdb-toolbar"><div className="sdb-section-lbl" style={{ flex: 1 }}>Your Products</div></div>
      <Products />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [page,               setPage]               = useState(0);
  const [rowsPerPage,        setRowsPerPage]         = useState(50);
  const [chartData,          setChartData]           = useState([]);
  const [productData,        setProductData]         = useState([]);
  const [productTotalData,   setProductTotalData]    = useState([]);
  const [ordersData,         setOrdersData]          = useState([]);
  const [orders,             setOrders]              = useState([]);
  const [pageOrder,          setPageOrder]           = useState(1);
  const [orderSearchQuery,   setOrderSearchQuery]    = useState("");
  const [orderStatusFilter,  setOrderStatusFilter]   = useState("all");
  const [totalOrdersData,    setTotalOrdersData]     = useState([]);
  const [users,              setUsers]               = useState([]);
  const [allReviews,         setAllReviews]          = useState([]);
  const [reviewsLoading,     setReviewsLoading]      = useState(true);
  const [reviewsRefreshing,  setReviewsRefreshing]   = useState(false);
  const [ordersCount,        setOrdersCount]         = useState(null);
  const [statsLoading,       setStatsLoading]        = useState(true);
  const [orderStats,         setOrderStats]          = useState({
    total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0, shipped: 0
  });
  const [lastSync,           setLastSync]            = useState(null);

  const context       = useContext(MyContext);
  const isSellerPanel = isSellerRole(context?.userData?.role);
  const isDeliveryRider = context?.userData?.role === "DELIVERY_RIDER";
  const isViceAdmin = context?.userData?.role === "VICE_ADMIN";

  // Check if seller is a QuickCommerce seller (all shop sellers + restaurant)
  const isQuickCommerceSeller = GO_MARKET_SHOP_SELLERS.includes(context?.userData?.role) || context?.userData?.role === "RESTAURANT_SELLER";

  useEffect(() => {
    context?.setProgress(30);
    getProducts(page, rowsPerPage);
  }, [isSellerPanel]);

  // Fetch reviews (with live refresh support)
  const fetchReviews = useCallback((silent = false) => {
    if (!silent) setReviewsLoading(true);
    else setReviewsRefreshing(true);
    fetchDataFromApi("/api/user/getAllReviews").then((res) => {
      // Handle all response shapes: { reviews:[] } or { data:[] } or []
      const data = Array.isArray(res)
        ? res
        : res?.reviews || res?.data || [];
      setAllReviews(data);
    }).catch(() => {
      setAllReviews([]);
    }).finally(() => {
      setReviewsLoading(false);
      setReviewsRefreshing(false);
    });
  }, []);

  useEffect(() => {
    if (isSellerPanel) return;

    // Paginated orders for table
    fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
      if (res?.error === false) { setOrders(res); setOrdersData(res?.data); }
    });

    // All orders for revenue/stats calculation
    fetchDataFromApi(`/api/order/order-list`).then((res) => {
      if (res?.error === false) {
        setTotalOrdersData(res);
        setStatsLoading(false);
        setLastSync(new Date());
      }
    });

    // Order count (supplemental)
    fetchDataFromApi(`/api/order/count`).then((res) => {
      if (res?.error === false) setOrdersCount(res?.count);
    });

    // Status breakdown (supplemental — fills orderStats if API exists)
    fetchDataFromApi(`/api/order/status-count`).then((res) => {
      if (res?.error === false || res?.success) {
        setOrderStats({
          total:     res?.total     || res?.count?.total     || 0,
          pending:   res?.pending   || res?.count?.pending   || 0,
          confirmed: res?.confirmed || res?.count?.confirmed || 0,
          delivered: res?.delivered || res?.count?.delivered || 0,
          cancelled: res?.cancelled || res?.count?.cancelled || 0,
          shipped:   res?.shipped   || res?.count?.shipped   || 0,
        });
        setLastSync(new Date());
      }
    }).catch(() => {
      // status-count may not exist — loading already stopped above
    });
  }, [pageOrder, isSellerPanel]);

  useEffect(() => {
    if (isSellerPanel) return;
    if (orderSearchQuery !== "") {
      const filtered = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.email?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.createdAt?.includes(orderSearchQuery)
      );
      setOrdersData(filtered);
    } else {
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) { setOrders(res); setOrdersData(res?.data); }
      });
    }
  }, [orderSearchQuery, isSellerPanel]);

  useEffect(() => {
    if (isSellerPanel) return;
    getTotalSalesByYear();
    fetchDataFromApi("/api/user/getAllUsers").then((res) => {
      if (res?.error === false) setUsers(res?.users);
    });
    fetchReviews();
    // Live review count refresh every 60s
    const id = setInterval(() => fetchReviews(true), 60000);
    return () => clearInterval(id);
  }, [isSellerPanel]);

  const getProducts = async (p, limit) => {
    fetchDataFromApi(`/api/product/getAllProducts?page=${p + 1}&limit=${limit}`).then((res) => {
      setProductData(res); setProductTotalData(res); context?.setProgress(100);
    });
  };

  const getTotalUsersByYear = () => {
    fetchDataFromApi(`/api/order/users`).then((res) => {
      const u = (res?.TotalUsers || []).map(item => ({ name: item?.name, TotalUsers: parseInt(item?.TotalUsers) }));
      setChartData(u.filter((obj, i, self) => i === self.findIndex(t => t.name === obj.name)));
    });
  };

  const getTotalSalesByYear = () => {
    fetchDataFromApi(`/api/order/sales`).then((res) => {
      const s = (res?.monthlySales || []).map(item => ({ name: item?.name, TotalSales: parseInt(item?.TotalSales) }));
      setChartData(s.filter((obj, i, self) => i === self.findIndex(t => t.name === obj.name)));
    });
  };

  const isShowOrderdProduct = (index) => setIsOpenOrderdProduct(isOpenOrderdProduct === index ? null : index);

  const handleExportCSV = () => {
    const rows = ordersData || [];
    if (!rows.length) return;
    const header = ["Order ID", "Customer", "Phone", "Amount", "Status", "Date"];
    const csvRows = rows.map((o) => [
      o?._id || "", o?.userId?.name || "", o?.delivery_address?.mobile || "",
      o?.totalAmt || 0, o?.order_status || "", o?.createdAt?.split("T")[0] || "",
    ]);
    const csvContent = [header, ...csvRows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const allOrders      = totalOrdersData?.data || [];
  const totalRevenue   = allOrders.reduce((s, o) => s + (Number(o?.totalAmt) || 0), 0);
  const pendingCount   = orderStats.pending   || allOrders.filter(o => o?.order_status?.toLowerCase() === "pending").length;
  const confirmedCount = orderStats.confirmed || allOrders.filter(o => o?.order_status?.toLowerCase() === "confirmed").length;
  const deliveredCount = orderStats.delivered || allOrders.filter(o => o?.order_status?.toLowerCase() === "delivered").length;
  const totalProducts  = productData?.products?.length || productData?.totalProducts || 0;

  const visibleOrders = (ordersData || []).filter(
    (o) => orderStatusFilter === "all" || o?.order_status?.toLowerCase() === orderStatusFilter
  );

  if (isDeliveryRider) return <DeliveryRiderDashboard context={context} />;
  if (isQuickCommerceSeller) return <QuickCommerceDashboard />;
  if (isSellerPanel) return <SellerDashboard context={context} />;
  if (isViceAdmin) return <ViceAdminDashboard context={context} />;

  const revenueLabel = totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : "—";
  const ordersTotalLabel = (ordersCount || orderStats.total || allOrders.length)?.toLocaleString("en-IN");

  return (
    <div className="dash-page dx">
      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="dash-hero__dots" />
        <div className="dash-hero__content">
          <p className="dash-hero__eyebrow">Admin Dashboard</p>
          <h1 className="dash-hero__name">{context?.userData?.name} 👋</h1>
          <p className="dash-hero__sub">Here's what's happening in your store today.</p>
          <Button className="dash-hero__btn !capitalize"
            onClick={() => context?.setIsOpenFullScreenPanel?.({ open: true, model: "Add Product" })}>
            <FaPlus style={{ marginRight: 6 }} /> Add Product
          </Button>
        </div>
        <div className="dash-hero__stats">
          <div className="dash-hero__pill">
            <p className="dash-hero__pill-lbl">Revenue</p>
            <p className="dash-hero__pill-val"><AnimatedNumber value={revenueLabel} /></p>
          </div>
          <div className="dash-hero__pill">
            <p className="dash-hero__pill-lbl">Total Orders</p>
            <p className="dash-hero__pill-val"><AnimatedNumber value={ordersTotalLabel || "—"} /></p>
          </div>
          <div className="dash-hero__live">
            <span className="dash-live-dot" /> Live · Auto-refresh 60s
          </div>
        </div>
        <img src="/shop-illustration.webp" className="dash-hero__img" alt="" />
      </div>

      {/* ── Quick Access ── */}
      <p className="dash-section-lbl">Quick Access</p>
      <QuickAccess onAddProduct={() => context?.setIsOpenFullScreenPanel?.({ open: true, model: "Add Product" })} />

      {/* ── Sync bar ── */}
      <div className="dash-syncbar">
        <div className="dash-syncbar__left">
          <span className="dash-syncbar__dot" />
          <span>Dashboard data is live</span>
          {lastSync && <span className="dash-syncbar__time">· Last synced {lastSync.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
        </div>
        <button className="dash-refresh-btn" onClick={() => window.location.reload()}>
          <IconRefresh /> Refresh All
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <p className="dash-section-lbl">Store Overview</p>
      <div className="stats-grid">
        <StatCard icon={<IconBox />}       label="Total Products" value={totalProducts?.toLocaleString("en-IN")}  accent="#6366f1" trend={4.2}  trendLabel="vs last month"     delay={0}   loading={statsLoading} />
        <StatCard icon={<IconOrders />}    label="Total Orders"   value={ordersTotalLabel}                        accent="#0ea5e9" trend={8.1}  trendLabel="vs last month"     delay={50}  loading={statsLoading} />
        <StatCard icon={<IconPending />}   label="Pending"        value={pendingCount?.toLocaleString("en-IN")}   accent="#f59e0b"              trendLabel="Awaiting action"   delay={100} loading={statsLoading} />
        <StatCard icon={<IconConfirm />}   label="Confirmed"      value={confirmedCount?.toLocaleString("en-IN")} accent="#10b981"              trendLabel="Ready to ship"     delay={150} loading={statsLoading} />
        <StatCard icon={<IconDelivery />}  label="Delivered"      value={deliveredCount?.toLocaleString("en-IN")} accent="#3b82f6" trend={12.5} trendLabel="vs last month"     delay={200} loading={statsLoading} />
        <StatCard icon={<IconUsers />}     label="Total Users"    value={users?.length?.toLocaleString("en-IN")}  accent="#8b5cf6" trend={3.7}  trendLabel="New signups"       delay={250} loading={statsLoading} />
        <StatCard icon={<IconStar fill />} label="Reviews"        value={allReviews?.length?.toLocaleString("en-IN")} accent="#ec4899"          trendLabel="Customer ratings"  delay={300} loading={reviewsLoading} />
        <StatCard icon={<IconRevenue />}   label="Total Revenue"  value={revenueLabel}                            accent="#14b8a6" trend={6.4}  trendLabel="Gross sales"       delay={350} loading={statsLoading} />
        <StatCard icon={<IconCategory />}  label="Categories"     value={context?.catData?.length?.toLocaleString("en-IN")} accent="#f97316"    trendLabel="Active categories" delay={400} />
      </div>

      {/* ── Reviews Section ── */}
      <p className="dash-section-lbl">Reviews Overview</p>
      <ReviewsSection
        reviews={allReviews}
        loading={reviewsLoading}
        refreshing={reviewsRefreshing}
        onRefresh={() => fetchReviews(true)}
      />

      {/* ── Products Table ── */}
      <p className="dash-section-lbl">Products</p>
      <Products />

      {/* ── Recent Orders ── */}
      <p className="dash-section-lbl" style={{ marginTop: 22 }}>Recent Orders</p>
      <div className="dash-card">
        <div className="dash-card__header">
          <div>
            <h2 className="dash-card__title">Recent Orders</h2>
            <p className="dash-card__sub">Latest {visibleOrders?.length || 0} orders from your store</p>
          </div>
          <div className="dash-card__actions">
            <div className="dash-card__search">
              <SearchBox searchQuery={orderSearchQuery} setSearchQuery={setOrderSearchQuery} setPageOrder={setPageOrder} />
            </div>
            <button className="dash-export-btn" onClick={handleExportCSV} title="Export visible orders as CSV">
              ⬇ Export CSV
            </button>
          </div>
        </div>

        <div className="dash-status-chips">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              className={`dash-chip${orderStatusFilter === st ? " active" : ""}`}
              onClick={() => setOrderStatusFilter(st)}
            >
              {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th></th><th>Order ID</th><th>Payment</th><th>Customer</th>
                <th>Phone</th><th>Address</th><th>Pincode</th>
                <th>Amount</th><th>Email</th><th>User ID</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders?.length > 0 && visibleOrders.map((order, index) => (
                <React.Fragment key={order._id}>
                  <tr className="dash-table__row" style={{ "--i": index }}>
                    <td>
                      <button className="dash-expand-btn" onClick={() => isShowOrderdProduct(index)}>
                        {isOpenOrderdProduct === index ? <FaAngleUp className="text-[13px]" /> : <FaAngleDown className="text-[13px]" />}
                      </button>
                    </td>
                    <td data-label="Order ID"><span className="dash-table__id">#{order?._id?.slice(-8)}</span></td>
                    <td data-label="Payment">
                      <span className="dash-table__payment">
                        {order?.paymentId ? order?.paymentId?.slice(0, 14) + "…" : <span className="dash-table__cod">COD</span>}
                      </span>
                    </td>
                    <td data-label="Customer" className="whitespace-nowrap font-[600]">{order?.userId?.name}</td>
                    <td data-label="Phone" className="whitespace-nowrap">{order?.delivery_address?.mobile}</td>
                    <td data-label="Address">
                      <div className="dash-table__address">
                        <span className="dash-table__addr-type">{order?.delivery_address?.addressType}</span>
                        <span className="dash-table__addr-text">
                          {[order?.delivery_address?.address_line1, order?.delivery_address?.city, order?.delivery_address?.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </td>
                    <td data-label="Pincode" className="whitespace-nowrap">{order?.delivery_address?.pincode}</td>
                    <td data-label="Amount"><span className="dash-table__amt">₹{Number(order?.totalAmt || 0).toLocaleString("en-IN")}</span></td>
                    <td data-label="Email" className="text-[11px] text-[#64748b]">{order?.userId?.email}</td>
                    <td data-label="User ID"><span className="dash-table__uid">{order?.userId?._id?.slice(-8)}</span></td>
                    <td data-label="Status"><StatusPill status={order?.order_status} /></td>
                    <td data-label="Date" className="whitespace-nowrap text-[11px] text-[#64748b]">{order?.createdAt?.split("T")[0]}</td>
                  </tr>

                  {isOpenOrderdProduct === index && (
                    <tr className="dash-table__expand">
                      <td colSpan="12">
                        <div className="dash-expand-wrap">
                          <p className="dash-expand-title">
                            📦 Order Items — {order?.products?.length} product{order?.products?.length !== 1 ? "s" : ""}
                          </p>
                          <table className="dash-inner-table">
                            <thead>
                              <tr><th>Product</th><th>Image</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                            </thead>
                            <tbody>
                              {order?.products?.map((item, i) => (
                                <tr key={i}>
                                  <td>
                                    <div className="dash-inner-table__name">{item?.productTitle}</div>
                                    <div className="dash-inner-table__id">{item?._id}</div>
                                  </td>
                                  <td><img src={item?.image} alt={item?.productTitle} className="w-[38px] h-[38px] rounded-lg object-cover border border-[#e2e8f0]" /></td>
                                  <td className="font-[700]">{item?.quantity}</td>
                                  <td>{item?.price?.toLocaleString("en-US", { style: "currency", currency: "INR" })}</td>
                                  <td className="font-[700] text-[#16a34a]">{(item?.price * item?.quantity)?.toLocaleString("en-US", { style: "currency", currency: "INR" })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {(!visibleOrders || visibleOrders.length === 0) && <div className="dash-empty">No orders found</div>}
        </div>

        {orders?.totalPages > 1 && (
          <div className="flex items-center justify-center py-4">
            <Pagination showFirstButton showLastButton count={orders?.totalPages} page={pageOrder}
              onChange={(e, value) => setPageOrder(value)} />
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <p className="dash-section-lbl">Analytics</p>
      <div className="dash-card" id="analytics-section">
        <div className="dash-card__header">
          <div>
            <h2 className="dash-card__title">Monthly Analytics</h2>
            <p className="dash-card__sub">Trends for users & sales</p>
          </div>
          <div className="flex gap-2">
            <button className="dash-chart-toggle" onClick={getTotalUsersByYear}>
              <span className="dash-chart-dot" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />Total Users
            </button>
            <button className="dash-chart-toggle" onClick={getTotalSalesByYear}>
              <span className="dash-chart-dot" style={{ background: "linear-gradient(135deg,#10b981,#14b8a6)" }} />Total Sales
            </button>
          </div>
        </div>
        <div className="dash-chart">
          {chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 14, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#5eead4" />
                  </linearGradient>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 10, color: "#fff", fontSize: 12, boxShadow: "0 12px 24px -10px rgba(30,27,75,.5)" }}
                  labelStyle={{ color: "#fbbf24" }} itemStyle={{ color: "#a5f3fc" }}
                  cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="TotalSales" fill="url(#gSales)" radius={[7, 7, 0, 0]} maxBarSize={40} animationDuration={900} />
                <Bar dataKey="TotalUsers" fill="url(#gUsers)" radius={[7, 7, 0, 0]} maxBarSize={40} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="dash-empty" style={{ height: 200 }}>
              Click "Total Users" or "Total Sales" to load chart
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;