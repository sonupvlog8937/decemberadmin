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

/* ─── View Mode Toggle ──────────────────────────────────────────────────── */
.oa-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px;
}

.oa-view-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.oa-view-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.oa-view-btn.active {
  background: #fff;
  color: #667eea;
  font-weight: 700;
}

/* ─── Monthly Report Styles ────────────────────────────────────────────── */
.oa-monthly-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24px;
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;
}

.oa-monthly-title {
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.oa-monthly-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
}

.oa-shop-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.oa-shop-header {
  background: linear-gradient(to right, #f9fafb, #fff);
  padding: 20px 24px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.oa-shop-name-group {
  flex: 1;
  min-width: 0;
}

.oa-shop-main-name {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.oa-shop-stats-inline {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.oa-shop-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.oa-shop-total-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

.oa-shop-orders-list {
  padding: 0;
}

.oa-shop-order-item {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.oa-shop-order-item:last-child {
  border-bottom: none;
}

.oa-shop-order-item:hover {
  background: #f9fafb;
}

.oa-month-summary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
}

.oa-month-summary-title {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 20px;
  font-weight: 600;
}

.oa-month-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.oa-month-stat {
  text-align: center;
}

.oa-month-stat-value {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.oa-month-stat-label {
  font-size: 12px;
  opacity: 0.85;
  font-weight: 600;
}

/* Print styles for monthly report */
@media print {
  .oa-shop-section {
    page-break-inside: avoid;
    margin-bottom: 16px;
    border: 1px solid #e5e7eb !important;
  }
  
  .oa-shop-header {
    background: #f9fafb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .oa-monthly-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    page-break-after: avoid;
  }
  
  .oa-month-summary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    page-break-inside: avoid;
    page-break-after: avoid;
  }
  
  .oa-shop-total-badge {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .oa-shop-order-item {
    page-break-inside: avoid;
  }
  
  .oa-view-toggle {
    display: none !important;
  }
  
  /* Ensure all product images print */
  .oa-shop-order-item img {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Better page breaks */
  .oa-shop-section:not(:last-child) {
    page-break-after: always;
  }
  
  /* Print product cards with colors */
  [style*="background: linear-gradient"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Product cards grid should wrap properly */
  [style*="gridTemplateColumns"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  /* Ensure rank badges print with color */
  [style*="position: absolute"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Print revenue banners with gradient */
  [style*="background: linear-gradient(135deg, #10b981, #059669)"] {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Progress bars */
  [style*="background: linear-gradient(90deg"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
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
  
  .oa-product-item {
    break-inside: avoid;
  }
  
  .oa-customer-avatar {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .oa-order-row {
    break-inside: avoid;
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

// ─── Monthly Report Component ──────────────────────────────────────────────────
const MonthlyReport = ({ orders, selectedMonth, fmt, allShops }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
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

  // Initialize ordersByShop with ALL registered shops
  const ordersByShop = {};
  
  // Debug: Log to check if allShops data is coming
  console.log('🏪 All Shops Data:', allShops);
  console.log('📊 Total Shops Available:', allShops?.length || 0);
  
  // First, add all registered shops with zero values
  (allShops || []).forEach(shop => {
    if (shop && shop._id) {
      ordersByShop[shop._id] = {
        shopId: shop._id,
        shopName: shop.shopName || shop.name || shop.location || 'Unknown Shop',
        orders: [],
        totalOrders: 0,
        totalRevenue: 0,
        totalItems: 0,
        productsSold: {}, // Track unique products
      };
    }
  });
  
  console.log('✅ Initialized Shops:', Object.keys(ordersByShop).length);
  
  // Then populate with actual order data
  orders.forEach(order => {
    const products = order.products || [];
    products.forEach(item => {
      const shopId = item.shopId || 'unknown';
      const shopName = item.shopName || item.shopDisplayName || 'Unknown Shop';
      
      // If shop doesn't exist in our list (shouldn't happen), add it
      if (!ordersByShop[shopId]) {
        ordersByShop[shopId] = {
          shopId,
          shopName,
          orders: [],
          totalOrders: 0,
          totalRevenue: 0,
          totalItems: 0,
          productsSold: {}, // Track unique products
        };
      }
      
      // Track products sold
      const productKey = item.productId || item.productTitle || 'unknown';
      if (!ordersByShop[shopId].productsSold[productKey]) {
        ordersByShop[shopId].productsSold[productKey] = {
          name: item.productTitle || 'Unknown Product',
          image: item.image,
          totalQuantity: 0,
          totalRevenue: 0,
          unitPrice: item.price || 0,
          timesOrdered: 0,
        };
      }
      
      ordersByShop[shopId].productsSold[productKey].totalQuantity += item.quantity || 1;
      ordersByShop[shopId].productsSold[productKey].totalRevenue += (item.price || 0) * (item.quantity || 1);
      ordersByShop[shopId].productsSold[productKey].timesOrdered++;
      
      // Check if order already added
      const existingOrder = ordersByShop[shopId].orders.find(o => o._id === order._id);
      if (!existingOrder) {
        ordersByShop[shopId].orders.push({
          ...order,
          shopProducts: [item],
          shopTotal: (item.price || 0) * (item.quantity || 1),
        });
        ordersByShop[shopId].totalOrders++;
      } else {
        existingOrder.shopProducts.push(item);
        existingOrder.shopTotal += (item.price || 0) * (item.quantity || 1);
      }
      
      ordersByShop[shopId].totalRevenue += (item.price || 0) * (item.quantity || 1);
      ordersByShop[shopId].totalItems += item.quantity || 1;
    });
  });

  // Convert to array and sort: shops with orders first (by revenue), then shops without orders (alphabetically)
  const shopsArray = Object.values(ordersByShop).sort((a, b) => {
    // If both have orders, sort by revenue (descending)
    if (a.totalOrders > 0 && b.totalOrders > 0) {
      return b.totalRevenue - a.totalRevenue;
    }
    // If only a has orders, a comes first
    if (a.totalOrders > 0) return -1;
    // If only b has orders, b comes first
    if (b.totalOrders > 0) return 1;
    // If neither has orders, sort alphabetically by shop name
    return a.shopName.localeCompare(b.shopName);
  });

  // Calculate month totals (only count shops with orders for active shops)
  const shopsWithOrders = shopsArray.filter(shop => shop.totalOrders > 0);
  const monthTotals = {
    totalOrders: orders.length,
    totalShops: allShops?.length || shopsArray.length, // Total registered shops
    activeShops: shopsWithOrders.length, // Shops that received orders
    totalRevenue: shopsWithOrders.reduce((sum, shop) => sum + shop.totalRevenue, 0),
    totalItems: shopsWithOrders.reduce((sum, shop) => sum + shop.totalItems, 0),
    totalUniqueProducts: shopsWithOrders.reduce((sum, shop) => sum + Object.keys(shop.productsSold).length, 0),
  };

  if (orders.length === 0) {
    return (
      <div className="oa-empty">
        <div className="oa-empty-icon">📅</div>
        <h3 className="oa-empty-title">No Orders This Month</h3>
        <p className="oa-empty-text">
          No orders found for {getMonthName(selectedMonth)}. Try selecting a different month.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Monthly Header */}
      <div className="oa-monthly-header">
        <h2 className="oa-monthly-title">
          📅 Monthly Report - {getMonthName(selectedMonth)}
        </h2>
        <p className="oa-monthly-subtitle">
          Complete shop-wise breakdown with product analysis
        </p>
      </div>

      {/* Month Summary */}
      <div className="oa-month-summary">
        <div className="oa-month-summary-title">📊 Month at a Glance</div>
        <div className="oa-month-stats-grid">
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{monthTotals.totalOrders}</div>
            <div className="oa-month-stat-label">Total Orders</div>
          </div>
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{monthTotals.totalShops}</div>
            <div className="oa-month-stat-label">Total Shops</div>
          </div>
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{monthTotals.activeShops}</div>
            <div className="oa-month-stat-label">Active Shops</div>
          </div>
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{fmt(monthTotals.totalRevenue)}</div>
            <div className="oa-month-stat-label">Total Revenue</div>
          </div>
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{monthTotals.totalItems}</div>
            <div className="oa-month-stat-label">Items Sold</div>
          </div>
          <div className="oa-month-stat">
            <div className="oa-month-stat-value">{monthTotals.totalUniqueProducts}</div>
            <div className="oa-month-stat-label">Unique Products</div>
          </div>
        </div>
      </div>

      {/* ALL SHOPS OVERVIEW - Quick Summary Table */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '20px 24px',
          borderBottom: '2px solid #5b21b6'
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 24 }}>🏪</span>
            <span>All Shops Overview - Quick Summary</span>
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500
          }}>
            Complete list of all shops with their sales performance
          </div>
        </div>

        {/* Shops Grid/Table */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16
          }}>
            {shopsArray.map((shop, idx) => {
              const hasOrders = shop.totalOrders > 0;
              const productCount = Object.keys(shop.productsSold).length;
              
              return (
                <div key={shop.shopId} style={{
                  background: hasOrders 
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: hasOrders ? '2px solid #86efac' : '2px solid #fca5a5',
                  borderRadius: 12,
                  padding: 16,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  {/* Shop Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: hasOrders 
                      ? (idx < 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#10b981')
                      : '#ef4444',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 900,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {hasOrders ? `#${idx + 1}` : '✕'}
                  </div>

                  {/* Shop Icon & Name */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 12,
                    paddingRight: 50
                  }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: hasOrders 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {hasOrders ? '🏪' : '🔒'}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: '#111827',
                        marginBottom: 4,
                        lineHeight: 1.3,
                        wordWrap: 'break-word'
                      }}>
                        {shop.shopName}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: '#6b7280',
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}>
                        ID: {shop.shopId.slice(0, 12)}...
                      </div>
                    </div>
                  </div>

                  {/* Shop Stats */}
                  {hasOrders ? (
                    <>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                        marginBottom: 10
                      }}>
                        <div style={{
                          background: '#fff',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #d1fae5'
                        }}>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#059669',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 3
                          }}>
                            📦 Products
                          </div>
                          <div style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#065f46'
                          }}>
                            {productCount}
                          </div>
                        </div>

                        <div style={{
                          background: '#fff',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #d1fae5'
                        }}>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#059669',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 3
                          }}>
                            📊 Units
                          </div>
                          <div style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#065f46'
                          }}>
                            {shop.totalItems}
                          </div>
                        </div>

                        <div style={{
                          background: '#fff',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #d1fae5'
                        }}>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#059669',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 3
                          }}>
                            🛒 Orders
                          </div>
                          <div style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#065f46'
                          }}>
                            {shop.totalOrders}
                          </div>
                        </div>

                        <div style={{
                          background: '#fff',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #d1fae5'
                        }}>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#059669',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 3
                          }}>
                            💰 Revenue
                          </div>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: '#065f46'
                          }}>
                            {fmt(shop.totalRevenue)}
                          </div>
                        </div>
                      </div>

                      {/* Top 3 Products Quick Preview */}
                      {productCount > 0 && (
                        <div style={{
                          background: '#fff',
                          padding: '10px',
                          borderRadius: 8,
                          border: '1px solid #d1fae5'
                        }}>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#059669',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 6
                          }}>
                            🌟 Top Products
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: '#065f46',
                            lineHeight: 1.5,
                            fontWeight: 600
                          }}>
                            {Object.values(shop.productsSold)
                              .sort((a, b) => b.totalRevenue - a.totalRevenue)
                              .slice(0, 3)
                              .map((p, i) => (
                                <div key={i} style={{ marginBottom: 3 }}>
                                  {i + 1}. {p.name.slice(0, 25)}{p.name.length > 25 ? '...' : ''} ({p.totalQuantity} units)
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // No Sales Shop
                    <div style={{
                      background: '#fff',
                      padding: '20px',
                      borderRadius: 8,
                      border: '1px solid #fca5a5',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#dc2626',
                        marginBottom: 4
                      }}>
                        No Sales This Month
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#991b1b'
                      }}>
                        0 products • 0 orders • ₹0
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div style={{
          background: '#f9fafb',
          padding: '16px 24px',
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#374151'
          }}>
            ✅ Showing all {shopsArray.length} shops • {monthTotals.activeShops} active • {shopsArray.length - monthTotals.activeShops} inactive
          </div>
          <div style={{
            fontSize: 14,
            fontWeight: 900,
            color: '#059669',
            background: '#d1fae5',
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid #a7f3d0'
          }}>
            Total: {fmt(monthTotals.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Shop-wise breakdown */}
      {shopsArray.map((shop, shopIndex) => {
        // Get top selling products
        const productsArray = Object.values(shop.productsSold).sort((a, b) => b.totalRevenue - a.totalRevenue);
        const hasOrders = shop.totalOrders > 0;
        
        return (
          <div key={shop.shopId} className="oa-shop-section">
            {/* Shop Header */}
            <div className="oa-shop-header">
              <div className="oa-shop-name-group">
                <h3 className="oa-shop-main-name">
                  {hasOrders ? '🏪' : '🔒'} {shop.shopName}
                  {!hasOrders && (
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#fee2e2',
                      color: '#991b1b',
                      padding: '4px 10px',
                      borderRadius: 20,
                      marginLeft: 8
                    }}>
                      No Sales
                    </span>
                  )}
                </h3>
                <div className="oa-shop-stats-inline">
                  <div className="oa-shop-stat-item">
                    <span>📦</span>
                    <span><strong>{shop.totalOrders}</strong> orders</span>
                  </div>
                  <div className="oa-shop-stat-item">
                    <span>📊</span>
                    <span><strong>{shop.totalItems}</strong> items sold</span>
                  </div>
                  <div className="oa-shop-stat-item">
                    <span>🛍️</span>
                    <span><strong>{productsArray.length}</strong> unique products</span>
                  </div>
                  <div className="oa-shop-stat-item">
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>ID: {shop.shopId}</span>
                  </div>
                </div>
              </div>
              <div className="oa-shop-total-badge" style={{
                background: hasOrders ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af'
              }}>
                {fmt(shop.totalRevenue)}
              </div>
            </div>

            {/* Show message for shops with no orders */}
            {!hasOrders ? (
              <div style={{
                padding: '40px 24px',
                textAlign: 'center',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  No orders this month
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  This shop hasn't received any orders in the selected period.
                </div>
              </div>
            ) : (
              <>
                {/* COMPLETE Product Sales Cards - Professional Display */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #f9fafb 0%, #fff 100%)', 
                  padding: '24px',
                  borderBottom: '2px solid #e5e7eb' 
                }}>
                  {/* Section Header */}
                  <div style={{ 
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 800, 
                      color: '#111827',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <span style={{ 
                        fontSize: 24,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>📦</span>
                      <span>Complete Product Sales Breakdown</span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 12,
                      marginTop: 12
                    }}>
                      <div style={{
                        background: '#eff6ff',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #dbeafe',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#1e40af' }}>
                          {productsArray.length}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Total Products
                        </div>
                      </div>
                      <div style={{
                        background: '#f0fdf4',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #dcfce7',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#166534' }}>
                          {shop.totalItems}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Units Sold
                        </div>
                      </div>
                      <div style={{
                        background: '#fef3c7',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #fde68a',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#92400e' }}>
                          {shop.totalOrders}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Total Orders
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ALL Products Grid - Professional Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 16
                  }}>
                    {productsArray.map((product, idx) => (
                      <div key={idx} style={{
                        background: '#fff',
                        border: '2px solid #e5e7eb',
                        borderRadius: 14,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Rank Badge */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: idx < 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#e5e7eb',
                          color: idx < 3 ? '#fff' : '#6b7280',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 900,
                          boxShadow: idx < 3 ? '0 4px 12px rgba(251, 191, 36, 0.4)' : 'none'
                        }}>
                          #{idx + 1}
                        </div>

                        {/* Product Image & Name */}
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 12,
                                objectFit: 'cover',
                                border: '2px solid #f3f4f6',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 80,
                              height: 80,
                              borderRadius: 12,
                              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 32,
                              flexShrink: 0,
                              border: '2px solid #e5e7eb'
                            }}>📦</div>
                          )}
                          
                          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                            <div style={{ 
                              fontSize: 15, 
                              fontWeight: 800, 
                              color: '#111827',
                              marginBottom: 6,
                              lineHeight: 1.3,
                              wordWrap: 'break-word'
                            }}>
                              {product.name}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: '#9ca3af',
                              fontWeight: 600
                            }}>
                              Unit Price: {fmt(product.unitPrice)}
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{
                          height: 1,
                          background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)'
                        }} />

                        {/* Stats Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 10
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1px solid #bfdbfe'
                          }}>
                            <div style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#3b82f6',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 4
                            }}>
                              📊 Quantity
                            </div>
                            <div style={{
                              fontSize: 22,
                              fontWeight: 900,
                              color: '#1e40af',
                              lineHeight: 1
                            }}>
                              {product.totalQuantity}
                            </div>
                            <div style={{
                              fontSize: 9,
                              color: '#60a5fa',
                              marginTop: 2,
                              fontWeight: 600
                            }}>
                              units sold
                            </div>
                          </div>

                          <div style={{
                            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1px solid #bbf7d0'
                          }}>
                            <div style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#22c55e',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              marginBottom: 4
                            }}>
                              🛒 Orders
                            </div>
                            <div style={{
                              fontSize: 22,
                              fontWeight: 900,
                              color: '#166534',
                              lineHeight: 1
                            }}>
                              {product.timesOrdered}
                            </div>
                            <div style={{
                              fontSize: 9,
                              color: '#4ade80',
                              marginTop: 2,
                              fontWeight: 600
                            }}>
                              times ordered
                            </div>
                          </div>
                        </div>

                        {/* Revenue Banner */}
                        <div style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          padding: '12px',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                        }}>
                          <div style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.9)',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            💰 Total Revenue
                          </div>
                          <div style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#fff',
                            letterSpacing: -0.5
                          }}>
                            {fmt(product.totalRevenue)}
                          </div>
                        </div>

                        {/* Performance Indicator */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          paddingTop: 4
                        }}>
                          <div style={{
                            flex: 1,
                            height: 6,
                            background: '#f3f4f6',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: idx < 3 
                                ? 'linear-gradient(90deg, #10b981, #059669)' 
                                : idx < 10
                                ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                : 'linear-gradient(90deg, #94a3b8, #64748b)',
                              width: `${Math.min((product.totalRevenue / productsArray[0].totalRevenue) * 100, 100)}%`,
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#6b7280'
                          }}>
                            {Math.round((product.totalRevenue / shop.totalRevenue) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div style={{
                    marginTop: 20,
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                        All {productsArray.length} products displayed • {shop.totalItems} total units • {shop.totalOrders} orders
                      </span>
                    </div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#059669',
                      padding: '6px 14px',
                      background: '#d1fae5',
                      borderRadius: 8,
                      border: '1px solid #a7f3d0'
                    }}>
                      Shop Total: {fmt(shop.totalRevenue)}
                    </div>
                  </div>
                </div>

            {/* Orders List */}
            <div className="oa-shop-orders-list">
              <div style={{
                padding: '16px 24px',
                background: '#fafbfc',
                borderBottom: '1px solid #e5e7eb',
                fontSize: 12,
                fontWeight: 700,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                📋 Order Details ({shop.totalOrders} orders)
              </div>

              {shop.orders.map((order, orderIndex) => {
                const statusStyle = getStatusStyle(order.order_status);
                
                return (
                  <div key={order._id} className="oa-shop-order-item">
                    {/* Order header */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 12,
                      flexWrap: 'wrap',
                      gap: 12 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          Order #{orderIndex + 1}
                        </span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          📅 {formatDate(order.createdAt)}
                        </span>
                        <div 
                          className="oa-badge" 
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.text}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                        {fmt(order.shopTotal)}
                      </div>
                    </div>

                    {/* Customer info */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 16,
                      marginBottom: 16,
                      padding: 16,
                      background: '#f9fafb',
                      borderRadius: 10
                    }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>
                          👤 CUSTOMER
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                          {order.userId?.name || 'Guest'}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {order.userId?.email || order.userId?.phone || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>
                          💳 PAYMENT
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                          {order.paymentId ? '💰 Online Paid' : '💵 COD'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>
                          🆔 ORDER ID
                        </div>
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 600, 
                          color: '#6b7280',
                          fontFamily: 'Courier New, monospace',
                          wordBreak: 'break-all'
                        }}>
                          {order._id}
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <div style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5 
                      }}>
                        📦 Products ({order.shopProducts.length})
                      </div>
                      {order.shopProducts.map((item, itemIndex) => {
                        const itemTotal = (item.price || 0) * (item.quantity || 1);
                        return (
                          <div key={itemIndex} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 10,
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8
                          }}>
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.productTitle}
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 8,
                                  objectFit: 'cover',
                                  border: '1px solid #e5e7eb',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                background: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                flexShrink: 0
                              }}>📦</div>
                            )}
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: 13, 
                                fontWeight: 600, 
                                color: '#111827',
                                marginBottom: 4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.productTitle || 'Unknown Product'}
                              </div>
                              <div style={{ 
                                fontSize: 11, 
                                color: '#6b7280',
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap'
                              }}>
                                <span>Qty: {item.quantity || 1}</span>
                                <span>•</span>
                                <span>Unit: {fmt(item.price)}</span>
                                {item.size && <><span>•</span><span>Size: {item.size}</span></>}
                                {item.color && <><span>•</span><span>Color: {item.color}</span></>}
                              </div>
                            </div>
                            
                            <div style={{ 
                              fontSize: 14, 
                              fontWeight: 800, 
                              color: '#059669',
                              whiteSpace: 'nowrap'
                            }}>
                              {fmt(itemTotal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
            )}
          </div>
        );
      })}

      {/* Monthly Report Footer (will be handled by parent print footer) */}
    </>
  );
};

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
  const [allShops, setAllShops] = useState([]); // Store all registered shops
  
  // View Mode: weekly (default) or monthly
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
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

  // Fetch ALL shops with pagination handling
  const fetchAllShops = async () => {
    let allShops = [];
    let page = 1;
    let hasMore = true;
    
    console.log('🔄 Fetching all shops with pagination...');
    
    while (hasMore && page <= 10) { // Safety limit of 10 pages
      try {
        const response = await fetchDataFromApi(`/api/go-market/grocery-shops?page=${page}&limit=100`);
        console.log(`📄 Page ${page} response:`, response);
        
        // Handle different response structures
        let shops = [];
        if (Array.isArray(response?.data)) {
          shops = response.data;
        } else if (Array.isArray(response?.shops)) {
          shops = response.shops;
        } else if (Array.isArray(response?.results)) {
          shops = response.results;
        } else if (Array.isArray(response)) {
          shops = response;
        }
        
        console.log(`📦 Page ${page} extracted shops:`, shops.length);
        
        if (shops.length > 0) {
          allShops = [...allShops, ...shops];
          console.log(`✅ Page ${page}: ${shops.length} shops (Total so far: ${allShops.length})`);
          
          // Check if there are more pages
          const totalPages = response?.totalPages || response?.pages || 0;
          const hasNextPage = response?.hasNextPage;
          
          // Continue if:
          // 1. We got a full page (100 items)
          // 2. OR API explicitly says there's a next page
          // 3. OR current page < totalPages
          hasMore = (shops.length === 100) || hasNextPage || (totalPages > 0 && page < totalPages);
          page++;
          
          console.log(`🔍 hasMore: ${hasMore}, totalPages: ${totalPages}, hasNextPage: ${hasNextPage}`);
        } else {
          console.log('⏹️ No more shops on this page');
          hasMore = false;
        }
      } catch (err) {
        console.error(`❌ Error fetching page ${page}:`, err);
        hasMore = false;
      }
    }
    
    console.log(`✅ FINAL: Total shops fetched: ${allShops.length}`);
    if (allShops.length > 0) {
      console.log(`🏪 First shop:`, allShops[0]);
      console.log(`🏪 Last shop:`, allShops[allShops.length - 1]);
    }
    return allShops;
  };

  // Fetch orders and all shops
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      console.log('🔄 Starting data fetch...');
      
      // Fetch orders
      const ordersResponse = await fetchDataFromApi('/api/order/order-list?page=1&limit=10000');
      const allOrders = ordersResponse?.data || ordersResponse?.orders || [];
      console.log('✅ Orders fetched:', allOrders.length);
      
      // DEBUG: Log first order to see structure
      if (allOrders.length > 0) {
        console.log('🔍 FIRST ORDER STRUCTURE:', allOrders[0]);
        console.log('🔍 FIRST ORDER PRODUCTS:', allOrders[0].products);
        if (allOrders[0].products && allOrders[0].products.length > 0) {
          console.log('🔍 FIRST PRODUCT:', allOrders[0].products[0]);
          console.log('🔍 Product shopId:', allOrders[0].products[0].shopId);
          console.log('🔍 Product shopName:', allOrders[0].products[0].shopName);
          console.log('🔍 Product shop-related keys:', Object.keys(allOrders[0].products[0]).filter(k => k.toLowerCase().includes('shop')));
        }
      }
      
      // PRIMARY: Extract ALL unique shops from orders
      console.log('📦 Extracting shops from order data...');
      const shopsFromOrders = {};
      let totalProductsProcessed = 0;
      
      allOrders.forEach((order, orderIdx) => {
        const products = order.products || [];
        products.forEach((item, itemIdx) => {
          totalProductsProcessed++;
          
          // Try to find shop ID from multiple possible fields
          const shopId = item.shopId || item.shop_id || item.shop?._id || item.shop;
          
          // Try to find shop name from multiple possible fields
          const shopName = item.shopName || 
                          item.shopDisplayName || 
                          item.shop_name || 
                          item.shop?.name || 
                          item.shop?.shopName ||
                          item.shop?.location ||
                          'Unknown Shop';
          
          if (shopId) {
            if (!shopsFromOrders[shopId]) {
              shopsFromOrders[shopId] = {
                _id: shopId,
                shopName: shopName,
                location: item.shopLocation || item.shop?.location || '',
                fromOrders: true,
                firstSeenInOrder: order._id,
                productCount: 0,
                orderCount: 0,
                orders: new Set()
              };
              console.log(`🆕 Shop #${Object.keys(shopsFromOrders).length}: "${shopName}" (ID: ${shopId})`);
            }
            shopsFromOrders[shopId].productCount++;
            shopsFromOrders[shopId].orders.add(order._id);
            shopsFromOrders[shopId].orderCount = shopsFromOrders[shopId].orders.size;
          } else {
            // Log products with no shop ID
            if (orderIdx < 3 && itemIdx < 2) { // Only log first few for debugging
              console.warn(`⚠️ Product without shopId in order ${order._id}:`, {
                productTitle: item.productTitle || item.name,
                availableFields: Object.keys(item)
              });
            }
          }
        });
      });
      
      let allShopsData = Object.values(shopsFromOrders).map(shop => ({
        ...shop,
        orders: undefined // Remove Set object before storing
      }));
      
      console.log(`✅ Extracted ${allShopsData.length} unique shops from ${totalProductsProcessed} products in ${allOrders.length} orders`);
      
      // SECONDARY: Try to fetch from API (to get shops with zero orders)
      try {
        console.log('🔄 Attempting to fetch additional shops from API...');
        const apiShops = await fetchAllShops();
        console.log(`📡 API returned ${apiShops.length} shops`);
        
        if (apiShops.length > 0) {
          // Merge: Add API shops that we don't have from orders
          apiShops.forEach(apiShop => {
            if (apiShop._id && !shopsFromOrders[apiShop._id]) {
              allShopsData.push({
                ...apiShop,
                shopName: apiShop.shopName || apiShop.name || apiShop.location || 'Unknown Shop',
                fromAPI: true,
                hasNoOrders: true
              });
              console.log(`➕ Added zero-order shop from API: ${apiShop.shopName || 'Unknown'}`);
            }
          });
        }
      } catch (apiErr) {
        console.warn('⚠️ API fetch failed, using only shops from orders:', apiErr);
      }
      
      console.log('✅ Final Shops Count:', allShopsData.length);
      
      if (allShopsData.length > 0) {
        console.log('🏪 Sample Shop:', allShopsData[0]);
        console.log('🏪 All Shop Names:', allShopsData.map(s => 
          `${s.shopName || s.name || s.location} (ID: ${s._id})`
        ));
        console.table(allShopsData.map((s, i) => ({
          '#': i + 1,
          'Shop Name': s.shopName || s.name || s.location || 'Unknown',
          'Shop ID': s._id?.substring(0, 8) + '...',
          'Source': s.fromOrders ? '📦 Orders' : '📡 API',
          'Products': s.productCount || 0,
          'Orders': s.orderCount || 0
        })));
      } else {
        console.error('❌ NO SHOPS DATA AVAILABLE!');
        console.error('This means NO orders have any shop data!');
        console.error('Please check order structure in console above');
      }
      
      setOrders(allOrders);
      setFilteredOrders(allOrders);
      setAllShops(allShopsData);
      
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      setOrders([]);
      setFilteredOrders([]);
      setAllShops([]);
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

    // View mode based filtering
    if (viewMode === 'monthly') {
      // Filter by selected month
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        filtered = filtered.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getFullYear() === parseInt(year) && 
                 orderDate.getMonth() === parseInt(month) - 1;
        });
      }
    } else {
      // Weekly view - use date filters
      if (dateFrom) {
        filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(dateTo + 'T23:59:59'));
      }
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
  }, [orders, dateFrom, dateTo, statusFilter, shopFilter, viewMode, selectedMonth]);

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

    // Initialize shop stats with ALL registered shops
    const shopStats = {};
    
    // First, add all registered shops with zero values
    allShops.forEach(shop => {
      shopStats[shop._id] = {
        shopId: shop._id,
        shopName: shop.shopName || shop.location || 'Unknown Shop',
        totalOrders: 0,
        totalRevenue: 0,
        totalItems: 0,
        orders: [],
      };
    });

    // Then, populate with actual order data
    filteredOrders.forEach(order => {
      const items = order.products || [];
      items.forEach(item => {
        const shopId = item.shopId || 'Unknown';
        const shopName = item.shopName || item.shopDisplayName || 'Unknown Shop';
        
        // If shop doesn't exist in our list (shouldn't happen), add it
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

    // Convert to array and sort: shops with orders first (by revenue), then shops without orders (alphabetically)
    const shopArray = Object.values(shopStats).sort((a, b) => {
      // If both have orders, sort by revenue (descending)
      if (a.totalOrders > 0 && b.totalOrders > 0) {
        return b.totalRevenue - a.totalRevenue;
      }
      // If only a has orders, a comes first
      if (a.totalOrders > 0) return -1;
      // If only b has orders, b comes first
      if (b.totalOrders > 0) return 1;
      // If neither has orders, sort alphabetically by shop name
      return a.shopName.localeCompare(b.shopName);
    });

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
  }, [filteredOrders, allShops]);

  // Format currency
  const fmt = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Export shop-wise data as CSV
  const exportShopWiseData = () => {
    if (filteredOrders.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV data
    const csvRows = [];
    
    // Header
    csvRows.push([
      'Shop ID',
      'Shop Name',
      'Order ID',
      'Order Date',
      'Customer Name',
      'Customer Contact',
      'Order Status',
      'Payment Method',
      'Product Name',
      'Product Quantity',
      'Product Price',
      'Product Total',
      'Order Total',
    ].join(','));

    // Data rows
    filteredOrders.forEach(order => {
      const products = order.products || [];
      const customerName = order.userId?.name || 'Guest';
      const customerContact = order.userId?.email || order.userId?.phone || '-';
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '-';
      const orderStatus = order.order_status || '-';
      const paymentMethod = order.paymentId ? 'Online' : 'COD';
      const orderTotal = order.totalAmt || 0;

      products.forEach(item => {
        const shopId = item.shopId || 'Unknown';
        const shopName = (item.shopName || item.shopDisplayName || 'Unknown Shop').replace(/,/g, ';');
        const productName = (item.productTitle || 'Unknown Product').replace(/,/g, ';');
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const productTotal = price * quantity;

        csvRows.push([
          shopId,
          shopName,
          order._id,
          orderDate,
          customerName.replace(/,/g, ';'),
          customerContact,
          orderStatus,
          paymentMethod,
          productName,
          quantity,
          price,
          productTotal,
          orderTotal,
        ].join(','));
      });
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = viewMode === 'monthly' 
      ? `shopwise_orders_${selectedMonth}.csv`
      : `shopwise_orders_${dateFrom}_to_${dateTo}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export shop summary as CSV
  const exportShopSummary = () => {
    if (analytics.shopStats.length === 0) {
      alert('No shop data to export');
      return;
    }

    // Prepare CSV data
    const csvRows = [];
    
    // Header
    csvRows.push([
      'Sr. No.',
      'Shop ID',
      'Shop Name',
      'Total Orders',
      'Total Items Sold',
      'Total Revenue',
      'Average Order Value',
    ].join(','));

    // Data rows
    analytics.shopStats.forEach((shop, index) => {
      csvRows.push([
        index + 1,
        shop.shopId,
        (shop.shopName || 'Unknown Shop').replace(/,/g, ';'),
        shop.totalOrders,
        shop.totalItems,
        shop.totalRevenue,
        (shop.totalRevenue / shop.totalOrders).toFixed(2),
      ].join(','));
    });

    // Add totals row
    csvRows.push([
      '',
      '',
      'TOTAL',
      analytics.totalOrders,
      analytics.shopStats.reduce((sum, s) => sum + s.totalItems, 0),
      analytics.totalRevenue,
      (analytics.totalRevenue / analytics.totalOrders).toFixed(2),
    ].join(','));

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = viewMode === 'monthly' 
      ? `shop_summary_${selectedMonth}.csv`
      : `shop_summary_${dateFrom}_to_${dateTo}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    Weekly • Monthly reports • Shop-wise breakdown • Print-ready reports
                  </p>
                </div>
                <div className="oa-actions">
                  {/* View Mode Toggle */}
                  <div className="oa-view-toggle">
                    <button
                      className={`oa-view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                      onClick={() => setViewMode('weekly')}
                    >
                      📅 Weekly
                    </button>
                    <button
                      className={`oa-view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
                      onClick={() => setViewMode('monthly')}
                    >
                      📆 Monthly
                    </button>
                  </div>

                  <button
                    className="oa-btn oa-btn-secondary"
                    onClick={() => navigate('/orders')}
                  >
                    ← Back
                  </button>
                  <button
                    className="oa-btn oa-btn-secondary"
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                  >
                    <span className={refreshing ? 'spinning' : ''}>🔄</span>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  
                  {/* Export Buttons Dropdown */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      className="oa-btn oa-btn-secondary"
                      onClick={(e) => {
                        const menu = e.currentTarget.nextElementSibling;
                        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      📊 Export Data ▼
                    </button>
                    <div
                      style={{
                        display: 'none',
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '4px',
                        background: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: '220px',
                        zIndex: 1000,
                        overflow: 'hidden',
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    >
                      <button
                        onClick={() => {
                          exportShopSummary();
                          document.querySelectorAll('[style*="display: block"]').forEach(el => {
                            if (el.style.position === 'absolute') el.style.display = 'none';
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '18px' }}>📋</span>
                        <div>
                          <div>Shop Summary</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
                            Revenue & totals per shop
                          </div>
                        </div>
                      </button>
                      <div style={{ height: '1px', background: '#f3f4f6', margin: '0 8px' }} />
                      <button
                        onClick={() => {
                          exportShopWiseData();
                          document.querySelectorAll('[style*="display: block"]').forEach(el => {
                            if (el.style.position === 'absolute') el.style.display = 'none';
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '18px' }}>📦</span>
                        <div>
                          <div>Detailed Orders</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>
                            All orders with products
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    className="oa-btn oa-btn-print"
                    onClick={handlePrint}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="oa-filters">
                {viewMode === 'monthly' ? (
                  // Monthly View - Month Selector
                  <div className="oa-filter-group">
                    <label className="oa-filter-label">Select Month</label>
                    <input
                      type="month"
                      className="oa-filter-input"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      max={getTodayDate().slice(0, 7)}
                    />
                  </div>
                ) : (
                  // Weekly View - Date Range
                  <>
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
                  </>
                )}
                
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
                {(statusFilter !== 'all' || shopFilter !== 'all' || 
                  (viewMode === 'weekly' && (dateFrom !== getLastWeekDate() || dateTo !== getTodayDate()))) && (
                  <div className="oa-filter-group" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="oa-btn oa-btn-secondary"
                      style={{ marginTop: 'auto' }}
                      onClick={() => {
                        if (viewMode === 'weekly') {
                          setDateFrom(getLastWeekDate());
                          setDateTo(getTodayDate());
                        }
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
                <h1 className="oa-print-title">
                  {viewMode === 'monthly' ? '📆 Monthly Order Analytics Report' : '📅 Weekly Order Analytics Report'}
                </h1>
                <p className="oa-print-meta">
                  <strong>Generated:</strong> {new Date().toLocaleString('en-IN')} | 
                  <strong> Period:</strong> {viewMode === 'monthly' 
                    ? `${new Date(selectedMonth + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`
                    : `${dateFrom ? new Date(dateFrom).toLocaleDateString('en-IN') : 'All time'} to ${dateTo ? new Date(dateTo).toLocaleDateString('en-IN') : 'Present'}`
                  } | 
                  <strong> Orders:</strong> {analytics.totalOrders} | 
                  <strong> Revenue:</strong> {fmt(analytics.totalRevenue)} | 
                  <strong> Shops:</strong> {analytics.shopStats.length}
                  {statusFilter !== 'all' && ` | Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                  {shopFilter !== 'all' && ` | Shop: ${uniqueShops.find(([id]) => id === shopFilter)?.[1] || 'Unknown'}`}
                </p>
              </div>

              {/* Conditional Rendering based on View Mode */}
              {viewMode === 'monthly' ? (
                // Monthly Report View
                <MonthlyReport 
                  orders={filteredOrders} 
                  selectedMonth={selectedMonth}
                  fmt={fmt}
                  allShops={allShops}
                />
              ) : (
                // Weekly/Default View
                <>
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
              ) : null}
              </>
              )}

              {/* Empty State - only if no orders in current view */}
              {filteredOrders.length === 0 && (
                <div className="oa-empty">
                  <div className="oa-empty-icon">📦</div>
                  <h3 className="oa-empty-title">No Data Available</h3>
                  <p className="oa-empty-text">
                    No orders found matching your filter criteria. Try adjusting the filters or {viewMode === 'monthly' ? 'selecting a different month' : 'date range'}.
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
