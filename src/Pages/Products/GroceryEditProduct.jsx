import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import {
  FaLeaf, FaStore, FaImage, FaRupeeSign, FaBoxes, FaTag, FaSave, FaExclamationCircle, FaUndo,
} from 'react-icons/fa';
import { MdCategory, MdInfo, MdSearch } from 'react-icons/md';
import { MyContext } from '../../App';
import { editData, fetchDataFromApi } from '../../utils/api';
import ProductSpecsEditor from '../../Components/ProductSpecsEditor';
import ProductOptionsEditor, { normalizeProductOptionsForSubmit } from '../../Components/ProductOptionsEditor';
import {
  FormShell, Card, Field, Input, TextArea, Pick, ShopBanner, SeoFields, seoFilled, CategoryFields,
  PhotoGrid, PreviewCard, ActionBar, FormSkeleton, EmptyState,
} from '../../Components/ProductFormKit';

const ROLE_CATEGORY_TYPE = {
  GROCERY_SELLER: 'grocery',
  FASHION_SELLER: 'fashion',
  ELECTRONICS_SELLER: 'electronics',
  MEDICAL_SELLER: 'medical',
  BEAUTY_SELLER: 'beauty',
  HOME_KITCHEN_SELLER: 'home-kitchen',
  GIFTS_TOYS_SELLER: 'gifts-toys',
  BOOKS_STATIONERY_SELLER: 'books-stationery',
  JEWELLERY_SELLER: 'jewellery',
  HARDWARE_SELLER: 'hardware',
  AUTOMOBILE_SELLER: 'automobile',
};
const getSellerCategoryType = (role) => ROLE_CATEGORY_TYPE[role] || 'grocery';
const getSellerCategoryLabel = (role) => getSellerCategoryType(role).replace(/-/g, ' ');

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

const SEO_PH = {
  searchKeywords: 'tomato, fresh tomato, red tomato (comma separated)',
  tags: 'organic, fresh, local',
  keywords: 'grocery, vegetables, fresh produce',
  seoDescription: 'Short description for search engines (150-160 characters)',
  attributes: 'brand: Amul, origin: India, storage: refrigerated',
};

const emptyForm = {
  name: '', title: '', description: '', price: '', oldPrice: '', countInStock: '', unit: 'piece',
  isFeatured: 'no', keywords: '', tags: '', searchKeywords: '', seoDescription: '', attributes: '', productType: '',
};

const GroceryEditProduct = () => {
  const context = useContext(MyContext);
  const userRole = context?.userData?.role || localStorage.getItem('userRole') || '';
  const categoryType = getSellerCategoryType(userRole);
  const categoryLabel = getSellerCategoryLabel(userRole);
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

  const [form, setForm] = useState(emptyForm);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [productOptions, setProductOptions] = useState([{ name: '', label: '', values: [] }]);

  const refs = useRef({});
  const reg = (k) => (el) => { refs.current[k] = el; };
  const snapshotRef = useRef(null);
  const isDirtyRef = useRef(false);

  /* ---------- load ---------- */
  useEffect(() => {
    if (!productId) return;
    Promise.all([
      fetchDataFromApi('/api/go-market/seller/grocery-shop'),
      fetchDataFromApi(`/api/go-market/categories?type=${categoryType}&limit=100&status=active`),
      fetchDataFromApi(`/api/go-market/products/${productId}`).catch(() => fetchDataFromApi(`/api/product/${productId}`)),
    ]).then(([shopRes, catRes, prodRes]) => {
      setShop(shopRes?.shop || null);
      setCategories(catRes?.data || []);

      let p = prodRes;
      if (prodRes?.data) {
        if (Array.isArray(prodRes.data)) p = prodRes.data[0];
        else if (typeof prodRes.data === 'object') p = prodRes.data;
      } else if (prodRes?.product) {
        p = prodRes.product;
      }

      if (p && typeof p === 'object') {
        const specs = p.specifications || p.specs || [];
        const unitSpec = specs.find((s) => s.key === 'Unit');
        let unitValue = 'piece';
        if (unitSpec) {
          const found = UNITS.find((u) => u.label.includes(unitSpec.value) || u.value === unitSpec.value);
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

        const nCat = p.categoryId || p.goMarketCategoryId || '';
        const nSub = p.subCategoryId || p.goMarketSubCategoryId || '';
        const nSubSub = p.subSubCategoryId || '';
        setCategoryId(nCat);
        setSubCategoryId(nSub);
        setSubSubCategoryId(nSubSub);

        let nextSpecs = [{ key: '', value: '' }];
        if (Array.isArray(specs) && specs.length > 0) {
          const filtered = specs.filter((s) => s.key !== 'Unit');
          nextSpecs = filtered.length > 0 ? filtered : [{ key: '', value: '' }];
          setSpecifications(nextSpecs);
        }

        let nextOptions = [{ name: '', label: '', values: [] }];
        const opts = p.productOptions || p.options || [];
        if (Array.isArray(opts) && opts.length > 0) {
          nextOptions = opts;
          setProductOptions(nextOptions);
        }

        let imgs = [];
        if (Array.isArray(p.images)) imgs = p.images;
        else if (p.image && typeof p.image === 'string') imgs = [p.image];
        if (imgs.length > 0) setPreviews(imgs);

        snapshotRef.current = JSON.stringify({
          form: nextForm, specifications: nextSpecs, productOptions: nextOptions, previews: imgs,
          categoryId: nCat, subCategoryId: nSub, subSubCategoryId: nSubSub,
        });
      } else {
        console.error('Grocery Edit - invalid product data:', prodRes);
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
      setSubCategories([]); setSubCategoryId(''); setSubSubCategories([]); setSubSubCategoryId('');
      return;
    }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${categoryId}&limit=100&status=active`).then((res) => setSubCategories(res?.data || []));
  }, [categoryId]);

  useEffect(() => {
    if (!subCategoryId) { setSubSubCategories([]); setSubSubCategoryId(''); return; }
    fetchDataFromApi(`/api/go-market/subcategories?parentId=${subCategoryId}&limit=100&status=active`).then((res) => setSubSubCategories(res?.data || []));
  }, [subCategoryId]);

  /* ---------- dirty tracking ---------- */
  const isDirty = useMemo(() => {
    if (!snapshotRef.current) return false;
    return JSON.stringify({ form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId }) !== snapshotRef.current;
  }, [form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId]);

  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirtyRef.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const discardChanges = () => {
    if (!snapshotRef.current) return;
    const s = JSON.parse(snapshotRef.current);
    setForm(s.form); setSpecifications(s.specifications); setProductOptions(s.productOptions); setPreviews(s.previews);
    setCategoryId(s.categoryId); setSubCategoryId(s.subCategoryId); setSubSubCategoryId(s.subSubCategoryId);
    setErrors({});
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ---------- derived ---------- */
  const unitLabel = UNITS.find((u) => u.value === form.unit)?.label?.replace('Per ', '') || form.unit;

  const discountPercent = useMemo(() => {
    const mrp = Number(form.price);
    const sell = Number(form.oldPrice);
    if (!mrp || !sell || sell >= mrp) return 0;
    return Math.round(((mrp - sell) / mrp) * 100);
  }, [form.price, form.oldPrice]);

  const checklist = useMemo(() => ([
    { label: 'Product name', done: !!form.name.trim() },
    { label: 'Description', done: !!form.description.trim() },
    { label: categoryId ? (categories.find((c) => c._id === categoryId)?.name || 'Category selected') : 'Select category', done: !!categoryId },
    { label: form.price ? 'Price set' : 'Set price', done: !!form.price },
    { label: form.countInStock ? 'Stock set' : 'Set stock', done: !!form.countInStock },
    { label: previews.length ? 'Photo added' : 'Add photo', done: previews.length > 0 },
  ]), [form, categoryId, categories, previews]);

  const percent = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const seoCount = seoFilled(form);
  const scrollTo = (k) => refs.current[k]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shop) {
      context.alertBox('error', 'Your grocery shop is not set up. Please contact support or complete registration.');
      return;
    }
    const next = {};
    if (!form.name.trim()) next.name = 'Enter product name';
    if (!form.description.trim()) next.description = 'Enter product description';
    if (!categoryId) next.category = 'Select a category';
    if (!form.price) next.price = 'Enter MRP / price';
    if (!form.countInStock) next.countInStock = 'Enter stock quantity';
    if (previews.length === 0) next.images = 'Upload at least one product image';
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const first = Object.keys(next)[0];
      scrollTo(first);
      context.alertBox('error', next[first]);
      return;
    }

    const sellingPrice = form.oldPrice || form.price;
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

    const onOk = (message) => {
      context.alertBox('success', message || 'Product updated successfully!');
      snapshotRef.current = JSON.stringify({ form, specifications, productOptions, previews, categoryId, subCategoryId, subSubCategoryId });
      setJustSaved(true);
      setTimeout(() => context.setIsOpenFullScreenPanel({ open: false }), 1000);
    };

    setIsLoading(true);
    try {
      const res = await editData(`/api/go-market/products/${productId}`, payload);
      if (res?.error === false || res?.success === true) onOk(res?.message);
      else throw new Error(res?.message || 'Update failed');
    } catch (err) {
      console.error('Update error:', err);
      try {
        const r2 = await editData(`/api/product/updateProduct/${productId}`, payload);
        if (r2?.data?.error === false) onOk(r2?.data?.message);
        else context.alertBox('error', r2?.data?.message || 'Could not update product');
      } catch (_) {
        context.alertBox('error', 'Could not update product. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showForm = !loadingMeta && shop;

  return (
    <FormShell
      theme="green"
      badgeIcon={<FaLeaf size={10} />}
      badge="Grocery seller"
      title="Edit grocery product"
      subtitle="Update details. Changes reflect in your Go Market grocery shop."
      percent={showForm ? percent : undefined}
      extra={isDirty && (
        <>
          <span className="pf-dirty"><i /> Unsaved changes</span>
          <div style={{ marginTop: 8 }}>
            <button type="button" className="pf-btn-ghost sm danger" onClick={discardChanges} disabled={isLoading}><FaUndo size={10} /> Discard changes</button>
          </div>
        </>
      )}
    >
      {loadingMeta ? <FormSkeleton /> : !shop ? (
        <EmptyState icon={<FaExclamationCircle size={38} />} title="Grocery shop not found" text="Complete seller registration with a market to create your shop first." />
      ) : (
        <div className="pf-layout">
          <form className="pf-main" onSubmit={handleSubmit} noValidate>
            <ShopBanner icon={<FaStore />} eyebrow="Updating product in" name={shop.shopName || 'My Grocery Shop'} address={shop.address || 'Go Market store'} />

            <Card icon={<MdInfo size={17} />} title="Product details" sub="Name, description & unit">
              <div className="pf-row2" style={{ marginBottom: 14 }}>
                <Field label="Product name *" error={errors.name} innerRef={reg('name')}>
                  <Input name="name" value={form.name} onChange={onChange} error={errors.name} placeholder="e.g. Fresh Tomatoes, Amul Milk 1L" />
                </Field>
                <Field label="Display title" hint="Blank = product name">
                  <Input name="title" value={form.title} onChange={onChange} placeholder="Shown on product page" />
                </Field>
              </div>
              <Field label="Description *" error={errors.description} count={form.description.length} limit={DESCRIPTION_LIMIT} innerRef={reg('description')}>
                <TextArea name="description" value={form.description} onChange={onChange} error={errors.description} placeholder="Freshness, origin, storage tips…" />
              </Field>
              <div className="pf-row3" style={{ marginBottom: 14 }}>
                <Field label="Sold as *">
                  <Pick name="unit" value={form.unit} onChange={onChange}>
                    {UNITS.map((u) => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}
                  </Pick>
                </Field>
                <Field label="Featured">
                  <Pick name="isFeatured" value={form.isFeatured} onChange={onChange}>
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </Pick>
                </Field>
                <Field label="Product type">
                  <Input name="productType" value={form.productType} onChange={onChange} placeholder="Organic, Premium…" />
                </Field>
              </div>
              <ProductSpecsEditor value={specifications} onChange={setSpecifications} accent="#059669" />
              <div style={{ marginTop: 16 }}>
                <ProductOptionsEditor value={productOptions} onChange={setProductOptions} accent="#059669" />
              </div>
            </Card>

            <Card
              icon={<MdSearch size={18} />} title="SEO & search" sub="Help customers find your product"
              collapsible open={seoOpen} onToggle={() => setSeoOpen((v) => !v)}
              right={seoCount > 0 && <span className="pf-pill">{seoCount}/5 filled</span>}
            >
              <SeoFields form={form} onChange={onChange} ph={SEO_PH} />
            </Card>

            <Card icon={<MdCategory size={18} />} title="Category" sub={`Go Market ${categoryLabel} categories`} error={errors.category}>
              <CategoryFields
                categories={categories} subCategories={subCategories} subSubCategories={subSubCategories}
                categoryId={categoryId} subCategoryId={subCategoryId} subSubCategoryId={subSubCategoryId}
                onCategory={(v) => { setCategoryId(v); setSubCategoryId(''); setSubSubCategoryId(''); if (errors.category) setErrors((p) => ({ ...p, category: undefined })); }}
                onSub={setSubCategoryId} onSubSub={setSubSubCategoryId}
                error={errors.category} innerRef={reg('category')}
                emptyText={<>No categories yet. Please ask the <strong>admin</strong> to add {categoryLabel} categories.</>}
              />
            </Card>

            <Card icon={<FaRupeeSign size={15} />} title="Price & stock" sub="MRP, selling price and availability">
              <div className="pf-row3">
                <Field label="MRP (₹) *" error={errors.price} innerRef={reg('price')}>
                  <Input type="number" min="0" name="price" value={form.price} onChange={onChange} error={errors.price} placeholder="100" />
                </Field>
                <Field label="Selling price (₹)">
                  <Input type="number" min="0" name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Same as MRP" />
                </Field>
                <Field label="Stock qty *" error={errors.countInStock} innerRef={reg('countInStock')}>
                  <Input type="number" min="0" name="countInStock" value={form.countInStock} onChange={onChange} error={errors.countInStock} placeholder="50" />
                </Field>
              </div>
              {discountPercent > 0 && <div className="pf-discount"><FaTag size={11} /> {discountPercent}% off for customers</div>}
            </Card>

            <Card
              icon={<FaImage size={15} />} title="Product photos *" sub="Drag tiles or use arrows to reorder"
              error={errors.images} innerRef={reg('images')}
              right={previews.length > 0 && <span className="pf-pill">{previews.length} added</span>}
            >
              <PhotoGrid
                previews={previews} setPreviews={setPreviews} error={errors.images}
                onChanged={() => errors.images && setErrors((p) => ({ ...p, images: undefined }))}
              />
            </Card>

            <ActionBar percent={percent} saving={isLoading} saved={justSaved} label="Save changes" icon={<FaSave size={15} />} />
          </form>

          <PreviewCard
            image={previews[0]} fallbackIcon={<FaBoxes />}
            title={form.name || 'Product name'}
            desc={form.description ? form.description.slice(0, 80) + (form.description.length > 80 ? '…' : '') : 'Description appears here'}
            price={`₹${form.oldPrice || form.price || '—'}`}
            strike={form.oldPrice && form.price && Number(form.oldPrice) < Number(form.price) ? `₹${form.price}` : null}
            unit={`/ ${unitLabel || 'unit'}`}
            footer={form.countInStock ? `${form.countInStock} in stock` : 'Out of stock'}
            footerOk={Number(form.countInStock) > 0}
            checklist={checklist}
          />
        </div>
      )}
    </FormShell>
  );
};

export default GroceryEditProduct;