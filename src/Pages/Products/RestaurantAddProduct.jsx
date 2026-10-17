import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import {
  FaUtensils, FaStore, FaImage, FaRupeeSign, FaCloudUploadAlt, FaExclamationCircle, FaArrowLeft, FaTag,
} from 'react-icons/fa';
import { MdCategory, MdInfo, MdRestaurantMenu, MdSearch } from 'react-icons/md';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';
import {
  FormShell, Card, Field, Input, TextArea, Pick, ShopBanner, SeoFields, seoFilled, CategoryFields,
  PhotoGrid, PreviewCard, ActionBar, FormSkeleton, EmptyState,
} from '../../Components/ProductFormKit';

const FOOD_TYPES = [
  { value: '', label: 'Not specified' },
  { value: 'Veg', label: 'Vegetarian' },
  { value: 'Non-Veg', label: 'Non-Vegetarian' },
  { value: 'Egg', label: 'Contains Egg' },
];

const DESCRIPTION_LIMIT = 500;
const MAX_IMAGES = 8;

const SEO_PH = {
  searchKeywords: 'butter chicken, chicken curry, mughlai (comma separated)',
  tags: 'spicy, authentic, north indian',
  keywords: 'restaurant, food, delivery',
  seoDescription: 'Short description for search engines (150-160 characters)',
  attributes: 'cuisine: North Indian, spice level: Medium, serves: 2',
};

const RestaurantAddProduct = () => {
  const context = useContext(MyContext);
  const history = useNavigate();
  const refs = useRef({});
  const reg = (k) => (el) => { refs.current[k] = el; };

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
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    name: '', title: '', description: '', isFeatured: 'no', price: '', oldPrice: '', foodType: '',
    keywords: '', tags: '', searchKeywords: '', seoDescription: '', attributes: '', productType: '',
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [productOptions, setProductOptions] = useState([{ name: '', label: '', values: [] }]);

  /* ---------- load ---------- */
  useEffect(() => {
    Promise.all([
      fetchDataFromApi('/api/go-market/restaurants?limit=1'),
      fetchDataFromApi('/api/go-market/categories?type=restaurant&limit=100&status=active'),
    ]).then(([restaurantRes, catRes]) => {
      const rest = restaurantRes?.data?.[0] || null;
      setRestaurant(rest);
      setCategories(catRes?.data || []);
      if (rest?._id) {
        fetchDataFromApi(`/api/go-market/menus/restaurant/${rest._id}?limit=50`).then((menuRes) => {
          const list = menuRes?.data || [];
          setMenus(list);
          if (list[0]?._id) setMenuId(list[0]._id);
          setLoadingMeta(false);
        });
      } else {
        setLoadingMeta(false);
      }
    }).catch(() => setLoadingMeta(false));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]); setSubCategoryId(''); setSubSubCategories([]); setSubSubCategoryId('');
      return;
    }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${categoryId}&limit=100&status=active`).then((res) => setSubCategories(res?.data || []));
  }, [categoryId]);

  useEffect(() => {
    if (!subCategoryId) { setSubSubCategories([]); setSubSubCategoryId(''); return; }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${subCategoryId}&limit=100&status=active`).then((res) => setSubSubCategories(res?.data || []));
  }, [subCategoryId]);

  useEffect(() => {
    const handler = (e) => { if (!isDirty) return; e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const photosChanged = () => {
    setIsDirty(true);
    setErrors((p) => (p.photos ? { ...p, photos: undefined } : p));
  };

  /* ---------- derived ---------- */
  const discountPercent = useMemo(() => {
    const mrp = Number(form.price);
    const offer = Number(form.oldPrice);
    if (!mrp || !offer || offer >= mrp) return null;
    return Math.round((1 - offer / mrp) * 100);
  }, [form.price, form.oldPrice]);

  const checklist = useMemo(() => ([
    { done: !!form.name.trim(), label: 'Name entered' },
    { done: !!form.description.trim(), label: 'Description added' },
    { done: !!categoryId, label: 'Category selected' },
    { done: !!form.price, label: 'Price set' },
    { done: previews.length > 0, label: 'Photo added' },
  ]), [form.name, form.description, categoryId, form.price, previews.length]);

  const percent = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const seoCount = seoFilled(form);
  const scrollTo = (k) => refs.current[k]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });

  /* ---------- submit ---------- */
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
    const next = {};
    let firstKey = null;
    let firstMsg = null;
    checks.forEach(([fail, msg, key]) => {
      if (!fail) return;
      if (key) next[key] = msg;
      if (!firstMsg) { firstMsg = msg; firstKey = key; }
    });
    if (firstMsg) {
      setErrors(next);
      context.alertBox('error', firstMsg);
      if (firstKey) scrollTo(firstKey);
      return;
    }

    const specRows = specifications.filter((s) => s.key?.trim() && s.value?.trim());
    if (form.foodType) specRows.push({ key: 'Food type', value: form.foodType });
    const payload = {
      restaurantId: restaurant._id,
      menuId: menuId || undefined,
      itemName: form.name.trim(),
      title: (form.title || form.name).trim(),
      description: form.description.trim(),
      specifications: specRows,
      productOptions: normalizeProductOptionsForSubmit(productOptions),
      price: Number(form.price),
      discountPrice: form.oldPrice ? Number(form.oldPrice) : 0,
      image: previews[0],
      images: previews,
      categoryId: categoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      subSubCategoryId: subSubCategoryId || undefined,
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
    postData('/api/go-market/items', payload)
      .then((res) => {
        setIsLoading(false);
        if (res?.error === false || res?.success === true) {
          setIsDirty(false);
          context.alertBox('success', res?.message || 'Menu item added to your restaurant!');
          context.setIsOpenFullScreenPanel({ open: false });
          history('/products');
        } else {
          context.alertBox('error', res?.message || 'Could not add menu item');
        }
      })
      .catch(() => {
        setIsLoading(false);
        context.alertBox('error', 'Could not add item. Please try again.');
      });
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    context.setIsOpenFullScreenPanel({ open: false });
    history('/products');
  };

  const showForm = !loadingMeta && restaurant;

  return (
    <FormShell
      theme="orange"
      badgeIcon={<FaUtensils size={10} />}
      badge="Restaurant seller"
      title="Add menu item"
      subtitle="This dish will appear on your Go Market restaurant menu for customers to order."
      percent={showForm ? percent : undefined}
      extra={isDirty && <span className="pf-dirty"><i /> Unsaved changes</span>}
    >
      {loadingMeta ? <FormSkeleton /> : !restaurant ? (
        <EmptyState icon={<FaExclamationCircle size={38} />} title="Restaurant not found" text="Complete seller registration with a market to create your restaurant first." />
      ) : (
        <div className="pf-layout">
          <form className="pf-main" onSubmit={handleSubmit} noValidate>
            <ShopBanner icon={<FaStore />} eyebrow="Your restaurant" name={restaurant.restaurantName || 'My Restaurant'} address={restaurant.address || 'Go Market'} />

            <Card icon={<MdInfo size={17} />} title="Item details" sub="Name, description & food type" error={errors.name || errors.description}>
              <div className="pf-row2" style={{ marginBottom: 14 }}>
                <Field label="Dish name *" error={errors.name} innerRef={reg('name')}>
                  <Input name="name" value={form.name} onChange={onChange} error={errors.name} maxLength={120} placeholder="e.g. Butter Chicken, Margherita Pizza" />
                </Field>
                <Field label="Display title" hint="Blank = dish name">
                  <Input name="title" value={form.title} onChange={onChange} placeholder="Shown on product page" />
                </Field>
              </div>
              <Field label="Description *" error={errors.description} count={form.description.length} limit={DESCRIPTION_LIMIT} innerRef={reg('description')}>
                <TextArea name="description" value={form.description} onChange={onChange} error={errors.description} maxLength={DESCRIPTION_LIMIT} placeholder="Ingredients, spice level, serving size…" />
              </Field>
              <div className="pf-row3" style={{ marginBottom: 14 }}>
                <Field label="Food type">
                  <Pick name="foodType" value={form.foodType} onChange={onChange}>
                    {FOOD_TYPES.map((t) => <MenuItem key={t.value || 'none'} value={t.value}>{t.label}</MenuItem>)}
                  </Pick>
                </Field>
                <Field label="Featured dish">
                  <Pick name="isFeatured" value={form.isFeatured} onChange={onChange}>
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </Pick>
                </Field>
                <Field label="Product type">
                  <Input name="productType" value={form.productType} onChange={onChange} placeholder="Main Course, Dessert…" />
                </Field>
              </div>
              <ProductSpecsEditor value={specifications} onChange={(v) => { setSpecifications(v); setIsDirty(true); }} accent="#ea580c" />
              <div style={{ marginTop: 16 }}>
                <ProductOptionsEditor value={productOptions} onChange={(v) => { setProductOptions(v); setIsDirty(true); }} accent="#ea580c" />
              </div>
            </Card>

            <Card
              icon={<MdSearch size={18} />} title="SEO & search" sub="Help customers find your dish"
              collapsible open={seoOpen} onToggle={() => setSeoOpen((v) => !v)}
              right={seoCount > 0 && <span className="pf-pill">{seoCount}/5 filled</span>}
            >
              <SeoFields form={form} onChange={onChange} ph={SEO_PH} />
            </Card>

            <Card icon={<MdRestaurantMenu size={18} />} title="Menu" sub="Which menu this item belongs to">
              {menus.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280' }}>No menu yet — a default “Main Menu” will be created automatically when you save.</p>
              ) : (
                <Field label="Select menu">
                  <Pick value={menuId} onChange={(e) => { setMenuId(e.target.value); setIsDirty(true); }}>
                    <MenuItem value="" disabled>Select menu</MenuItem>
                    {menus.map((m) => <MenuItem key={m._id} value={m._id}>{m.menuName}</MenuItem>)}
                  </Pick>
                </Field>
              )}
            </Card>

            <Card icon={<MdCategory size={18} />} title="Category" sub="Admin-created restaurant categories" error={errors.category}>
              <CategoryFields
                categories={categories} subCategories={subCategories} subSubCategories={subSubCategories}
                categoryId={categoryId} subCategoryId={subCategoryId} subSubCategoryId={subSubCategoryId}
                onCategory={(v) => { setCategoryId(v); setSubCategoryId(''); setSubSubCategoryId(''); setIsDirty(true); if (errors.category) setErrors((p) => ({ ...p, category: undefined })); }}
                onSub={(v) => { setSubCategoryId(v); setIsDirty(true); }}
                onSubSub={(v) => { setSubSubCategoryId(v); setIsDirty(true); }}
                error={errors.category} innerRef={reg('category')}
                emptyText={<>No categories yet. Ask <strong>admin</strong> to add restaurant categories first.</>}
              />
            </Card>

            <Card
              icon={<FaRupeeSign size={15} />} title="Price" sub="Selling price for this dish" error={errors.price}
              right={discountPercent !== null && <span className="pf-pill"><FaTag size={9} /> Save {discountPercent}%</span>}
            >
              <div className="pf-row2">
                <Field label="MRP / base price (₹) *" error={errors.price} innerRef={reg('price')}>
                  <Input type="number" min="0" name="price" value={form.price} onChange={onChange} error={errors.price} placeholder="199" />
                </Field>
                <Field label="Offer price (₹)">
                  <Input type="number" min="0" name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Optional discount price" />
                </Field>
              </div>
            </Card>

            <Card
              icon={<FaImage size={15} />} title="Food photos *" sub="Appetizing images increase orders"
              error={errors.photos} innerRef={reg('photos')}
              right={<span className="pf-pill">{previews.length}/{MAX_IMAGES}</span>}
            >
              <PhotoGrid previews={previews} setPreviews={setPreviews} max={MAX_IMAGES} error={errors.photos} onChanged={photosChanged} />
            </Card>

            <ActionBar
              percent={percent} saving={isLoading} label="Publish to my menu" icon={<FaCloudUploadAlt size={16} />}
              onCancel={handleCancel} cancelIcon={<FaArrowLeft size={11} />}
            />
          </form>

          <PreviewCard
            image={previews[0]} fallbackIcon={<FaUtensils />}
            title={form.name || 'Dish name'}
            tag={form.foodType || null} tagTone={form.foodType === 'Veg' ? 'veg' : ''}
            desc={form.description ? `${form.description.slice(0, 80)}${form.description.length > 80 ? '…' : ''}` : 'Description'}
            price={`₹${discountPercent !== null ? form.oldPrice : (form.price || '—')}`}
            strike={discountPercent !== null ? `₹${form.price}` : null}
            checklist={checklist}
          />
        </div>
      )}
    </FormShell>
  );
};

export default RestaurantAddProduct;