import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import {
  FiPlus, FiMinus, FiAlertCircle, FiArrowLeft, FiInfo, FiList, FiSliders, FiTag, FiBox, FiStar, FiGrid, FiImage,
} from 'react-icons/fi';
import { FaSave } from 'react-icons/fa';
import { MyContext } from '../../App';
import { editData, fetchDataFromApi } from '../../utils/api';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';
import {
  FormShell, Card, Field, Input, TextArea, Pick, Toggle, PhotoGrid, ActionBar, FormSkeleton,
} from '../../Components/ProductFormKit';

const NAME_MAX = 100;
const TITLE_MAX = 100;
const DESC_MAX = 1000;

const SECTIONS = [
  { id: 'basic', label: 'Basic' },
  { id: 'specs', label: 'Specs' },
  { id: 'options', label: 'Options' },
  { id: 'pricing', label: 'Price' },
  { id: 'stock', label: 'Stock' },
  { id: 'featured', label: 'Featured' },
  { id: 'categories', label: 'Category' },
  { id: 'images', label: 'Photos' },
];

const fieldToSection = { name: 'basic', description: 'basic', categoryId: 'categories', price: 'pricing', countInStock: 'stock' };

const SpecialtyEditProduct = () => {
  const context = useContext(MyContext);
  const productId = context?.isOpenFullScreenPanel?.id;
  const isGrocery = context?.userData?.role === 'GROCERY_SELLER';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [productOptions, setProductOptions] = useState([{ name: '', label: '', values: [] }]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState({
    name: '', title: '', description: '', price: '', oldPrice: '', countInStock: '',
    categoryId: '', subCategoryId: '', isAvailable: true, isFeatured: false,
  });

  const initialFormRef = useRef(null);
  const sectionRefs = useRef({});
  const reg = (id) => (el) => { sectionRefs.current[id] = el; };

  /* ---------- load ---------- */
  useEffect(() => {
    if (!productId) return;
    const catType = isGrocery ? 'grocery' : 'restaurant';

    Promise.all([
      fetchDataFromApi(`/api/go-market/products/${productId}`).catch(() => fetchDataFromApi(`/api/product/${productId}`)),
      fetchDataFromApi(`/api/go-market/categories?type=${catType}&limit=100&status=active`),
    ]).then(([prodRes, catRes]) => {
      let p = prodRes?.data || prodRes?.product || prodRes;
      if (p?.data && typeof p.data === 'object' && !Array.isArray(p.data)) p = p.data;

      if (p && typeof p === 'object') {
        const loadedForm = {
          name: p.name || '',
          title: p.title || '',
          description: p.description || '',
          price: p.price || p.discountPrice || '',
          oldPrice: p.oldPrice || p.price || p.discountPrice || '',
          countInStock: isGrocery ? String(p.countInStock ?? p.stock ?? 0) : '',
          categoryId: p.categoryId || p.goMarketCategoryId || '',
          subCategoryId: p.subCategoryId || p.goMarketSubCategoryId || '',
          isAvailable: p.isAvailable !== false,
          isFeatured: p.isFeatured || false,
        };
        setForm(loadedForm);
        initialFormRef.current = loadedForm;

        const specs = p.specifications || p.specs || [];
        if (Array.isArray(specs) && specs.length > 0) setSpecifications(specs);
        const opts = p.productOptions || p.options || [];
        if (Array.isArray(opts) && opts.length > 0) setProductOptions(opts);

        let imgs = [];
        if (Array.isArray(p.images)) imgs = p.images;
        else if (p.image && typeof p.image === 'string') imgs = [p.image];
        if (imgs.length > 0) setPreviews(imgs);
      }
      setCategories(catRes?.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error('Error loading product:', err);
      context.alertBox('error', 'Could not load product details');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isGrocery]);

  useEffect(() => {
    if (!form.categoryId) { setSubCategories([]); return; }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${form.categoryId}&limit=100&status=active`).then((res) => setSubCategories(res?.data || []));
  }, [form.categoryId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const scrollToSection = (id) => {
    setActiveTab(id);
    sectionRefs.current[id]?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  /* ---------- derived ---------- */
  const discountPercent = useMemo(() => {
    const op = Number(form.oldPrice);
    const sp = Number(form.price);
    if (!op || !sp || sp >= op) return 0;
    return Math.round((1 - sp / op) * 100);
  }, [form.oldPrice, form.price]);

  const priceHigherThanMrp = Number(form.price) > 0 && Number(form.oldPrice) > 0 && Number(form.price) > Number(form.oldPrice);

  const requiredFields = useMemo(() => {
    const f = ['name', 'description', 'categoryId', 'price'];
    if (isGrocery) f.push('countInStock');
    return f;
  }, [isGrocery]);

  const percent = useMemo(() => {
    const filled = requiredFields.filter((f) => String(form[f] || '').trim() !== '').length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [form, requiredFields]);

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(initialFormRef.current) !== JSON.stringify(form);
  }, [form]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.categoryId) errs.categoryId = 'Please select a category';
    if (!form.price) errs.price = 'Price is required';
    if (isGrocery && !form.countInStock) errs.countInStock = 'Stock quantity is required';
    return errs;
  };

  /* ---------- submit ---------- */
  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      context.alertBox('error', errs[first]);
      scrollToSection(fieldToSection[first] || 'basic');
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

    const onOk = (message) => {
      context.alertBox('success', message || 'Product updated successfully!');
      setSaved(true);
      setTimeout(() => context.setIsOpenFullScreenPanel({ open: false }), 900);
    };

    try {
      const res = await editData(`/api/go-market/products/${productId}`, payload);
      if (res?.error === false || res?.success === true) onOk(res?.message);
      else if (res?.data?.error === false) onOk(res?.data?.message);
      else throw new Error(res?.message || res?.data?.message || 'Update failed');
    } catch (err) {
      console.error('Update error:', err);
      try {
        const r2 = await editData(`/api/product/updateProduct/${productId}`, payload);
        if (r2?.data?.error === false) onOk(r2?.data?.message);
        else context.alertBox('error', r2?.data?.message || r2?.message || 'Update failed');
      } catch (fallbackErr) {
        context.alertBox('error', fallbackErr?.message || 'Could not update product');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them and close?')) return;
    context.setIsOpenFullScreenPanel({ open: false });
  };

  const stock = Number(form.countInStock || 0);

  return (
    <FormShell
      theme={isGrocery ? 'green' : 'orange'}
      badgeIcon={<FiInfo size={11} />}
      badge={isGrocery ? 'Grocery item' : 'Menu item'}
      title={isGrocery ? 'Edit grocery item' : 'Edit menu item'}
      subtitle="Update details, pricing, stock and photos."
      percent={loading ? undefined : percent}
      extra={isDirty && <span className="pf-dirty"><i /> Unsaved changes</span>}
    >
      {loading ? <FormSkeleton /> : (
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <nav className="pf-nav">
            {SECTIONS.map((s) => (
              <button type="button" key={s.id} className={activeTab === s.id ? 'on' : ''} onClick={() => scrollToSection(s.id)}>
                {s.label}
              </button>
            ))}
          </nav>

          <form className="pf-main" onSubmit={onSubmit} noValidate>
            <Card innerRef={reg('basic')} icon={<FiInfo size={16} />} title="Basic information" sub="Name, title and description" error={errors.name || errors.description}>
              <div className="pf-row2" style={{ marginBottom: 14 }}>
                <Field label="Product name *" error={errors.name} count={form.name.length} limit={NAME_MAX}>
                  <Input name="name" value={form.name} onChange={onChange} maxLength={NAME_MAX} error={errors.name} placeholder="e.g. Fresh Tomatoes, Biryani" />
                </Field>
                <Field label="Display title" count={form.title.length} limit={TITLE_MAX}>
                  <Input name="title" value={form.title} onChange={onChange} maxLength={TITLE_MAX} placeholder="Blank = product name" />
                </Field>
              </div>
              <Field label="Description *" error={errors.description} count={form.description.length} limit={DESC_MAX}>
                <TextArea name="description" value={form.description} onChange={onChange} rows={4} maxLength={DESC_MAX} error={errors.description} placeholder="Describe the product in detail…" />
              </Field>
            </Card>

            <Card innerRef={reg('specs')} icon={<FiList size={16} />} title="Specifications" sub="Key and value details">
              <ProductSpecsEditor value={specifications} onChange={setSpecifications} accent={isGrocery ? '#059669' : '#ea580c'} />
            </Card>

            <Card innerRef={reg('options')} icon={<FiSliders size={16} />} title="Product options" sub="Size, colour, weight etc.">
              <ProductOptionsEditor value={productOptions} onChange={setProductOptions} accent={isGrocery ? '#059669' : '#ea580c'} />
            </Card>

            <Card
              innerRef={reg('pricing')} icon={<FiTag size={16} />} title="Pricing" sub="MRP and selling price"
              right={discountPercent > 0 && <span className="pf-pill">{discountPercent}% OFF</span>}
            >
              <div className="pf-row2">
                <Field label="MRP / original price (₹) *">
                  <Input name="oldPrice" type="number" min={0} value={form.oldPrice} onChange={onChange} placeholder="100" />
                </Field>
                <Field label="Selling price (₹) *" error={errors.price}>
                  <Input name="price" type="number" min={0} value={form.price} onChange={onChange} error={errors.price} placeholder="85" />
                </Field>
              </div>
              {priceHigherThanMrp && (
                <div className="pf-note"><FiAlertCircle size={13} /> Selling price is higher than MRP, so customers won't see a discount.</div>
              )}
            </Card>

            <Card innerRef={reg('stock')} icon={<FiBox size={16} />} title="Stock & availability" sub={isGrocery ? 'How many units you have' : 'Can customers order this now?'}>
              {isGrocery ? (
                <Field label="Stock quantity *" error={errors.countInStock}>
                  <div className="pf-stepper">
                    <button type="button" aria-label="Decrease" onClick={() => setForm((f) => ({ ...f, countInStock: String(Math.max(0, Number(f.countInStock || 0) - 1)) }))}><FiMinus size={14} /></button>
                    <Input name="countInStock" type="number" min={0} value={form.countInStock} onChange={onChange} error={errors.countInStock} placeholder="50" />
                    <button type="button" aria-label="Increase" onClick={() => setForm((f) => ({ ...f, countInStock: String(Number(f.countInStock || 0) + 1) }))}><FiPlus size={14} /></button>
                  </div>
                  <div className="pf-hint" style={{ color: stock > 0 ? '#15803d' : '#dc2626', fontWeight: 600 }}>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</div>
                </Field>
              ) : (
                <Toggle name="isAvailable" checked={form.isAvailable} onChange={onChange} label="Available on menu" hint="Customers can order this item right now" />
              )}
            </Card>

            <Card innerRef={reg('featured')} icon={<FiStar size={16} />} title="Featured" sub="Highlight on the homepage">
              <Toggle name="isFeatured" checked={form.isFeatured} onChange={onChange} label="Featured product" hint="Shown in homepage highlights" />
            </Card>

            <Card innerRef={reg('categories')} icon={<FiGrid size={16} />} title="Categories" sub="Where customers will find it" error={errors.categoryId}>
              <div className="pf-row2">
                <Field label="Category *" error={errors.categoryId}>
                  <Pick
                    value={form.categoryId} error={errors.categoryId}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, categoryId: e.target.value, subCategoryId: '' }));
                      if (errors.categoryId) setErrors((p) => ({ ...p, categoryId: undefined }));
                    }}
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Pick>
                </Field>
                <Field label="Sub category">
                  <Pick value={form.subCategoryId} onChange={(e) => setForm((f) => ({ ...f, subCategoryId: e.target.value }))} disabled={!form.categoryId}>
                    <MenuItem value="">Optional</MenuItem>
                    {subCategories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Pick>
                </Field>
              </div>
            </Card>

            <Card
              innerRef={reg('images')} icon={<FiImage size={16} />} title="Product gallery" sub="First image is the cover. Drag or use arrows to reorder."
              right={<span className="pf-pill">{previews.length} {previews.length === 1 ? 'image' : 'images'}</span>}
            >
              <PhotoGrid previews={previews} setPreviews={setPreviews} />
            </Card>

            <ActionBar
              percent={percent} saving={saving} saved={saved} label="Save changes" icon={<FaSave size={15} />}
              onCancel={handleClose} cancelIcon={<FiArrowLeft size={13} />}
            />
          </form>
        </div>
      )}
    </FormShell>
  );
};

export default SpecialtyEditProduct;