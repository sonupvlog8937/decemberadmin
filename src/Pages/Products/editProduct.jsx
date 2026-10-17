import React, { useContext, useEffect, useMemo, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdClose } from 'react-icons/io';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdImage, MdInfo, MdLocalOffer, MdCategory, MdSell } from 'react-icons/md';
import { TbColorFilter, TbListDetails, TbSeo, TbSettings } from 'react-icons/tb';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../../Components/UploadBox';
import ProductOptionsWithPrice from '../../Components/ProductOptionsWithPrice';
import { MyContext } from '../../App';
import { deleteImages, editData, fetchDataFromApi } from '../../utils/api';
import GroceryEditProduct from './GroceryEditProduct';
import RestaurantEditProduct from './RestaurantEditProduct';

// ─── Colors (har section ka apna colour) ─────────────────────────────────────
const C = {
  basic: '#FF6B2B', seo: '#8B5CF6', category: '#3B82F6', price: '#10B981', variants: '#F59E0B',
  colour: '#EC4899', specs: '#14B8A6', options: '#6366F1', images: '#F43F5E', banner: '#06B6D4',
};

const SECTIONS = [
  { id: 'basic', label: 'Basic', color: C.basic },
  { id: 'seo', label: 'SEO', color: C.seo },
  { id: 'category', label: 'Category', color: C.category },
  { id: 'price', label: 'Price', color: C.price },
  { id: 'variants', label: 'Variants', color: C.variants },
  { id: 'colour', label: 'Colours', color: C.colour },
  { id: 'specs', label: 'Specs', color: C.specs },
  { id: 'images', label: 'Photos', color: C.images },
  { id: 'banner', label: 'Banner', color: C.banner },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.ep, .ep * { box-sizing: border-box; font-family: 'Outfit', system-ui, sans-serif; }
.ep { font-size: 12.5px; color: #1E293B; min-height: 100%; padding-bottom: 8px;
  background: linear-gradient(135deg, #FFF7F0 0%, #F5F3FF 40%, #ECFEFF 75%, #FFF1F5 100%); background-size: 300% 300%; animation: ep-bg 20s ease infinite; }
@keyframes ep-bg { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes ep-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ep-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
@keyframes ep-spin { to { transform: rotate(360deg); } }
@keyframes ep-shine { to { background-position: 200% center; } }
@keyframes ep-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,.5); } 50% { box-shadow: 0 0 0 6px rgba(245,158,11,0); } }

.ep-head { position: sticky; top: 0; z-index: 6; padding: 12px 16px 10px; background: rgba(255,255,255,.85); backdrop-filter: blur(10px);
  border-bottom: 1px solid #EEF0F6; }
.ep-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ep-title { font-size: 18px; font-weight: 800; letter-spacing: -.01em; margin: 0;
  background: linear-gradient(90deg, #FF6B2B, #EC4899, #8B5CF6, #3B82F6, #FF6B2B); background-size: 200% auto;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: ep-shine 6s linear infinite; }
.ep-sub { font-size: 11.5px; color: #94A3B8; margin: 2px 0 0; }
.ep-prog { min-width: 170px; }
.ep-prog-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 5px; }
.ep-track { height: 6px; border-radius: 99px; background: #E2E8F0; overflow: hidden; }
.ep-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #FF6B2B, #EC4899, #8B5CF6); transition: width .6s cubic-bezier(.2,.8,.2,1); }
.ep-nav { display: flex; gap: 6px; overflow-x: auto; margin-top: 10px; padding-bottom: 2px; scrollbar-width: none; }
.ep-nav::-webkit-scrollbar { display: none; }
.ep-pill { --c: #FF6B2B; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--c) 30%, white); background: color-mix(in srgb, var(--c) 9%, white);
  color: var(--c); font-size: 11.5px; font-weight: 600; padding: 5px 12px; border-radius: 99px; cursor: pointer; transition: transform .2s, background .2s, color .2s, box-shadow .2s; }
.ep-pill:hover { background: var(--c); color: #fff; transform: translateY(-1px); box-shadow: 0 6px 14px color-mix(in srgb, var(--c) 35%, transparent); }

.ep-body { padding: 14px 16px 0; max-width: 980px; margin: 0 auto; }
.ep-sec { --c: #FF6B2B; scroll-margin-top: 130px; background: rgba(255,255,255,.92); border: 1px solid #EEF0F6; border-radius: 16px; margin-bottom: 14px; overflow: hidden;
  box-shadow: inset 0 3px 0 var(--c), 0 4px 18px rgba(99,102,241,.07); animation: ep-up .5s cubic-bezier(.2,.8,.2,1) both; transition: transform .3s, box-shadow .3s; }
.ep-sec:hover { transform: translateY(-2px); box-shadow: inset 0 3px 0 var(--c), 0 10px 26px rgba(99,102,241,.13); }
.ep-sec-head { display: flex; align-items: center; gap: 10px; padding: 14px 18px 12px; }
.ep-chip { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; font-size: 16px; color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, white); transition: transform .3s; }
.ep-sec:hover .ep-chip { transform: rotate(-8deg) scale(1.08); }
.ep-sec-title { font-size: 13.5px; font-weight: 700; }
.ep-sec-sub { font-size: 11.5px; color: #94A3B8; }
.ep-sec-body { padding: 0 18px 18px; }

.ep-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px 14px; }
.ep-col { display: flex; flex-direction: column; gap: 12px; }
.ep-label { display: block; margin-bottom: 5px; font-size: 11px; font-weight: 600; color: #64748B; }
.ep input:not([type=color]):not([type=file]):not(.MuiSelect-nativeInput), .ep textarea {
  width: 100%; border: 1px solid #E2E8F0; background: #fff; border-radius: 10px; font-size: 12.5px; color: #0F172A; outline: none;
  transition: border-color .25s, box-shadow .25s; }
.ep input:not([type=color]):not([type=file]):not(.MuiSelect-nativeInput) { height: 40px; padding: 0 12px; }
.ep textarea { padding: 10px 12px; resize: vertical; line-height: 1.55; }
.ep input::placeholder, .ep textarea::placeholder { color: #CBD5E1; }
.ep-sec input:focus:not([type=color]), .ep-sec textarea:focus { border-color: var(--c); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent); }
.ep input[readonly] { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }
.ep .MuiSelect-select, .ep .MuiMenuItem-root { font-size: 12.5px !important; }
.ep .MuiOutlinedInput-root { border-radius: 10px; background: #fff; }

.ep-card { display: flex; flex-direction: column; gap: 10px; padding: 12px; margin-bottom: 10px; border-radius: 12px; animation: ep-pop .3s ease both;
  background: color-mix(in srgb, var(--c) 5%, white); border: 1px solid color-mix(in srgb, var(--c) 18%, white); }
.ep-row3 { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; }
.ep-add { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer;
  color: var(--c); background: color-mix(in srgb, var(--c) 8%, white); border: 1px dashed var(--c); transition: transform .2s, background .2s; }
.ep-add:hover { background: color-mix(in srgb, var(--c) 16%, white); transform: translateY(-1px); }
.ep-del { width: 34px; height: 34px; border: 0; border-radius: 9px; display: grid; place-items: center; background: #FEE2E2; color: #DC2626; cursor: pointer; transition: transform .2s, background .2s; }
.ep-del:hover:not(:disabled) { background: #FECACA; transform: rotate(90deg); }
.ep-del:disabled { opacity: .4; cursor: not-allowed; }

.ep-imgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
.ep-tile { position: relative; animation: ep-pop .35s ease both; }
.ep-tile-frame { height: 110px; border-radius: 12px; overflow: hidden; border: 2px solid color-mix(in srgb, var(--c) 25%, white); background: #F8FAFC; transition: transform .25s, border-color .25s, box-shadow .25s; }
.ep-tile:hover .ep-tile-frame { transform: scale(1.04); border-color: var(--c); box-shadow: 0 8px 18px rgba(0,0,0,.12); }
.ep-tile-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ep-x { position: absolute; top: -6px; right: -6px; z-index: 3; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; background: #DC2626; color: #fff;
  display: grid; place-items: center; cursor: pointer; transition: transform .2s; }
.ep-x:hover { transform: scale(1.15) rotate(90deg); }
.ep-up { position: relative; height: 80px; border-radius: 10px; border: 1px dashed #CBD5E1; background: #F8FAFC; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: #94A3B8; font-size: 10px; font-weight: 600; cursor: pointer; transition: border-color .2s, background .2s, color .2s; }
.ep-up:hover { border-color: var(--c); background: color-mix(in srgb, var(--c) 8%, white); color: var(--c); }
.ep-up input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100% !important; height: 100% !important; }

.ep-bar { position: sticky; bottom: 0; z-index: 6; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255,255,255,.9); backdrop-filter: blur(10px); border-top: 1px solid #EEF0F6; margin-top: 6px; }
.ep-dirty { display: none; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #B45309; }
.ep-dirty i { width: 7px; height: 7px; border-radius: 50%; background: #F59E0B; animation: ep-pulse 1.6s ease infinite; }
.ep-submit { flex: 1; height: 46px; border: 0; border-radius: 12px; cursor: pointer; color: #fff; font-size: 13.5px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 9px; background-image: linear-gradient(135deg, #FF6B2B, #EC4899, #8B5CF6, #FF6B2B); background-size: 250% auto;
  box-shadow: 0 8px 22px rgba(236,72,153,.32); transition: transform .2s, box-shadow .25s, background-position .5s; }
.ep-submit:hover:not(:disabled) { background-position: right center; transform: translateY(-2px); box-shadow: 0 12px 28px rgba(236,72,153,.42); }
.ep-submit:active:not(:disabled) { transform: scale(.98); }
.ep-submit:disabled { opacity: .7; cursor: not-allowed; }
.ep-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.5); border-top-color: #fff; border-radius: 50%; animation: ep-spin .7s linear infinite; }
.ep-banner-box { background: color-mix(in srgb, var(--c) 6%, white); border: 1px solid color-mix(in srgb, var(--c) 20%, white); border-radius: 12px; padding: 14px; }

@media (min-width: 641px) { .ep-dirty.on { display: flex; } }
@media (max-width: 640px) {
  .ep-head { padding: 10px 12px 8px; }
  .ep-body { padding: 12px 12px 0; }
  .ep-row3 { grid-template-columns: 1fr; }
  .ep-row3 .ep-del { width: 100%; }
  .ep-prog { min-width: 100%; }
  .ep-sec-head { padding: 12px 14px 10px; } .ep-sec-body { padding: 0 14px 14px; }
}
@media (prefers-reduced-motion: reduce) { .ep, .ep * { animation: none !important; transition: none !important; } }
`;

const Section = ({ id, color, icon, title, sub, delay = 0, children }) => (
  <div id={`ep-${id}`} className="ep-sec" style={{ '--c': color, animationDelay: `${delay}ms` }}>
    <div className="ep-sec-head">
      <div className="ep-chip">{icon}</div>
      <div><div className="ep-sec-title">{title}</div>{sub && <div className="ep-sec-sub">{sub}</div>}</div>
    </div>
    <div className="ep-sec-body">{children}</div>
  </div>
);

const Fld = ({ label, children }) => (
  <div><label className="ep-label">{label}</label>{children}</div>
);

const chips = (selected) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
    {selected.map((v) => <Chip key={v} label={v} size="small" style={{ height: 20, fontSize: 11 }} />)}
  </div>
);

const emptyVal = (v) => v === '' || v === undefined || v === null;
const csvToList = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);

const EditProduct = () => {
  const [formFields, setFormFields] = useState({
    name: '', description: '', images: [], brand: '', keywords: '', price: '', oldPrice: '',
    category: '', catName: '', catId: '', subCatId: '', subCat: '', thirdsubCat: '', thirdsubCatId: '',
    countInStock: '', isFeatured: false, discount: '', productRam: [], sale: 0, size: [], productWeight: [],
    colorOptions: [{ name: '', code: '', images: '' }], specifications: [{ key: '', value: '' }], productOptions: [],
    bannerTitleName: '', bannerimages: [], isDisplayOnHomeBanner: false,
    tags: '', searchKeywords: '', seoDescription: '', attributes: '', title: '', productType: '',
  });

  const [productCat, setProductCat] = useState('');
  const [productSubCat, setProductSubCat] = useState('');
  const [productThirdLavelCat, setProductThirdLavelCat] = useState('');
  const [productRams, setProductRams] = useState([]);
  const [productRamsData, setProductRamsData] = useState([]);
  const [productWeight, setProductWeight] = useState([]);
  const [productWeightData, setProductWeightData] = useState([]);
  const [productSize, setProductSize] = useState([]);
  const [productSizeData, setProductSizeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [bannerPreviews, setBannerPreviews] = useState([]);
  const [checkedSwitch, setCheckedSwitch] = useState(false);
  const [dirty, setDirty] = useState(false);

  const history = useNavigate();
  const context = useContext(MyContext);
  const selectedCategory = context?.catData?.find((cat) => cat?._id === productCat);
  const availableSubCategories = selectedCategory?.children || [];
  const selectedSubCategory = availableSubCategories.find((s) => s?._id === productSubCat);
  const availableThirdLevelCategories = selectedSubCategory?.children || [];

  useEffect(() => {
    fetchDataFromApi('/api/product/productRAMS/get').then((res) => { if (res?.error === false) setProductRamsData(res?.data); });
    fetchDataFromApi('/api/product/productWeight/get').then((res) => { if (res?.error === false) setProductWeightData(res?.data); });
    fetchDataFromApi('/api/product/productSize/get').then((res) => { if (res?.error === false) setProductSizeData(res?.data); });

    fetchDataFromApi(`/api/product/${context?.isOpenFullScreenPanel?.id}`).then((res) => {
      const p = res?.product || {};
      setFormFields({
        name: p.name || '', description: p.description || '', images: p.images || [], brand: p.brand || '',
        keywords: (p.keywords || []).join(', '), price: p.price ?? '', oldPrice: p.oldPrice ?? '',
        category: p.category, catName: p.catName, catId: p.catId || '', subCatId: p.subCatId || '', subCat: p.subCat,
        thirdsubCat: p.thirdsubCat, thirdsubCatId: p.thirdsubCatId || '', countInStock: p.countInStock ?? '',
        isFeatured: p.isFeatured, discount: p.discount ?? '', sale: p.sale || 0,
        productRam: p.productRam || [], size: p.size || [], productWeight: p.productWeight || [],
        colorOptions: (p.colorOptions || []).length !== 0
          ? p.colorOptions.map((item) => ({ ...item, images: (item.images || []).join(', ') }))
          : [{ name: '', code: '', images: '' }],
        specifications: (p.specifications || []).length !== 0 ? p.specifications : [{ key: '', value: '' }],
        productOptions: (p.productOptions || []).length !== 0 ? p.productOptions : [],
        bannerTitleName: p.bannerTitleName || '', bannerimages: p.bannerimages || [],
        isDisplayOnHomeBanner: p.isDisplayOnHomeBanner,
        tags: (p.tags || []).join(', '), searchKeywords: p.searchKeywords || '', seoDescription: p.seoDescription || '',
        attributes: p.attributes || '', title: p.title || '', productType: p.productType || '',
      });
      setProductCat(p.catId || '');
      setProductSubCat(p.subCatId || '');
      setProductThirdLavelCat(p.thirdsubCatId || '');
      setProductRams(p.productRam || []);
      setProductSize(p.size || []);
      setProductWeight(p.productWeight || []);
      setCheckedSwitch(!!p.isDisplayOnHomeBanner);
      setPreviews(p.images || []);
      setBannerPreviews(p.bannerimages || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (obj) => { setFormFields((p) => ({ ...p, ...obj })); setDirty(true); };

  const handleChangeProductCat = (e) => {
    const id = e.target.value;
    const cat = context?.catData?.find((c) => c?._id === id);
    setProductCat(id); setProductSubCat(''); setProductThirdLavelCat('');
    patch({ catId: id, category: id, catName: cat?.name || '', subCatId: '', subCat: '', thirdsubCatId: '', thirdsubCat: '' });
  };
  const handleChangeProductSubCat = (e) => {
    const id = e.target.value;
    const sc = availableSubCategories.find((s) => s?._id === id);
    setProductSubCat(id); setProductThirdLavelCat('');
    patch({ subCatId: id, subCat: sc?.name || '', thirdsubCatId: '', thirdsubCat: '' });
  };
  const handleChangeProductThirdLavelCat = (e) => {
    const id = e.target.value;
    const tc = availableThirdLevelCategories.find((t) => t?._id === id);
    setProductThirdLavelCat(id);
    patch({ thirdsubCatId: id, thirdsubCat: tc?.name || '' });
  };
  const multi = (setter, key) => (e) => {
    const v = e.target.value;
    const arr = typeof v === 'string' ? v.split(',') : v;
    setter(arr);
    patch({ [key]: arr });
  };

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setDirty(true);
    setFormFields((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'price' || name === 'oldPrice') {
        const price = parseFloat(updated.price);
        const oldPrice = parseFloat(updated.oldPrice);
        updated.discount = price > 0 && oldPrice > 0 && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
      }
      return updated;
    });
  };

  const updateList = (key, i, field, value) => {
    setFormFields((p) => {
      const arr = [...p[key]];
      arr[i] = { ...arr[i], [field]: value };
      return { ...p, [key]: arr };
    });
    setDirty(true);
  };
  const addItem = (key, item) => patch({ [key]: [...formFields[key], item] });
  const removeItem = (key, i) => patch({ [key]: formFields[key].filter((_, idx) => idx !== i) });

  const setPreviewsFun = (arr) => { setPreviews((p) => [...p, ...arr]); setDirty(true); };
  const setBannerImagesFun = (arr) => { setBannerPreviews((p) => [...p, ...arr]); setDirty(true); };
  const removeImg = (image, index) => {
    deleteImages(`/api/category/deteleImage?img=${image}`).then(() => { setPreviews((p) => p.filter((_, i) => i !== index)); setDirty(true); });
  };
  const removeBannerImg = (image, index) => {
    deleteImages(`/api/category/deteleImage?img=${image}`).then(() => { setBannerPreviews((p) => p.filter((_, i) => i !== index)); setDirty(true); });
  };
  const handleChangeSwitch = (e) => { setCheckedSwitch(e.target.checked); setDirty(true); };

  const uploadColorImages = (index, colorItem, files) => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    fetch(`${import.meta.env.VITE_API_URL}/api/product/uploadImages`, {
      method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, body: fd,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.images) updateList('colorOptions', index, 'images', [...csvToList(colorItem.images), ...data.images].join(', '));
      })
      .catch((err) => console.error('Upload error:', err));
  };

  const completion = useMemo(() => {
    const checks = [formFields.name, formFields.description, formFields.catId, formFields.price, formFields.oldPrice, formFields.countInStock, formFields.brand, previews.length > 0];
    return Math.round((checks.filter((v) => !emptyVal(v) && v !== false && v !== 0).length / checks.length) * 100);
  }, [formFields, previews.length]);

  const handleSubmitg = (e) => {
    e.preventDefault();
    const checks = [
      [emptyVal(formFields.name), 'Please enter product name'],
      [emptyVal(formFields.description), 'Please enter product description'],
      [emptyVal(formFields.catId), 'Please select product category'],
      [emptyVal(formFields.price), 'Please enter product price'],
      [emptyVal(formFields.oldPrice), 'Please enter product MRP Price'],
      [emptyVal(formFields.countInStock), 'Please enter product stock'],
      [emptyVal(formFields.brand), 'Please enter product brand'],
      [previews.length === 0, 'Please select product images'],
    ];
    for (const [fail, msg] of checks) {
      if (fail) { context.alertBox('error', msg); return false; }
    }

    const payload = {
      ...formFields,
      images: previews,
      bannerimages: bannerPreviews,
      isDisplayOnHomeBanner: checkedSwitch,
      rating: undefined,
      colorOptions: (formFields.colorOptions || [])
        .map((item) => ({ ...item, images: csvToList(item.images) }))
        .filter((item) => item.name),
      specifications: (formFields.specifications || []).filter((item) => item.key && item.value),
      productOptions: (formFields.productOptions || [])
        .filter((opt) => opt.name && opt.values && opt.values.length > 0)
        .map((opt) => ({
          name: opt.name,
          values: opt.values.filter((v) => v.value && v.price).map((v) => ({ value: v.value, price: Number(v.price), mrp: Number(v.mrp) || 0 })),
        })),
      keywords: csvToList(formFields.keywords),
      tags: csvToList(formFields.tags),
      searchKeywords: formFields.searchKeywords || '',
      seoDescription: formFields.seoDescription || '',
      attributes: formFields.attributes || '',
      title: formFields.title || formFields.name,
      productType: formFields.productType || '',
    };

    setIsLoading(true);
    editData(`/api/product/updateProduct/${context?.isOpenFullScreenPanel?.id}`, payload).then((res) => {
      if (res?.data?.error === false) {
        context.alertBox('success', res?.data?.message);
        setDirty(false);
        setTimeout(() => {
          setIsLoading(false);
          context.setIsOpenFullScreenPanel({ open: false });
          history('/products');
        }, 1000);
      } else {
        setIsLoading(false);
        context.alertBox('error', res?.data?.message);
      }
    }).catch(() => setIsLoading(false));
  };

  const go = (id) => document.getElementById(`ep-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const f = formFields;
  const imgGrid = (list, onRemove, Upload) => (
    <div className="ep-imgs">
      {list.map((image, index) => (
        <div className="ep-tile" key={image + index}>
          <span className="ep-x" onClick={() => onRemove(image, index)}><IoMdClose size={12} /></span>
          <div className="ep-tile-frame"><img src={image} alt="" /></div>
        </div>
      ))}
      {Upload}
    </div>
  );

  return (
    <section className="ep">
      <style>{CSS}</style>

      {/* Sticky header */}
      <div className="ep-head">
        <div className="ep-head-row">
          <div>
            <h1 className="ep-title">Edit Product</h1>
            <p className="ep-sub">Update details, pricing, variants and photos</p>
          </div>
          <div className="ep-prog">
            <div className="ep-prog-top"><span style={{ color: '#8B5CF6' }}>Completion</span><span style={{ color: '#EC4899' }}>{completion}%</span></div>
            <div className="ep-track"><div className="ep-fill" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>
        <div className="ep-nav">
          {SECTIONS.map((s) => <button key={s.id} type="button" className="ep-pill" style={{ '--c': s.color }} onClick={() => go(s.id)}>{s.label}</button>)}
        </div>
      </div>

      <form onSubmit={handleSubmitg}>
        <div className="ep-body">

          <Section id="basic" color={C.basic} icon={<MdInfo />} title="Basic Information" sub="Name, description and keywords" delay={0}>
            <div className="ep-col">
              <Fld label="Product Name *"><input type="text" name="name" value={f.name} onChange={onChangeInput} placeholder="e.g. iPhone 15 Pro Max 256GB" /></Fld>
              <Fld label="Display Title (product page)"><input type="text" name="title" value={f.title} onChange={onChangeInput} placeholder="Leave blank to use product name" /></Fld>
              <Fld label="Product Description *"><textarea name="description" rows={5} value={f.description} onChange={onChangeInput} placeholder="Detailed product description…" /></Fld>
              <Fld label="Search Keywords (comma separated)"><input type="text" name="keywords" value={f.keywords} onChange={onChangeInput} placeholder="e.g. tshirt, cotton, summer wear" /></Fld>
            </div>
          </Section>

          <Section id="seo" color={C.seo} icon={<TbSeo />} title="SEO & Search Optimization" sub="Improve product discoverability" delay={50}>
            <div className="ep-col">
              <Fld label="Product Tags (comma separated)"><input type="text" name="tags" value={f.tags} onChange={onChangeInput} placeholder="e.g. trending, new, bestseller" /></Fld>
              <Fld label="Search Keywords"><input type="text" name="searchKeywords" value={f.searchKeywords} onChange={onChangeInput} placeholder="Additional search terms for better matching" /></Fld>
              <Fld label="SEO Description"><textarea name="seoDescription" rows={3} value={f.seoDescription} onChange={onChangeInput} placeholder="Short description for search engines" /></Fld>
              <div className="ep-grid">
                <Fld label="Product Attributes"><input type="text" name="attributes" value={f.attributes} onChange={onChangeInput} placeholder="e.g. waterproof, wireless" /></Fld>
                <Fld label="Product Type"><input type="text" name="productType" value={f.productType} onChange={onChangeInput} placeholder="e.g. Electronics, Clothing" /></Fld>
              </div>
            </div>
          </Section>

          <Section id="category" color={C.category} icon={<MdCategory />} title="Category" sub="Assign product to categories" delay={100}>
            <div className="ep-grid">
              <Fld label="Category *">
                <Select size="small" fullWidth displayEmpty value={productCat} onChange={handleChangeProductCat}>
                  <MenuItem value="" disabled>Select category</MenuItem>
                  {context?.catData?.map((cat) => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
                </Select>
              </Fld>
              <Fld label="Sub Category">
                <Select size="small" fullWidth displayEmpty disabled={!productCat} value={productSubCat} onChange={handleChangeProductSubCat}>
                  <MenuItem value="">Select sub category</MenuItem>
                  {availableSubCategories.map((sc) => <MenuItem key={sc._id} value={sc._id}>{sc.name}</MenuItem>)}
                </Select>
              </Fld>
              <Fld label="Third Level Category">
                <Select size="small" fullWidth displayEmpty disabled={!productSubCat} value={productThirdLavelCat} onChange={handleChangeProductThirdLavelCat}>
                  <MenuItem value="">Select third level</MenuItem>
                  {availableThirdLevelCategories.map((tc) => <MenuItem key={tc._id} value={tc._id}>{tc.name}</MenuItem>)}
                </Select>
              </Fld>
            </div>
          </Section>

          <Section id="price" color={C.price} icon={<MdLocalOffer />} title="Pricing & Inventory" sub="Prices, stock and auto discount" delay={150}>
            <div className="ep-grid">
              <Fld label="Price *"><input type="number" name="price" value={f.price} onChange={onChangeInput} placeholder="0.00" /></Fld>
              <Fld label="MRP Price *"><input type="number" name="oldPrice" value={f.oldPrice} onChange={onChangeInput} placeholder="0.00" /></Fld>
              <Fld label="Discount % (Auto)"><input type="number" name="discount" value={f.discount} readOnly placeholder="Auto-calculated" /></Fld>
              <Fld label="Stock Count *"><input type="number" name="countInStock" value={f.countInStock} onChange={onChangeInput} placeholder="0" /></Fld>
              <Fld label="Sales Count"><input type="number" name="sale" value={f.sale} onChange={onChangeInput} placeholder="0" /></Fld>
              <Fld label="Brand *"><input type="text" name="brand" value={f.brand} onChange={onChangeInput} placeholder="e.g. Apple" /></Fld>
            </div>
          </Section>

          <Section id="variants" color={C.variants} icon={<MdSell />} title="Product Variants" sub="RAM, size, weight options" delay={200}>
            <div className="ep-grid">
              {productRamsData.length > 0 && (
                <Fld label="RAM Options">
                  <Select multiple size="small" fullWidth value={productRams} onChange={multi(setProductRams, 'productRam')} renderValue={chips}>
                    {productRamsData.map((item, i) => <MenuItem key={i} value={item.name}>{item.name}</MenuItem>)}
                  </Select>
                </Fld>
              )}
              {productWeightData.length > 0 && (
                <Fld label="Weight Options">
                  <Select multiple size="small" fullWidth value={productWeight} onChange={multi(setProductWeight, 'productWeight')} renderValue={chips}>
                    {productWeightData.map((item, i) => <MenuItem key={i} value={item.name}>{item.name}</MenuItem>)}
                  </Select>
                </Fld>
              )}
              {productSizeData.length > 0 && (
                <Fld label="Size Options">
                  <Select multiple size="small" fullWidth value={productSize} onChange={multi(setProductSize, 'size')} renderValue={chips}>
                    {productSizeData.map((item, i) => <MenuItem key={i} value={item.name}>{item.name}</MenuItem>)}
                  </Select>
                </Fld>
              )}
              {!productRamsData.length && !productWeightData.length && !productSizeData.length && (
                <p style={{ color: '#94A3B8', margin: 0 }}>Koi variant options available nahi hain.</p>
              )}
            </div>
          </Section>

          <Section id="colour" color={C.colour} icon={<TbColorFilter />} title="Colour Options" sub="Colour variants with images" delay={250}>
            {f.colorOptions.map((colorItem, index) => (
              <div key={index} className="ep-card" style={{ '--c': C.colour }}>
                <div className="ep-row3">
                  <Fld label="Colour Name"><input placeholder="Red" value={colorItem.name} onChange={(e) => updateList('colorOptions', index, 'name', e.target.value)} /></Fld>
                  <Fld label="Colour Code">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="color" value={colorItem.code || '#000000'} onChange={(e) => updateList('colorOptions', index, 'code', e.target.value)}
                        style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                      <input placeholder="#ff0000" value={colorItem.code} onChange={(e) => updateList('colorOptions', index, 'code', e.target.value)} />
                    </div>
                  </Fld>
                  <button type="button" className="ep-del" disabled={f.colorOptions.length === 1} onClick={() => removeItem('colorOptions', index)}><IoMdClose size={15} /></button>
                </div>
                <div>
                  <label className="ep-label">Colour Images</label>
                  <div className="ep-imgs" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 8 }}>
                    {csvToList(colorItem.images).map((img, imgIdx) => (
                      <div key={imgIdx} className="ep-tile" style={{ '--c': C.colour }}>
                        <span className="ep-x" onClick={() => {
                          const imgs = csvToList(colorItem.images); imgs.splice(imgIdx, 1);
                          updateList('colorOptions', index, 'images', imgs.join(', '));
                        }}><IoMdClose size={11} /></span>
                        <div className="ep-tile-frame" style={{ height: 76 }}><img src={img} alt="" /></div>
                      </div>
                    ))}
                    <div className="ep-up" style={{ '--c': C.colour }}>
                      <MdImage size={22} /><span>Upload</span>
                      <input type="file" accept="image/*" multiple onChange={(e) => { uploadColorImages(index, colorItem, Array.from(e.target.files)); e.target.value = ''; }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="ep-add" style={{ '--c': C.colour }} onClick={() => addItem('colorOptions', { name: '', code: '', images: '' })}>+ Add Colour</button>
          </Section>

          <Section id="specs" color={C.specs} icon={<TbListDetails />} title="Specifications" sub="Display size, battery etc." delay={300}>
            {f.specifications.map((spec, index) => (
              <div key={index} className="ep-card" style={{ '--c': C.specs }}>
                <div className="ep-row3">
                  <Fld label="Spec Key"><input placeholder="Display Size" value={spec.key} onChange={(e) => updateList('specifications', index, 'key', e.target.value)} /></Fld>
                  <Fld label="Spec Value"><input placeholder="6.7 inch OLED" value={spec.value} onChange={(e) => updateList('specifications', index, 'value', e.target.value)} /></Fld>
                  <button type="button" className="ep-del" disabled={f.specifications.length === 1} onClick={() => removeItem('specifications', index)}><IoMdClose size={15} /></button>
                </div>
              </div>
            ))}
            <button type="button" className="ep-add" style={{ '--c': C.specs }} onClick={() => addItem('specifications', { key: '', value: '' })}>+ Add Specification</button>
          </Section>

          <Section id="options" color={C.options} icon={<TbSettings />} title="Product Options" sub="Options with individual prices" delay={350}>
            <ProductOptionsWithPrice value={f.productOptions} onChange={(opts) => patch({ productOptions: opts })} />
          </Section>

          <Section id="images" color={C.images} icon={<MdImage />} title="Product Images *" sub="High-quality product photos" delay={400}>
            {imgGrid(previews, removeImg,
              <UploadBox multiple={true} name="images" url="/api/product/uploadImages" setPreviewsFun={setPreviewsFun} />)}
          </Section>

          <Section id="banner" color={C.banner} icon={<MdImage />} title="Banner Images" sub="Home banner display (optional)" delay={450}>
            <div className="ep-banner-box" style={{ '--c': C.banner }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Display on Home Banner</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Show this product on the home page banner slider</div>
                </div>
                <Switch onChange={handleChangeSwitch} checked={checkedSwitch} sx={{ ml: 'auto' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                {imgGrid(bannerPreviews, removeBannerImg,
                  <UploadBox multiple={true} name="bannerimages" url="/api/product/uploadBannerImages" setPreviewsFun={setBannerImagesFun} />)}
              </div>
              <Fld label="Banner Title">
                <input type="text" name="bannerTitleName" value={f.bannerTitleName} onChange={onChangeInput} placeholder="e.g. New Arrivals — Summer Collection" />
              </Fld>
            </div>
          </Section>
        </div>

        {/* Sticky action bar */}
        <div className="ep-bar">
          <span className={`ep-dirty${dirty ? ' on' : ''}`}><i /> Unsaved changes</span>
          <button type="submit" disabled={isLoading} className="ep-submit">
            {isLoading ? <><span className="ep-spinner" /> Publishing…</> : <><FaCloudUploadAlt size={17} /> Publish and View</>}
          </button>
        </div>
      </form>
    </section>
  );
};

const EditProductRoute = () => {
  const context = useContext(MyContext);
  const role = context?.userData?.role;

  // All GoMarket shop sellers use GroceryEditProduct
  const GO_MARKET_SHOP_SELLERS = [
    'GROCERY_SELLER', 'FASHION_SELLER', 'ELECTRONICS_SELLER', 'MEDICAL_SELLER',
    'BEAUTY_SELLER', 'HOME_KITCHEN_SELLER', 'GIFTS_TOYS_SELLER',
    'BOOKS_STATIONERY_SELLER', 'JEWELLERY_SELLER', 'HARDWARE_SELLER', 'AUTOMOBILE_SELLER',
  ];

  if (GO_MARKET_SHOP_SELLERS.includes(role)) return <GroceryEditProduct />;
  if (role === 'RESTAURANT_SELLER') return <RestaurantEditProduct />;
  return <EditProduct />;
};

export default EditProductRoute;