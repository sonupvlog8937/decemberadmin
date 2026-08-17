import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import { IoMdClose } from 'react-icons/io';
import {
  FaUtensils, FaStore, FaImage, FaRupeeSign,
  FaSave, FaCheckCircle, FaExclamationCircle,
  FaStar, FaRegStar, FaArrowLeft, FaTag,
} from 'react-icons/fa';
import { MdCategory, MdInfo, MdRestaurantMenu } from 'react-icons/md';
import { MyContext } from '../../App';
import { deleteImages, editData, fetchDataFromApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../../Components/UploadBox';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';

const FOOD_TYPES = [
  { value: '', label: 'Not specified' },
  { value: 'Veg', label: 'Vegetarian' },
  { value: 'Non-Veg', label: 'Non-Vegetarian' },
  { value: 'Egg', label: 'Contains Egg' },
];

const DESCRIPTION_LIMIT = 500;
const SEO_DESCRIPTION_LIMIT = 160;
const MAX_IMAGES = 8;

const RestaurantEditProduct = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const productId = context?.isOpenFullScreenPanel?.id;
  const formRef = useRef(null);
  const fieldRefs = {
    name: useRef(null),
    description: useRef(null),
    category: useRef(null),
    price: useRef(null),
    photos: useRef(null),
  };

  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [menuId, setMenuId] = useState('');
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
  const [isDirty, setIsDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    isFeatured: 'no',
    price: '',
    oldPrice: '',
    foodType: '',
    keywords: '',
    tags: '',
    searchKeywords: '',
    seoDescription: '',
    attributes: '',
    productType: '',
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [productOptions, setProductOptions] = useState([{ name: '', label: '', values: [] }]);

  useEffect(() => {
    if (!productId) return;

    Promise.all([
      fetchDataFromApi('/api/go-market/restaurants?limit=1'),
      fetchDataFromApi('/api/go-market/categories?type=restaurant&limit=100&status=active'),
      fetchDataFromApi(`/api/go-market/items/${productId}`).catch(() =>
        fetchDataFromApi(`/api/go-market/products/${productId}`)
      ).catch(() =>
        fetchDataFromApi(`/api/product/${productId}`)
      ),
    ]).then(([restaurantRes, catRes, prodRes]) => {
      const rest = restaurantRes?.data?.[0] || null;
      setRestaurant(rest);
      setCategories(catRes?.data || []);

      if (rest?._id) {
        fetchDataFromApi(`/api/go-market/menus/restaurant/${rest._id}?limit=50`).then((menuRes) => {
          const list = menuRes?.data || [];
          setMenus(list);
        });
      }

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

      if (p && typeof p === 'object') {
        const specs = p.specifications || p.specs || [];
        const foodTypeSpec = specs.find((s) => s.key === 'Food type');
        let foodTypeValue = p.foodType || (foodTypeSpec ? foodTypeSpec.value : '');

        setForm({
          name: p.name || p.itemName || '',
          title: p.title || '',
          description: p.description || '',
          price: String(p.price || p.discountPrice || ''),
          oldPrice: String(p.oldPrice || p.discountPrice || ''),
          isFeatured: p.isFeatured ? 'yes' : 'no',
          foodType: foodTypeValue,
          keywords: p.keywords || '',
          tags: p.tags || '',
          searchKeywords: p.searchKeywords || '',
          seoDescription: p.seoDescription || '',
          attributes: p.attributes || '',
          productType: p.productType || '',
        });

        setCategoryId(p.categoryId || p.goMarketCategoryId || '');
        setSubCategoryId(p.subCategoryId || p.goMarketSubCategoryId || '');
        setSubSubCategoryId(p.subSubCategoryId || '');
        setMenuId(p.menuId || '');

        if (Array.isArray(specs) && specs.length > 0) {
          const filteredSpecs = specs.filter((s) => s.key !== 'Food type');
          setSpecifications(filteredSpecs.length > 0 ? filteredSpecs : [{ key: '', value: '' }]);
        }

        const opts = p.productOptions || p.options || [];
        if (Array.isArray(opts) && opts.length > 0) {
          setProductOptions(opts);
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
      } else {
        console.error('Restaurant Edit - Invalid product data structure:', prodRes);
      }

      setLoadingMeta(false);
    }).catch((err) => {
      console.error('Error loading product:', err);
      context.alertBox('error', 'Could not load menu item details');
      setLoadingMeta(false);
    });
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

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const setPreviewsFun = (arr) => {
    setPreviews((prev) => [...prev, ...arr].slice(0, MAX_IMAGES));
    setIsDirty(true);
    if (errors.photos) setErrors((prev) => ({ ...prev, photos: false }));
  };

  const removeImg = (image, index) => {
    deleteImages(`/api/category/deteleImage?img=${image}`).then(() => {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      setIsDirty(true);
    });
  };

  const makeCover = (index) => {
    if (index === 0) return;
    setPreviews((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(index, 1);
      arr.unshift(moved);
      return arr;
    });
    setIsDirty(true);
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (index !== dragOverIndex) setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) {
      handleDragEnd();
      return;
    }
    setPreviews((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    setIsDirty(true);
    handleDragEnd();
  };

  const scrollToField = (key) => {
    const node = fieldRefs[key]?.current;
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const checks = [
      [!restaurant, 'Your restaurant is not set up. Please complete registration with a market first.', null],
      [!form.name.trim(), 'Enter dish / item name', 'name'],
      [!form.description.trim(), 'Enter item description', 'description'],
      [!categoryId, 'Select a category', 'category'],
      [!form.price, 'Enter price', 'price'],
      [previews.length === 0, 'Upload at least one food image', 'photos'],
    ];

    const newErrors = {};
    let firstFailKey = null;
    let firstFailMsg = null;
    for (const [fail, msg, key] of checks) {
      if (fail) {
        if (key) newErrors[key] = true;
        if (!firstFailKey) {
          firstFailKey = key;
          firstFailMsg = msg;
        }
      }
    }

    if (firstFailMsg) {
      setErrors(newErrors);
      context.alertBox('error', firstFailMsg);
      if (firstFailKey) scrollToField(firstFailKey);
      return;
    }

    const specRows = specifications.filter((s) => s.key?.trim() && s.value?.trim());
    if (form.foodType) specRows.push({ key: 'Food type', value: form.foodType });

    const payload = {
      itemName: form.name.trim(),
      name: form.name.trim(),
      title: (form.title || form.name).trim(),
      description: form.description.trim(),
      specifications: specRows,
      productOptions: normalizeProductOptionsForSubmit(productOptions),
      price: Number(form.price),
      discountPrice: form.oldPrice ? Number(form.oldPrice) : 0,
      oldPrice: Number(form.oldPrice || form.price),
      image: previews[0],
      images: previews,
      categoryId: categoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      subSubCategoryId: subSubCategoryId || undefined,
      goMarketCategoryId: categoryId || undefined,
      goMarketSubCategoryId: subCategoryId || undefined,
      goMarketSubSubCategoryId: subSubCategoryId || undefined,
      menuId: menuId || undefined,
      isFeatured: form.isFeatured === 'yes',
      keywords: form.keywords.trim(),
      tags: form.tags.trim(),
      searchKeywords: form.searchKeywords.trim(),
      seoDescription: form.seoDescription.trim(),
      attributes: form.attributes.trim(),
      productType: form.productType.trim(),
      foodType: form.foodType,
    };

    setIsLoading(true);
    editData(`/api/go-market/items/${productId}`, payload)
      .then((res) => {
        if (res?.error === false || res?.success === true) {
          setIsDirty(false);
          context.alertBox('success', res?.message || 'Menu item updated successfully!');
          setTimeout(() => {
            context.setIsOpenFullScreenPanel({ open: false });
          }, 1000);
        } else {
          throw new Error(res?.message || 'Update failed');
        }
      })
      .catch((err) => {
        console.error('Update error:', err);
        // Fallback to products endpoint
        editData(`/api/go-market/products/${productId}`, payload)
          .then((res) => {
            if (res?.error === false || res?.success === true || res?.data?.error === false) {
              setIsDirty(false);
              context.alertBox('success', res?.message || res?.data?.message || 'Menu item updated successfully!');
              setTimeout(() => {
                context.setIsOpenFullScreenPanel({ open: false });
              }, 1000);
            } else {
              throw new Error(res?.message || res?.data?.message || 'Update failed');
            }
          })
          .catch(() => {
            // Final fallback
            editData(`/api/product/updateProduct/${productId}`, payload)
              .then((res) => {
                if (res?.data?.error === false) {
                  setIsDirty(false);
                  context.alertBox('success', res?.data?.message || 'Menu item updated successfully!');
                  setTimeout(() => {
                    context.setIsOpenFullScreenPanel({ open: false });
                  }, 1000);
                } else {
                  context.alertBox('error', res?.data?.message || 'Could not update menu item');
                }
              })
              .catch(() => context.alertBox('error', 'Could not update menu item. Please try again.'))
              .finally(() => setIsLoading(false));
          })
          .finally(() => setIsLoading(false));
      })
      .finally(() => setIsLoading(false));
  };

  const discountPercent = useMemo(() => {
    const mrp = Number(form.price);
    const offer = Number(form.oldPrice);
    if (!mrp || !offer || offer >= mrp) return null;
    return Math.round((1 - offer / mrp) * 100);
  }, [form.price, form.oldPrice]);

  const completion = useMemo(() => {
    const checklist = [
      { done: !!form.name.trim(), label: 'Name entered' },
      { done: !!form.description.trim(), label: 'Description added' },
      { done: !!categoryId, label: 'Category selected' },
      { done: !!form.price, label: 'Price set' },
      { done: previews.length > 0, label: 'Photo added' },
    ];
    const doneCount = checklist.filter((c) => c.done).length;
    return { checklist, percent: Math.round((doneCount / checklist.length) * 100) };
  }, [form.name, form.description, categoryId, form.price, previews.length]);

  const selectSx = (hasError) => ({
    width: '100%',
    fontSize: 13,
    background: '#fff',
    borderRadius: '10px',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      minHeight: 44,
      '& fieldset': hasError ? { borderColor: '#ef4444' } : undefined,
    },
  });

  const inputStyle = (hasError) => ({
    width: '100%',
    height: 44,
    border: `1px solid ${hasError ? '#ef4444' : '#fed7aa'}`,
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 14,
    color: '#7c2d12',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#c2410c',
    marginBottom: 6,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  return (
    <section className="restaurant-add-product">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .restaurant-add-product,
        .restaurant-add-product *,
        .restaurant-add-product *::before,
        .restaurant-add-product *::after {
          box-sizing: border-box;
        }
        .restaurant-add-product {
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          background: linear-gradient(160deg, #fff7ed 0%, #ffedd5 40%, #f8fafc 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
          padding-bottom: 24px;
        }
        .restaurant-add-product input,
        .restaurant-add-product textarea,
        .restaurant-add-product select,
        .restaurant-add-product .MuiInputBase-root {
          max-width: 100%;
        }
        .restaurant-card { max-width: 100%; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes shakeError {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
          100% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        .restaurant-add-product input:focus,
        .restaurant-add-product textarea:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
          transform: translateY(-1px);
        }
        .restaurant-add-product button:focus-visible,
        .restaurant-add-product input:focus-visible,
        .restaurant-add-product textarea:focus-visible {
          outline: 2px solid #ea580c;
          outline-offset: 2px;
        }

        .restaurant-card {
          background: #fff;
          border: 1px solid #fed7aa;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(249, 115, 22, 0.1);
          animation: fadeInUp 0.45s ease both;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .restaurant-card.hoverable:hover {
          box-shadow: 0 10px 32px rgba(249, 115, 22, 0.18);
          transform: translateY(-2px);
          border-color: #fdba74;
        }
        .restaurant-card.field-error-card {
          border-color: #fca5a5;
          animation: shakeError 0.5s ease;
        }

        .field-error-text {
          font-size: 11px;
          color: #dc2626;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: fadeInUp 0.2s ease both;
        }

        .restaurant-preview-card { position: sticky; top: 24px; }

        .progress-track {
          width: 100%;
          height: 8px;
          background: #ffedd5;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #fb923c, #ea580c);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .img-tile {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          height: 110px;
          border: 2px solid #fed7aa;
          cursor: grab;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .img-tile:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 18px rgba(0,0,0,0.12); }
        .img-tile.dragging { opacity: 0.4; }
        .img-tile.drag-over { border-color: #ea580c; transform: scale(1.03); }
        .img-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .img-cover-badge {
          position: absolute; top: 6px; left: 6px; z-index: 2;
          background: #16a34a; color: #fff; font-size: 9px; font-weight: 800;
          padding: 3px 7px; border-radius: 6px; letter-spacing: 0.04em;
          display: flex; align-items: center; gap: 3px;
          animation: popIn 0.25s ease both;
        }
        .img-remove-btn {
          position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%;
          background: #dc2626; border: 2px solid #fff; color: #fff; cursor: pointer; z-index: 3;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .img-remove-btn:hover { transform: scale(1.15); background: #b91c1c; }
        .img-cover-btn {
          position: absolute; bottom: 6px; left: 6px; right: 6px; z-index: 2;
          background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 6px;
          font-size: 10px; font-weight: 700; padding: 4px 0; cursor: pointer;
          opacity: 0; transition: opacity 0.2s ease;
        }
        .img-tile:hover .img-cover-btn { opacity: 1; }

        .submit-btn {
          width: 100%; height: 52px; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center;
          justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(249, 115, 22, 0.35);
          transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(249, 115, 22, 0.42); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { cursor: not-allowed; }

        .cancel-btn {
          height: 44px; padding: 0 20px; border-radius: 12px; border: 1px solid #fed7aa;
          background: #fff; color: #7c2d12; font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: background 0.2s ease, transform 0.15s ease;
        }
        .cancel-btn:hover { background: #fff7ed; transform: translateY(-1px); }

        .discount-badge {
          display: inline-flex; align-items: center; gap: 5px; background: #dcfce7; color: #166534;
          font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;
          animation: popIn 0.3s ease both;
        }

        .char-counter { font-size: 11px; color: #9ca3af; margin-top: 4px; text-align: right; }
        .char-counter.over { color: #dc2626; font-weight: 700; }

        .skeleton-block {
          border-radius: 10px; background: linear-gradient(90deg, #ffedd5 0px, #fff7ed 40px, #ffedd5 80px);
          background-size: 600px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .mobile-sticky-bar { display: none; }

        .completion-chip {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
          padding: 5px 12px; border-radius: 999px; transition: background 0.3s ease, color 0.3s ease;
        }

        .unsaved-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;
          animation: pulseRing 1.6s ease-out infinite; display: inline-block;
        }

        @media (max-width: 960px) {
          .restaurant-layout { grid-template-columns: 1fr !important; }
          .restaurant-preview-card { position: static; }
        }

        @media (max-width: 640px) {
          .restaurant-add-product { padding: 14px; padding-bottom: 96px; }
          .restaurant-card { border-radius: 14px !important; padding: 18px !important; }
          .restaurant-hero-title { font-size: 21px !important; }
          .desktop-submit-btn { display: none !important; }
          .price-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .mobile-sticky-bar {
            display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
            background: #fff; border-top: 1px solid #fed7aa; padding: 10px 14px;
            padding-bottom: max(10px, env(safe-area-inset-bottom));
            align-items: center; gap: 12px; box-shadow: 0 -6px 20px rgba(0,0,0,0.08);
            animation: fadeInUp 0.3s ease both;
          }
        }

        @media (max-width: 420px) {
          .restaurant-add-product { padding: 12px; }
          .restaurant-card { padding: 14px !important; }
          .price-grid { grid-template-columns: 1fr !important; }
          .category-grid { grid-template-columns: 1fr !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .restaurant-card, .img-tile, .submit-btn, .cancel-btn, .discount-badge,
          .img-cover-badge, .skeleton-block, .unsaved-dot, .mobile-sticky-bar {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            background: '#ffedd5', color: '#c2410c', borderRadius: 999, fontSize: 11, fontWeight: 700,
            marginBottom: 8,
          }}>
            <FaUtensils size={10} /> RESTAURANT SELLER
          </span>
          <h1 className="restaurant-hero-title" style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Edit Menu Item
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, maxWidth: 560 }}>
            Update dish details — changes will appear on your Go Market restaurant menu.
          </p>
        </div>

        {!loadingMeta && restaurant && (
          <div style={{ minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Progress
              </span>
              <span
                className="completion-chip"
                style={{
                  background: completion.percent === 100 ? '#dcfce7' : '#ffedd5',
                  color: completion.percent === 100 ? '#166534' : '#c2410c',
                }}
              >
                {completion.percent === 100 ? <FaCheckCircle size={11} /> : null}
                {completion.percent}%
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
            {isDirty && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: '#b45309' }}>
                <span className="unsaved-dot" /> Unsaved changes
              </div>
            )}
          </div>
        )}
      </div>

      {loadingMeta ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="skeleton-block" style={{ height: 78, borderRadius: 16 }} />
          <div className="skeleton-block" style={{ height: 220, borderRadius: 16 }} />
          <div className="skeleton-block" style={{ height: 140, borderRadius: 16 }} />
        </div>
      ) : !restaurant ? (
        <div className="restaurant-card" style={{ padding: 32, textAlign: 'center' }}>
          <FaExclamationCircle size={40} color="#f59e0b" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#111827', margin: '0 0 8px' }}>Restaurant not found</h3>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Complete seller registration with a market to create your restaurant first.</p>
        </div>
      ) : (
        <div className="restaurant-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="restaurant-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, animationDelay: '0.02s' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, flexShrink: 0,
              }}>
                <FaStore />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Updating item in</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {restaurant.restaurantName || 'My Restaurant'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {restaurant.address || 'Go Market'}
                </div>
              </div>
            </div>

            <div
              ref={fieldRefs.name}
              className={`restaurant-card hoverable ${errors.name || errors.description ? 'field-error-card' : ''}`}
              style={{ padding: 24, marginBottom: 20, animationDelay: '0.06s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdInfo size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Item details</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Name, description & food type</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Dish name *</label>
                  <input
                    style={inputStyle(errors.name)}
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="e.g. Butter Chicken, Margherita Pizza"
                    maxLength={120}
                  />
                  {errors.name && <div className="field-error-text"><FaExclamationCircle size={11} /> Dish name is required</div>}
                </div>
                <div>
                  <label style={labelStyle}>Display title (product page)</label>
                  <input style={inputStyle(false)} name="title" value={form.title} onChange={onChange} placeholder="Leave blank to use dish name" />
                </div>
                <div>
                  <label style={labelStyle}>Featured dish</label>
                  <Select size="small" sx={selectSx(false)} name="isFeatured" value={form.isFeatured} onChange={onChange}>
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </Select>
                </div>
                <div ref={fieldRefs.description}>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Ingredients, spice level, serving size…"
                    maxLength={DESCRIPTION_LIMIT}
                    style={{ ...inputStyle(errors.description), height: 100, padding: '12px 14px', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {errors.description ? (
                      <div className="field-error-text"><FaExclamationCircle size={11} /> Description is required</div>
                    ) : <span />}
                    <span className={`char-counter ${form.description.length > DESCRIPTION_LIMIT - 20 ? 'over' : ''}`}>
                      {form.description.length}/{DESCRIPTION_LIMIT}
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Food type</label>
                  <Select size="small" sx={selectSx(false)} name="foodType" value={form.foodType} onChange={onChange}>
                    {FOOD_TYPES.map((t) => (
                      <MenuItem key={t.value || 'none'} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <label style={labelStyle}>Product type</label>
                  <input
                    style={inputStyle(false)}
                    name="productType"
                    value={form.productType}
                    onChange={onChange}
                    placeholder="e.g. Main Course, Appetizer, Dessert"
                  />
                </div>
                <ProductSpecsEditor value={specifications} onChange={setSpecifications} accent="#ea580c" />
                <div style={{ marginTop: 16 }}>
                  <ProductOptionsEditor value={productOptions} onChange={setProductOptions} accent="#ea580c" />
                </div>
              </div>
            </div>

            <div className="restaurant-card hoverable" style={{ padding: 24, marginBottom: 20, animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdInfo size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>SEO & Search Optimization</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Help customers find your dish easily</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Search keywords</label>
                  <input
                    style={inputStyle(false)}
                    name="searchKeywords"
                    value={form.searchKeywords}
                    onChange={onChange}
                    placeholder="e.g. butter chicken, chicken curry, mughlai (comma separated)"
                  />
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                    Words users might search for to find this dish
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Product tags</label>
                  <input
                    style={inputStyle(false)}
                    name="tags"
                    value={form.tags}
                    onChange={onChange}
                    placeholder="e.g. spicy, authentic, north indian (comma separated)"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO keywords</label>
                  <input
                    style={inputStyle(false)}
                    name="keywords"
                    value={form.keywords}
                    onChange={onChange}
                    placeholder="e.g. restaurant, food, delivery (comma separated)"
                  />
                </div>
                <div>
                  <label style={labelStyle}>SEO description</label>
                  <textarea
                    name="seoDescription"
                    value={form.seoDescription}
                    onChange={onChange}
                    placeholder="Short description for search engines (150-160 characters recommended)"
                    style={{ ...inputStyle(false), height: 80, padding: '12px 14px', resize: 'vertical' }}
                  />
                  <div className={`char-counter ${form.seoDescription.length > SEO_DESCRIPTION_LIMIT ? 'over' : ''}`}>
                    {form.seoDescription.length}/{SEO_DESCRIPTION_LIMIT} recommended
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Product attributes</label>
                  <textarea
                    name="attributes"
                    value={form.attributes}
                    onChange={onChange}
                    placeholder="e.g. cuisine: North Indian, spice level: Medium, serves: 2 (key: value format, one per line)"
                    style={{ ...inputStyle(false), height: 80, padding: '12px 14px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <div className="restaurant-card hoverable" style={{ padding: 24, marginBottom: 20, animationDelay: '0.14s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdRestaurantMenu size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Menu</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Which menu this item belongs to</div>
                </div>
              </div>
              {menus.length === 0 ? (
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                  No menu yet — a default &quot;Main Menu&quot; will be created automatically when you save.
                </p>
              ) : (
                <div>
                  <label style={labelStyle}>Select menu</label>
                  <Select size="small" sx={selectSx(false)} value={menuId} displayEmpty onChange={(e) => { setMenuId(e.target.value); setIsDirty(true); }}>
                    <MenuItem value="" disabled>Select menu</MenuItem>
                    {menus.map((m) => (
                      <MenuItem key={m._id} value={m._id}>{m.menuName}</MenuItem>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            <div ref={fieldRefs.category} className={`restaurant-card hoverable ${errors.category ? 'field-error-card' : ''}`} style={{ padding: 24, marginBottom: 20, animationDelay: '0.18s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdCategory size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Category</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Admin-created restaurant categories</div>
                </div>
              </div>
              {categories.length === 0 ? (
                <div style={{ padding: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
                  No categories yet. Ask <strong>admin</strong> to add restaurant categories first.
                </div>
              ) : (
                <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <Select size="small" sx={selectSx(errors.category)} value={categoryId} displayEmpty
                      onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setSubSubCategoryId(''); setIsDirty(true); if (errors.category) setErrors((p) => ({ ...p, category: false })); }}>
                      <MenuItem value="" disabled>Select category</MenuItem>
                      {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                    </Select>
                    {errors.category && <div className="field-error-text"><FaExclamationCircle size={11} /> Category is required</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Sub category</label>
                    <Select size="small" sx={selectSx(false)} value={subCategoryId} displayEmpty disabled={!categoryId}
                      onChange={(e) => { setSubCategoryId(e.target.value); setIsDirty(true); }}>
                      <MenuItem value="">Optional</MenuItem>
                      {subCategories.map((sc) => <MenuItem key={sc._id} value={sc._id}>{sc.name}</MenuItem>)}
                    </Select>
                  </div>
                </div>
              )}
              {subCategories.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Sub-sub category</label>
                  <Select size="small" sx={selectSx(false)} value={subSubCategoryId} displayEmpty disabled={!subCategoryId}
                    onChange={(e) => { setSubSubCategoryId(e.target.value); setIsDirty(true); }}>
                    <MenuItem value="">Optional</MenuItem>
                    {subSubCategories.map((ssc) => <MenuItem key={ssc._id} value={ssc._id}>{ssc.name}</MenuItem>)}
                  </Select>
                </div>
              )}
            </div>

            <div ref={fieldRefs.price} className={`restaurant-card hoverable ${errors.price ? 'field-error-card' : ''}`} style={{ padding: 24, marginBottom: 20, animationDelay: '0.22s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaRupeeSign size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Price</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Selling price for this dish</div>
                  </div>
                </div>
                {discountPercent !== null && (
                  <span className="discount-badge"><FaTag size={10} /> Save {discountPercent}% off</span>
                )}
              </div>
              <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(140px, 220px))', gap: 14 }}>
                <div>
                  <label style={labelStyle}>MRP / Base price (₹) *</label>
                  <input style={inputStyle(errors.price)} type="number" name="price" value={form.price} onChange={onChange} placeholder="199" min="0" />
                  {errors.price && <div className="field-error-text"><FaExclamationCircle size={11} /> Price is required</div>}
                </div>
                <div>
                  <label style={labelStyle}>Offer price (₹)</label>
                  <input style={inputStyle(false)} type="number" name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Optional discount price" min="0" />
                </div>
              </div>
            </div>

            <div ref={fieldRefs.photos} className={`restaurant-card hoverable ${errors.photos ? 'field-error-card' : ''}`} style={{ padding: 24, marginBottom: 24, animationDelay: '0.26s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaImage size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Food photo *</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Appetizing image increases orders</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{previews.length}/{MAX_IMAGES} photos</span>
              </div>
              {errors.photos && <div className="field-error-text" style={{ marginBottom: 10 }}><FaExclamationCircle size={11} /> Upload at least one photo</div>}
              {previews.length > 0 && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
                  Drag to reorder, or hover a photo to make it the cover image.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
                {previews.map((image, index) => (
                  <div
                    key={image + index}
                    className={`img-tile ${dragIndex === index ? 'dragging' : ''} ${dragOverIndex === index && dragIndex !== null && dragIndex !== index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                  >
                    {index === 0 && (
                      <span className="img-cover-badge"><FaStar size={8} /> COVER</span>
                    )}
                    <button type="button" className="img-remove-btn" onClick={() => removeImg(image, index)}>
                      <IoMdClose size={14} />
                    </button>
                    <img src={image} alt="" />
                    {index !== 0 && (
                      <button type="button" className="img-cover-btn" onClick={() => makeCover(index)}>
                        <FaRegStar size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Make cover
                      </button>
                    )}
                  </div>
                ))}
                {previews.length < MAX_IMAGES && (
                  <UploadBox multiple name="images" url="/api/product/uploadImages" setPreviewsFun={setPreviewsFun} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  if (isDirty && !window.confirm('Discard unsaved changes?')) return;
                  context.setIsOpenFullScreenPanel({ open: false });
                }}
              >
                <FaArrowLeft size={12} /> Cancel
              </button>
              <button type="submit" disabled={isLoading} className="submit-btn desktop-submit-btn">
                {isLoading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : (
                  <><FaSave size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </form>

          <aside className="restaurant-preview-card">
            <div className="restaurant-card hoverable" style={{ padding: 20, animationDelay: '0.1s' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 14 }}>Live preview</div>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <div style={{
                  height: 180,
                  background: previews[0] ? `url(${previews[0]}) center/cover` : 'linear-gradient(135deg, #ffedd5, #fdba74)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s ease',
                }}>
                  {!previews[0] && <FaUtensils size={48} color="#fb923c" style={{ opacity: 0.6 }} />}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                    {form.name || 'Dish name'}
                    {form.foodType && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: form.foodType === 'Veg' ? '#dcfce7' : '#fee2e2', color: form.foodType === 'Veg' ? '#166534' : '#991b1b' }}>
                        {form.foodType}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
                    {form.description ? `${form.description.slice(0, 80)}${form.description.length > 80 ? '…' : ''}` : 'Description'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#ea580c' }}>
                      ₹{discountPercent !== null ? form.oldPrice : (form.price || '—')}
                    </div>
                    {discountPercent !== null && (
                      <div style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>₹{form.price}</div>
                    )}
                  </div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', fontSize: 13, color: '#4b5563' }}>
                {completion.checklist.map(({ done, label }, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: done ? '#16a34a' : '#9ca3af', transition: 'color 0.3s ease' }}>
                    <FaCheckCircle size={14} /> {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      {!loadingMeta && restaurant && (
        <div className="mobile-sticky-bar">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Price</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ea580c' }}>₹{form.price || '—'}</div>
          </div>
          <button
            type="button"
            className="submit-btn"
            style={{ flex: 1 }}
            disabled={isLoading}
            onClick={() => formRef.current?.requestSubmit()}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : (
              <><FaSave size={16} /> Save</>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default RestaurantEditProduct;