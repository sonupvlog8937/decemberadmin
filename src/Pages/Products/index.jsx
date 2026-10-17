import React, { useContext, useEffect, useState } from 'react';
import {
  Button, Checkbox, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Chip, Tooltip, IconButton, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, Fade,
} from '@mui/material';
import { IoMdAdd } from 'react-icons/io';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaRegEye, FaBoxOpen } from 'react-icons/fa6';
import { GoTrash } from 'react-icons/go';
import { MdDeleteOutline, MdFilterList, MdWarning, MdRefresh } from 'react-icons/md';
import { TbPackage } from 'react-icons/tb';
import Rating from '@mui/material/Rating';
import { Link } from 'react-router-dom';
import SearchBox from '../../Components/SearchBox';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, deleteMultipleData, patchData } from '../../utils/api';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import '../../styles/productUi.css';

const label = { inputProps: { 'aria-label': 'Select product' } };

const SELLER_ROLES = [
  'SELLER', 'GROCERY_SELLER', 'RESTAURANT_SELLER', 'FASHION_SELLER', 'ELECTRONICS_SELLER', 'MEDICAL_SELLER',
  'BEAUTY_SELLER', 'HOME_KITCHEN_SELLER', 'GIFTS_TOYS_SELLER', 'BOOKS_STATIONERY_SELLER', 'JEWELLERY_SELLER',
  'HARDWARE_SELLER', 'AUTOMOBILE_SELLER',
];

const GO_MARKET_SHOP_SELLERS = [
  'GROCERY_SELLER', 'FASHION_SELLER', 'ELECTRONICS_SELLER', 'MEDICAL_SELLER', 'BEAUTY_SELLER', 'HOME_KITCHEN_SELLER',
  'GIFTS_TOYS_SELLER', 'BOOKS_STATIONERY_SELLER', 'JEWELLERY_SELLER', 'HARDWARE_SELLER', 'AUTOMOBILE_SELLER',
];

const isSellerRole = (role) => SELLER_ROLES.includes(role);

const columns = [
  { id: 'product', label: 'PRODUCT', minWidth: 220 },
  { id: 'category', label: 'CATEGORY', minWidth: 110 },
  { id: 'subcategory', label: 'SUB CATEGORY', minWidth: 130 },
  { id: 'price', label: 'PRICE', minWidth: 120 },
  { id: 'sales', label: 'SALES', minWidth: 80 },
  { id: 'stock', label: 'STOCK', minWidth: 90 },
  { id: 'rating', label: 'RATING', minWidth: 110 },
  { id: 'action', label: 'ACTION', minWidth: 110 },
];

const StatCard = ({ label: lbl, value, icon }) => (
  <div className="pl-stat">
    <div className="pl-stat-ico">{icon}</div>
    <div>
      <div className="pl-stat-val">{value ?? <Skeleton width={36} height={24} />}</div>
      <div className="pl-stat-lbl">{lbl}</div>
    </div>
  </div>
);

export const Products = () => {
  const [productCat, setProductCat] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [productData, setProductData] = useState([]);
  const [productTotalData, setProductTotalData] = useState([]);
  const [productSubCat, setProductSubCat] = React.useState('');
  const [productThirdLavelCat, setProductThirdLavelCat] = useState('');
  const [sortedIds, setSortedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageOrder, setPageOrder] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [open, setOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '', multiple: false });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const context = useContext(MyContext);
  const role = context?.userData?.role;
  const isRestaurantSeller = role === 'RESTAURANT_SELLER';
  const isGoMarketShopSeller = GO_MARKET_SHOP_SELLERS.includes(role);
  const isSpecialtySeller = isGoMarketShopSeller || isRestaurantSeller;
  const theme = isGoMarketShopSeller ? 'green' : isRestaurantSeller ? 'orange' : 'violet';
  const tableColumns = columns.map((col) => (col.id === 'stock' && isRestaurantSeller ? { ...col, label: 'AVAILABILITY' } : col));

  useEffect(() => { getProducts(page, rowsPerPage); }, [context?.isOpenFullScreenPanel, page, rowsPerPage]);

  useEffect(() => {
    if (searchQuery !== '') {
      const src = productTotalData?.totalProducts || productTotalData?.products || [];
      const q = searchQuery.toLowerCase();
      const filtered = src.filter((p) =>
        p._id?.toLowerCase().includes(q) ||
        p?.name?.toLowerCase().includes(q) ||
        p?.catName?.toLowerCase().includes(q) ||
        p?.subCat?.includes(searchQuery)
      );
      setProductData({
        error: false, success: true, products: filtered, total: filtered.length, page: parseInt(page),
        totalPages: Math.ceil(filtered.length / rowsPerPage), totalCount: productData?.totalCount,
      });
    } else {
      getProducts(page, rowsPerPage);
    }
  }, [searchQuery]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updated = productData?.products?.map((item) => ({ ...item, checked: isChecked }));
    setProductData({ ...productData, products: updated });
    setSortedIds(isChecked ? updated.map((i) => i._id) : []);
  };

  const handleCheckboxChange = (e, id) => {
    const updated = productData?.products?.map((item) => (item._id === id ? { ...item, checked: !item.checked } : item));
    setProductData({ ...productData, products: updated });
    setSortedIds(updated.filter((i) => i.checked).map((i) => i._id));
  };

  const getProducts = async (pg, limit) => {
    setIsLoading(true);
    const endpoint = isSellerRole(role)
      ? `/api/product/seller/products?page=${pg + 1}&limit=${limit}`
      : `/api/product/getAllProducts?page=${pg + 1}&limit=${limit}`;
    fetchDataFromApi(endpoint).then((res) => {
      setProductData(res);
      setProductTotalData(res);
      setIsLoading(false);
      setPhotos((res?.products || []).map((p) => ({ src: p.images?.[0] })));
    });
  };

  const loadByCat = (url, val, extra = {}) => {
    if (!val) { getProducts(0, rowsPerPage); return; }
    setIsLoading(true);
    fetchDataFromApi(`${url}/${val}`).then((res) => {
      if (res?.error === false) {
        setProductData({
          error: false, success: true, products: res?.products,
          totalPages: Math.ceil(res?.products?.length / rowsPerPage), ...extra(res),
        });
        setIsLoading(false);
      }
    });
  };

  const handleChangeProductCat = (event) => {
    const val = event.target.value;
    setProductCat(val); setProductSubCat(''); setProductThirdLavelCat('');
    loadByCat('/api/product/getAllProductsByCatId', val, (res) => ({ totalCount: res?.products?.length }));
  };
  const handleChangeProductSubCat = (event) => {
    const val = event.target.value;
    setProductSubCat(val); setProductCat(''); setProductThirdLavelCat('');
    loadByCat('/api/product/getAllProductsBySubCatId', val, () => ({}));
  };
  const handleChangeProductThirdLavelCat = (event) => {
    const val = event.target.value;
    setProductThirdLavelCat(val); setProductCat(''); setProductSubCat('');
    loadByCat('/api/product/getAllProductsByThirdLavelCat', val, () => ({}));
  };

  const handleChangeRowsPerPage = (event) => { setRowsPerPage(+event.target.value); setPage(0); };
  const handleChangePage = (event, newPage) => { setPage(newPage); getProducts(newPage, rowsPerPage); };

  const confirmDelete = (id, name, multiple = false) => setDeleteDialog({ open: true, id, name, multiple });

  const handleConfirmedDelete = () => {
    if (deleteDialog.multiple) {
      deleteMultipleData('/api/product/deleteMultiple', { data: { ids: sortedIds } }).then(() => {
        context.alertBox('success', `${sortedIds.length} products deleted`);
        setSortedIds([]);
        getProducts(page, rowsPerPage);
      });
    } else {
      if (role !== 'ADMIN' && !isSellerRole(role)) {
        context.alertBox('error', 'Only admin or seller can delete product');
        return;
      }
      deleteData(`/api/product/${deleteDialog.id}`).then(() => {
        context.alertBox('success', 'Product deleted');
        getProducts(page, rowsPerPage);
      });
    }
    setDeleteDialog({ open: false, id: null, name: '', multiple: false });
  };

  const totalCount = productData?.totalCount || productData?.total || 0;
  const outOfStock = productData?.outOfStock || 0;
  const featuredCount = productData?.featuredCount || 0;
  const lowStockCount = productData?.lowStockCount || 0;
  const totalMenuCount = productData?.totalMenuCount || 0;

  const stockTone = (stock) => {
    if (stock === 0) return { cls: 'out', label: 'Out' };
    if (stock < 10) return { cls: 'low', label: stock };
    return { cls: 'ok', label: stock };
  };

  const quickToggleStock = (product) => {
    if (!isGoMarketShopSeller) return;
    const nextStock = product.countInStock > 0 ? 0 : 50;
    patchData(`/api/product/seller/grocery-stock/${product._id}`, { stock: nextStock }).then((res) => {
      const body = res?.data;
      if (body?.success || body?.error === false) {
        context.alertBox('success', nextStock > 0 ? 'Item back in stock' : 'Marked out of stock');
        getProducts(page, rowsPerPage);
      } else {
        context.alertBox('error', body?.message || 'Could not update stock');
      }
    });
  };

  const quickToggleAvailability = (product) => {
    if (!isRestaurantSeller) return;
    const next = product.isAvailable === false;
    patchData(`/api/product/seller/item-availability/${product._id}`, { isAvailable: next }).then((res) => {
      const body = res?.data;
      if (body?.success || body?.error === false) {
        context.alertBox('success', next ? 'Item is available' : 'Item hidden from menu');
        getProducts(page, rowsPerPage);
      } else {
        context.alertBox('error', body?.message || 'Could not update');
      }
    });
  };

  const quickToggleFeatured = (product) => {
    if (role !== 'ADMIN' && !isSellerRole(role)) {
      context.alertBox('error', 'Only admin or seller can change featured status');
      return;
    }
    const nextFeatured = !product.isFeatured;
    patchData(`/api/product/${product._id}`, { isFeatured: nextFeatured }).then((res) => {
      const body = res?.data || res;
      if (body?.success || body?.error === false) {
        context.alertBox('success', nextFeatured ? 'Product marked as featured' : 'Removed from featured');
        getProducts(page, rowsPerPage);
      } else {
        context.alertBox('error', body?.message || 'Could not update featured status');
      }
    });
  };

  const quickToggleSponsored = async (product) => {
    if (role !== 'ADMIN') {
      context.alertBox('error', 'Only admin can manage sponsored products');
      return;
    }
    const nextSponsored = !product.isSponsored;
    try {
      const res = await patchData(`/api/product/sponsored/${product._id}`, { isSponsored: nextSponsored });
      const body = res?.data || res;
      if (body?.success || body?.error === false) {
        context.alertBox('success', nextSponsored ? 'Product sponsored in search results' : 'Product removed from sponsored results');
        getProducts(page, rowsPerPage);
      } else {
        context.alertBox('error', body?.message || 'Could not update sponsored status');
      }
    } catch (error) {
      context.alertBox('error', error?.response?.data?.message || 'Could not update sponsored status');
    }
  };

  const filterDefs = [
    { label: 'Category', value: productCat, onChange: handleChangeProductCat, items: context?.catData?.map((c) => ({ id: c._id, name: c.name })) },
    { label: 'Sub category', value: productSubCat, onChange: handleChangeProductSubCat, items: context?.catData?.flatMap((c) => c.children || []).map((c) => ({ id: c._id, name: c.name })) },
    { label: 'Third level', value: productThirdLavelCat, onChange: handleChangeProductThirdLavelCat, items: context?.catData?.flatMap((c) => (c.children || []).flatMap((sc) => sc.children || [])).map((c) => ({ id: c._id, name: c.name })) },
  ];

  const allChecked = productData?.products?.length > 0 ? productData?.products?.every((i) => i.checked) : false;

  return (
    <div className={`pl-root pl-${theme}`}>
      {/* ── Header ── */}
      <div className="pl-head">
        <div>
          <h1 className="pl-title">{isGoMarketShopSeller ? 'My shop products' : isRestaurantSeller ? 'My menu items' : 'Products'}</h1>
          <p className="pl-sub">
            {isGoMarketShopSeller ? 'Quick-commerce inventory: stock, pricing and fast delivery'
              : isRestaurantSeller ? 'Kitchen menu: availability and prep-ready items'
                : 'Manage your product catalogue'}
          </p>
        </div>
        <div className="pl-actions">
          <Tooltip title="Refresh">
            <IconButton size="small" className="pl-iconbtn" onClick={() => getProducts(page, rowsPerPage)}><MdRefresh size={18} /></IconButton>
          </Tooltip>
          <Button variant="contained" className="pl-add" startIcon={<IoMdAdd size={16} />}
            onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Add Product' })}>
            {isRestaurantSeller ? 'Add menu item' : 'Add product'}
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="pl-stats">
        <StatCard label="Total items" value={totalCount || '--'} icon={<TbPackage />} />
        {!isRestaurantSeller && <StatCard label="Out of stock" value={outOfStock || 0} icon={<FaBoxOpen />} />}
        {isGoMarketShopSeller ? (
          <StatCard label="Low stock" value={lowStockCount || 0} icon={<IoMdAdd />} />
        ) : isRestaurantSeller ? (
          <StatCard label="Total menu" value={totalMenuCount || 0} icon={<IoMdAdd />} />
        ) : (
          <StatCard label="Featured" value={featuredCount || 0} icon={<IoMdAdd />} />
        )}
      </div>

      {/* ── Main card ── */}
      <div className="pl-card">
        <div className="pl-bar">
          {!isSpecialtySeller && (
            <button type="button" className={`pl-filterbtn${filtersOpen ? ' on' : ''}`} onClick={() => setFiltersOpen((p) => !p)}>
              <MdFilterList size={16} /> Filters {(productCat || productSubCat || productThirdLavelCat) ? '●' : ''}
            </button>
          )}
          {sortedIds.length > 0 && (
            <Fade in>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Chip label={`${sortedIds.length} selected`} size="small" style={{ background: '#ede9fe', color: '#7c3aed', fontWeight: 700 }} />
                <Button variant="outlined" color="error" size="small" startIcon={<MdDeleteOutline size={15} />}
                  onClick={() => confirmDelete(null, null, true)} style={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 8 }}>
                  Delete selected
                </Button>
              </div>
            </Fade>
          )}
          <div className="pl-bar-search">
            <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPageOrder={setPageOrder} />
          </div>
        </div>

        {!isSpecialtySeller && filtersOpen && (
          <div className="pl-filters">
            {filterDefs.map((f) => (
              <div key={f.label}>
                <label>{f.label}</label>
                <Select size="small" fullWidth value={f.value} onChange={f.onChange} displayEmpty sx={{ fontSize: 13, background: '#fff', borderRadius: 2 }}>
                  <MenuItem value="">All</MenuItem>
                  {f.items?.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </Select>
              </div>
            ))}
          </div>
        )}

        <TableContainer className="pl-tc pl-table">
          <Table stickyHeader size="small" aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 2 }}>
                  <Checkbox {...label} size="small" onChange={handleSelectAll} checked={allChecked}
                    indeterminate={sortedIds.length > 0 && sortedIds.length < (productData?.products?.length || 0)} />
                </TableCell>
                {tableColumns.map((col) => (
                  <TableCell key={col.id} sx={{ minWidth: col.minWidth, py: 1.5 }}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}><Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 1 }} /></TableCell>
                    {tableColumns.map((col) => <TableCell key={col.id}><Skeleton variant="text" width="80%" height={20} /></TableCell>)}
                  </TableRow>
                ))
              ) : productData?.products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="pl-empty">
                      <TbPackage size={40} style={{ opacity: 0.3 }} />
                      <b>No products found</b>
                      <span style={{ fontSize: 12 }}>Try adjusting the filters or search query</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productData?.products?.map((product, index) => {
                  const sc = stockTone(product.countInStock);
                  return (
                    <TableRow key={product._id || index} className={product.checked ? 'sel' : ''}>
                      <TableCell padding="checkbox" sx={{ pl: 2 }} className="pl-c-chk">
                        <Checkbox {...label} size="small" checked={!!product.checked} onChange={(e) => handleCheckboxChange(e, product._id)} />
                      </TableCell>

                      <TableCell className="pl-c-prod" data-label="Product">
                        <div className="pl-prodcell">
                          <div className="pl-thumb" onClick={() => { setLightboxIdx(index); setOpen(true); }}>
                            <LazyLoadImage alt="product" effect="blur" src={product?.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <Link to={`/product-viewer/${product._id}`}><div className="pl-name">{product?.name}</div></Link>
                            {!isSpecialtySeller && <div className="pl-brand">{product?.brand}</div>}
                            {!isSpecialtySeller && (
                              <button type="button" className={`pl-tagbtn${product?.isFeatured ? ' gold' : ''}`} onClick={() => quickToggleFeatured(product)}
                                title={product?.isFeatured ? 'Click to remove from featured' : 'Click to mark as featured'}>
                                {product?.isFeatured ? '★ Featured' : '☆ Feature'}
                              </button>
                            )}
                            {role === 'ADMIN' && (
                              <button type="button" className={`pl-tagbtn${product?.isSponsored ? ' blue' : ''}`} onClick={() => quickToggleSponsored(product)}
                                title={product?.isSponsored ? 'Remove sponsored placement' : 'Promote this product in search'}>
                                {product?.isSponsored ? '◆ Sponsored' : '◇ Sponsor'}
                              </button>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell data-label="Category">{product?.catName}</TableCell>
                      <TableCell data-label="Sub category">{product?.subCat || '—'}</TableCell>

                      <TableCell data-label="Price">
                        <div className="pl-price">
                          <b>{product?.oldPrice?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</b>
                          <s>{product?.price?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</s>
                          {product?.discount > 0 && <span className="pl-off">-{product.discount}%</span>}
                        </div>
                      </TableCell>

                      <TableCell data-label="Sales"><b>{product?.sale}</b></TableCell>

                      <TableCell data-label={isRestaurantSeller ? 'Availability' : 'Stock'}>
                        {isGoMarketShopSeller ? (
                          <button type="button" className={`pl-pill ${sc.cls}`} onClick={() => quickToggleStock(product)} title="Tap to toggle in/out of stock">
                            {sc.label === 'Out' ? 'Out of stock' : `${sc.label} in stock`}
                          </button>
                        ) : isRestaurantSeller ? (
                          <button type="button" className={`pl-pill ${product.isAvailable === false ? 'out' : 'ok'}`} onClick={() => quickToggleAvailability(product)} title="Tap to toggle availability">
                            {product.isAvailable === false ? 'Unavailable' : 'Available'}
                          </button>
                        ) : (
                          <span className={`pl-pill ${sc.cls}`}>{sc.label === 'Out' ? 'Out of stock' : sc.label}</span>
                        )}
                      </TableCell>

                      <TableCell data-label="Rating">
                        <div className="pl-rating">
                          <Rating value={product?.rating} readOnly size="small" precision={0.5} />
                          <span>{product?.rating?.toFixed(1)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="pl-c-act" data-label="Action">
                        <div className="pl-acts">
                          <Tooltip title="Edit" arrow>
                            <IconButton size="small" className="pl-act edit"
                              onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Edit Product', id: product._id })}>
                              <AiOutlineEdit size={15} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View" arrow>
                            <Link to={`/product-viewer/${product._id}`}>
                              <IconButton size="small" className="pl-act view"><FaRegEye size={13} /></IconButton>
                            </Link>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton size="small" className="pl-act del" onClick={() => confirmDelete(product._id, product.name)}>
                              <GoTrash size={13} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 150, 200]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #f3f4f6', '.MuiTablePagination-toolbar': { flexWrap: 'wrap' } }}
        />
      </div>

      {/* ── Delete dialog ── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })} maxWidth="xs" fullWidth PaperProps={{ style: { borderRadius: 16 } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <span className="pl-dlg-ico"><MdWarning size={17} /></span> Confirm delete
        </DialogTitle>
        <DialogContent>
          <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
            {deleteDialog.multiple ? `Delete ${sortedIds.length} selected products? This cannot be undone.` : `Delete "${deleteDialog.name}"? This cannot be undone.`}
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmedDelete} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Lightbox open={open} close={() => setOpen(false)} slides={photos} index={lightboxIdx} />
    </div>
  );
};

export default Products;