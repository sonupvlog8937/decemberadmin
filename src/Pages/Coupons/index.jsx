import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Button, CircularProgress, TextField, Select, MenuItem, FormControl,
  InputLabel, Switch, FormControlLabel, IconButton, Tooltip,
} from "@mui/material";
import {
  Edit, Delete, Tag, Info, ConfirmationNumber, CheckCircle, PauseCircle,
  Timelapse, ContentCopy, Search,
} from "@mui/icons-material";
import { MyContext } from "../../App";
import { deleteData, editData, fetchDataFromApi, postData } from "../../utils/api";

const GO_MARKET_SHOP_SELLERS = [
  "GROCERY_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER",
  "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER",
  "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER",
];

const initialForm = {
  code: "", title: "", description: "", type: "percentage", value: "",
  minOrderAmount: "", maxDiscountAmount: "", usageLimit: "", isActive: true,
  audience: "global", startsAt: "", expiresAt: "",
};

const C = {
  indigo: "#6366F1", pink: "#EC4899", sky: "#0EA5E9", emerald: "#10B981",
  amber: "#F59E0B", violet: "#8B5CF6", rose: "#F43F5E", teal: "#14B8A6",
  orange: "#F97316", lime: "#84CC16",
};

// each form field gets its own accent colour (cycled) so the form feels colourful
const FIELD_COLORS = [C.indigo, C.pink, C.sky, C.emerald, C.amber, C.violet, C.rose, C.teal, C.orange];

const fieldSx = (color = C.violet) => ({
  "& .MuiOutlinedInput-root": {
    minHeight: 44, borderRadius: "12px", fontSize: 13, background: "rgba(255,255,255,.75)",
    backdropFilter: "blur(4px)",
    transition: "box-shadow .25s ease, background .25s ease, transform .25s ease",
    "& fieldset": { borderColor: `${color}40`, transition: "border-color .25s" },
    "&:hover": { background: "#fff" },
    "&:hover fieldset": { borderColor: color },
    "&.Mui-focused": {
      background: "#fff", transform: "translateY(-1px)",
      boxShadow: `0 6px 18px ${color}33, 0 0 0 3px ${color}22`,
    },
    "&.Mui-focused fieldset": { borderColor: color, borderWidth: 1.5 },
    "& .MuiOutlinedInput-input": { padding: "11px 13px", fontSize: 13 },
    "& .MuiSelect-select": { padding: "11px 13px", fontSize: 13 },
    "& input::placeholder": { fontSize: 12, opacity: 0.55 },
  },
  "& .MuiInputLabel-root": { fontSize: 12.5, color: "#6B7280" },
  "& .MuiInputLabel-root.Mui-focused": { color },
  "& .MuiFormHelperText-root": {
    fontSize: 10.5, lineHeight: 1.35, marginLeft: "4px", marginTop: "5px", minHeight: "14px",
  },
});

const CSS = `
.cp{--ink:#1E1B4B;--mut:#6B7280;--line:#E7E9F8;font-size:12px;color:var(--ink);position:relative;overflow:hidden;
  background:linear-gradient(160deg,#F5F3FF 0%,#EFF6FF 35%,#ECFDF5 65%,#FFF1F2 100%);background-size:200% 200%;
  animation:cpBg 22s ease infinite;min-height:100vh;width:100%;min-width:0;isolation:isolate;
  font-family:"Poppins","Inter",system-ui,-apple-system,"Segoe UI",sans-serif}
.cp *{box-sizing:border-box}

/* ---------- keyframes ---------- */
@keyframes cpBg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes cpFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(26px,-30px) scale(1.1)}66%{transform:translate(-20px,20px) scale(.95)}}
@keyframes cpRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes cpPop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
@keyframes cpShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cpBar{from{width:0}}
@keyframes cpShine{from{transform:translateX(-140%) skewX(-20deg)}to{transform:translateX(480%) skewX(-20deg)}}
@keyframes cpStripe{from{background-position:0 0}to{background-position:22px 0}}
@keyframes cpBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(4deg)}}
@keyframes cpPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 55%,transparent)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
@keyframes cpWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@keyframes cpSlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}

/* ---------- background blobs ---------- */
.cp-blob{position:absolute;border-radius:50%;filter:blur(75px);opacity:.4;pointer-events:none;animation:cpFloat 18s ease-in-out infinite;z-index:0}

.cp-in{position:relative;z-index:1;width:min(100%,1360px);margin:0 auto;padding:24px clamp(14px,2vw,28px) 44px}

/* ---------- banner ---------- */
.cp-banner{border-radius:20px;padding:20px 22px;color:#fff;margin-bottom:16px;position:relative;overflow:hidden;
  background:linear-gradient(115deg,#6366F1,#8B5CF6,#EC4899,#F97316,#6366F1);background-size:300% 300%;
  animation:cpRise .6s both,cpShift 14s ease infinite;box-shadow:0 14px 34px rgba(139,92,246,.32)}
.cp-banner::before{content:"";position:absolute;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.14);top:-80px;right:-40px;animation:cpFloat 10s ease-in-out infinite}
.cp-banner::after{content:"";position:absolute;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.1);bottom:-50px;right:26%;animation:cpFloat 13s ease-in-out infinite reverse}
.cp-banner h1{font-size:16px;font-weight:700;display:flex;align-items:center;gap:9px;position:relative;margin:0;letter-spacing:.01em}
.cp-banner h1 .cp-ico{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,.22);backdrop-filter:blur(6px);animation:cpWiggle 3.5s ease-in-out infinite}
.cp-banner p{font-size:11.5px;opacity:.92;margin:6px 0 0;position:relative;max-width:620px;line-height:1.55}

/* ---------- stats ---------- */
.cp-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}
.cp-stat{--c:#6366F1;position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;min-height:72px;padding:14px 16px;border-radius:16px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--c) 14%,white),rgba(255,255,255,.95) 60%);
  border:1px solid color-mix(in srgb,var(--c) 22%,white);
  animation:cpRise .55s cubic-bezier(.2,.8,.2,1) both;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .3s}
.cp-stat::after{content:"";position:absolute;right:-22px;bottom:-22px;width:80px;height:80px;border-radius:50%;background:color-mix(in srgb,var(--c) 14%,transparent);transition:transform .4s}
.cp-stat:hover{transform:translateY(-4px);box-shadow:0 14px 28px color-mix(in srgb,var(--c) 26%,transparent);border-color:var(--c)}
.cp-stat:hover::after{transform:scale(1.5)}
.cp-stat i{position:relative;z-index:1;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;color:#fff;font-style:normal;
  background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 60%,white));box-shadow:0 6px 14px color-mix(in srgb,var(--c) 40%,transparent);transition:transform .3s}
.cp-stat:hover i{transform:rotate(-10deg) scale(1.1)}
.cp-stat div{position:relative;z-index:1}
.cp-stat b{display:block;font-size:20px;font-weight:800;line-height:1;color:var(--c)}
.cp-stat span{font-size:10.5px;color:var(--mut);font-weight:600}

/* ---------- cards ---------- */
.cp-card{position:relative;background:rgba(255,255,255,.82);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.9);border-radius:18px;
  padding:clamp(15px,2vw,22px);margin-bottom:16px;box-shadow:0 8px 28px rgba(99,102,241,.09);
  animation:cpRise .55s .1s cubic-bezier(.2,.8,.2,1) both}
.cp-card::before{content:"";position:absolute;left:18px;right:18px;top:0;height:3px;border-radius:0 0 4px 4px;
  background:linear-gradient(90deg,#6366F1,#EC4899,#F59E0B,#10B981,#0EA5E9,#6366F1);background-size:200% 100%;animation:cpShift 8s linear infinite}
.cp-card h2{font-size:13.5px;font-weight:700;display:flex;align-items:center;gap:8px;margin:0}
.cp-h-ico{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:#fff;background:linear-gradient(135deg,#EC4899,#8B5CF6)}
.cp-sub{font-size:11px;color:var(--mut);margin:4px 0 16px}

/* ---------- form ---------- */
.cp-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 16px;align-items:start}
.cp-form > *{min-width:0;animation:cpSlide .45s both}
.cp-form > *:nth-child(1){animation-delay:.05s}.cp-form > *:nth-child(2){animation-delay:.1s}.cp-form > *:nth-child(3){animation-delay:.15s}
.cp-form > *:nth-child(4){animation-delay:.2s}.cp-form > *:nth-child(5){animation-delay:.25s}.cp-form > *:nth-child(6){animation-delay:.3s}
.cp-form-wide{grid-column:1/-1}
.cp-form .MuiFormControlLabel-root{min-height:44px;margin-left:0}
.cp-form .MuiFormHelperText-root{max-width:100%}

/* ---------- ticket preview ---------- */
.cp-ticket{display:flex;max-width:440px;border-radius:16px;overflow:hidden;filter:drop-shadow(0 10px 18px rgba(99,102,241,.22));animation:cpPop .45s both;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.cp-ticket:hover{transform:rotate(-1.2deg) scale(1.025)}
.cp-t-l{min-width:98px;padding:12px;color:#fff;display:grid;place-items:center;text-align:center;font-weight:800;font-size:18px;position:relative;overflow:hidden;
  background:linear-gradient(135deg,var(--a),var(--b));transition:background .4s}
.cp-t-l::after{content:"";position:absolute;top:0;bottom:0;width:25%;background:rgba(255,255,255,.35);animation:cpShine 3.2s ease-in-out infinite}
.cp-t-l small{display:block;font-size:9.5px;font-weight:600;opacity:.92}
.cp-t-r{flex:1;padding:10px 14px;background:#fff;border:1.5px dashed color-mix(in srgb,var(--a) 45%,white);border-left:none;border-radius:0 16px 16px 0;min-width:0;position:relative}
.cp-t-r::before{content:"";position:absolute;left:-7px;top:50%;width:13px;height:13px;margin-top:-6px;border-radius:50%;background:#F5F3FF}
.cp-t-r code{font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--a)}
.cp-t-r p{font-size:11px;font-weight:600;margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cp-t-r small{font-size:10px;color:var(--mut)}

/* ---------- list head / filters ---------- */
.cp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;flex-wrap:wrap}
.cp-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cp-search{display:flex;align-items:center;gap:6px;padding:0 10px;height:32px;border-radius:100px;background:#fff;border:1px solid var(--line);transition:box-shadow .25s,border-color .25s,width .3s;width:180px}
.cp-search:focus-within{border-color:#8B5CF6;box-shadow:0 0 0 3px rgba(139,92,246,.15);width:220px}
.cp-search input{border:0;outline:0;background:transparent;font:inherit;font-size:11.5px;width:100%;color:var(--ink)}
.cp-chips{display:flex;gap:6px;flex-wrap:wrap}
.cp-chip{--c:#6366F1;border:1px solid color-mix(in srgb,var(--c) 28%,white);background:#fff;color:var(--c);font:inherit;font-size:11px;font-weight:600;
  padding:5px 12px;border-radius:100px;cursor:pointer;transition:transform .2s,background .25s,color .25s,box-shadow .25s}
.cp-chip:hover{transform:translateY(-2px);box-shadow:0 6px 12px color-mix(in srgb,var(--c) 25%,transparent)}
.cp-chip.on{background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 60%,#EC4899));color:#fff;border-color:transparent;box-shadow:0 6px 14px color-mix(in srgb,var(--c) 35%,transparent)}

.cp-pill{--c:#6366F1;display:inline-flex;align-items:center;gap:5px;padding:2px 10px;border-radius:100px;font-size:10.5px;font-weight:700;
  color:var(--c);background:color-mix(in srgb,var(--c) 12%,white);border:1px solid color-mix(in srgb,var(--c) 26%,white);white-space:nowrap}
.cp-dot::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--c);animation:cpPulse 2s infinite}

/* ---------- table ---------- */
.cp-table-wrap{width:100%;overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:4px}
.cp-table{width:100%;min-width:880px;border-collapse:separate;border-spacing:0 6px;font-size:11.5px}
.cp-table th{padding:6px 10px;text-align:left;font-size:10.5px;font-weight:700;color:var(--mut);letter-spacing:.05em;position:sticky;top:0;z-index:1;background:transparent}
.cp-table td{padding:10px;background:#fff;border-top:1px solid #F1F2FB;border-bottom:1px solid #F1F2FB;vertical-align:middle;max-width:280px;transition:background .25s}
.cp-table td:nth-child(2){min-width:170px}
.cp-table td:first-child{border-left:4px solid var(--rc,#6366F1);border-radius:12px 0 0 12px}
.cp-table td:last-child{border-right:1px solid #F1F2FB;border-radius:0 12px 12px 0}
.cp-table tbody tr{animation:cpRise .5s cubic-bezier(.2,.8,.2,1) both;transition:transform .25s,filter .25s}
.cp-table tbody tr:hover{transform:translateX(4px);filter:drop-shadow(0 8px 12px rgba(99,102,241,.16))}
.cp-table tbody tr:hover td{background:linear-gradient(90deg,#F5F3FF,#FFF1F2)}
.cp-code{display:inline-flex;align-items:center;gap:5px;font-family:ui-monospace,monospace;font-weight:800;font-size:11px;padding:4px 9px;border-radius:8px;letter-spacing:.05em;white-space:nowrap;
  color:var(--c,#4F46E5);background:color-mix(in srgb,var(--c,#4F46E5) 10%,white);border:1px dashed color-mix(in srgb,var(--c,#4F46E5) 50%,white);cursor:pointer;transition:transform .2s,box-shadow .2s}
.cp-code:hover{transform:scale(1.06);box-shadow:0 6px 12px color-mix(in srgb,var(--c,#4F46E5) 25%,transparent)}
.cp-code svg{font-size:12px!important;opacity:.6}
.cp-bar{height:6px;border-radius:6px;background:#EEF0FB;overflow:hidden;margin-top:5px;min-width:74px}
.cp-bar span{display:block;height:100%;border-radius:6px;animation:cpBar 1.1s cubic-bezier(.2,.8,.2,1) both;
  background-image:linear-gradient(135deg,rgba(255,255,255,.35) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.35) 50%,rgba(255,255,255,.35) 75%,transparent 75%);
  background-size:22px 22px;animation:cpBar 1.1s cubic-bezier(.2,.8,.2,1) both,cpStripe 1s linear infinite}
.cp-empty{text-align:center;padding:38px 0;color:#A5A9D6}
.cp-empty svg{animation:cpBob 3.5s ease-in-out infinite;color:#C4B5FD}
.cp-note{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;border-radius:14px;background:linear-gradient(90deg,#EEF2FF,#FDF2F8,#FFFBEB);border:1px solid #E0E7FF;animation:cpRise .55s both}
.cp-note p{font-size:11.5px;color:#4B5563;line-height:1.55;margin:0}

.cp button:focus-visible,.cp a:focus-visible{outline:3px solid rgba(99,102,241,.35);outline-offset:2px}

@media(max-width:900px){.cp-in{padding-top:18px}.cp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-form{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){
  .cp-in{padding:14px 11px 30px}
  .cp-banner{padding:16px;border-radius:15px}
  .cp-banner h1{font-size:15px}
  .cp-stats{gap:8px}
  .cp-stat{padding:10px;gap:8px}
  .cp-stat b{font-size:17px}
  .cp-card{padding:14px;border-radius:14px}
  .cp-form{grid-template-columns:1fr;gap:16px}
  .cp-ticket{max-width:none;width:100%}
  .cp-t-l{min-width:82px;padding:9px;font-size:15px}
  .cp-search,.cp-search:focus-within{width:100%}
  .cp-tools{width:100%}
}
@media(prefers-reduced-motion:reduce){.cp *,.cp *::before,.cp *::after{animation:none!important;transition:none!important}}
`;

const btnBase = {
  textTransform: "none", fontWeight: 700, fontSize: 12, borderRadius: "11px",
  height: 38, px: 2.5, position: "relative", overflow: "hidden",
  transition: "transform .2s ease, box-shadow .25s ease",
  "&:hover": { transform: "translateY(-2px)" }, "&:active": { transform: "scale(.97)" },
};

const FILTERS = [
  { key: "all", label: "All", color: C.indigo },
  { key: "active", label: "Active", color: C.emerald },
  { key: "inactive", label: "Inactive", color: C.amber },
  { key: "expired", label: "Expired", color: C.rose },
];

const CouponsPage = () => {
  const context = useContext(MyContext);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const userRole = localStorage.getItem("userRole") || context?.userData?.role || "";
  const isSellerCoupon = GO_MARKET_SHOP_SELLERS.includes(userRole) || userRole === "RESTAURANT_SELLER";
  const endpointBase = isSellerCoupon ? "/api/coupon/seller" : "/api/coupon/admin";

  const fetchCoupons = () => {
    setLoading(true);
    fetchDataFromApi(endpointBase)
      .then((res) => {
        if (res?.success || Array.isArray(res?.data)) setCoupons(res.data || res || []);
        else setCoupons([]);
        setLoading(false);
      })
      .catch(() => {
        context.alertBox("error", "Failed to load coupons");
        setLoading(false);
      });
  };

  useEffect(() => { fetchCoupons(); }, [endpointBase]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return context.alertBox("error", "Coupon code is required");
    if (!form.title.trim()) return context.alertBox("error", "Title is required");
    if (!form.value || Number(form.value) <= 0) return context.alertBox("error", "Value must be greater than 0");

    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount === "" ? 0 : Number(form.minOrderAmount),
      maxDiscountAmount: form.maxDiscountAmount === "" ? null : Number(form.maxDiscountAmount),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      isActive: form.isActive,
      audience: form.audience,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    };

    try {
      const res = editingId
        ? await editData(`${endpointBase}/${editingId}`, payload)
        : await postData(endpointBase, payload);
      setSaving(false);
      if (res?.success || res?.data?.success) {
        context.alertBox("success", editingId ? "Coupon updated successfully!" : "Coupon created successfully!");
        setForm(initialForm);
        setEditingId("");
        fetchCoupons();
      } else {
        context.alertBox("error", res?.message || res?.data?.message || res?.error || "Failed to save coupon");
      }
    } catch (error) {
      setSaving(false);
      context.alertBox("error", error.message || "Network error. Please try again.");
    }
  };

  const onEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscountAmount: coupon.maxDiscountAmount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      isActive: coupon.isActive,
      audience: coupon.audience || "global",
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteData(`${endpointBase}/${id}`);
      context.alertBox("success", "Coupon deleted successfully");
      fetchCoupons();
    } catch {
      context.alertBox("error", "Failed to delete coupon");
    }
  };

  const onCopy = (code) => {
    try {
      navigator.clipboard?.writeText(code);
      context.alertBox("success", `Code ${code} copied`);
    } catch {
      context.alertBox("error", "Could not copy code");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const now = Date.now();
  const isExpired = (c) => c.expiresAt && new Date(c.expiresAt).getTime() < now;

  const stats = [
    { label: "Total coupons", value: coupons.length, color: C.indigo, icon: <ConfirmationNumber fontSize="small" /> },
    { label: "Active", value: coupons.filter((c) => c.isActive && !isExpired(c)).length, color: C.emerald, icon: <CheckCircle fontSize="small" /> },
    { label: "Inactive", value: coupons.filter((c) => !c.isActive).length, color: C.amber, icon: <PauseCircle fontSize="small" /> },
    { label: "Expired", value: coupons.filter(isExpired).length, color: C.rose, icon: <Timelapse fontSize="small" /> },
  ];

  const statusOf = (c) =>
    isExpired(c) ? { label: "Expired", color: C.rose }
      : c.isActive ? { label: "Active", color: C.emerald }
      : { label: "Inactive", color: C.amber };

  const audienceColor = { global: C.indigo, grocery: C.emerald, restaurant: C.pink };

  // rotating accent colour for each table row / code chip
  const rowPalette = [C.indigo, C.pink, C.sky, C.emerald, C.amber, C.violet, C.teal, C.orange];

  const visibleCoupons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coupons.filter((c) => {
      const st = statusOf(c).label.toLowerCase();
      if (filter !== "all" && st !== filter) return false;
      if (!q) return true;
      return [c.code, c.title, c.description].some((v) => (v || "").toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupons, filter, query]);

  // live preview values
  const pv = form.value
    ? form.type === "percentage" ? `${form.value}% OFF` : `₹${form.value} OFF`
    : "— OFF";
  const ticketColors = form.type === "percentage" ? ["#8B5CF6", "#EC4899"] : ["#0EA5E9", "#10B981"];

  const fc = (i) => fieldSx(FIELD_COLORS[i % FIELD_COLORS.length]);

  return (
    <section className="cp">
      <style>{CSS}</style>
      <span className="cp-blob" style={{ width: 300, height: 300, background: "#C4B5FD", top: -90, left: -70 }} />
      <span className="cp-blob" style={{ width: 260, height: 260, background: "#FBCFE8", top: "30%", right: -80, animationDelay: "-6s" }} />
      <span className="cp-blob" style={{ width: 280, height: 280, background: "#A5F3FC", bottom: -90, left: "28%", animationDelay: "-10s" }} />
      <span className="cp-blob" style={{ width: 220, height: 220, background: "#FDE68A", top: "55%", left: -60, animationDelay: "-3s" }} />
      <span className="cp-blob" style={{ width: 200, height: 200, background: "#BBF7D0", bottom: "8%", right: "12%", animationDelay: "-13s" }} />

      <div className="cp-in">
        {/* Banner */}
        <div className="cp-banner">
          <h1>
            <span className="cp-ico"><Tag fontSize="small" /></span>
            {editingId ? "Edit Coupon" : "Coupons"}
          </h1>
          <p>
            {isSellerCoupon
              ? "Create shop-specific coupons for your products. Coupons will only apply to orders from your shop."
              : "Create global coupons or target specific audiences (grocery/restaurant)."}
          </p>
        </div>

        {/* Stats */}
        <div className="cp-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="cp-stat" style={{ "--c": s.color, animationDelay: `${i * 80}ms` }}>
              <i>{s.icon}</i>
              <div><b>{s.value}</b><span>{s.label}</span></div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="cp-card">
          <h2>
            <span className="cp-h-ico"><Tag sx={{ fontSize: 15 }} /></span>
            {editingId ? "Update coupon details" : "Create new coupon"}
          </h2>
          <p className="cp-sub">Fill in the details below — the ticket preview updates as you type.</p>

          <form className="cp-form" onSubmit={onSubmit}>
            <TextField sx={fc(0)} label="Coupon Code *" size="small" value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., SAVE20" helperText="Unique code customers will enter" required />
            <TextField sx={fc(1)} label="Title *" size="small" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., 20% off on orders" helperText="Display name for the coupon" required />
            <TextField sx={fc(2)} label="Description" size="small" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g., Valid on orders above ₹500" helperText="Additional details" />

            <FormControl size="small" required sx={fc(3)}>
              <InputLabel>Discount Type *</InputLabel>
              <Select value={form.type} label="Discount Type *"
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                MenuProps={{ PaperProps: { sx: { borderRadius: "12px", mt: 0.5, boxShadow: "0 12px 30px rgba(99,102,241,.2)" } } }}>
                <MenuItem sx={{ fontSize: 12.5 }} value="percentage">Percentage (%)</MenuItem>
                <MenuItem sx={{ fontSize: 12.5 }} value="fixed">Fixed Amount (₹)</MenuItem>
              </Select>
            </FormControl>

            <TextField sx={fc(4)} label={form.type === "percentage" ? "Discount Percentage *" : "Discount Amount *"}
              type="number" size="small" value={form.value}
              onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
              placeholder={form.type === "percentage" ? "e.g., 20" : "e.g., 100"}
              helperText={form.type === "percentage" ? "Enter percentage (1-100)" : "Enter amount in ₹"}
              required inputProps={{ min: 0, max: form.type === "percentage" ? 100 : undefined }} />

            <TextField sx={fc(5)} label="Minimum Order Amount" type="number" size="small" value={form.minOrderAmount}
              onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
              placeholder="e.g., 500" helperText="Min cart value required (₹)" inputProps={{ min: 0 }} />

            {form.type === "percentage" && (
              <TextField sx={fc(6)} label="Max Discount Cap" type="number" size="small" value={form.maxDiscountAmount}
                onChange={(e) => setForm((p) => ({ ...p, maxDiscountAmount: e.target.value }))}
                placeholder="e.g., 200" helperText="Maximum discount in ₹ (optional)" inputProps={{ min: 0 }} />
            )}

            <TextField sx={fc(7)} label="Usage Limit" type="number" size="small" value={form.usageLimit}
              onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
              placeholder="e.g., 100" helperText="Max total uses (optional)" inputProps={{ min: 0 }} />

            {!isSellerCoupon && (
              <FormControl size="small" sx={fc(8)}>
                <InputLabel>Audience</InputLabel>
                <Select value={form.audience} label="Audience"
                  onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                  MenuProps={{ PaperProps: { sx: { borderRadius: "12px", mt: 0.5, boxShadow: "0 12px 30px rgba(99,102,241,.2)" } } }}>
                  <MenuItem sx={{ fontSize: 12.5 }} value="global">Global (All)</MenuItem>
                  <MenuItem sx={{ fontSize: 12.5 }} value="grocery">Grocery Only</MenuItem>
                  <MenuItem sx={{ fontSize: 12.5 }} value="restaurant">Restaurant Only</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField sx={fc(0)} label="Start Date (Optional)" type="datetime-local" size="small" value={form.startsAt}
              onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
              InputLabelProps={{ shrink: true }} helperText="Leave empty for immediate" />
            <TextField sx={fc(1)} label="Expiry Date (Optional)" type="datetime-local" size="small" value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              InputLabelProps={{ shrink: true }} helperText="Leave empty for no expiry" />

            <div className="flex items-center">
              <FormControlLabel
                control={
                  <Switch checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: C.emerald },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: C.emerald },
                    }} />
                }
                label={<span style={{ fontSize: 12, fontWeight: 600, color: form.isActive ? C.emerald : "#9CA3AF", transition: "color .3s" }}>
                  {form.isActive ? "Active" : "Inactive"}</span>}
              />
            </div>

            {/* Live ticket preview */}
            <div className="cp-form-wide">
              <div className="cp-ticket" style={{ "--a": ticketColors[0], "--b": ticketColors[1] }}>
                <div className="cp-t-l"><div>{pv}<small>{form.type === "percentage" ? "Percentage" : "Flat"}</small></div></div>
                <div className="cp-t-r">
                  <code>{form.code || "YOURCODE"}</code>
                  <p>{form.title || "Coupon title"}</p>
                  <small>Min order ₹{form.minOrderAmount || 0}
                    {form.type === "percentage" && form.maxDiscountAmount ? ` · Max ₹${form.maxDiscountAmount}` : ""}</small>
                </div>
              </div>
            </div>

            <div className="cp-form-wide flex gap-2 pt-1">
              <Button type="submit" variant="contained" disabled={saving} disableElevation
                startIcon={saving && <CircularProgress size={14} color="inherit" />}
                sx={{ ...btnBase, background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", backgroundSize: "200% 200%",
                  "&:hover": { transform: "translateY(-2px)", backgroundPosition: "100% 0", boxShadow: "0 10px 22px rgba(236,72,153,.38)" } }}>
                {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
              {editingId && (
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(initialForm); }}
                  sx={{ ...btnBase, color: "#6B7280", borderColor: "#D9DCF3", background: "#fff",
                    "&:hover": { transform: "translateY(-2px)", borderColor: C.rose, color: C.rose, background: "#FFF1F2" } }}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="cp-card" style={{ animationDelay: ".2s" }}>
          <div className="cp-head">
            <h2>
              <span className="cp-h-ico" style={{ background: "linear-gradient(135deg,#0EA5E9,#10B981)" }}>
                <ConfirmationNumber sx={{ fontSize: 15 }} />
              </span>
              {isSellerCoupon ? "My Coupons" : "All Coupons"}
              <span className="cp-pill" style={{ "--c": C.indigo }}>{coupons.length} total</span>
            </h2>

            <div className="cp-tools">
              <div className="cp-search">
                <Search sx={{ fontSize: 16, color: "#9CA3AF" }} />
                <input placeholder="Search code or title" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="cp-chips">
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" className={`cp-chip${filter === f.key ? " on" : ""}`}
                    style={{ "--c": f.color }} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><CircularProgress size={28} sx={{ color: C.violet }} /></div>
          ) : visibleCoupons.length === 0 ? (
            <div className="cp-empty">
              <Tag style={{ fontSize: 44 }} />
              <p style={{ marginTop: 6, fontWeight: 600, fontSize: 12.5 }}>
                {coupons.length === 0 ? "No coupons created yet" : "No coupons match your filter"}
              </p>
              <p style={{ fontSize: 11 }}>
                {coupons.length === 0 ? "Create your first coupon above" : "Try a different search or status"}
              </p>
            </div>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    {["Code", "Title", "Type", "Value", "Min Order", "Usage", "Expires", "Status", "Actions"].map((h) => (
                      <th key={h} style={h === "Actions" ? { textAlign: "center" } : undefined}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleCoupons.map((coupon, i) => {
                    const st = statusOf(coupon);
                    const rc = rowPalette[i % rowPalette.length];
                    const pct = coupon.usageLimit ? Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100) : 0;
                    const barColor = pct > 85
                      ? "linear-gradient(90deg,#F43F5E,#F97316)"
                      : pct > 50
                        ? "linear-gradient(90deg,#F59E0B,#FACC15)"
                        : "linear-gradient(90deg,#10B981,#14B8A6)";
                    return (
                      <tr key={coupon._id} style={{ "--rc": rc, animationDelay: `${Math.min(i, 12) * 50}ms` }}>
                        <td>
                          <Tooltip title="Click to copy">
                            <span className="cp-code" style={{ "--c": rc }} onClick={() => onCopy(coupon.code)}>
                              {coupon.code}<ContentCopy />
                            </span>
                          </Tooltip>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{coupon.title}</div>
                          {coupon.description && <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>{coupon.description}</div>}
                          {!isSellerCoupon && coupon.audience && (
                            <span className="cp-pill" style={{ "--c": audienceColor[coupon.audience] || C.indigo, marginTop: 4 }}>
                              {coupon.audience}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="cp-pill" style={{ "--c": coupon.type === "percentage" ? C.violet : C.sky }}>
                            {coupon.type === "percentage" ? "Percentage" : "Fixed"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: C.emerald }}>
                          {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                          {coupon.type === "percentage" && coupon.maxDiscountAmount && (
                            <Tooltip title="Max discount cap">
                              <span style={{ fontSize: 10.5, color: "#9CA3AF", marginLeft: 4, fontWeight: 500 }}>(max ₹{coupon.maxDiscountAmount})</span>
                            </Tooltip>
                          )}
                        </td>
                        <td>₹{coupon.minOrderAmount || 0}</td>
                        <td>
                          {coupon.usageLimit ? (
                            <div>
                              <span style={{ fontWeight: 600 }}>{coupon.usedCount || 0}/{coupon.usageLimit}</span>
                              <div className="cp-bar"><span style={{ width: `${pct}%`, backgroundColor: "transparent", backgroundImage: undefined, background: barColor }} /></div>
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>Unlimited</span>
                          )}
                        </td>
                        <td style={{ fontSize: 11 }}>{formatDate(coupon.expiresAt)}</td>
                        <td><span className="cp-pill cp-dot" style={{ "--c": st.color }}>{st.label}</span></td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => onEdit(coupon)}
                                sx={{ color: C.indigo, background: "#EEF2FF", transition: "transform .25s, background .25s, color .25s",
                                  "&:hover": { background: C.indigo, color: "#fff", transform: "scale(1.15) rotate(-8deg)" } }}>
                                <Edit sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => onDelete(coupon._id)}
                                sx={{ color: C.rose, background: "#FFF1F2", transition: "transform .25s, background .25s, color .25s",
                                  "&:hover": { background: C.rose, color: "#fff", transform: "scale(1.15) rotate(8deg)" } }}>
                                <Delete sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isSellerCoupon && (
          <div className="cp-note">
            <Info sx={{ color: C.indigo, fontSize: 18, flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, color: "#312E81", marginBottom: 2 }}>Seller coupon restrictions</p>
              <p>Coupons you create will only apply to orders from your shop/restaurant. Customers shopping from other sellers won't see or be able to use your coupons.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CouponsPage;