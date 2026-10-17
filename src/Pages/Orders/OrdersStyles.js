/* ─────────────────────────────────────────────────────────
   Orders page – colourful, animated, small-font, mobile-first
   Usage: import { STYLES } from "./OrdersStyles";
   (same class names as before, so no JSX changes needed)
───────────────────────────────────────────────────────── */
export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

.ao{
  --ink:#1e1b4b; --mut:#6b7280; --soft:#9ca3af; --line:#e8eaf8;
  --indigo:#6366f1; --pink:#ec4899; --sky:#0ea5e9; --emerald:#10b981;
  --amber:#f59e0b; --violet:#8b5cf6; --rose:#f43f5e;
  font-family:'DM Sans',sans-serif; font-size:12px; color:var(--ink);
}
.ao *,.ao *::before,.ao *::after{box-sizing:border-box}
.ao button{font-family:inherit}

/* ── keyframes ── */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.25)}}
@keyframes rowFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes tabPop{from{transform:scale(.92);opacity:.6}to{transform:scale(1);opacity:1}}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
@keyframes modalIn{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:none}}
@keyframes sheetUp{from{opacity:.4;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes panelOpen{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes shine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(420%) skewX(-20deg)}}
@keyframes aoDot{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.5)}50%{box-shadow:0 0 0 5px rgba(99,102,241,0)}}

/* ── Page card ── */
.ao-page{
  background:rgba(255,255,255,.92); border-radius:20px; border:1px solid var(--line);
  box-shadow:0 6px 30px rgba(99,102,241,.1); overflow:hidden; margin:10px 0;
  animation:rowFadeIn .5s cubic-bezier(.2,.8,.2,1) both;
}

/* ── Top bar ── */
.ao-topbar{
  display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:16px 18px 14px;
  background:linear-gradient(120deg,#eef2ff 0%,#fdf2f8 55%,#fff7ed 100%);
  border-bottom:1px solid var(--line);
}
.ao-topbar-left{flex:1; min-width:180px}
.ao-topbar-title{
  font-family:'Sora',sans-serif; font-size:16px; font-weight:800; letter-spacing:-.02em; margin:0 0 2px;
  background:linear-gradient(90deg,#4f46e5,#ec4899); -webkit-background-clip:text; background-clip:text; color:transparent;
}
.ao-topbar-sub{font-size:11px; color:var(--mut); font-weight:500; margin:0}
.ao-search-wrap{flex:1; max-width:300px; min-width:170px}

/* buttons in top bar */
.ao-refresh-btn{
  background:#fff; border:1px solid #c7d2fe; border-radius:10px; padding:8px 14px;
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  font-size:12px; font-weight:600; color:#4f46e5; cursor:pointer;
  transition:transform .18s, box-shadow .18s, background .18s;
}
.ao-refresh-btn:hover{background:#eef2ff; transform:translateY(-1px); box-shadow:0 6px 14px rgba(99,102,241,.2)}
.ao-refresh-btn:active{transform:scale(.97)}
.ao-refresh-btn:disabled{opacity:.55; cursor:not-allowed; transform:none; box-shadow:none}
.ao-refresh-icon{font-size:14px; display:inline-flex}
.ao-refresh-icon.spinning{animation:spin .8s linear infinite}

/* ── Rider tabs ── */
.ao-rider-tabs{display:inline-flex; gap:3px; background:rgba(255,255,255,.8); border:1px solid var(--line); border-radius:12px; padding:3px; margin-top:10px}
.ao-rider-tab-btn{
  border:none; background:transparent; cursor:pointer; font-size:11.5px; font-weight:700; color:var(--mut);
  padding:7px 14px; border-radius:9px; white-space:nowrap; transition:color .25s, background .25s, transform .15s;
}
.ao-rider-tab-btn:hover:not(.active){color:#4f46e5; background:#eef2ff}
.ao-rider-tab-btn:active{transform:scale(.97)}
.ao-rider-tab-btn.active{
  color:#fff; background:linear-gradient(135deg,#6366f1,#ec4899); box-shadow:0 5px 14px rgba(236,72,153,.35);
  animation:tabPop .28s cubic-bezier(.34,1.4,.64,1);
}

/* ── Stats ── */
.ao-stats{display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:14px 18px; background:#fafaff; border-bottom:1px solid var(--line)}
.ao-stat{
  --c:#6366f1; position:relative; overflow:hidden;
  display:flex; flex-direction:column; align-items:flex-start; gap:3px; padding:11px 14px;
  background:#fff; border:1px solid var(--line); border-radius:14px;
  animation:rowFadeIn .5s cubic-bezier(.2,.8,.2,1) both; transition:transform .25s, box-shadow .25s, border-color .25s;
}
.ao-stat:nth-child(1){--c:#6366f1}
.ao-stat:nth-child(2){--c:#f59e0b; animation-delay:.06s}
.ao-stat:nth-child(3){--c:#10b981; animation-delay:.12s}
.ao-stat:nth-child(4){--c:#f43f5e; animation-delay:.18s}
.ao-stat::before{content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--c)}
.ao-stat::after{content:""; position:absolute; right:-24px; bottom:-24px; width:70px; height:70px; border-radius:50%; background:var(--c); opacity:.09; transition:transform .4s}
.ao-stat:hover{transform:translateY(-3px); box-shadow:0 12px 24px color-mix(in srgb,var(--c) 22%,transparent); border-color:var(--c)}
.ao-stat:hover::after{transform:scale(1.8)}
.ao-stat-n{font-family:'Sora',sans-serif; font-size:20px; font-weight:800; line-height:1}
.ao-stat-l{font-size:10px; font-weight:700; letter-spacing:.06em; color:var(--mut); text-transform:uppercase}

/* ── Table (desktop) ── */
.ao-scroll{overflow-x:auto; transition:opacity .25s}
.ao-scroll.ao-loading{opacity:.45; pointer-events:none}
.ao-tbl{width:100%; border-collapse:collapse}
.ao-tbl thead tr{background:linear-gradient(90deg,#eef2ff,#fdf2f8)}
.ao-tbl th{padding:9px 12px; text-align:left; font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#4f46e5; white-space:nowrap; border-bottom:1px solid #e0e7ff}
.ao-tbl td{padding:11px 12px; border-bottom:1px solid #f1f2fb; vertical-align:middle; font-size:12px}
.ao-tbl tbody tr.ao-main-row{animation:rowFadeIn .4s cubic-bezier(.22,1,.36,1) both; transition:background .2s}
.ao-tbl tbody tr.ao-main-row > td:first-child{border-left:3px solid var(--st,#6366f1)}
.ao-tbl tbody tr.ao-main-row:hover > td{background:linear-gradient(90deg,#f5f3ff,#fff1f2)}
.ao-tbl tbody tr.ao-main-row.expanded > td{background:#f5f3ff}

.ao-xbtn{
  width:26px; height:26px; border-radius:8px; border:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
  font-size:9px; background:#eef2ff; color:#4f46e5; transition:all .2s; flex-shrink:0;
}
.ao-xbtn:hover{background:#e0e7ff; transform:translateY(-1px)}
.ao-xbtn.open{background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 4px 10px rgba(99,102,241,.4)}

.ao-oid{font-size:11px; font-weight:800; color:#6366f1; font-family:'Sora',sans-serif; display:block}
.ao-oid-full{font-size:9.5px; color:#b6b9d4; display:block; margin-top:1px; white-space:nowrap; max-width:100px; overflow:hidden; text-overflow:ellipsis}

.ao-badge{display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 9px; border-radius:100px; white-space:nowrap}
.ao-badge-cod{background:#fef3c7; color:#92400e; border:1px solid #fde68a}
.ao-badge-online{background:#d1fae5; color:#065f46; border:1px solid #a7f3d0}
.ao-badge-pid{font-size:9.5px; color:var(--soft); display:block; margin-top:3px}

.ao-cust-name{font-weight:700; color:var(--ink); font-size:12.5px}
.ao-cust-email{font-size:10.5px; color:var(--soft); margin-top:1px}
.ao-cust-phone{font-size:10.5px; color:#0ea5e9; font-weight:600; margin-top:1px}

.ao-addr-type{display:inline-block; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 7px; border-radius:100px; background:#ede9fe; color:#6d28d9; margin-bottom:3px}
.ao-addr-text{font-size:11.5px; color:#374151; max-width:160px; line-height:1.4}
.ao-addr-pin{font-size:10.5px; color:var(--soft); margin-top:1px}

.ao-tap-chip{
  display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:600; text-decoration:none;
  padding:3px 9px; border-radius:100px; border:1px solid; transition:transform .18s, box-shadow .18s, filter .18s;
}
.ao-tap-chip:hover{transform:translateY(-1px); box-shadow:0 5px 12px rgba(0,0,0,.1); filter:brightness(.97)}

.ao-amt{font-family:'Sora',sans-serif; font-size:13px; font-weight:800; background:linear-gradient(90deg,#059669,#0ea5e9); -webkit-background-clip:text; background-clip:text; color:transparent}

.ao-del{
  display:inline-flex; align-items:center; justify-content:center; gap:4px; background:#fff1f2; color:#e11d48; border:1px solid #fecdd3;
  font-size:10.5px; font-weight:700; padding:5px 10px; border-radius:8px; cursor:pointer; transition:all .18s; white-space:nowrap;
}
.ao-del:hover{background:#ffe4e6; transform:translateY(-1px); box-shadow:0 5px 12px rgba(244,63,94,.2)}

/* ── Expanded panel ── */
.ao-panel-row > td{padding:0 !important; border-bottom:2px solid #e0e7ff !important}
.ao-panel{background:linear-gradient(180deg,#f5f3ff,#fff); padding:14px 18px 18px 22px; animation:panelOpen .3s ease both}
.ao-panel-hdr{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px}
.ao-panel-title{font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#4f46e5}
.ao-panel-count{font-size:10px; font-weight:700; background:#e0e7ff; color:#4338ca; padding:2px 9px; border-radius:100px}
.ao-panel-hint{font-size:10.5px; color:var(--soft); margin-bottom:10px}

.ao-prod-list{display:flex; flex-direction:column; gap:7px}
.ao-prod-card{
  --c:#6366f1; display:flex; align-items:center; gap:11px; background:#fff; border:1.5px solid var(--line); border-radius:13px;
  padding:9px 12px; cursor:pointer; position:relative; transition:all .2s ease; animation:rowFadeIn .4s both;
}
.ao-prod-card:nth-child(4n+2){--c:#ec4899}
.ao-prod-card:nth-child(4n+3){--c:#0ea5e9}
.ao-prod-card:nth-child(4n+4){--c:#10b981}
.ao-prod-card:hover{border-color:var(--c); box-shadow:0 8px 20px color-mix(in srgb,var(--c) 20%,transparent); transform:translateX(4px)}
.ao-prod-card::after{content:'↗'; position:absolute; right:12px; top:50%; transform:translateY(-50%); font-size:12px; color:#c7c9e0; transition:color .15s}
.ao-prod-card:hover::after{color:var(--c)}
.ao-prod-img{width:46px; height:46px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid var(--line)}
.ao-prod-noimg{width:46px; height:46px; border-radius:10px; flex-shrink:0; background:#eef2ff; display:flex; align-items:center; justify-content:center; font-size:18px}
.ao-prod-info{flex:1; min-width:0}
.ao-prod-name{font-size:12.5px; font-weight:700; margin-bottom:4px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:260px}
.ao-prod-tags{display:flex; flex-wrap:wrap; gap:4px}
.ao-prod-tag{font-size:10px; font-weight:600; background:#f1f5ff; color:#4f46e5; padding:2px 8px; border-radius:100px}
.ao-prod-right{text-align:right; flex-shrink:0; margin-right:18px}
.ao-prod-subtotal{font-family:'Sora',sans-serif; font-size:12.5px; font-weight:800}
.ao-prod-unit{font-size:10px; color:var(--soft); margin-top:1px}

.ao-panel-total{display:flex; align-items:center; justify-content:flex-end; gap:12px; padding-top:10px; border-top:2px dashed #c7d2fe; margin-top:10px}
.ao-panel-total-lbl{font-size:11.5px; font-weight:600; color:var(--mut)}
.ao-panel-total-amt{font-family:'Sora',sans-serif; font-size:16px; font-weight:800; background:linear-gradient(90deg,#6366f1,#ec4899); -webkit-background-clip:text; background-clip:text; color:transparent}

/* ── Product modal ── */
.ao-overlay{position:fixed; inset:0; z-index:9999; background:rgba(30,27,75,.55); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; animation:overlayIn .2s both}
.ao-modal{background:#fff; border-radius:22px; width:100%; max-width:460px; max-height:90vh; overflow-y:auto; box-shadow:0 40px 90px rgba(30,27,75,.35); animation:modalIn .32s cubic-bezier(.34,1.3,.64,1) both; outline:none}
.ao-modal-imgbox{position:relative; height:200px; background:linear-gradient(135deg,#eef2ff,#fdf2f8); border-radius:22px 22px 0 0; overflow:hidden}
.ao-modal-imgbox img{width:100%; height:100%; object-fit:cover; transition:transform .5s ease}
.ao-modal-imgbox:hover img{transform:scale(1.06)}
.ao-modal-noimg{width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:50px; color:#ddd}
.ao-modal-close{position:absolute; top:10px; right:10px; width:30px; height:30px; border-radius:50%; background:rgba(0,0,0,.45); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; transition:background .15s, transform .2s}
.ao-modal-close:hover{background:#f43f5e; transform:rotate(90deg)}
.ao-modal-chip{position:absolute; bottom:10px; left:10px; background:linear-gradient(135deg,#6366f1,#ec4899); color:#fff; font-family:'Sora',sans-serif; font-size:13px; font-weight:800; padding:5px 13px; border-radius:100px; box-shadow:0 6px 14px rgba(236,72,153,.4)}
.ao-modal-body{padding:18px 20px 22px}
.ao-modal-name{font-family:'Sora',sans-serif; font-size:16px; font-weight:800; letter-spacing:-.02em; margin:0 0 3px; line-height:1.3}
.ao-modal-pid{font-size:10.5px; color:var(--soft); margin:0 0 14px}
.ao-modal-pricerow{display:flex; align-items:baseline; gap:8px; margin-bottom:6px}
.ao-modal-price{font-family:'Sora',sans-serif; font-size:23px; font-weight:800}
.ao-modal-per{font-size:11px; color:var(--soft)}
.ao-modal-math{display:inline-flex; align-items:center; gap:6px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:100px; padding:4px 12px; margin-bottom:14px; font-size:11px; font-weight:600; color:#065f46}
.ao-modal-divider{height:1px; background:linear-gradient(90deg,transparent,#e0e7ff,transparent); margin:14px 0}
.ao-modal-attrs{display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px}
.ao-modal-attr{background:#f5f3ff; border-radius:11px; padding:9px 12px; transition:transform .2s}
.ao-modal-attr:nth-child(3n+2){background:#fdf2f8}
.ao-modal-attr:nth-child(3n+3){background:#ecfeff}
.ao-modal-attr:hover{transform:translateY(-2px)}
.ao-modal-attr-lbl{font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--soft); margin-bottom:3px}
.ao-modal-attr-val{font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px}
.ao-modal-color-dot{width:12px; height:12px; border-radius:50%; border:1px solid #e5e7eb; flex-shrink:0}
.ao-modal-footer{display:flex; gap:8px}
.ao-modal-btn-p{flex:1; height:40px; border-radius:11px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; cursor:pointer; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; transition:all .2s; position:relative; overflow:hidden}
.ao-modal-btn-p::after{content:""; position:absolute; top:0; bottom:0; width:25%; background:rgba(255,255,255,.3); transform:translateX(-120%) skewX(-20deg)}
.ao-modal-btn-p:hover{transform:translateY(-1px); box-shadow:0 8px 20px rgba(99,102,241,.4)}
.ao-modal-btn-p:hover::after{animation:shine .8s ease}
.ao-modal-btn-s{height:40px; padding:0 16px; border-radius:11px; background:#f1f5ff; color:#4f46e5; border:none; cursor:pointer; font-size:12px; font-weight:600; transition:all .15s}
.ao-modal-btn-s:hover{background:#e0e7ff}

/* ── Empty ── */
.ao-empty{display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; gap:6px; text-align:center; animation:rowFadeIn .4s both}
.ao-empty-icon{font-size:40px; margin-bottom:2px; animation:pulse 2.5s ease-in-out infinite}
.ao-empty h3{font-family:'Sora',sans-serif; font-size:14px; font-weight:700; margin:0}
.ao-empty p{font-size:11.5px; color:var(--soft); margin:0}

.ao-page-footer{display:flex; justify-content:center; padding:16px 18px 18px}

/* ── Action buttons (colour cycles by position) ── */
.ao-receipt-btn{
  --c:#2563eb; display:inline-flex; align-items:center; justify-content:center; gap:4px;
  color:var(--c); background:color-mix(in srgb,var(--c) 9%,white); border:1px solid color-mix(in srgb,var(--c) 28%,white);
  font-size:10.5px; font-weight:700; padding:5px 10px; border-radius:8px; cursor:pointer; white-space:nowrap;
  transition:transform .18s, box-shadow .18s, background .18s;
}
.ao-receipt-btn:hover{background:color-mix(in srgb,var(--c) 17%,white); transform:translateY(-1px); box-shadow:0 5px 12px color-mix(in srgb,var(--c) 28%,transparent)}
.ao-receipt-btn:active{transform:scale(.97)}
.ao-receipt-btn:disabled{opacity:.6; cursor:not-allowed; transform:none; box-shadow:none}
td[data-label="Action"] .ao-receipt-btn:nth-of-type(4n+2){--c:#8b5cf6}
td[data-label="Action"] .ao-receipt-btn:nth-of-type(4n+3){--c:#10b981}
td[data-label="Action"] .ao-receipt-btn:nth-of-type(4n+4){--c:#f59e0b}
.ao-rider-actions .ao-receipt-btn:nth-child(1){--c:#10b981}
.ao-rider-actions .ao-receipt-btn:nth-child(2){--c:#ec4899}

.ao-rider-actions{display:flex; flex-direction:column; gap:6px; background:linear-gradient(135deg,#f5f3ff,#fdf2f8); border:1px solid #e9d5ff; border-radius:12px; padding:7px; animation:rowFadeIn .3s both}
.ao-rider-actions .ao-receipt-btn{width:100%}
.ao-rider-status-badge{display:inline-flex; align-items:center; gap:6px; font-size:10px; font-weight:700; padding:4px 10px; border-radius:100px; background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe}
.ao-rider-status-dot{width:6px; height:6px; border-radius:50%; background:#6366f1; animation:aoDot 1.8s ease-in-out infinite}

/* ═══ RECEIPT MODAL ═══ */
.ao-rcpt-overlay{position:fixed; inset:0; z-index:9998; background:rgba(30,27,75,.6); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:14px; animation:overlayIn .2s both}
.ao-rcpt-sheet{background:#fff; border-radius:20px; width:100%; max-width:620px; max-height:92vh; overflow-y:auto; overflow-x:hidden; box-shadow:0 32px 80px rgba(30,27,75,.35); animation:modalIn .32s cubic-bezier(.34,1.3,.64,1) both; position:relative}
.ao-rcpt-head{background:linear-gradient(120deg,#4f46e5,#8b5cf6,#ec4899,#f97316); background-size:300% 300%; animation:gradShift 12s ease infinite; padding:22px 22px 18px; position:relative; overflow:hidden}
.ao-rcpt-head::before{content:''; position:absolute; width:190px; height:190px; border-radius:50%; background:rgba(255,255,255,.13); top:-80px; right:-50px}
.ao-rcpt-head-top{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; position:relative; z-index:1}
.ao-rcpt-brand{display:flex; align-items:center; gap:10px}
.ao-rcpt-brand-icon{width:36px; height:36px; background:rgba(255,255,255,.2); border-radius:10px; border:1px solid rgba(255,255,255,.3); display:flex; align-items:center; justify-content:center; font-size:18px}
.ao-rcpt-brand-name{font-family:'Sora',sans-serif; font-size:14px; font-weight:800; color:#fff}
.ao-rcpt-brand-sub{font-size:10px; color:rgba(255,255,255,.75); margin-top:1px}
.ao-rcpt-close-btn{width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3); cursor:pointer; color:#fff; font-size:13px; display:flex; align-items:center; justify-content:center; transition:background .15s, transform .2s; flex-shrink:0}
.ao-rcpt-close-btn:hover{background:rgba(255,255,255,.35); transform:rotate(90deg)}
.ao-rcpt-head-mid{margin-top:16px; position:relative; z-index:1}
.ao-rcpt-title{font-family:'Sora',sans-serif; font-size:19px; font-weight:800; color:#fff; letter-spacing:-.02em; margin:0 0 6px}
.ao-rcpt-meta-row{display:flex; flex-wrap:wrap; gap:7px; margin-top:6px}
.ao-rcpt-meta-chip{display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3); border-radius:100px; padding:3px 10px; font-size:10.5px; color:#fff; font-weight:600}
.ao-rcpt-status-chip{display:inline-flex; align-items:center; gap:5px; border-radius:100px; padding:3px 11px; font-size:10.5px; font-weight:700}
.ao-rcpt-tear{width:100%; height:14px; background:#fff; position:relative; overflow:hidden}
.ao-rcpt-tear::before{content:''; position:absolute; top:-14px; left:0; right:0; height:28px; background:radial-gradient(circle at 50% 0%,#fff 10px,transparent 10px); background-size:28px 28px; background-repeat:repeat-x}
.ao-rcpt-body{padding:16px 22px 22px}
.ao-rcpt-sec-lbl{font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:#6366f1; margin:14px 0 8px; display:flex; align-items:center; gap:6px}
.ao-rcpt-sec-lbl::after{content:''; flex:1; height:1px; background:linear-gradient(90deg,#c7d2fe,transparent)}
.ao-rcpt-2col{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px}
.ao-rcpt-info-card{background:#f8f9ff; border:1px solid #e5e7fb; border-radius:13px; padding:12px 14px; transition:transform .2s, box-shadow .2s}
.ao-rcpt-2col .ao-rcpt-info-card:nth-child(2){background:#fff7fb; border-color:#fbcfe8}
.ao-rcpt-info-card:hover{transform:translateY(-2px); box-shadow:0 8px 18px rgba(99,102,241,.12)}
.ao-rcpt-info-title{font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#6366f1; margin-bottom:7px; display:flex; align-items:center; gap:5px}
.ao-rcpt-info-name{font-size:13px; font-weight:700; margin-bottom:3px}
.ao-rcpt-info-line{font-size:11.5px; color:#4b5563; margin-bottom:2px; line-height:1.5; word-break:break-word}
.ao-rcpt-info-muted{font-size:10.5px; color:var(--soft)}

.ao-rcpt-prod-table{width:100%; border-collapse:collapse}
.ao-rcpt-prod-table th{padding:7px 10px; font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#6366f1; border-bottom:2px solid #e0e7ff; text-align:left}
.ao-rcpt-prod-table th:last-child{text-align:right}
.ao-rcpt-prod-table td{padding:10px; border-bottom:1px solid #f3f4fc; vertical-align:middle}
.ao-rcpt-prod-table tr:last-child td{border-bottom:none}
.ao-rcpt-prod-table tr:hover td{background:#faf9ff}
.ao-rcpt-prod-img{width:40px; height:40px; border-radius:9px; object-fit:cover; border:1px solid var(--line); flex-shrink:0}
.ao-rcpt-prod-noimg{width:40px; height:40px; border-radius:9px; background:#eef2ff; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0}
.ao-rcpt-prod-name{font-size:12px; font-weight:700; margin-bottom:2px}
.ao-rcpt-prod-attr{font-size:10px; color:var(--soft)}
.ao-rcpt-prod-amt{font-family:'Sora',sans-serif; font-size:12px; font-weight:800; text-align:right; white-space:nowrap}
.ao-rcpt-prod-unit{font-size:10px; color:var(--soft); text-align:right}

.ao-rcpt-totals{background:linear-gradient(135deg,#f5f3ff,#fdf2f8); border:1px solid #e9d5ff; border-radius:13px; padding:12px 14px; margin-top:12px}
.ao-rcpt-total-row{display:flex; justify-content:space-between; align-items:center; padding:3px 0; font-size:12px}
.ao-rcpt-total-row.sub{color:var(--mut)}
.ao-rcpt-total-row.grand{border-top:2px dashed #c4b5fd; margin-top:7px; padding-top:9px}
.ao-rcpt-total-row.grand .ao-rcpt-total-lbl{font-family:'Sora',sans-serif; font-size:13px; font-weight:800}
.ao-rcpt-total-row.grand .ao-rcpt-total-val{font-family:'Sora',sans-serif; font-size:17px; font-weight:800; background:linear-gradient(90deg,#6366f1,#ec4899); -webkit-background-clip:text; background-clip:text; color:transparent}
.ao-rcpt-pay-row{display:flex; align-items:center; gap:9px; padding:10px 12px; background:#f0fdf9; border:1px solid #a7f3d0; border-radius:12px; margin-top:12px}
.ao-rcpt-pay-icon{font-size:17px}
.ao-rcpt-pay-label{font-size:11.5px; font-weight:700}
.ao-rcpt-pay-sub{font-size:10px; color:var(--soft)}

.ao-rcpt-footer{display:flex; gap:8px; padding:14px 22px 20px; border-top:1px solid #f0f1fb; flex-wrap:wrap}
.ao-rcpt-btn-print{flex:1; min-width:120px; height:40px; border-radius:11px; background:linear-gradient(135deg,#6366f1,#ec4899); color:#fff; border:none; cursor:pointer; font-size:12.5px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:7px; transition:all .2s; box-shadow:0 6px 16px rgba(236,72,153,.3)}
.ao-rcpt-btn-print:hover{transform:translateY(-1px); box-shadow:0 10px 22px rgba(236,72,153,.4)}
.ao-rcpt-btn-close{height:40px; padding:0 18px; border-radius:11px; background:#f1f5ff; color:#4f46e5; border:none; cursor:pointer; font-size:12.5px; font-weight:600; transition:all .15s}
.ao-rcpt-btn-close:hover{background:#e0e7ff}

/* ── PRINT (unchanged behaviour) ── */
@media print{
  body *{visibility:hidden !important}
  .ao-rcpt-printable,.ao-rcpt-printable *{visibility:visible !important}
  .ao-rcpt-printable{position:fixed !important; inset:0 !important; z-index:99999 !important; background:#fff !important; padding:24px !important; max-height:none !important; overflow:visible !important; border-radius:0 !important; box-shadow:none !important; animation:none !important}
  .ao-rcpt-footer,.ao-rcpt-close-btn,.ao-rcpt-tear{display:none !important}
  .ao-rcpt-head{-webkit-print-color-adjust:exact; print-color-adjust:exact; animation:none !important}
}

/* ── MUI status select ── */
.ao-status-sel .MuiOutlinedInput-root{border-radius:100px !important; font-size:11.5px !important; font-family:'DM Sans',sans-serif !important; font-weight:700 !important}
.ao-status-sel .MuiSelect-select{padding:5px 12px !important; font-size:11.5px !important; font-weight:700 !important}
.ao-status-sel fieldset{border-color:transparent !important}

/* ═══ TABLET ═══ */
@media(max-width:1100px){
  .ao-prod-name{max-width:180px}
}

/* ═══ MOBILE – table becomes cards (uses td[data-label]) ═══ */
@media(max-width:860px){
  .ao-topbar{padding:14px 12px}
  .ao-topbar-left{flex-basis:100%}
  .ao-search-wrap{flex-basis:100%; max-width:none; order:5}
  .ao-refresh-btn{flex:1}
  .ao-rider-tabs{display:flex; width:100%}
  .ao-rider-tab-btn{flex:1; padding:8px 6px}
  .ao-stats{grid-template-columns:1fr 1fr; padding:12px; gap:8px}

  .ao-scroll{overflow:visible; padding:10px}
  .ao-tbl,.ao-tbl tbody{display:block; width:100%}
  .ao-tbl thead{display:none}
  .ao-tbl tbody tr.ao-main-row{
    display:block; position:relative; margin-bottom:12px; padding:10px 14px 12px;
    background:#fff; border:1px solid var(--line); border-left:4px solid var(--st,#6366f1); border-radius:16px;
    box-shadow:0 4px 14px rgba(99,102,241,.08);
  }
  .ao-tbl tbody tr.ao-main-row.expanded{background:#faf9ff; border-color:#c7d2fe; border-left-color:var(--st,#6366f1)}
  .ao-tbl tbody tr.ao-main-row > td,
  .ao-tbl tbody tr.ao-main-row > td:first-child{border:none; background:transparent !important; padding:7px 0 7px 92px; position:relative; min-height:30px; display:block}
  .ao-tbl tbody tr.ao-main-row > td + td{border-top:1px dashed #eef0fb}
  .ao-tbl td::before{content:attr(data-label); position:absolute; left:0; top:9px; width:84px; font-size:9.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#8b8fb8}
  .ao-tbl td[data-label=""]{position:absolute !important; top:8px; right:8px; padding:0 !important; width:auto; min-height:0; border:none !important}
  .ao-tbl td[data-label=""]::before{display:none}
  .ao-addr-text{max-width:none}
  .ao-oid-full{max-width:none}

  .ao-tbl td[data-label="Action"]{padding:10px 0 0 0}
  .ao-tbl td[data-label="Action"]::before{position:static; display:block; width:auto; margin-bottom:6px}
  .ao-tbl td[data-label="Action"] > div{display:grid !important; grid-template-columns:1fr 1fr; gap:6px !important}
  .ao-tbl td[data-label="Action"] .ao-del,
  .ao-tbl td[data-label="Action"] .ao-rider-actions,
  .ao-tbl td[data-label="Action"] .ao-rider-status-badge,
  .ao-tbl td[data-label="Action"] .MuiSelect-root,
  .ao-tbl td[data-label="Action"] .MuiInputBase-root{grid-column:1 / -1}
  .ao-receipt-btn{padding:8px 10px; font-size:11px; white-space:normal; text-align:center}

  .ao-tbl tbody tr.ao-panel-row{display:block; margin:-6px 0 12px}
  .ao-tbl tbody tr.ao-panel-row > td{display:block; padding:0 !important; border:none !important}
  .ao-panel{padding:12px; border-radius:14px; border:1px solid #e0e7ff}
  .ao-prod-card{flex-wrap:wrap; padding:9px 10px}
  .ao-prod-card::after{display:none}
  .ao-prod-name{max-width:100%; white-space:normal}
  .ao-prod-right{margin-right:0; margin-left:auto}
  .ao-page-footer{flex-direction:column; align-items:center; gap:12px !important; padding:14px 10px 18px}
}

/* ═══ SMALL PHONES – modals become bottom sheets ═══ */
@media(max-width:600px){
  .ao-overlay,.ao-rcpt-overlay{align-items:flex-end; padding:0}
  .ao-modal,.ao-rcpt-sheet{max-width:none; max-height:92vh; border-radius:22px 22px 0 0; animation:sheetUp .35s cubic-bezier(.2,.9,.3,1) both}
  .ao-modal-imgbox{border-radius:22px 22px 0 0; height:170px}
  .ao-rcpt-2col{grid-template-columns:1fr}
  .ao-rcpt-head{padding:18px 16px 14px}
  .ao-rcpt-body{padding:14px 14px 18px}
  .ao-rcpt-footer{padding:12px 14px 16px}
  .ao-rcpt-prod-table th,.ao-rcpt-prod-table td{padding:8px 6px}
  .ao-modal-attrs{grid-template-columns:1fr 1fr}
  .ao-stat-n{font-size:18px}
}

@media(prefers-reduced-motion:reduce){
  .ao *,.ao *::before,.ao *::after{animation:none !important; transition:none !important}
}
`;

export default STYLES;