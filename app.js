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
let directoryMode = "ALL";

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
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function getPlatform(id) {
  return GLOBAL_PLATFORMS.find((p) => p.id === id);
}

function statusBadge(status) {
  if (status === "Late") return `<span class="badge badge-orange">Late / SLA Risk</span>`;
  if (status === "Rejected") return `<span class="badge badge-red">Rejected</span>`;
  if (status === "Delivered") return `<span class="badge badge-green">Delivered</span>`;
  return `<span class="badge badge-blue">On Time</span>`;
}

function modeBadge(p) {
  if (p.integrationMode === "free_api") {
    return `<span class="badge badge-green">Free API + CSV</span>`;
  }
  return `<span class="badge badge-blue">100% Free CSV Sync</span>`;
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
  const { timeframe, displayCurrency } = state.prefs;
  const g = computeGlobalMetrics(state);
  const tfLabel = timeframe === "today" ? "Today's" : timeframe === "7d" ? "7-Day" : "30-Day";

  if (state.connectedIds.length === 0) {
    appMain.innerHTML = `
      <div class="view-enter" style="display:flex; flex-direction:column; gap:14px;">
        <div class="card" style="text-align:center; padding:30px 18px;">
          <div style="width:52px; height:52px; margin:0 auto 12px; border-radius:16px; background:var(--accent-soft); color:var(--accent); display:grid; place-items:center; font-size:22px; font-weight:700;">+</div>
          <h2 style="margin:0 0 8px; font-size:20px; letter-spacing:-0.02em;">अभी कोई स्टोर कनेक्ट नहीं है</h2>
          <p class="text-muted" style="font-size:13px; max-width:460px; margin:0 auto 18px; line-height:1.5;">
            जब तक आप अपना कोई अकाउंट (जैसे Amazon.ca, eBay, Flipkart या Meesho) कनेक्ट नहीं करते, यहाँ कोई नकली डेटा नहीं दिखाया जाता। शुरू करने के लिए अपना स्टोर जोड़ें।
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-primary" id="emptyConnectBtn">+ Connect Your Store</button>
            <button class="btn btn-secondary" id="loadDemoWorkspaceBtn">Preview Demo Data</button>
          </div>
        </div>

        <div class="kpi-grid tabular">
          <div class="card">
            <div class="kpi-label">${tfLabel} Orders</div>
            <div class="kpi-value">0</div>
            <div class="kpi-sub">0 connected stores</div>
          </div>
          <div class="card">
            <div class="kpi-label">Revenue (${esc(displayCurrency)})</div>
            <div class="kpi-value text-green">${formatMoney(0, displayCurrency)}</div>
            <div class="kpi-sub">Connect store or upload CSV</div>
          </div>
          <div class="card">
            <div class="kpi-label">Rejected</div>
            <div class="kpi-value text-red">0</div>
            <div class="kpi-sub">No active alerts</div>
          </div>
          <div class="card">
            <div class="kpi-label">Late / At-Risk</div>
            <div class="kpi-value text-orange">0</div>
            <div class="kpi-sub">No active alerts</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("emptyConnectBtn")?.addEventListener("click", () => setTab("directory"));
    document.getElementById("loadDemoWorkspaceBtn")?.addEventListener("click", () => {
      state = loadSampleDemoWorkspace(state);
      showToast("Demo stores loaded for preview");
      render();
    });
    return;
  }

  const cardsHtml = state.connectedIds.map((id) => {
    const p = getPlatform(id);
    if (!p) return "";
    const m = computeStoreMetrics(state.ordersByStore[id], timeframe);
    const converted = convertCurrency(m.revenue, p.currency, displayCurrency);
    const meta = state.storeMeta[id] || {};

    return `
      <button class="card card-interactive" data-open-store="${esc(p.id)}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:16px;">${esc(meta.nickname || p.name)}</strong>
              <span class="badge badge-muted">${esc(p.country)}</span>
            </div>
            <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
              ${modeBadge(p)}
            </div>
          </div>
          <span style="color:var(--accent); font-size:13px; font-weight:600;">Details ›</span>
        </div>

        <div class="store-metrics-row tabular">
          <div>
            <div class="metric-mini-label">Orders</div>
            <div class="metric-mini-val">${m.ordersCount}</div>
          </div>
          <div>
            <div class="metric-mini-label">Revenue</div>
            <div class="metric-mini-val text-green">${formatMoney(m.revenue, p.currency)}</div>
            ${p.currency !== displayCurrency ? `<div class="kpi-sub">≈ ${formatMoney(converted, displayCurrency)}</div>` : ""}
          </div>
          <div>
            <div class="metric-mini-label">Rejected</div>
            <div class="metric-mini-val text-red">${m.rejected}</div>
          </div>
          <div>
            <div class="metric-mini-label">Late</div>
            <div class="metric-mini-val text-orange">${m.late}</div>
          </div>
        </div>
      </button>
    `;
  }).join("");

  appMain.innerHTML = `
    <div class="view-enter">
      <div class="kpi-grid tabular">
        <div class="card">
          <div class="kpi-label">${tfLabel} Total Orders</div>
          <div class="kpi-value">${g.totalOrders}</div>
          <div class="kpi-sub">${state.connectedIds.length} connected stores</div>
        </div>
        <div class="card">
          <div class="kpi-label">Revenue (${esc(displayCurrency)})</div>
          <div class="kpi-value text-green">${formatMoney(g.totalRevenueConverted, displayCurrency)}</div>
          <div class="kpi-sub">All stores combined</div>
        </div>
        <div class="card">
          <div class="kpi-label">Rejected / Cancelled</div>
          <div class="kpi-value text-red">${g.totalRejected}</div>
          <div class="kpi-sub">Tap store for reasons</div>
        </div>
        <div class="card">
          <div class="kpi-label">Late / At-Risk SLA</div>
          <div class="kpi-value text-orange">${g.totalLate}</div>
          <div class="kpi-sub">Needs dispatch action</div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">मेरे कनेक्टेड स्टोर्स (${state.connectedIds.length})</h2>
        <button class="btn-link" id="goDirectoryBtn">+ Add Platform</button>
      </div>

      <div class="stores-grid">${cardsHtml}</div>
    </div>
  `;

  document.querySelectorAll("[data-open-store]").forEach((el) => {
    el.addEventListener("click", () => {
      state.prefs.selectedStoreId = el.dataset.openStore;
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
    : `<p class="text-muted" style="text-align:center; padding:24px 0; font-size:13px;">इस स्टोर में अभी कोई ऑर्डर नहीं है। ऊपर "Import CSV" या "Sync Free API" से ऑर्डर्स जोड़ें।</p>`;

  listEl.querySelectorAll("[data-order-id]").forEach((row) => {
    row.addEventListener("click", () => openOrderSheet(store, row.dataset.orderId));
  });
}

function renderStoreDetails() {
  if (state.connectedIds.length === 0) {
    appMain.innerHTML = `
      <div class="view-enter card" style="text-align:center; padding:32px 16px;">
        <p style="font-weight:600; margin:0 0 8px;">कोई स्टोर कनेक्ट नहीं है</p>
        <p class="text-muted" style="font-size:13px; margin:0 0 14px;">पहले All Marketplaces से अपना स्टोर कनेक्ट करें।</p>
        <button class="btn btn-primary" id="goDirFromStore">All Marketplaces खोलें</button>
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
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <h2 style="margin:0; font-size:20px; letter-spacing:-0.02em;">${esc(meta.nickname || store.name)}</h2>
              ${modeBadge(store)}
            </div>
            <p class="text-muted" style="font-size:12px; margin:6px 0 0;">${esc(store.apiNote)}</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary" id="quickCsvBtn">Import CSV</button>
            ${store.integrationMode === "free_api" ? `<button class="btn btn-primary" id="quickApiSyncBtn">Sync Free API</button>` : ""}
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
            <div class="kpi-label">Rejected / Cancelled</div>
            <div class="kpi-value text-red" style="font-size:22px;">${m.rejected}</div>
          </div>
          <div class="glass-inset">
            <div class="kpi-label">Late / Delayed</div>
            <div class="kpi-value text-orange" style="font-size:22px;">${m.late}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <h3 style="margin:0; font-size:15px;">Orders & SLA Status (<span id="ordersCountBadge">0</span>)</h3>
            <div class="pills-scroll" id="statusFilterPills">
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

  document.getElementById("quickCsvBtn")?.addEventListener("click", () => setTab("sync"));
  document.getElementById("quickApiSyncBtn")?.addEventListener("click", () => syncStoreViaApi(store.id));
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
      <div class="text-muted" style="font-size:11px; margin-bottom:4px;">SLA / Status Note</div>
      <div>${esc(order.note)}</div>
      <div class="text-muted" style="font-size:11px; margin-top:8px;">Date: ${new Date(order.date).toLocaleString()}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <button class="btn btn-primary" id="markDeliveredBtn">Mark Delivered</button>
      <button class="btn btn-secondary" id="markOnTimeBtn">Mark On Time</button>
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

  document.getElementById("markDeliveredBtn").addEventListener("click", () => setStatus("Delivered", "Marked delivered by seller"));
  document.getElementById("markOnTimeBtn").addEventListener("click", () => setStatus("On Time", "Dispatched on schedule"));
  document.getElementById("markRejectedBtn").addEventListener("click", () => setStatus("Rejected", "Marked rejected/cancelled"));
  document.getElementById("closeOrderSheetBtn").addEventListener("click", closeSheet);
}

function renderDirectoryGridOnly() {
  const grid = document.getElementById("directoryResultsContainer");
  if (!grid) return;

  const filtered = GLOBAL_PLATFORMS.filter((p) => {
    const q = directoryQuery.trim().toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q);
    const matchReg = directoryRegion === "ALL" || p.region === directoryRegion;
    const matchMode = directoryMode === "ALL" || p.integrationMode === directoryMode;
    return matchQ && matchReg && matchMode;
  });

  grid.innerHTML = filtered.length
    ? filtered.map((p) => {
        const isConnected = state.connectedIds.includes(p.id);
        return `
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <div>
                  <strong style="font-size:15px;">${esc(p.name)}</strong>
                  <div class="text-muted" style="font-size:12px; margin-top:2px;">${esc(p.region)} • ${esc(p.country)} (${esc(p.currency)})</div>
                </div>
                <span class="badge ${isConnected ? "badge-green" : "badge-muted"}">${isConnected ? "Connected" : "Available"}</span>
              </div>
              <div style="margin-top:10px;">${modeBadge(p)}</div>
              <p class="text-muted" style="font-size:12px; margin:8px 0 0; line-height:1.45;">${esc(p.apiNote)}</p>
            </div>
            <div style="display:flex; gap:8px; padding-top:10px; border-top:1px solid var(--stroke-hairline);">
              <button class="btn ${isConnected ? "btn-secondary" : "btn-primary"}" style="flex:1;" data-toggle-platform="${esc(p.id)}">
                ${isConnected ? "Disconnect" : "Connect Store"}
              </button>
              ${isConnected ? `<button class="btn btn-secondary" data-view-platform="${esc(p.id)}">Open</button>` : ""}
            </div>
          </div>
        `;
      }).join("")
    : `<div class="card" style="grid-column:1/-1; text-align:center; padding:24px;">कोई प्लेटफॉर्म नहीं मिला।</div>`;

  grid.querySelectorAll("[data-toggle-platform]").forEach((b) => {
    b.addEventListener("click", () => handleTogglePlatform(b.dataset.togglePlatform));
  });
  grid.querySelectorAll("[data-view-platform]").forEach((b) => {
    b.addEventListener("click", () => {
      state.prefs.selectedStoreId = b.dataset.viewPlatform;
      saveState(state);
      setTab("store");
    });
  });
}

function renderDirectory() {
  const regions = ["ALL", "North America", "India", "Europe", "Middle East", "Global"];

  appMain.innerHTML = `
    <div class="view-enter" style="display:flex; flex-direction:column; gap:14px;">
      <div class="card" style="display:flex; flex-direction:column; gap:10px;">
        <input id="dirSearchInput" class="input-pill" type="search" placeholder="दुनिया के किसी भी ई-कॉमर्स प्लेटफॉर्म को खोजें (Amazon, Meesho, eBay, Walmart...)" value="${esc(directoryQuery)}" />
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center;">
          <div class="pills-scroll">
            ${regions.map((r) => `<button class="pill-btn ${directoryRegion === r ? "active" : ""}" data-region="${esc(r)}">${esc(r)}</button>`).join("")}
          </div>
          <select id="dirModeSelect" class="select-pill">
            <option value="ALL" ${directoryMode === "ALL" ? "selected" : ""}>All Sync Modes</option>
            <option value="free_api" ${directoryMode === "free_api" ? "selected" : ""}>Free Official API</option>
            <option value="csv_report" ${directoryMode === "csv_report" ? "selected" : ""}>100% Free CSV Sync</option>
          </select>
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
  document.getElementById("dirModeSelect").addEventListener("change", (e) => {
    directoryMode = e.target.value;
    renderDirectoryGridOnly();
  });
}

function handleTogglePlatform(id) {
  const p = getPlatform(id);
  if (!p) return;
  const idx = state.connectedIds.indexOf(id);
  if (idx !== -1) {
    state.connectedIds.splice(idx, 1);
    saveState(state);
    showToast(`${p.name} disconnected`);
    renderDirectoryGridOnly();
    return;
  }

  const isFreeApi = p.integrationMode === "free_api";
  openSheet(`
    <h3 style="margin:0 0 6px; font-size:19px;">Connect ${esc(p.name)}</h3>
    <p class="text-muted" style="font-size:13px; margin:0 0 14px; line-height:1.45;">${esc(p.apiNote)}</p>

    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px;">Store Name / Label</label>
    <input id="connectNickname" class="input-pill" value="${esc(p.name)}" />

    ${isFreeApi && p.id.startsWith("ebay") ? `
      <label style="display:block; font-size:12px; font-weight:600; margin:12px 0 6px;">eBay OAuth Token (वैकल्पिक — अभी खाली छोड़ सकते हैं)</label>
      <input id="connectEbayToken" class="input-pill" placeholder="Paste eBay User Access Token" value="${esc(state.apiConfigs.ebay.accessToken)}" />
    ` : ""}

    ${isFreeApi && p.id === "flipkart" ? `
      <label style="display:block; font-size:12px; font-weight:600; margin:12px 0 6px;">Flipkart App ID & Secret (वैकल्पिक)</label>
      <div style="display:grid; gap:8px;">
        <input id="connectFkId" class="input-pill" placeholder="Flipkart App ID" value="${esc(state.apiConfigs.flipkart.appId)}" />
        <input id="connectFkSecret" class="input-pill" type="password" placeholder="Flipkart App Secret" value="${esc(state.apiConfigs.flipkart.appSecret)}" />
      </div>
    ` : ""}

    <div class="glass-inset" style="margin:14px 0; font-size:12px;">
      <label style="display:block; font-weight:600; margin-bottom:6px;">अभी Order CSV अपलोड करें (वैकल्पिक):</label>
      <input id="connectCsvFile" type="file" accept=".csv,text/csv" class="input-pill" style="padding:8px 10px;" />
      <label style="display:flex; align-items:center; gap:8px; margin-top:10px; cursor:pointer;">
        <input id="connectUseSample" type="checkbox" />
        <span>सिर्फ़ लेआउट देखने के लिए सैंपल टेस्ट ऑर्डर्स जोड़ें (वरना 0 से शुरू होगा)</span>
      </label>
    </div>

    <div style="display:flex; gap:8px; margin-top:14px;">
      <button class="btn btn-primary" style="flex:1;" id="confirmConnectBtn">Connect Store</button>
      <button class="btn btn-secondary" id="cancelConnectBtn">Cancel</button>
    </div>
  `);

  document.getElementById("confirmConnectBtn").addEventListener("click", async () => {
    const nick = document.getElementById("connectNickname").value.trim() || p.name;
    const csvFile = document.getElementById("connectCsvFile").files?.[0];
    const useSample = document.getElementById("connectUseSample").checked;

    if (isFreeApi && p.id.startsWith("ebay")) {
      const tok = document.getElementById("connectEbayToken")?.value.trim();
      if (tok) state.apiConfigs.ebay.accessToken = tok;
    }
    if (isFreeApi && p.id === "flipkart") {
      const fid = document.getElementById("connectFkId")?.value.trim();
      const fsec = document.getElementById("connectFkSecret")?.value.trim();
      if (fid) state.apiConfigs.flipkart.appId = fid;
      if (fsec) state.apiConfigs.flipkart.appSecret = fsec;
    }

    let initialOrders = [];
    if (csvFile) {
      try {
        initialOrders = parseOrdersCsv(await csvFile.text());
      } catch (err) {
        showToast(err.message);
        return;
      }
    } else if (useSample) {
      initialOrders = p.seedOrders.map((o) => ({ ...o }));
    }

    if (!state.connectedIds.includes(p.id)) state.connectedIds.push(p.id);
    state.ordersByStore[p.id] = initialOrders;
    state.storeMeta[p.id] = {
      nickname: nick,
      syncMethod: p.apiLabel,
      lastSyncedAt: new Date().toISOString()
    };
    state.prefs.selectedStoreId = p.id;
    saveState(state);
    closeSheet();
    showToast(`${nick} connected (${initialOrders.length} orders)`);
    setTab("store");
  });

  document.getElementById("cancelConnectBtn").addEventListener("click", closeSheet);
}

async function syncStoreViaApi(storeId) {
  const isEbay = storeId.startsWith("ebay");
  const isFlipkart = storeId === "flipkart";
  if (!isEbay && !isFlipkart) {
    showToast("यह स्टोर फ्री CSV इम्पोर्ट से सिंक होता है।");
    return;
  }

  const endpoint = isEbay ? "/api/ebay/sync" : "/api/flipkart/sync";
  const payload = isEbay ? state.apiConfigs.ebay : state.apiConfigs.flipkart;

  if (!payload.accessToken && !(isFlipkart && payload.appId && payload.appSecret)) {
    showToast("पहले Sync & CSV टैब में अपनी फ्री API credentials डालें।");
    setTab("sync");
    return;
  }

  try {
    showToast("Free API से डेटा सिंक हो रहा है...");
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
    showToast(`Synced ${data.orders?.length || 0} orders from ${getPlatform(storeId)?.name}!`);
  } catch (err) {
    showToast(err.message || "API सिंक के लिए लोकल server.mjs चलाएँ।");
  }
}

function renderSyncAndSettings() {
  const connectedPlatforms = state.connectedIds.map(getPlatform).filter(Boolean);
  const alerts = [];
  for (const p of connectedPlatforms) {
    for (const o of state.ordersByStore[p.id] || []) {
      if (o.status === "Late" || o.status === "Rejected") {
        alerts.push({ storeId: p.id, storeName: p.name, currency: p.currency, ...o });
      }
    }
  }

  appMain.innerHTML = `
    <div class="view-enter" style="display:flex; flex-direction:column; gap:16px;">
      <div class="card" style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <span class="badge badge-blue">100% Free — Amazon, Meesho & All Stores</span>
          <h2 class="section-title" style="margin-top:8px;">CSV / Excel रिपोर्ट इम्पोर्ट करें</h2>
          <p class="text-muted" style="font-size:13px; margin:4px 0 0;">अपने Seller Central से डाउनलोड की गई Order CSV फ़ाइल चुनें — आज के ऑर्डर्स, रेवेन्यू, रिजेक्ट और लेट शिपमेंट तुरंत अपडेट हो जाएंगे।</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:10px;">
          <select id="csvTargetStore" class="select-pill" style="min-height:44px; font-size:13px;">
            ${(connectedPlatforms.length ? connectedPlatforms : GLOBAL_PLATFORMS).map((p) =>
              `<option value="${esc(p.id)}" ${p.id === state.prefs.selectedStoreId ? "selected" : ""}>${esc(p.name)} (${esc(p.currency)})</option>`
            ).join("")}
          </select>
          <input id="csvFileInput" type="file" accept=".csv,text/csv" class="input-pill" />
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="loadSampleCsvBtn">Load Sample CSV Batch</button>
          <button class="btn btn-secondary" id="downloadSampleCsvBtn">Download Sample CSV</button>
        </div>
      </div>

      <div class="card" style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <span class="badge badge-green">Free Official APIs</span>
          <h2 class="section-title" style="margin-top:8px;">eBay & Flipkart फ्री API कनेक्टर</h2>
          <p class="text-muted" style="font-size:13px; margin:4px 0 0;">दोनों प्लेटफॉर्म्स की API फ्री है। जब चाहें अपनी डेवलपर credentials डालकर लाइव ऑर्डर सिंक करें।</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:12px;">
          <div class="glass-inset">
            <strong style="font-size:14px;">eBay Sell API (5,000 calls/day फ्री)</strong>
            <input id="ebayTokenInput" class="input-pill" style="margin-top:8px;" placeholder="eBay OAuth User Access Token" value="${esc(state.apiConfigs.ebay.accessToken)}" />
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <button class="btn btn-secondary" id="saveEbayBtn">Save Token</button>
              <button class="btn btn-primary" id="syncEbayBtn">Test & Sync eBay</button>
            </div>
          </div>

          <div class="glass-inset">
            <strong style="font-size:14px;">Flipkart Seller API v3 (100% फ्री)</strong>
            <div style="display:grid; grid-template-columns:1fr; gap:8px; margin-top:8px;">
              <input id="fkAppId" class="input-pill" placeholder="Flipkart App ID" value="${esc(state.apiConfigs.flipkart.appId)}" />
              <input id="fkAppSecret" class="input-pill" type="password" placeholder="Flipkart App Secret" value="${esc(state.apiConfigs.flipkart.appSecret)}" />
            </div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <button class="btn btn-secondary" id="saveFkBtn">Save Credentials</button>
              <button class="btn btn-primary" id="syncFkBtn">Test & Sync Flipkart</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
          <h2 class="section-title">Late & Rejected Alerts (${alerts.length})</h2>
          <button class="btn btn-secondary" id="enableNotifBtn">Enable Browser Alerts</button>
        </div>
        ${alerts.slice(0, 8).map((a) => `
          <div class="order-row" data-alert-store="${esc(a.storeId)}">
            <div>
              <strong style="font-size:13px;">${esc(a.storeName)} — ${esc(a.item)}</strong>
              <div class="text-muted" style="font-size:12px;">${esc(a.id)} • ${esc(a.note)}</div>
            </div>
            <div>${statusBadge(a.status)}</div>
          </div>
        `).join("") || `<p class="text-muted" style="font-size:13px;">अभी कोई लेट या रिजेक्टेड ऑर्डर अलर्ट नहीं है।</p>`}
      </div>

      <div class="card" style="display:flex; flex-direction:column; gap:12px;">
        <h2 class="section-title">Liquid Glass Theme & Safari Install</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:13px; font-weight:600;">App Theme (Light / Dark)</span>
          <div class="segmented" id="themeSegmented">
            <button data-theme-pick="system" class="${state.prefs.theme === "system" ? "active" : ""}">Auto</button>
            <button data-theme-pick="light" class="${state.prefs.theme === "light" ? "active" : ""}">Light</button>
            <button data-theme-pick="dark" class="${state.prefs.theme === "dark" ? "active" : ""}">Dark</button>
          </div>
        </div>

        <div class="glass-inset" style="font-size:12px; line-height:1.55;">
          <strong>iPhone / iPad Safari पर इंस्टॉल करने के लिए:</strong><br/>
          1. Safari में नीचे <strong>Share (↑)</strong> दबाएँ → <strong>"Add to Home Screen"</strong> चुनें।<br/>
          <strong>Android Chrome पर:</strong> मेनू (⋮) दबाकर <strong>"Install app"</strong> चुनें।
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="loadDemoBtn2">Load Demo Stores</button>
          <button class="btn btn-danger" id="resetDemoBtn">Clear All Stores (0)</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("csvFileInput").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const storeId = document.getElementById("csvTargetStore").value;
    try {
      const text = await file.text();
      const parsed = parseOrdersCsv(text);
      state.ordersByStore[storeId] = [...parsed, ...(state.ordersByStore[storeId] || [])];
      if (!state.connectedIds.includes(storeId)) state.connectedIds.push(storeId);
      state.prefs.selectedStoreId = storeId;
      saveState(state);
      showToast(`${parsed.length} orders imported to ${getPlatform(storeId)?.name}`);
      setTab("store");
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("loadSampleCsvBtn").addEventListener("click", () => {
    const storeId = document.getElementById("csvTargetStore").value;
    const store = getPlatform(storeId);
    const parsed = parseOrdersCsv(buildSampleCsv(store?.name || "Store"));
    state.ordersByStore[storeId] = [...parsed, ...(state.ordersByStore[storeId] || [])];
    if (!state.connectedIds.includes(storeId)) state.connectedIds.push(storeId);
    state.prefs.selectedStoreId = storeId;
    saveState(state);
    showToast(`${parsed.length} sample CSV orders added to ${store?.name}`);
    setTab("store");
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
    showToast("eBay token saved locally");
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
    showToast("Flipkart credentials saved locally");
  });
  document.getElementById("syncFkBtn").addEventListener("click", () => {
    state.apiConfigs.flipkart.appId = document.getElementById("fkAppId").value.trim();
    state.apiConfigs.flipkart.appSecret = document.getElementById("fkAppSecret").value.trim();
    saveState(state);
    syncStoreViaApi("flipkart");
  });

  document.getElementById("enableNotifBtn").addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showToast("इस ब्राउज़र में Notification API उपलब्ध नहीं है।");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("OmniSell Alerts Active", { body: "अब आपको लेट और रिजेक्टेड ऑर्डर्स के अलर्ट मिलेंगे।" });
      showToast("Alerts enabled!");
    } else {
      showToast("Notification permission denied");
    }
  });

  document.querySelectorAll("[data-alert-store]").forEach((row) => {
    row.addEventListener("click", () => {
      state.prefs.selectedStoreId = row.dataset.alertStore;
      saveState(state);
      setTab("store");
    });
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
    showToast("Demo stores loaded");
    setTab("dashboard");
  });

  document.getElementById("resetDemoBtn").addEventListener("click", () => {
    state = resetAllState();
    applyTheme();
    showToast("Cleared all stores");
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
