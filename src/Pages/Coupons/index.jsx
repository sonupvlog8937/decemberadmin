import React, { useContext, useEffect, useState } from "react";
import {
  Button, CircularProgress, TextField, Select, MenuItem, FormControl,
  InputLabel, Switch, FormControlLabel, IconButton, Tooltip,
} from "@mui/material";
import { Edit, Delete, Tag, Info, ConfirmationNumber, CheckCircle, PauseCircle, Timelapse } from "@mui/icons-material";
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
  amber: "#F59E0B", violet: "#8B5CF6", rose: "#F43F5E",
};

// Shared small, rounded, colourful input style
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontSize: 12.5, background: "#FAFAFF",
    transition: "box-shadow .2s, background .2s",
    "& fieldset": { borderColor: "#E7E9F8" },
    "&:hover fieldset": { borderColor: "#A5B4FC" },
    "&.Mui-focused": { background: "#fff", boxShadow: "0 0 0 3px rgba(139,92,246,.15)" },
    "&.Mui-focused fieldset": { borderColor: C.violet, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { fontSize: 12.5 },
  "& .MuiInputLabel-root.Mui-focused": { color: C.violet },
  "& .MuiFormHelperText-root": { fontSize: 10.5, marginLeft: "4px", marginTop: "3px" },
};

const CSS = `
.cp{--ink:#1E1B4B;--mut:#6B7280;--line:#E7E9F8;font-size:12.5px;color:var(--ink);position:relative;overflow:hidden;
  background:linear-gradient(160deg,#F5F3FF 0%,#EFF6FF 45%,#FFF1F2 100%);min-height:100vh}
.cp *{box-sizing:border-box}
.cp-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.38;pointer-events:none;animation:cpFloat 16s ease-in-out infinite}
.cp-in{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:20px 16px 50px}

@keyframes cpFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(22px,-26px) scale(1.08)}}
@keyframes cpRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes cpPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
@keyframes cpShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cpBar{from{width:0}}
@keyframes cpShine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(420%) skewX(-20deg)}}

.cp-banner{border-radius:18px;padding:18px 20px;color:#fff;margin-bottom:14px;position:relative;overflow:hidden;
  background:linear-gradient(120deg,#6366F1,#8B5CF6,#EC4899,#F97316);background-size:300% 300%;animation:cpRise .5s both,cpShift 12s ease infinite;
  box-shadow:0 12px 30px rgba(139,92,246,.3)}
.cp-banner::before{content:"";position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.12);top:-70px;right:-40px}
.cp-banner h1{font-size:17px;font-weight:700;display:flex;align-items:center;gap:8px;position:relative}
.cp-banner p{font-size:11.5px;opacity:.9;margin-top:4px;position:relative;max-width:620px}

.cp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px}
.cp-stat{--c:#6366F1;display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.88);
  border:1px solid var(--line);animation:cpRise .5s cubic-bezier(.2,.8,.2,1) both;transition:transform .25s,box-shadow .25s,border-color .25s}
.cp-stat:hover{transform:translateY(-3px);box-shadow:0 12px 26px color-mix(in srgb,var(--c) 22%,transparent);border-color:var(--c)}
.cp-stat i{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:var(--c);font-style:normal;
  background:color-mix(in srgb,var(--c) 13%,white);transition:transform .25s}
.cp-stat:hover i{transform:rotate(-8deg) scale(1.08)}
.cp-stat b{display:block;font-size:19px;font-weight:800;line-height:1}
.cp-stat span{font-size:10.5px;color:var(--mut);font-weight:600}

.cp-card{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:16px;padding:18px;margin-bottom:14px;
  box-shadow:0 2px 10px rgba(99,102,241,.06);animation:cpRise .5s .1s cubic-bezier(.2,.8,.2,1) both}
.cp-card h2{font-size:14px;font-weight:700;display:flex;align-items:center;gap:7px}
.cp-sub{font-size:11px;color:var(--mut);margin:3px 0 14px}

/* live ticket preview */
.cp-ticket{display:flex;max-width:400px;border-radius:14px;overflow:hidden;filter:drop-shadow(0 8px 14px rgba(99,102,241,.18));animation:cpPop .4s both;transition:transform .3s}
.cp-ticket:hover{transform:rotate(-1deg) scale(1.02)}
.cp-t-l{min-width:96px;padding:12px;color:#fff;display:grid;place-items:center;text-align:center;font-weight:800;font-size:19px;position:relative;overflow:hidden;
  background:linear-gradient(135deg,var(--a),var(--b))}
.cp-t-l::after{content:"";position:absolute;top:0;bottom:0;width:25%;background:rgba(255,255,255,.3);animation:cpShine 3.2s ease-in-out infinite}
.cp-t-l small{display:block;font-size:9.5px;font-weight:600;opacity:.9}
.cp-t-r{flex:1;padding:10px 14px;background:#fff;border:1.5px dashed #C7D2FE;border-left:none;border-radius:0 14px 14px 0;min-width:0}
.cp-t-r code{font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--a)}
.cp-t-r p{font-size:11px;font-weight:600;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cp-t-r small{font-size:10px;color:var(--mut)}

/* table */
.cp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cp-pill{--c:#6366F1;display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:100px;font-size:10.5px;font-weight:700;
  color:var(--c);background:color-mix(in srgb,var(--c) 12%,white);border:1px solid color-mix(in srgb,var(--c) 24%,white);white-space:nowrap}
.cp-table{width:100%;border-collapse:separate;border-spacing:0 6px;font-size:12px}
.cp-table th{padding:6px 10px;text-align:left;font-size:10.5px;font-weight:700;color:var(--mut);letter-spacing:.05em}
.cp-table td{padding:10px;background:#fff;border-top:1px solid #F1F2FB;border-bottom:1px solid #F1F2FB;vertical-align:middle;transition:background .2s}
.cp-table td:first-child{border-left:1px solid #F1F2FB;border-radius:12px 0 0 12px}
.cp-table td:last-child{border-right:1px solid #F1F2FB;border-radius:0 12px 12px 0}
.cp-table tbody tr{animation:cpRise .45s cubic-bezier(.2,.8,.2,1) both;transition:transform .2s,filter .2s}
.cp-table tbody tr:hover{transform:translateX(3px);filter:drop-shadow(0 6px 10px rgba(99,102,241,.12))}
.cp-table tbody tr:hover td{background:linear-gradient(90deg,#F5F3FF,#FFF1F2)}
.cp-code{font-family:ui-monospace,monospace;font-weight:800;font-size:11.5px;padding:3px 9px;border-radius:8px;letter-spacing:.05em;
  color:#4F46E5;background:#EEF2FF;border:1px dashed #A5B4FC}
.cp-bar{height:5px;border-radius:5px;background:#EEF0FB;overflow:hidden;margin-top:4px;min-width:70px}
.cp-bar span{display:block;height:100%;border-radius:5px;animation:cpBar 1s cubic-bezier(.2,.8,.2,1) both}
.cp-empty{text-align:center;padding:36px 0;color:#B8BCDA}
.cp-note{display:flex;gap:10px;padding:12px 14px;border-radius:12px;background:linear-gradient(90deg,#EEF2FF,#FDF2F8);border:1px solid #E0E7FF;animation:cpRise .5s both}
.cp-note p{font-size:11.5px;color:#4B5563;line-height:1.55}
.cp{width:100%;min-width:0;isolation:isolate}
.cp-in{width:min(100%,1360px);padding:24px clamp(14px,2vw,28px) 44px}
.cp-banner{background:linear-gradient(115deg,#6256e8,#8154e8 66%,#a261e9);background-size:auto;animation:cpRise .5s both;box-shadow:0 10px 24px rgba(99,102,241,.2)}
.cp-stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.cp-stat{min-height:70px;padding:14px 16px}
.cp-card{padding:clamp(15px,2vw,22px);box-shadow:0 5px 18px rgba(30,27,75,.045)}
.cp-card h2{margin:0}
.cp-sub{margin-bottom:16px}
.cp form{align-items:start}
.cp form > *{min-width:0}
.cp-ticket{max-width:440px}
.cp-head{gap:10px;flex-wrap:wrap}
.cp-table-wrap{width:100%;overflow-x:auto;overscroll-behavior-x:contain}
.cp-table{min-width:870px;border-spacing:0 5px}
.cp-table th{position:sticky;top:0;background:#fff;z-index:1}
.cp-table td{max-width:280px}
.cp-table td:nth-child(2){min-width:170px}
.cp-code{white-space:nowrap}
.cp-note{align-items:flex-start}
.cp button:focus-visible,.cp a:focus-visible{outline:3px solid rgba(99,102,241,.35);outline-offset:2px}
@media(max-width:900px){.cp-in{padding-top:18px}.cp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){
  .cp-in{padding:14px 11px 30px}
  .cp-banner{padding:16px;border-radius:14px}
  .cp-banner h1{font-size:16px}
  .cp-stats{gap:8px}
  .cp-stat{padding:10px;gap:8px}
  .cp-stat b{font-size:17px}
  .cp-card{padding:14px;border-radius:13px}
  .cp-ticket{max-width:none;width:100%}
  .cp-t-l{min-width:82px;padding:9px;font-size:16px}
  .cp-table{min-width:850px}
}
@media(prefers-reduced-motion:reduce){.cp *,.cp *::before,.cp *::after{animation:none!important;transition:none!important}}
`;

const btnBase = {
  textTransform: "none", fontWeight: 700, fontSize: 12.5, borderRadius: "10px",
  height: 38, px: 2.5, transition: "transform .18s, box-shadow .18s",
  "&:hover": { transform: "translateY(-1px)" }, "&:active": { transform: "scale(.97)" },
};

const CouponsPage = () => {
  const context = useContext(MyContext);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // live preview values
  const pv = form.value
    ? form.type === "percentage" ? `${form.value}% OFF` : `₹${form.value} OFF`
    : "— OFF";
  const ticketColors = form.type === "percentage" ? ["#8B5CF6", "#EC4899"] : ["#0EA5E9", "#6366F1"];

  return (
    <section className="cp">
      <style>{CSS}</style>
      <span className="cp-blob" style={{ width: 300, height: 300, background: "#C4B5FD", top: -90, left: -70 }} />
      <span className="cp-blob" style={{ width: 260, height: 260, background: "#FBCFE8", top: "35%", right: -80, animationDelay: "-6s" }} />
      <span className="cp-blob" style={{ width: 280, height: 280, background: "#A5F3FC", bottom: -90, left: "30%", animationDelay: "-10s" }} />

      <div className="cp-in">
        {/* Banner */}
        <div className="cp-banner">
          <h1><Tag fontSize="small" /> {editingId ? "Edit Coupon" : "Coupons"}</h1>
          <p>
            {isSellerCoupon
              ? "Create shop-specific coupons for your products. Coupons will only apply to orders from your shop."
              : "Create global coupons or target specific audiences (grocery/restaurant)."}
          </p>
        </div>

        {/* Stats */}
        <div className="cp-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="cp-stat" style={{ "--c": s.color, animationDelay: `${i * 70}ms` }}>
              <i>{s.icon}</i>
              <div><b>{s.value}</b><span>{s.label}</span></div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="cp-card">
          <h2><span style={{ color: C.pink, display: "flex" }}><Tag fontSize="small" /></span>{editingId ? "Update coupon details" : "Create new coupon"}</h2>
          <p className="cp-sub">Fill in the details below — the ticket preview updates as you type.</p>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={onSubmit}>
            <TextField sx={fieldSx} label="Coupon Code *" size="small" value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., SAVE20" helperText="Unique code customers will enter" required />
            <TextField sx={fieldSx} label="Title *" size="small" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., 20% off on orders" helperText="Display name for the coupon" required />
            <TextField sx={fieldSx} label="Description" size="small" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g., Valid on orders above ₹500" helperText="Additional details" />

            <FormControl size="small" required sx={fieldSx}>
              <InputLabel>Discount Type *</InputLabel>
              <Select value={form.type} label="Discount Type *"
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                MenuProps={{ PaperProps: { sx: { borderRadius: "12px", mt: 0.5 } } }}>
                <MenuItem sx={{ fontSize: 12.5 }} value="percentage">Percentage (%)</MenuItem>
                <MenuItem sx={{ fontSize: 12.5 }} value="fixed">Fixed Amount (₹)</MenuItem>
              </Select>
            </FormControl>

            <TextField sx={fieldSx} label={form.type === "percentage" ? "Discount Percentage *" : "Discount Amount *"}
              type="number" size="small" value={form.value}
              onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
              placeholder={form.type === "percentage" ? "e.g., 20" : "e.g., 100"}
              helperText={form.type === "percentage" ? "Enter percentage (1-100)" : "Enter amount in ₹"}
              required inputProps={{ min: 0, max: form.type === "percentage" ? 100 : undefined }} />

            <TextField sx={fieldSx} label="Minimum Order Amount" type="number" size="small" value={form.minOrderAmount}
              onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
              placeholder="e.g., 500" helperText="Min cart value required (₹)" inputProps={{ min: 0 }} />

            {form.type === "percentage" && (
              <TextField sx={fieldSx} label="Max Discount Cap" type="number" size="small" value={form.maxDiscountAmount}
                onChange={(e) => setForm((p) => ({ ...p, maxDiscountAmount: e.target.value }))}
                placeholder="e.g., 200" helperText="Maximum discount in ₹ (optional)" inputProps={{ min: 0 }} />
            )}

            <TextField sx={fieldSx} label="Usage Limit" type="number" size="small" value={form.usageLimit}
              onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
              placeholder="e.g., 100" helperText="Max total uses (optional)" inputProps={{ min: 0 }} />

            {!isSellerCoupon && (
              <FormControl size="small" sx={fieldSx}>
                <InputLabel>Audience</InputLabel>
                <Select value={form.audience} label="Audience"
                  onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                  MenuProps={{ PaperProps: { sx: { borderRadius: "12px", mt: 0.5 } } }}>
                  <MenuItem sx={{ fontSize: 12.5 }} value="global">Global (All)</MenuItem>
                  <MenuItem sx={{ fontSize: 12.5 }} value="grocery">Grocery Only</MenuItem>
                  <MenuItem sx={{ fontSize: 12.5 }} value="restaurant">Restaurant Only</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField sx={fieldSx} label="Start Date (Optional)" type="datetime-local" size="small" value={form.startsAt}
              onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
              InputLabelProps={{ shrink: true }} helperText="Leave empty for immediate" />
            <TextField sx={fieldSx} label="Expiry Date (Optional)" type="datetime-local" size="small" value={form.expiresAt}
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
                label={<span style={{ fontSize: 12.5, fontWeight: 600, color: form.isActive ? C.emerald : "#9CA3AF" }}>
                  {form.isActive ? "Active" : "Inactive"}</span>}
              />
            </div>

            {/* Live ticket preview */}
            <div className="md:col-span-3">
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

            <div className="md:col-span-3 flex gap-2 pt-1">
              <Button type="submit" variant="contained" disabled={saving} disableElevation
                startIcon={saving && <CircularProgress size={14} color="inherit" />}
                sx={{ ...btnBase, background: "linear-gradient(135deg,#6366F1,#EC4899)",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 8px 18px rgba(236,72,153,.35)" } }}>
                {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
              {editingId && (
                <Button variant="outlined" onClick={() => { setEditingId(""); setForm(initialForm); }}
                  sx={{ ...btnBase, color: "#6B7280", borderColor: "#E7E9F8" }}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="cp-card" style={{ animationDelay: ".2s" }}>
          <div className="cp-head">
            <h2>{isSellerCoupon ? "My Coupons" : "All Coupons"}</h2>
            <span className="cp-pill" style={{ "--c": C.indigo }}>{coupons.length} total</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><CircularProgress size={28} sx={{ color: C.violet }} /></div>
          ) : coupons.length === 0 ? (
            <div className="cp-empty">
              <Tag style={{ fontSize: 42 }} />
              <p style={{ marginTop: 6, fontWeight: 600 }}>No coupons created yet</p>
              <p style={{ fontSize: 11 }}>Create your first coupon above</p>
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
                  {coupons.map((coupon, i) => {
                    const st = statusOf(coupon);
                    const pct = coupon.usageLimit ? Math.min(100, ((coupon.usedCount || 0) / coupon.usageLimit) * 100) : 0;
                    const barColor = pct > 85 ? C.rose : pct > 50 ? C.amber : C.emerald;
                    return (
                      <tr key={coupon._id} style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
                        <td><span className="cp-code">{coupon.code}</span></td>
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
                              <div className="cp-bar"><span style={{ width: `${pct}%`, background: barColor }} /></div>
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>Unlimited</span>
                          )}
                        </td>
                        <td style={{ fontSize: 11 }}>{formatDate(coupon.expiresAt)}</td>
                        <td><span className="cp-pill" style={{ "--c": st.color }}>{st.label}</span></td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => onEdit(coupon)}
                                sx={{ color: C.indigo, background: "#EEF2FF", transition: "transform .2s",
                                  "&:hover": { background: "#E0E7FF", transform: "scale(1.12)" } }}>
                                <Edit sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => onDelete(coupon._id)}
                                sx={{ color: C.rose, background: "#FFF1F2", transition: "transform .2s",
                                  "&:hover": { background: "#FFE4E6", transform: "scale(1.12)" } }}>
                                <Delete sx={{ fontSize: 16 }} />
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