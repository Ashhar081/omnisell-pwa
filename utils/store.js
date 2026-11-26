import { GLOBAL_PLATFORMS, FX_TO_INR, CURRENCY_SYMBOL } from "../data/platforms.js";

const STORAGE_KEY = "omnisell_pwa_state_v3";

function buildDefaultState() {
  const ordersByStore = {};
  const storeMeta = {};

  for (const p of GLOBAL_PLATFORMS) {
    ordersByStore[p.id] = [];
    storeMeta[p.id] = {
      nickname: p.name,
      lastSyncedAt: null
    };
  }

  return {
    connectedIds: [],
    ordersByStore,
    storeMeta,
    apiConfigs: {
      ebay: { appId: "", accessToken: "", marketplace: "EBAY_US" },
      flipkart: { appId: "", appSecret: "", accessToken: "" }
    },
    prefs: {
      theme: "system",
      displayCurrency: "INR",
      timeframe: "today",
      selectedStoreId: null,
      tapBehavior: "details"
    }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw);
    const base = buildDefaultState();
    return {
      ...base,
      ...parsed,
      ordersByStore: { ...base.ordersByStore, ...(parsed.ordersByStore || {}) },
      storeMeta: { ...base.storeMeta, ...(parsed.storeMeta || {}) },
      apiConfigs: {
        ebay: { ...base.apiConfigs.ebay, ...(parsed.apiConfigs?.ebay || {}) },
        flipkart: { ...base.apiConfigs.flipkart, ...(parsed.apiConfigs?.flipkart || {}) }
      },
      prefs: { ...base.prefs, ...(parsed.prefs || {}) }
    };
  } catch {
    return buildDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAllState() {
  const fresh = buildDefaultState();
  saveState(fresh);
  return fresh;
}

export function loadSampleDemoWorkspace(state) {
  const demoIds = ["amazon-ca", "ebay-us", "flipkart", "meesho"];
  for (const id of demoIds) {
    const p = GLOBAL_PLATFORMS.find((x) => x.id === id);
    if (!p) continue;
    if (!state.connectedIds.includes(id)) state.connectedIds.push(id);
    state.ordersByStore[id] = p.seedOrders.map((o) => ({ ...o }));
    state.storeMeta[id] = {
      nickname: p.name,
      lastSyncedAt: new Date().toISOString()
    };
  }
  state.prefs.selectedStoreId = "amazon-ca";
  saveState(state);
  return state;
}

export function convertCurrency(amount, fromCurrency, toCurrency) {
  const fromRate = FX_TO_INR[fromCurrency] || 1;
  const toRate = FX_TO_INR[toCurrency] || 1;
  return (amount * fromRate) / toRate;
}

export function formatMoney(amount, currency, decimals = 0) {
  const sym = CURRENCY_SYMBOL[currency] || "";
  return sym + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function withinTimeframe(isoDate, timeframe) {
  const ms = Date.now() - new Date(isoDate).getTime();
  const dayMs = 24 * 3600 * 1000;
  if (timeframe === "today") return ms <= dayMs;
  if (timeframe === "7d") return ms <= 7 * dayMs;
  if (timeframe === "30d") return ms <= 30 * dayMs;
  return true;
}

export function filterOrdersByTimeframe(orders, timeframe) {
  return (orders || []).filter((o) => withinTimeframe(o.date, timeframe));
}

export function computeStoreMetrics(orders, timeframe) {
  const list = filterOrdersByTimeframe(orders, timeframe);
  let revenue = 0;
  let rejected = 0;
  let late = 0;
  let onTime = 0;
  let delivered = 0;

  for (const o of list) {
    if (o.status === "Rejected") {
      rejected++;
    } else {
      revenue += Number(o.amount) || 0;
    }
    if (o.status === "Late") late++;
    if (o.status === "On Time") onTime++;
    if (o.status === "Delivered") delivered++;
  }

  return {
    ordersCount: list.length,
    revenue,
    rejected,
    late,
    onTime,
    delivered,
    orders: list
  };
}

export function computeGlobalMetrics(state) {
  const { timeframe, displayCurrency } = state.prefs;
  let totalOrders = 0;
  let totalRevenueConverted = 0;
  let totalRejected = 0;
  let totalLate = 0;

  for (const id of state.connectedIds) {
    const platform = GLOBAL_PLATFORMS.find((p) => p.id === id);
    if (!platform) continue;
    const m = computeStoreMetrics(state.ordersByStore[id], timeframe);
    totalOrders += m.ordersCount;
    totalRevenueConverted += convertCurrency(m.revenue, platform.currency, displayCurrency);
    totalRejected += m.rejected;
    totalLate += m.late;
  }

  return {
    totalOrders,
    totalRevenueConverted,
    totalRejected,
    totalLate
  };
}
