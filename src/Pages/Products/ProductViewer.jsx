import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import { MdArrowBack, MdOutlineInventory2, MdCategory, MdChevronRight, MdStar } from 'react-icons/md';
import { TbListDetails, TbSettings, TbPhotoOff } from 'react-icons/tb';
import { FiAlignLeft } from 'react-icons/fi';

// Specs / options ke liye rotating colours
const PALETTE = ['#FF6B2B', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.pv, .pv * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; }
.pv { font-size: 12.5px; color: #1E293B; min-height: 100%; padding: 16px 16px 40px;
  background: linear-gradient(135deg, #FFF7F0 0%, #F5F3FF 40%, #ECFEFF 75%, #FFF1F5 100%); background-size: 300% 300%; animation: pv-bg 20s ease infinite; }
.pv-wrap { max-width: 1040px; margin: 0 auto; }

@keyframes pv-bg { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes pv-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes pv-img { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
@keyframes pv-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
@keyframes pv-spin { to { transform: rotate(360deg); } }
@keyframes pv-shine { to { background-position: 200% center; } }
@keyframes pv-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

.pv-in { animation: pv-up .55s cubic-bezier(.2,.8,.2,1) both; }
.pv-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.pv-back { width: 36px; height: 36px; border: 1px solid #E2E8F0; border-radius: 11px; background: #fff; color: #475569; cursor: pointer; display: grid; place-items: center;
  transition: transform .25s, background .25s, color .25s, box-shadow .25s; }
.pv-back:hover { background: linear-gradient(135deg, #FF6B2B, #EC4899); color: #fff; border-color: transparent; transform: translateX(-3px); box-shadow: 0 6px 16px rgba(236,72,153,.3); }
.pv-title { font-size: 18px; font-weight: 800; margin: 0; letter-spacing: -.01em;
  background: linear-gradient(90deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6, #FF6B2B); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: pv-shine 6s linear infinite; }
.pv-sub { font-size: 11.5px; color: #94A3B8; margin: 2px 0 0; }

.pv-card { background: rgba(255,255,255,.92); border: 1px solid #EEF0F6; border-radius: 18px; box-shadow: 0 4px 18px rgba(99,102,241,.08); transition: box-shadow .3s, transform .3s; }
.pv-card:hover { box-shadow: 0 10px 28px rgba(99,102,241,.14); }
.pv-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; padding: 22px; margin-bottom: 16px; }

/* Gallery */
.pv-stage { height: 400px; border-radius: 16px; overflow: hidden; background: #F8FAFC; border: 1px solid #E2E8F0; position: relative; }
.pv-stage img { width: 100%; height: 100%; object-fit: cover; animation: pv-img .45s ease both; transition: transform .6s ease; }
.pv-stage:hover img { transform: scale(1.06); }
.pv-stage-badge { position: absolute; top: 12px; left: 12px; z-index: 2; padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #10B981, #06B6D4); box-shadow: 0 6px 14px rgba(16,185,129,.35); animation: pv-pop .4s ease both; }
.pv-empty { height: 400px; border-radius: 16px; border: 1px dashed #CBD5E1; background: #F8FAFC; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #94A3B8; }
.pv-thumbs { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding: 4px 2px 6px; scrollbar-width: thin; }
.pv-thumb { flex-shrink: 0; width: 64px; height: 64px; border-radius: 12px; overflow: hidden; padding: 0; cursor: pointer; background: #fff; border: 2px solid transparent; opacity: .6;
  transition: transform .25s, opacity .25s, border-color .25s, box-shadow .25s; }
.pv-thumb:hover { opacity: 1; transform: translateY(-3px); }
.pv-thumb.on { opacity: 1; border-color: #8B5CF6; box-shadow: 0 6px 14px rgba(139,92,246,.35); transform: translateY(-3px); }
.pv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Info */
.pv-name { font-size: 20px; font-weight: 800; line-height: 1.3; margin: 0 0 6px; }
.pv-alt { font-size: 12.5px; color: #64748B; margin: 0 0 14px; }
.pv-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 14px 16px; border-radius: 14px; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(255,107,43,.09), rgba(236,72,153,.09), rgba(139,92,246,.09)); border: 1px solid rgba(236,72,153,.18); }
.pv-sell { font-size: 26px; font-weight: 800; background: linear-gradient(90deg, #FF6B2B, #EC4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pv-mrp { font-size: 14px; color: #94A3B8; text-decoration: line-through; }
.pv-off { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; color: #15803D; background: #DCFCE7; animation: pv-pop .4s ease both; }
.pv-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.pv-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; animation: pv-pop .4s ease both; }
.pv-h3 { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; margin: 0 0 8px; }
.pv-h3 span { width: 24px; height: 24px; border-radius: 8px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 14%, white); }
.pv-block { margin-bottom: 16px; }
.pv-desc { font-size: 12.5px; line-height: 1.7; color: #475569; margin: 0; white-space: pre-line; }
.pv-crumb { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.pv-crumb b { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #1D4ED8; background: #DBEAFE; }
.pv-crumb svg { color: #94A3B8; }

/* Sections below */
.pv-sec { padding: 20px 22px; margin-bottom: 16px; --c: #14B8A6; box-shadow: inset 0 3px 0 var(--c), 0 4px 18px rgba(99,102,241,.08); border-radius: 18px; }
.pv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; }
.pv-spec { --c: #14B8A6; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; animation: pv-pop .4s ease both;
  background: color-mix(in srgb, var(--c) 7%, white); border: 1px solid color-mix(in srgb, var(--c) 22%, white); transition: transform .25s, box-shadow .25s; }
.pv-spec:hover { transform: translateY(-2px); box-shadow: 0 8px 18px color-mix(in srgb, var(--c) 22%, transparent); }
.pv-spec i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex-shrink: 0; }
.pv-spec .k { font-size: 11.5px; font-weight: 600; color: #64748B; min-width: 84px; }
.pv-spec .v { font-size: 12px; font-weight: 700; color: #0F172A; word-break: break-word; }
.pv-opt { --c: #6366F1; padding: 12px 14px; border-radius: 12px; animation: pv-pop .4s ease both; background: color-mix(in srgb, var(--c) 6%, white); border: 1px solid color-mix(in srgb, var(--c) 20%, white); }
.pv-opt h4 { margin: 0 0 8px; font-size: 12.5px; font-weight: 700; color: var(--c); }
.pv-val { display: inline-block; margin: 0 6px 6px 0; padding: 5px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 600; color: var(--c); background: #fff;
  border: 1px solid color-mix(in srgb, var(--c) 35%, white); transition: transform .2s, background .2s, color .2s; }
.pv-val:hover { background: var(--c); color: #fff; transform: translateY(-2px); }

/* States */
.pv-center { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; }
.pv-spinner { width: 42px; height: 42px; border-radius: 50%; border: 3px solid #E2E8F0; border-top-color: #EC4899; border-right-color: #8B5CF6; animation: pv-spin .8s linear infinite; }
.pv-btn { padding: 10px 20px; border: 0; border-radius: 11px; cursor: pointer; color: #fff; font-size: 12.5px; font-weight: 600; background: linear-gradient(135deg, #FF6B2B, #EC4899);
  box-shadow: 0 8px 18px rgba(236,72,153,.3); transition: transform .2s; }
.pv-btn:hover { transform: translateY(-2px); }

@media (max-width: 820px) {
  .pv { padding: 12px 12px 32px; }
  .pv-main { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 14px; }
  .pv-stage, .pv-empty { height: 300px; }
  .pv-sec { padding: 16px; }
  .pv-sell { font-size: 22px; }
}
@media (prefers-reduced-motion: reduce) { .pv, .pv * { animation: none !important; transition: none !important; } }
`;

const asText = (v) => (v && typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''));
const nameOf = (v) => (v && typeof v === 'object' ? v.name : null);

const Heading = ({ icon, color, children }) => (
  <h3 className="pv-h3" style={{ '--c': color }}><span>{icon}</span>{children}</h3>
);

const ProductViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const endpoints = [`/api/product/${id}`, `/api/go-market/products/${id}`, `/api/go-market/items/${id}`];
        let found = null;
        for (const endpoint of endpoints) {
          const res = await fetchDataFromApi(endpoint);
          let p = res?.data || res?.product || res;
          if (p?.data && typeof p.data === 'object' && !Array.isArray(p.data)) p = p.data;
          if (p && !(p instanceof Error) && p.name !== 'AxiosError' && p.error !== true) { found = p; break; }
        }
        setProduct(found);
        setSlideIndex(0);
      } catch (err) {
        console.error('Error loading product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pv"><style>{CSS}</style>
        <div className="pv-center">
          <div className="pv-spinner" />
          <p style={{ color: '#94A3B8', margin: 0 }}>Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pv"><style>{CSS}</style>
        <div className="pv-center">
          <TbPhotoOff size={44} color="#CBD5E1" />
          <h2 style={{ margin: 0, fontSize: 18 }}>Product not found</h2>
          <button className="pv-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : product.image ? [product.image] : [];
  const specs = (Array.isArray(product.specifications) ? product.specifications : []).filter((s) => s && s.key && s.value);
  const options = (Array.isArray(product.productOptions) ? product.productOptions : []).filter((o) => o && o.name);

  // Marketplace: price = selling, oldPrice = MRP. GoMarket: ulta ho sakta hai. Isliye min/max se nikalte hain.
  const a = Number(product.price) || 0;
  const b = Number(product.oldPrice) || 0;
  const sell = b > 0 && a > 0 ? Math.min(a, b) : a || b;
  const mrp = b > 0 && a > 0 ? Math.max(a, b) : 0;
  const discount = mrp > sell ? Math.round(((mrp - sell) / mrp) * 100) : 0;

  const category = nameOf(product.categoryId) || nameOf(product.goMarketCategoryId) || product.catName || null;
  const subCategory = nameOf(product.subCategoryId) || nameOf(product.goMarketSubCategoryId) || product.subCat || null;

  const hasStock = product.countInStock !== undefined;
  const inStock = hasStock ? product.countInStock > 0 : product.isAvailable !== false;
  const stockLabel = hasStock
    ? (product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock')
    : (product.isAvailable === false ? 'Unavailable' : 'Available');

  return (
    <div className="pv">
      <style>{CSS}</style>
      <div className="pv-wrap">

        <div className="pv-top pv-in">
          <button className="pv-back" onClick={() => navigate(-1)} aria-label="Back"><MdArrowBack size={18} /></button>
          <div>
            <h1 className="pv-title">Product Preview</h1>
            <p className="pv-sub">Customer ko aisa dikhega</p>
          </div>
        </div>

        <div className="pv-card pv-main pv-in" style={{ animationDelay: '.06s' }}>
          {/* Gallery */}
          <div>
            {images.length > 0 ? (
              <>
                <div className="pv-stage">
                  {discount > 0 && <span className="pv-stage-badge">{discount}% OFF</span>}
                  <img key={slideIndex} src={images[slideIndex]} alt="Product" />
                </div>
                {images.length > 1 && (
                  <div className="pv-thumbs">
                    {images.map((img, idx) => (
                      <button key={idx} type="button" className={`pv-thumb${slideIndex === idx ? ' on' : ''}`} onClick={() => setSlideIndex(idx)}>
                        <img src={img} alt={`Thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="pv-empty"><TbPhotoOff size={38} /><span>No images available</span></div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="pv-name">{product.name}</h2>
            {product.title && product.title !== product.name && <p className="pv-alt">{product.title}</p>}

            <div className="pv-price">
              <span className="pv-sell">₹{sell.toLocaleString('en-IN')}</span>
              {mrp > sell && <span className="pv-mrp">₹{mrp.toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="pv-off">-{discount}%</span>}
            </div>

            <div className="pv-chips">
              <span className="pv-chip" style={{ background: inStock ? '#DCFCE7' : '#FEE2E2', color: inStock ? '#15803D' : '#991B1B' }}>
                <MdOutlineInventory2 size={14} /> {stockLabel}
              </span>
              {product.isFeatured && (
                <span className="pv-chip" style={{ background: '#FEF3C7', color: '#92400E', animationDelay: '.08s' }}><MdStar size={14} /> Featured</span>
              )}
            </div>

            {product.description && (
              <div className="pv-block">
                <Heading icon={<FiAlignLeft size={13} />} color="#8B5CF6">Description</Heading>
                <p className="pv-desc">{asText(product.description)}</p>
              </div>
            )}

            <div className="pv-block">
              <Heading icon={<MdCategory size={13} />} color="#3B82F6">Category</Heading>
              <div className="pv-crumb">
                <b>{category || 'N/A'}</b>
                {subCategory && <><MdChevronRight size={16} /><b style={{ background: '#E0E7FF', color: '#4338CA' }}>{subCategory}</b></>}
              </div>
            </div>
          </div>
        </div>

        {specs.length > 0 && (
          <div className="pv-card pv-sec pv-in" style={{ '--c': '#14B8A6', animationDelay: '.12s' }}>
            <Heading icon={<TbListDetails size={14} />} color="#14B8A6">Specifications</Heading>
            <div className="pv-grid" style={{ marginTop: 12 }}>
              {specs.map((spec, idx) => (
                <div key={idx} className="pv-spec" style={{ '--c': PALETTE[idx % PALETTE.length], animationDelay: `${idx * 40}ms` }}>
                  <i />
                  <span className="k">{asText(spec.key)}</span>
                  <span className="v">{asText(spec.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {options.length > 0 && (
          <div className="pv-card pv-sec pv-in" style={{ '--c': '#6366F1', animationDelay: '.18s' }}>
            <Heading icon={<TbSettings size={14} />} color="#6366F1">Product Options</Heading>
            <div className="pv-grid" style={{ marginTop: 12 }}>
              {options.map((option, idx) => (
                <div key={idx} className="pv-opt" style={{ '--c': PALETTE[(idx + 3) % PALETTE.length], animationDelay: `${idx * 40}ms` }}>
                  <h4>{asText(option.label || option.name)}</h4>
                  <div>
                    {(Array.isArray(option.values) ? option.values : []).map((val, vidx) => (
                      <span key={vidx} className="pv-val">
                        {val && typeof val === 'object' && 'value' in val
                          ? `${val.value}${val.price ? ` · ₹${val.price}` : ''}`
                          : asText(val)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductViewer;