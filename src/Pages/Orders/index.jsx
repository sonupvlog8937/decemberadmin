import React, { useState, useEffect, useContext } from 'react';
import SearchBox from '../../Components/SearchBox';
import { deleteData, editData, fetchDataFromApi, postData } from '../../utils/api';
import Pagination from "@mui/material/Pagination";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { MyContext } from "../../App.jsx";
import { STYLES } from "./OrdersStyles.js";

/* ─────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */


/* ── helpers ── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

/* ── Status badge ── */
const STATUS_COLORS = {
  pending: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  confirmed: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  confirm: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  processing: { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  shipped: { bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9" },
  delivered: { bg: "#d1fae5", color: "#065f46", dot: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  refunded: { bg: "#ccfbf1", color: "#0f766e", dot: "#14b8a6" },
};
const getStatusStyle = (s = "") => STATUS_COLORS[s.toLowerCase()] || { bg: "#f0f0f7", color: "#374151", dot: "#9ca3af" };

/* ═══════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL sonu
═══════════════════════════════════════════════════════ */
const ProductModal = ({ item, onClose }) => {
  // close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!item) return null;

  const subtotal = (item.price || 0) * (item.quantity || 1);
  const attrs = [
    item.quantity && { label: "Quantity", value: `× ${item.quantity}` },
    item.color && { label: "Color", value: item.color, isColor: true },
    item.size && { label: "Size", value: item.size },
    item.weight && { label: "Weight", value: item.weight },
    item.ram && { label: "RAM", value: item.ram },
    item.brand && { label: "Brand", value: item.brand },
  ].filter(Boolean);

  // Add selected options to attrs if they exist (but we'll show them separately below)
  const hasSelectedOptions = item.selectedOptions && typeof item.selectedOptions === 'object' && Object.keys(item.selectedOptions).length > 0;

  return (
    <div className="ao-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ao-modal" role="dialog" aria-modal="true">
        {/* Image */}
        <div className="ao-modal-imgbox">
          {item.image
            ? <img src={item.image} alt={item.productTitle} />
            : <div className="ao-modal-noimg">🖼️</div>
          }
          <button className="ao-modal-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="ao-modal-chip">{fmt(subtotal)}</div>
        </div>

        {/* Body */}
        <div className="ao-modal-body">
          <h3 className="ao-modal-name">{item.productTitle || "—"}</h3>
          <p className="ao-modal-pid">
            Product ID: {item.productId || item._id || "—"}
          </p>

          {/* Price */}
          <div className="ao-modal-pricerow">
            <span className="ao-modal-price">{fmt(item.price)}</span>
            <span className="ao-modal-per">per unit</span>
          </div>
          <div className="ao-modal-math">
            <span>{fmt(item.price)}</span>
            <span style={{ color: "#9ca3af" }}>×</span>
            <span>{item.quantity} qty</span>
            <span style={{ color: "#9ca3af", margin: "0 2px" }}>=</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800 }}>{fmt(subtotal)}</span>
          </div>

          {/* Attributes */}
          {attrs.length > 0 && (
            <>
              <div className="ao-modal-divider" />
              <div className="ao-modal-attrs">
                {attrs.map((a, i) => (
                  <div className="ao-modal-attr" key={i}>
                    <div className="ao-modal-attr-lbl">{a.label}</div>
                    <div className="ao-modal-attr-val">
                      {a.isColor && (
                        <span className="ao-modal-color-dot" style={{ background: a.value }} />
                      )}
                      {a.value}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Selected Product Options with Price */}
          {hasSelectedOptions && (
            <>
              <div className="ao-modal-divider" />
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#92400e',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  🎯 Selected Options
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        background: '#fff',
                        border: '1.5px solid #f59e0b',
                        borderRadius: 8,
                        padding: '6px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#92400e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {key}:
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#b45309'
                      }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Seller Information */}
          {item.sellerId && (
            <>
              <div className="ao-modal-divider" />
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#9ca3af',
                  marginBottom: 8
                }}>
                  🏪 Seller Information
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>
                  {item.sellerId?.storeProfile?.storeName || item.sellerId?.name || 'N/A'}
                </div>
                {(item.sellerId?.mobile || item.sellerId?.storeProfile?.contactNo) && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                    📱 {item.sellerId?.mobile || item.sellerId?.storeProfile?.contactNo}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="ao-modal-divider" />

          {/* Footer */}
          <div className="ao-modal-footer">
            <a
              href={`/product/${item.productId || item._id}`}
              target="_blank"
              rel="noreferrer"
              className="ao-modal-btn-p"
            >
              <span>↗</span> View Product Page
            </a>
            <button className="ao-modal-btn-s" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════
   USER CURRENT LOCATION DISPLAY COMPONENT
═══════════════════════════════════════════════════════ */
const UserCurrentLocationDisplay = ({ order }) => {
  // Get goMarketLocation directly from populated userId
  const location = order?.userId?.goMarketLocation;

  // Check if valid location exists
  if (!location?.coordinates ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2 ||
    location.coordinates[0] === 0 ||
    location.coordinates[1] === 0) {
    return null;
  }

  const lat = location.coordinates[1];
  const lng = location.coordinates[0];

  return (
    <div style={{ marginTop: '6px' }}>
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ao-tap-chip"
        style={{
          color: '#92400e',
          background: '#fef3c7',
          borderColor: '#fbbf24',
        }}
        title={`Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
      >
        <span style={{
          width: 5,
          height: 5,
          background: '#f59e0b',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        📍 Current Location
      </a>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   RECEIPT MODAL
═══════════════════════════════════════════════════════ */
const ReceiptModal = ({ order, onClose }) => {
  const printRef = React.useRef();
  const [commerceSettings, setCommerceSettings] = useState({ shippingFee: 0, deliveryFee: 0, freeShippingAbove: 0 });
  const context = useContext(MyContext);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Fetch commerce settings for fallback pricing
  useEffect(() => {
    fetchDataFromApi("/api/settings/commerce")
      .then((res) => {
        if (res?.data) {
          setCommerceSettings(res.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch commerce settings:", error);
      });
  }, []);

  if (!order) return null;

  const addr = order?.delivery_address || {};
  const user = order?.userId || {};
  const allProducts = order?.products || [];
  const isCOD = !order?.paymentId;
  const sc = getStatusStyle(order?.order_status);

  // Filter products for seller view - only show products that belong to this seller
  const isSellerView = SELLER_ROLES.includes(context?.userData?.role);
  const isDeliveryRider = context?.userData?.role === "DELIVERY_RIDER";
  const currentSellerId = context?.userData?._id || context?.userData?.id;

  const products = isSellerView && currentSellerId
    ? allProducts.filter((p) => {
      // Handle different sellerId structures
      const productSellerId = p.sellerId?._id || p.sellerId;
      return String(productSellerId) === String(currentSellerId);
    })
    : allProducts;

  console.log('ReceiptModal Debug:', {
    isSellerView,
    isDeliveryRider,
    isAdmin: context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN",
    currentSellerId,
    allProductsCount: allProducts.length,
    filteredProductsCount: products.length,
    sampleProduct: allProducts[0],
    sampleSellerData: allProducts[0]?.sellerId,
  });

  // Subtotal = sum of (price × qty)
  const subtotal = products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0);
  const discount = order?.discount_amount || 0;
  const baseAfterDiscount = Math.max(subtotal - discount, 0);

  // Use order's fees if available, otherwise use commerce settings
  const hasOrderFees = (order?.shippingFee !== undefined && order?.shippingFee !== null) ||
    (order?.deliveryFee !== undefined && order?.deliveryFee !== null);

  let shippingFee = 0;
  let deliveryFee = 0;

  if (hasOrderFees) {
    // Order has fees saved - use them
    shippingFee = order?.shippingFee || 0;
    deliveryFee = order?.deliveryFee || 0;
  } else if (commerceSettings.shippingFee > 0 || commerceSettings.deliveryFee > 0) {
    // Fallback to commerce settings for old orders
    const freeByRule = commerceSettings.freeShippingAbove > 0 && baseAfterDiscount >= commerceSettings.freeShippingAbove;
    shippingFee = freeByRule ? 0 : Number(commerceSettings.shippingFee || 0);
    deliveryFee = freeByRule ? 0 : Number(commerceSettings.deliveryFee || 0);
  }

  // For sellers: show their product subtotal + full order fees
  // For admin: show full order total
  const total = isSellerView
    ? (subtotal + shippingFee + deliveryFee)
    : (order?.totalAmt || (subtotal - discount + shippingFee + deliveryFee));

  const orderId = order._id?.slice(-10).toUpperCase();
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    el.classList.add("ao-rcpt-printable");
    window.print();
    el.classList.remove("ao-rcpt-printable");
  };

  return (
    <div className="ao-rcpt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ao-rcpt-sheet" ref={printRef} role="dialog" aria-modal="true">

        {/* ── HEADER ── */}
        <div className="ao-rcpt-head">
          <div className="ao-rcpt-head-top">
            <div className="ao-rcpt-brand">
              <div className="ao-rcpt-brand-icon">🛍️</div>
              <div>
                <div className="ao-rcpt-brand-name">Zeedaddy</div>
                <div className="ao-rcpt-brand-sub">Order Receipt</div>
              </div>
            </div>
            <button className="ao-rcpt-close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="ao-rcpt-head-mid">
            <p className="ao-rcpt-title">Order #{orderId}</p>
            <div className="ao-rcpt-meta-row">
              <span className="ao-rcpt-meta-chip">📅 {orderDate}</span>
              <span className="ao-rcpt-meta-chip">📦 {products.length} item{products.length !== 1 ? "s" : ""}</span>
              <span
                className="ao-rcpt-status-chip"
                style={{ background: sc.bg, color: sc.color }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }}></span>
                {(order?.order_status || "pending").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* tear edge */}
        <div className="ao-rcpt-tear" />

        {/* ── BODY ── */}
        <div className="ao-rcpt-body">

          {/* Customer + Address */}
          <div className="ao-rcpt-2col">

            {/* Customer */}
            <div className="ao-rcpt-info-card">
              <div className="ao-rcpt-info-title">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                Customer
              </div>
              <div className="ao-rcpt-info-name">{user?.name || "—"}</div>
              {user?.email && <div className="ao-rcpt-info-line">✉ {user.email}</div>}
              {addr?.mobile && <div className="ao-rcpt-info-line">📞 {addr.mobile}</div>}
              {user?.createdAt && (
                <div className="ao-rcpt-info-muted">
                  Member since {new Date(user.createdAt).getFullYear()}
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="ao-rcpt-info-card">
              <div className="ao-rcpt-info-title">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                Delivery Address
              </div>
              {addr?.addressType && (
                <div style={{ display: "inline-block", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", background: "#ede9fe", color: "#5b21b6", padding: "2px 7px", borderRadius: 4, marginBottom: 6 }}>
                  {addr.addressType}
                </div>
              )}
              {addr?.address && <div className="ao-rcpt-info-line">{addr.address}</div>}
              {addr?.landmark && <div className="ao-rcpt-info-line">{addr.landmark}</div>}
              <div className="ao-rcpt-info-line">
                {[addr.city, addr.state].filter(Boolean).join(", ")}
                {addr.pincode && ` – ${addr.pincode}`}
              </div>
              {addr?.country && <div className="ao-rcpt-info-muted">{addr.country}</div>}
              {addr?.latitude && addr?.longitude && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#dbeafe';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.borderColor = '#bfdbfe';
                    }}
                  >
                    📍 View on Google Maps
                  </a>
                </div>
              )}

              {/* Current Location - User's Latest Saved goMarketLocation */}
              {user?.goMarketLocation?.coordinates &&
                Array.isArray(user.goMarketLocation.coordinates) &&
                user.goMarketLocation.coordinates.length === 2 &&
                user.goMarketLocation.coordinates[0] !== 0 &&
                user.goMarketLocation.coordinates[1] !== 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <a
                      href={`https://www.google.com/maps?q=${user.goMarketLocation.coordinates[1]},${user.goMarketLocation.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#92400e',
                        textDecoration: 'none',
                        padding: '4px 10px',
                        background: '#fef3c7',
                        border: '1px solid #fbbf24',
                        borderRadius: '6px',
                        transition: 'all 0.15s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fde68a';
                        e.currentTarget.style.borderColor = '#f59e0b';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fef3c7';
                        e.currentTarget.style.borderColor = '#fbbf24';
                      }}
                      title={`Current Location: ${user.goMarketLocation.coordinates[1].toFixed(6)}, ${user.goMarketLocation.coordinates[0].toFixed(6)}`}
                    >
                      <span style={{
                        width: 5,
                        height: 5,
                        background: '#f59e0b',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                      📍 Current Location
                    </a>
                  </div>
                )}
            </div>
          </div>

          {/* User's Current Location (Go Market) - Show if user clicked "Use Current Location" */}
          {order?.goMarketData?.userLocation?.coordinates && order.goMarketData.userLocation.coordinates[0] !== 0 && order.goMarketData.userLocation.coordinates[1] !== 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="ao-rcpt-info-card" style={{ background: '#ecfdf5', border: '1.5px solid #86efac' }}>
                <div className="ao-rcpt-info-title" style={{ color: '#15803d' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Customer's Current Location (Go Market)
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '3px 8px',
                  borderRadius: 5,
                  marginBottom: 8
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} />
                  Live GPS Location
                </div>
                <div className="ao-rcpt-info-line" style={{ fontWeight: 600, color: '#065f46', fontSize: '12px' }}>
                  📍 {order.goMarketData.userLocation.coordinates[1].toFixed(6)}, {order.goMarketData.userLocation.coordinates[0].toFixed(6)}
                </div>
                {order.goMarketData.distanceDisplay && (
                  <div className="ao-rcpt-info-line" style={{ color: '#059669', fontSize: '11px', marginTop: '4px' }}>
                    📏 Distance: {order.goMarketData.distanceDisplay}
                  </div>
                )}
                {order.goMarketData.userLocation.address && (
                  <div className="ao-rcpt-info-line" style={{ color: '#047857', fontSize: '11px', marginTop: '4px' }}>
                    {order.goMarketData.userLocation.address}
                  </div>
                )}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://www.google.com/maps?q=${order.goMarketData.userLocation.coordinates[1]},${order.goMarketData.userLocation.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#15803d',
                      textDecoration: 'none',
                      padding: '5px 12px',
                      background: '#bbf7d0',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#a7f3d0';
                      e.currentTarget.style.borderColor = '#6ee7b7';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#bbf7d0';
                      e.currentTarget.style.borderColor = '#86efac';
                    }}
                  >
                    🗺️ View on Map
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.goMarketData.userLocation.coordinates[1]},${order.goMarketData.userLocation.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                      padding: '5px 12px',
                      background: '#dbeafe',
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#bfdbfe';
                      e.currentTarget.style.borderColor = '#60a5fa';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#dbeafe';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                  >
                    🧭 Get Directions
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="ao-rcpt-sec-lbl">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            Order Items
          </div>

          <div style={{ border: "1px solid #e8e8f2", borderRadius: 12, overflow: "hidden" }}>
            {products.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  {isSellerView ? "No products from your store in this order" : "No products found"}
                </div>
              </div>
            ) : (
              <table className="ao-rcpt-prod-table">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th style={{ paddingLeft: 14 }}>Product</th>
                    <th style={{ textAlign: "center", width: 60 }}>Qty</th>
                    <th style={{ textAlign: "right", paddingRight: 14 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, i) => {
                    const attrParts = [item.color, item.size, item.weight, item.ram].filter(Boolean);

                    // Check if selectedOptions exist
                    const hasSelectedOptions = item.selectedOptions && typeof item.selectedOptions === 'object' && Object.keys(item.selectedOptions).length > 0;

                    // Add selected options if they exist
                    if (hasSelectedOptions) {
                      Object.entries(item.selectedOptions).forEach(([key, value]) => {
                        if (value) {
                          attrParts.push(`🎯 ${key}: ${value}`);
                        }
                      });
                    }

                    const attrs = attrParts.join(" · ");

                    // Get seller info for this product (for delivery riders and admin)
                    const seller = item.sellerId;
                    const storeName = seller?.sellerProfile?.storeName || seller?.storeProfile?.storeName || seller?.name || 'N/A';
                    const sellerProfile = seller?.sellerProfile || seller?.storeProfile || {};
                    const storeAddress = sellerProfile?.storeAddress || sellerProfile?.address || '';
                    const phone = seller?.mobile || seller?.phone || sellerProfile?.mobile || '';
                    const storeLatitude = sellerProfile?.latitude || sellerProfile?.storeLatitude;
                    const storeLongitude = sellerProfile?.longitude || sellerProfile?.storeLongitude;

                    // Debug: Log seller info visibility check
                    console.log('🏪 Receipt Modal - Seller Info Debug:', {
                      productTitle: item.productTitle,
                      isDeliveryRider,
                      userRole: context?.userData?.role,
                      isAdmin: context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN",
                      hasSellerData: !!seller,
                      storeName,
                      willShowSellerInfo: (isDeliveryRider || context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN") && seller && storeName && storeName !== 'N/A'
                    });

                    // Current/live location (if available, different from store address)
                    const currentLatitude = seller?.currentLatitude || seller?.liveLatitude;
                    const currentLongitude = seller?.currentLongitude || seller?.liveLongitude;
                    const hasCurrentLocation = currentLatitude && currentLongitude;
                    const locationUpdatedAt = seller?.locationUpdatedAt;

                    return (
                      <React.Fragment key={i}>
                        <tr>
                          <td style={{ paddingLeft: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {item.image
                                ? <img src={item.image} alt={item.productTitle} className="ao-rcpt-prod-img" />
                                : <div className="ao-rcpt-prod-noimg">🖼️</div>
                              }
                              <div>
                                <div className="ao-rcpt-prod-name">{item.productTitle || "—"}</div>
                                {attrs && <div className="ao-rcpt-prod-attr">{attrs}</div>}
                                {hasSelectedOptions && (
                                  <div style={{
                                    marginTop: 4,
                                    padding: '3px 8px',
                                    background: '#fef3c7',
                                    border: '1px solid #fde68a',
                                    borderRadius: 4,
                                    display: 'inline-block',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: '#92400e'
                                  }}>
                                    {Object.entries(item.selectedOptions)
                                      .filter(([_, value]) => value)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(' • ')}
                                  </div>
                                )}
                                <div className="ao-rcpt-prod-attr" style={{ marginTop: 2 }}>{fmt(item.price)} / unit</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 700, fontSize: 13 }}>×{item.quantity || 1}</td>
                          <td style={{ paddingRight: 14 }}>
                            <div className="ao-rcpt-prod-amt">{fmt((item.price || 0) * (item.quantity || 1))}</div>
                          </td>
                        </tr>

                        {/* Seller info row - for delivery riders and admin */}
                        {!isSellerView && seller && storeName && storeName !== 'N/A' && (
                          <tr>
                            <td colSpan="3" style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 4, paddingBottom: 10, background: "#fffbeb", borderBottom: "1px solid #fef3c7" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                background: "#fff",
                                border: "1px solid #fde68a",
                                borderRadius: 8,
                                padding: "8px 12px"
                              }}>
                                {/* Store icon */}
                                <div style={{
                                  width: 32,
                                  height: 32,
                                  background: "#fef3c7",
                                  borderRadius: 6,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  flexShrink: 0
                                }}>
                                  🏪
                                </div>

                                {/* Seller details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#92400e",
                                    marginBottom: 3,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                  }}>
                                    <span>Pickup from: {storeName}</span>
                                    {storeLatitude && storeLongitude && (
                                      <a
                                        href={`https://www.google.com/maps?q=${storeLatitude},${storeLongitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 3,
                                          fontSize: 10,
                                          fontWeight: 600,
                                          color: "#2563eb",
                                          textDecoration: "none",
                                          padding: "2px 6px",
                                          background: "#dbeafe",
                                          border: "1px solid #93c5fd",
                                          borderRadius: 4,
                                          transition: "all 0.15s"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "#bfdbfe";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "#dbeafe";
                                        }}
                                      >
                                        📍 Navigate
                                      </a>
                                    )}
                                  </div>
                                  <div style={{
                                    fontSize: 11,
                                    color: "#78716c",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 8,
                                    alignItems: "center"
                                  }}>
                                    {storeAddress && (
                                      <span>📍 {storeAddress}</span>
                                    )}
                                    {phone && (
                                      <span>
                                        📞 <a
                                          href={`tel:${phone}`}
                                          style={{
                                            color: "#2563eb",
                                            textDecoration: "none",
                                            fontWeight: 600
                                          }}
                                        >
                                          {phone}
                                        </a>
                                      </span>
                                    )}
                                  </div>

                                  {/* Current Location - Live location of seller */}
                                  {hasCurrentLocation && (
                                    <div style={{
                                      marginTop: 8,
                                      padding: "6px 10px",
                                      background: "#dcfce7",
                                      border: "1px solid #86efac",
                                      borderRadius: 6,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      fontSize: 11
                                    }}>
                                      <span style={{
                                        width: 6,
                                        height: 6,
                                        background: "#16a34a",
                                        borderRadius: "50%",
                                        display: "inline-block",
                                        animation: "pulse 2s infinite"
                                      }} />
                                      <span style={{ fontWeight: 600, color: "#15803d" }}>
                                        Current Location:
                                      </span>
                                      <a
                                        href={`https://www.google.com/maps?q=${currentLatitude},${currentLongitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#15803d",
                                          textDecoration: "none",
                                          fontWeight: 600
                                        }}
                                      >
                                        {currentLatitude.toFixed(6)}, {currentLongitude.toFixed(6)}
                                      </a>
                                      <a
                                        href={`https://www.google.com/maps?q=${currentLatitude},${currentLongitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 3,
                                          fontSize: 10,
                                          fontWeight: 600,
                                          color: "#15803d",
                                          textDecoration: "none",
                                          padding: "2px 6px",
                                          background: "#bbf7d0",
                                          border: "1px solid #86efac",
                                          borderRadius: 4,
                                          transition: "all 0.15s",
                                          marginLeft: "auto"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "#a7f3d0";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "#bbf7d0";
                                        }}
                                      >
                                        🚀 Track Live
                                      </a>
                                      {locationUpdatedAt && (
                                        <span style={{
                                          fontSize: 9,
                                          color: "#16a34a",
                                          marginLeft: 4
                                        }}>
                                          {(() => {
                                            const now = new Date();
                                            const updated = new Date(locationUpdatedAt);
                                            const diffMinutes = Math.floor((now - updated) / (1000 * 60));
                                            if (diffMinutes < 1) return "Just now";
                                            if (diffMinutes < 60) return `${diffMinutes}m ago`;
                                            const diffHours = Math.floor(diffMinutes / 60);
                                            return `${diffHours}h ago`;
                                          })()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals */}
          <div className="ao-rcpt-totals">
            <div className="ao-rcpt-total-row sub">
              <span style={{ fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
            </div>
            {!isSellerView && discount > 0 && (
              <div className="ao-rcpt-total-row sub">
                <span style={{ fontWeight: 500, color: "#16a34a" }}>Discount</span>
                <span style={{ fontWeight: 600, color: "#16a34a" }}>-{fmt(discount)}</span>
              </div>
            )}
            {shippingFee > 0 ? (
              <div className="ao-rcpt-total-row sub">
                <span style={{ fontWeight: 500 }}>Shipping Fee</span>
                <span style={{ fontWeight: 600 }}>{fmt(shippingFee)}</span>
              </div>
            ) : (
              <div className="ao-rcpt-total-row sub">
                <span style={{ fontWeight: 500 }}>Shipping Fee</span>
                <span style={{ fontWeight: 600, color: "#16a34a" }}>FREE</span>
              </div>
            )}
            {deliveryFee > 0 ? (
              <div className="ao-rcpt-total-row sub">
                <span style={{ fontWeight: 500 }}>Delivery Fee</span>
                <span style={{ fontWeight: 600 }}>{fmt(deliveryFee)}</span>
              </div>
            ) : (
              <div className="ao-rcpt-total-row sub">
                <span style={{ fontWeight: 500 }}>Delivery Fee</span>
                <span style={{ fontWeight: 600, color: "#16a34a" }}>FREE</span>
              </div>
            )}
            <div className="ao-rcpt-total-row grand">
              <span className="ao-rcpt-total-lbl">{isSellerView ? "Your Total (with fees)" : "Grand Total"}</span>
              <span className="ao-rcpt-total-val">{fmt(total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="ao-rcpt-pay-row">
            <div className="ao-rcpt-pay-icon">{isCOD ? "💵" : "💳"}</div>
            <div style={{ flex: 1 }}>
              <div className="ao-rcpt-pay-label">{isCOD ? "Cash on Delivery" : "Online Payment"}</div>
              {!isCOD && order?.paymentId && (
                <div className="ao-rcpt-pay-sub">Txn ID: {order.paymentId}</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isCOD ? "#92400e" : "#065f46", background: isCOD ? "#fef3c7" : "#d1fae5", padding: "3px 9px", borderRadius: 6 }}>
                {isCOD ? "PAY ON DELIVERY" : "PAID"}
              </div>
            </div>
          </div>

          {/* Thank you note */}
          <div style={{ textAlign: "center", padding: "22px 0 4px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🎉</div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: "#0c0c14", margin: "0 0 3px" }}>
              Thank you for your order!
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
              Keep this receipt for your records. For support, contact us with Order ID #{orderId}.
            </p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="ao-rcpt-footer">
          <button className="ao-rcpt-btn-print" onClick={handlePrint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
          <button className="ao-rcpt-btn-close" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN ORDERS COMPONENT
═══════════════════════════════════════════════════════ */
const GO_MARKET_SHOP_SELLERS = ["GROCERY_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const SELLER_ROLES = ["SELLER", "GROCERY_SELLER", "RESTAURANT_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const isSellerRole = (role) => SELLER_ROLES.includes(role);

const Orders = () => {
  const [openOrderId, setOpenOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [riderFilter, setRiderFilter] = useState("available");
  const [ordersData, setOrdersData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pageOrder, setPageOrder] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Items per page limit
  const [searchQuery, setSearchQuery] = useState("");
  const [totalOrdersData, setTotalOrdersData] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [riders, setRiders] = useState([]);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [mobileView, setMobileView] = useState(typeof window !== "undefined" ? window.innerWidth <= 860 : false);
  // OTP Dialog state
  const [otpDialog, setOtpDialog] = useState({ open: false, orderId: null, otp: '' });

  const context = useContext(MyContext);
  const isSellerView = isSellerRole(context?.userData?.role);
  const isDeliveryRider = context?.userData?.role === "DELIVERY_RIDER";
  const isGoMarketShopSeller = GO_MARKET_SHOP_SELLERS.includes(context?.userData?.role);
  const isRestaurantSeller = context?.userData?.role === "RESTAURANT_SELLER";
  const ordersListEndpoint = isDeliveryRider
    ? "/api/order/rider/orders"
    : isSellerView
      ? "/api/order/seller/orders"
      : "/api/order/order-list";
  const ordersTitle = isDeliveryRider
    ? riderFilter === "available"
      ? "Available Orders"
      : "My Assigned Orders"
    : isGoMarketShopSeller ? "Live Shop Orders" : isRestaurantSeller ? "Live Kitchen Orders" : isSellerView ? "Store Orders" : "Orders";
  const ordersSubtitle = isDeliveryRider
    ? riderFilter === "available"
      ? "Browse open rider orders in your market"
      : "Orders you have accepted or confirmed"
    : isGoMarketShopSeller
      ? "Accept, pack, and dispatch quick-commerce orders"
      : isRestaurantSeller
        ? "Accept and prepare orders for minutes delivery"
        : isSellerView
          ? "Track orders for your own products"
          : "Manage and track all customer orders";

  /* track viewport for mobile card layout */
  useEffect(() => {
    const onResize = () => setMobileView(window.innerWidth <= 860);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* toggle expand */
  const toggleOrder = (id) => setOpenOrderId((prev) => (prev === id ? null : id));

  /* status change */
  const handleChange = (e, id) => {
    const val = e.target.value;
    console.log('🔄 Status change requested:', { orderId: id, newStatus: val });

    // Optimistic update - तुरंत UI में दिखाएं
    setOrdersData(prevOrders =>
      prevOrders.map(order =>
        order._id === id
          ? { ...order, order_status: val }
          : order
      )
    );
    setOrderStatus(val);

    // API call करें (background में)
    editData(`/api/order/order-status/${id}`, { id, order_status: val }).then((res) => {
      if (res?.data?.error === false || res?.data?.success) {
        console.log('✅ Status updated successfully');
        context.alertBox("success", res?.data?.message || "Order status updated");
        // ❌ refreshOrders() हटा दिया - सिर्फ auto-refresh से update होगा
      } else {
        console.error('❌ Status update failed:', res?.data?.message);
        context.alertBox("error", res?.data?.message || "Could not update order status");
        // Error होने पर revert करें - पुराना status वापस लाएं
        setOrdersData(prevOrders =>
          prevOrders.map(order =>
            order._id === id
              ? { ...order, order_status: order.order_status } // API से next auto-refresh में सही status आएगा
              : order
          )
        );
      }
    }).catch(error => {
      console.error('❌ Status update error:', error);
      context.alertBox("error", "Network error occurred");
      // Error होने पर next auto-refresh में सही status आएगा
    });
  };

  useEffect(() => {
    if (isGoMarketShopSeller || isRestaurantSeller || context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN") {
      fetchDataFromApi('/api/order/delivery-riders').then((res) => setRiders(res?.riders || res?.data || []));
    }
  }, [isGoMarketShopSeller, isRestaurantSeller, context?.userData?.role]);

  const assignRider = (orderId, riderId) => {
    if (!riderId) return;
    console.log('👤 Assigning rider to order:', { orderId, riderId });
    setAssigningOrderId(orderId);

    // Optimistic update
    setOrdersData(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? {
            ...order,
            deliveryAssignment: {
              ...order.deliveryAssignment,
              riderId,
              status: 'assigned'
            },
            order_status: 'assigned_to_rider'
          }
          : order
      )
    );

    editData(`/api/order/assign-rider/${orderId}`, { riderId }).then((res) => {
      if (res?.data?.success || res?.data?.error === false) {
        console.log('✅ Rider assigned successfully');
        context.alertBox('success', res?.data?.message || 'Order assigned');
        // ❌ Manual refresh हटा दिया - सिर्फ auto-refresh से update होगा
      } else {
        console.error('❌ Assign rider failed:', res?.data?.message);
        context.alertBox('error', res?.data?.message || 'Could not assign order');
      }
    }).finally(() => setAssigningOrderId(null));
  };

  const broadcastOrder = (orderId) => {
    console.log('📢 Broadcasting order to riders:', orderId);
    setAssigningOrderId(orderId);

    // Optimistic update - order status को "broadcast" में update करें
    setOrdersData(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? {
            ...order,
            deliveryAssignment: {
              ...order.deliveryAssignment,
              status: 'broadcast'
            },
            order_status: 'assigned_to_rider'
          }
          : order
      )
    );

    editData(`/api/order/broadcast-order/${orderId}`, {}).then((res) => {
      if (res?.data?.success || res?.data?.error === false) {
        console.log('✅ Order broadcast successfully');
        context.alertBox('success', res?.data?.message || 'Order broadcast to market riders');
        // ❌ refreshOrders() हटा दिया - सिर्फ auto-refresh से update होगा
      } else {
        console.error('❌ Broadcast failed:', res?.data?.message);
        context.alertBox('error', res?.data?.message || 'Could not broadcast order');
        // Error होने पर next auto-refresh में सही status आएगा
      }
    }).finally(() => setAssigningOrderId(null));
  };

  const buildOrdersListUrl = (includeTotals = false, filterValue = riderFilter) => {
    if (!isDeliveryRider) {
      return includeTotals ? ordersListEndpoint : `${ordersListEndpoint}?page=${pageOrder}&limit=${itemsPerPage}`;
    }

    const params = new URLSearchParams();
    if (!includeTotals) {
      params.set('page', pageOrder);
      params.set('limit', itemsPerPage);
    }
    if (filterValue === 'available') {
      params.set('status', 'broadcast');
    } else if (filterValue === 'assigned') {
      params.set('status', 'assigned');
    }
    const queryString = params.toString();
    return `${ordersListEndpoint}${queryString ? `?${queryString}` : ''}`;
  };

  const refreshOrders = (filterValue = riderFilter) => {
    setIsRefreshing(true);
    fetchDataFromApi(buildOrdersListUrl(false, filterValue)).then((res) => {
      if (res?.error === false) { setOrdersData(res?.data || []); setOrders(res); }
    });
    // For rider, we don't need separate totals call since pagination is included in the same response
    if (!isDeliveryRider) {
      fetchDataFromApi(buildOrdersListUrl(true, filterValue)).then((res) => {
        if (res?.error === false) setTotalOrdersData(res);
      }).finally(() => setIsRefreshing(false));
    } else {
      // For rider, use the same response for totals
      fetchDataFromApi(buildOrdersListUrl(false, filterValue)).then((res) => {
        if (res?.error === false) setTotalOrdersData(res);
      }).finally(() => setIsRefreshing(false));
    }
  };

  const handleRiderFilterChange = (nextFilter) => {
    setRiderFilter(nextFilter);
    setPageOrder(1);
    refreshOrders(nextFilter);
  };

  const startOrderProcessing = (orderId, action) => {
    setProcessingOrderId(orderId);
    setProcessingAction(action);
  };

  const finishOrderProcessing = () => {
    setProcessingOrderId(null);
    setProcessingAction(null);
  };

  const isProcessingAction = (orderId, action) => processingOrderId === orderId && processingAction === action;

  const confirmAssignedOrder = (orderId) => {
    console.log('✅ Confirming assigned order:', orderId);
    startOrderProcessing(orderId, 'confirm');

    // Optimistic update
    setOrdersData(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? {
            ...order,
            deliveryAssignment: {
              ...order.deliveryAssignment,
              status: 'confirmed'
            }
          }
          : order
      )
    );

    editData(`/api/order/rider/orders/${orderId}/confirm`, {}).then((res) => {
      if (res?.data?.success || res?.data?.error === false) {
        console.log('✅ Order confirmed successfully');
        context.alertBox('success', res?.data?.message || 'Order confirmed for delivery');
        setRiderFilter('assigned');
        // ❌ refreshOrders() हटा दिया - सिर्फ auto-refresh से update होगा
      } else {
        console.error('❌ Confirm order failed:', res?.data?.message);
        context.alertBox('error', res?.data?.message || 'Could not confirm order');
      }
    }).finally(() => finishOrderProcessing());
  };

  const sendOtpAndDeliver = async (orderId) => {
    startOrderProcessing(orderId, 'deliver');

    try {
      const sent = await postData(`/api/order/rider/orders/${orderId}/send-otp`, {});

      console.log('📤 [OTP Response]:', sent);

      if (sent?.error === true) {
        finishOrderProcessing();
        return context.alertBox('error', sent?.message || 'Could not send delivery OTP. Please check if customer mobile number exists.');
      }

      if (!sent?.success) {
        finishOrderProcessing();
        return context.alertBox('error', 'Failed to send OTP. Please try again or contact support.');
      }

      context.alertBox('success', sent?.message || 'OTP sent to customer mobile number successfully');

      // Open modern OTP dialog instead of window.prompt
      setOtpDialog({ open: true, orderId, otp: '' });
    } catch (error) {
      console.error('❌ [OTP Error]:', error);
      context.alertBox('error', 'Network error while sending OTP. Please check your connection.');
    } finally {
      finishOrderProcessing();
    }
  };

  const handleOtpSubmit = async () => {
    const { orderId, otp } = otpDialog;
    if (!otp || otp.length < 4) {
      return context.alertBox('error', 'Please enter a valid OTP');
    }
    console.log('📦 Delivering order with OTP:', { orderId, otp });
    startOrderProcessing(orderId, 'deliver');
    setOtpDialog({ ...otpDialog, open: false });

    // Optimistic update
    setOrdersData(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? {
            ...order,
            deliveryAssignment: {
              ...order.deliveryAssignment,
              status: 'delivered'
            },
            order_status: 'delivered'
          }
          : order
      )
    );

    editData(`/api/order/rider/orders/${orderId}/deliver`, { otp }).then((res) => {
      if (res?.data?.success || res?.data?.error === false) {
        console.log('✅ Order delivered successfully');
        context.alertBox('success', res?.data?.message || 'Order delivered and earning credited');
        // ❌ refreshOrders() हटा दिया - सिर्फ auto-refresh से update होगा
      } else {
        console.error('❌ Delivery failed:', res?.data?.message);
        context.alertBox('error', res?.data?.message || 'Delivery OTP verification failed');
      }
    }).finally(() => {
      finishOrderProcessing();
      setOtpDialog({ open: false, orderId: null, otp: '' });
    });
  };

  const callCustomer = (order) => {
    const phone = order?.delivery_address?.mobile || order?.userId?.mobile;
    if (!phone) return context.alertBox('error', 'Customer phone number is not available');
    window.location.href = `tel:${phone}`;
  };

  const handleReturnRefundUpdate = (id, mode) => {
    const payload = mode === "approve"
      ? { returnStatus: "approved", refundStatus: "processing" }
      : { returnStatus: "approved", refundStatus: "processed", refundMethod: "original", refundAmount: 0 };

    editData(`/api/order/return-refund-status/${id}`, payload).then((res) => {
      if (res?.data?.success) {
        context.alertBox("success", res?.data?.message || "Updated");
        fetchDataFromApi(`${ordersListEndpoint}?page=${pageOrder}&limit=20`).then((next) => {
          if (next?.error === false) setOrdersData(next?.data || []);
        });
        fetchDataFromApi(`${ordersListEndpoint}`).then((all) => {
          if (all?.error === false) setTotalOrdersData(all);
        });
      }
    });
  };

  /* delete */
  const deleteOrder = (id) => {
    if (context?.userData?.role !== "ADMIN") {
      context.alertBox("error", "Delete is allowed only for admin");
      return;
    }
    deleteData(`/api/order/deleteOrder/${id}`).then(() => {
      fetchDataFromApi(`${ordersListEndpoint}?page=${pageOrder}&limit=20`).then((res) => {
        if (res?.error === false) {
          setOrdersData(res?.data);
          context?.setProgress(100);
          context.alertBox("success", "Order deleted successfully!");
        }
      });
      fetchDataFromApi(`${ordersListEndpoint}`).then((res) => {
        if (res?.error === false) setTotalOrdersData(res);
      });
    });
  };

  /* fetch on page / status change */
  useEffect(() => {
    console.log('📦 Loading orders - page:', pageOrder);
    context?.setProgress(50);
    fetchDataFromApi(buildOrdersListUrl()).then((res) => {
      if (res?.error === false) { setOrdersData(res?.data); setOrders(res); context?.setProgress(100); }
    });
    fetchDataFromApi(buildOrdersListUrl(true)).then((res) => {
      if (res?.error === false) setTotalOrdersData(res);
    });
  }, [orderStatus, pageOrder, riderFilter, itemsPerPage]);

  /* Auto-refresh orders every 10 seconds */
  useEffect(() => {
    console.log('⏰ Setting up auto-refresh (10s interval)');
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing orders...');
      fetchDataFromApi(buildOrdersListUrl()).then((res) => {
        if (res?.error === false) {
          setOrdersData(res?.data);
          setOrders(res);
          console.log('✅ Orders auto-refreshed:', res?.data?.length, 'orders');
        }
      });
      fetchDataFromApi(buildOrdersListUrl(true)).then((res) => {
        if (res?.error === false) setTotalOrdersData(res);
      });
    }, 60000); // 10 seconds

    return () => {
      console.log('🛑 Clearing auto-refresh interval');
      clearInterval(intervalId);
    };
  }, [pageOrder, riderFilter, itemsPerPage]);

  /* search filter */
  useEffect(() => {
    if (searchQuery !== "") {
      const q = searchQuery.toLowerCase();
      const filtered = (totalOrdersData?.data || []).filter((o) =>
        o._id?.toLowerCase().includes(q) ||
        o?.userId?.name?.toLowerCase().includes(q) ||
        o?.userId?.email?.toLowerCase().includes(q) ||
        o?.createdAt?.includes(q)
      );
      setOrdersData(filtered);
    } else {
      fetchDataFromApi(buildOrdersListUrl()).then((res) => {
        if (res?.error === false) { setOrders(res); setOrdersData(res?.data); }
      });
    }
  }, [searchQuery, riderFilter, pageOrder]);

  /* stats */
  const allOrders = totalOrdersData?.data || [];
  const totalCount = totalOrdersData?.total || allOrders.length; // Use backend total count
  const pendingCnt = allOrders.filter((o) => (o.order_status || "").toLowerCase() === "pending").length;
  const deliveredCnt = allOrders.filter((o) => (o.order_status || "").toLowerCase() === "delivered").length;
  const cancelledCnt = allOrders.filter((o) => (o.order_status || "").toLowerCase() === "cancelled").length;

  return (
    <div className="ao">
      <style>{STYLES}</style>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Receipt modal */}
      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}

      <div className="ao-page">

        {/* ── Top bar ── */}
        <div className="ao-topbar">
          <div className="ao-topbar-left">
            <h2 className="ao-topbar-title">{ordersTitle}</h2>
            <p className="ao-topbar-sub">{ordersSubtitle}</p>
            {isDeliveryRider && (
              <div className="ao-rider-tabs">
                <button
                  type="button"
                  className={`ao-rider-tab-btn${riderFilter === 'available' ? ' active' : ''}`}
                  onClick={() => handleRiderFilterChange('available')}
                >
                  Available Orders
                </button>
                <button
                  type="button"
                  className={`ao-rider-tab-btn${riderFilter === 'assigned' ? ' active' : ''}`}
                  onClick={() => handleRiderFilterChange('assigned')}
                >
                  My Orders
                </button>
              </div>
            )}
          </div>
          <button
            className="ao-refresh-btn"
            onClick={() => refreshOrders(riderFilter)}
            disabled={isRefreshing}
            title="Refresh orders"
          >
            <span className={`ao-refresh-icon${isRefreshing ? ' spinning' : ''}`}>🔄</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="ao-refresh-btn"
            onClick={() => window.location.href = '/order-analytics'}
            title="View analytics & print reports"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            Analytics
          </button>
          <div className="ao-search-wrap">
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setPageOrder={setPageOrder}
            />
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="ao-stats">
          <div className="ao-stat">
            <span className="ao-stat-n" style={{ color: "#0c0c14" }}>{totalCount}</span>
            <span className="ao-stat-l">Total</span>
          </div>
          <div className="ao-stat">
            <span className="ao-stat-n" style={{ color: "#f59e0b" }}>{pendingCnt}</span>
            <span className="ao-stat-l">Pending</span>
          </div>
          <div className="ao-stat">
            <span className="ao-stat-n" style={{ color: "#16a34a" }}>{deliveredCnt}</span>
            <span className="ao-stat-l">Delivered</span>
          </div>
          <div className="ao-stat">
            <span className="ao-stat-n" style={{ color: "#ef4444" }}>{cancelledCnt}</span>
            <span className="ao-stat-l">Cancelled</span>
          </div>
        </div>

        {/* ── Empty ── */}
        {(!ordersData || ordersData.length === 0) && (
          <div className="ao-empty">
            <div className="ao-empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>Try adjusting your search query</p>
          </div>
        )}

        {/* ── Table ── */}
        {ordersData?.length > 0 && (
          <div className={`ao-scroll${isRefreshing ? ' ao-loading' : ''}`}>
            <table className="ao-tbl">
              <thead>
                <tr>
                  <th style={{ width: 44 }}></th>
                  <th>Order ID</th>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Distance</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order, orderIdx) => {
                  const isOpen = openOrderId === order._id;
                  const addr = order?.delivery_address || {};
                  const isCOD = !order?.paymentId;
                  const sc = getStatusStyle(order?.order_status);

                  // Calculate seller-specific total
                  const currentSellerId = context?.userData?._id || context?.userData?.id;
                  const allProducts = order?.products || [];
                  const sellerProducts = isSellerView && currentSellerId
                    ? allProducts.filter((p) => {
                      const productSellerId = p.sellerId?._id || p.sellerId;
                      return String(productSellerId) === String(currentSellerId);
                    })
                    : allProducts;

                  // Calculate subtotal for seller's products only
                  const sellerSubtotal = sellerProducts.reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0);

                  // For sellers, show only their product total; for admin, show full order total
                  const displayAmount = isSellerView ? sellerSubtotal : (order?.totalAmt || 0);

                  return (
                    <React.Fragment key={order._id}>
                      {/* ── Main row ── */}
                      <tr
                        className={`ao-main-row${isOpen ? " expanded" : ""}`}
                        style={{ animationDelay: `${Math.min(orderIdx, 12) * 0.03}s`, "--st": sc.dot }}
                      >

                        {/* Expand */}
                        <td data-label="">
                          <button
                            className={`ao-xbtn${isOpen ? " open" : ""}`}
                            onClick={() => toggleOrder(order._id)}
                            title={isOpen ? "Collapse" : "Show products"}
                          >
                            {isOpen ? "▲" : "▼"}
                          </button>
                        </td>

                        {/* Order ID */}
                        <td data-label="Order ID">
                          <span className="ao-oid">#{order._id?.slice(-8).toUpperCase()}</span>
                          <span className="ao-oid-full" title={order._id}>{order._id}</span>
                        </td>

                        {/* Payment */}
                        <td data-label="Payment">
                          {isCOD ? (
                            <span className="ao-badge ao-badge-cod">💵 Cash on Delivery</span>
                          ) : (
                            <>
                              <span className="ao-badge ao-badge-online">✓ Online</span>
                              <span className="ao-badge-pid">{order.paymentId?.slice(-12)}</span>
                            </>
                          )}
                        </td>

                        {/* Customer */}
                        <td data-label="Customer">
                          <div className="ao-cust-name">{order?.userId?.name}</div>
                          <div className="ao-cust-phone">📞 {addr?.mobile}</div>
                          <div className="ao-cust-email">✉ {order?.userId?.email?.substr(0, 5)}***</div>
                        </td>

                        {/* Address */}
                        <td data-label="Address">
                          {addr?.addressType && <span className="ao-addr-type">{addr.addressType}</span>}
                          <div className="ao-addr-text">
                            {[addr.city, addr.state].filter(Boolean).join(", ")}
                          </div>
                          <div className="ao-addr-pin">PIN {addr.pincode}</div>

                          {/* User's Current Location (Go Market) - Show if coordinates are valid */}
                          {order?.goMarketData?.userLocation?.coordinates &&
                            Array.isArray(order.goMarketData.userLocation.coordinates) &&
                            order.goMarketData.userLocation.coordinates.length >= 2 &&
                            order.goMarketData.userLocation.coordinates[0] !== 0 &&
                            order.goMarketData.userLocation.coordinates[1] !== 0 && (
                              <div style={{ marginTop: '6px' }}>
                                <a
                                  href={`https://www.google.com/maps?q=${order.goMarketData.userLocation.coordinates[1]},${order.goMarketData.userLocation.coordinates[0]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ao-tap-chip"
                                  style={{
                                    color: '#059669',
                                    background: '#d1fae5',
                                    borderColor: '#86efac',
                                  }}
                                  title={`GPS Location: ${order.goMarketData.userLocation.coordinates[1].toFixed(6)}, ${order.goMarketData.userLocation.coordinates[0].toFixed(6)}`}
                                >
                                  <span style={{
                                    width: 5,
                                    height: 5,
                                    background: '#10b981',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                  }} />
                                  📍 Live GPS
                                </a>
                              </div>
                            )}

                          {addr?.latitude && addr?.longitude && (
                            <div style={{ marginTop: '6px' }}>
                              <a
                                href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ao-tap-chip"
                                style={{ color: '#2563eb', background: '#eff6ff', borderColor: '#bfdbfe' }}
                              >
                                📍 View Location
                              </a>
                            </div>
                          )}

                          {/* Current Location from User's goMarketLocation */}
                          <UserCurrentLocationDisplay order={order} />
                        </td>

                        {/* Distance - Display delivery distance */}
                        <td data-label="Distance">
                          {order?.goMarketData?.distanceDisplay ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#0891b2',
                                background: '#cffafe',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #67e8f9'
                              }}>
                                📏 {order.goMarketData.distanceDisplay}
                              </span>
                              {order?.goMarketData?.userLocation?.coordinates?.[0] !== 0 && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${order.goMarketData.userLocation.coordinates[1]},${order.goMarketData.userLocation.coordinates[0]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ao-tap-chip"
                                  style={{ color: '#0891b2', background: '#ecfeff', borderColor: '#a5f3fc' }}
                                >
                                  🧭 Navigate
                                </a>
                              )}
                            </div>
                          ) : order?.goMarketData?.distanceKm ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#0891b2',
                              background: '#cffafe',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #67e8f9'
                            }}>
                              📏 {order.goMarketData.distanceKm.toFixed(1)} km
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              fontWeight: 500
                            }}>
                              —
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td data-label="Amount"><span className="ao-amt">{fmt(displayAmount)}</span></td>

                        {/* Status select */}
                        <td data-label="Status">
                          <Select
                            value={order?.order_status || "pending"}
                            size="small"
                            className="ao-status-sel"
                            disabled={isDeliveryRider}
                            onChange={(e) => handleChange(e, order._id)}
                            sx={{
                              minWidth: 120,
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600,
                              background: sc.bg,
                              color: sc.color,
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0ef" },
                              "& .MuiSvgIcon-root": { color: sc.color },
                            }}
                          >
                            <MenuItem value="pending">⏳ Pending</MenuItem>
                            <MenuItem value="confirmed">✅ Confirm</MenuItem>
                            <MenuItem value="processing">⚙️ Processing</MenuItem>
                            <MenuItem value="shipped">🚚 Shipped</MenuItem>
                            {/* Hide "delivered" option for sellers - only admin and riders can mark as delivered */}
                            {!isSellerView && <MenuItem value="delivered">📬 Delivered</MenuItem>}
                            <MenuItem value="cancelled">❌ Cancelled</MenuItem>
                            <MenuItem value="refunded">💸 Refunded</MenuItem>
                          </Select>
                        </td>

                        {/* Date */}
                        <td data-label="Date" style={{ whiteSpace: "nowrap", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                          📅 {fmtDate(order?.createdAt)}
                          {(order?.returnRequest?.requested || order?.refund?.status === "processed") && (
                            <div style={{ marginTop: 4, fontSize: 10 }}>
                              ↩ {order?.returnRequest?.status || "requested"} • 💸 {order?.refund?.status || "none"}
                            </div>
                          )}
                        </td>

                        {/* Delete + Receipt */}
                        <td data-label="Action">
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            <button
                              className="ao-receipt-btn"
                              onClick={() => setReceiptOrder(order)}
                            >
                              🧾 Receipt
                            </button>
                            {(isGoMarketShopSeller || isRestaurantSeller || context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN") && order?.order_status !== "delivered" && (
                              <>
                                {(isGoMarketShopSeller || isRestaurantSeller || context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN") && (
                                  <button className="ao-receipt-btn" onClick={() => broadcastOrder(order._id)} disabled={assigningOrderId === order._id || order?.deliveryAssignment?.status === 'broadcast'}>
                                    {assigningOrderId === order._id ? (
                                      <>
                                        <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>🔄</span>
                                        {' Broadcasting...'}
                                      </>
                                    ) : order?.deliveryAssignment?.status === 'broadcast' ? 'Broadcasted to riders' : 'Broadcast to market riders'}
                                  </button>
                                )}
                                {(context?.userData?.role === "ADMIN" || context?.userData?.role === "VICE_ADMIN") && (
                                  <Select size="small" displayEmpty value={order?.deliveryAssignment?.riderId?._id || order?.deliveryAssignment?.riderId || ""} onChange={(e) => assignRider(order._id, e.target.value)} disabled={assigningOrderId === order._id} sx={{ minWidth: 150, fontSize: 11, background: '#eef2ff', borderRadius: '8px' }}>
                                    <MenuItem value="" disabled>{order?.deliveryAssignment?.riderId ? 'Assigned rider' : 'Assign rider'}</MenuItem>
                                    {riders.map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
                                  </Select>
                                )}
                              </>
                            )}
                            {order?.deliveryAssignment?.status && (
                              <span className="ao-rider-status-badge">
                                <span className="ao-rider-status-dot" />
                                Rider: {order.deliveryAssignment.status}
                              </span>
                            )}
                            {isDeliveryRider && (
                              <div className="ao-rider-actions">
                                {order?.deliveryAssignment?.status === "broadcast" && (
                                  <button className="ao-receipt-btn" onClick={() => confirmAssignedOrder(order._id)} disabled={isProcessingAction(order._id, 'confirm')}>
                                    {isProcessingAction(order._id, 'confirm') ? (
                                      <>
                                        <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>🔄</span>
                                        {' Confirming...'}
                                      </>
                                    ) : '✅ Confirm Order'}
                                  </button>
                                )}
                                {order?.deliveryAssignment?.status === "assigned" && (
                                  <button className="ao-receipt-btn" onClick={() => confirmAssignedOrder(order._id)} disabled={isProcessingAction(order._id, 'confirm')}>
                                    {isProcessingAction(order._id, 'confirm') ? (
                                      <>
                                        <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>🔄</span>
                                        {' Confirming...'}
                                      </>
                                    ) : '✅ Confirm Order'}
                                  </button>
                                )}
                                {order?.deliveryAssignment?.status === "confirmed" && (
                                  <>
                                    <button className="ao-receipt-btn" onClick={() => callCustomer(order)}>📞 Call Customer</button>
                                    <button className="ao-receipt-btn" onClick={() => sendOtpAndDeliver(order._id)} disabled={isProcessingAction(order._id, 'deliver')}>
                                      {isProcessingAction(order._id, 'deliver') ? (
                                        <>
                                          <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>🔄</span>
                                          {' Delivering...'}
                                        </>
                                      ) : '📬 Deliver with OTP'}
                                    </button>
                                  </>
                                )}
                                {order?.deliveryAssignment?.status === "otp_sent" && (
                                  <>
                                    <button className="ao-receipt-btn" onClick={() => callCustomer(order)}>📞 Call Customer</button>
                                    <button className="ao-receipt-btn" onClick={() => sendOtpAndDeliver(order._id)} disabled={isProcessingAction(order._id, 'deliver')}>
                                      {isProcessingAction(order._id, 'deliver') ? (
                                        <>
                                          <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>🔄</span>
                                          {' Delivering...'}
                                        </>
                                      ) : '📬 Deliver with OTP'}
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            {order?.returnRequest?.requested && order?.refund?.status !== "processed" && (
                              <>
                                <button className="ao-receipt-btn" onClick={() => handleReturnRefundUpdate(order._id, "approve")}>↩️ Approve Return</button>
                                <button className="ao-receipt-btn" onClick={() => handleReturnRefundUpdate(order._id, "refund")}>💸 Mark Refund</button>
                              </>
                            )}
                            {context?.userData?.role === "ADMIN" && (
                              <button className="ao-del" onClick={() => deleteOrder(order._id)}>
                                🗑 Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded products panel ── */}
                      {isOpen && (
                        <tr className="ao-panel-row">
                          <td colSpan={10}>
                            <div className="ao-panel">
                              {(() => {
                                // Filter products for seller view - only show products that belong to this seller
                                const currentSellerId = context?.userData?._id || context?.userData?.id;
                                const productsToShow = isSellerView && currentSellerId
                                  ? (order?.products || []).filter((p) => {
                                    const productSellerId = p.sellerId?._id || p.sellerId;
                                    return String(productSellerId) === String(currentSellerId);
                                  })
                                  : (order?.products || []);

                                return (
                                  <>
                                    <div className="ao-panel-hdr">
                                      <span className="ao-panel-title">📦 Products in this order</span>
                                      <span className="ao-panel-count">{productsToShow.length} items</span>
                                    </div>

                                    {/* Distance Information */}
                                    {(order?.goMarketData?.distanceDisplay || order?.goMarketData?.distanceKm) && (
                                      <div style={{
                                        background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
                                        border: '1px solid #67e8f9',
                                        borderRadius: '10px',
                                        padding: '12px 16px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                      }}>
                                        <div style={{
                                          width: '40px',
                                          height: '40px',
                                          background: '#0891b2',
                                          borderRadius: '8px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '20px',
                                          flexShrink: 0
                                        }}>
                                          📏
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#0e7490',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '4px'
                                          }}>
                                            Delivery Distance
                                          </div>
                                          <div style={{
                                            fontSize: '18px',
                                            fontWeight: 800,
                                            color: '#0891b2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}>
                                            {order.goMarketData.distanceDisplay || `${order.goMarketData.distanceKm.toFixed(1)} km`}
                                            {order?.goMarketData?.userLocation?.coordinates?.[0] !== 0 && (
                                              <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${order.goMarketData.userLocation.coordinates[1]},${order.goMarketData.userLocation.coordinates[0]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px',
                                                  fontSize: '11px',
                                                  fontWeight: 600,
                                                  color: '#0891b2',
                                                  textDecoration: 'none',
                                                  padding: '4px 10px',
                                                  background: '#ffffff',
                                                  border: '1px solid #67e8f9',
                                                  borderRadius: '6px',
                                                  transition: 'all 0.15s'
                                                }}
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.background = '#f0fdff';
                                                  e.currentTarget.style.borderColor = '#22d3ee';
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.background = '#ffffff';
                                                  e.currentTarget.style.borderColor = '#67e8f9';
                                                }}
                                              >
                                                🧭 Get Directions
                                              </a>
                                            )}
                                          </div>
                                          {order?.goMarketData?.userLocation?.address && (
                                            <div style={{
                                              fontSize: '11px',
                                              color: '#0e7490',
                                              marginTop: '4px'
                                            }}>
                                              📍 {order.goMarketData.userLocation.address}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <p className="ao-panel-hint">
                                      Click any product card to see full details
                                    </p>
                                    <div className="ao-prod-list">
                                      {productsToShow.map((item, i) => (
                                        <div
                                          className="ao-prod-card"
                                          key={i}
                                          onClick={() => setSelectedProduct(item)}
                                          title="Click to view product details"
                                        >
                                          {/* Image */}
                                          {item.image
                                            ? <img src={item.image} alt={item.productTitle} className="ao-prod-img" />
                                            : <div className="ao-prod-noimg">🖼️</div>
                                          }

                                          {/* Info */}
                                          <div className="ao-prod-info">
                                            <div className="ao-prod-name">{String(item.productTitle || 'N/A')}</div>
                                            {item.sellerId && (
                                              <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid #f0f0f7' }}>
                                                <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                                                  🏪 {(() => {
                                                    const sellerName = item.sellerId?.storeProfile?.storeName || item.sellerId?.name || 'N/A';
                                                    return String(sellerName);
                                                  })()}
                                                </div>
                                                {(item.sellerId?.mobile || item.sellerId?.storeProfile?.contactNo) && (
                                                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginTop: 2 }}>
                                                    📱 {String(item.sellerId?.mobile || item.sellerId?.storeProfile?.contactNo)}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            <div className="ao-prod-tags">
                                              {/* Show selectedOptions with highlighted badge if available, else show weight/size/color/ram */}
                                              {item.selectedOptions && typeof item.selectedOptions === 'object' && Object.keys(item.selectedOptions).length > 0 ? (
                                                <>
                                                  {Object.entries(item.selectedOptions).map(([key, value]) => {
                                                    // Convert value to string, handle objects safely
                                                    const displayValue = typeof value === 'object' && value !== null
                                                      ? JSON.stringify(value)
                                                      : String(value || '');
                                                    return displayValue ? (
                                                      <span
                                                        key={key}
                                                        className="ao-prod-tag"
                                                        style={{
                                                          background: '#fef3c7',
                                                          color: '#92400e',
                                                          border: '1px solid #fde68a',
                                                          fontWeight: 700
                                                        }}
                                                      >
                                                        🎯 {key}: {displayValue}
                                                      </span>
                                                    ) : null;
                                                  })}
                                                </>
                                              ) : (
                                                <>
                                                  {item.weight && <span className="ao-prod-tag">📦 {String(item.weight)}</span>}
                                                  {item.color && <span className="ao-prod-tag">🎨 {String(item.color)}</span>}
                                                  {item.size && <span className="ao-prod-tag">📐 {String(item.size)}</span>}
                                                  {item.ram && <span className="ao-prod-tag">💾 {String(item.ram)}</span>}
                                                </>
                                              )}
                                              <span className="ao-prod-tag">Qty {item.quantity || 0}</span>
                                            </div>
                                          </div>

                                          {/* Price */}
                                          <div className="ao-prod-right">
                                            <div className="ao-prod-subtotal">{fmt(item.price * item.quantity)}</div>
                                            <div className="ao-prod-unit">{fmt(item.price)} per</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Total footer */}
                                    <div className="ao-panel-total">
                                      <span className="ao-panel-total-lbl">Order Total</span>
                                      <span className="ao-panel-total-amt">{fmt(displayAmount)}</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {orders?.totalPages > 1 && (
          <div className="ao-page-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            {/* Items per page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Items per page:</span>
              <Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(e.target.value);
                  setPageOrder(1); // Reset to page 1 when changing limit
                }}
                size="small"
                sx={{
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: "'DM Sans', sans-serif",
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '8px',
                  },
                }}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </div>

            {/* Pagination controls */}
            <Pagination
              showFirstButton
              showLastButton
              count={orders?.totalPages}
              page={pageOrder}
              onChange={(_, v) => setPageOrder(v)}
              siblingCount={mobileView ? 0 : 1}
              size={mobileView ? "small" : "medium"}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  borderRadius: "8px",
                },
                "& .Mui-selected": {
                  background: "#0c0c14 !important",
                  color: "#fff !important",
                },
              }}
            />

            {/* Total count display */}
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
              Showing {((pageOrder - 1) * itemsPerPage) + 1}-{Math.min(pageOrder * itemsPerPage, orders?.totalCount || 0)} of {orders?.totalCount || 0}
            </div>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OTP VERIFICATION DIALOG - Mobile Responsive Enhanced UI
       ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={otpDialog.open}
        onClose={() => setOtpDialog({ open: false, orderId: null, otp: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            padding: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '16px',
            maxWidth: '420px',
          }
        }}
      >
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          <DialogTitle sx={{
            textAlign: 'center',
            pb: 1,
            pt: { xs: 2.5, sm: 3 },
            px: { xs: 2, sm: 3 },
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              animation: 'pulse 2s infinite',
            }}>
              <span style={{ fontSize: 36 }}>🔐</span>
            </div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: mobileView ? 18 : 22,
              fontWeight: 800,
              color: '#1a1a1a',
              marginBottom: 8,
              letterSpacing: '-0.5px',
            }}>
              Verify Delivery OTP
            </div>
            <div style={{
              fontSize: mobileView ? 12 : 14,
              color: '#6b7280',
              fontWeight: 500,
              lineHeight: 1.5,
              padding: '0 8px',
            }}>
              Enter the 6-digit OTP received by the customer
            </div>
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
            {/* OTP Label - Positioned Above */}
            <div style={{
              fontSize: mobileView ? 13 : 14,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>🔢</span>
              <span>Enter 6-Digit OTP</span>
            </div>

            <TextField
              autoFocus
              fullWidth
              type="text"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: mobileView ? 24 : 28,
                  fontWeight: 700,
                  letterSpacing: mobileView ? '8px' : '12px',
                  fontFamily: "'Courier New', monospace",
                  padding: mobileView ? '18px 12px' : '20px 16px',
                  color: '#111827',
                }
              }}
              value={otpDialog.otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only numbers
                setOtpDialog({ ...otpDialog, otp: value });
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && otpDialog.otp.length >= 4) {
                  handleOtpSubmit();
                }
              }}
              placeholder="••••••"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  background: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    background: '#f3f4f6',
                    borderColor: '#667eea',
                    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                  },
                  '&.Mui-focused': {
                    background: '#fff',
                    borderColor: '#667eea',
                    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.15)',
                  },
                },
                '& input': {
                  '&::placeholder': {
                    color: '#d1d5db',
                    opacity: 1,
                  }
                }
              }}
            />

            {/* Character Counter */}
            <div style={{
              textAlign: 'center',
              marginTop: 8,
              fontSize: 12,
              color: otpDialog.otp.length >= 4 ? '#059669' : '#9ca3af',
              fontWeight: 600,
            }}>
              {otpDialog.otp.length} / 6 digits entered
            </div>

            {/* Info Box */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: mobileView ? 8 : 10,
              marginTop: 16,
              padding: mobileView ? '12px' : '14px 16px',
              background: '#fef3c7',
              borderRadius: 12,
              border: '1.5px solid #fde68a',
            }}>
              <span style={{
                fontSize: mobileView ? 18 : 20,
                flexShrink: 0,
                marginTop: 2,
              }}>💡</span>
              <span style={{
                fontSize: mobileView ? 12 : 13,
                color: '#92400e',
                fontWeight: 600,
                lineHeight: 1.5,
                flex: 1,
              }}>
                Ask the customer for the OTP they received via SMS on their registered mobile number
              </span>
            </div>
          </DialogContent>

          <DialogActions sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2.5, sm: 3 },
            pt: 2,
            gap: { xs: 1.5, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              onClick={() => setOtpDialog({ open: false, orderId: null, otp: '' })}
              variant="outlined"
              fullWidth
              sx={{
                textTransform: 'none',
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: 14, sm: 15 },
                py: { xs: 1.5, sm: 1.6 },
                borderColor: '#e5e7eb',
                borderWidth: 2,
                color: '#6b7280',
                order: { xs: 2, sm: 1 },
                '&:hover': {
                  borderColor: '#d1d5db',
                  borderWidth: 2,
                  background: '#f9fafb',
                },
              }}
            >
              ✕ Cancel
            </Button>
            <Button
              onClick={handleOtpSubmit}
              variant="contained"
              fullWidth
              disabled={otpDialog.otp.length < 4}
              sx={{
                textTransform: 'none',
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: 14, sm: 15 },
                py: { xs: 1.5, sm: 1.6 },
                order: { xs: 1, sm: 2 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#e5e7eb',
                  color: '#9ca3af',
                  boxShadow: 'none',
                  transform: 'none',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {otpDialog.otp.length >= 4 ? '✓ Verify & Complete' : '⏳ Enter OTP First'}
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        /* Mobile optimization for OTP dialog */
        @media (max-width: 600px) {
          .MuiDialog-paper {
            margin: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export { Orders };
export default Orders;