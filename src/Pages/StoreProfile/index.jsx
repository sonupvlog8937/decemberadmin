import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { editData, fetchDataFromApi } from "../../utils/api";
import {
  FiPhone, FiMapPin, FiImage, FiFileText, FiInfo, FiSave, FiClock,
  FiExternalLink, FiEdit2, FiX, FiCheckCircle, FiAlertCircle, FiMail,
  FiShield, FiTruck, FiRefreshCw, FiEye, FiZap, FiAward,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineStore, MdOutlineShield, MdOutlineVerified } from "react-icons/md";
import { BsStarFill } from "react-icons/bs";
import { TbTruckDelivery } from "react-icons/tb";

// ─── Colors (har field ka apna colour) ───────────────────────────────────────
const C = {
  orange: "#FF6B2B", green: "#10B981", blue: "#3B82F6", pink: "#EC4899",
  violet: "#8B5CF6", amber: "#F59E0B", cyan: "#06B6D4", lime: "#22C55E",
  indigo: "#6366F1", red: "#EF4444", purple: "#A855F7",
};

// ─── Styles (single block, animations + hover sab yahin) ─────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
.sp, .sp * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; }
.sp { min-height: 100vh; font-size: 12.5px; color: #1E293B; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #FFF7F0 0%, #F3F0FF 35%, #ECFEFF 70%, #FFF1F5 100%);
  background-size: 300% 300%; animation: sp-bg 18s ease infinite; }
.sp::before, .sp::after { content: ""; position: absolute; border-radius: 50%; filter: blur(70px); opacity: .35; pointer-events: none; }
.sp::before { width: 320px; height: 320px; background: #FFB88C; top: -80px; right: -60px; animation: sp-float 9s ease-in-out infinite; }
.sp::after  { width: 280px; height: 280px; background: #A5B4FC; bottom: -80px; left: -60px; animation: sp-float 11s ease-in-out infinite reverse; }
.sp-wrap { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; padding: 24px 16px 56px; }

@keyframes sp-bg { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes sp-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-20px); } }
@keyframes sp-in { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes sp-swap { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes sp-spin { to { transform: rotate(360deg); } }
@keyframes sp-shine { to { background-position: 200% center; } }
@keyframes sp-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.45); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }

.sp-in { animation: sp-in .55s cubic-bezier(.2,.8,.2,1) both; }
.sp-swap { animation: sp-swap .3s ease both; }

.sp-card { background: rgba(255,255,255,.82); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.9);
  border-radius: 16px; box-shadow: 0 4px 18px rgba(99,102,241,.08); transition: transform .3s, box-shadow .3s; }
.sp-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,.14); }

.sp-title { font-size: 18px; font-weight: 800; letter-spacing: -.01em;
  background: linear-gradient(90deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6, #FF6B2B); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: sp-shine 6s linear infinite; }

.sp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; border: 1px solid transparent;
  font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; transition: transform .2s, box-shadow .2s, background .2s; }
.sp-btn:hover { transform: translateY(-1px); }
.sp-btn:active { transform: scale(.97); }
.sp-btn.ghost { background: #fff; color: #475569; border-color: #E2E8F0; }
.sp-btn.ghost:hover { background: #F1F5F9; }
.sp-btn.edit { background: linear-gradient(135deg, #FF6B2B, #EC4899); color: #fff; box-shadow: 0 6px 16px rgba(236,72,153,.28); }
.sp-btn.edit:hover { box-shadow: 0 10px 22px rgba(236,72,153,.38); }
.sp-btn.save { background: linear-gradient(135deg, #10B981, #06B6D4, #3B82F6); background-size: 200% auto; color: #fff;
  padding: 9px 20px; font-size: 13px; box-shadow: 0 6px 16px rgba(6,182,212,.3); }
.sp-btn.save:hover { background-position: right center; box-shadow: 0 10px 22px rgba(6,182,212,.4); }
.sp-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.sp-tabs { position: relative; display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 380px; margin-bottom: 14px;
  padding: 4px; border-radius: 12px; background: rgba(255,255,255,.7); border: 1px solid #E2E8F0; }
.sp-ind { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 9px;
  background: linear-gradient(135deg, #FF6B2B, #EC4899, #8B5CF6); box-shadow: 0 4px 12px rgba(139,92,246,.35);
  transition: transform .4s cubic-bezier(.65,0,.25,1); }
.sp-tab { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 10px;
  border: 0; background: transparent; font-size: 12px; font-weight: 600; color: #64748B; cursor: pointer; transition: color .3s; }
.sp-tab.on { color: #fff; }

.fld { margin-bottom: 14px; --c: ${C.orange}; animation: sp-swap .4s ease both; }
.fld-label { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; font-size: 11px; font-weight: 600; color: #64748B; }
.fld-chip { width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, white); transition: transform .3s; }
.fld:hover .fld-chip { transform: rotate(-8deg) scale(1.12); }
.fld input, .fld textarea { width: 100%; border: 1px solid #E2E8F0; background: #fff; border-radius: 10px; font-size: 12.5px; color: #0F172A;
  outline: none; transition: border-color .25s, box-shadow .25s, background .25s; }
.fld input { height: 40px; padding: 0 12px; }
.fld textarea { padding: 10px 12px; resize: vertical; line-height: 1.55; }
.fld input::placeholder, .fld textarea::placeholder { color: #CBD5E1; }
.fld input:focus, .fld textarea:focus { border-color: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
.fld.err input, .fld.err textarea { border-color: #F87171; background: #FEF2F2; }
.fld-err { display: flex; align-items: center; gap: 4px; margin-top: 5px; font-size: 11px; color: #EF4444; animation: sp-swap .25s ease both; }
.vv, .ve { min-height: 40px; padding: 9px 12px; border-radius: 10px; display: flex; align-items: center; line-height: 1.5; word-break: break-word; }
.vv { background: color-mix(in srgb, var(--c) 7%, white); border: 1px solid color-mix(in srgb, var(--c) 22%, white); color: #0F172A; font-weight: 500; }
.vv.top { align-items: flex-start; }
.ve { border: 1px dashed #E2E8F0; color: #CBD5E1; font-style: italic; background: #FAFAFA; }

.sp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.sp-main { display: grid; grid-template-columns: 250px 1fr; gap: 16px; }
.sp-badge { border-radius: 12px; padding: 11px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
  font-size: 11px; font-weight: 600; line-height: 1.3; transition: transform .3s; }
.sp-badge:hover { transform: translateY(-3px) scale(1.03); }
.sp-wa { width: 34px; height: 34px; border: 0; border-radius: 9px; background: #25D36618; color: #25D366; cursor: pointer;
  display: grid; place-items: center; flex-shrink: 0; transition: transform .2s, background .2s; }
.sp-wa:hover { background: #25D36630; transform: scale(1.12) rotate(-6deg); }
.sp-dot { width: 8px; height: 8px; border-radius: 50%; background: #E2E8F0; flex-shrink: 0; transition: background .4s; }
.sp-dot.on { background: #10B981; animation: sp-pulse 2.2s ease infinite; }
.sp-tip { transition: transform .25s, color .25s; }
.sp-tip:hover { transform: translateX(4px); color: #334155 !important; }
.sp-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.5); border-top-color: #fff; border-radius: 50%; animation: sp-spin .7s linear infinite; }

@media (max-width: 860px) { .sp-main { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .sp-grid2 { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .sp, .sp *, .sp::before, .sp::after { animation: none !important; transition: none !important; } }
`;

// ─── Small pieces ────────────────────────────────────────────────────────────
function Fld({ icon: Icon, label, color, required, error, i = 0, children }) {
  return (
    <div className={`fld${error ? " err" : ""}`} style={{ "--c": color, animationDelay: `${i * 45}ms` }}>
      <label className="fld-label">
        <span className="fld-chip"><Icon size={11} /></span>
        {label}{required && <span style={{ color: C.red }}>*</span>}
      </label>
      {children}
      {error && <p className="fld-err"><FiAlertCircle size={10} /> {error}</p>}
    </div>
  );
}

const Val = ({ v, top }) => v ? <div className={`vv${top ? " top" : ""}`}>{v}</div> : <div className="ve">Not set</div>;

function Ring({ score, color }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 76, height: 76 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="#F1F5F9" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke .4s" }} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 800, color }}>{score}%</span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const StoreProfile = () => {
  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const emptyForm = {
    storeName: "", description: "", location: "", contactNo: "",
    moreInfo: "", image: "", returnPolicy: "", shippingTime: "",
    supportEmail: "", openHours: "", storeStatus: "open",
  };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    fetchDataFromApi("/api/user/seller/store-profile").then((res) => {
      if (res?.success) {
        const p = res?.seller?.storeProfile || {};
        const data = {
          storeName: p.storeName || "", description: p.description || "",
          location: p.location || "", contactNo: p.contactNo || "",
          moreInfo: p.moreInfo || "", image: p.image || "",
          returnPolicy: p.returnPolicy || "", shippingTime: p.shippingTime || "",
          supportEmail: p.supportEmail || "", openHours: p.openHours || "",
          storeStatus: p.storeStatus || "open",
        };
        setForm(data); setEditForm(data);
      }
      setIsFetching(false);
    });
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!editForm.storeName.trim()) e.storeName = "Store name is required";
    if (editForm.contactNo && !/^\d{10}$/.test(editForm.contactNo)) e.contactNo = "Enter a valid 10-digit number";
    if (editForm.supportEmail && !/\S+@\S+\.\S+/.test(editForm.supportEmail)) e.supportEmail = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openEdit = () => { setEditForm({ ...form }); setErrors({}); setIsEditMode(true); };
  const cancelEdit = () => { setEditForm({ ...form }); setErrors({}); setIsEditMode(false); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await editData("/api/user/seller/store-profile", editForm);
      const ok = res?.success === true || res?.error === false;
      if (ok) {
        setForm({ ...editForm }); setIsEditMode(false); setErrors({});
        context?.alertBox("success", res?.message || "Store profile updated successfully!");
      } else {
        context?.alertBox("error", res?.message || (res === undefined ? "Network error." : "Unable to update."));
      }
    } catch { context?.alertBox("error", "Something went wrong."); }
    finally { setIsLoading(false); }
  };

  const sendWhatsApp = () => {
    const number = form.contactNo.replace(/\D/g, "");
    const to = number.length === 10 ? `91${number}` : number;
    const message = encodeURIComponent(
      "🎉 *Zeedaddy की तरफ से खास ऑफर!* 🎉\n\n" +
      "🛍️ अब Zeedaddy पर खरीदारी करें और पाएं *10% की सीधी छूट!* 🔥\n\n" +
      "🎁 *कूपन कोड: ZEEDADDY10*\n\n" +
      "बस खरीदारी करते समय इस कूपन कोड का इस्तेमाल करें और अपनी पसंदीदा चीज़ों पर *10% बचत* करें। 💰\n\n" +
      "⏰ *ऑफर सीमित समय के लिए है!*\n" +
      "आज ही ऑर्डर करें और इस शानदार ऑफर का लाभ उठाएं। ❤️\n\n" +
      "🛒 *Zeedaddy — आपकी खरीदारी, आपकी पसंद!*"
    );
    window.open(`https://wa.me/${to}?text=${message}`, "_blank");
  };

  const completionList = [
    { field: "storeName", label: "Store Name", color: C.orange },
    { field: "description", label: "Description", color: C.violet },
    { field: "location", label: "Location", color: C.blue },
    { field: "contactNo", label: "Phone Number", color: C.green },
    { field: "image", label: "Banner / Logo", color: C.pink },
    { field: "moreInfo", label: "Additional Info", color: C.amber },
  ];
  const filled = completionList.filter(({ field }) => form[field]?.trim()).length;
  const score = Math.round((filled / completionList.length) * 100);
  const scoreColor = score >= 80 ? C.green : score >= 50 ? C.amber : C.red;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: MdOutlineStore },
    { id: "policies", label: "Policies & Support", icon: MdOutlineShield },
  ];

  if (isFetching) {
    return (
      <div className="sp" style={{ display: "grid", placeItems: "center" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ width: 38, height: 38, margin: "0 auto 12px", borderRadius: "50%", border: "3px solid #E2E8F0",
            borderTopColor: C.pink, borderRightColor: C.violet, animation: "sp-spin .8s linear infinite" }} />
          <p style={{ color: "#94A3B8" }}>Loading store profile…</p>
        </div>
      </div>
    );
  }

  const data = isEditMode ? editForm : form;
  const input = (name, placeholder, extra = {}) => (
    <input name={name} value={editForm[name]} onChange={onChange} placeholder={placeholder} {...extra} />
  );
  const area = (name, placeholder, rows) => (
    <textarea name={name} value={editForm[name]} onChange={onChange} rows={rows} placeholder={placeholder} />
  );

  return (
    <div className="sp">
      <style>{CSS}</style>
      <div className="sp-wrap">

        {/* Header */}
        <div className="sp-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: "#fff",
              background: "linear-gradient(135deg, #FF6B2B, #EC4899)", boxShadow: "0 6px 16px rgba(236,72,153,.3)" }}>
              <MdOutlineStore size={19} />
            </div>
            <div>
              <h1 className="sp-title">Store Profile</h1>
              <p style={{ fontSize: 11.5, color: "#94A3B8" }}>Manage your public seller storefront</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {form.storeName && (
              <a href={`/store/${form.storeName}`} target="_blank" rel="noreferrer" className="sp-btn ghost">
                <FiEye size={13} /> View Store <FiExternalLink size={11} />
              </a>
            )}
            {!isEditMode
              ? <button type="button" onClick={openEdit} className="sp-btn edit"><FiEdit2 size={13} /> Edit Profile</button>
              : <button type="button" onClick={cancelEdit} className="sp-btn ghost"><FiX size={13} /> Cancel</button>}
          </div>
        </div>

        {isEditMode && (
          <div className="sp-swap" style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", marginBottom: 16, borderRadius: 12,
            background: "linear-gradient(90deg, rgba(245,158,11,.12), rgba(236,72,153,.08))", border: "1px solid rgba(245,158,11,.25)" }}>
            <FiEdit2 size={13} color={C.amber} />
            <span style={{ color: "#64748B" }}>
              You're in <strong style={{ color: "#D97706" }}>edit mode</strong>. Changes save nahi honge jab tak Save na karo.
            </span>
          </div>
        )}

        <div className="sp-main">

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Preview */}
            <div className="sp-card sp-in" style={{ overflow: "hidden", animationDelay: ".05s" }}>
              <div style={{ height: 84, position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6)", backgroundSize: "300% 300%", animation: "sp-bg 8s ease infinite" }}>
                {data.image && <img src={data.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .35 }}
                  onError={(e) => { e.target.style.display = "none"; }} />}
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 15, background: "#fff", display: "grid", placeItems: "center",
                    overflow: "hidden", border: "2px solid rgba(255,255,255,.9)", boxShadow: "0 6px 18px rgba(0,0,0,.18)" }}>
                    {data.image
                      ? <img src={data.image} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      : <MdOutlineStore size={22} color={C.orange} />}
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 14px 16px", textAlign: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {data.storeName || <span style={{ color: "#CBD5E1", fontStyle: "italic", fontWeight: 400 }}>Your Store</span>}
                </h3>
                {data.location && (
                  <p style={{ fontSize: 11, color: "#94A3B8", display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginBottom: 8 }}>
                    <FiMapPin size={10} color={C.blue} /> {data.location}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((n) => <BsStarFill key={n} size={11} color={C.amber} />)}
                </div>
                {data.storeName && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                    color: "#059669", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.22)" }}>
                    <MdOutlineVerified size={12} /> Verified Seller
                  </span>
                )}
              </div>
            </div>

            {/* Completion */}
            <div className="sp-card sp-in" style={{ padding: 16, animationDelay: ".12s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <Ring score={score} color={scoreColor} />
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 700 }}>Profile Completion</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{filled} of {completionList.length} fields done</p>
                </div>
              </div>
              {completionList.map(({ field, label, color }) => {
                const on = !!form[field]?.trim();
                return (
                  <div key={field} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span className={`sp-dot${on ? " on" : ""}`} style={on ? { background: color } : undefined} />
                    <span style={{ fontSize: 12, color: on ? "#334155" : "#CBD5E1" }}>{label}</span>
                    {on && <FiCheckCircle size={11} color={color} style={{ marginLeft: "auto" }} />}
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="sp-card sp-in" style={{ padding: 16, animationDelay: ".19s",
              background: "linear-gradient(135deg, rgba(255,107,43,.08), rgba(139,92,246,.08))" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.violet, marginBottom: 10 }}>
                <FiZap size={12} /> Seller Tips
              </h3>
              {[
                ["Complete profile gets 3× more visibility", C.orange],
                ["Add a clear store banner image", C.pink],
                ["Mention return policy to build trust", C.blue],
                ["Keep contact info updated", C.green],
              ].map(([tip, color]) => (
                <div key={tip} className="sp-tip" style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 11.5, color: "#64748B", lineHeight: 1.4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5 }} />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="sp-in" style={{ animationDelay: ".1s" }}>
            <form onSubmit={onSubmit}>

              <div className="sp-tabs">
                <span className="sp-ind" style={{ transform: `translateX(${activeTab === "basic" ? 0 : 100}%)` }} />
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setActiveTab(id)} className={`sp-tab${activeTab === id ? " on" : ""}`}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* BASIC */}
              {activeTab === "basic" && (
                <div className="sp-card" key="basic" style={{ padding: 22 }}>
                  <SectionHead icon={MdOutlineStore} color={C.orange} title="Basic Information" sub="Core details visible on your public storefront" />
                  <div className="sp-grid2">
                    <Fld i={0} icon={MdOutlineStore} label="Store Name" color={C.orange} required error={errors.storeName}>
                      {isEditMode ? input("storeName", "e.g. TechZone Official") : <Val v={form.storeName} />}
                    </Fld>

                    <Fld i={1} icon={FiPhone} label="Contact Number" color={C.green} error={errors.contactNo}>
                      {isEditMode
                        ? input("contactNo", "10-digit mobile", { maxLength: 10, inputMode: "numeric" })
                        : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}><Val v={form.contactNo} /></div>
                            {form.contactNo && (
                              <button type="button" className="sp-wa" onClick={sendWhatsApp} title="Send WhatsApp Message">
                                <FaWhatsapp size={17} />
                              </button>
                            )}
                          </div>
                        )}
                    </Fld>

                    <Fld i={2} icon={FiMapPin} label="Store Location" color={C.blue}>
                      {isEditMode ? input("location", "e.g. Mumbai, Maharashtra") : <Val v={form.location} />}
                    </Fld>

                    <Fld i={3} icon={FiImage} label="Banner / Logo URL" color={C.pink}>
                      {isEditMode
                        ? input("image", "https://cdn.example.com/logo.png")
                        : form.image
                          ? <div className="vv"><a href={form.image} target="_blank" rel="noreferrer"
                              style={{ color: C.pink, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                              <FiExternalLink size={12} /> View image</a></div>
                          : <Val v="" />}
                    </Fld>
                  </div>

                  <Fld i={4} icon={FiFileText} label="Store Description" color={C.violet}>
                    {isEditMode ? area("description", "Tell customers what you sell and what makes your store special…", 4) : <Val v={form.description} top />}
                  </Fld>

                  <Fld i={5} icon={FiInfo} label="Additional Information" color={C.amber}>
                    {isEditMode ? area("moreInfo", "Any extra details, highlights, or customer guarantees…", 3) : <Val v={form.moreInfo} top />}
                  </Fld>
                </div>
              )}

              {/* POLICIES */}
              {activeTab === "policies" && (
                <div className="sp-card" key="policies" style={{ padding: 22 }}>
                  <SectionHead icon={MdOutlineShield} color={C.purple} title="Policies & Support" sub="Build customer trust with clear policies" />
                  <div className="sp-grid2">
                    <Fld i={0} icon={FiRefreshCw} label="Return Policy" color={C.cyan}>
                      {isEditMode ? input("returnPolicy", "e.g. 7-day easy return") : <Val v={form.returnPolicy} />}
                    </Fld>
                    <Fld i={1} icon={FiTruck} label="Shipping Time" color={C.lime}>
                      {isEditMode ? input("shippingTime", "e.g. 3-5 business days") : <Val v={form.shippingTime} />}
                    </Fld>
                    <Fld i={2} icon={FiClock} label="Support Hours" color={C.indigo}>
                      {isEditMode ? input("openHours", "e.g. Mon-Sat, 10AM – 6PM") : <Val v={form.openHours} />}
                    </Fld>
                    <Fld i={3} icon={FiMail} label="Support Email" color={C.red} error={errors.supportEmail}>
                      {isEditMode ? input("supportEmail", "support@yourstore.com") : <Val v={form.supportEmail} />}
                    </Fld>
                  </div>

                  <Fld i={4} icon={FiShield} label="Policies & Guarantees" color={C.purple}>
                    {isEditMode ? area("moreInfo", "Describe warranty, policies, or service guarantees in detail…", 5) : <Val v={form.moreInfo} top />}
                  </Fld>

                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", margin: "6px 0 10px" }}>Trust badges preview</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
                    {[
                      { icon: <FiRefreshCw size={15} />, label: data.returnPolicy || "Easy Returns", color: "#2563EB", bg: "rgba(37,99,235,.08)" },
                      { icon: <TbTruckDelivery size={16} />, label: data.shippingTime || "Fast Shipping", color: "#059669", bg: "rgba(5,150,105,.08)" },
                      { icon: <MdOutlineShield size={15} />, label: "Verified Seller", color: "#7C3AED", bg: "rgba(124,58,237,.08)" },
                      { icon: <FiAward size={15} />, label: "Quality Assured", color: "#D97706", bg: "rgba(217,119,6,.08)" },
                    ].map((b) => (
                      <div key={b.label} className="sp-badge" style={{ background: b.bg, color: b.color, border: `1px solid ${b.color}26` }}>
                        {b.icon}<span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 10 }}>↑ Ye badges aapke public store page par dikhenge</p>
                </div>
              )}

              {/* Action bar */}
              <div className="sp-card" style={{ marginTop: 14, padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: isEditMode ? "#D97706" : "#94A3B8" }}>
                  {isEditMode ? <><FiEdit2 size={12} /> Editing — unsaved changes</> : <><FiEye size={12} /> Viewing saved profile</>}
                </div>
                {isEditMode ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={cancelEdit} className="sp-btn ghost"><FiX size={13} /> Discard</button>
                    <button type="submit" disabled={isLoading} className="sp-btn save">
                      {isLoading ? <><span className="sp-spinner" /> Saving…</> : <><FiSave size={13} /> Save Changes</>}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={openEdit} className="sp-btn edit"><FiEdit2 size={13} /> Edit Profile</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

function SectionHead({ icon: Icon, color, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #F1F5F9" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", color,
        background: `color-mix(in srgb, ${color} 14%, white)` }}>
        <Icon size={16} />
      </div>
      <div>
        <h2 style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</h2>
        <p style={{ fontSize: 11.5, color: "#94A3B8" }}>{sub}</p>
      </div>
    </div>
  );
}

export default StoreProfile;