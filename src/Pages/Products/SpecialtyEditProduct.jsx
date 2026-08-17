import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../App";
import { deleteImages, editData, fetchDataFromApi } from "../../utils/api";
import { IoMdClose } from "react-icons/io";
import {
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiImage,
  FiPlus,
  FiMinus,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";

import UploadBox from "../../Components/UploadBox";
import ProductSpecsEditor from "../../Components/ProductSpecsEditor";
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from "../../Components/ProductOptionsEditor";

const NAME_MAX = 100;
const TITLE_MAX = 100;
const DESC_MAX = 1000;

const SECTIONS = [
  { id: "basic", emoji: "📝", label: "Basic Info", tab: "Basic" },
  { id: "specs", emoji: "📋", label: "Specifications", tab: "Specs" },
  { id: "options", emoji: "⚙️", label: "Product Options", tab: "Options" },
  { id: "pricing", emoji: "💰", label: "Pricing", tab: "Price" },
  { id: "stock", emoji: "📦", label: "Stock & Availability", tab: "Stock" },
  { id: "featured", emoji: "⭐", label: "Featured", tab: "Featured" },
  { id: "categories", emoji: "🏷️", label: "Categories", tab: "Category" },
  { id: "images", emoji: "📸", label: "Product Gallery", tab: "Photos" },
];

const SpecialtyEditProduct = () => {
  const context = useContext(MyContext);
  const productId = context?.isOpenFullScreenPanel?.id;
  const isGrocery = context?.userData?.role === "GROCERY_SELLER";
  const accent = isGrocery ? "#059669" : "#ea580c";
  const accentSoft = isGrocery ? "rgba(5,150,105,0.12)" : "rgba(234,88,12,0.12)";
  const accentRing = isGrocery ? "rgba(5,150,105,0.22)" : "rgba(234,88,12,0.22)";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [removingIndex, setRemovingIndex] = useState(null);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [productOptions, setProductOptions] = useState([{ name: "", label: "", values: [] }]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    price: "",
    oldPrice: "",
    countInStock: "",
    categoryId: "",
    subCategoryId: "",
    isAvailable: true,
    isFeatured: false,
  });

  const initialFormRef = useRef(null);
  const sectionRefs = useRef({});
  const dragIndexRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    const catType = isGrocery ? "grocery" : "restaurant";

    Promise.all([
      fetchDataFromApi(`/api/go-market/products/${productId}`).catch(() =>
        fetchDataFromApi(`/api/product/${productId}`)
      ),
      fetchDataFromApi(`/api/go-market/categories?type=${catType}&limit=100&status=active`),
    ])
      .then(([prodRes, catRes]) => {
        let p = prodRes?.data || prodRes?.product || prodRes;

        if (p?.data && typeof p.data === "object" && !Array.isArray(p.data)) {
          p = p.data;
        }

        if (p && typeof p === "object") {
          const loadedForm = {
            name: p.name || "",
            title: p.title || "",
            description: p.description || "",
            price: p.price || p.discountPrice || "",
            oldPrice: p.oldPrice || p.price || p.discountPrice || "",
            countInStock: isGrocery ? String(p.countInStock ?? p.stock ?? 0) : "",
            categoryId: p.categoryId || p.goMarketCategoryId || "",
            subCategoryId: p.subCategoryId || p.goMarketSubCategoryId || "",
            isAvailable: p.isAvailable !== false,
            isFeatured: p.isFeatured || false,
          };
          setForm(loadedForm);
          initialFormRef.current = loadedForm;

          const specs = p.specifications || p.specs || [];
          if (Array.isArray(specs) && specs.length > 0) {
            setSpecifications(specs);
          }

          const opts = p.productOptions || p.options || [];
          if (Array.isArray(opts) && opts.length > 0) {
            setProductOptions(opts);
          }

          let imgs = [];
          if (Array.isArray(p.images)) {
            imgs = p.images;
          } else if (p.image && typeof p.image === "string") {
            imgs = [p.image];
          }

          if (imgs.length > 0) {
            setPreviews(imgs);
          }
        }

        setCategories(catRes?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        context.alertBox("error", "Could not load product details");
        setLoading(false);
      });
  }, [productId, isGrocery]);

  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${form.categoryId}&limit=100&status=active`).then((res) => {
      setSubCategories(res?.data || []);
    });
  }, [form.categoryId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setPreviewsFun = (arr) => {
    setPreviews((prev) => [...new Set([...prev, ...arr])]);
  };

  const removeImg = (image, index) => {
    setRemovingIndex(index);
    deleteImages(`/api/category/deteleImage?img=${image}`).finally(() => {
      setTimeout(() => {
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setRemovingIndex(null);
      }, 220);
    });
  };

  const moveImage = (index, dir) => {
    setPreviews((prev) => {
      const arr = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const makeCover = (index) => {
    if (index === 0) return;
    setPreviews((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(index, 1);
      arr.unshift(item);
      return arr;
    });
  };

  const handleDragStart = (index) => () => {
    dragIndexRef.current = index;
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (index) => () => {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from === null || from === index) return;
    setPreviews((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---- derived / computed values ----
  const discountPercent = useMemo(() => {
    const op = Number(form.oldPrice);
    const sp = Number(form.price);
    if (!op || !sp || sp >= op) return 0;
    return Math.round((1 - sp / op) * 100);
  }, [form.oldPrice, form.price]);

  const priceHigherThanMrp = Number(form.price) > 0 && Number(form.oldPrice) > 0 && Number(form.price) > Number(form.oldPrice);

  const requiredFields = useMemo(() => {
    const fields = ["name", "description", "categoryId", "price"];
    if (isGrocery) fields.push("countInStock");
    return fields;
  }, [isGrocery]);

  const completion = useMemo(() => {
    const filled = requiredFields.filter((f) => String(form[f] || "").trim() !== "").length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [form, requiredFields]);

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(initialFormRef.current) !== JSON.stringify(form);
  }, [form]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.categoryId) errs.categoryId = "Please select a category";
    if (!form.price) errs.price = "Price is required";
    if (isGrocery && !form.countInStock) errs.countInStock = "Stock quantity is required";
    return errs;
  };

  const fieldToSection = {
    name: "basic",
    description: "basic",
    categoryId: "categories",
    price: "pricing",
    countInStock: "stock",
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstField = Object.keys(errs)[0];
      context.alertBox("error", errs[firstField]);
      scrollToSection(fieldToSection[firstField] || "basic");
      return;
    }

    setErrors({});
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      title: (form.title || form.name).trim(),
      description: form.description.trim(),
      specifications: specifications.filter((s) => s.key?.trim() && s.value?.trim()),
      productOptions: normalizeProductOptionsForSubmit(productOptions),
      price: Number(form.price),
      oldPrice: Number(form.oldPrice || form.price),
      images: previews,
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId,
      isFeatured: form.isFeatured,
      goMarketCategoryId: form.categoryId,
      goMarketSubCategoryId: form.subCategoryId,
    };

    if (isGrocery) {
      payload.countInStock = Number(form.countInStock);
      payload.stock = Number(form.countInStock);
    } else {
      payload.isAvailable = form.isAvailable;
    }

    const handleSuccess = (message) => {
      context.alertBox("success", message || "Product updated successfully!");
      setSaved(true);
      setTimeout(() => {
        context.setIsOpenFullScreenPanel({ open: false });
      }, 900);
    };

    editData(`/api/go-market/products/${productId}`, payload)
      .then((res) => {
        if (res?.error === false || res?.success === true) {
          handleSuccess(res?.message);
        } else if (res?.data?.error === false) {
          handleSuccess(res?.data?.message);
        } else {
          throw new Error(res?.message || res?.data?.message || "Update failed");
        }
      })
      .catch((err) => {
        console.error("Update error:", err);
        editData(`/api/product/updateProduct/${productId}`, payload)
          .then((res) => {
            if (res?.data?.error === false) {
              handleSuccess(res?.data?.message);
            } else {
              context.alertBox("error", res?.data?.message || res?.message || "Update failed");
            }
          })
          .catch((fallbackErr) => {
            context.alertBox("error", fallbackErr?.message || "Could not update product");
          })
          .finally(() => setSaving(false));
      })
      .finally(() => setSaving(false));
  };

  const handleClose = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard them and close?")) {
      return;
    }
    context.setIsOpenFullScreenPanel({ open: false });
  };

  // ---------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------
  if (loading) {
    return (
      <div className="sep-root" style={{ "--accent": accent, "--accent-soft": accentSoft, maxWidth: 860, margin: "0 auto", padding: "24px 20px 40px" }}>
        <style>{SEP_STYLES}</style>
        <div className="sep-skel" style={{ height: 26, width: "60%", borderRadius: 8, marginBottom: 10 }} />
        <div className="sep-skel" style={{ height: 14, width: "80%", borderRadius: 6, marginBottom: 24 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="sep-card" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div className="sep-skel" style={{ height: 16, width: "35%", borderRadius: 6, marginBottom: 16 }} />
            <div className="sep-skel" style={{ height: 40, width: "100%", borderRadius: 10, marginBottom: 12 }} />
            <div className="sep-skel" style={{ height: 40, width: "100%", borderRadius: 10 }} />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <CircularProgress style={{ color: accent }} size={28} />
        </div>
      </div>
    );
  }

  const inputStyle = (name) => ({
    width: "100%",
    border: `1px solid ${errors[name] ? "#dc2626" : "#e5e7eb"}`,
    background: errors[name] ? "#fef2f2" : "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    boxSizing: "border-box",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color .18s ease, box-shadow .18s ease, background .18s ease",
  });

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 6,
    display: "block",
  };

  const ErrorText = ({ name }) =>
    errors[name] ? (
      <div className="sep-pop" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11.5, fontWeight: 600, color: "#dc2626" }}>
        <FiAlertCircle size={13} />
        {errors[name]}
      </div>
    ) : null;

  const Toggle = ({ name, checked, label, hint }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "4px 0" }}>
      <span style={{ position: "relative", width: 44, height: 26, flexShrink: 0 }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sep-toggle-input"
          style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: "pointer", width: "100%", height: "100%" }}
        />
        <span
          className="sep-switch-track"
          style={{ position: "absolute", inset: 0, borderRadius: 999, background: checked ? accent : "#d1d5db", pointerEvents: "none" }}
        />
        <span
          className="sep-switch-thumb"
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.35)",
            transform: checked ? "translateX(18px)" : "translateX(0)",
            pointerEvents: "none",
          }}
        />
      </span>
      <span>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 1 }}>{hint}</div>}
      </span>
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="sep-root"
      style={{ "--accent": accent, "--accent-soft": accentSoft, "--accent-ring": accentRing, maxWidth: 860, margin: "0 auto", background: "linear-gradient(180deg,#f8fafc,#fff)" }}
    >
      <style>{SEP_STYLES}</style>

      {/* Sticky header */}
      <div className="sep-header" style={{ padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {context?.setIsOpenFullScreenPanel && (
              <button
                type="button"
                onClick={handleClose}
                className="sep-icon-btn"
                aria-label="Close"
                style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <FiArrowLeft size={16} color="#374151" />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {isGrocery ? "📦 Edit Grocery Item" : "🍽️ Edit Menu Item"}
                </span>
                {isDirty && <span className="sep-dot" title="Unsaved changes" />}
              </h2>
              <p style={{ fontSize: 12.5, color: "#6b7280", margin: "3px 0 0" }}>Update details, pricing, stock and photos.</p>
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{completion}% complete</div>
          </div>
        </div>

        <div className="sep-progress-track" style={{ marginTop: 12 }}>
          <div className="sep-progress-fill" style={{ width: `${completion}%`, background: accent }} />
        </div>

        {/* Quick section nav */}
        <div className="sep-nav">
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`sep-nav-tab${activeTab === s.id ? " active" : ""}`}
              style={activeTab === s.id ? { background: accent, borderColor: accent, color: "#fff" } : undefined}
            >
              <span style={{ marginRight: 5 }}>{s.emoji}</span>
              {s.tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "4px 20px 0" }}>
        {/* Basic Info */}
        <div ref={(el) => (sectionRefs.current.basic = el)} style={{ ...cardStyle, animationDelay: "0ms" }} className="sep-card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#111827" }}>📝 Basic Information</h3>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={labelStyle}>Product Name *</label>
              <span style={{ fontSize: 10.5, color: form.name.length > NAME_MAX ? "#dc2626" : "#9ca3af" }}>
                {form.name.length}/{NAME_MAX}
              </span>
            </div>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              maxLength={NAME_MAX}
              required
              placeholder="e.g. Fresh Tomatoes, Biryani"
              className="sep-input"
              style={inputStyle("name")}
            />
            <ErrorText name="name" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={labelStyle}>Display Title (for product page)</label>
              {!form.title && form.name && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, title: f.name }))}
                  style={{ fontSize: 11, fontWeight: 700, color: accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Use product name
                </button>
              )}
            </div>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              maxLength={TITLE_MAX}
              placeholder="Leave blank to use product name"
              className="sep-input"
              style={inputStyle("title")}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={labelStyle}>Description *</label>
              <span style={{ fontSize: 10.5, color: form.description.length > DESC_MAX ? "#dc2626" : "#9ca3af" }}>
                {form.description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              maxLength={DESC_MAX}
              placeholder="Describe the product in detail..."
              className="sep-input"
              style={{ ...inputStyle("description"), resize: "vertical", fontFamily: "inherit" }}
            />
            <ErrorText name="description" />
          </div>
        </div>

        {/* Specifications */}
        <div ref={(el) => (sectionRefs.current.specs = el)} style={cardStyle} className="sep-card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#111827" }}>📋 Specifications</h3>
          <ProductSpecsEditor value={specifications} onChange={setSpecifications} accent={accent} />
        </div>

        {/* Product Options */}
        <div ref={(el) => (sectionRefs.current.options = el)} style={cardStyle} className="sep-card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#111827" }}>⚙️ Product Options (Size, Color, Weight, etc.)</h3>
          <ProductOptionsEditor value={productOptions} onChange={setProductOptions} accent={accent} />
        </div>

        {/* Pricing */}
        <div ref={(el) => (sectionRefs.current.pricing = el)} style={cardStyle} className="sep-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>💰 Pricing</h3>
            {discountPercent > 0 && (
              <span className="sep-pop" style={{ fontSize: 11.5, fontWeight: 800, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 9px", borderRadius: 999 }}>
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="sep-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>MRP / Original Price (₹) *</label>
              <input name="oldPrice" type="number" min={0} value={form.oldPrice} onChange={onChange} placeholder="100" className="sep-input" style={inputStyle("oldPrice")} />
            </div>
            <div>
              <label style={labelStyle}>Selling Price (₹) *</label>
              <input name="price" type="number" min={0} value={form.price} onChange={onChange} required placeholder="85" className="sep-input" style={inputStyle("price")} />
              <ErrorText name="price" />
            </div>
          </div>
          {priceHigherThanMrp && (
            <div className="sep-pop" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11.5, fontWeight: 600, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "7px 10px" }}>
              <FiAlertCircle size={13} />
              Selling price is higher than MRP — customers won't see a discount.
            </div>
          )}
        </div>

        {/* Stock / Availability */}
        <div ref={(el) => (sectionRefs.current.stock = el)} style={cardStyle} className="sep-card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#111827" }}>📦 Stock & Availability</h3>

          {isGrocery ? (
            <div>
              <label style={labelStyle}>Stock Quantity *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, countInStock: String(Math.max(0, Number(f.countInStock || 0) - 1)) }))}
                  className="sep-stepper-btn"
                >
                  <FiMinus size={14} />
                </button>
                <input
                  name="countInStock"
                  type="number"
                  min={0}
                  value={form.countInStock}
                  onChange={onChange}
                  placeholder="50"
                  className="sep-input"
                  style={{ ...inputStyle("countInStock"), textAlign: "center" }}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, countInStock: String(Number(f.countInStock || 0) + 1) }))}
                  className="sep-stepper-btn"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <ErrorText name="countInStock" />
            </div>
          ) : (
            <Toggle name="isAvailable" checked={form.isAvailable} label="Available on menu" hint="Customers can order this item right now" />
          )}
        </div>

        {/* Featured Product */}
        <div ref={(el) => (sectionRefs.current.featured = el)} style={cardStyle} className="sep-card">
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: "#111827" }}>⭐ Featured</h3>
          <Toggle name="isFeatured" checked={form.isFeatured} label="Featured product" hint="Shown on the homepage highlights" />
        </div>

        {/* Categories */}
        <div ref={(el) => (sectionRefs.current.categories = el)} style={cardStyle} className="sep-card">
          <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#111827" }}>🏷️ Categories</h3>
          <div className="sep-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <Select
                size="small"
                fullWidth
                value={form.categoryId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, categoryId: e.target.value, subCategoryId: "" }));
                  if (errors.categoryId) setErrors((p) => ({ ...p, categoryId: undefined }));
                }}
                displayEmpty
                error={!!errors.categoryId}
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              <ErrorText name="categoryId" />
            </div>
            <div>
              <label style={labelStyle}>Sub Category</label>
              <Select
                size="small"
                fullWidth
                value={form.subCategoryId}
                onChange={(e) => setForm((f) => ({ ...f, subCategoryId: e.target.value }))}
                disabled={!form.categoryId}
                displayEmpty
              >
                <MenuItem value="">Optional</MenuItem>
                {subCategories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div ref={(el) => (sectionRefs.current.images = el)} style={cardStyle} className="sep-card">
          <label style={{ fontSize: 12, fontWeight: 800, color: "#374151", display: "block", marginBottom: 4 }}>
            📸 Product Gallery ({previews.length} {previews.length === 1 ? "image" : "images"})
          </label>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>
            First image is used as cover. Drag to reorder, or use the arrows on mobile.
          </p>

          {previews.length === 0 && (
            <div
              style={{
                border: "2px dashed #e5e7eb",
                borderRadius: 14,
                padding: "22px 16px",
                textAlign: "center",
                marginBottom: 14,
                color: "#9ca3af",
              }}
            >
              <FiImage size={26} style={{ marginBottom: 6 }} />
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>No photos yet — add at least one so customers can see this product.</div>
            </div>
          )}

          <div className="sep-img-grid">
            {previews.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`sep-img-card${removingIndex === index ? " sep-img-removing" : ""}`}
                style={{ position: "relative" }}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(index)}
              >
                <button type="button" onClick={() => removeImg(image, index)} className="sep-img-close" aria-label="Remove image">
                  <IoMdClose size={14} />
                </button>

                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    height: 110,
                    border: `3px solid ${index === 0 ? accent : "#e5e7eb"}`,
                  }}
                >
                  <img src={image} alt={`Product ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                  {index === 0 ? (
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: accent, display: "flex", alignItems: "center", gap: 3 }}>
                      <FiStar size={11} /> Cover
                    </span>
                  ) : (
                    <button type="button" onClick={() => makeCover(index)} style={{ fontSize: 10.5, fontWeight: 700, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Set as cover
                    </button>
                  )}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="sep-reorder-btn" aria-label="Move left">
                      <FiChevronLeft size={12} />
                    </button>
                    <button type="button" disabled={index === previews.length - 1} onClick={() => moveImage(index, 1)} className="sep-reorder-btn" aria-label="Move right">
                      <FiChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <UploadBox multiple name="images" url="/api/product/uploadImages" setPreviewsFun={setPreviewsFun} />
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sep-action-bar">
        {context?.setIsOpenFullScreenPanel && (
          <button type="button" onClick={handleClose} className="sep-btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving} className="sep-btn-primary" style={{ background: saved ? "#059669" : accent }}>
          {saving ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <CircularProgress size={16} style={{ color: "#fff" }} />
              Saving...
            </span>
          ) : saved ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <FiCheck size={16} /> Saved
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
};

const SEP_STYLES = `
@keyframes sepFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes sepPop { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }
@keyframes sepScaleOut { to { opacity:0; transform:scale(.85); } }
@keyframes sepShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
@keyframes sepPulseDot { 0%,100% { box-shadow:0 0 0 0 var(--accent-ring); } 50% { box-shadow:0 0 0 5px transparent; } }

.sep-root { padding-bottom: 24px; }
.sep-header { position: sticky; top: 0; z-index: 5; background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); border-bottom: 1px solid #eef0f3; }
.sep-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--accent); animation: sepPulseDot 1.6s ease infinite; }
.sep-progress-track { height:5px; border-radius:999px; background:#eef1f4; overflow:hidden; }
.sep-progress-fill { height:100%; border-radius:999px; transition: width .35s ease; }
.sep-nav { display:flex; gap:8px; overflow-x:auto; margin-top:12px; padding-bottom:2px; scrollbar-width:none; }
.sep-nav::-webkit-scrollbar { display:none; }
.sep-nav-tab { flex-shrink:0; font-size:12px; font-weight:700; color:#4b5563; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:999px; padding:6px 12px; cursor:pointer; transition: all .18s ease; white-space:nowrap; }
.sep-nav-tab:hover { border-color: var(--accent); }
.sep-card { animation: sepFadeUp .4s ease both; }
.sep-pop { animation: sepPop .2s ease both; }
.sep-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-ring); }
.sep-icon-btn:hover { border-color: var(--accent); }
.sep-icon-btn:active { transform: scale(.94); }
.sep-stepper-btn { width:38px; height:40px; flex-shrink:0; border-radius:10px; border:1px solid #e5e7eb; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#374151; transition: all .15s ease; }
.sep-stepper-btn:hover { border-color: var(--accent); color: var(--accent); }
.sep-stepper-btn:active { transform: scale(.92); }
.sep-img-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:12px; }
.sep-img-card { animation: sepPop .25s ease both; transition: transform .2s ease, box-shadow .2s ease; cursor: grab; }
.sep-img-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,.1); }
.sep-img-card:active { cursor: grabbing; }
.sep-img-removing { animation: sepScaleOut .2s ease forwards; }
.sep-img-close { position:absolute; top:-6px; right:-6px; width:24px; height:24px; border-radius:50%; background:#dc2626; border:2px solid #fff; color:#fff; cursor:pointer; z-index:2; display:flex; align-items:center; justify-content:center; transition: transform .15s ease; }
.sep-img-close:hover { transform: scale(1.1); }
.sep-reorder-btn { width:20px; height:20px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#6b7280; }
.sep-reorder-btn:disabled { opacity:.35; cursor:not-allowed; }
.sep-reorder-btn:not(:disabled):hover { border-color: var(--accent); color: var(--accent); }
.sep-switch-track, .sep-switch-thumb { transition: all .22s ease; }
.sep-toggle-input:focus-visible + .sep-switch-track { box-shadow: 0 0 0 3px var(--accent-ring); }
.sep-skel { background: linear-gradient(90deg,#eef0f3 25%,#f6f7f9 37%,#eef0f3 63%); background-size:400px 100%; animation: sepShimmer 1.3s ease infinite; }
.sep-action-bar { position: sticky; bottom:0; display:flex; gap:10px; padding:14px 20px calc(14px + env(safe-area-inset-bottom)); background: rgba(255,255,255,0.94); backdrop-filter: blur(6px); border-top:1px solid #eef0f3; margin-top: 8px; }
.sep-btn-primary { flex:1; color:#fff; border:none; border-radius:10px; padding:13px 20px; font-weight:700; font-size:14.5px; cursor:pointer; transition: filter .18s ease, transform .1s ease, opacity .18s ease; }
.sep-btn-primary:disabled { opacity:.7; cursor:not-allowed; }
.sep-btn-primary:not(:disabled):hover { filter:brightness(1.06); }
.sep-btn-primary:not(:disabled):active { transform: scale(.98); }
.sep-btn-secondary { flex:0 0 auto; background:#fff; color:#374151; border:1px solid #e5e7eb; border-radius:10px; padding:13px 18px; font-weight:700; font-size:14px; cursor:pointer; transition: all .15s ease; }
.sep-btn-secondary:hover { border-color:#d1d5db; background:#f9fafb; }

@media (max-width: 640px) {
  .sep-grid-2 { grid-template-columns: 1fr !important; }
  .sep-img-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
  .sep-header { padding-left:16px; padding-right:16px; }
}

@media (prefers-reduced-motion: reduce) {
  .sep-card, .sep-pop, .sep-img-card, .sep-img-removing, .sep-skel, .sep-dot { animation: none !important; }
  .sep-input, .sep-btn-primary, .sep-btn-secondary, .sep-icon-btn, .sep-stepper-btn, .sep-reorder-btn, .sep-switch-track, .sep-switch-thumb { transition: none !important; }
}
`;

export default SpecialtyEditProduct;