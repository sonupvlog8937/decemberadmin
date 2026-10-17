import React, { useContext, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { FaLeaf, FaStore, FaCloudUploadAlt, FaTrash, FaPlus } from 'react-icons/fa';
import { MyContext } from '../../App';
import { deleteImages, fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../../Components/UploadBox';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';

const UNITS = [
  { value: 'piece', label: 'Per Piece' },
  { value: 'kg', label: 'Per Kg' },
  { value: 'g', label: 'Per Gram' },
  { value: 'L', label: 'Per Litre' },
  { value: 'ml', label: 'Per ml' },
  { value: 'dozen', label: 'Per Dozen' },
  { value: 'pack', label: 'Per Pack' },
  { value: 'bundle', label: 'Per Bundle' },
];

const PALETTE = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#0ea5e9', '#8b5cf6'];

const emptyProduct = (id) => ({
  id,
  name: '',
  title: '',
  description: '',
  price: '',
  oldPrice: '',
  countInStock: '',
  unit: 'piece',
  categoryId: '',
  subCategoryId: '',
  isFeatured: 'no',
  previews: [],
  specifications: [{ key: '', value: '' }],
  productOptions: [{ name: '', label: '', values: [] }],
});

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

@keyframes gaIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes gaPop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
@keyframes gaShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes gaFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes gaDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

.ga, .ga * { box-sizing: border-box; }
.ga {
  min-height: 100vh; padding: 20px; font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #1f2937;
  background: #f0fdf4;
  background:
    radial-gradient(circle at 8% 4%, rgba(16,185,129,.16), transparent 38%),
    radial-gradient(circle at 92% 8%, rgba(236,72,153,.12), transparent 36%),
    radial-gradient(circle at 80% 92%, rgba(99,102,241,.12), transparent 40%),
    linear-gradient(160deg, #ecfdf5 0%, #f8fafc 55%, #fdf2f8 100%);
}

/* header */
.ga-head { margin-bottom: 18px; animation: gaIn .45s ease both; }
.ga-pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 10.5px; font-weight: 800; letter-spacing: .05em;
  color: #fff; background: #10b981; background: linear-gradient(90deg, #10b981, #0ea5e9, #8b5cf6, #10b981); background-size: 200% auto; animation: gaShift 5s linear infinite;
  box-shadow: 0 8px 16px -8px rgba(16,185,129,.7);
}
.ga-head h1 {
  margin: 10px 0 4px; font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: #064e3b;
  background: linear-gradient(90deg, #059669, #6366f1, #ec4899, #059669); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: gaShift 7s linear infinite;
}
.ga-head p { margin: 0; max-width: 580px; font-size: 12.5px; line-height: 1.55; color: #6b7280; }

/* generic cards */
.ga-card {
  background: #fff; border: 1px solid #d1fae5; border-radius: 16px; box-shadow: 0 8px 26px -16px rgba(16,185,129,.55); animation: gaIn .45s ease both;
}
.ga-empty { padding: 28px 16px; text-align: center; }
.ga-empty h3 { margin: 8px 0 4px; font-size: 15px; color: #111827; }
.ga-empty p { margin: 0; font-size: 12.5px; color: #6b7280; }

/* shop banner */
.ga-shop { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; position: relative; overflow: hidden; }
.ga-shop::after { content: ''; position: absolute; right: -30px; top: -30px; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,.18), transparent 70%); }
.ga-shop-ico {
  width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; flex-shrink: 0;
  background: linear-gradient(135deg, #10b981, #0ea5e9); box-shadow: 0 10px 18px -10px #10b981; animation: gaFloat 3.5s ease-in-out infinite;
}
.ga-shop small { display: block; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
.ga-shop b { font-size: 14px; font-weight: 800; color: #111827; }

/* product block */
.ga-product {
  position: relative; margin-bottom: 16px; padding: 16px 16px 16px 20px; border-radius: 16px; overflow: hidden;
  background: #fff; border: 1px solid #d1fae5; border: 1px solid color-mix(in srgb, var(--c) 25%, #e5e7eb);
  box-shadow: 0 10px 28px -18px var(--c); animation: gaIn .4s ease both; transition: box-shadow .25s ease, transform .25s ease;
}
.ga-product::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--c); background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 35%, #ec4899)); }
.ga-product:hover { transform: translateY(-2px); box-shadow: 0 16px 34px -18px var(--c); }

.ga-product-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px dashed #d1d5db; border-bottom: 1px dashed color-mix(in srgb, var(--c) 40%, #e5e7eb); }
.ga-product-title { display: flex; align-items: center; gap: 9px; min-width: 0; }
.ga-num { width: 26px; height: 26px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: 800; color: #fff; background: var(--c); box-shadow: 0 6px 12px -6px var(--c); }
.ga-product-title h3 { margin: 0; font-size: 14px; font-weight: 800; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ga-icon-btn {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 9px; border: 1px solid #fecdd3; background: #fff1f2; color: #ef4444; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease;
}
.ga-icon-btn:hover { background: #ef4444; color: #fff; transform: rotate(8deg) scale(1.06); box-shadow: 0 8px 14px -8px rgba(239,68,68,.8); }
.ga-icon-btn:active { transform: scale(.92); }

/* form grid */
.ga-grid { display: grid; gap: 12px; margin-bottom: 12px; }
.ga-grid.g2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ga-grid.g3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ga-field { min-width: 0; }
.ga-label { display: block; margin-bottom: 5px; font-size: 10.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--lc, #047857); }
.ga-input {
  width: 100%; height: 38px; padding: 0 12px; font-size: 12.5px; font-family: inherit; color: #064e3b; background: #f9fafb;
  border: 1.5px solid #d1fae5; border-radius: 10px; outline: none; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .18s ease;
}
.ga-input::placeholder { color: #9ca3af; }
.ga-input:hover { background: #fff; }
.ga-input:focus { background: #fff; border-color: var(--c); box-shadow: 0 0 0 3px rgba(16,185,129,.16); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
textarea.ga-input { height: 78px; padding: 10px 12px; resize: vertical; line-height: 1.5; }
.ga-input[type=number]::-webkit-outer-spin-button, .ga-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ga-input[type=number] { -moz-appearance: textfield; }

.ga-field.price { --lc: #059669; }
.ga-field.sell { --lc: #d97706; }
.ga-field.stock { --lc: #0284c7; }
.ga-field.cat { --lc: #7c3aed; }
.ga-field.unit { --lc: #db2777; }
.ga-field.feat { --lc: #ea580c; }

/* advanced */
.ga-adv { margin: 4px 0 14px; border-radius: 12px; border: 1.5px dashed #a7f3d0; border: 1.5px dashed color-mix(in srgb, var(--c) 45%, #fff); background: #f0fdf4; background: color-mix(in srgb, var(--c) 5%, #fff); transition: background .2s ease; }
.ga-adv[open] { background: #fff; border-style: solid; }
.ga-adv summary {
  list-style: none; cursor: pointer; padding: 10px 14px; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #047857; color: var(--c);
  display: flex; align-items: center; gap: 8px; user-select: none;
}
.ga-adv summary::-webkit-details-marker { display: none; }
.ga-adv summary::before { content: '+'; width: 18px; height: 18px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; background: var(--c); transition: transform .25s ease; }
.ga-adv[open] summary::before { content: '–'; transform: rotate(180deg); }
.ga-adv-body { padding: 4px 12px 14px; display: grid; gap: 14px; animation: gaDown .3s ease both; }

/* images */
.ga-photos-hint { margin: 2px 0 10px; font-size: 11px; font-style: italic; color: #6b7280; }
.ga-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
.ga-photo { position: relative; animation: gaPop .3s ease both; }
.ga-photo-img { height: 96px; border-radius: 12px; overflow: hidden; border: 2px solid #d1fae5; border: 2px solid color-mix(in srgb, var(--c) 35%, #fff); transition: transform .2s ease, box-shadow .2s ease; }
.ga-photo:hover .ga-photo-img { transform: scale(1.04); box-shadow: 0 10px 18px -10px var(--c); }
.ga-photo-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ga-photo-x {
  position: absolute; top: -7px; right: -7px; z-index: 2; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; background: #ef4444; color: #fff; font-size: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 10px -4px rgba(239,68,68,.8); transition: transform .18s ease;
}
.ga-photo-x:hover { transform: rotate(90deg) scale(1.1); }

/* add + submit */
.ga-add {
  width: 100%; margin-bottom: 18px; padding: 11px 14px; border-radius: 12px; cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 800; color: #047857;
  display: flex; align-items: center; justify-content: center; gap: 8px; background: #fff; border: 2px dashed #6ee7b7;
  transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease, color .2s ease;
}
.ga-add:hover { transform: translateY(-2px); background: #ecfdf5; border-color: #8b5cf6; color: #6d28d9; box-shadow: 0 12px 22px -14px #8b5cf6; }
.ga-add:active { transform: scale(.98); }

.ga-submit {
  width: 100%; height: 48px; border: none; border-radius: 14px; cursor: pointer; font-family: inherit; font-size: 13.5px; font-weight: 800; color: #fff;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #10b981; background: linear-gradient(90deg, #10b981, #0ea5e9, #8b5cf6, #ec4899, #10b981); background-size: 250% auto; animation: gaShift 6s linear infinite;
  box-shadow: 0 14px 28px -14px rgba(16,185,129,.8); transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
}
.ga-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 18px 32px -14px rgba(139,92,246,.8); }
.ga-submit:active:not(:disabled) { transform: scale(.98); }
.ga-submit:disabled { opacity: .75; cursor: not-allowed; }

/* tablet */
@media (max-width: 860px) {
  .ga-grid.g3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* mobile */
@media (max-width: 560px) {
  .ga { padding: 12px 10px 24px; }
  .ga-head h1 { font-size: 18px; }
  .ga-head p { font-size: 12px; }
  .ga-product { padding: 12px 12px 12px 16px; border-radius: 14px; }
  .ga-grid.g2, .ga-grid.g3 { grid-template-columns: 1fr; }
  .ga-grid.g3.compact { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ga-photos { grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 8px; }
  .ga-photo-img { height: 78px; }
  .ga-adv-body { padding: 4px 8px 12px; }
  .ga-input { font-size: 16px; } /* iOS zoom na ho */
  .ga-submit { height: 46px; font-size: 13px; }
}
@media (prefers-reduced-motion: reduce) {
  .ga *, .ga *::before { animation: none !important; transition: none !important; }
}
`;

const BulkAddProduct = () => {
  const context = useContext(MyContext);
  const history = useNavigate();

  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [products, setProducts] = useState([emptyProduct(1)]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  useEffect(() => {
    Promise.all([
      fetchDataFromApi('/api/go-market/grocery-shops?limit=1'),
      fetchDataFromApi('/api/go-market/categories?type=grocery&limit=100&status=active'),
    ]).then(([shopRes, catRes]) => {
      setShop(shopRes?.data?.[0] || null);
      setCategories(catRes?.data || []);
      setLoadingMeta(false);
    });
  }, []);

  // Load subcategories when category changes
  const loadSubCategories = async (catId) => {
    if (!catId || subCategoriesMap[catId]) return;
    const res = await fetchDataFromApi(`/api/go-market/subcategories?parentId=${catId}&limit=100&status=active`);
    setSubCategoriesMap((prev) => ({ ...prev, [catId]: res?.data || [] }));
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, emptyProduct(Math.max(...prev.map((p) => p.id), 0) + 1)]);
  };

  const removeProduct = (productId) => {
    if (products.length === 1) {
      context.alertBox('error', 'You must have at least one product');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Functional updates: ek ke baad ek call karne par purani state overwrite nahi hoti
  const updateProduct = (productId, field, value) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p)));
  };

  const updateNestedProduct = (productId, field, value) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p)));
  };

  const setProductPreviews = (productId, arr) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, previews: [...p.previews, ...arr] } : p)));
  };

  const removeProductImage = (productId, image, index) => {
    deleteImages(`/api/category/deteleImage?img=${image}`).then(() => {
      setProducts((prev) => prev.map((p) => (
        p.id === productId ? { ...p, previews: p.previews.filter((_, i) => i !== index) } : p
      )));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checks = [
      [!shop, 'Your grocery shop is not set up. Please contact support.'],
    ];

    for (const [fail, msg] of checks) {
      if (fail) {
        context.alertBox('error', msg);
        return;
      }
    }

    // Validate all products
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const errors = [];
      if (!p.name.trim()) errors.push('Product name');
      if (!p.description.trim()) errors.push('Product description');
      if (!p.categoryId) errors.push('Category');
      if (!p.price) errors.push('Price');
      if (!p.countInStock) errors.push('Stock');
      if (p.previews.length === 0) errors.push('Images');

      if (errors.length > 0) {
        context.alertBox('error', `Product ${i + 1}: Please fill in ${errors.join(', ')}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = products.map((p) => {
        const sellingPrice = p.oldPrice || p.price;
        const unitLabel = UNITS.find((u) => u.value === p.unit)?.label?.replace('Per ', '') || p.unit;
        const specRows = p.specifications.filter((s) => s.key?.trim() && s.value?.trim());
        if (unitLabel) specRows.push({ key: 'Unit', value: unitLabel });

        return {
          shopId: shop._id,
          name: p.name.trim(),
          title: (p.title || p.name).trim(),
          description: p.description.trim(),
          specifications: specRows,
          productOptions: normalizeProductOptionsForSubmit(p.productOptions),
          price: Number(p.price),
          discountPrice: Number(sellingPrice),
          stock: Number(p.countInStock),
          image: p.previews[0],
          images: p.previews,
          categoryId: p.categoryId || undefined,
          subCategoryId: p.subCategoryId || undefined,
          isFeatured: p.isFeatured === 'yes',
        };
      });

      const res = await postData('/api/go-market/products/bulk', payload);

      setIsLoading(false);
      if (res?.error === false || res?.success === true) {
        context.alertBox('success', `${products.length} products added successfully!`);
        context.setIsOpenFullScreenPanel({ open: false });
        history('/products');
      } else {
        context.alertBox('error', res?.message || 'Could not add products');
      }
    } catch (err) {
      setIsLoading(false);
      context.alertBox('error', 'Error adding products. Please try again.');
    }
  };

  const selectSx = {
    width: '100%',
    fontSize: 12.5,
    background: '#f9fafb',
    borderRadius: '10px',
    transition: 'background .18s ease',
    '&:hover': { background: '#fff' },
    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
    '& .MuiSelect-select': { fontSize: 12.5, paddingTop: '9px', paddingBottom: '9px', fontFamily: 'inherit' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1fae5', borderWidth: 1.5 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6ee7b7' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
  };

  const menuItemSx = { fontSize: 12.5, fontFamily: 'inherit' };

  return (
    <section className="ga">
      <style>{CSS}</style>

      {/* Header */}
      <div className="ga-head">
        <span className="ga-pill"><FaLeaf size={10} /> BULK ADD GROCERY PRODUCTS</span>
        <h1>Add Multiple Products</h1>
        <p>
          Add multiple grocery products at once to your Go Market shop. Each product can have different specifications, options, prices, and images.
        </p>
      </div>

      {loadingMeta ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 70 }}>
          <CircularProgress sx={{ color: '#10b981' }} />
        </div>
      ) : !shop ? (
        <div className="ga-card ga-empty">
          <div style={{ fontSize: 36 }}>😕</div>
          <h3>Grocery shop not found</h3>
          <p>Complete seller registration first.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Shop info */}
          <div className="ga-card ga-shop">
            <div className="ga-shop-ico"><FaStore /></div>
            <div>
              <small>Listing in shop</small>
              <b>{shop.shopName}</b>
            </div>
          </div>

          {/* Products list */}
          {products.map((product, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const subCats = subCategoriesMap[product.categoryId] || [];
            return (
              <div key={product.id} className="ga-product" style={{ '--c': color }}>
                <div className="ga-product-head">
                  <div className="ga-product-title">
                    <span className="ga-num">{idx + 1}</span>
                    <h3>{product.name.trim() || `Product ${idx + 1}`}</h3>
                  </div>
                  {products.length > 1 && (
                    <button
                      type="button"
                      className="ga-icon-btn"
                      title="Remove product"
                      aria-label={`Remove product ${idx + 1}`}
                      onClick={() => removeProduct(product.id)}
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="ga-grid g2">
                  <div className="ga-field">
                    <label className="ga-label">Product name *</label>
                    <input
                      className="ga-input"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      placeholder="e.g. Fresh Tomatoes"
                    />
                  </div>
                  <div className="ga-field">
                    <label className="ga-label">Display title</label>
                    <input
                      className="ga-input"
                      value={product.title}
                      onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                      placeholder="Leave blank to use product name"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="ga-field" style={{ marginBottom: 12 }}>
                  <label className="ga-label">Description *</label>
                  <textarea
                    className="ga-input"
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    placeholder="Freshness, origin, storage tips…"
                  />
                </div>

                {/* Category & Unit */}
                <div className="ga-grid g3">
                  <div className="ga-field cat">
                    <label className="ga-label">Category *</label>
                    <Select
                      size="small"
                      sx={selectSx}
                      value={product.categoryId}
                      displayEmpty
                      onChange={(e) => {
                        const catId = e.target.value;
                        loadSubCategories(catId);
                        updateProduct(product.id, 'categoryId', catId);
                        updateProduct(product.id, 'subCategoryId', '');
                      }}
                    >
                      <MenuItem sx={menuItemSx} value="">Select</MenuItem>
                      {categories.map((c) => (
                        <MenuItem sx={menuItemSx} key={c._id} value={c._id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="ga-field unit">
                    <label className="ga-label">Unit *</label>
                    <Select
                      size="small"
                      sx={selectSx}
                      value={product.unit}
                      onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                    >
                      {UNITS.map((u) => (
                        <MenuItem sx={menuItemSx} key={u.value} value={u.value}>{u.label}</MenuItem>
                      ))}
                    </Select>
                  </div>
                  <div className="ga-field feat">
                    <label className="ga-label">Featured</label>
                    <Select
                      size="small"
                      sx={selectSx}
                      value={product.isFeatured}
                      onChange={(e) => updateProduct(product.id, 'isFeatured', e.target.value)}
                    >
                      <MenuItem sx={menuItemSx} value="no">No</MenuItem>
                      <MenuItem sx={menuItemSx} value="yes">Yes</MenuItem>
                    </Select>
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="ga-grid g3 compact">
                  <div className="ga-field price">
                    <label className="ga-label">MRP (₹) *</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="ga-input"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                      placeholder="100"
                      min="0"
                    />
                  </div>
                  <div className="ga-field sell">
                    <label className="ga-label">Selling price (₹)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="ga-input"
                      value={product.oldPrice}
                      onChange={(e) => updateProduct(product.id, 'oldPrice', e.target.value)}
                      placeholder="Same as MRP"
                      min="0"
                    />
                  </div>
                  <div className="ga-field stock" style={{ gridColumn: 'auto' }}>
                    <label className="ga-label">Stock qty *</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="ga-input"
                      value={product.countInStock}
                      onChange={(e) => updateProduct(product.id, 'countInStock', e.target.value)}
                      placeholder="50"
                      min="0"
                    />
                  </div>
                </div>

                {/* Product Options & Specs (collapsed) */}
                <details className="ga-adv">
                  <summary>Advanced options (specifications, sizes, colors, etc.)</summary>
                  <div className="ga-adv-body">
                    <ProductSpecsEditor
                      value={product.specifications}
                      onChange={(specs) => updateNestedProduct(product.id, 'specifications', specs)}
                      accent="#059669"
                    />
                    <ProductOptionsEditor
                      value={product.productOptions}
                      onChange={(opts) => updateNestedProduct(product.id, 'productOptions', opts)}
                      accent="#6366f1"
                    />
                  </div>
                </details>

                {/* Images */}
                <div>
                  <label className="ga-label" style={{ '--lc': '#0284c7' }}>Product photos *</label>
                  <p className="ga-photos-hint">Upload at least one image</p>
                  <div className="ga-photos">
                    {product.previews.map((image, imgIdx) => (
                      <div key={imgIdx} className="ga-photo">
                        <button
                          type="button"
                          className="ga-photo-x"
                          aria-label="Remove image"
                          onClick={() => removeProductImage(product.id, image, imgIdx)}
                        >
                          ✕
                        </button>
                        <div className="ga-photo-img">
                          <img src={image} alt="" />
                        </div>
                      </div>
                    ))}
                    <UploadBox
                      multiple
                      name="images"
                      url="/api/product/uploadImages"
                      setPreviewsFun={(arr) => setProductPreviews(product.id, arr)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add product button */}
          <button type="button" className="ga-add" onClick={addProduct}>
            <FaPlus size={11} /> Add Another Product
          </button>

          {/* Submit */}
          <button type="submit" className="ga-submit" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              <>
                <FaCloudUploadAlt size={17} /> Add {products.length} Product{products.length !== 1 ? 's' : ''} to My Shop
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
};

export default BulkAddProduct;