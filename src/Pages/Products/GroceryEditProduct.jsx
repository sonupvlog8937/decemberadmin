import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdClose } from 'react-icons/io';
import {
  FaLeaf, FaStore, FaImage, FaRupeeSign, FaBoxes, FaTag,
  FaSave, FaCheckCircle, FaExclamationCircle,
  FaChevronDown, FaGripLinesVertical, FaUndo,
} from 'react-icons/fa';
import { MdCategory, MdInfo } from 'react-icons/md';
import { MyContext } from '../../App';
import { deleteImages, editData, fetchDataFromApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../../Components/UploadBox';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';

const ROLE_CATEGORY_TYPE = {
  GROCERY_SELLER: "grocery",
  FASHION_SELLER: "fashion",
  ELECTRONICS_SELLER: "electronics",
  MEDICAL_SELLER: "medical",
  BEAUTY_SELLER: "beauty",
  HOME_KITCHEN_SELLER: "home-kitchen",
  GIFTS_TOYS_SELLER: "gifts-toys",
  BOOKS_STATIONERY_SELLER: "books-stationery",
  JEWELLERY_SELLER: "jewellery",
  HARDWARE_SELLER: "hardware",
  AUTOMOBILE_SELLER: "automobile",
};

const getSellerCategoryType = (role) => ROLE_CATEGORY_TYPE[role] || "grocery";
const getSellerCategoryLabel = (role) => getSellerCategoryType(role).replace(/-/g, " ");

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

const DESCRIPTION_LIMIT = 500;
const SEO_DESC_LIMIT = 160;

const GroceryEditProduct = () => {
  const context = useContext(MyContext);
  const userRole = context?.userData?.role || localStorage.getItem('userRole') || '';
  const categoryType = getSellerCategoryType(userRole);
  const categoryLabel = getSellerCategoryLabel(userRole);
  const history = useNavigate();
  const productId = context?.isOpenFullScreenPanel?.id;

  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [subSubCategoryId, setSubSubCategoryId] = useState('');
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [errors, setErrors] = useState({});
  const [seoOpen, setSeoOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    price: '',
    oldPrice: '',
    countInStock: '',
    unit: 'piece',
    isFeatured: 'no',
    keywords: '',
    tags: '',
    searchKeywords: '',
    seoDescription: '',
    attributes: '',
    productType: '',
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [productOptions, setProductOptions] = useState([{ name: '', label: '', values: [] }]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const fieldRefs = useRef({});
  const snapshotRef = useRef(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!productId) return;

    Promise.all([
      fetchDataFromApi('/api/go-market/seller/grocery-shop'),
      fetchDataFromApi(`/api/go-market/categories?type=${categoryType}&limit=100&status=active`),
      fetchDataFromApi(`/api/go-market/products/${productId}`).catch(() =>
        fetchDataFromApi(`/api/product/${productId}`)
      ),
    ]).then(([shopRes, catRes, prodRes]) => {
      setShop(shopRes?.shop || null);
      setCategories(catRes?.data || []);

      // Handle different API response structures
      let p = prodRes;

      // Check various nesting levels
      if (prodRes?.data) {
        if (Array.isArray(prodRes.data)) {
          p = prodRes.data[0]; // If data is array, take first item
        } else if (typeof prodRes.data === 'object') {
          p = prodRes.data; // If data is object, use it
        }
      } else if (prodRes?.product) {
        p = prodRes.product;
      }

      console.log('Grocery Edit - Product data loaded:', p);

      if (p && typeof p === 'object') {
        const specs = p.specifications || p.specs || [];
        const unitSpec = specs.find(s => s.key === 'Unit');
        let unitValue = 'piece';
        if (unitSpec) {
          const found = UNITS.find(u => u.label.includes(unitSpec.value) || u.value === unitSpec.value);
          if (found) unitValue = found.value;
        }

        const nextForm = {
          name: p.name || '',
          title: p.title || '',
          description: p.description || '',
          price: String(p.price || p.discountPrice || ''),
          oldPrice: String(p.oldPrice || p.price || p.discountPrice || ''),
          countInStock: String(p.countInStock ?? p.stock ?? 0),
          unit: unitValue,
          isFeatured: p.isFeatured ? 'yes' : 'no',
          keywords: p.keywords || '',
          tags: p.tags || '',
          searchKeywords: p.searchKeywords || '',
          seoDescription: p.seoDescription || '',
          attributes: p.attributes || '',
          productType: p.productType || '',
        };
        setForm(nextForm);

        const nextCategoryId = p.categoryId || p.goMarketCategoryId || '';
        const nextSubCategoryId = p.subCategoryId || p.goMarketSubCategoryId || '';
        const nextSubSubCategoryId = p.subSubCategoryId || '';
        setCategoryId(nextCategoryId);
        setSubCategoryId(nextSubCategoryId);
        setSubSubCategoryId(nextSubSubCategoryId);

        let nextSpecs = [{ key: '', value: '' }];
        if (Array.isArray(specs) && specs.length > 0) {
          const filteredSpecs = specs.filter(s => s.key !== 'Unit');
          nextSpecs = filteredSpecs.length > 0 ? filteredSpecs : [{ key: '', value: '' }];
          setSpecifications(nextSpecs);
        }

        let nextOptions = [{ name: '', label: '', values: [] }];
        const opts = p.productOptions || p.options || [];
        if (Array.isArray(opts) && opts.length > 0) {
          nextOptions = opts;
          setProductOptions(nextOptions);
        }

        let imgs = [];
        if (Array.isArray(p.images)) {
          imgs = p.images;
        } else if (p.image && typeof p.image === 'string') {
          imgs = [p.image];
        }
        if (imgs.length > 0) {
          setPreviews(imgs);
        }

        // Snapshot the originally-loaded state so we can detect unsaved changes
        snapshotRef.current = JSON.stringify({
          form: nextForm, specifications: nextSpecs, productOptions: nextOptions, previews: imgs,
          categoryId: nextCategoryId, subCategoryId: nextSubCategoryId, subSubCategoryId: nextSubSubCategoryId,
        });
      } else {
        console.error('Grocery Edit - Invalid product data structure:', prodRes);
      }

      setLoadingMeta(false);
    }).catch((err) => {
      console.error('Error loading product:', err);
      context.alertBox('error', 'Could not load product details');
      setLoadingMeta(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      setSubCategoryId('');
      setSubSubCategories([]);
      setSubSubCategoryId('');
      return;
    }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${categoryId}&limit=100&status=active`).then((res) => {
      setSubCategories(res?.data || []);
    });
  }, [categoryId]);

  useEffect(() => {
    if (!subCategoryId) {
      setSubSubCategories([]);
      setSubSubCategoryId('');
      return;
    }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${subCategoryId}&limit=100&status=active`).then((res) => {
      setSubSubCategories(res?.data || []);
    });
  }, [subCategoryId]);

  // Track unsaved changes vs the originally loaded product
  const isDirty = useMemo(() => {
    if (!snapshotRef.current) return false;
    const current = JSON.stringify({ form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId });
    return current !== snapshotRef.current;
  }, [form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId]);

  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const discardChanges = () => {
    if (!snapshotRef.current) return;
    const snap = JSON.parse(snapshotRef.current);
    setForm(snap.form);
    setSpecifications(snap.specifications);
    setProductOptions(snap.productOptions);
    setPreviews(snap.previews);
    setCategoryId(snap.categoryId);
    setSubCategoryId(snap.subCategoryId);
    setSubSubCategoryId(snap.subSubCategoryId);
    setErrors({});
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setPreviewsFun = (arr) => {
    setPreviews((prev) => [...prev, ...arr]);
    if (errors.images) setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const removeImg = (image, index) => {
    deleteImages(`/api/category/deteleImage?img=${image}`).then(() => {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    });
  };

  const handleDragStart = (index) => { dragItem.current = index; };
  const handleDragEnter = (index) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) {
      dragItem.current = null; dragOverItem.current = null;
      return;
    }
    setPreviews((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragItem.current = null; dragOverItem.current = null;
  };

  const discountPercent = useMemo(() => {
    const mrp = Number(form.price);
    const sell = Number(form.oldPrice);
    if (!mrp || !sell || sell >= mrp) return 0;
    return Math.round(((mrp - sell) / mrp) * 100);
  }, [form.price, form.oldPrice]);

  const checklist = useMemo(() => ([
    { key: 'name', label: 'Product name', done: !!form.name.trim() },
    { key: 'description', label: 'Description', done: !!form.description.trim() },
    { key: 'category', label: categoryId ? (categories.find((c) => c._id === categoryId)?.name || 'Category selected') : 'Select category', done: !!categoryId },
    { key: 'price', label: form.price ? 'Price set' : 'Set price', done: !!form.price },
    { key: 'countInStock', label: form.countInStock ? 'Stock set' : 'Set stock', done: !!form.countInStock },
    { key: 'images', label: previews.length ? 'Photo added' : 'Add photo', done: previews.length > 0 },
  ]), [form, categoryId, categories, previews]);

  const completion = useMemo(() => {
    const done = checklist.filter((c) => c.done).length;
    return { done, total: checklist.length, percent: Math.round((done / checklist.length) * 100) };
  }, [checklist]);

  const seoFilledCount = useMemo(() => (
    [form.searchKeywords, form.tags, form.keywords, form.seoDescription, form.attributes].filter((v) => v?.trim()).length
  ), [form.searchKeywords, form.tags, form.keywords, form.seoDescription, form.attributes]);

  const scrollToField = (key) => {
    const el = fieldRefs.current[key];
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!shop) {
      context.alertBox('error', 'Your grocery shop is not set up. Please contact support or complete registration.');
      return;
    }

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Enter product name';
    if (!form.description.trim()) nextErrors.description = 'Enter product description';
    if (!categoryId) nextErrors.category = 'Select a category';
    if (!form.price) nextErrors.price = 'Enter MRP / price';
    if (!form.countInStock) nextErrors.countInStock = 'Enter stock quantity';
    if (previews.length === 0) nextErrors.images = 'Upload at least one product image';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstKey = Object.keys(nextErrors)[0];
      scrollToField(firstKey);
      context.alertBox('error', nextErrors[firstKey]);
      return;
    }

    const sellingPrice = form.oldPrice || form.price;
    const unitLabel = UNITS.find((u) => u.value === form.unit)?.label?.replace('Per ', '') || form.unit;
    const specRows = specifications.filter((s) => s.key?.trim() && s.value?.trim());
    if (unitLabel) specRows.push({ key: 'Unit', value: unitLabel });

    const payload = {
      name: form.name.trim(),
      title: (form.title || form.name).trim(),
      description: form.description.trim(),
      specifications: specRows,
      productOptions: normalizeProductOptionsForSubmit(productOptions),
      price: Number(form.price),
      discountPrice: Number(sellingPrice),
      oldPrice: Number(form.oldPrice || form.price),
      stock: Number(form.countInStock),
      countInStock: Number(form.countInStock),
      image: previews[0],
      images: previews,
      categoryId: categoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      subSubCategoryId: subSubCategoryId || undefined,
      goMarketCategoryId: categoryId || undefined,
      goMarketSubCategoryId: subCategoryId || undefined,
      goMarketSubSubCategoryId: subSubCategoryId || undefined,
      isFeatured: form.isFeatured === 'yes',
      keywords: form.keywords.trim(),
      tags: form.tags.trim(),
      searchKeywords: form.searchKeywords.trim(),
      seoDescription: form.seoDescription.trim(),
      attributes: form.attributes.trim(),
      productType: form.productType.trim(),
    };

    const markSavedAndClose = () => {
      snapshotRef.current = JSON.stringify({ form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId });
      setJustSaved(true);
      setTimeout(() => {
        context.setIsOpenFullScreenPanel({ open: false });
      }, 1000);
    };

    setIsLoading(true);
    editData(`/api/go-market/products/${productId}`, payload)
      .then((res) => {
        if (res?.error === false || res?.success === true) {
          context.alertBox('success', res?.message || 'Product updated successfully!');
          markSavedAndClose();
        } else {
          throw new Error(res?.message || 'Update failed');
        }
      })
      .catch((err) => {
        console.error('Update error:', err);
        editData(`/api/product/updateProduct/${productId}`, payload)
          .then((res) => {
            if (res?.data?.error === false) {
              context.alertBox('success', res?.data?.message || 'Product updated successfully!');
              markSavedAndClose();
            } else {
              context.alertBox('error', res?.data?.message || 'Could not update product');
            }
          })
          .catch(() => context.alertBox('error', 'Could not update product. Please try again.'))
          .finally(() => setIsLoading(false));
      })
      .finally(() => setIsLoading(false));
  };

  const selectSx = (hasError) => ({
    width: '100%',
    fontSize: 13,
    background: '#fff',
    borderRadius: '10px',
    '& .MuiOutlinedInput-notchedOutline': hasError ? { borderColor: '#f87171 !important' } : {},
    '& .MuiOutlinedInput-root': { borderRadius: '10px', minHeight: 44 },
  });

  const inputClass = (hasError) => `ga-input${hasError ? ' has-error' : ''}`;

  return (
    <section className="ga-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }
        .ga-page {
          --accent: #10b981;
          --accent-dark: #059669;
          --accent-darker: #047857;
          --accent-tint: #ecfdf5;
          --accent-border: #d1fae5;
          --ink: #111827;
          --muted: #6b7280;
          min-height: 100vh;
          max-width: 100vw;
          overflow-x: hidden;
          background: linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 40%, #f8fafc 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 20px 24px 100px;
          position: relative;
        }

        @keyframes gaFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gaPop { 0% { opacity: 0; transform: scale(0.8); } 60% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes gaShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes gaSlideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gaCheck { from { opacity: 0; transform: scale(0.5) rotate(-10deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
        @keyframes gaPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }

        @media (prefers-reduced-motion: reduce) {
          .ga-page *, .ga-page *::before, .ga-page *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }

        .ga-progress-shell {
          position: sticky; top: 0; z-index: 20; margin: -20px -24px 20px; padding: 10px 24px;
          background: rgba(248,250,252,0.85); backdrop-filter: blur(8px); border-bottom: 1px solid var(--accent-border);
        }
        .ga-progress-row { display: flex; align-items: center; gap: 12px; max-width: 1240px; margin: 0 auto; }
        .ga-progress-track { flex: 1; height: 6px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
        .ga-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent-dark)); transition: width 0.5s cubic-bezier(.4,0,.2,1); }
        .ga-progress-label { font-size: 12px; font-weight: 700; color: var(--accent-darker); white-space: nowrap; }
        .ga-dirty-pill {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #b45309;
          background: #fef3c7; padding: 3px 10px; border-radius: 999px; white-space: nowrap; animation: gaFadeUp 0.3s ease both;
        }
        .ga-dirty-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; animation: gaPulse 1.4s ease-in-out infinite; }

        .ga-shell-inner { max-width: 1240px; margin: 0 auto; }

        .ga-header { margin-bottom: 22px; animation: gaFadeUp 0.5s ease both; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .ga-badge-role {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
          background: var(--accent-border); color: var(--accent-darker); border-radius: 999px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.04em; margin-bottom: 10px;
        }
        .ga-title { font-size: 26px; font-weight: 800; color: #064e3b; margin: 0 0 6px; letter-spacing: -0.02em; }
        .ga-subtitle { font-size: 14px; color: var(--muted); margin: 0; max-width: 560px; line-height: 1.5; }

        .ga-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--accent-border); background: #fff;
          padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; color: #b91c1c;
          transition: transform 0.15s ease, background 0.15s ease; flex-shrink: 0;
        }
        .ga-btn-ghost:hover { background: #fef2f2; transform: translateY(-1px); }
        .ga-btn-ghost:active { transform: translateY(0) scale(0.97); }
        .ga-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        .ga-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

        .ga-card {
          background: #fff; border: 1px solid var(--accent-border); border-radius: 16px;
          box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08); padding: 24px; margin-bottom: 20px;
          animation: gaFadeUp 0.5s ease both; transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .ga-card:hover { box-shadow: 0 8px 32px rgba(16, 185, 129, 0.13); }
        .ga-card:nth-of-type(1) { animation-delay: 0.02s; }
        .ga-card:nth-of-type(2) { animation-delay: 0.06s; }
        .ga-card:nth-of-type(3) { animation-delay: 0.10s; }
        .ga-card:nth-of-type(4) { animation-delay: 0.14s; }
        .ga-card:nth-of-type(5) { animation-delay: 0.18s; }

        .ga-shop-banner { padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
        .ga-shop-icon {
          width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; flex-shrink: 0;
        }
        .ga-shop-eyebrow { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .ga-shop-name { font-size: 16px; font-weight: 700; color: var(--ink); }
        .ga-shop-address { font-size: 12px; color: var(--muted); }

        .ga-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
        .ga-card-head-left { display: flex; align-items: center; gap: 10px; }
        .ga-card-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ga-card-title { font-size: 15px; font-weight: 700; color: var(--ink); }
        .ga-card-sub { font-size: 12px; color: var(--muted); }

        .ga-field { margin-bottom: 16px; }
        .ga-field:last-child { margin-bottom: 0; }
        .ga-field-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
        .ga-label {
          display: block; font-size: 11px; font-weight: 700; color: var(--accent-darker); margin-bottom: 6px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .ga-char-count { font-size: 11px; color: var(--muted); font-weight: 500; text-transform: none; letter-spacing: 0; }
        .ga-char-count.warn { color: #d97706; }

        .ga-input, .ga-textarea {
          width: 100%; border: 1px solid var(--accent-border); border-radius: 10px; padding: 0 14px; font-size: 14px;
          color: #064e3b; outline: none; background: #fff; box-sizing: border-box; font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ga-input { height: 44px; }
        .ga-textarea { padding: 12px 14px; resize: vertical; line-height: 1.5; }
        .ga-input:focus, .ga-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
        .ga-input.has-error, .ga-textarea.has-error { border-color: #f87171; }
        .ga-input.has-error:focus, .ga-textarea.has-error:focus { box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15); }
        .ga-error-text { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #dc2626; margin-top: 6px; font-weight: 600; animation: gaFadeUp 0.25s ease both; }
        .ga-hint { font-size: 11px; color: var(--muted); margin-top: 4px; }

        .ga-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ga-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
        .ga-grid-2 > div, .ga-grid-auto > div { min-width: 0; }

        .ga-empty-cats { padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; font-size: 13px; color: #92400e; }

        .ga-discount-badge {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 13px; color: #059669;
          font-weight: 700; background: #d1fae5; padding: 6px 12px; border-radius: 999px; animation: gaPop 0.4s ease both;
        }

        .ga-seo-toggle {
          width: 100%; display: flex; align-items: center; justify-content: space-between; background: transparent;
          border: none; cursor: pointer; padding: 0; font-family: inherit; text-align: left;
        }
        .ga-seo-chevron { transition: transform 0.3s ease; color: var(--muted); flex-shrink: 0; }
        .ga-seo-chevron.open { transform: rotate(180deg); }
        .ga-seo-fill-badge {
          font-size: 11px; font-weight: 700; color: var(--accent-darker); background: var(--accent-tint);
          border: 1px solid var(--accent-border); padding: 2px 8px; border-radius: 999px; margin-left: 10px;
        }
        .ga-seo-body { margin-top: 18px; animation: gaFadeUp 0.35s ease both; }

        .ga-photo-count { font-size: 12px; color: var(--muted); font-weight: 600; }
        .ga-photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
        .ga-photo-tile { position: relative; animation: gaPop 0.35s ease both; cursor: grab; }
        .ga-photo-tile:active { cursor: grabbing; }
        .ga-photo-frame {
          border-radius: 12px; overflow: hidden; height: 110px; border: 2px solid var(--accent-border);
          transition: transform 0.2s ease, border-color 0.2s ease; position: relative;
        }
        .ga-photo-tile:hover .ga-photo-frame { transform: scale(1.03); border-color: var(--accent); }
        .ga-photo-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ga-photo-remove {
          position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%;
          background: #dc2626; border: 2px solid #fff; color: #fff; cursor: pointer; z-index: 2;
          display: flex; align-items: center; justify-content: center; transition: transform 0.15s ease, background 0.15s ease;
        }
        .ga-photo-remove:hover { background: #b91c1c; transform: scale(1.1); }
        .ga-photo-primary {
          position: absolute; bottom: 6px; left: 6px; background: rgba(6, 78, 59, 0.85); color: #fff; font-size: 9px;
          font-weight: 700; letter-spacing: 0.04em; padding: 3px 7px; border-radius: 6px; text-transform: uppercase;
        }
        .ga-photo-grip {
          position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 6px; background: rgba(255,255,255,0.85);
          display: flex; align-items: center; justify-content: center; color: var(--accent-darker); opacity: 0; transition: opacity 0.2s ease;
        }
        .ga-photo-tile:hover .ga-photo-grip { opacity: 1; }

        .ga-submit-btn {
          width: 100%; height: 52px; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35); transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          font-family: inherit;
        }
        .ga-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(16, 185, 129, 0.42); }
        .ga-submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .ga-submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .ga-submit-btn.saved { background: linear-gradient(135deg, #34d399, #059669); }
        .ga-submit-desktop { display: block; }

        .ga-sticky-bar {
          display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
          background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); border-top: 1px solid var(--accent-border);
          box-shadow: 0 -8px 24px rgba(0,0,0,0.06); animation: gaSlideUp 0.4s ease both;
        }
        .ga-sticky-bar-inner { display: flex; align-items: center; gap: 10px; }
        .ga-sticky-progress { flex: 1; }
        .ga-sticky-progress-label { font-size: 10px; color: var(--muted); font-weight: 700; margin-bottom: 4px; }
        .ga-sticky-track { height: 5px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
        .ga-sticky-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-dark)); border-radius: 999px; transition: width 0.4s ease; }
        .ga-sticky-submit {
          border: none; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: #fff;
          font-weight: 700; font-size: 13px; padding: 12px 18px; display: flex; align-items: center; gap: 8px; cursor: pointer;
          box-shadow: 0 6px 16px rgba(16,185,129,0.35); white-space: nowrap; font-family: inherit;
        }
        .ga-sticky-submit:active { transform: scale(0.97); }
        .ga-sticky-submit:disabled { opacity: 0.7; }

        .ga-preview-card { position: sticky; top: 76px; animation: gaFadeUp 0.5s ease 0.1s both; }
        .ga-preview-eyebrow { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.06em; }
        .ga-preview-media { border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb; margin-bottom: 16px; }
        .ga-preview-image { height: 180px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
        .ga-preview-body { padding: 16px; }
        .ga-preview-name { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .ga-preview-desc { font-size: 12px; color: var(--muted); margin-bottom: 12px; line-height: 1.5; min-height: 36px; }
        .ga-preview-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .ga-preview-price { font-size: 20px; font-weight: 800; color: var(--accent-dark); }
        .ga-preview-strike { font-size: 14px; color: #9ca3af; text-decoration: line-through; }
        .ga-preview-unit { font-size: 11px; color: var(--muted); background: #f3f4f6; padding: 2px 8px; border-radius: 6px; }
        .ga-preview-stock { margin-top: 12px; font-size: 12px; font-weight: 600; transition: color 0.2s ease; }

        .ga-checklist { list-style: none; padding: 0; margin: 0; font-size: 13px; color: #4b5563; }
        .ga-checklist li { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; transition: color 0.25s ease; }
        .ga-checklist svg.done { animation: gaCheck 0.35s ease both; }

        .ga-skeleton-wrap { display: flex; flex-direction: column; gap: 16px; padding: 4px; }
        .ga-skeleton {
          border-radius: 16px; height: 120px; background: linear-gradient(90deg, #ecfdf5 25%, #d1fae5 37%, #ecfdf5 63%);
          background-size: 400px 100%; animation: gaShimmer 1.4s ease-in-out infinite;
        }

        .ga-empty-state { padding: 32px; text-align: center; animation: gaFadeUp 0.4s ease both; }
        .ga-empty-icon { animation: gaPop 0.5s ease both; margin-bottom: 12px; }

        @media (max-width: 960px) {
          .ga-layout { grid-template-columns: 1fr !important; }
          .ga-preview-card { position: static; order: -1; margin-bottom: 4px; }
        }

        @media (max-width: 420px) {
          .ga-card { padding: 14px !important; }
        }

        @media (max-width: 640px) {
          .ga-page { padding: 14px 14px 96px; }
          .ga-progress-shell { margin: -14px -14px 16px; padding: 10px 14px; }
          .ga-title { font-size: 21px; }
          .ga-card { padding: 18px; border-radius: 14px; }
          .ga-grid-2 { grid-template-columns: 1fr; }
          .ga-grid-auto { grid-template-columns: 1fr; gap: 12px; }
          .ga-input, .ga-textarea { padding-left: 12px; padding-right: 12px; }
          .ga-submit-desktop { display: none; }
          .ga-sticky-bar { display: block; }
          .ga-photo-grid { grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); }
          .ga-photo-frame { height: 92px; }
          .ga-header { flex-direction: column; }
        }
      `}</style>

      {/* Sticky progress header */}
      <div className="ga-progress-shell">
        <div className="ga-progress-row">
          <span className="ga-progress-label">{completion.done}/{completion.total} complete</span>
          <div className="ga-progress-track">
            <div className="ga-progress-fill" style={{ width: `${completion.percent}%` }} />
          </div>
          {isDirty && <span className="ga-dirty-pill"><span className="ga-dirty-dot" /> Unsaved changes</span>}
        </div>
      </div>

      <div className="ga-shell-inner">
        {/* Header */}
        <div className="ga-header">
          <div>
            <span className="ga-badge-role"><FaLeaf size={10} /> GROCERY SELLER</span>
            <h1 className="ga-title">Edit Grocery Product</h1>
            <p className="ga-subtitle">
              Update product details — changes will be reflected in your Go Market grocery shop.
            </p>
          </div>
          {isDirty && !loadingMeta && (
            <button type="button" className="ga-btn-ghost" onClick={discardChanges} disabled={isLoading}>
              <FaUndo size={12} /> Discard changes
            </button>
          )}
        </div>

        {loadingMeta ? (
          <div className="ga-skeleton-wrap">
            <div className="ga-skeleton" />
            <div className="ga-skeleton" />
            <div className="ga-skeleton" style={{ height: 200 }} />
          </div>
        ) : !shop ? (
          <div className="ga-card ga-empty-state">
            <FaExclamationCircle size={40} color="#f59e0b" className="ga-empty-icon" />
            <h3 style={{ color: '#111827', margin: '0 0 8px' }}>Grocery shop not found</h3>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Complete seller registration with a market to create your shop first.</p>
          </div>
        ) : (
          <div className="ga-layout">
            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Shop banner */}
              <div className="ga-card ga-shop-banner">
                <div className="ga-shop-icon"><FaStore /></div>
                <div>
                  <div className="ga-shop-eyebrow">Updating product in</div>
                  <div className="ga-shop-name">{shop.shopName || 'My Grocery Shop'}</div>
                  <div className="ga-shop-address">{shop.address || 'Go Market store'}</div>
                </div>
              </div>

              {/* Product details */}
              <div className="ga-card">
                <div className="ga-card-head">
                  <div className="ga-card-head-left">
                    <div className="ga-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}><MdInfo size={18} /></div>
                    <div>
                      <div className="ga-card-title">Product details</div>
                      <div className="ga-card-sub">Name, description & unit</div>
                    </div>
                  </div>
                </div>

                <div className="ga-field" ref={(el) => (fieldRefs.current.name = el)}>
                  <label className="ga-label" htmlFor="ge-name">Product name *</label>
                  <input id="ge-name" className={inputClass(!!errors.name)} name="name" value={form.name} onChange={onChange}
                    placeholder="e.g. Fresh Tomatoes, Amul Milk 1L" />
                  {errors.name && <div className="ga-error-text"><FaExclamationCircle size={11} /> {errors.name}</div>}
                </div>

                <div className="ga-field">
                  <label className="ga-label" htmlFor="ge-title">Display title (product page)</label>
                  <input id="ge-title" className="ga-input" name="title" value={form.title} onChange={onChange}
                    placeholder="Leave blank to use product name" />
                </div>

                <div className="ga-field">
                  <label className="ga-label">Featured product</label>
                  <Select size="small" sx={selectSx(false)} name="isFeatured" value={form.isFeatured} onChange={onChange}>
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </Select>
                </div>

                <div className="ga-field" ref={(el) => (fieldRefs.current.description = el)}>
                  <div className="ga-field-row">
                    <label className="ga-label" htmlFor="ge-description">Description *</label>
                    <span className={`ga-char-count${form.description.length > DESCRIPTION_LIMIT ? ' warn' : ''}`}>
                      {form.description.length}/{DESCRIPTION_LIMIT}
                    </span>
                  </div>
                  <textarea id="ge-description" name="description" value={form.description} onChange={onChange}
                    placeholder="Freshness, origin, storage tips…"
                    className={`ga-textarea${errors.description ? ' has-error' : ''}`} style={{ height: 100 }} />
                  {errors.description && <div className="ga-error-text"><FaExclamationCircle size={11} /> {errors.description}</div>}
                </div>

                <div className="ga-field">
                  <label className="ga-label">Sold as *</label>
                  <Select size="small" sx={selectSx(false)} name="unit" value={form.unit} onChange={onChange}>
                    {UNITS.map((u) => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}
                  </Select>
                </div>

                <div className="ga-field">
                  <label className="ga-label" htmlFor="ge-productType">Product type</label>
                  <input id="ge-productType" className="ga-input" name="productType" value={form.productType} onChange={onChange}
                    placeholder="e.g. Organic, Premium, Regular" />
                </div>

                <ProductSpecsEditor value={specifications} onChange={setSpecifications} accent="#059669" />
                <div style={{ marginTop: 16 }}>
                  <ProductOptionsEditor value={productOptions} onChange={setProductOptions} accent="#059669" />
                </div>
              </div>

              {/* SEO — collapsible */}
              <div className="ga-card">
                <button type="button" className="ga-seo-toggle" onClick={() => setSeoOpen((v) => !v)}>
                  <div className="ga-card-head-left">
                    <div className="ga-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}><MdInfo size={18} /></div>
                    <div>
                      <div className="ga-card-title">
                        SEO & Search Optimization
                        {seoFilledCount > 0 && <span className="ga-seo-fill-badge">{seoFilledCount}/5 filled</span>}
                      </div>
                      <div className="ga-card-sub">Help customers find your product easily</div>
                    </div>
                  </div>
                  <FaChevronDown className={`ga-seo-chevron${seoOpen ? ' open' : ''}`} size={14} />
                </button>

                {seoOpen && (
                  <div className="ga-seo-body">
                    <div className="ga-field">
                      <label className="ga-label" htmlFor="ge-searchKeywords">Search keywords</label>
                      <input id="ge-searchKeywords" className="ga-input" name="searchKeywords" value={form.searchKeywords} onChange={onChange}
                        placeholder="e.g. tomato, fresh tomato, red tomato, organic tomato (comma separated)" />
                      <div className="ga-hint">Words users might search for to find this product</div>
                    </div>
                    <div className="ga-field">
                      <label className="ga-label" htmlFor="ge-tags">Product tags</label>
                      <input id="ge-tags" className="ga-input" name="tags" value={form.tags} onChange={onChange}
                        placeholder="e.g. organic, fresh, local, seasonal (comma separated)" />
                    </div>
                    <div className="ga-field">
                      <label className="ga-label" htmlFor="ge-keywords">SEO keywords</label>
                      <input id="ge-keywords" className="ga-input" name="keywords" value={form.keywords} onChange={onChange}
                        placeholder="e.g. grocery, vegetables, fresh produce (comma separated)" />
                    </div>
                    <div className="ga-field">
                      <div className="ga-field-row">
                        <label className="ga-label" htmlFor="ge-seoDescription">SEO description</label>
                        <span className={`ga-char-count${form.seoDescription.length > SEO_DESC_LIMIT ? ' warn' : ''}`}>
                          {form.seoDescription.length}/{SEO_DESC_LIMIT}
                        </span>
                      </div>
                      <textarea id="ge-seoDescription" name="seoDescription" value={form.seoDescription} onChange={onChange}
                        placeholder="Short description for search engines (150-160 characters recommended)"
                        className="ga-textarea" style={{ height: 80 }} />
                    </div>
                    <div className="ga-field">
                      <label className="ga-label" htmlFor="ge-attributes">Product attributes</label>
                      <textarea id="ge-attributes" name="attributes" value={form.attributes} onChange={onChange}
                        placeholder="e.g. brand: Amul, origin: India, storage: refrigerated (key: value format, one per line)"
                        className="ga-textarea" style={{ height: 80 }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="ga-card" ref={(el) => (fieldRefs.current.category = el)}>
                <div className="ga-card-head">
                  <div className="ga-card-head-left">
                    <div className="ga-card-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><MdCategory size={18} /></div>
                    <div>
                      <div className="ga-card-title">Category</div>
                      <div className="ga-card-sub">Go Market {categoryLabel} categories</div>
                    </div>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="ga-empty-cats">
                    No categories available yet. Please ask the <strong>admin</strong> to add {categoryLabel} categories — you can then select them here.
                  </div>
                ) : (
                  <div className="ga-grid-2">
                    <div>
                      <label className="ga-label">Category *</label>
                      <Select size="small" sx={selectSx(!!errors.category)} value={categoryId} displayEmpty
                        onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setSubSubCategoryId(''); if (errors.category) setErrors((p) => ({ ...p, category: undefined })); }}>
                        <MenuItem value="" disabled>Select category</MenuItem>
                        {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                      </Select>
                      {errors.category && <div className="ga-error-text"><FaExclamationCircle size={11} /> {errors.category}</div>}
                    </div>
                    <div>
                      <label className="ga-label">Sub category</label>
                      <Select size="small" sx={selectSx(false)} value={subCategoryId} displayEmpty disabled={!categoryId}
                        onChange={(e) => setSubCategoryId(e.target.value)}>
                        <MenuItem value="">Optional</MenuItem>
                        {subCategories.map((sc) => <MenuItem key={sc._id} value={sc._id}>{sc.name}</MenuItem>)}
                      </Select>
                    </div>
                  </div>
                )}
                {subCategories.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <label className="ga-label">Sub-sub category</label>
                    <Select size="small" sx={selectSx(false)} value={subSubCategoryId} displayEmpty disabled={!subCategoryId}
                      onChange={(e) => setSubSubCategoryId(e.target.value)}>
                      <MenuItem value="">Optional</MenuItem>
                      {subSubCategories.map((ssc) => <MenuItem key={ssc._id} value={ssc._id}>{ssc.name}</MenuItem>)}
                    </Select>
                  </div>
                )}
              </div>

              {/* Price & stock */}
              <div className="ga-card">
                <div className="ga-card-head">
                  <div className="ga-card-head-left">
                    <div className="ga-card-icon" style={{ background: '#f0fdf4', color: '#15803d' }}><FaRupeeSign size={16} /></div>
                    <div>
                      <div className="ga-card-title">Price & stock</div>
                      <div className="ga-card-sub">MRP, selling price and availability</div>
                    </div>
                  </div>
                </div>

                <div className="ga-grid-auto">
                  <div ref={(el) => (fieldRefs.current.price = el)}>
                    <label className="ga-label">MRP (₹) *</label>
                    <input className={inputClass(!!errors.price)} type="number" name="price" value={form.price} onChange={onChange} placeholder="100" min="0" />
                    {errors.price && <div className="ga-error-text"><FaExclamationCircle size={11} /> {errors.price}</div>}
                  </div>
                  <div>
                    <label className="ga-label">Selling price (₹)</label>
                    <input className="ga-input" type="number" name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Same as MRP" min="0" />
                  </div>
                  <div ref={(el) => (fieldRefs.current.countInStock = el)}>
                    <label className="ga-label">Stock qty *</label>
                    <input className={inputClass(!!errors.countInStock)} type="number" name="countInStock" value={form.countInStock} onChange={onChange} placeholder="50" min="0" />
                    {errors.countInStock && <div className="ga-error-text"><FaExclamationCircle size={11} /> {errors.countInStock}</div>}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <div className="ga-discount-badge"><FaTag size={12} /> {discountPercent}% off for customers</div>
                )}
              </div>

              {/* Photos */}
              <div className="ga-card" ref={(el) => (fieldRefs.current.images = el)}>
                <div className="ga-card-head">
                  <div className="ga-card-head-left">
                    <div className="ga-card-icon" style={{ background: '#fff7ed', color: '#c2410c' }}><FaImage size={16} /></div>
                    <div>
                      <div className="ga-card-title">Product photo *</div>
                      <div className="ga-card-sub">Clear image helps sales • drag tiles to reorder</div>
                    </div>
                  </div>
                  {previews.length > 0 && <span className="ga-photo-count">{previews.length} added</span>}
                </div>
                <div className="ga-photo-grid">
                  {previews.map((image, index) => (
                    <div
                      key={image + index}
                      className="ga-photo-tile"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnd={handleDragEnd}
                    >
                      <button type="button" className="ga-photo-remove" onClick={() => removeImg(image, index)} aria-label="Remove photo">
                        <IoMdClose size={14} />
                      </button>
                      <div className="ga-photo-frame">
                        <img src={image} alt="" />
                        {index === 0 && <span className="ga-photo-primary">Cover</span>}
                        <span className="ga-photo-grip"><FaGripLinesVertical size={11} /></span>
                      </div>
                    </div>
                  ))}
                  <UploadBox multiple name="images" url="/api/product/uploadImages" setPreviewsFun={setPreviewsFun} />
                </div>
                {errors.images && <div className="ga-error-text" style={{ marginTop: 10 }}><FaExclamationCircle size={11} /> {errors.images}</div>}
              </div>

              <button type="submit" disabled={isLoading} className={`ga-submit-btn ga-submit-desktop${justSaved ? ' saved' : ''}`}>
                {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : (
                  <><FaSave size={18} /> {justSaved ? 'Saved!' : 'Save Changes'}</>
                )}
              </button>
            </form>

            {/* Preview */}
            <aside className="ga-preview-card">
              <div className="ga-card" style={{ padding: 20, overflow: 'hidden' }}>
                <div className="ga-preview-eyebrow">Live preview</div>
                <div className="ga-preview-media">
                  <div
                    className="ga-preview-image"
                    style={{ background: previews[0] ? `url(${previews[0]}) center/cover` : 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}
                  >
                    {!previews[0] && <FaBoxes size={48} color="#6ee7b7" style={{ opacity: 0.6 }} />}
                  </div>
                  <div className="ga-preview-body">
                    <div className="ga-preview-name">{form.name || 'Product name'}</div>
                    <div className="ga-preview-desc">
                      {form.description ? form.description.slice(0, 80) + (form.description.length > 80 ? '…' : '') : 'Description appears here'}
                    </div>
                    <div className="ga-preview-price-row">
                      <span className="ga-preview-price">₹{form.oldPrice || form.price || '—'}</span>
                      {form.oldPrice && form.price && Number(form.oldPrice) < Number(form.price) && (
                        <span className="ga-preview-strike">₹{form.price}</span>
                      )}
                      <span className="ga-preview-unit">/ {UNITS.find((u) => u.value === form.unit)?.label?.replace('Per ', '') || 'unit'}</span>
                    </div>
                    <div className="ga-preview-stock" style={{ color: form.countInStock > 0 ? '#15803d' : '#dc2626' }}>
                      {form.countInStock ? `${form.countInStock} in stock` : 'Out of stock'}
                    </div>
                  </div>
                </div>

                <ul className="ga-checklist">
                  {checklist.map((item) => (
                    <li key={item.key} style={{ color: item.done ? '#059669' : '#9ca3af' }}>
                      <FaCheckCircle size={14} className={item.done ? 'done' : ''} /> {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky action bar */}
      {shop && !loadingMeta && (
        <div className="ga-sticky-bar">
          <div className="ga-sticky-bar-inner">
            <div className="ga-sticky-progress">
              <div className="ga-sticky-progress-label">{completion.done}/{completion.total} steps done</div>
              <div className="ga-sticky-track"><div className="ga-sticky-fill" style={{ width: `${completion.percent}%` }} /></div>
            </div>
            <button type="button" className="ga-sticky-submit" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <FaSave size={15} />}
              {justSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default GroceryEditProduct;