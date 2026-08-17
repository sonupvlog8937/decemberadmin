import React, { useState, useContext, useEffect, useCallback } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { FaPlus } from "react-icons/fa6";
import { Button, Pagination } from "@mui/material";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import "./style.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MyContext } from "../../App";
import SearchBox from "../../Components/SearchBox";
import { fetchDataFromApi, deleteData } from "../../utils/api";
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
const IconBox      = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconOrders   = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconPending  = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconDelivery = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconConfirm  = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>;
const IconUsers    = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconRevenue  = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconCategory = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTrend    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconStar     = ({ fill = false, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconRefresh  = ({ spin }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    style={spin ? { animation: "spin360 .7s linear infinite" } : {}}>
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);
const IconArrowRight = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconWallet = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5"/><path d="M21 12h-6a2 2 0 000 4h6v-4z"/></svg>;
const IconSettings = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, trend, trendLabel, delay = 0, loading }) => (
  <div className="stat-card" style={{ "--accent": accent, "--delay": `${delay}ms` }}>
    <div className="stat-card__top">
      <div className="stat-card__icon" style={{ background: `${accent}18`, color: accent }}>{icon}</div>
      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? "stat-card__trend--up" : "stat-card__trend--down"}`}>
          <IconTrend /><span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    {loading
      ? <div className="stat-card__skel" />
      : <div className="stat-card__value">{value ?? "—"}</div>
    }
    <div className="stat-card__label">{label}</div>
    {trendLabel && <div className="stat-card__sublabel">{trendLabel}</div>}
    <div className="stat-card__bar"><div className="stat-card__bar-fill" style={{ background: accent }} /></div>
  </div>
);

// ─── Quick Access ─────────────────────────────────────────────────────────────
const QuickAccess = ({ onAddProduct, onScrollToAnalytics }) => {
  const items = [
    { label: "Products",    icon: <IconBox />,        to: "/product",   color: "#6366f1" },
    { label: "Orders",      icon: <IconOrders />,     to: "/orders",    color: "#0ea5e9" },
    { label: "Wallet",      icon: <IconWallet />,     to: "/wallet",    color: "#10b981" },
    { label: "Users",       icon: <IconUsers />,      to: "/users",     color: "#8b5cf6" },
    { label: "Categories",  icon: <IconCategory />,   to: "/category",  color: "#f97316" },
    { label: "Reviews",     icon: <IconStar fill />,  to: "/reviews",   color: "#ec4899" },
    { label: "Add Product", icon: <FaPlus size={17} />, onClick: onAddProduct, color: "#14b8a6" },
    { label: "Analytics",   icon: <IconRevenue />,    onClick: onScrollToAnalytics, color: "#f59e0b" },
  ];
  return (
    <div className="qa-grid">
      {items.map((it, i) => it.onClick ? (
        <button key={it.label} type="button" onClick={it.onClick} className="qa-card" style={{ "--qc": it.color, "--d": `${i * 45}ms` }}>
          <span className="qa-card__icon" style={{ background: `${it.color}18`, color: it.color }}>{it.icon}</span>
          <span className="qa-card__label">{it.label}</span>
        </button>
      ) : (
        <Link key={it.label} to={it.to} className="qa-card" style={{ "--qc": it.color, "--d": `${i * 45}ms` }}>
          <span className="qa-card__icon" style={{ background: `${it.color}18`, color: it.color }}>{it.icon}</span>
          <span className="qa-card__label">{it.label}</span>
        </Link>
      ))}
    </div>
  );
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    pending:   { bg: "#fef9c3", text: "#854d0e" },
    confirmed: { bg: "#dcfce7", text: "#166534" },
    delivered: { bg: "#dbeafe", text: "#1e40af" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    shipped:   { bg: "#f3e8ff", text: "#6b21a8" },
  };
  const s = map[status?.toLowerCase()] || { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[700] whitespace-nowrap tracking-wide">
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
        <span key={i} className={r >= i ? "text-amber-400" : "text-gray-200"}>
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

  return (
    <div className="reviews-section">
      {/* Header */}
      <div className="reviews-section__header">
        <div>
          <h2 className="dash-card__title flex items-center gap-2">
            <span style={{ color: "#ec4899" }}><IconStar fill size={17} /></span>
            Customer Reviews
            {/* Live dot */}
            <span className="rev-live-dot" />
          </h2>
          <p className="dash-card__sub">
            {total > 0 ? `${total} total · avg ${avg} ★` : "No reviews yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} disabled={refreshing}
            className={`rev-refresh-btn ${refreshing ? "opacity-60" : ""}`}>
            <IconRefresh spin={refreshing} />
            {refreshing ? "Updating…" : "Refresh"}
          </button>
          <Link to="/reviews" className="rev-viewall-btn">
            View All <IconArrowRight />
          </Link>
        </div>
      </div>

      <div className="reviews-section__body">
        {/* Left — stats */}
        <div className="reviews-stats">
          {/* Big avg */}
          <div className="reviews-avg-card">
            <div className="reviews-avg-number">
              {loading ? <span className="rev-skel rev-skel--lg" /> : avg}
            </div>
            <StarRow rating={Number(avg)} size={18} />
            <p className="reviews-avg-sub">
              {loading ? <span className="rev-skel rev-skel--sm" /> : `Based on ${total} reviews`}
            </p>
          </div>

          {/* Breakdown bars */}
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
                    <div className="rev-bar-fill"
                      style={{ width: loading ? "0%" : `${pct}%`,
                        background: star >= 4 ? "#f59e0b" : star === 3 ? "#fb923c" : "#f87171" }} />
                  </div>
                  <span className="rev-bar-count">{loading ? "—" : count}</span>
                </div>
              );
            })}
          </div>

          {/* Stat chips */}
          <div className="reviews-chips">
            {[
              { label: "Total",   val: total,           color: "#6366f1", bg: "#eef2ff" },
              { label: "5 Star",  val: breakdown[5],    color: "#f59e0b", bg: "#fefce8" },
              { label: "Low",     val: breakdown[1] + breakdown[2], color: "#ef4444", bg: "#fef2f2" },
            ].map(c => (
              <div key={c.label} className="rev-chip" style={{ background: c.bg }}>
                <span className="rev-chip__val" style={{ color: c.color }}>
                  {loading ? "—" : c.val}
                </span>
                <span className="rev-chip__label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — recent reviews list */}
        <div className="reviews-list">
          <p className="reviews-list__title">Recent Reviews</p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rev-card-skel">
                  <div className="rev-skel rev-skel--avatar" />
                  <div className="flex-1 space-y-2">
                    <div className="rev-skel rev-skel--line" />
                    <div className="rev-skel rev-skel--line-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rev-empty">
              <IconStar size={36} />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div key={r._id || i} className="rev-card">
                  {/* Avatar */}
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
// DELIVERY RIDER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
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
      
      // Calculate stats
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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return { bg: '#fef3c7', color: '#92400e', icon: '⏳' };
    if (s === 'confirmed') return { bg: '#dbeafe', color: '#1e40af', icon: '✓' };
    if (s === 'shipped') return { bg: '#e0e7ff', color: '#4338ca', icon: '🚚' };
    if (s === 'delivered') return { bg: '#d1fae5', color: '#065f46', icon: '✅' };
    if (s === 'cancelled') return { bg: '#fee2e2', color: '#991b1b', icon: '✕' };
    return { bg: '#f3f4f6', color: '#374151', icon: '●' };
  };

  const filteredOrders = recentOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.order_status?.toLowerCase() === filterStatus;
    const matchesSearch = !searchQuery || 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const StatCard = ({ icon, label, value, color, gradient, delay = 0, onClick }) => (
    <div 
      onClick={onClick}
      className="va-stat-card" 
      style={{ 
        '--gradient': gradient, 
        '--delay': `${delay}ms`,
        cursor: onClick ? 'pointer' : 'default'
      }}>
      <div className="va-stat-icon" style={{ background: color + '15', color }}>
        {icon}
      </div>
      <div className="va-stat-content">
        {loading ? (
          <div className="va-skel va-skel-lg" />
        ) : (
          <div className="va-stat-value">{value}</div>
        )}
        <div className="va-stat-label">{label}</div>
      </div>
      <div className="va-stat-glow" style={{ background: gradient }} />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes vaFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vaSlideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes vaPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes vaRotate { to { transform: rotate(360deg); } }
        @keyframes vaShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .va-container { animation: vaFadeUp 0.6s ease-out; }
        
        /* Hero Section */
        .va-hero { 
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px; padding: 32px 28px; margin-bottom: 24px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }
        .va-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .va-hero-content { position: relative; z-index: 1; }
        .va-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 14px; border-radius: 20px; font-size: 11px;
          font-weight: 700; color: #fff; margin-bottom: 12px;
          backdrop-filter: blur(10px);
        }
        .va-hero-title {
          font-size: clamp(24px, 4vw, 32px); font-weight: 900; color: #fff;
          margin-bottom: 8px; letter-spacing: -0.5px;
        }
        .va-hero-subtitle {
          font-size: 14px; color: rgba(255,255,255,0.9); line-height: 1.6;
        }
        .va-hero-actions {
          display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;
        }
        .va-hero-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px; font-size: 13px;
          font-weight: 700; border: none; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .va-hero-btn-primary {
          background: #fff; color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .va-hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .va-hero-btn-secondary {
          background: rgba(255,255,255,0.15); color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
        }
        .va-hero-btn-secondary:hover {
          background: rgba(255,255,255,0.25);
        }
        .va-live-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 4px 12px; border-radius: 20px; font-size: 11px;
          font-weight: 700; color: #6ee7b7; margin-left: 10px;
        }
        .va-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 8px #10b981;
          animation: vaPulse 2s ease-in-out infinite;
        }

        /* Stats Grid */
        .va-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px; margin-bottom: 24px;
        }
        .va-stat-card {
          position: relative; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 16px;
          padding: 20px; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: vaFadeUp 0.5s ease-out both;
          animation-delay: var(--delay, 0ms);
        }
        .va-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: transparent;
        }
        .va-stat-card:hover .va-stat-glow { opacity: 1; }
        .va-stat-glow {
          position: absolute; top: -50%; right: -50%;
          width: 100%; height: 100%; opacity: 0;
          filter: blur(40px); pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .va-stat-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 12px;
        }
        .va-stat-content { position: relative; z-index: 1; }
        .va-stat-value {
          font-size: 28px; font-weight: 900; color: #111827;
          line-height: 1; margin-bottom: 6px; letter-spacing: -0.5px;
        }
        .va-stat-label {
          font-size: 12px; font-weight: 600; color: #6b7280;
        }

        /* Toolbar */
        .va-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .va-toolbar-title {
          font-size: 18px; font-weight: 800; color: #111827;
        }
        .va-toolbar-actions {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .va-search {
          position: relative;
        }
        .va-search-input {
          padding: 8px 12px 8px 36px; border: 1px solid #e5e7eb;
          border-radius: 10px; font-size: 13px; width: 240px;
          transition: all 0.2s ease;
        }
        .va-search-input:focus {
          outline: none; border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .va-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
        }
        .va-filter-btn {
          padding: 8px 16px; border: 1px solid #e5e7eb;
          border-radius: 10px; background: #fff; font-size: 13px;
          font-weight: 600; cursor: pointer;
          transition: all 0.2s ease;
        }
        .va-filter-btn.active {
          background: #667eea; color: #fff; border-color: #667eea;
        }
        .va-filter-btn:hover:not(.active) {
          background: #f9fafb; border-color: #d1d5db;
        }
        .va-refresh-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: 1px solid #e5e7eb;
          border-radius: 10px; background: #fff; font-size: 13px;
          font-weight: 600; color: #374151; cursor: pointer;
          transition: all 0.2s ease;
        }
        .va-refresh-btn:hover {
          background: #f9fafb; border-color: #d1d5db;
        }
        .va-refresh-btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .va-refresh-icon {
          transition: transform 0.3s ease;
        }
        .va-refresh-btn:disabled .va-refresh-icon {
          animation: vaRotate 1s linear infinite;
        }

        /* Orders Table */
        .va-table-container {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 16px; overflow: hidden;
          animation: vaFadeUp 0.6s ease-out 0.3s both;
        }
        .va-table-wrapper {
          overflow-x: auto;
        }
        .va-table {
          width: 100%; border-collapse: collapse;
        }
        .va-table thead {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
        }
        .va-table th {
          padding: 14px 16px; text-align: left;
          font-size: 11px; font-weight: 700; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
        }
        .va-table td {
          padding: 16px; border-bottom: 1px solid #f3f4f6;
          font-size: 13px; color: #374151;
        }
        .va-table tbody tr {
          transition: background 0.2s ease;
        }
        .va-table tbody tr:hover {
          background: #f9fafb;
        }
        .va-table tbody tr:last-child td {
          border-bottom: none;
        }
        .va-order-id {
          font-family: 'Courier New', monospace;
          font-size: 12px; font-weight: 700; color: #667eea;
          background: #eff6ff; padding: 4px 8px; border-radius: 6px;
          display: inline-block;
        }
        .va-customer-info {
          display: flex; align-items: center; gap: 10px;
        }
        .va-customer-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 14px;
          flex-shrink: 0;
        }
        .va-customer-details {
          flex: 1; min-width: 0;
        }
        .va-customer-name {
          font-weight: 600; color: #111827;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .va-customer-email {
          font-size: 11px; color: #9ca3af;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .va-status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .va-amount {
          font-size: 15px; font-weight: 800; color: #111827;
        }
        .va-date {
          font-size: 12px; color: #6b7280;
        }
        .va-action-btn {
          padding: 6px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600;
          border: 1px solid #e5e7eb; background: #fff;
          color: #374151; cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none; display: inline-block;
        }
        .va-action-btn:hover {
          background: #f9fafb; border-color: #667eea; color: #667eea;
        }

        /* Empty State */
        .va-empty {
          text-align: center; padding: 60px 20px;
        }
        .va-empty-icon {
          font-size: 64px; margin-bottom: 16px; opacity: 0.5;
        }
        .va-empty-title {
          font-size: 18px; font-weight: 700; color: #374151;
          margin-bottom: 8px;
        }
        .va-empty-text {
          font-size: 14px; color: #9ca3af;
        }

        /* Skeleton */
        .va-skel {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: vaShimmer 1.5s infinite;
          border-radius: 6px;
        }
        .va-skel-lg {
          width: 80px; height: 28px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .va-hero { padding: 24px 20px; }
          .va-hero-title { font-size: 24px; }
          .va-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .va-stat-card { padding: 16px; }
          .va-stat-value { font-size: 24px; }
          .va-stat-icon {
            width: 40px; height: 40px; font-size: 18px;
          }
          .va-toolbar {
            flex-direction: column; align-items: stretch;
          }
          .va-toolbar-actions {
            flex-direction: column;
          }
          .va-search-input {
            width: 100%;
          }
          .va-table-container {
            border-radius: 12px;
          }
          .va-table th,
          .va-table td {
            padding: 12px 10px;
          }
          .va-customer-info {
            flex-direction: column; align-items: flex-start; gap: 6px;
          }
        }
      `}</style>

      <div className="va-container">
        {/* Hero Section */}
        <div className="va-hero">
          <div className="va-hero-content">
            <div className="va-hero-badge">
              👔 Vice Admin Control Panel
            </div>
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
                <span>🛍️</span>
                View All Orders
              </Link>
              <button 
                className="va-hero-btn va-hero-btn-secondary"
                onClick={() => fetchDashboardData(true)}>
                <span>🔄</span>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="va-stats-grid">
          <StatCard
            icon="📦"
            label="Total Orders"
            value={fmt(stats?.totalOrders || 0)}
            color="#3b82f6"
            gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
            delay={0}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={fmt(stats?.pendingOrders || 0)}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            delay={100}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon="✓"
            label="Confirmed"
            value={fmt(stats?.confirmedOrders || 0)}
            color="#06b6d4"
            gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
            delay={200}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon="🚚"
            label="Shipped"
            value={fmt(stats?.shippedOrders || 0)}
            color="#8b5cf6"
            gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            delay={300}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon="✅"
            label="Delivered"
            value={fmt(stats?.deliveredOrders || 0)}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981, #059669)"
            delay={400}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon="💰"
            label="Total Revenue"
            value={fmtCurrency(stats?.totalRevenue || 0)}
            color="#ec4899"
            gradient="linear-gradient(135deg, #ec4899, #db2777)"
            delay={500}
          />
        </div>

        {/* Recent Orders Section */}
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
            <select 
              className="va-filter-btn"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              className="va-refresh-btn"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}>
              <span className="va-refresh-icon">🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Orders Table */}
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
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.order_status);
                    return (
                      <tr key={order._id}>
                        <td>
                          <span className="va-order-id">
                            #{order._id?.slice(-8) || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="va-customer-info">
                            <div className="va-customer-avatar">
                              {order.userId?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="va-customer-details">
                              <div className="va-customer-name">
                                {order.userId?.name || 'Guest'}
                              </div>
                              <div className="va-customer-email">
                                {order.userId?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="va-status-badge"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}>
                            <span>{statusStyle.icon}</span>
                            {order.order_status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="va-amount">
                            ₹{fmt(order.totalAmt || 0)}
                          </div>
                        </td>
                        <td>
                          <div className="va-date">
                            {order.createdAt 
                              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <Link 
                            to={`/orders`}
                            className="va-action-btn">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

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

  return (
    <>
      <style>{`
        .rider-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#0891b2 0%,#06b6d4 55%,#0891b2 100%);border-radius:18px;padding:32px 36px;margin-bottom:22px;}
        .rider-hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 70% at 85% 50%,#ffffff30 0%,transparent 70%);}
        .rider-hero__name{font-size:26px;font-weight:800;color:#fff;margin-bottom:5px;}
        .rider-hero__sub{font-size:13px;color:#cffafe;line-height:1.6;}
        .rider-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
        .rider-stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:20px;transition:transform .2s,box-shadow .2s;}
        .rider-stat-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.1);}
        .rider-stat-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:24px;}
        .rider-stat-value{font-size:28px;font-weight:800;color:#0f172a;margin-bottom:4px;}
        .rider-stat-label{font-size:13px;color:#64748b;font-weight:600;}
        .rider-deliveries{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:20px;}
        .rider-delivery-item{padding:16px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;}
        .rider-delivery-item:last-child{border-bottom:none;}
        .rider-delivery-id{font-weight:700;color:#0f172a;font-size:13px;}
        .rider-delivery-date{font-size:11px;color:#94a3b8;margin-top:2px;}
        .rider-delivery-amount{font-size:16px;font-weight:700;color:#10b981;}
        .rider-skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.3s infinite;border-radius:8px;height:24px;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div className="rider-hero">
        <h1 className="rider-hero__name">{greeting}, {context?.userData?.name?.split(" ")[0]} 🚴</h1>
        <p className="rider-hero__sub">Your delivery dashboard • Real-time stats</p>
      </div>

      <div className="rider-stats">
        <div className="rider-stat-card">
          <div className="rider-stat-icon" style={{background:'#dcfce7',color:'#16a34a'}}>📦</div>
          {loading ? <div className="rider-skeleton" /> : <div className="rider-stat-value">{fmt(stats?.totalDelivered || 0)}</div>}
          <div className="rider-stat-label">Total Deliveries</div>
        </div>
        <div className="rider-stat-card">
          <div className="rider-stat-icon" style={{background:'#fef9c3',color:'#ca8a04'}}>⏳</div>
          {loading ? <div className="rider-skeleton" /> : <div className="rider-stat-value">{fmt(stats?.pending || 0)}</div>}
          <div className="rider-stat-label">Pending Pickups</div>
        </div>
        <div className="rider-stat-card">
          <div className="rider-stat-icon" style={{background:'#dbeafe',color:'#2563eb'}}>🗓️</div>
          {loading ? <div className="rider-skeleton" /> : <div className="rider-stat-value">{fmt(stats?.today || 0)}</div>}
          <div className="rider-stat-label">Delivered Today</div>
        </div>
        <div className="rider-stat-card">
          <div className="rider-stat-icon" style={{background:'#cffafe',color:'#0891b2'}}>💰</div>
          {loading ? <div className="rider-skeleton" /> : <div className="rider-stat-value">₹{fmt(wallet?.availableBalance || 0)}</div>}
          <div className="rider-stat-label">Wallet Balance</div>
        </div>
      </div>

      <div className="rider-deliveries">
        <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:16}}>Recent Deliveries</h3>
        {loading ? (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="rider-delivery-item">
                <div style={{flex:1}}><div className="rider-skeleton" style={{width:'60%',marginBottom:8}}/><div className="rider-skeleton" style={{width:'40%',height:14}}/></div>
                <div className="rider-skeleton" style={{width:80}}/>
              </div>
            ))}
          </>
        ) : recentDeliveries.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px',color:'#94a3b8'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:14,fontWeight:600}}>No deliveries yet</div>
            <div style={{fontSize:12,marginTop:4}}>Check Available Orders to start delivering</div>
          </div>
        ) : (
          recentDeliveries.map((d, i) => (
            <div key={i} className="rider-delivery-item">
              <div>
                <div className="rider-delivery-id">Order #{d.orderId || d._id?.slice(-8) || 'N/A'}</div>
                <div className="rider-delivery-date">{d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString('en-IN') : 'Recently'}</div>
              </div>
              <div className="rider-delivery-amount">+₹{Number(d.riderEarning || d.amount || 50).toFixed(0)}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const SBox = ({ icon, label, value, accent, sub, loading, delay = 0 }) => (
  <div className="sdb-box" style={{ "--ac": accent, animationDelay: `${delay}ms` }}>
    <div className="sdb-box__glow" style={{ background: accent }} />
    <div className="sdb-box__top">
      <span className="sdb-box__icon" style={{ background: `${accent}18`, color: accent }}>{icon}</span>
      {loading ? <div className="sdb-skel sdb-skel--sm" /> : <span className="sdb-box__value">{value ?? "—"}</span>}
    </div>
    <p className="sdb-box__label">{label}</p>
    {sub && <p className="sdb-box__sub">{sub}</p>}
    <div className="sdb-box__bar" style={{ background: `linear-gradient(90deg,${accent},${accent}33)` }} />
  </div>
);

const TrxRow = ({ trx }) => {
  const isDeposit = trx?.type === "DEPOSIT";
  const statusMap = {
    PENDING:  { bg: "#fef9c3", color: "#854d0e" },
    APPROVED: { bg: "#dcfce7", color: "#166534" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  };
  const st = statusMap[trx?.status] || statusMap.PENDING;
  return (
    <tr className="sdb-trx__row">
      <td>
        <span className="sdb-trx__type"
          style={{ background: isDeposit ? "#dcfce7" : "#fee2e2", color: isDeposit ? "#166534" : "#991b1b" }}>
          {isDeposit ? "↓ Deposit" : "↑ Withdraw"}
        </span>
      </td>
      <td className="sdb-trx__amt" style={{ color: isDeposit ? "#16a34a" : "#dc2626" }}>
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

  const statBoxes = [
    { icon: <IconBox />,     label: "Total Products",   value: fmt(s.totalProducts),   accent: "#6366f1", sub: "In your store",       delay: 0   },
    { icon: <IconOrders />,  label: "Total Orders",     value: fmt(s.totalOrders),     accent: "#0ea5e9", sub: "All time",             delay: 60  },
    { icon: <IconPending />, label: "Pending Orders",   value: fmt(s.pendingOrders),   accent: "#f59e0b", sub: "Awaiting action",      delay: 120 },
    { icon: <IconConfirm />, label: "Confirmed Orders", value: fmt(s.confirmedOrders), accent: "#10b981", sub: "Ready to ship",        delay: 180 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
      label: "Shipped",      value: fmt(s.shippedOrders),   accent: "#8b5cf6", sub: "Out for delivery",   delay: 240 },
    { icon: <IconDelivery />,label: "Delivered",        value: fmt(s.deliveredOrders), accent: "#3b82f6", sub: "Completed",            delay: 300 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
      label: "Cancelled",    value: fmt(s.cancelledOrders), accent: "#ef4444", sub: "Refunded/closed",    delay: 360 },
    { icon: <IconRevenue />, label: "Total Earnings",   value: fmtR(s.totalEarning),   accent: "#14b8a6", sub: "Delivered orders",     delay: 420 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      label: "Pending Earn", value: fmtR(s.pendingEarning), accent: "#ec4899", sub: "Confirmed+shipped",  delay: 480 },
  ];

  return (
    <>
      <style>{`
        @keyframes spin360{to{transform:rotate(360deg)}}
        .sdb-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%);border-radius:18px;padding:32px 36px;margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .sdb-hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 70% at 85% 50%,#6366f130 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 15% 80%,#0ea5e920 0%,transparent 65%);}
        .sdb-hero__dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,#ffffff09 1px,transparent 1px);background-size:26px 26px;}
        .sdb-hero__left{position:relative;z-index:1;}.sdb-hero__right{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
        .sdb-hero__tag{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#a5b4fc;margin-bottom:7px;}
        .sdb-hero__name{font-size:clamp(18px,2.5vw,26px);font-weight:800;color:#fff;margin-bottom:5px;}
        .sdb-hero__sub{font-size:12.5px;color:#94a3b8;line-height:1.6;}
        .sdb-hero__live{display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:#10b98118;border:1px solid #10b98135;color:#6ee7b7;font-size:10.5px;font-weight:700;padding:4px 11px;border-radius:100px;}
        .sdb-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 7px #10b981;animation:sdot 1.6s ease-in-out infinite;}
        @keyframes sdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
        .sdb-hero__pill{background:#ffffff0c;border:1px solid #ffffff15;border-radius:11px;padding:9px 14px;text-align:right;backdrop-filter:blur(8px);min-width:120px;}
        .sdb-hero__pill-lbl{font-size:9.5px;color:#64748b;letter-spacing:1px;text-transform:uppercase;}
        .sdb-hero__pill-val{font-size:18px;font-weight:800;color:#fff;margin-top:1px;}
        .sdb-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
        .sdb-section-lbl{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;display:flex;align-items:center;gap:8px;}
        .sdb-section-lbl::after{content:"";flex:1;height:1px;background:#e2e8f0;}
        .sdb-sync{font-size:10.5px;color:#94a3b8;}
        .sdb-refresh{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#6366f1;background:#eef2ff;border:1px solid #c7d2fe;padding:5px 11px;border-radius:8px;cursor:pointer;transition:background .15s;}
        .sdb-refresh:hover{background:#e0e7ff;}.sdb-refresh:disabled{opacity:.55;cursor:not-allowed;}
        .sdb-err{background:#fef2f2;border:1px solid #fecaca;border-radius:11px;padding:11px 15px;color:#991b1b;font-size:12px;display:flex;align-items:center;gap:9px;margin-bottom:14px;}
        .sdb-err button{margin-left:auto;font-size:11px;font-weight:700;color:#dc2626;background:none;border:1px solid #fca5a5;padding:3px 9px;border-radius:6px;cursor:pointer;}
        .sdb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:12px;margin-bottom:24px;}
        .sdb-box{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:15px;overflow:hidden;padding:16px 15px 14px;transition:transform .2s,box-shadow .2s,border-color .2s;animation:sboxIn .4s ease both;cursor:default;}
        @keyframes sboxIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .sdb-box:hover{transform:translateY(-3px);box-shadow:0 12px 28px -8px rgba(0,0,0,.1);border-color:var(--ac);}
        .sdb-box__glow{position:absolute;top:-18px;right:-18px;width:72px;height:72px;border-radius:50%;opacity:.09;filter:blur(22px);pointer-events:none;}
        .sdb-box__bar{position:absolute;bottom:0;left:0;right:0;height:3px;}
        .sdb-box__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .sdb-box__icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
        .sdb-box__value{font-size:22px;font-weight:800;color:#0f172a;}
        .sdb-box__label{font-size:11px;font-weight:600;color:#64748b;margin-bottom:2px;}
        .sdb-box__sub{font-size:10px;color:#94a3b8;}
        .sdb-skel{border-radius:6px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:sshim 1.3s infinite;}
        .sdb-skel--sm{width:64px;height:22px;}.sdb-skel--md{width:100%;height:16px;margin-top:6px;}
        @keyframes sshim{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .sdb-wallet-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
        .sdb-wallet-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:18px 16px;display:flex;align-items:center;gap:13px;}
        .sdb-wallet-card__icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
        .sdb-wallet-card__lbl{font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px;}
        .sdb-wallet-card__val{font-size:20px;font-weight:800;color:#0f172a;}
        .sdb-trx-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:15px;overflow:hidden;margin-bottom:24px;}
        .sdb-trx-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #f1f5f9;}
        .sdb-trx-title{font-size:14px;font-weight:700;color:#0f172a;}.sdb-trx-count{font-size:11px;color:#94a3b8;}
        table.sdb-trx{width:100%;border-collapse:collapse;}
        .sdb-trx th{font-size:10.5px;font-weight:700;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;padding:10px 18px;background:#f8fafc;border-bottom:1px solid #f1f5f9;}
        .sdb-trx__row td{padding:11px 18px;border-bottom:1px solid #f8fafc;font-size:12.5px;vertical-align:middle;}
        .sdb-trx__row:last-child td{border-bottom:none;}.sdb-trx__row:hover td{background:#f8fafc;}
        .sdb-trx__type{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;}
        .sdb-trx__amt{font-size:13px;font-weight:700;}.sdb-trx__badge{display:inline-block;padding:3px 9px;border-radius:100px;font-size:10.5px;font-weight:700;}
        .sdb-trx__note{color:#64748b;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sdb-trx__date{color:#94a3b8;font-size:11px;white-space:nowrap;}
        .sdb-trx-empty{text-align:center;padding:28px;color:#94a3b8;font-size:13px;}
        .sdb-showall{display:flex;align-items:center;justify-content:center;padding:11px;border-top:1px solid #f1f5f9;}
        .sdb-showall button{font-size:12px;font-weight:600;color:#6366f1;background:none;border:none;cursor:pointer;}
        @media(max-width:640px){.sdb-hero{padding:20px 16px;flex-direction:column;}.sdb-hero__right{align-items:flex-start;flex-direction:row;flex-wrap:wrap;}.sdb-grid{grid-template-columns:repeat(2,1fr);}.sdb-wallet-grid{grid-template-columns:1fr;}}
      `}</style>

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
            <p className="sdb-hero__pill-val" style={{ color: "#6ee7b7" }}>{loading ? "…" : fmtR(s.totalEarning)}</p>
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
          <button className={`sdb-refresh${loading ? " spin" : ""}`} onClick={() => { fetchStats(); fetchWallet(); }} disabled={loading}>
            <IconRefresh spin={loading} />{loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="sdb-grid">{statBoxes.map((b, i) => <SBox key={i} {...b} loading={loading} />)}</div>

      <div className="sdb-toolbar" style={{ marginTop: 4 }}>
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Wallet & Earnings</div>
      </div>
      <div className="sdb-wallet-grid">
        {[
          { label: "Available Balance", val: fmtR(wallet?.availableBalance), color: "#10b981", bg: "#dcfce7",
            icon: <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
          { label: "Total Deposited",   val: fmtR(wallet?.totalDeposited),   color: "#6366f1", bg: "#eef2ff",
            icon: <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label: "Total Withdrawn",   val: fmtR(wallet?.totalWithdrawn),   color: "#f59e0b", bg: "#fef9c3",
            icon: <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 19l7-7-7-7"/></svg> },
        ].map((w, i) => (
          <div key={i} className="sdb-wallet-card">
            <div className="sdb-wallet-card__icon" style={{ background: w.bg }}>{w.icon}</div>
            <div>
              <p className="sdb-wallet-card__lbl">{w.label}</p>
              {wLoading ? <div className="sdb-skel sdb-skel--md" /> : <p className="sdb-wallet-card__val" style={{ color: w.color }}>{w.val}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="sdb-toolbar" style={{ marginTop: 4 }}>
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Transaction History</div>
      </div>
      <div className="sdb-trx-wrap">
        <div className="sdb-trx-header">
          <span className="sdb-trx-title">Wallet Transactions</span>
          <span className="sdb-trx-count">{trxList.length} total</span>
        </div>
        {wLoading ? (
          <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="sdb-skel sdb-skel--md" style={{ marginBottom: 10 }} />)}</div>
        ) : trxList.length === 0 ? (
          <div className="sdb-trx-empty">No transactions yet</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="sdb-trx">
                <thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th></tr></thead>
                <tbody>{visibleTrx.map((trx, i) => <TrxRow key={trx?._id || i} trx={trx} />)}</tbody>
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
    </>
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
        // Always stop skeleton after order data arrives — primary data source
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
  
  // Vice Admin Dashboard - Full featured professional panel
  if (isViceAdmin) {
    return <ViceAdminDashboard context={context} />;
  }

  return (
    <div className="dash-page">
      <style>{`
        @keyframes spin360{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

        .dash-page{animation:fadeUp .5s ease-out both;}

        /* ── Stat card ── */
        .stat-card{position:relative;background:#fff;border:1px solid #e8ecf0;border-radius:16px;overflow:hidden;padding:18px 16px 15px;transition:transform .22s,box-shadow .22s,border-color .22s;animation:fadeUp .4s ease both;animation-delay:var(--delay,0ms);cursor:default;}
        .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px -10px rgba(0,0,0,.12);border-color:var(--accent,#e2e8f0);}
        .stat-card__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .stat-card__icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;}
        .stat-card__trend{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;padding:3px 8px;border-radius:100px;}
        .stat-card__trend--up{background:#dcfce7;color:#16a34a;}.stat-card__trend--down{background:#fee2e2;color:#dc2626;}
        .stat-card__value{font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.8px;line-height:1;}
        .stat-card__skel{height:28px;width:80px;border-radius:8px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:sshim 1.3s infinite;margin-bottom:2px;}
        @keyframes sshim{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .stat-card__label{font-size:12px;font-weight:600;color:#64748b;margin-top:5px;}
        .stat-card__sublabel{font-size:10.5px;color:#94a3b8;margin-top:2px;}
        .stat-card__bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:#f1f5f9;}
        .stat-card__bar-fill{position:absolute;left:0;top:0;height:100%;width:100%;opacity:.7;border-radius:0 2px 2px 0;}

        /* ── Stats grid ── */
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:13px;margin-bottom:22px;}

        /* ── Quick Access ── */
        .qa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:10px;margin-bottom:24px;}
        .qa-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:#fff;border:1px solid #e8ecf0;border-radius:14px;padding:16px 10px;text-decoration:none;cursor:pointer;font-family:inherit;transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s,border-color .2s;animation:fadeUp .4s ease both;animation-delay:var(--d,0ms);}
        .qa-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 12px 24px -8px rgba(0,0,0,.12);border-color:var(--qc,#e2e8f0);}
        .qa-card:active{transform:translateY(-1px) scale(.96);}
        .qa-card__icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;transition:transform .25s ease;}
        .qa-card:hover .qa-card__icon{transform:scale(1.1) rotate(-4deg);}
        .qa-card__label{font-size:11.5px;font-weight:700;color:#334155;text-align:center;}

        /* ── Hero ── */
        .dash-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#1e3a8a 0%,#2874f0 60%,#1d4ed8 100%);border-radius:18px;padding:30px 32px;margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .dash-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 90% 50%,#ffffff15 0%,transparent 65%),radial-gradient(ellipse 40% 50% at 10% 80%,#ffffff08 0%,transparent 60%);pointer-events:none;}
        .dash-hero__dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,#ffffff0a 1px,transparent 1px);background-size:28px 28px;}
        .dash-hero__content{position:relative;z-index:1;}
        .dash-hero__eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#93c5fd;margin-bottom:8px;}
        .dash-hero__name{font-size:clamp(20px,3vw,30px);font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-0.5px;}
        .dash-hero__sub{font-size:13px;color:#bfdbfe;margin-bottom:14px;}
        .dash-hero__btn{background:#ffffff20 !important;border:1px solid #ffffff30 !important;color:#fff !important;font-size:12px !important;padding:8px 16px !important;border-radius:10px !important;backdrop-filter:blur(8px);transition:background .2s !important;}
        .dash-hero__btn:hover{background:#ffffff30 !important;}
        .dash-hero__img{position:relative;z-index:1;width:clamp(100px,18vw,180px);opacity:.92;filter:drop-shadow(0 8px 20px rgba(0,0,0,.2));}
        .dash-hero__stats{position:relative;z-index:1;display:flex;flex-direction:column;gap:8px;align-items:flex-end;}
        .dash-hero__pill{background:#ffffff12;border:1px solid #ffffff20;border-radius:12px;padding:10px 14px;text-align:right;backdrop-filter:blur(8px);min-width:130px;}
        .dash-hero__pill-lbl{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:#93c5fd;font-weight:600;}
        .dash-hero__pill-val{font-size:20px;font-weight:800;color:#fff;margin-top:2px;}
        .dash-hero__live{display:inline-flex;align-items:center;gap:5px;margin-top:8px;background:#ffffff12;border:1px solid #ffffff20;border-radius:100px;padding:4px 10px;font-size:10px;font-weight:700;color:#bbf7d0;}
        .dash-live-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;animation:sdot 1.6s ease-in-out infinite;}
        @keyframes sdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

        /* ── Sync bar ── */
        .dash-syncbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding:10px 14px;background:#fff;border:1px solid #e8ecf0;border-radius:12px;}
        .dash-syncbar__left{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#64748b;}
        .dash-syncbar__dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;animation:sdot 2s ease-in-out infinite;}
        .dash-syncbar__time{font-size:10.5px;color:#94a3b8;}
        .dash-refresh-btn{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#2874f0;background:#eff6ff;border:1px solid #bfdbfe;padding:5px 12px;border-radius:8px;cursor:pointer;transition:all .15s;}
        .dash-refresh-btn:hover{background:#dbeafe;}.dash-refresh-btn:disabled{opacity:.5;cursor:not-allowed;}

        /* ── Section label ── */
        .dash-section-lbl{font-size:10.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;display:flex;align-items:center;gap:10px;}
        .dash-section-lbl::after{content:"";flex:1;height:1px;background:linear-gradient(to right,#e2e8f0,transparent);}

        /* ── Card ── */
        .dash-card{background:#fff;border:1px solid #e8ecf0;border-radius:16px;overflow:hidden;}
        .dash-card__header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 14px;border-bottom:1px solid #f1f5f9;}
        .dash-card__title{font-size:15px;font-weight:700;color:#0f172a;}
        .dash-card__sub{font-size:12px;color:#94a3b8;margin-top:2px;}
        .dash-card__search{min-width:220px;}
        .dash-card__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .dash-export-btn{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;padding:7px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;transition:all .15s;}
        .dash-export-btn:hover{background:#f1f5f9;border-color:#cbd5e1;}

        /* ── Status filter chips ── */
        .dash-status-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 20px 14px;}
        .dash-chip{font-size:11px;font-weight:600;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;padding:5px 12px;border-radius:100px;cursor:pointer;transition:all .15s;font-family:inherit;}
        .dash-chip:hover{background:#f1f5f9;border-color:#cbd5e1;}
        .dash-chip.active{background:#2874f0;color:#fff;border-color:#2874f0;}

        /* ── Table ── */
        .dash-table{width:100%;border-collapse:collapse;font-size:12.5px;}
        .dash-table thead tr{background:#f8fafc;}
        .dash-table th{padding:10px 14px;font-size:10.5px;font-weight:700;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;text-align:left;border-bottom:1px solid #f1f5f9;}
        .dash-table__row td{padding:11px 14px;border-bottom:1px solid #f8fafc;vertical-align:middle;color:#374151;}
        .dash-table__row:last-child td{border-bottom:none;}.dash-table__row:hover td{background:#fafbff;}
        .dash-table__id{font-family:monospace;font-size:11.5px;font-weight:700;color:#2874f0;background:#eff6ff;padding:2px 7px;border-radius:6px;}
        .dash-table__payment{font-family:monospace;font-size:11px;color:#64748b;}
        .dash-table__cod{background:#fef9c3;color:#854d0e;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700;}
        .dash-table__amt{font-size:13px;font-weight:800;color:#0f172a;}
        .dash-table__uid{font-family:monospace;font-size:11px;color:#94a3b8;}
        .dash-table__address{display:flex;flex-direction:column;gap:1px;max-width:200px;}
        .dash-table__addr-type{font-size:9.5px;font-weight:700;color:#2874f0;text-transform:uppercase;letter-spacing:.8px;}
        .dash-table__addr-text{font-size:11.5px;color:#64748b;white-space:normal;}
        .dash-expand-btn{width:26px;height:26px;border-radius:7px;background:#f1f5f9;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;transition:background .15s;}
        .dash-expand-btn:hover{background:#e2e8f0;}
        .dash-table__expand td{background:#f8fafc !important;padding:0 !important;}
        .dash-expand-wrap{padding:14px 18px 18px;animation:fadeUp .3s ease both;}
        .dash-expand-title{font-size:12px;font-weight:700;color:#0f172a;margin-bottom:10px;}
        .dash-inner-table{width:100%;border-collapse:collapse;font-size:12px;}
        .dash-inner-table th{padding:8px 10px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;background:#fff;border-bottom:1px solid #e2e8f0;}
        .dash-inner-table td{padding:9px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
        .dash-inner-table tr:last-child td{border-bottom:none;}
        .dash-inner-table__name{font-weight:600;color:#0f172a;}.dash-inner-table__id{font-size:10px;color:#94a3b8;font-family:monospace;}
        .dash-empty{text-align:center;padding:40px 20px;color:#94a3b8;font-size:13px;}
        .dash-chart-toggle{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;padding:6px 13px;border-radius:9px;cursor:pointer;transition:all .15s;}
        .dash-chart-toggle:hover{background:#f1f5f9;border-color:#cbd5e1;}
        .dash-chart-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

        /* ── Reviews section ── */
        .reviews-section{background:#fff;border:1px solid #e8ecf0;border-radius:16px;overflow:hidden;margin-bottom:22px;animation:fadeUp .5s ease both;animation-delay:200ms;}
        .reviews-section__header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 14px;border-bottom:1px solid #f1f5f9;}
        .reviews-section__body{display:grid;grid-template-columns:280px 1fr;gap:0;}
        @media(max-width:768px){.reviews-section__body{grid-template-columns:1fr;}}
        .reviews-stats{padding:20px;border-right:1px solid #f1f5f9;display:flex;flex-direction:column;gap:16px;}
        @media(max-width:768px){.reviews-stats{border-right:none;border-bottom:1px solid #f1f5f9;}}
        .reviews-avg-card{text-align:center;padding:16px;background:linear-gradient(135deg,#fff9f0,#fffbf5);border:1px solid #fed7aa;border-radius:14px;}
        .reviews-avg-number{font-size:42px;font-weight:900;color:#0f172a;letter-spacing:-2px;line-height:1;margin-bottom:6px;}
        .reviews-avg-sub{font-size:11.5px;color:#94a3b8;margin-top:6px;}
        .reviews-breakdown{display:flex;flex-direction:column;gap:6px;}
        .rev-bar-row{display:flex;align-items:center;gap:6px;}
        .rev-bar-label{display:flex;align-items:center;gap:2px;font-size:10.5px;font-weight:700;color:#64748b;width:26px;flex-shrink:0;}
        .rev-bar-track{flex:1;height:7px;background:#f1f5f9;border-radius:100px;overflow:hidden;}
        .rev-bar-fill{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.4,0,.2,1);}
        .rev-bar-count{font-size:10.5px;font-weight:700;color:#64748b;width:20px;text-align:right;flex-shrink:0;}
        .reviews-chips{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
        .rev-chip{border-radius:11px;padding:10px 8px;text-align:center;border:1px solid rgba(0,0,0,.04);}
        .rev-chip__val{display:block;font-size:18px;font-weight:800;line-height:1;}.rev-chip__label{font-size:10px;color:#64748b;margin-top:3px;display:block;}
        .reviews-list{padding:20px;overflow:hidden;}
        .reviews-list__title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;}
        .rev-card{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid #f1f5f9;transition:background .15s;}
        .rev-card:hover{background:#fafbff;}
        .rev-card__avatar{width:34px;height:34px;border-radius:50%;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,#2874f0,#60a5fa);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;}
        .rev-card__avatar img{width:100%;height:100%;object-fit:cover;}
        .rev-card__body{flex:1;min-width:0;}
        .rev-card__top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;}
        .rev-card__name{font-size:12.5px;font-weight:700;color:#0f172a;}
        .rev-card__date{font-size:10.5px;color:#94a3b8;margin-left:auto;}
        .rev-card__text{font-size:12px;color:#64748b;line-height:1.5;word-break:break-word;}
        .rev-seemore{display:block;text-align:center;margin-top:12px;font-size:12px;font-weight:600;color:#2874f0;text-decoration:none;padding:8px;border-radius:10px;background:#eff6ff;transition:background .15s;}
        .rev-seemore:hover{background:#dbeafe;}
        .rev-live-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;display:inline-block;animation:sdot 2s ease-in-out infinite;}
        .rev-refresh-btn{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#2874f0;background:#eff6ff;border:1px solid #bfdbfe;padding:5px 12px;border-radius:8px;cursor:pointer;transition:all .15s;}
        .rev-refresh-btn:hover{background:#dbeafe;}.rev-refresh-btn:disabled{opacity:.5;cursor:not-allowed;}
        .rev-viewall-btn{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#fff;background:#2874f0;padding:5px 13px;border-radius:8px;text-decoration:none;transition:background .15s;}
        .rev-viewall-btn:hover{background:#1d5ecb;}
        .rev-empty{display:flex;flex-direction:column;align-items:center;padding:36px 20px;color:#cbd5e1;gap:8px;}
        .rev-empty p{font-size:13px;color:#94a3b8;}
        .rev-skel{display:inline-block;border-radius:6px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:sshim 1.3s infinite;}
        .rev-skel--lg{width:64px;height:42px;border-radius:8px;}
        .rev-skel--sm{width:100px;height:14px;}
        .rev-skel--line{width:100%;height:12px;border-radius:4px;}
        .rev-skel--line-sm{width:60%;height:10px;border-radius:4px;}
        .rev-skel--avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;}
        .rev-card-skel{display:flex;align-items:center;gap:10px;padding:10px 12px;}

        @media(max-width:768px){
          .dash-hero{flex-direction:column;padding:20px 18px;}
          .dash-hero__img{display:none;}
          .dash-hero__stats{align-items:flex-start;flex-direction:row;flex-wrap:wrap;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .dash-card__header{flex-direction:column;align-items:stretch;}
          .dash-card__search{min-width:0;width:100%;}
          .dash-card__actions{width:100%;justify-content:space-between;}
        }

        @media(max-width:640px){
          .qa-grid{grid-template-columns:repeat(4,1fr);gap:8px;}
          .qa-card{padding:12px 6px;border-radius:12px;}
          .qa-card__icon{width:38px;height:38px;}
          .qa-card__label{font-size:9.5px;}

          .dash-table thead{display:none;}
          .dash-table, .dash-table tbody{display:block;width:100%;}
          .dash-table__row{position:relative;display:block;background:#fff;border:1px solid #f1f5f9;border-radius:14px;margin-bottom:10px;padding:14px 44px 10px 14px;box-shadow:0 2px 8px rgba(0,0,0,.03);}
          .dash-table__row td{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:none;padding:5px 0;font-size:12.5px;}
          .dash-table__row td[data-label]::before{content:attr(data-label);font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;flex-shrink:0;}
          .dash-table__row td:first-child{position:absolute;top:12px;right:10px;padding:0;width:auto;display:block;}
          .dash-table__address{max-width:62%;text-align:right;align-items:flex-end;}
          .dash-table__expand{display:block;}
          .dash-table__expand td{display:block !important;padding:0 !important;}
        }
      `}</style>

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
            <p className="dash-hero__pill-val">
              {totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : "—"}
            </p>
          </div>
          <div className="dash-hero__pill">
            <p className="dash-hero__pill-lbl">Total Orders</p>
            <p className="dash-hero__pill-val">
              {(ordersCount || orderStats.total || allOrders.length) || "—"}
            </p>
          </div>
          <div className="dash-hero__live">
            <span className="dash-live-dot" /> Live · Auto-refresh 60s
          </div>
        </div>
        <img src="/shop-illustration.webp" className="dash-hero__img" alt="" />
      </div>

      {/* ── Quick Access ── */}
      <p className="dash-section-lbl" style={{ marginTop: 0 }}>Quick Access</p>
      <QuickAccess
        onAddProduct={() => context?.setIsOpenFullScreenPanel?.({ open: true, model: "Add Product" })}
        onScrollToAnalytics={() => document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />

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
        <StatCard icon={<IconBox />}      label="Total Products" value={totalProducts?.toLocaleString("en-IN")}                                    accent="#6366f1" trend={4.2}  trendLabel="vs last month" delay={0}   loading={statsLoading} />
        <StatCard icon={<IconOrders />}   label="Total Orders"   value={(ordersCount || orderStats.total || allOrders.length)?.toLocaleString("en-IN")} accent="#0ea5e9" trend={8.1}  trendLabel="vs last month" delay={50}  loading={statsLoading} />
        <StatCard icon={<IconPending />}  label="Pending"        value={pendingCount?.toLocaleString("en-IN")}                                      accent="#f59e0b"              trendLabel="Awaiting action" delay={100} loading={statsLoading} />
        <StatCard icon={<IconConfirm />}  label="Confirmed"      value={confirmedCount?.toLocaleString("en-IN")}                                    accent="#10b981"              trendLabel="Ready to ship" delay={150}  loading={statsLoading} />
        <StatCard icon={<IconDelivery />} label="Delivered"      value={deliveredCount?.toLocaleString("en-IN")}                                    accent="#3b82f6" trend={12.5} trendLabel="vs last month" delay={200}  loading={statsLoading} />
        <StatCard icon={<IconUsers />}    label="Total Users"    value={users?.length?.toLocaleString("en-IN")}                                     accent="#8b5cf6" trend={3.7}  trendLabel="New signups"   delay={250}  loading={statsLoading} />
        <StatCard icon={<IconStar fill />} label="Reviews"       value={allReviews?.length?.toLocaleString("en-IN")}                                accent="#ec4899"              trendLabel="Customer ratings" delay={300} loading={reviewsLoading} />
        <StatCard icon={<IconRevenue />}  label="Total Revenue"  value={totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : "—"}          accent="#14b8a6" trend={6.4}  trendLabel="Gross sales"   delay={350}  loading={statsLoading} />
        <StatCard icon={<IconCategory />} label="Categories"     value={context?.catData?.length?.toLocaleString("en-IN")}                          accent="#f97316"              trendLabel="Active categories" delay={400} />
      </div>

      {/* ── Reviews Section ── */}
      <p className="dash-section-lbl" style={{ marginTop: 6 }}>Reviews Overview</p>
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
      <div className="dash-card" style={{ marginBottom: 22 }}>
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
                  <tr className="dash-table__row">
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
                    <td data-label="Customer" className="whitespace-nowrap font-[600] text-[#0f172a]">{order?.userId?.name}</td>
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
                    <td data-label="Email" className="text-[12px] text-[#64748b]">{order?.userId?.email}</td>
                    <td data-label="User ID"><span className="dash-table__uid">{order?.userId?._id?.slice(-8)}</span></td>
                    <td data-label="Status"><StatusPill status={order?.order_status} /></td>
                    <td data-label="Date" className="whitespace-nowrap text-[12px] text-[#64748b]">{order?.createdAt?.split("T")[0]}</td>
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
                                  <td><img src={item?.image} alt={item?.productTitle} className="w-[40px] h-[40px] rounded-lg object-cover border border-[#e2e8f0]" /></td>
                                  <td className="font-[700] text-[#0f172a]">{item?.quantity}</td>
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
          <div className="flex items-center justify-center py-5">
            <Pagination showFirstButton showLastButton count={orders?.totalPages} page={pageOrder}
              onChange={(e, value) => setPageOrder(value)} />
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <p className="dash-section-lbl">Analytics</p>
      <div className="dash-card" id="analytics-section" style={{ marginBottom: 24 }}>
        <div className="dash-card__header" style={{ paddingBottom: 4 }}>
          <div>
            <h2 className="dash-card__title">Monthly Analytics</h2>
            <p className="dash-card__sub">Trends for users & sales</p>
          </div>
          <div className="flex gap-2">
            <button className="dash-chart-toggle" onClick={getTotalUsersByYear}>
              <span className="dash-chart-dot" style={{ background: "#6366f1" }} />Total Users
            </button>
            <button className="dash-chart-toggle" onClick={getTotalSalesByYear}>
              <span className="dash-chart-dot" style={{ background: "#10b981" }} />Total Sales
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 overflow-x-auto">
          {chartData?.length > 0 ? (
            <BarChart
              width={context?.windowWidth > 920 ? context?.windowWidth - 350 : 800}
              height={300} data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13 }}
                labelStyle={{ color: "#fbbf24" }} itemStyle={{ color: "#a5f3fc" }}
                cursor={{ fill: "rgba(99,102,241,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <Bar dataKey="TotalSales" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
              <Bar dataKey="TotalUsers" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
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