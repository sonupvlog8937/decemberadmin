import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';

const PAGE_SIZE = 300;
const SHOP_PAGE_SIZE = 100;
const COLORS = ['#6d4aff', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#ec4899', '#8b5cf6'];
const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'refunded'];

const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const shiftDate = (value, days) => {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return localDateString(date);
};

const dateRangeForPreset = (preset, now = new Date()) => {
  const today = localDateString(now);
  if (preset === 'today') return { from: today, to: today };
  if (preset === 'yesterday') {
    const yesterday = shiftDate(today, -1);
    return { from: yesterday, to: yesterday };
  }
  if (preset === 'last7' || preset === 'weekly') return { from: shiftDate(today, -6), to: today };
  if (preset === 'last30') return { from: shiftDate(today, -29), to: today };
  if (preset === 'thisMonth' || preset === 'monthly') {
    return { from: localDateString(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
  }
  if (preset === 'previousMonth') {
    return {
      from: localDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: localDateString(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return { from: shiftDate(today, -6), to: today };
};

const startOfLocalDayIso = (dateString) => parseLocalDate(dateString).toISOString();
const startOfNextLocalDayIso = (dateString) => {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
};

const extractItems = (response, keys) => {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
};

const recordId = (value) => {
  if (value && typeof value === 'object') return value._id || value.id || '';
  return value || '';
};

const normalizeStatus = (value) => {
  const status = String(value || 'pending').toLowerCase().trim().replace(/_/g, ' ');
  if (status === 'canceled' || status === 'cancel') return 'cancelled';
  if (status === 'confirm') return 'confirmed';
  if (status === 'assigned' || status === 'assigned to rider') return 'processing';
  return status;
};

const getOrderStatus = (order) => {
  const status = normalizeStatus(order?.order_status);
  if (status === 'cancelled') return status;
  return String(order?.refund?.status || '').toLowerCase() === 'processed' ? 'refunded' : status;
};

const getPaymentMethod = (order) => (order?.paymentId ? 'online' : 'cod');
const isQuickCommerceOrder = (order) => {
  const type = String(order?.goMarketData?.orderType || 'standard').toLowerCase();
  return type === 'go_market' || type === 'go-market' || type === 'quick_commerce';
};
const isCancelledOrRefunded = (order) => {
  const status = getOrderStatus(order);
  return status === 'cancelled' || status === 'refunded';
};

const productGross = (item) => {
  const subtotal = Number(item?.subTotal);
  if (Number.isFinite(subtotal) && subtotal >= 0) return subtotal;
  const price = Number(item?.price);
  const quantity = Number(item?.quantity ?? 1);
  return Number.isFinite(price) && price >= 0 && Number.isFinite(quantity) && quantity > 0 ? price * quantity : 0;
};

const orderDeliveryFee = (order) => (Number(order?.deliveryFee) || 0) + (Number(order?.shippingFee) || 0);
const orderGross = (order) => (Array.isArray(order?.products) ? order.products : []).reduce((sum, item) => sum + productGross(item), 0);
const orderNet = (order) => {
  if (isCancelledOrRefunded(order)) return 0;
  const gross = orderGross(order);
  const discount = Math.max(Number(order?.discount_amount) || 0, 0);
  const refund = Math.max(Number(order?.refund?.amount) || 0, 0);
  return Math.max(gross - discount - refund, 0);
};

const shopMappingForItem = (item, shopIndexes) => {
  const explicitShopId = recordId(item?.shopId || item?.shop || item?.restaurantId);
  const sellerId = recordId(item?.sellerId);
  const matchedShop = explicitShopId && shopIndexes.byShopId.get(String(explicitShopId));
  if (matchedShop) return { id: String(matchedShop._id), name: matchedShop.displayName, diagnostic: false, diagnosticReason: '' };
  const sellerMatches = !explicitShopId && sellerId ? shopIndexes.bySellerId.get(String(sellerId)) || [] : [];
  if (sellerMatches.length === 1) {
    return { id: String(sellerMatches[0]._id), name: sellerMatches[0].displayName, diagnostic: false, diagnosticReason: '' };
  }
  const diagnosticReason = sellerMatches.length > 1
    ? 'ambiguous seller mapping'
    : explicitShopId
      ? 'shop reference not found'
      : sellerId
        ? 'seller not mapped'
        : 'missing shop reference';
  const unknownId = explicitShopId ? String(explicitShopId) : sellerId ? `seller:${sellerId}` : 'unknown';
  return { id: unknownId, name: `Unknown Shop (${diagnosticReason})`, diagnostic: true, diagnosticReason };
};

const numberFormat = new Intl.NumberFormat('en-IN');
const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const formatCurrency = (value) => currencyFormat.format(Number(value) || 0);
const formatDate = (dateString, options = { day: 'numeric', month: 'short' }) =>
  parseLocalDate(dateString).toLocaleDateString('en-IN', options);

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const saveCsv = (filename, rows) => {
  const content = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const getApiError = (response) => response?.response?.data?.message || response?.message || 'The server returned an invalid response.';

const fetchAllPages = async (endpoint, params = {}) => {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const search = new URLSearchParams({ ...params, page: String(page), limit: String(PAGE_SIZE), analytics: 'true' });
    const response = await fetchDataFromApi(`${endpoint}?${search.toString()}`);
    if (!response || response.error || response.success === false || !Array.isArray(response.data)) {
      throw new Error(getApiError(response));
    }
    all.push(...response.data);
    totalPages = Math.max(Number(response.totalPages) || 1, 1);
    page += 1;
  } while (page <= totalPages);
  return all;
};

const fetchShopPages = async (endpoint) => {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await fetchDataFromApi(`${endpoint}?page=${page}&limit=${SHOP_PAGE_SIZE}`);
    if (!response || response.error || response.success === false) throw new Error(getApiError(response));
    const items = extractItems(response, ['data', 'shops', 'restaurants', 'results']);
    all.push(...items);
    totalPages = Math.max(Number(response.totalPages || response.pagination?.totalPages) || (items.length === SHOP_PAGE_SIZE ? page + 1 : 1), 1);
    page += 1;
  } while (page <= totalPages);
  return all;
};

const getOrderRangeParams = (from, to) => ({
  startAt: startOfLocalDayIso(from),
  endAt: startOfNextLocalDayIso(to),
});

const getProductShopId = (item, shopIndexes) => shopMappingForItem(item, shopIndexes).id;

const OrderAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const initialRange = dateRangeForPreset('weekly');
  const [draftFilters, setDraftFilters] = useState({
    ...initialRange, status: 'all', shopId: 'all', orderType: 'all', paymentMethod: 'all', preset: 'weekly',
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopError, setShopError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [shopSort, setShopSort] = useState('revenue');
  const [shopPage, setShopPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [chartMode, setChartMode] = useState('orders');
  const [pendingThreshold, setPendingThreshold] = useState(24);
  const [expandedOrder, setExpandedOrder] = useState('');
  const latestLoadRequest = useRef(0);

  const shopIndexes = useMemo(() => {
    const byShopId = new Map();
    const bySellerId = new Map();
    shops.forEach((shop) => {
      const id = recordId(shop?._id || shop?.id);
      if (!id) return;
      const name = shop.shopName || shop.restaurantName || shop.name || shop.displayName || shop.location || 'Unnamed Shop';
      const normalized = { ...shop, _id: String(id), displayName: name };
      byShopId.set(String(id), normalized);
      const owner = shop.ownerId;
      const ownerId = recordId(owner?.userId || owner);
      if (ownerId) {
        const sellerShops = bySellerId.get(String(ownerId)) || [];
        sellerShops.push(normalized);
        bySellerId.set(String(ownerId), sellerShops);
      }
    });
    return { byShopId, bySellerId };
  }, [shops]);
  const activeShopCount = useMemo(() => shops.filter((shop) => shop.isOpen !== false).length, [shops]);

  const loadOrders = useCallback(async (filters, isRefresh = false) => {
    const requestId = ++latestLoadRequest.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { from, to } = filters;
      if (!from || !to || from > to) throw new Error('Choose a valid date range (From date must be on or before To date).');
      const currentDays = Math.floor((parseLocalDate(to) - parseLocalDate(from)) / 86400000) + 1;
      const previousTo = shiftDate(from, -1);
      const previousFrom = shiftDate(previousTo, -(currentDays - 1));
      const [current, previous] = await Promise.all([
        fetchAllPages('/api/order/order-list', getOrderRangeParams(from, to)),
        fetchAllPages('/api/order/order-list', getOrderRangeParams(previousFrom, previousTo)),
      ]);
      if (requestId !== latestLoadRequest.current) return;
      setCurrentOrders(current);
      setPreviousOrders(previous);
    } catch (loadError) {
      if (requestId !== latestLoadRequest.current) return;
      setError(loadError.message || 'Unable to load analytics data. Please retry.');
      if (!isRefresh) {
        setCurrentOrders([]);
        setPreviousOrders([]);
      }
    } finally {
      if (requestId === latestLoadRequest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadOrders({ from: appliedFilters.from, to: appliedFilters.to });
    return () => { latestLoadRequest.current += 1; };
  }, [appliedFilters.from, appliedFilters.to, loadOrders]);

  useEffect(() => {
    let active = true;
    const loadShops = async () => {
      const results = await Promise.allSettled([
        fetchShopPages('/api/go-market/grocery-shops'),
        fetchShopPages('/api/go-market/restaurants'),
      ]);
      if (!active) return;
      const loaded = [];
      const failures = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.push(...result.value.map((shop) => ({ ...shop, shopKind: index === 0 ? 'quick-commerce' : 'restaurant' })));
        } else {
          failures.push(`${index === 0 ? 'Shop' : 'Restaurant'} directory: ${result.reason?.message || 'request failed'}`);
        }
      });
      setShops(loaded);
      setShopError(failures.join(' '));
    };
    loadShops();
    return () => { active = false; };
  }, []);

  const matchesFilters = useCallback((order, filters) => {
    if (filters.status !== 'all' && getOrderStatus(order) !== filters.status) return false;
    if (filters.paymentMethod !== 'all' && getPaymentMethod(order) !== filters.paymentMethod) return false;
    const quickCommerce = isQuickCommerceOrder(order);
    if (filters.orderType === 'quick' && !quickCommerce) return false;
    if (filters.orderType === 'ecommerce' && quickCommerce) return false;
    if (filters.shopId !== 'all') {
      return (order.products || []).some((item) => getProductShopId(item, shopIndexes) === filters.shopId);
    }
    return true;
  }, [shopIndexes]);

  const filteredOrders = useMemo(
    () => currentOrders.filter((order) => matchesFilters(order, appliedFilters)),
    [currentOrders, appliedFilters, matchesFilters],
  );
  const filteredPreviousOrders = useMemo(
    () => previousOrders.filter((order) => matchesFilters(order, appliedFilters)),
    [previousOrders, appliedFilters, matchesFilters],
  );

  const scopeOrdersToShop = useCallback((orders, shopId) => {
    if (shopId === 'all') return orders;
    return orders.map((order) => {
      const items = (order.products || []).filter((item) => getProductShopId(item, shopIndexes) === shopId);
      const fullGross = orderGross(order);
      const scopedGross = items.reduce((sum, item) => sum + productGross(item), 0);
      const share = fullGross > 0 ? scopedGross / fullGross : 0;
      return {
        ...order,
        products: items,
        discount_amount: (Number(order.discount_amount) || 0) * share,
        refund: { ...order.refund, amount: (Number(order.refund?.amount) || 0) * share },
      };
    });
  }, [shopIndexes]);
  const analyticsOrders = useMemo(
    () => scopeOrdersToShop(filteredOrders, appliedFilters.shopId),
    [scopeOrdersToShop, filteredOrders, appliedFilters.shopId],
  );
  const analyticsPreviousOrders = useMemo(
    () => scopeOrdersToShop(filteredPreviousOrders, appliedFilters.shopId),
    [scopeOrdersToShop, filteredPreviousOrders, appliedFilters.shopId],
  );

  const availableShops = useMemo(() => {
    const choices = new Map();
    shops.forEach((shop) => {
      const id = recordId(shop?._id || shop?.id);
      if (id) choices.set(String(id), shop.shopName || shop.restaurantName || shop.name || shop.displayName || 'Unnamed Shop');
    });
    [...currentOrders, ...previousOrders].forEach((order) => (order.products || []).forEach((item) => {
      const mapping = shopMappingForItem(item, shopIndexes);
      if (!choices.has(mapping.id)) choices.set(mapping.id, mapping.name);
    }));
    return [...choices.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [shops, currentOrders, previousOrders, shopIndexes]);

  const calculateMetrics = useCallback((orders) => {
    const counts = {};
    const shopStats = new Map();
    const products = new Map();
    const payment = { COD: 0, Online: 0 };
    let grossSales = 0;
    let netSales = 0;
    let totalItems = 0;
    let missingPrices = 0;
    let mappedSales = 0;
    let orderTypes = { ecommerce: 0, quick: 0 };

    orders.forEach((order) => {
      const status = getOrderStatus(order);
      counts[status] = (counts[status] || 0) + 1;
      const isExcluded = isCancelledOrRefunded(order);
      const items = Array.isArray(order.products) ? order.products : [];
      if (getPaymentMethod(order) === 'online') payment.Online += 1;
      else payment.COD += 1;
      const orderType = String(order?.goMarketData?.orderType || 'standard').toLowerCase();
      if (orderType === 'go_market' || orderType === 'go-market' || orderType === 'quick_commerce') orderTypes.quick += 1;
      else orderTypes.ecommerce += 1;
      const gross = isExcluded ? 0 : orderGross(order);
      const discount = isExcluded ? 0 : Math.max(Number(order.discount_amount) || 0, 0);
      const refund = isExcluded ? 0 : Math.max(Number(order?.refund?.amount) || 0, 0);
      const net = Math.max(gross - discount - refund, 0);
      grossSales += gross;
      netSales += net;
      let orderAttributedGross = 0;

      items.forEach((item) => {
        const quantity = Number(item?.quantity);
        const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
        if (!isExcluded) totalItems += qty;
        const itemAmount = isExcluded ? 0 : productGross(item);
        if (!isExcluded && itemAmount === 0) missingPrices += 1;
        const mapping = shopMappingForItem(item, shopIndexes);
        if (!shopStats.has(mapping.id)) {
          shopStats.set(mapping.id, {
            shopId: mapping.id, shopName: mapping.name, totalOrders: 0,
            deliveredOrders: 0, pendingOrders: 0, cancelledOrders: 0,
            totalItems: 0, grossSales: 0, netSales: 0, diagnostic: mapping.diagnostic,
            orderIds: new Set(), eligibleOrderIds: new Set(),
          });
        }
        const shop = shopStats.get(mapping.id);
        if (!isExcluded) shop.totalItems += qty;
        if (!isExcluded) {
          shop.grossSales += itemAmount;
          orderAttributedGross += itemAmount;
        }
        const productKey = String(item?.productId || item?.productTitle || 'unknown-product');
        const productRow = products.get(productKey) || {
          name: item?.productTitle || 'Unknown Product', quantity: 0, revenue: 0,
        };
        if (!isExcluded) productRow.quantity += qty;
        productRow.revenue += itemAmount;
        products.set(productKey, productRow);
      });

      if (orderAttributedGross > 0) {
        items.forEach((item) => {
          const mapping = shopMappingForItem(item, shopIndexes);
          const shop = shopStats.get(mapping.id);
          const itemAmount = isExcluded ? 0 : productGross(item);
          const proportionalNet = gross > 0 ? Math.max(net, 0) * itemAmount / gross : 0;
          shop.netSales += proportionalNet;
        });
      }

      const distinctShopIds = new Set(items.map((item) => shopMappingForItem(item, shopIndexes).id));
      distinctShopIds.forEach((id) => {
        const shop = shopStats.get(id);
        if (!shop) return;
        if (!shop.orderIds.has(String(order._id))) {
          shop.orderIds.add(String(order._id));
          shop.totalOrders += 1;
          if (!isExcluded) shop.eligibleOrderIds.add(String(order._id));
          if (status === 'delivered') shop.deliveredOrders += 1;
          if (status === 'pending') shop.pendingOrders += 1;
          if (status === 'cancelled') shop.cancelledOrders += 1;
        }
      });
    });

    const finalizedShops = [...shopStats.values()].map((shop) => ({
      ...shop,
      orderIds: undefined,
      averageOrderValue: shop.eligibleOrderIds.size ? shop.netSales / shop.eligibleOrderIds.size : 0,
      eligibleOrderIds: undefined,
      cancellationRate: shop.totalOrders ? shop.cancelledOrders / shop.totalOrders * 100 : 0,
    }));
    const eligibleOrders = orders.filter((order) => !isCancelledOrRefunded(order));
    const activeShops = activeShopCount;
    const shopsWithOrders = new Set(finalizedShops.filter((shop) => shop.totalOrders > 0 && !shop.diagnostic).map((shop) => shop.shopId)).size;
    const pendingLongOrders = orders.filter((order) =>
      getOrderStatus(order) === 'pending' &&
      Number.isFinite(new Date(order.createdAt).getTime()) &&
      Date.now() - new Date(order.createdAt).getTime() > pendingThreshold * 3600000
    );
    return {
      totalOrders: orders.length,
      deliveredOrders: counts.delivered || 0,
      pendingOrders: counts.pending || 0,
      cancelledOrders: counts.cancelled || 0,
      refundedOrders: counts.refunded || 0,
      cancellationRate: orders.length ? (counts.cancelled || 0) / orders.length * 100 : 0,
      grossSales,
      netSales,
      averageOrderValue: eligibleOrders.length ? netSales / eligibleOrders.length : 0,
      activeShops,
      shopsWithOrders,
      byStatus: counts,
      shopStats: finalizedShops,
      products: [...products.values()].sort((a, b) => b.quantity - a.quantity),
      payment,
      orderTypes,
      totalItems,
      missingPrices,
      pendingLongOrders,
      mappedSales,
    };
  }, [activeShopCount, shopIndexes, pendingThreshold]);

  const metrics = useMemo(() => calculateMetrics(analyticsOrders), [calculateMetrics, analyticsOrders]);
  const previousMetrics = useMemo(() => calculateMetrics(analyticsPreviousOrders), [calculateMetrics, analyticsPreviousOrders]);

  const trend = (current, previous) => {
    if (!previous) return current ? { text: 'New', positive: true } : { text: 'No prior data', positive: true };
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return { text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`, positive: change >= 0 };
  };

  const dailyStats = useMemo(() => {
    const days = Math.floor((parseLocalDate(appliedFilters.to) - parseLocalDate(appliedFilters.from)) / 86400000) + 1;
    const bucketSize = days > 62 ? 7 : 1;
    const currentMap = new Map();
    const previousMap = new Map();
    const previousTo = shiftDate(appliedFilters.from, -1);
    const previousFrom = shiftDate(previousTo, -(days - 1));
    const addOrdersToMap = (orders, map, rangeStart) => orders.forEach((order) => {
      const createdAt = new Date(order.createdAt);
      if (!Number.isFinite(createdAt.getTime())) return;
      const orderDate = localDateString(createdAt);
      const offset = Math.floor((parseLocalDate(orderDate) - parseLocalDate(rangeStart)) / 86400000);
      if (offset < 0 || offset >= days) return;
      const bucketIndex = Math.floor(offset / bucketSize);
      const bucketStart = shiftDate(appliedFilters.from, bucketIndex * bucketSize);
      const row = map.get(bucketStart) || { date: bucketStart, orders: 0, revenue: 0 };
      row.orders += 1;
      row.revenue += orderNet(order);
      map.set(bucketStart, row);
    });
    addOrdersToMap(analyticsOrders, currentMap, appliedFilters.from);
    addOrdersToMap(analyticsPreviousOrders, previousMap, previousFrom);
    const bucketCount = Math.ceil(days / bucketSize);
    return Array.from({ length: bucketCount }, (_, index) => {
      const date = shiftDate(appliedFilters.from, index * bucketSize);
      return {
      date,
      orders: currentMap.get(date)?.orders || 0,
      revenue: currentMap.get(date)?.revenue || 0,
      previousOrders: previousMap.get(date)?.orders || 0,
      previousRevenue: previousMap.get(date)?.revenue || 0,
    };
    });
  }, [appliedFilters.from, appliedFilters.to, analyticsOrders, analyticsPreviousOrders]);

  const shopRows = useMemo(() => {
    const rows = new Map();
    shops.forEach((shop) => {
      const id = String(recordId(shop._id || shop.id));
      if (!id) return;
      rows.set(id, {
        shopId: id, shopName: shop.shopName || shop.restaurantName || shop.name || 'Unnamed Shop',
        totalOrders: 0, deliveredOrders: 0, pendingOrders: 0, cancelledOrders: 0,
        totalItems: 0, grossSales: 0, netSales: 0, averageOrderValue: 0, cancellationRate: 0,
        diagnostic: false,
      });
    });
    metrics.shopStats.forEach((shop) => {
      const existing = rows.get(shop.shopId);
      rows.set(shop.shopId, { ...existing, ...shop });
    });
    const output = [...rows.values()].filter((shop) => shop.shopName.toLowerCase().includes(shopSearch.toLowerCase()));
    if (shopSort === 'orders') output.sort((a, b) => b.totalOrders - a.totalOrders || b.netSales - a.netSales);
    else if (shopSort === 'cancellation') output.sort((a, b) => b.cancellationRate - a.cancellationRate);
    else output.sort((a, b) => b.netSales - a.netSales || b.totalOrders - a.totalOrders);
    return output;
  }, [shops, metrics.shopStats, shopSearch, shopSort]);

  const orderRows = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return filteredOrders;
    return filteredOrders.filter((order) => {
      const customer = String(order.userId?.name || '').toLowerCase();
      const orderId = String(order._id || '').toLowerCase();
      const shopNames = (order.products || []).map((item) => shopMappingForItem(item, shopIndexes).name).join(' ').toLowerCase();
      return orderId.includes(query) || customer.includes(query) || shopNames.includes(query);
    });
  }, [filteredOrders, orderSearch, shopIndexes]);

  useEffect(() => {
    setShopPage(1);
  }, [shopSearch, shopSort, appliedFilters]);
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, appliedFilters]);

  const shopPageCount = Math.max(1, Math.ceil(shopRows.length / 10));
  const pagedShops = shopRows.slice((shopPage - 1) * 10, shopPage * 10);
  const orderPageCount = Math.max(1, Math.ceil(orderRows.length / 20));
  const pagedOrders = orderRows.slice((orderPage - 1) * 20, orderPage * 20);

  const applyFilters = (filters) => {
    if (!filters.from || !filters.to || filters.from > filters.to) {
      setError('Choose a valid date range (From date must be on or before To date).');
      return;
    }
    setError('');
    setAppliedFilters({ ...filters });
    setOrderSearch('');
    setExpandedOrder('');
  };

  const updateDraft = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const choosePreset = (preset) => {
    if (preset === 'custom') {
      updateDraft('preset', preset);
      return;
    }
    const range = dateRangeForPreset(preset);
    const next = { ...draftFilters, ...range, preset };
    setDraftFilters(next);
    applyFilters(next);
  };

  const resetFilters = () => {
    const next = { ...dateRangeForPreset('weekly'), status: 'all', shopId: 'all', orderType: 'all', paymentMethod: 'all', preset: 'weekly' };
    setDraftFilters(next);
    setShopSearch('');
    setOrderSearch('');
    applyFilters(next);
  };

  const selectShop = (shopId) => {
    const next = { ...draftFilters, shopId };
    setDraftFilters(next);
    applyFilters(next);
  };

  const kpis = [
    { label: 'Total Orders', current: metrics.totalOrders, previous: previousMetrics.totalOrders, tip: 'All orders created in the selected period, including cancelled and refunded orders.' },
    { label: 'Delivered Orders', current: metrics.deliveredOrders, previous: previousMetrics.deliveredOrders, tip: 'Orders whose normalized status is delivered.' },
    { label: 'Pending Orders', current: metrics.pendingOrders, previous: previousMetrics.pendingOrders, tip: 'Orders currently in pending status.' },
    { label: 'Cancelled Orders', current: metrics.cancelledOrders, previous: previousMetrics.cancelledOrders, tip: 'Orders with cancelled or canceled status.' },
    { label: 'Cancellation Rate', current: `${metrics.cancellationRate.toFixed(1)}%`, previous: `${previousMetrics.cancellationRate.toFixed(1)}%`, changeCurrent: metrics.cancellationRate, changePrevious: previousMetrics.cancellationRate, tip: 'Cancelled orders divided by all filtered orders.' },
    { label: 'Gross Sales', current: formatCurrency(metrics.grossSales), previous: formatCurrency(previousMetrics.grossSales), changeCurrent: metrics.grossSales, changePrevious: previousMetrics.grossSales, tip: 'Sum of product subtotals (or price × quantity when subtotal is absent) for non-cancelled/non-refunded orders, including pending orders. Excludes delivery fees.' },
    { label: 'Net Sales', current: formatCurrency(metrics.netSales), previous: formatCurrency(previousMetrics.netSales), changeCurrent: metrics.netSales, changePrevious: previousMetrics.netSales, tip: 'Gross product sales less order discounts and recorded refunds; fully cancelled/refunded orders are excluded. Pending orders remain included.' },
    { label: 'Average Order Value', current: formatCurrency(metrics.averageOrderValue), previous: formatCurrency(previousMetrics.averageOrderValue), changeCurrent: metrics.averageOrderValue, changePrevious: previousMetrics.averageOrderValue, tip: 'Net sales divided by eligible non-cancelled/non-refunded order count.' },
    { label: 'Active Shops', current: activeShopCount, previous: activeShopCount, tip: 'Registered shops that are not marked closed (isOpen is not false), based on the current shop and restaurant directory APIs.' },
    { label: 'Shops with Orders', current: metrics.shopsWithOrders, previous: previousMetrics.shopsWithOrders, tip: 'Distinct registered shops correctly mapped to at least one filtered order.' },
  ];

  const exportAnalytics = () => {
    const rows = [
      ['Zeedaddy Order Analytics', `${appliedFilters.from} to ${appliedFilters.to}`],
      ['Generated at', new Date().toLocaleString('en-IN')],
      ['Filters', `Status: ${appliedFilters.status}; Shop: ${appliedFilters.shopId}; Type: ${appliedFilters.orderType}; Payment: ${appliedFilters.paymentMethod}`],
      [],
      ['KPI', 'Current period', 'Previous period'],
      ...kpis.map((kpi) => [kpi.label, kpi.current, kpi.previous]),
      [],
      ['Shop Name', 'Total Orders', 'Delivered', 'Pending', 'Cancelled', 'Items', 'Gross Sales (INR)', 'Net Sales (INR)', 'Avg Order Value (INR)', 'Cancellation Rate (%)', 'Mapping Diagnostic'],
      ...shopRows.map((shop) => [shop.shopName, shop.totalOrders, shop.deliveredOrders, shop.pendingOrders, shop.cancelledOrders, shop.totalItems, shop.grossSales.toFixed(2), shop.netSales.toFixed(2), shop.averageOrderValue.toFixed(2), shop.cancellationRate.toFixed(2), shop.diagnostic ? 'Unmapped' : '']),
      [],
      ['Order Date', 'Order ID', 'Customer', 'Shop(s)', 'Order Type', 'Status', 'Payment Method', 'Payment Status', 'Items', 'Order Amount (INR)', 'Delivery Fee (INR)', 'Discount (INR)', 'Refund (INR)'],
      ...filteredOrders.map((order) => [
        order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '',
        order._id,
        order.userId?.name || 'Guest',
        [...new Set((order.products || []).map((item) => shopMappingForItem(item, shopIndexes).name))].join('; '),
        isQuickCommerceOrder(order) ? 'Quick Commerce' : 'E-commerce',
        getOrderStatus(order),
        getPaymentMethod(order) === 'online' ? 'Online' : 'COD',
        order.payment_status || 'Unknown',
        (order.products || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
        Number(order.totalAmt) || 0,
        orderDeliveryFee(order),
        Number(order.discount_amount) || 0,
        Number(order.refund?.amount) || 0,
      ]),
    ];
    saveCsv(`zeedaddy_analytics_${appliedFilters.from}_to_${appliedFilters.to}.csv`, rows);
  };

  const exportShopTable = () => {
    const rows = [
      ['Rank', 'Shop Name', 'Total Orders', 'Delivered Orders', 'Pending Orders', 'Cancelled Orders', 'Total Items Sold', 'Gross Sales (INR)', 'Net Sales (INR)', 'Average Order Value (INR)', 'Cancellation Rate (%)', 'Mapping Diagnostic'],
      ...shopRows.map((shop, index) => [index + 1, shop.shopName, shop.totalOrders, shop.deliveredOrders, shop.pendingOrders, shop.cancelledOrders, shop.totalItems, shop.grossSales.toFixed(2), shop.netSales.toFixed(2), shop.averageOrderValue.toFixed(2), shop.cancellationRate.toFixed(2), shop.diagnostic ? 'Unmapped' : '']),
    ];
    saveCsv(`zeedaddy_shops_${appliedFilters.from}_to_${appliedFilters.to}.csv`, rows);
  };

  const statusData = Object.entries(metrics.byStatus).map(([name, value]) => ({ name, value }));
  const revenueByShop = [...metrics.shopStats].filter((shop) => shop.netSales > 0).sort((a, b) => b.netSales - a.netSales).slice(0, 10);
  const topProducts = metrics.products.slice(0, 10);
  const bestShop = revenueByShop[0];
  const worstShop = metrics.shopStats.filter((shop) => shop.totalOrders > 0).sort((a, b) => a.netSales - b.netSales)[0];
  const currentRevenueTrend = trend(metrics.netSales, previousMetrics.netSales);
  const invoiceComparison = useMemo(() => filteredOrders
    .filter((order) => !isCancelledOrRefunded(order))
    .reduce((result, order) => {
      result.orderTotal += Math.max(Number(order.totalAmt) || 0, 0);
      result.productGross += orderGross(order);
      return result;
    }, { orderTotal: 0, productGross: 0 }), [filteredOrders]);
  const peakSalesDay = [...dailyStats].sort((a, b) => b.revenue - a.revenue)[0];
  const hourlyStats = useMemo(() => Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    orders: filteredOrders.filter((order) => Number.isFinite(new Date(order.createdAt).getTime()) && new Date(order.createdAt).getHours() === hour).length,
  })), [filteredOrders]);
  const busiestHour = [...hourlyStats].sort((a, b) => b.orders - a.orders)[0];
  const insightRangeLabel = `${formatDate(appliedFilters.from, { day: 'numeric', month: 'short', year: 'numeric' })}–${formatDate(appliedFilters.to, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const compareDates = useMemo(() => {
    const days = Math.floor((parseLocalDate(appliedFilters.to) - parseLocalDate(appliedFilters.from)) / 86400000) + 1;
    const priorTo = shiftDate(appliedFilters.from, -1);
    const priorFrom = shiftDate(priorTo, -(days - 1));
    return { from: priorFrom, to: priorTo };
  }, [appliedFilters.from, appliedFilters.to]);

  return (
    <>
      <style>{`
        .oa2{--purple:#6844df;--ink:#202137;--muted:#74758a;--line:#ececf3;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);padding:22px;min-height:100vh;background:linear-gradient(135deg,#f0edff 0%,#f8f7fc 46%,#f4f2fb 100%)}
        .oa2 *{box-sizing:border-box}.oa2-shell{max-width:1500px;margin:0 auto}.oa2-header{background:linear-gradient(115deg,#6240d6,#8257df);color:#fff;border-radius:18px;padding:24px 26px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;box-shadow:0 8px 24px #6038d326}
        .oa2-header h1{margin:0;font-size:25px;line-height:1.25;letter-spacing:-.4px}.oa2-header p{margin:6px 0 0;color:#e7ddff;font-size:13px}.oa2-actions{display:flex;gap:9px;flex-wrap:wrap}
        .oa2 button,.oa2 input,.oa2 select{font:inherit}.oa2-button{border:1px solid #e7e5f0;background:#fff;color:#39364d;border-radius:9px;padding:9px 13px;font-size:12px;font-weight:700;cursor:pointer}.oa2-button:hover{border-color:#b8a8f5;color:#593cbb}.oa2-button.primary{background:#6844df;color:#fff;border-color:#6844df}.oa2-button:disabled{opacity:.55;cursor:not-allowed}
        .oa2-filter{background:#fff;border:1px solid #efedf5;border-radius:14px;padding:15px;margin-bottom:16px;box-shadow:0 3px 10px #24204408}.oa2-fields{display:grid;grid-template-columns:1.2fr repeat(6,minmax(110px,1fr)) auto;gap:10px;align-items:end}.oa2-field label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.055em;color:#77768c;font-weight:800;margin:0 0 5px}.oa2-field input,.oa2-field select{width:100%;height:38px;padding:0 10px;border:1px solid #e4e2ec;border-radius:8px;background:#fff;color:#33334a;font-size:12px}.oa2-filter-actions{display:flex;gap:8px;align-items:end}
        .oa2-period-note{font-size:11px;color:#74758a;margin:11px 2px 0}.oa2-error,.oa2-warning{border-radius:10px;padding:12px 14px;margin:12px 0;font-size:13px}.oa2-error{background:#fff1f0;color:#a42c25;border:1px solid #ffd3d0}.oa2-warning{background:#fff8e8;color:#85590b;border:1px solid #f7dfaa}.oa2-error button{margin-left:10px}
        .oa2-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}.oa2-kpi{background:#fff;border:1px solid #eeedf4;border-radius:13px;padding:15px 16px;min-width:0;box-shadow:0 3px 12px #24204408}.oa2-kpi-label{font-size:11px;color:#77768c;font-weight:800;display:flex;align-items:center;gap:5px}.oa2-kpi-label span{cursor:help;color:#a09db1}.oa2-kpi-value{font-size:23px;font-weight:800;letter-spacing:-.5px;margin:8px 0 5px;overflow-wrap:anywhere}.oa2-kpi-compare{font-size:10px;color:#818197;line-height:1.4}.oa2-trend{font-weight:800;margin-left:5px}.oa2-trend.good{color:#15803d}.oa2-trend.bad{color:#c2413b}.oa2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:15px}.oa2-card{background:#fff;border:1px solid #eeedf4;border-radius:14px;padding:16px;box-shadow:0 3px 12px #24204408;min-width:0}.oa2-card h2{margin:0 0 4px;font-size:15px}.oa2-card-sub{font-size:11px;color:#88879a;margin:0 0 10px}.oa2-card-controls{display:flex;gap:6px;margin-left:auto}.oa2-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:10px}.oa2-toolbar input,.oa2-toolbar select{height:36px;border:1px solid #e3e1eb;border-radius:8px;padding:0 10px;font-size:12px;background:#fff}.oa2-toolbar input{min-width:190px}.oa2-table-wrap{overflow:auto}.oa2-table{border-collapse:collapse;width:100%;min-width:850px}.oa2-table th{text-align:left;background:#f7f6fb;color:#77768c;font-size:10px;text-transform:uppercase;letter-spacing:.04em;padding:10px;white-space:nowrap}.oa2-table td{padding:10px;border-bottom:1px solid #f0eff5;font-size:12px;white-space:nowrap}.oa2-table tbody tr:hover{background:#fbfaff}.oa2-link{background:none;border:none;padding:0;color:#5a3ac6;font-weight:700;cursor:pointer;text-align:left}.oa2-diagnostic{display:inline-block;border-radius:20px;background:#fff0ed;color:#b53f34;font-size:10px;font-weight:800;padding:3px 7px}.oa2-pager{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding-top:11px;color:#77768c;font-size:11px}.oa2-insights{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.oa2-insight{padding:11px 12px;background:#f8f7fc;border:1px solid #eeedf4;border-radius:10px;font-size:12px;line-height:1.5}.oa2-insight strong{color:#45328f}.oa2-empty{height:245px;display:grid;place-items:center;text-align:center;color:#89889a;font-size:12px}.oa2-status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#aaa}.oa2-order-detail{background:#fbfaff;border-top:1px solid #eeeaf7;padding:12px;white-space:normal;min-width:700px}.oa2-order-detail-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;font-size:11px}.oa2-small{font-size:10px;color:#858499}.oa2-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#757488;margin:4px 0 0}
        .oa2-skeleton-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.oa2-skeleton{height:95px;border-radius:12px;background:linear-gradient(90deg,#f1f0f6 25%,#f8f7fb 50%,#f1f0f6 75%);background-size:200% 100%}
        .oa2-print-info,.oa2-print-only{display:none}
        @media(max-width:1150px){.oa2-fields{grid-template-columns:repeat(4,minmax(130px,1fr))}.oa2-filter-actions{grid-column:span 2}.oa2-kpis,.oa2-skeleton-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:720px){.oa2{padding:12px}.oa2-header{padding:18px}.oa2-header h1{font-size:21px}.oa2-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.oa2-filter-actions{grid-column:1/-1}.oa2-kpis,.oa2-skeleton-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.oa2-kpi{padding:12px}.oa2-kpi-value{font-size:19px}.oa2-grid{grid-template-columns:1fr}.oa2-insights{grid-template-columns:1fr}.oa2-card{padding:12px}.oa2-toolbar input{min-width:0;width:100%}}
        @media print{.oa2{padding:0;background:#fff}.oa2-header,.oa2-filter,.oa2-actions,.oa2-toolbar,.oa2-pager,.oa2-no-print{display:none!important}.oa2-print-info{display:block;border-bottom:2px solid #333;padding:0 0 12px;margin-bottom:14px}.oa2-print-only{display:block!important}.oa2-print-only .oa2-table{min-width:0}.oa2-card,.oa2-kpi{box-shadow:none;break-inside:avoid}.oa2-kpis{grid-template-columns:repeat(5,1fr)}}
      `}</style>
      <main className="oa2">
        <div className="oa2-shell">
          <header className="oa2-header">
            <div>
              <h1>Order Analytics</h1>
              <p>Zeedaddy business performance · {insightRangeLabel} · compare with {formatDate(compareDates.from)}–{formatDate(compareDates.to)}</p>
            </div>
            <div className="oa2-actions">
              <button className="oa2-button" onClick={() => loadOrders(appliedFilters, true)} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button>
              <button className="oa2-button" onClick={exportAnalytics} disabled={loading}>Export filtered CSV</button>
              <button className="oa2-button" onClick={() => window.print()}>Print report</button>
              <button className="oa2-button" onClick={() => navigate('/orders')}>Manage orders</button>
            </div>
          </header>
          <section className="oa2-print-info">
            <h1>Zeedaddy Order Analytics Report</h1>
            <div>Period: {insightRangeLabel} · Generated: {new Date().toLocaleString('en-IN')}</div>
            <div>Filters: Status {appliedFilters.status}; Shop {availableShops.find(([id]) => id === appliedFilters.shopId)?.[1] || 'All shops'}; Type {appliedFilters.orderType}; Payment {appliedFilters.paymentMethod}</div>
          </section>

          <section className="oa2-filter" aria-label="Analytics filters">
            <div className="oa2-fields">
              <div className="oa2-field">
                <label htmlFor="oa2-preset">Report period</label>
                <select id="oa2-preset" value={draftFilters.preset} onChange={(event) => choosePreset(event.target.value)}>
                  <option value="weekly">Weekly report (last 7 days)</option><option value="monthly">Monthly report (this month)</option>
                  <option value="today">Today</option><option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option><option value="last30">Last 30 days</option>
                  <option value="thisMonth">This month</option><option value="previousMonth">Previous month</option><option value="custom">Custom date range</option>
                </select>
              </div>
              <div className="oa2-field"><label htmlFor="oa2-from">From</label><input id="oa2-from" type="date" value={draftFilters.from} onChange={(event) => { updateDraft('from', event.target.value); updateDraft('preset', 'custom'); }} /></div>
              <div className="oa2-field"><label htmlFor="oa2-to">To</label><input id="oa2-to" type="date" value={draftFilters.to} onChange={(event) => { updateDraft('to', event.target.value); updateDraft('preset', 'custom'); }} /></div>
              <div className="oa2-field"><label htmlFor="oa2-status">Order status</label><select id="oa2-status" value={draftFilters.status} onChange={(event) => updateDraft('status', event.target.value)}><option value="all">All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}</select></div>
              <div className="oa2-field"><label htmlFor="oa2-shop">Shop</label><select id="oa2-shop" value={draftFilters.shopId} onChange={(event) => updateDraft('shopId', event.target.value)}><option value="all">All shops</option>{availableShops.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div>
              <div className="oa2-field"><label htmlFor="oa2-type">Order type</label><select id="oa2-type" value={draftFilters.orderType} onChange={(event) => updateDraft('orderType', event.target.value)}><option value="all">All types</option><option value="ecommerce">E-commerce</option><option value="quick">Go Market Quick Commerce</option></select></div>
              <div className="oa2-field"><label htmlFor="oa2-payment">Payment</label><select id="oa2-payment" value={draftFilters.paymentMethod} onChange={(event) => updateDraft('paymentMethod', event.target.value)}><option value="all">All methods</option><option value="cod">COD</option><option value="online">Online</option></select></div>
              <div className="oa2-filter-actions"><button className="oa2-button primary" onClick={() => applyFilters(draftFilters)}>Apply filters</button><button className="oa2-button" onClick={resetFilters}>Reset</button></div>
            </div>
            <p className="oa2-period-note">Date range uses order creation time in your local timezone. Current and previous periods use identical status, shop, order-type and payment filters.</p>
          </section>

          {error && <div className="oa2-error" role="alert">{error}<button className="oa2-button" onClick={() => loadOrders(appliedFilters)}>Retry</button></div>}
          {shopError && <div className="oa2-warning" role="status">Shop directory could not be fully reconciled: {shopError} Missing mappings are shown as Unknown Shop and are not assigned to another shop.</div>}
          {!loading && filteredOrders.length > 0 && Math.abs(invoiceComparison.orderTotal - invoiceComparison.productGross) > 0.01 && <div className="oa2-warning" role="status">Reconciliation note: matching orders have {formatCurrency(invoiceComparison.orderTotal)} in order totals and {formatCurrency(invoiceComparison.productGross)} in product gross ({formatCurrency(invoiceComparison.orderTotal - invoiceComparison.productGross)} difference). Order totals include delivery/discount treatment; analytics gross/net sales and shop totals use product subtotals, so the difference is not silently allocated to shops.</div>}
          {loading ? <section className="oa2-card" aria-label="Loading analytics"><div className="oa2-skeleton-grid">{Array.from({ length: 10 }, (_, index) => <div className="oa2-skeleton" key={index} />)}</div><div className="oa2-empty" style={{ height: 90 }}>Loading orders and calculating filtered analytics…</div></section> : <>
            <section className="oa2-kpis" aria-label="Key performance indicators">
              {kpis.map((kpi) => {
                const current = kpi.changeCurrent ?? (Number(kpi.current) || 0);
                const previous = kpi.changePrevious ?? (Number(kpi.previous) || 0);
                const delta = trend(current, previous);
                const lowerIsBetter = ['Cancellation Rate', 'Cancelled Orders', 'Pending Orders'].includes(kpi.label);
                const favorable = lowerIsBetter ? !delta.positive : delta.positive;
                return <article className="oa2-kpi" key={kpi.label} title={kpi.tip}>
                  <div className="oa2-kpi-label">{kpi.label} <span title={kpi.tip} aria-label={kpi.tip}>ⓘ</span></div>
                  <div className="oa2-kpi-value">{kpi.current}</div>
                  <div className="oa2-kpi-compare">Previous: {kpi.previous}<span className={`oa2-trend ${favorable ? 'good' : 'bad'}`}>{delta.text}</span></div>
                </article>;
              })}
            </section>

            <section className="oa2-grid">
              <article className="oa2-card">
                <div className="oa2-toolbar"><div><h2>Daily Trend</h2><p className="oa2-card-sub">Selected period vs previous equivalent · {Math.floor((parseLocalDate(appliedFilters.to) - parseLocalDate(appliedFilters.from)) / 86400000) + 1 > 62 ? 'weekly buckets' : 'daily'}</p></div><div className="oa2-card-controls"><button className={`oa2-button ${chartMode === 'orders' ? 'primary' : ''}`} onClick={() => setChartMode('orders')}>Orders</button><button className={`oa2-button ${chartMode === 'revenue' ? 'primary' : ''}`} onClick={() => setChartMode('revenue')}>Revenue</button></div></div>
                <h2 className="oa2-print-only">Daily Trend ({chartMode === 'orders' ? 'Orders' : 'Revenue'})</h2>
                {dailyStats.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={dailyStats} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#eeedf3" /><XAxis dataKey="date" tickFormatter={(date) => formatDate(date)} tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => chartMode === 'revenue' ? `₹${numberFormat.format(value)}` : value} /><Tooltip labelFormatter={(date) => formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })} formatter={(value, key) => [chartMode === 'revenue' ? formatCurrency(value) : `${numberFormat.format(value)} orders`, key === (chartMode === 'orders' ? 'orders' : 'revenue') ? 'Current period' : 'Previous period']} /><Legend /><Line type="monotone" dataKey={chartMode} name="Current period" stroke="#6844df" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey={chartMode === 'orders' ? 'previousOrders' : 'previousRevenue'} name="Previous period" stroke="#10a27a" strokeWidth={2} strokeDasharray="5 4" dot={false} /></LineChart></ResponsiveContainer> : <div className="oa2-empty">No daily activity for this filtered period.</div>}
              </article>
              <article className="oa2-card"><h2>Orders by Status</h2><p className="oa2-card-sub">All orders, including cancelled and refunded</p>{statusData.length ? <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>{statusData.map((row, index) => <Cell key={row.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value, name) => [`${value} orders`, name]} /><Legend /></PieChart></ResponsiveContainer> : <div className="oa2-empty">No orders match these filters.</div>}</article>
              <article className="oa2-card"><h2>Revenue by Shop</h2><p className="oa2-card-sub">Net product sales · cancelled/refunded orders excluded</p>{revenueByShop.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={revenueByShop} layout="vertical" margin={{ left: 8, right: 15 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tickFormatter={(value) => `₹${numberFormat.format(value)}`} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="shopName" width={118} tick={{ fontSize: 10 }} /><Tooltip formatter={(value) => [formatCurrency(value), 'Net sales']} /><Bar dataKey="netSales" name="Net Sales" fill="#6844df" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <div className="oa2-empty">No sales by shop for the selected filters.</div>}</article>
              <article className="oa2-card"><h2>Top 10 Selling Products</h2><p className="oa2-card-sub">Units sold in selected orders</p>{topProducts.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 15 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 10 }} /><Tooltip formatter={(value) => [`${numberFormat.format(value)} units`, 'Units sold']} /><Bar dataKey="quantity" name="Units sold" fill="#10a27a" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer> : <div className="oa2-empty">Product quantities are not available in these orders.</div>}</article>
              <article className="oa2-card"><h2>COD vs Online Payments</h2><p className="oa2-card-sub">Order counts by payment identifier</p><ResponsiveContainer width="100%" height={240}><BarChart data={[{ name: 'COD', orders: metrics.payment.COD }, { name: 'Online', orders: metrics.payment.Online }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip formatter={(value) => [`${value} orders`, 'Payment method']} /><Bar dataKey="orders" name="Orders" radius={[5, 5, 0, 0]}>{[0, 1].map((index) => <Cell key={index} fill={index ? '#0ea5e9' : '#f59e0b'} />)}</Bar></BarChart></ResponsiveContainer></article>
              <article className="oa2-card"><h2>Orders by Hour</h2><p className="oa2-card-sub">Local creation hour; only valid timestamps included</p>{filteredOrders.some((order) => Number.isFinite(new Date(order.createdAt).getTime())) ? <ResponsiveContainer width="100%" height={240}><BarChart data={hourlyStats}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" interval={3} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip formatter={(value) => [`${value} orders`, 'Count']} /><Bar dataKey="orders" name="Orders" fill="#8b5cf6" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="oa2-empty">Reliable creation timestamps are unavailable for this period.</div>}</article>
            </section>

            <section className="oa2-card" style={{ marginBottom: 15 }}>
              <h2>Business Insights</h2><p className="oa2-card-sub">Calculated from orders in {insightRangeLabel}; comparisons use the previous equivalent date range.</p>
              <div className="oa2-insights">
                <div className="oa2-insight"><strong>Revenue:</strong> Net sales {currentRevenueTrend.text.toLowerCase()} vs the previous period ({formatCurrency(previousMetrics.netSales)} → {formatCurrency(metrics.netSales)}).</div>
                <div className="oa2-insight"><strong>Top shop:</strong> {bestShop ? `${bestShop.shopName} generated ${formatCurrency(bestShop.netSales)} net product sales.` : 'No mapped shop generated sales in this period.'}</div>
                <div className="oa2-insight"><strong>Best-selling product:</strong> {metrics.products[0] ? `${metrics.products[0].name} sold ${numberFormat.format(metrics.products[0].quantity)} units.` : 'No product quantity data is available.'}</div>
                <div className="oa2-insight"><strong>Cancellation:</strong> {metrics.cancellationRate > previousMetrics.cancellationRate ? `Rate increased from ${previousMetrics.cancellationRate.toFixed(1)}% to ${metrics.cancellationRate.toFixed(1)}%; review cancelled orders.` : `Rate is ${metrics.cancellationRate.toFixed(1)}% (${metrics.cancelledOrders} of ${metrics.totalOrders} orders).`}</div>
                <div className="oa2-insight"><strong>Pending ageing:</strong> {metrics.pendingLongOrders.length ? `${metrics.pendingLongOrders.length} pending orders are older than ${pendingThreshold} hours. Review order fulfilment.` : `No pending orders exceed ${pendingThreshold} hours.`}</div>
                <div className="oa2-insight"><strong>Shop performance:</strong> {worstShop ? `${worstShop.shopName} has the lowest net sales among shops with orders (${formatCurrency(worstShop.netSales)}).` : 'No shop order data to compare.'}</div>
                <div className="oa2-insight"><strong>Sales concentration:</strong> {peakSalesDay?.revenue > 0 ? `Highest daily net sales were ${formatCurrency(peakSalesDay.revenue)} on ${formatDate(peakSalesDay.date, { day: 'numeric', month: 'long' })}.` : 'No positive daily sales recorded.'} {busiestHour?.orders ? `Busiest order hour: ${busiestHour.hour} (${busiestHour.orders} orders).` : ''}</div>
                <div className="oa2-insight"><strong>Data quality:</strong> {metrics.shopStats.filter((shop) => shop.diagnostic && shop.totalOrders > 0).length} shop mapping issue(s), {metrics.missingPrices} missing/invalid product price record(s). Sales are attributed only where order-product records support the calculation.</div>
                <div className="oa2-insight"><strong>Pending threshold:</strong> <label className="oa2-small">Alert after <input aria-label="Pending order alert hours" type="number" min="1" max="720" value={pendingThreshold} onChange={(event) => setPendingThreshold(Math.min(720, Math.max(1, Number(event.target.value) || 1)))} style={{ width: 58, border: '1px solid #ddd9e9', borderRadius: 6, padding: 4 }} /> hours.</label></div>
              </div>
            </section>

            <section className="oa2-card" style={{ marginBottom: 15 }}>
              <h2 className="oa2-print-only">Shop-wise Sales Performance</h2>
              <div className="oa2-toolbar">
                <div><h2>Shop-wise Sales Performance</h2><p className="oa2-card-sub">Shop gross/net sales are allocated from product subtotals, so shop totals reconcile to the KPI sales.</p></div>
                <input aria-label="Search shops" placeholder="Search shop name" value={shopSearch} onChange={(event) => setShopSearch(event.target.value)} />
                <select aria-label="Sort shop table" value={shopSort} onChange={(event) => setShopSort(event.target.value)}><option value="revenue">Sort: net revenue</option><option value="orders">Sort: orders</option><option value="cancellation">Sort: cancellation rate</option></select>
                <button className="oa2-button" onClick={exportShopTable}>Export shops CSV</button>
              </div>
              <div className="oa2-table-wrap"><table className="oa2-table"><thead><tr><th>Rank</th><th>Shop Name</th><th>Orders</th><th>Delivered</th><th>Pending</th><th>Cancelled</th><th>Items sold</th><th>Gross sales</th><th>Net sales</th><th>Avg order</th><th>Cancel rate</th></tr></thead><tbody>
                {pagedShops.map((shop, index) => {
                  const rank = (shopPage - 1) * 10 + index + 1;
                  return <tr key={shop.shopId}><td>{rank}</td><td><button className="oa2-link" onClick={() => selectShop(shop.shopId)}>{shop.shopName}</button>{shop.shopId === bestShop?.shopId && <span className="oa2-diagnostic" style={{ background: '#e9f8ee', color: '#187342', marginLeft: 5 }}>Top performer</span>}{shop.shopId === worstShop?.shopId && shop.shopId !== bestShop?.shopId && <span className="oa2-diagnostic" style={{ background: '#fff4df', color: '#8a5b00', marginLeft: 5 }}>Low performer</span>}{shop.diagnostic && <div><span className="oa2-diagnostic">Mapping issue</span></div>}</td><td>{shop.totalOrders}</td><td>{shop.deliveredOrders}</td><td>{shop.pendingOrders}</td><td>{shop.cancelledOrders}</td><td>{numberFormat.format(shop.totalItems)}</td><td>{formatCurrency(shop.grossSales)}</td><td><strong>{formatCurrency(shop.netSales)}</strong></td><td>{formatCurrency(shop.averageOrderValue)}</td><td>{shop.cancellationRate.toFixed(1)}%</td></tr>;
                })}
                {!pagedShops.length && <tr><td colSpan="11" style={{ textAlign: 'center', padding: 30, color: '#858499' }}>No shops match this search.</td></tr>}
              </tbody></table></div>
              <div className="oa2-print-only"><table className="oa2-table"><thead><tr><th>Rank</th><th>Shop Name</th><th>Orders</th><th>Delivered</th><th>Pending</th><th>Cancelled</th><th>Items sold</th><th>Gross sales</th><th>Net sales</th><th>Avg order</th><th>Cancel rate</th></tr></thead><tbody>{shopRows.map((shop, index) => <tr key={`print-${shop.shopId}`}><td>{index + 1}</td><td>{shop.shopName}{shop.diagnostic ? ' · mapping issue' : ''}</td><td>{shop.totalOrders}</td><td>{shop.deliveredOrders}</td><td>{shop.pendingOrders}</td><td>{shop.cancelledOrders}</td><td>{numberFormat.format(shop.totalItems)}</td><td>{formatCurrency(shop.grossSales)}</td><td>{formatCurrency(shop.netSales)}</td><td>{formatCurrency(shop.averageOrderValue)}</td><td>{shop.cancellationRate.toFixed(1)}%</td></tr>)}</tbody></table></div>
              <div className="oa2-pager"><span>Top performer is indicated by revenue sort; low performers are shops with orders and the lowest net sales.</span><button className="oa2-button" disabled={shopPage <= 1} onClick={() => setShopPage((page) => page - 1)}>Previous</button><span>{shopPage} / {shopPageCount}</span><button className="oa2-button" disabled={shopPage >= shopPageCount} onClick={() => setShopPage((page) => page + 1)}>Next</button></div>
            </section>

            <section className="oa2-card">
              <div className="oa2-toolbar"><div><h2>Detailed Orders</h2><p className="oa2-card-sub">{orderRows.length} order(s) match the current table search; {filteredOrders.length} order(s) match dashboard filters.</p></div><input aria-label="Search orders" placeholder="Search order ID, customer or shop" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></div>
              <div className="oa2-table-wrap"><table className="oa2-table"><thead><tr><th>Date & time</th><th>Order ID</th><th>Customer</th><th>Shop</th><th>Order type</th><th>Status</th><th>Payment</th><th>Items</th><th>Order amount</th><th>Delivery fee</th><th>Discount</th><th>Refund</th></tr></thead><tbody>
                {pagedOrders.map((order) => {
                  const items = order.products || [];
                  const shopsForOrder = [...new Set(items.map((item) => shopMappingForItem(item, shopIndexes).name))];
                  const type = isQuickCommerceOrder(order) ? 'Quick Commerce' : 'E-commerce';
                  const expanded = expandedOrder === order._id;
                  return <React.Fragment key={order._id}><tr onClick={() => setExpandedOrder(expanded ? '' : order._id)} style={{ cursor: 'pointer' }}>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td><td><button className="oa2-link" onClick={(event) => { event.stopPropagation(); setExpandedOrder(expanded ? '' : order._id); }}>{String(order._id || '').slice(-10)}</button></td><td>{order.userId?.name || 'Guest'}</td><td>{shopsForOrder.join(', ') || 'Unknown Shop'}</td><td>{type}</td><td><span className="oa2-status-dot" style={{ background: getOrderStatus(order) === 'delivered' ? '#16a34a' : getOrderStatus(order) === 'cancelled' ? '#dc2626' : '#f59e0b' }} />{getOrderStatus(order)}</td><td>{getPaymentMethod(order) === 'online' ? 'Online' : 'COD'} · {order.payment_status || 'Unknown'}</td><td>{items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}</td><td>{formatCurrency(order.totalAmt)}</td><td>{formatCurrency(orderDeliveryFee(order))}</td><td>{formatCurrency(order.discount_amount)}</td><td>{order.refund?.amount ? formatCurrency(order.refund.amount) : '—'}</td>
                  </tr>{expanded && <tr><td colSpan="12"><div className="oa2-order-detail"><div className="oa2-order-detail-list"><span><strong>Customer:</strong> {order.userId?.name || 'Guest'} (contact is not exposed here)</span><span><strong>Order ID:</strong> {order._id}</span><span><strong>Refund status:</strong> {order.refund?.status || 'none'}</span></div><div className="oa2-table-wrap" style={{ marginTop: 10 }}><table className="oa2-table" style={{ minWidth: 500 }}><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Line subtotal</th><th>Shop mapping</th></tr></thead><tbody>{items.map((item, index) => { const mapping = shopMappingForItem(item, shopIndexes); return <tr key={`${item.productId || item.productTitle}-${index}`}><td>{item.productTitle || 'Unknown Product'}</td><td>{Number(item.quantity) || 0}</td><td>{formatCurrency(item.price)}</td><td>{formatCurrency(productGross(item))}</td><td>{mapping.name}{mapping.diagnostic && ' · mapping issue'}</td></tr>; })}</tbody></table></div><button className="oa2-button" style={{ marginTop: 8 }} onClick={() => navigate('/orders')}>Open order management</button></div></td></tr>}</React.Fragment>;
                })}
                {!pagedOrders.length && <tr><td colSpan="12" style={{ textAlign: 'center', padding: 30, color: '#858499' }}>No orders match the selected filters. Try another date range or reset filters.</td></tr>}
              </tbody></table></div>
              <div className="oa2-pager"><span>Page {orderPage} of {orderPageCount}</span><button className="oa2-button" disabled={orderPage <= 1} onClick={() => setOrderPage((page) => page - 1)}>Previous</button><button className="oa2-button" disabled={orderPage >= orderPageCount} onClick={() => setOrderPage((page) => page + 1)}>Next</button></div>
            </section>
            <footer className="oa2-small" style={{ textAlign: 'center', padding: '15px 0' }}>Sales use product subtotals (not order total, which includes delivery); cancelled/refunded orders are excluded. Missing product prices contribute zero and are identified above.</footer>
          </>}
        </div>
      </main>
    </>
  );
};

export default OrderAnalyticsDashboard;
