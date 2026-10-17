import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FiUser, FiMail, FiPhone, FiLock, FiKey, FiShield, FiEye, FiEyeOff, FiImage, FiMapPin, FiFileText, FiInfo, FiSave, FiCheck } from "react-icons/fi";
import { MdOutlineStore } from "react-icons/md";
import CircularProgress from "@mui/material/CircularProgress";
import { editData, fetchDataFromApi, postData, uploadImage } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { Collapse } from "react-collapse";

const SELLER_ROLES = ["SELLER", "GROCERY_SELLER", "RESTAURANT_SELLER", "FASHION_SELLER", "ELECTRONICS_SELLER", "MEDICAL_SELLER", "BEAUTY_SELLER", "HOME_KITCHEN_SELLER", "GIFTS_TOYS_SELLER", "BOOKS_STATIONERY_SELLER", "JEWELLERY_SELLER", "HARDWARE_SELLER", "AUTOMOBILE_SELLER"];
const isSellerRole = (role) => SELLER_ROLES.includes(role);

const K = {
  orange: "#FF6B2B", green: "#10B981", blue: "#3B82F6", pink: "#EC4899", violet: "#8B5CF6",
  amber: "#F59E0B", cyan: "#06B6D4", indigo: "#6366F1", red: "#EF4444", purple: "#A855F7",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
.pf, .pf * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; }
.pf { font-size: 12.5px; color: #1E293B; padding: 4px 0 40px; max-width: 880px; }

@keyframes pf-in { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes pf-grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes pf-spin { to { transform: rotate(360deg); } }
@keyframes pf-ring { to { transform: rotate(360deg); } }
.pf-in { animation: pf-in .55s cubic-bezier(.2,.8,.2,1) both; }

.pf-card { background: #fff; border: 1px solid #EEF0F6; border-radius: 18px; margin: 10px 0; overflow: hidden;
  box-shadow: 0 4px 18px rgba(99,102,241,.07); transition: transform .3s, box-shadow .3s; }
.pf-card:hover { box-shadow: 0 10px 28px rgba(99,102,241,.13); }
.pf-body { padding: 18px 22px 22px; }

.pf-banner { height: 92px; background: linear-gradient(120deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6); background-size: 300% 300%; animation: pf-grad 10s ease infinite; position: relative; }
.pf-banner::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 85% 20%, rgba(255,255,255,.35), transparent 45%); }
.pf-head { display: flex; align-items: flex-end; gap: 14px; padding: 0 22px; margin-top: -42px; position: relative; z-index: 2; flex-wrap: wrap; }
.pf-avatar { position: relative; width: 92px; height: 92px; border-radius: 50%; padding: 3px; flex-shrink: 0;
  background: conic-gradient(from 0deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6, #10B981, #FF6B2B); }
.pf-avatar:hover { animation: pf-ring 4s linear infinite; }
.pf-avatar-in { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #E2E8F0; display: grid; place-items: center; position: relative; border: 3px solid #fff; }
.pf-avatar-in img { width: 100%; height: 100%; object-fit: cover; }
.pf-over { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(15,23,42,.55); color: #fff; opacity: 0; transition: opacity .25s; cursor: pointer; }
.pf-avatar:hover .pf-over { opacity: 1; }
.pf-over input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.pf-name { font-size: 16px; font-weight: 700; line-height: 1.2; }
.pf-mail { font-size: 11.5px; color: #94A3B8; margin-top: 2px; }
.pf-role { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; padding: 3px 10px; border-radius: 99px; font-size: 10.5px; font-weight: 600;
  color: #7C3AED; background: rgba(139,92,246,.1); border: 1px solid rgba(139,92,246,.22); }

.pf-h2 { display: flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.pf-h2 span { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, white); }

.pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.pf-full { grid-column: 1 / -1; }
.fld { --c: ${K.orange}; margin-bottom: 14px; }
.fld-label { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; font-size: 11px; font-weight: 600; color: #64748B; }
.fld-chip { width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, white); transition: transform .3s; }
.fld:hover .fld-chip { transform: rotate(-8deg) scale(1.12); }
.fld input:not(.react-international-phone-input), .fld textarea { width: 100%; border: 1px solid #E2E8F0; background: #fff; border-radius: 10px; font-size: 12.5px; color: #0F172A; outline: none;
  transition: border-color .25s, box-shadow .25s, background .25s; }
.fld input:not(.react-international-phone-input) { height: 40px; padding: 0 12px; }
.fld textarea { padding: 10px 12px; resize: vertical; line-height: 1.55; }
.fld input::placeholder, .fld textarea::placeholder { color: #CBD5E1; }
.fld input:focus:not(.react-international-phone-input), .fld textarea:focus { border-color: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
.fld input:disabled { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }
.fld .react-international-phone-input-container { width: 100%; --react-international-phone-height: 40px; --react-international-phone-border-radius: 10px;
  --react-international-phone-font-size: 12.5px; --react-international-phone-border-color: #E2E8F0; }
.fld .react-international-phone-input-container:focus-within .react-international-phone-input,
.fld .react-international-phone-input-container:focus-within .react-international-phone-country-selector-button { border-color: var(--c); }
.fld .react-international-phone-input { flex: 1; width: 100%; }
.pf-pw { position: relative; }
.pf-pw button { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: 0; background: transparent; color: #94A3B8; cursor: pointer; padding: 4px; display: grid; place-items: center; transition: color .2s; }
.pf-pw button:hover { color: var(--c); }
.pf-pw input { padding-right: 34px !important; }

.pf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border: 0; border-radius: 11px; font-size: 12.5px; font-weight: 600; color: #fff; cursor: pointer;
  background-size: 200% auto; transition: transform .2s, box-shadow .25s, background-position .4s; }
.pf-btn:hover:not(:disabled) { transform: translateY(-1px); background-position: right center; }
.pf-btn:active:not(:disabled) { transform: scale(.98); }
.pf-btn:disabled { opacity: .55; cursor: not-allowed; }
.pf-btn.full { width: 100%; }
.pf-btn.blue { background-image: linear-gradient(135deg, #3B82F6, #8B5CF6, #3B82F6); box-shadow: 0 8px 18px rgba(99,102,241,.3); }
.pf-btn.orange { background-image: linear-gradient(135deg, #FF6B2B, #EC4899, #FF6B2B); box-shadow: 0 8px 18px rgba(236,72,153,.28); }
.pf-btn.green { background-image: linear-gradient(135deg, #10B981, #06B6D4, #10B981); box-shadow: 0 8px 18px rgba(6,182,212,.28); }
.pf-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; margin-left: auto;
  color: #6366F1; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.2); transition: background .25s, transform .2s; }
.pf-link:hover { background: rgba(99,102,241,.15); transform: translateY(-1px); }
.pf-link.on { color: #fff; background: linear-gradient(135deg, #6366F1, #8B5CF6); border-color: transparent; }

.pf .ReactCollapse--collapse { transition: height .4s cubic-bezier(.65,0,.25,1); }
@media (max-width: 600px) { .pf-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .pf, .pf * { animation: none !important; transition: none !important; } }
`;

function Fld({ icon: Icon, label, color, className = "", children }) {
  return (
    <div className={`fld ${className}`} style={{ "--c": color }}>
      <label className="fld-label"><span className="fld-chip"><Icon size={11} /></span>{label}</label>
      {children}
    </div>
  );
}

function PwField({ name, value, onChange, placeholder, disabled, label, color }) {
  const [show, setShow] = useState(false);
  return (
    <Fld icon={FiLock} label={label} color={color}>
      <div className="pf-pw">
        <input type={show ? "text" : "password"} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} disabled={disabled} autoComplete="off" />
        <button type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}>{show ? <FiEyeOff size={14} /> : <FiEye size={14} />}</button>
      </div>
    </Fld>
  );
}

const Profile = () => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [userId, setUserId] = useState("");
  const [isChangePasswordFormShow, setisChangePasswordFormShow] = useState(false);
  const [phone, setPhone] = useState("");

  const [formFields, setFormsFields] = useState({ name: "", email: "", mobile: "" });
  const [changePassword, setChangePassword] = useState({ email: "", oldPassword: "", newPassword: "", confirmPassword: "" });

  const context = useContext(MyContext);
  const history = useNavigate();

  const [storeProfile, setStoreProfile] = useState({ storeName: "", description: "", image: "", location: "", contactNo: "", moreInfo: "" });
  const [savingStoreProfile, setSavingStoreProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token === null) history("/login");
  }, [context?.isLogin]);

  useEffect(() => {
    const u = context?.userData;
    if (u?._id !== "" && u?._id !== undefined) {
      setUserId(u._id);
      setFormsFields({ name: u.name || "", email: u.email || "", mobile: u.mobile || "" });
      setPhone(u.mobile ? String(u.mobile) : "");
      setChangePassword((p) => ({ ...p, email: u.email || "" }));
    }
    if (u?.avatar !== "" && u?.avatar !== undefined) setPreviews([u.avatar]);
  }, [context?.userData]);

  // Profile aur password ke handlers alag, taaki ek doosre ko overwrite na kare
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormsFields((p) => ({ ...p, [name]: value }));
  };
  const onChangePw = (e) => {
    const { name, value } = e.target;
    setChangePassword((p) => ({ ...p, [name]: value }));
  };

  const valideValue = Object.values(formFields).every((el) => el);
  const valideValue2 = !!(changePassword.oldPassword && changePassword.newPassword && changePassword.confirmPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formFields.name) return context.alertBox("error", "Please enter full name");
    if (!formFields.email) return context.alertBox("error", "Please enter email id");
    if (!formFields.mobile) return context.alertBox("error", "Please enter mobile number");

    setIsLoading(true);
    editData(`/api/user/${userId}`, formFields, { withCredentials: true })
      .then((res) => {
        if (res?.error !== true) context.alertBox("success", res?.data?.message);
        else context.alertBox("error", res?.data?.message);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmitChangePassword = (e) => {
    e.preventDefault();
    if (!changePassword.oldPassword) return context.alertBox("error", "Please enter old password");
    if (!changePassword.newPassword) return context.alertBox("error", "Please enter new password");
    if (!changePassword.confirmPassword) return context.alertBox("error", "Please enter confirm password");
    if (changePassword.confirmPassword !== changePassword.newPassword) return context.alertBox("error", "password and confirm password not match");

    setIsLoading2(true);
    postData(`/api/user/reset-password`, changePassword, { withCredentials: true })
      .then((res) => {
        if (res?.error !== true) {
          context.alertBox("success", res?.message);
          setChangePassword((p) => ({ ...p, oldPassword: "", newPassword: "", confirmPassword: "" }));
        } else {
          context.alertBox("error", res?.message);
        }
      })
      .finally(() => setIsLoading2(false));
  };

  const onChangeFile = async (e) => {
    try {
      const files = e.target.files;
      const formdata = new FormData();
      for (let i = 0; i < files.length; i++) {
        const t = files[i]?.type;
        if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(t)) {
          formdata.append("avatar", files[i]);
        } else {
          context.alertBox("error", "Please select a valid JPG , PNG or webp image file.");
          return false;
        }
      }
      setPreviews([]);
      setUploading(true);
      uploadImage("/api/user/user-avatar", formdata).then((res) => {
        setUploading(false);
        setPreviews([res?.data?.avtar]);
      });
    } catch (error) {
      console.log(error);
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isSellerRole(context?.userData?.role)) {
      fetchDataFromApi("/api/user/seller/store-profile").then((res) => {
        if (res?.success && res?.seller?.storeProfile) setStoreProfile((prev) => ({ ...prev, ...res.seller.storeProfile }));
      });
    }
  }, [context?.userData?.role]);

  const submitStoreProfile = (e) => {
    e.preventDefault();
    setSavingStoreProfile(true);
    editData("/api/user/seller/store-profile", storeProfile)
      .then((res) => {
        if (res?.data?.success) context.alertBox("success", res?.data?.message || "Store profile updated");
        else context.alertBox("error", res?.data?.message || "Unable to update store profile");
      })
      .finally(() => setSavingStoreProfile(false));
  };

  const setStore = (key) => (e) => setStoreProfile((p) => ({ ...p, [key]: e.target.value }));
  const role = context?.userData?.role;

  return (
    <div className="pf">
      <style>{CSS}</style>

      {/* ── User Profile ── */}
      <div className="pf-card pf-in">
        <div className="pf-banner" />
        <div className="pf-head">
          <div className="pf-avatar">
            <div className="pf-avatar-in">
              {uploading ? <CircularProgress color="inherit" size={24} />
                : previews?.length !== 0
                  ? previews.map((img, i) => <img src={img} key={i} alt="avatar" />)
                  : <img src="/user.jpg" alt="avatar" />}
              <div className="pf-over">
                <FaCloudUploadAlt size={22} />
                <input type="file" accept="image/*" name="avatar" onChange={onChangeFile} />
              </div>
            </div>
          </div>
          <div style={{ paddingBottom: 6 }}>
            <div className="pf-name">{formFields.name || "User Profile"}</div>
            <div className="pf-mail">{formFields.email}</div>
            {role && <span className="pf-role"><FiShield size={10} /> {role.replace(/_/g, " ")}</span>}
          </div>
          <button type="button" className={`pf-link${isChangePasswordFormShow ? " on" : ""}`} onClick={() => setisChangePasswordFormShow(!isChangePasswordFormShow)}>
            <FiKey size={12} /> Change Password
          </button>
        </div>

        <form className="pf-body" onSubmit={handleSubmit} style={{ paddingTop: 20 }}>
          <h2 className="pf-h2" style={{ "--c": K.blue }}><span><FiUser size={14} /></span>Personal details</h2>
          <div className="pf-grid">
            <Fld icon={FiUser} label="Full Name" color={K.orange}>
              <input type="text" name="name" value={formFields.name} onChange={onChangeInput} disabled={isLoading} placeholder="Your name" />
            </Fld>
            <Fld icon={FiMail} label="Email" color={K.blue}>
              <input type="email" name="email" value={formFields.email} disabled />
            </Fld>
            <Fld icon={FiPhone} label="Mobile" color={K.green} className="pf-full">
              <PhoneInput
                defaultCountry="in"
                value={phone}
                disabled={isLoading}
                onChange={(p) => {
                  setPhone(p);
                  setFormsFields((prev) => ({ ...prev, mobile: p }));
                }}
              />
            </Fld>
          </div>
          <button type="submit" disabled={!valideValue || isLoading} className="pf-btn blue full" style={{ marginTop: 4 }}>
            {isLoading ? <CircularProgress color="inherit" size={16} /> : <><FiCheck size={14} /> Update Profile</>}
          </button>
        </form>
      </div>

      {/* ── Store Information ── */}
      {isSellerRole(role) && (
        <div className="pf-card pf-in" style={{ animationDelay: ".1s" }}>
          <form className="pf-body" onSubmit={submitStoreProfile}>
            <h2 className="pf-h2" style={{ "--c": K.orange }}><span><MdOutlineStore size={15} /></span>Store Information</h2>
            <div className="pf-grid">
              <Fld icon={MdOutlineStore} label="Store Name" color={K.orange}>
                <input placeholder="Store Name" value={storeProfile.storeName} onChange={setStore("storeName")} />
              </Fld>
              <Fld icon={FiPhone} label="Contact No" color={K.green}>
                <input placeholder="Contact No" value={storeProfile.contactNo} onChange={setStore("contactNo")} />
              </Fld>
              <Fld icon={FiImage} label="Store Image URL" color={K.pink}>
                <input placeholder="Store Image URL" value={storeProfile.image} onChange={setStore("image")} />
              </Fld>
              <Fld icon={FiMapPin} label="Store Location" color={K.blue}>
                <input placeholder="Store Location" value={storeProfile.location} onChange={setStore("location")} />
              </Fld>
              <Fld icon={FiFileText} label="Store Description" color={K.violet} className="pf-full">
                <textarea rows={3} placeholder="Store Description" value={storeProfile.description} onChange={setStore("description")} />
              </Fld>
              <Fld icon={FiInfo} label="More Information" color={K.amber} className="pf-full">
                <textarea rows={3} placeholder="More Information" value={storeProfile.moreInfo} onChange={setStore("moreInfo")} />
              </Fld>
            </div>
            <button type="submit" disabled={savingStoreProfile} className="pf-btn orange full">
              {savingStoreProfile ? <CircularProgress color="inherit" size={16} /> : <><FiSave size={14} /> Save Store Profile</>}
            </button>
          </form>
        </div>
      )}

      {/* ── Change Password ── */}
      <Collapse isOpened={isChangePasswordFormShow}>
        <div className="pf-card">
          <form className="pf-body" onSubmit={handleSubmitChangePassword}>
            <h2 className="pf-h2" style={{ "--c": K.purple }}><span><FiKey size={14} /></span>Change Password</h2>
            <div className="pf-grid">
              <PwField label="Old Password" color={K.red} name="oldPassword" value={changePassword.oldPassword} onChange={onChangePw} disabled={isLoading2} placeholder="Old Password" />
              <PwField label="New Password" color={K.cyan} name="newPassword" value={changePassword.newPassword} onChange={onChangePw} disabled={isLoading2} placeholder="New Password" />
              <div className="pf-full">
                <PwField label="Confirm Password" color={K.green} name="confirmPassword" value={changePassword.confirmPassword} onChange={onChangePw} disabled={isLoading2} placeholder="Confirm Password" />
              </div>
            </div>
            <button type="submit" disabled={!valideValue2 || isLoading2} className="pf-btn green full">
              {isLoading2 ? <CircularProgress color="inherit" size={16} /> : <><FiLock size={14} /> Change Password</>}
            </button>
          </form>
        </div>
      </Collapse>
    </div>
  );
};

export default Profile;