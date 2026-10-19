/* ─────────────────────────────────────────────────────────
   Order Analytics – colourful, animated, small-font
   Usage: import { STYLES } from "./OrderAnalyticsStyles";
   then:  <style>{STYLES}</style>
───────────────────────────────────────────────────────── */
export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.oa2{
  --ink:#1e1b4b; --muted:#6b7280; --soft:#9ca3af; --line:#e8eaf8;
  --indigo:#6366f1; --pink:#ec4899; --sky:#0ea5e9; --emerald:#10b981; --amber:#f59e0b; --violet:#8b5cf6; --rose:#f43f5e;
  font-family:'DM Sans',system-ui,-apple-system,sans-serif; font-size:12px; color:var(--ink);
  padding:20px; min-height:100vh;
  background:
    radial-gradient(900px 420px at 0% 0%,#e0e7ff 0%,transparent 60%),
    radial-gradient(800px 400px at 100% 10%,#fce7f3 0%,transparent 60%),
    radial-gradient(800px 500px at 50% 100%,#ffedd5 0%,transparent 60%),
    #f8f7ff;
}
.oa2 *,.oa2 *::before,.oa2 *::after{box-sizing:border-box}
.oa2 button,.oa2 input,.oa2 select{font-family:inherit}
.oa2-shell{max-width:1500px;margin:0 auto}

/* ── keyframes ── */
@keyframes oaFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes oaPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes oaGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes oaShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes oaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes oaPanel{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@keyframes oaRow{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes oaSpin{to{transform:rotate(360deg)}}

/* ── Header ── */
.oa2-header{
  position:relative;overflow:hidden;color:#fff;border-radius:20px;padding:22px 24px;margin-bottom:14px;
  display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;
  background:linear-gradient(120deg,#4f46e5,#8b5cf6,#ec4899,#f97316);background-size:300% 300%;
  animation:oaGrad 14s ease infinite,oaFadeUp .5s cubic-bezier(.2,.8,.2,1) both;
  box-shadow:0 12px 32px rgba(99,102,241,.3);
}
.oa2-header::before{content:"";position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.13);top:-90px;right:-50px;animation:oaFloat 6s ease-in-out infinite}
.oa2-header::after{content:"";position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.09);bottom:-50px;left:35%;animation:oaFloat 7s ease-in-out infinite reverse}
.oa2-header>*{position:relative;z-index:1}
.oa2-header h1{margin:0;font-family:'Sora',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.02em}
.oa2-header p{margin:5px 0 0;color:rgba(255,255,255,.85);font-size:11.5px;font-weight:500}
.oa2-actions{display:flex;gap:8px;flex-wrap:wrap}

/* ── Buttons ── */
.oa2-button{
  border:1px solid #e0e3f7;background:#fff;color:#4338ca;border-radius:10px;padding:7px 12px;
  font-size:11.5px;font-weight:700;cursor:pointer;
  transition:transform .18s,box-shadow .18s,background .18s,border-color .18s,color .18s;
}
.oa2-button:hover{transform:translateY(-2px);background:#eef2ff;border-color:#a5b4fc;box-shadow:0 8px 16px rgba(99,102,241,.22)}
.oa2-button:active{transform:scale(.97)}
.oa2-button.primary{color:#fff;border-color:transparent;background:linear-gradient(135deg,#6366f1,#ec4899);box-shadow:0 6px 14px rgba(236,72,153,.3)}
.oa2-button.primary:hover{background:linear-gradient(135deg,#4f46e5,#db2777);box-shadow:0 10px 20px rgba(236,72,153,.4)}
.oa2-button:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.oa2-header .oa2-button{background:rgba(255,255,255,.18);color:#fff;border-color:rgba(255,255,255,.35);backdrop-filter:blur(6px)}
.oa2-header .oa2-button:hover{background:#fff;color:#4f46e5}
.oa2-actions .oa2-button:nth-child(1){animation:oaPop .4s .10s both}
.oa2-actions .oa2-button:nth-child(2){animation:oaPop .4s .17s both}
.oa2-actions .oa2-button:nth-child(3){animation:oaPop .4s .24s both}
.oa2-actions .oa2-button:nth-child(4){animation:oaPop .4s .31s both}

/* ── Filters ── */
.oa2-filter{
  background:rgba(255,255,255,.92);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px;
  box-shadow:0 6px 24px rgba(99,102,241,.08);animation:oaFadeUp .5s .08s cubic-bezier(.2,.8,.2,1) both;
}
.oa2-fields{display:grid;grid-template-columns:1.2fr repeat(6,minmax(105px,1fr)) auto;gap:9px;align-items:end}
.oa2-field label{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.07em;color:#6366f1;font-weight:700;margin:0 0 4px}
.oa2-field:nth-child(3n+2) label{color:#ec4899}
.oa2-field:nth-child(3n+3) label{color:#0ea5e9}
.oa2-field input,.oa2-field select{
  width:100%;height:36px;padding:0 10px;border:1.5px solid #e5e7fb;border-radius:10px;background:#fafaff;color:#312e81;font-size:11.5px;font-weight:500;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.oa2-field input:hover,.oa2-field select:hover{border-color:#c7d2fe}
.oa2-field input:focus,.oa2-field select:focus{outline:none;border-color:#8b5cf6;background:#fff;box-shadow:0 0 0 3px rgba(139,92,246,.18)}
.oa2-filter-actions{display:flex;gap:7px;align-items:end}
.oa2-period-note{font-size:10.5px;color:var(--muted);margin:10px 2px 0}

/* ── Alerts ── */
.oa2-error,.oa2-warning{border-radius:12px;padding:11px 14px;margin:10px 0;font-size:12px;animation:oaFadeUp .35s both}
.oa2-error{background:linear-gradient(90deg,#fff1f2,#fff);color:#be123c;border:1px solid #fecdd3;border-left:4px solid #f43f5e}
.oa2-warning{background:linear-gradient(90deg,#fffbeb,#fff);color:#92400e;border:1px solid #fde68a;border-left:4px solid #f59e0b}
.oa2-error button{margin-left:10px}

/* ── KPIs ── */
.oa2-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px;margin-bottom:14px}
.oa2-kpi{
  --c:#6366f1;position:relative;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:15px;padding:13px 14px;min-width:0;
  box-shadow:0 4px 14px rgba(30,27,75,.05);animation:oaFadeUp .55s cubic-bezier(.2,.8,.2,1) both;
  transition:transform .25s,box-shadow .25s,border-color .25s;
}
.oa2-kpi:nth-child(1){--c:#6366f1}.oa2-kpi:nth-child(2){--c:#10b981;animation-delay:.05s}
.oa2-kpi:nth-child(3){--c:#f59e0b;animation-delay:.10s}.oa2-kpi:nth-child(4){--c:#f43f5e;animation-delay:.15s}
.oa2-kpi:nth-child(5){--c:#ec4899;animation-delay:.20s}.oa2-kpi:nth-child(6){--c:#0ea5e9;animation-delay:.25s}
.oa2-kpi:nth-child(7){--c:#059669;animation-delay:.30s}.oa2-kpi:nth-child(8){--c:#8b5cf6;animation-delay:.35s}
.oa2-kpi:nth-child(9){--c:#f97316;animation-delay:.40s}.oa2-kpi:nth-child(10){--c:#14b8a6;animation-delay:.45s}
.oa2-kpi::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c)}
.oa2-kpi::after{content:"";position:absolute;right:-26px;bottom:-26px;width:80px;height:80px;border-radius:50%;background:var(--c);opacity:.09;transition:transform .45s}
.oa2-kpi:hover{transform:translateY(-4px);border-color:var(--c);box-shadow:0 14px 28px color-mix(in srgb,var(--c) 24%,transparent)}
.oa2-kpi:hover::after{transform:scale(2)}
.oa2-kpi-label{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center;gap:5px}
.oa2-kpi-label span{cursor:help;color:var(--c);opacity:.8}
.oa2-kpi-value{font-family:'Sora',sans-serif;font-size:19px;font-weight:800;letter-spacing:-.02em;margin:8px 0 5px;overflow-wrap:anywhere;color:var(--c)}
.oa2-kpi-compare{font-size:10px;color:#818197;line-height:1.5}
.oa2-trend{font-weight:700;margin-left:6px;padding:1px 7px;border-radius:100px;font-size:9.5px}
.oa2-trend.good{color:#047857;background:#d1fae5}
.oa2-trend.bad{color:#be123c;background:#ffe4e6}

/* ── Cards / charts ── */
.oa2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-bottom:14px}
.oa2-card{
  --c:#6366f1;position:relative;background:rgba(255,255,255,.95);border:1px solid var(--line);border-radius:16px;padding:15px;min-width:0;
  box-shadow:0 6px 22px rgba(99,102,241,.07);animation:oaFadeUp .6s cubic-bezier(.2,.8,.2,1) both;
  transition:transform .25s,box-shadow .25s;
}
.oa2-card::before{content:"";position:absolute;left:16px;right:16px;top:0;height:3px;border-radius:0 0 4px 4px;background:linear-gradient(90deg,var(--c),transparent)}
.oa2-card:hover{box-shadow:0 14px 34px rgba(99,102,241,.14)}
.oa2-grid .oa2-card:nth-child(1){--c:#6366f1}.oa2-grid .oa2-card:nth-child(2){--c:#ec4899;animation-delay:.06s}
.oa2-grid .oa2-card:nth-child(3){--c:#0ea5e9;animation-delay:.12s}.oa2-grid .oa2-card:nth-child(4){--c:#10b981;animation-delay:.18s}
.oa2-grid .oa2-card:nth-child(5){--c:#f59e0b;animation-delay:.24s}.oa2-grid .oa2-card:nth-child(6){--c:#8b5cf6;animation-delay:.30s}
.oa2-card h2{margin:0 0 3px;font-family:'Sora',sans-serif;font-size:13.5px;font-weight:700;letter-spacing:-.01em}
.oa2-card-sub{font-size:10.5px;color:var(--soft);margin:0 0 10px}
.oa2-card-controls{display:flex;gap:5px;margin-left:auto}
.oa2-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.oa2-toolbar input,.oa2-toolbar select{height:34px;border:1.5px solid #e5e7fb;border-radius:10px;padding:0 10px;font-size:11.5px;background:#fafaff;transition:border-color .2s,box-shadow .2s}
.oa2-toolbar input{min-width:190px}
.oa2-toolbar input:focus,.oa2-toolbar select:focus{outline:none;border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.18);background:#fff}
.oa2 .recharts-bar-rectangle,.oa2 .recharts-pie-sector{transition:opacity .2s}
.oa2 .recharts-bar-rectangle:hover,.oa2 .recharts-pie-sector:hover{opacity:.82}

/* ── Tables ── */
.oa2-table-wrap{overflow:auto}
.oa2-table{border-collapse:collapse;width:100%;min-width:850px}
.oa2-table thead tr{background:linear-gradient(90deg,#eef2ff,#fdf2f8,#fff7ed)}
.oa2-table th{text-align:left;color:#4f46e5;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:9px 10px;white-space:nowrap;border-bottom:1px solid #e0e7ff}
.oa2-table td{padding:10px;border-bottom:1px solid #f1f2fb;font-size:11.5px;white-space:nowrap}
.oa2-table tbody tr{animation:oaRow .4s cubic-bezier(.22,1,.36,1) both;transition:background .2s}
.oa2-table tbody tr:nth-child(2){animation-delay:.03s}.oa2-table tbody tr:nth-child(3){animation-delay:.06s}
.oa2-table tbody tr:nth-child(4){animation-delay:.09s}.oa2-table tbody tr:nth-child(5){animation-delay:.12s}
.oa2-table tbody tr:hover{background:linear-gradient(90deg,#f5f3ff,#fff1f2)}
.oa2-link{background:none;border:none;padding:0;color:#6366f1;font-weight:700;cursor:pointer;text-align:left;transition:color .15s}
.oa2-link:hover{color:#ec4899;text-decoration:underline}
.oa2-diagnostic{display:inline-block;border-radius:100px;background:#ffe4e6;color:#be123c;font-size:9.5px;font-weight:700;padding:2px 8px}
.oa2-status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#aaa;box-shadow:0 0 0 3px rgba(0,0,0,.05)}
.oa2-pager{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding-top:11px;color:var(--muted);font-size:10.5px}

/* ── Insights ── */
.oa2-insights{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.oa2-insight{
  --c:#6366f1;padding:10px 12px;background:color-mix(in srgb,var(--c) 6%,white);border:1px solid color-mix(in srgb,var(--c) 18%,white);
  border-left:3px solid var(--c);border-radius:11px;font-size:11.5px;line-height:1.55;animation:oaFadeUp .5s both;transition:transform .2s,box-shadow .2s;
}
.oa2-insight:hover{transform:translateX(4px);box-shadow:0 8px 18px color-mix(in srgb,var(--c) 18%,transparent)}
.oa2-insight strong{color:var(--c)}
.oa2-insight:nth-child(1){--c:#6366f1}.oa2-insight:nth-child(2){--c:#10b981;animation-delay:.05s}
.oa2-insight:nth-child(3){--c:#ec4899;animation-delay:.10s}.oa2-insight:nth-child(4){--c:#f43f5e;animation-delay:.15s}
.oa2-insight:nth-child(5){--c:#f59e0b;animation-delay:.20s}.oa2-insight:nth-child(6){--c:#0ea5e9;animation-delay:.25s}
.oa2-insight:nth-child(7){--c:#8b5cf6;animation-delay:.30s}.oa2-insight:nth-child(8){--c:#14b8a6;animation-delay:.35s}
.oa2-insight:nth-child(9){--c:#f97316;animation-delay:.40s}

/* ── Order details ── */
.oa2-order-detail{background:linear-gradient(180deg,#f5f3ff,#fff);border-top:1px solid #e0e7ff;border-radius:0 0 12px 12px;padding:12px;white-space:normal;min-width:700px;animation:oaPanel .3s ease both}
.oa2-order-detail-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;font-size:11px}
.oa2-small{font-size:10px;color:#858499}
.oa2-empty{height:245px;display:grid;place-items:center;text-align:center;color:var(--soft);font-size:11.5px}

/* ── Loading skeleton ── */
.oa2-skeleton-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:11px}
.oa2-skeleton{height:90px;border-radius:14px;background:linear-gradient(90deg,#eef2ff 25%,#fdf2f8 50%,#eef2ff 75%);background-size:200% 100%;animation:oaShimmer 1.6s linear infinite}
.oa2-skeleton:nth-child(odd){background-image:linear-gradient(90deg,#fff7ed 25%,#ecfeff 50%,#fff7ed 75%)}

.oa2-print-info,.oa2-print-only{display:none}

/* ── Responsive ── */
@media(max-width:1150px){
  .oa2-fields{grid-template-columns:repeat(4,minmax(130px,1fr))}
  .oa2-filter-actions{grid-column:span 2}
  .oa2-kpis,.oa2-skeleton-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(max-width:720px){
  .oa2{padding:10px}
  .oa2-header{padding:16px;border-radius:16px}
  .oa2-header h1{font-size:17px}
  .oa2-fields{grid-template-columns:repeat(2,minmax(0,1fr))}
  .oa2-filter-actions{grid-column:1/-1}
  .oa2-kpis,.oa2-skeleton-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .oa2-kpi{padding:11px}
  .oa2-kpi-value{font-size:16px}
  .oa2-grid,.oa2-insights{grid-template-columns:1fr}
  .oa2-card{padding:12px}
  .oa2-toolbar input{min-width:0;width:100%}
}

@media(prefers-reduced-motion:reduce){
  .oa2 *,.oa2 *::before,.oa2 *::after{animation:none !important;transition:none !important}
}

/* ── Print ── */
@media print{
  .oa2{padding:0;background:#fff}
  .oa2-header,.oa2-filter,.oa2-actions,.oa2-toolbar,.oa2-pager,.oa2-no-print{display:none !important}
  .oa2-print-info{display:block;border-bottom:2px solid #333;padding:0 0 12px;margin-bottom:14px}
  .oa2-print-only{display:block !important}
  .oa2-print-only .oa2-table{min-width:0}
  .oa2-card,.oa2-kpi{box-shadow:none;break-inside:avoid;animation:none !important}
  .oa2-kpis{grid-template-columns:repeat(5,1fr)}
}
`;

export default STYLES;