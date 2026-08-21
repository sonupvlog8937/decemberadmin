import React, { useState, useEffect } from 'react';
import { fetchDataFromApi } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

// ─── STYLES ────────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT & RESET
═══════════════════════════════════════════════════════════════════════════ */
.oa { font-family: 'Inter', sans-serif; color: #111827; }
.oa *, .oa *::before, .oa *::after { box-sizing: border-box; }

/* ─── Page Layout ─────────────────────────────────────────────────────────── */
.oa-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.oa-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ─── Header ──────────────────────────────────────────────────────────────── */
.oa-header {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.oa-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.oa-title-wrap {
  flex: 1;
}

.oa-title {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.oa-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.oa-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.oa-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.oa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.oa-btn-primary {
  background: #fff;
  color: #667eea;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.oa-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.oa-btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.oa-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.oa-btn-print {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.oa-btn-print:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.oa-btn .spinning {
  animation: spin 0.8s linear infinite;
}

/* ─── Filters ─────────────────────────────────────────────────────────────── */
.oa-filters {
  display: flex;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.oa-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.oa-filter-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.oa-filter-input,
.oa-filter-select {
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  min-width: 160px;
}

.oa-filter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.oa-filter-input:focus,
.oa-filter-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.oa-filter-select option {
  background: #4c51bf;
  color: #fff;
}

/* ─── Summary Stats ──────────────────────────────────────────────────────── */
.oa-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.oa-stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.oa-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.oa-stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.oa-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.oa-stat-content {
  flex: 1;
}

.oa-stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.oa-stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #111827;
  margin-top: 4px;
  letter-spacing: -0.5px;
}

.oa-stat-sub {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

/* ─── Charts Section ─────────────────────────────────────────────────────── */
.oa-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .oa-charts {
    grid-template-columns: 1fr;
  }
}

.oa-chart-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.oa-chart-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 20px;
}

/* ─── Detailed Orders Table ─────────────────────────────────────────────── */
.oa-orders-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.oa-order-row {
  border-bottom: 1px solid #f3f4f6;
  padding: 20px;
  transition: background 0.2s ease;
}

.oa-order-row:hover {
  background: #f9fafb;
}

.oa-order-row:last-child {
  border-bottom: none;
}

.oa-order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.oa-order-id-badge {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #667eea;
  background: #eff6ff;
  padding: 6px 12px;
  border-radius: 8px;
}

.oa-order-date {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.oa-order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.oa-info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.oa-info-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.oa-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.oa-customer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.oa-customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.oa-customer-details {
  flex: 1;
  min-width: 0;
}

.oa-customer-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.oa-customer-contact {
  font-size: 11px;
  color: #6b7280;
}

.oa-products-list {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
}

.oa-products-title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.oa-product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
}

.oa-product-item:last-child {
  margin-bottom: 0;
}

.oa-product-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.oa-product-noimg {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.oa-product-details {
  flex: 1;
  min-width: 0;
}

.oa-product-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oa-product-meta {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.oa-product-price {
  font-size: 14px;
  font-weight: 800;
  color: #059669;
  white-space: nowrap;
}

.oa-order-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 2px solid #e5e7eb;
  margin-top: 12px;
}

.oa-order-total-label {
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
}

.oa-order-total-value {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
}

.oa-expand-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.oa-expand-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.oa-products-collapsed {
  display: none;
}

/* ─── Print styles for detailed orders ──────────────────────────────────── */
@media print {
  .oa-order-row {
    page-break-inside: avoid;
    border: 1px solid #e5e7eb;
    margin-bottom: 12px;
    padding: 12px;
  }
  
  .oa-expand-btn {
    display: none !important;
  }
  
  .oa-products-collapsed {
    display: block !important;
  }
}
.oa-table-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.oa-table-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.oa-table-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px;
}

.oa-table-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.oa-table-scroll {
  overflow-x: auto;
}

.oa-table {
  width: 100%;
  border-collapse: collapse;
}

.oa-table thead {
  background: #f9fafb;
}

.oa-table th {
  padding: 14px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.oa-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.oa-table tbody tr:hover {
  background: #f9fafb;
}

.oa-table tbody tr:last-child td {
  border-bottom: none;
}

.oa-shop-name {
  font-weight: 700;
  color: #111827;
}

.oa-shop-id {
  font-size: 11px;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
  display: block;
  margin-top: 2px;
}

.oa-amount {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #059669;
}

.oa-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.oa-badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.oa-badge-delivered {
  background: #d1fae5;
  color: #065f46;
}

.oa-badge-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* ─── Loading State ──────────────────────────────────────────────────────── */
.oa-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.oa-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.oa-loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
.oa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
}

.oa-empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.oa-empty-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.oa-empty-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  text-align: center;
  max-width: 400px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRINT STYLES
═══════════════════════════════════════════════════════════════════════════ */
@media print {
  body * {
    visibility: hidden !important;
  }
  
  .oa-printable,
  .oa-printable * {
    visibility: visible !important;
  }
  
  .oa-printable {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    background: #fff !important;
    padding: 20mm !important;
    margin: 0 !important;
  }
  
  .oa-print-header {
    border-bottom: 3px solid #111827;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  
  .oa-print-title {
    font-size: 28px;
    font-weight: 900;
    color: #111827;
    margin: 0 0 8px;
  }
  
  .oa-print-meta {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
  
  .oa-print-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    page-break-inside: avoid;
  }
  
  .oa-print-stat {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  
  .oa-print-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .oa-print-stat-value {
    font-size: 22px;
    font-weight: 900;
    color: #111827;
  }
  
  .oa-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  
  .oa-print-table thead {
    background: #f3f4f6;
  }
  
  .oa-print-table th {
    padding: 10px 8px;
    text-align: left;
    font-size: 9px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    border-bottom: 2px solid #111827;
  }
  
  .oa-print-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .oa-print-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }
  
  .oa-print-footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 2px solid #e5e7eb;
    text-align: center;
    font-size: 10px;
    color: #6b7280;
  }
  
  .oa-no-print {
    display: none !important;
  }
  
  /* Ensure page breaks */
  .oa-print-section {
    page-break-inside: avoid;
  }
}
`;

// ─── Detailed Orders List Component ────────────────────────────────────────────
const DetailedOrdersList = ({ orders, fmt }) => {
  const [expandedOrders, setExpandedOrders] = React.useState(new Set());

  const toggleOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return { bg: '#fef3c7', color: '#92400e', text: 'Pending' };
    if (s === 'confirmed') return { bg: '#dbeafe', color: '#1e40af', text: 'Confirmed' };
    if (s === 'processing') return { bg: '#ede9fe', color: '#5b21b6', text: 'Processing' };
    if (s === 'shipped') return { bg: '#e0e7ff', color: '#4338ca', text: 'Shipped' };
    if (s === 'delivered') return { bg: '#d1fae5', color: '#065f46', text: 'Delivered' };
    if (s === 'cancelled') return { bg: '#fee2e2', color: '#991b1b', text: 'Cancelled' };
    return { bg: '#f3f4f6', color: '#374151', text: status };
  };

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="oa-orders-card oa-print-section">
      <div className="oa-table-header">
        <h3 className="oa-table-title">📋 Detailed Orders List</h3>
        <p className="oa-table-subtitle">
          Complete order details with customer info and products ({orders.length} orders)
        </p>
      </div>

      {sortedOrders.map((order, idx) => {
        const isExpanded = expandedOrders.has(order._id);
        const statusStyle = getStatusStyle(order.order_status);
        const products = order.products || [];
        
        // Group products by shop
        const productsByShop = {};
        products.forEach(item => {
          const shopId = item.shopId || 'unknown';
          const shopName = item.shopName || item.shopDisplayName || 'Unknown Shop';
          if (!productsByShop[shopId]) {
            productsByShop[shopId] = {
              shopName,
              items: [],
              total: 0,
            };
          }
          productsByShop[shopId].items.push(item);
          productsByShop[shopId].total += (item.price || 0) * (item.quantity || 1);
        });

        return (
          <div key={order._id} className="oa-order-row">
            {/* Order Header */}
            <div className="oa-order-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="oa-order-id-badge">#{idx + 1}</span>
                <div className="oa-order-date">
                  📅 {formatDate(order.createdAt)}
                </div>
                <div 
                  className="oa-badge" 
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {statusStyle.text}
                </div>
              </div>
              <button 
                className="oa-expand-btn oa-no-print"
                onClick={() => toggleOrder(order._id)}
              >
                {isExpanded ? '▼ Collapse' : '▶ Expand Details'}
              </button>
            </div>

            {/* Order Info Grid */}
            <div className="oa-order-info">
              {/* Customer Info */}
              <div className="oa-info-group">
                <div className="oa-info-label">👤 Customer</div>
                <div className="oa-customer-info">
                  <div className="oa-customer-avatar">
                    {order.userId?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="oa-customer-details">
                    <div className="oa-customer-name">
                      {order.userId?.name || 'Guest User'}
                    </div>
                    <div className="oa-customer-contact">
                      {order.userId?.email || order.userId?.phone || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order ID */}
              <div className="oa-info-group">
                <div className="oa-info-label">🆔 Order ID</div>
                <div className="oa-info-value" style={{ 
                  fontFamily: 'Courier New, monospace', 
                  fontSize: 11,
                  wordBreak: 'break-all' 
                }}>
                  {order._id}
                </div>
              </div>

              {/* Payment Method */}
              <div className="oa-info-group">
                <div className="oa-info-label">💳 Payment</div>
                <div className="oa-info-value">
                  {order.paymentId ? (
                    <span style={{ color: '#059669' }}>💰 Online Paid</span>
                  ) : (
                    <span style={{ color: '#f59e0b' }}>💵 COD</span>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="oa-info-group">
                <div className="oa-info-label">💰 Total Amount</div>
                <div className="oa-info-value" style={{ 
                  fontSize: 18, 
                  color: '#059669',
                  fontWeight: 800 
                }}>
                  {fmt(order.totalAmt)}
                </div>
              </div>
            </div>

            {/* Products List - Show if expanded or in print */}
            <div className={`oa-products-list ${!isExpanded ? 'oa-products-collapsed' : ''}`}>
              {Object.entries(productsByShop).map(([shopId, shopData], shopIdx) => (
                <div key={shopId} style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <div className="oa-products-title">
                      🏪 {shopData.shopName} ({shopData.items.length} items)
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 700, 
                      color: '#059669' 
                    }}>
                      {fmt(shopData.total)}
                    </div>
                  </div>

                  {shopData.items.map((item, itemIdx) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <div key={itemIdx} className="oa-product-item">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.productTitle} 
                            className="oa-product-img" 
                          />
                        ) : (
                          <div className="oa-product-noimg">📦</div>
                        )}

                        <div className="oa-product-details">
                          <div className="oa-product-name">
                            {item.productTitle || 'Unknown Product'}
                          </div>
                          <div className="oa-product-meta">
                            <span>Qty: {item.quantity || 1}</span>
                            <span>•</span>
                            <span>Unit: {fmt(item.price)}</span>
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>Size: {item.size}</span>
                              </>
                            )}
                            {item.color && (
                              <>
                                <span>•</span>
                                <span>Color: {item.color}</span>
                              </>
                            )}
                            {item.weight && (
                              <>
                                <span>•</span>
                                <span>Weight: {item.weight}</span>
                              </>
                            )}
                            {item.ram && (
                              <>
                                <span>•</span>
                                <span>RAM: {item.ram}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="oa-product-price">
                          {fmt(itemTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Order Total */}
              <div className="oa-order-total">
                <div className="oa-order-total-label">
                  Order Total ({products.length} items from {Object.keys(productsByShop).length} shop{Object.keys(productsByShop).length !== 1 ? 's' : ''})
                </div>
                <div className="oa-order-total-value">
                  {fmt(order.totalAmt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const OrderAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // Filters - Default to last 1 week
  const getLastWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };
  
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  const [dateFrom, setDateFrom] = useState(getLastWeekDate());
  const [dateTo, setDateTo] = useState(getTodayDate());
  const [statusFilter, setStatusFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');

  // Fetch orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetchDataFromApi('/api/order/order-list?page=1&limit=10000');
      const allOrders = response?.data || [];
      setOrders(allOrders);
      setFilteredOrders(allOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Date filter
    if (dateFrom) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(dateTo + 'T23:59:59'));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.order_status?.toLowerCase() === statusFilter);
    }

    // Shop filter
    if (shopFilter !== 'all') {
      filtered = filtered.filter(o => {
        const items = o.products || [];
        return items.some(item => item.shopId === shopFilter);
      });
    }

    setFilteredOrders(filtered);
  }, [orders, dateFrom, dateTo, statusFilter, shopFilter]);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmt) || 0), 0);
    
    // By status
    const byStatus = {};
    filteredOrders.forEach(o => {
      const status = o.order_status || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // By shop
    const shopStats = {};
    filteredOrders.forEach(order => {
      const items = order.products || [];
      items.forEach(item => {
        const shopId = item.shopId || 'Unknown';
        const shopName = item.shopName || item.shopDisplayName || 'Unknown Shop';
        
        if (!shopStats[shopId]) {
          shopStats[shopId] = {
            shopId,
            shopName,
            totalOrders: 0,
            totalRevenue: 0,
            totalItems: 0,
            orders: [],
          };
        }
        
        shopStats[shopId].totalItems += item.quantity || 1;
        shopStats[shopId].totalRevenue += (item.price || 0) * (item.quantity || 1);
        
        if (!shopStats[shopId].orders.includes(order._id)) {
          shopStats[shopId].orders.push(order._id);
          shopStats[shopId].totalOrders++;
        }
      });
    });

    // Convert to array and sort by revenue
    const shopArray = Object.values(shopStats).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Daily stats for chart
    const dailyStats = {};
    filteredOrders.forEach(o => {
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { date, orders: 0, revenue: 0 };
      }
      dailyStats[date].orders++;
      dailyStats[date].revenue += Number(o.totalAmt) || 0;
    });
    const dailyArray = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      byStatus,
      shopStats: shopArray,
      dailyStats: dailyArray,
    };
  }, [filteredOrders]);

  // Format currency
  const fmt = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Chart colors
  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f97316'];

  // Get unique shops for filter
  const uniqueShops = React.useMemo(() => {
    const shops = new Map();
    orders.forEach(order => {
      const items = order.products || [];
      items.forEach(item => {
        if (item.shopId && !shops.has(item.shopId)) {
          shops.set(item.shopId, item.shopName || item.shopDisplayName || 'Unknown Shop');
        }
      });
    });
    return Array.from(shops.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [orders]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="oa">
          <div className="oa-page">
            <div className="oa-container">
              <div className="oa-loading">
                <div className="oa-spinner" />
                <div className="oa-loading-text">Loading analytics data...</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="oa">
        <div className="oa-page">
          <div className="oa-container">
            {/* Header - NO PRINT */}
            <div className="oa-header oa-no-print">
              <div className="oa-header-top">
                <div className="oa-title-wrap">
                  <h1 className="oa-title">
                    📊 Order Analytics Dashboard
                  </h1>
                  <p className="oa-subtitle">
                    Complete data analysis • Last 7 days by default • Shop-wise breakdown • Print-ready reports
                  </p>
                </div>
                <div className="oa-actions">
                  <button
                    className="oa-btn oa-btn-secondary"
                    onClick={() => navigate('/orders')}
                  >
                    ← Back to Orders
                  </button>
                  <button
                    className="oa-btn oa-btn-secondary"
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                  >
                    <span className={refreshing ? 'spinning' : ''}>🔄</span>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    className="oa-btn oa-btn-print"
                    onClick={handlePrint}
                  >
                    🖨️ Print Report
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="oa-filters">
                <div className="oa-filter-group">
                  <label className="oa-filter-label">Date From</label>
                  <input
                    type="date"
                    className="oa-filter-input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="oa-filter-group">
                  <label className="oa-filter-label">Date To</label>
                  <input
                    type="date"
                    className="oa-filter-input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="oa-filter-group">
                  <label className="oa-filter-label">Status</label>
                  <select
                    className="oa-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="oa-filter-group">
                  <label className="oa-filter-label">Shop</label>
                  <select
                    className="oa-filter-select"
                    value={shopFilter}
                    onChange={(e) => setShopFilter(e.target.value)}
                  >
                    <option value="all">All Shops</option>
                    {uniqueShops.map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                {(dateFrom || dateTo || statusFilter !== 'all' || shopFilter !== 'all') && (
                  <div className="oa-filter-group" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="oa-btn oa-btn-secondary"
                      style={{ marginTop: 'auto' }}
                      onClick={() => {
                        setDateFrom(getLastWeekDate());
                        setDateTo(getTodayDate());
                        setStatusFilter('all');
                        setShopFilter('all');
                      }}
                    >
                      ✕ Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PRINTABLE CONTENT */}
            <div className="oa-printable">
              {/* Print Header */}
              <div className="oa-print-header">
                <h1 className="oa-print-title">Order Analytics Report</h1>
                <p className="oa-print-meta">
                  Generated on: {new Date().toLocaleString('en-IN')} | 
                  Period: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-IN') : 'All time'} to {dateTo ? new Date(dateTo).toLocaleDateString('en-IN') : 'Present'} | 
                  Total Orders: {analytics.totalOrders} | 
                  Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} |
                  Shop: {shopFilter === 'all' ? 'All Shops' : uniqueShops.find(([id]) => id === shopFilter)?.[1] || 'Unknown'}
                </p>
              </div>

              {/* Summary Stats */}
              <div className="oa-summary">
                <div className="oa-stat-card">
                  <div className="oa-stat-header">
                    <div className="oa-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      📦
                    </div>
                    <div className="oa-stat-content">
                      <div className="oa-stat-label">Total Orders</div>
                      <div className="oa-stat-value">{analytics.totalOrders}</div>
                    </div>
                  </div>
                  <div className="oa-stat-sub">
                    Delivered: {analytics.byStatus.delivered || 0} | Pending: {analytics.byStatus.pending || 0}
                  </div>
                </div>

                <div className="oa-stat-card">
                  <div className="oa-stat-header">
                    <div className="oa-stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                      💰
                    </div>
                    <div className="oa-stat-content">
                      <div className="oa-stat-label">Total Revenue</div>
                      <div className="oa-stat-value">{fmt(analytics.totalRevenue)}</div>
                    </div>
                  </div>
                  <div className="oa-stat-sub">
                    From {analytics.totalOrders} completed orders
                  </div>
                </div>

                <div className="oa-stat-card">
                  <div className="oa-stat-header">
                    <div className="oa-stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                      📊
                    </div>
                    <div className="oa-stat-content">
                      <div className="oa-stat-label">Avg Order Value</div>
                      <div className="oa-stat-value">{fmt(analytics.avgOrderValue)}</div>
                    </div>
                  </div>
                  <div className="oa-stat-sub">
                    Per order average calculation
                  </div>
                </div>

                <div className="oa-stat-card">
                  <div className="oa-stat-header">
                    <div className="oa-stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>
                      🏪
                    </div>
                    <div className="oa-stat-content">
                      <div className="oa-stat-label">Active Shops</div>
                      <div className="oa-stat-value">{analytics.shopStats.length}</div>
                    </div>
                  </div>
                  <div className="oa-stat-sub">
                    Shops with at least one order
                  </div>
                </div>
              </div>

              {/* Charts - NO PRINT */}
              {analytics.dailyStats.length > 0 && (
                <div className="oa-charts oa-no-print">
                  <div className="oa-chart-card">
                    <h3 className="oa-chart-title">Daily Orders Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          formatter={(value, name) => {
                            if (name === 'revenue') return [fmt(value), 'Revenue'];
                            return [value, 'Orders'];
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} name="Orders" />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="oa-chart-card">
                    <h3 className="oa-chart-title">Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.byStatus).map(([status, count]) => ({ name: status, value: count }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.keys(analytics.byStatus).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Shop-wise breakdown */}
              {analytics.shopStats.length > 0 ? (
                <>
                  <div className="oa-table-card oa-print-section">
                    <div className="oa-table-header">
                      <h3 className="oa-table-title">Shop-wise Sales Breakdown</h3>
                      <p className="oa-table-subtitle">
                        Detailed analysis of sales per shop
                      </p>
                    </div>
                    <div className="oa-table-scroll">
                      <table className="oa-table oa-print-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Shop Name</th>
                            <th>Total Orders</th>
                            <th>Total Items</th>
                            <th>Total Revenue</th>
                            <th>Avg Order Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.shopStats.map((shop, index) => (
                            <tr key={shop.shopId}>
                              <td>{index + 1}</td>
                              <td>
                                <div className="oa-shop-name">{shop.shopName}</div>
                                <span className="oa-shop-id">{shop.shopId}</span>
                              </td>
                              <td>{shop.totalOrders}</td>
                              <td>{shop.totalItems}</td>
                              <td>
                                <span className="oa-amount">{fmt(shop.totalRevenue)}</span>
                              </td>
                              <td>
                                {fmt(shop.totalRevenue / shop.totalOrders)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                          <tr>
                            <td colSpan="2">TOTAL</td>
                            <td>{analytics.totalOrders}</td>
                            <td>{analytics.shopStats.reduce((sum, s) => sum + s.totalItems, 0)}</td>
                            <td>
                              <span className="oa-amount">{fmt(analytics.totalRevenue)}</span>
                            </td>
                            <td>—</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Orders List */}
                  <DetailedOrdersList orders={filteredOrders} fmt={fmt} />
                </>
              ) : (
                <div className="oa-empty">
                  <div className="oa-empty-icon">📦</div>
                  <h3 className="oa-empty-title">No Data Available</h3>
                  <p className="oa-empty-text">
                    No orders found matching your filter criteria. Try adjusting the filters or date range.
                  </p>
                </div>
              )}

              {/* Print Footer */}
              <div className="oa-print-footer">
                <p>This is a computer-generated report from ZeeDaddy Order Analytics System</p>
                <p>© {new Date().getFullYear()} ZeeDaddy. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderAnalytics;
