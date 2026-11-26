import { GLOBAL_PLATFORMS } from "./data/platforms.js";
import { parseOrdersCsv, buildSampleCsv } from "./utils/csv.js";
import {
  loadState,
  saveState,
  resetAllState,
  loadSampleDemoWorkspace,
  convertCurrency,
  formatMoney,
  computeStoreMetrics,
  computeGlobalMetrics
} from "./utils/store.js";

let state = loadState();
let activeTab = "dashboard";
let orderStatusFilter = "ALL";
let orderSearchQuery = "";
let directoryQuery = "";
let directoryRegion = "ALL";

const appMain = document.getElementById("appMain");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const sheetPanel = document.getElementById("sheetPanel");
const toastEl = document.getElementById("toast");

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.add("hidden"), 2600);
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.prefs.theme || "system");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      reg.update().catch(() => {});
    }).catch(() => {});
  }
}

function getPlatform(id) {
  return GLOBAL_PLATFORMS.find((p) => p.id === id);
}

function openExternalOrders(platform) {
  const target = platform.ordersUrl || platform.dashboardUrl;
  window.open(target, "_blank", "noopener,noreferrer");
}

function statusBadge(status) {
  if (status === "Late") return `<span class="badge badge-orange">Late / SLA Risk</span>`;
  if (status === "Rejected") return `<span class="badge badge-red">Rejected</span>`;
  if (status === "Delivered") return `<span class="badge badge-green">Delivered</span>`;
  return `<span class="badge badge-blue">On Time</span>`;
}

function openSheet(html) {
  sheetPanel.innerHTML = `<div class="sheet-grabber"></div>` + html;
  sheetBackdrop.classList.remove("hidden");
}

function closeSheet() {
  sheetBackdrop.classList.add("hidden");
  sheetPanel.innerHTML = "";
}

sheetBackdrop.addEventListener("click", (e) => {
  if (e.target === sheetBackdrop) closeSheet();
});

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTopControls() {
  document.querySelectorAll("#timeframeSegmented button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tf === state.prefs.timeframe);
  });
  const curSel = document.getElementById("currencySelect");
  if (curSel.value !== state.prefs.displayCurrency) {
    curSel.value = state.prefs.displayCurrency;
  }
}

function renderDashboard() {
  const { timeframe } = state.prefs;
  const g = computeGlobalMetrics(state);
  const tfLabel = timeframe === "today" ? "Today" : timeframe === "7d" ? "7 Days" : "30 Days";

  if (state.connectedIds.length === 0) {
    appMain.innerHTML = `
      <div class="view-enter" style="display:flex; flex-direction:column; gap:14px;">
        <div class="card" style="text-align:center; padding:34px 18px;">
          <div style="width:54px; height:54px; margin:0 auto 12px; border-radius:16px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; font-size:24px; font-weight:700;">+</div>
          <h2 style="margin:0 0 8px; font-size:20px; letter-spacing:-0.02em;">अपने ई-कॉमर्स स्टोर्स जोड़ें</h2>
          <p class="text-muted" style="font-size:13px; max-width:440px; margin:0 auto 18px; line-height:1.5;">
            यहाँ आपके जोड़े गए सभी प्लेटफॉर्म्स के ऑर्डर्स की संख्या दिखेगी, और किसी भी स्टोर पर क्लिक करते ही आप सीधे उसकी ऑफिशियल सेलर वेबसाइट पर पहुँच जाएँगे।
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-primary" id="emptyConnectBtn">+ Add Your Store</button>
            <button class="btn btn-secondary" id="loadDemoWorkspaceBtn">Preview Layout</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("emptyConnectBtn")?.addEventListener("click", () => setTab("directory"));
    document.getElementById("loadDemoWorkspaceBtn")?.addEventListener("click", () => {
      state = loadSampleDemoWorkspace(state);
      showToast("Preview layout loaded");
      render();
    });
    return;
  }

  const cardsHtml = state.connectedIds.map((id) => {
    const p = getPlatform(id);
    if (!p) return "";
    const m = computeStoreMetrics(state.ordersByStore[id], timeframe);
    const meta = state.storeMeta[id] || {};

    return `
      <div class="card card-interactive" data-redirect-store="${esc(p.id)}" role="button" tabindex="0">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div>
            <strong style="font-size:17px; letter-spacing:-0.015em;">${esc(meta.nickname || p.name)}</strong>
            <div class="text-muted" style="font-size:12px; margin-top:3px;">${esc(p.country)}</div>
          </div>
          <button class="btn btn-secondary" style="min-height:32px; padding:6px 12px; font-size:12px;" data-details-store="${esc(p.id)}">Summary</button>
        </div>

        <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:18px; padding-top:12px; border-top:1px solid var(--stroke-hairline);">
          <div>
            <div class="kpi-label">${tfLabel} Orders</div>
            <div class="tabular" style="font-size:28px; font-weight:700; letter-spacing:-0.03em; margin-top:2px;">${m.ordersCount}</div>
          </div>
          <span style="color:var(--accent); font-size:13px; font-weight:600;">Open ${esc(p.name)} Orders ↗</span>
        </div>
      </div>
    `;
  }).join("");

  appMain.innerHTML = `
    <div class="view-enter">
      <div class="card tabular" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div>
          <div class="kpi-label">${tfLabel} Total Orders</div>
          <div style="font-size:30px; font-weight:700; letter-spacing:-0.03em; margin-top:2px;">${g.totalOrders}</div>
        </div>
        <div style="text-align:right;">
          <div class="kpi-label">Active Stores</div>
          <div style="font-size:22px; font-weight:700; margin-top:2px;">${state.connectedIds.length}</div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">My Stores (क्लिक करके ऑर्डर वेबसाइट खोलें)</h2>
        <button class="btn-link" id="goDirectoryBtn">+ Add Store</button>
      </div>

      <div class="stores-grid">${cardsHtml}</div>
    </div>
  `;

  document.querySelectorAll("[data-redirect-store]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-details-store]")) return;
      const p = getPlatform(card.dataset.redirectStore);
      if (p) openExternalOrders(p);
    });
  });

  document.querySelectorAll("[data-details-store]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.prefs.selectedStoreId = btn.dataset.detailsStore;
      orderStatusFilter = "ALL";
      orderSearchQuery = "";
      saveState(state);
      setTab("store");
    });
  });

  document.getElementById("goDirectoryBtn")?.addEventListener("click", () => setTab("directory"));
}

function renderOrdersListOnly(store, orders) {
  const listEl = document.getElementById("ordersListContainer");
  const countEl = document.getElementById("ordersCountBadge");
  if (!listEl) return;

  const filtered = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const q = orderSearchQuery.trim().toLowerCase();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.item.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  if (countEl) countEl.textContent = String(filtered.length);

  listEl.innerHTML = filtered.length
    ? filtered.map((o) => `
        <div class="order-row" data-order-id="${esc(o.id)}">
          <div style="min-width:0;">
            <div style="font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(o.item)}</div>
            <div class="text-muted" style="font-size:12px; margin-top:3px;">
              <span class="mono">${esc(o.id)}</span> • ${esc(o.note)}
            </div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div class="tabular" style="font-weight:700; font-size:14px;">${formatMoney(o.amount, store.currency, 2)}</div>
            <div style="margin-top:4px;">${statusBadge(o.status)}</div>
          </div>
        </div>
      `).join("")
    : `<p class="text-muted" style="text-align:center; padding:20px 0; font-size:13px;">लाइव ऑर्डर्स देखने के लिए ऊपर "Open ${esc(store.name)} Website ↗" दबाएँ।</p>`;

  listEl.querySelectorAll("[data-order-id]").forEach((row) => {
    row.addEventListener("click", () => openOrderSheet(store, row.dataset.orderId));
  });
}

function renderStoreDetails() {
  if (state.connectedIds.length === 0) {
    appMain.innerHTML = `
      <div class="view-enter card" style="text-align:center; padding:32px 16px;">
        <p style="font-weight:600; margin:0 0 8px;">कोई स्टोर जुड़ा नहीं है</p>
        <p class="text-muted" style="font-size:13px; margin:0 0 14px;">पहले Explore टैब से अपना स्टोर चुनें।</p>
        <button class="btn btn-primary" id="goDirFromStore">Explore Marketplaces</button>
      </div>
    `;
    document.getElementById("goDirFromStore")?.addEventListener("click", () => setTab("directory"));
    return;
  }

  if (!state.connectedIds.includes(state.prefs.selectedStoreId)) {
    state.prefs.selectedStoreId = state.connectedIds[0];
    saveState(state);
  }

  const store = getPlatform(state.prefs.selectedStoreId);
  const meta = state.storeMeta[store.id] || {};
  const { timeframe, displayCurrency } = state.prefs;
  const m = computeStoreMetrics(state.ordersByStore[store.id], timeframe);
  const converted = convertCurrency(m.revenue, store.currency, displayCurrency);
  const tfLabel = timeframe === "today" ? "आज के" : timeframe === "7d" ? "7 दिन के" : "30 दिन के";

  appMain.innerHTML = `
    <div class="view-enter" style="display:flex; flex-direction:column; gap:14px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <button class="btn-link" id="backToStoresBtn">‹ Back to My Stores</button>
      </div>

      <div class="pills-scroll">
        ${state.connectedIds.map((id) => {
          const p = getPlatform(id);
          const pm = state.storeMeta[id] || {};
          return `<button class="pill-btn ${id === store.id ? "active" : ""}" data-pick-store="${esc(id)}">${esc(pm.nickname || p.name)}</button>`;
        }).join("")}
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
          <div>
            <h2 style="margin:0; font-size:21px; letter-spacing:-0.02em;">${esc(meta.nickname || store.name)}</h2>
            <p class="text-muted" style="font-size:12px; margin:4px 0 0;">${esc(store.country)}</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary" id="openExternalSiteBtn">Open ${esc(store.name)} Orders ↗</button>
            ${store.integrationMode === "free_api" ? `<button class="btn btn-secondary" id="quickApiSyncBtn">Sync</button>` : ""}
          </div>
        </div>

        <div class="kpi-grid tabular" style="margin-top:16px;">
          <div class="glass-inset">
            <div class="kpi-label">${tfLabel} Orders</div>
            <div class="kpi-value" style="font-size:22px;">${m.ordersCount}</div>
          </div>
          <div class="glass-inset">
            <div class="kpi-label">Revenue (${esc(store.currency)})</div>
            <div class="kpi-value text-green" style="font-size:22px;">${formatMoney(m.revenue, store.currency)}</div>
            ${store.currency !== displayCurrency ? `<div class="kpi-sub">≈ ${formatMoney(converted, displayCurrency)}</div>` : ""}
          </div>
          <div class="glass-inset">
            <div class="kpi-label">Rejected</div>
            <div class="kpi-value text-red" style="font-size:22px;">${m.rejected}</div>
          </div>
          <div class="glass-inset">
            <div class="kpi-label">Late</div>
            <div class="kpi-value text-orange" style="font-size:22px;">${m.late}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <h3 style="margin:0; font-size:15px;">Orders (<span id="ordersCountBadge">0</span>)</h3>
            <div class="pills-scroll">
              ${["ALL", "Late", "Rejected", "On Time", "Delivered"].map((st) => `
                <button class="pill-btn ${orderStatusFilter === st ? "active" : ""}" data-status-filter="${esc(st)}">${esc(st)}</button>
              `).join("")}
            </div>
          </div>
          <input id="orderSearchInput" class="input-pill" type="search" placeholder="Search Order ID or Product..." value="${esc(orderSearchQuery)}" />
        </div>

        <div id="ordersListContainer"></div>
      </div>
    </div>
  `;

  renderOrdersListOnly(store, m.orders);

  document.getElementById("backToStoresBtn")?.addEventListener("click", () => setTab("dashboard"));
  document.getElementById("openExternalSiteBtn")?.addEventListener("click", () => openExternalOrders(store));
  document.getElementById("quickApiSyncBtn")?.addEventListener("click", () => syncStoreViaApi(store.id));

  document.querySelectorAll("[data-pick-store]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.prefs.selectedStoreId = btn.dataset.pickStore;
      orderStatusFilter = "ALL";
      orderSearchQuery = "";
      saveState(state);
      renderStoreDetails();
    });
  });

  document.querySelectorAll("[data-status-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      orderStatusFilter = btn.dataset.statusFilter;
      document.querySelectorAll("[data-status-filter]").forEach((b) => {
        b.classList.toggle("active", b.dataset.statusFilter === orderStatusFilter);
      });
      renderOrdersListOnly(store, m.orders);
    });
  });

  document.getElementById("orderSearchInput")?.addEventListener("input", (e) => {
    orderSearchQuery = e.target.value;
    renderOrdersListOnly(store, m.orders);
  });
}

function openOrderSheet(store, orderId) {
  const order = (state.ordersByStore[store.id] || []).find((o) => o.id === orderId);
  if (!order) return;

  openSheet(`
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
      <div>
        <div class="mono text-muted" style="font-size:12px;">${esc(store.name)} • ${esc(order.id)}</div>
        <h3 style="margin:4px 0 8px; font-size:18px;">${esc(order.item)}</h3>
        ${statusBadge(order.status)}
      </div>
      <div class="tabular" style="font-size:20px; font-weight:700;">${formatMoney(order.amount, store.currency, 2)}</div>
    </div>

    <div class="glass-inset" style="margin:16px 0; font-size:13px;">
      <div class="text-muted" style="font-size:11px; margin-bottom:4px;">Status Note</div>
      <div>${esc(order.note)}</div>
      <div class="text-muted" style="font-size:11px; margin-top:8px;">${new Date(order.date).toLocaleString()}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <button class="btn btn-primary" id="openSellerFromOrderBtn">Open ${esc(store.name)} ↗</button>
      <button class="btn btn-secondary" id="markDeliveredBtn">Mark Delivered</button>
      <button class="btn btn-danger" id="markRejectedBtn">Mark Rejected</button>
      <button class="btn btn-secondary" id="closeOrderSheetBtn">Close</button>
    </div>
  `);

  const setStatus = (newStatus, note) => {
    order.status = newStatus;
    order.note = note;
    saveState(state);
    closeSheet();
    showToast(`${order.id} → ${newStatus}`);
    render();
  };

  document.getElementById("openSellerFromOrderBtn").addEventListener("click", () => openExternalOrders(store));
  document.getElementById("markDeliveredBtn").addEventListener("click", () => setStatus("Delivered", "Marked delivered"));
  document.getElementById("markRejectedBtn").addEventListener("click", () => setStatus("Rejected", "Marked rejected"));
  document.getElementById("closeOrderSheetBtn").addEventListener("click", closeSheet);
}

function renderDirectoryGridOnly() {
  const grid = document.getElementById("directoryResultsContainer");
  if (!grid) return;

  const filtered = GLOBAL_PLATFORMS.filter((p) => {
    const q = directoryQuery.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q);
    const matchReg = directoryRegion === "ALL" || p.region === directoryRegion;
    return matchQ && matchReg;
  });

  grid.innerHTML = filtered.length
    ? filtered.map((p) => {
        const isConnected = state.connectedIds.includes(p.id);
        return `
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap:14px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <strong style="font-size:16px;">${esc(p.name)}</strong>
                <div class="text-muted" style="font-size:12px; margin-top:3px;">${esc(p.country)} • ${esc(p.region)}</div>
              </div>
              <span class="badge ${isConnected ? "badge-green" : "badge-muted"}">${isConnected ? "Added" : "Available"}</span>
            </div>

            <div style="display:flex; gap:8px; padding-top:10px; border-top:1px solid var(--stroke-hairline);">
              <button class="btn ${isConnected ? "btn-secondary" : "btn-primary"}" style="flex:1;" data-toggle-platform="${esc(p.id)}">
                ${isConnected ? "Remove" : "Add Store"}
              </button>
              <button class="btn btn-secondary" data-visit-platform="${esc(p.id)}">Open ↗</button>
            </div>
          </div>
        `;
      }).join("")
    : `<div class="card" style="grid-column:1/-1; text-align:center; padding:24px;">कोई प्लेटफॉर्म नहीं मिला।</div>`;

  grid.querySelectorAll("[data-toggle-platform]").forEach((b) => {
    b.addEventListener("click", () => handleTogglePlatform(b.dataset.togglePlatform));
  });
  grid.querySelectorAll("[data-visit-platform]").forEach((b) => {
    b.addEventListener("click", () => {
      const p = getPlatform(b.dataset.visitPlatform);
      if (p) openExternalOrders(p);
    });
  });
}

function renderDirectory() {
  const regions = ["ALL", "North America", "India", "Europe", "Middle East", "Global"];

  appMain.innerHTML = `
    <div class="view-enter" style="display:flex; flex-direction:column; gap:14px;">
      <div class="card" style="display:flex; flex-direction:column; gap:10px;">
        <input id="dirSearchInput" class="input-pill" type="search" placeholder="Search marketplaces (Amazon, Meesho, eBay, Flipkart...)" value="${esc(directoryQuery)}" />
        <div class="pills-scroll">
          ${regions.map((r) => `<button class="pill-btn ${directoryRegion === r ? "active" : ""}" data-region="${esc(r)}">${esc(r)}</button>`).join("")}
        </div>
      </div>

      <div id="directoryResultsContainer" class="directory-grid"></div>
    </div>
  `;

  renderDirectoryGridOnly();

  document.getElementById("dirSearchInput").addEventListener("input", (e) => {
    directoryQuery = e.target.value;
    renderDirectoryGridOnly();
  });
  document.querySelectorAll("[data-region]").forEach((b) => {
    b.addEventListener("click", () => {
      directoryRegion = b.dataset.region;
      document.querySelectorAll("[data-region]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.region === directoryRegion);
      });
      renderDirectoryGridOnly();
    });
  });
}

function handleTogglePlatform(id) {
  const p = getPlatform(id);
  if (!p) return;
  const idx = state.connectedIds.indexOf(id);
  if (idx !== -1) {
    state.connectedIds.splice(idx, 1);
    saveState(state);
    showToast(`${p.name} removed`);
    renderDirectoryGridOnly();
    return;
  }

  openSheet(`
    <h3 style="margin:0 0 6px; font-size:19px;">Add ${esc(p.name)}</h3>
    <p class="text-muted" style="font-size:13px; margin:0 0 14px; line-height:1.45;">
      होम स्क्रीन पर जोड़ने के बाद, जब आप इस पर क्लिक करेंगे तो सीधे ${esc(p.name)} का लाइव सेलर ऑर्डर्स पेज खुलेगा।
    </p>

    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px;">Store Name</label>
    <input id="connectNickname" class="input-pill" value="${esc(p.name)}" />

    <div style="display:flex; gap:8px; margin-top:16px;">
      <button class="btn btn-primary" style="flex:1;" id="confirmConnectBtn">Add to My Stores</button>
      <button class="btn btn-secondary" id="openDirectNowBtn">Open Website ↗</button>
    </div>
  `);

  document.getElementById("confirmConnectBtn").addEventListener("click", () => {
    const nick = document.getElementById("connectNickname").value.trim() || p.name;
    if (!state.connectedIds.includes(p.id)) state.connectedIds.push(p.id);
    if (!state.ordersByStore[p.id]) state.ordersByStore[p.id] = [];
    state.storeMeta[p.id] = {
      nickname: nick,
      lastSyncedAt: new Date().toISOString()
    };
    state.prefs.selectedStoreId = p.id;
    saveState(state);
    closeSheet();
    showToast(`${nick} added`);
    setTab("dashboard");
  });

  document.getElementById("openDirectNowBtn").addEventListener("click", () => openExternalOrders(p));
}

async function syncStoreViaApi(storeId) {
  const isEbay = storeId.startsWith("ebay");
  const isFlipkart = storeId === "flipkart";
  if (!isEbay && !isFlipkart) {
    const p = getPlatform(storeId);
    if (p) openExternalOrders(p);
    return;
  }

  const endpoint = isEbay ? "/api/ebay/sync" : "/api/flipkart/sync";
  const payload = isEbay ? state.apiConfigs.ebay : state.apiConfigs.flipkart;

  if (!payload.accessToken && !(isFlipkart && payload.appId && payload.appSecret)) {
    showToast("Settings में API token डालें या Open Orders ↗ दबाएँ।");
    return;
  }

  try {
    showToast("Syncing...");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Sync failed");
    if (Array.isArray(data.orders) && data.orders.length > 0) {
      const existingIds = new Set((state.ordersByStore[storeId] || []).map((o) => o.id));
      const fresh = data.orders.filter((o) => !existingIds.has(o.id));
      state.ordersByStore[storeId] = [...fresh, ...(state.ordersByStore[storeId] || [])];
      saveState(state);
      render();
    }
    showToast(`Synced ${data.orders?.length || 0} orders`);
  } catch (err) {
    showToast(err.message || "Sync failed");
  }
}

function renderSyncAndSettings() {
  const connectedPlatforms = state.connectedIds.map(getPlatform).filter(Boolean);

  appMain.innerHTML = `
    <div class="view-enter" style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="display:flex; flex-direction:column; gap:12px;">
        <h2 class="section-title">Appearance & Safari Install</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:13px; font-weight:600;">Theme</span>
          <div class="segmented" id="themeSegmented">
            <button data-theme-pick="system" class="${state.prefs.theme === "system" ? "active" : ""}">Auto</button>
            <button data-theme-pick="light" class="${state.prefs.theme === "light" ? "active" : ""}">Light</button>
            <button data-theme-pick="dark" class="${state.prefs.theme === "dark" ? "active" : ""}">Dark</button>
          </div>
        </div>

        <div class="glass-inset" style="font-size:12px; line-height:1.55;">
          <strong>iPhone / iPad Safari पर इंस्टॉल करें:</strong><br/>
          Safari में <strong>Share (↑)</strong> दबाएँ → <strong>"Add to Home Screen"</strong> चुनें।
        </div>
      </div>

      <div class="card" style="display:flex; flex-direction:column; gap:12px;">
        <h2 class="section-title">Optional: Import Orders CSV</h2>
        <select id="csvTargetStore" class="select-pill" style="min-height:42px; font-size:13px;">
          ${(connectedPlatforms.length ? connectedPlatforms : GLOBAL_PLATFORMS).map((p) =>
            `<option value="${esc(p.id)}" ${p.id === state.prefs.selectedStoreId ? "selected" : ""}>${esc(p.name)}</option>`
          ).join("")}
        </select>
        <input id="csvFileInput" type="file" accept=".csv,text/csv" class="input-pill" />
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="downloadSampleCsvBtn">Download Sample CSV</button>
        </div>
      </div>

      <div class="card" style="display:flex; flex-direction:column; gap:12px;">
        <h2 class="section-title">Optional: Free API Keys (eBay & Flipkart)</h2>
        <div class="glass-inset">
          <strong style="font-size:13px;">eBay User Access Token</strong>
          <input id="ebayTokenInput" class="input-pill" style="margin-top:8px;" placeholder="eBay OAuth Token" value="${esc(state.apiConfigs.ebay.accessToken)}" />
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-secondary" id="saveEbayBtn">Save</button>
            <button class="btn btn-primary" id="syncEbayBtn">Sync eBay</button>
          </div>
        </div>

        <div class="glass-inset">
          <strong style="font-size:13px;">Flipkart Seller API</strong>
          <div style="display:grid; gap:8px; margin-top:8px;">
            <input id="fkAppId" class="input-pill" placeholder="App ID" value="${esc(state.apiConfigs.flipkart.appId)}" />
            <input id="fkAppSecret" class="input-pill" type="password" placeholder="App Secret" value="${esc(state.apiConfigs.flipkart.appSecret)}" />
          </div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn btn-secondary" id="saveFkBtn">Save</button>
            <button class="btn btn-primary" id="syncFkBtn">Sync Flipkart</button>
          </div>
        </div>
      </div>

      <div class="card" style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-secondary" id="loadDemoBtn2">Load Preview Data</button>
        <button class="btn btn-danger" id="resetDemoBtn">Clear All Stores</button>
      </div>
    </div>
  `;

  document.getElementById("csvFileInput").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const storeId = document.getElementById("csvTargetStore").value;
    try {
      const parsed = parseOrdersCsv(await file.text());
      state.ordersByStore[storeId] = [...parsed, ...(state.ordersByStore[storeId] || [])];
      if (!state.connectedIds.includes(storeId)) state.connectedIds.push(storeId);
      state.prefs.selectedStoreId = storeId;
      saveState(state);
      showToast(`${parsed.length} orders imported`);
      setTab("dashboard");
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("downloadSampleCsvBtn").addEventListener("click", () => {
    const storeId = document.getElementById("csvTargetStore").value;
    const csv = buildSampleCsv(getPlatform(storeId)?.name || "Store");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${storeId}-orders-sample.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("saveEbayBtn").addEventListener("click", () => {
    state.apiConfigs.ebay.accessToken = document.getElementById("ebayTokenInput").value.trim();
    saveState(state);
    showToast("Saved");
  });
  document.getElementById("syncEbayBtn").addEventListener("click", () => {
    state.apiConfigs.ebay.accessToken = document.getElementById("ebayTokenInput").value.trim();
    saveState(state);
    syncStoreViaApi("ebay-us");
  });

  document.getElementById("saveFkBtn").addEventListener("click", () => {
    state.apiConfigs.flipkart.appId = document.getElementById("fkAppId").value.trim();
    state.apiConfigs.flipkart.appSecret = document.getElementById("fkAppSecret").value.trim();
    saveState(state);
    showToast("Saved");
  });
  document.getElementById("syncFkBtn").addEventListener("click", () => {
    state.apiConfigs.flipkart.appId = document.getElementById("fkAppId").value.trim();
    state.apiConfigs.flipkart.appSecret = document.getElementById("fkAppSecret").value.trim();
    saveState(state);
    syncStoreViaApi("flipkart");
  });

  document.querySelectorAll("[data-theme-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.prefs.theme = btn.dataset.themePick;
      saveState(state);
      applyTheme();
      renderSyncAndSettings();
    });
  });

  document.getElementById("loadDemoBtn2").addEventListener("click", () => {
    state = loadSampleDemoWorkspace(state);
    showToast("Preview loaded");
    setTab("dashboard");
  });

  document.getElementById("resetDemoBtn").addEventListener("click", () => {
    state = resetAllState();
    applyTheme();
    showToast("Cleared");
    setTab("dashboard");
  });
}

function render() {
  updateTopControls();
  if (activeTab === "dashboard") renderDashboard();
  else if (activeTab === "store") renderStoreDetails();
  else if (activeTab === "directory") renderDirectory();
  else renderSyncAndSettings();
}

document.querySelectorAll("[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

document.querySelectorAll("#timeframeSegmented button").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.prefs.timeframe = btn.dataset.tf;
    saveState(state);
    render();
  });
});

document.getElementById("currencySelect").addEventListener("change", (e) => {
  state.prefs.displayCurrency = e.target.value;
  saveState(state);
  render();
});

applyTheme();
registerServiceWorker();
render();
