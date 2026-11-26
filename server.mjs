import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > 1024 * 1024) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

async function handleEbaySync(req, res) {
  try {
    const { accessToken } = await readJsonBody(req);
    if (!accessToken) {
      return sendJson(res, 400, { error: "eBay OAuth accessToken आवश्यक है।" });
    }
    const resp = await fetch("https://api.ebay.com/sell/fulfillment/v1/order?limit=25", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return sendJson(res, resp.status, {
        error: data?.errors?.[0]?.message || `eBay API error (${resp.status})`
      });
    }

    const orders = (data.orders || []).map((o) => {
      const firstLine = o.lineItems?.[0];
      const cancelState = o.cancelStatus?.cancelState;
      const fulfill = o.orderFulfillmentStatus;
      let status = "On Time";
      if (cancelState === "CANCELED") status = "Rejected";
      else if (fulfill === "FULFILLED") status = "Delivered";
      else if (firstLine?.lineItemFulfillmentInstructions?.maxEstimatedDeliveryDate) {
        const due = Date.parse(firstLine.lineItemFulfillmentInstructions.maxEstimatedDeliveryDate);
        if (!Number.isNaN(due) && Date.now() > due) status = "Late";
      }

      return {
        id: o.orderId,
        item: firstLine?.title || "eBay Order",
        amount: Number(o.pricingSummary?.total?.value || 0),
        status,
        note: `eBay ${fulfill || "IN_PROGRESS"}`,
        date: o.creationDate || new Date().toISOString()
      };
    });

    return sendJson(res, 200, { orders });
  } catch (err) {
    return sendJson(res, 500, { error: err.message });
  }
}

async function handleFlipkartSync(req, res) {
  try {
    const { appId, appSecret, accessToken } = await readJsonBody(req);
    let token = accessToken;

    if (!token) {
      if (!appId || !appSecret) {
        return sendJson(res, 400, { error: "Flipkart App ID और App Secret आवश्यक हैं।" });
      }
      const basic = Buffer.from(`${appId}:${appSecret}`).toString("base64");
      const tokenRes = await fetch(
        "https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api",
        { headers: { Authorization: `Basic ${basic}` } }
      );
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        return sendJson(res, tokenRes.status || 400, {
          error: tokenData.error_description || "Flipkart OAuth token प्राप्त नहीं हो सका।"
        });
      }
      token = tokenData.access_token;
    }

    const searchRes = await fetch("https://api.flipkart.net/sellers/v3/orders/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: { states: ["APPROVED", "PACKING_IN_PROGRESS", "READY_TO_DISPATCH", "SHIPPED", "CANCELLED"] }
      })
    });
    const searchData = await searchRes.json();
    if (!searchRes.ok) {
      return sendJson(res, searchRes.status, {
        error: searchData?.message || `Flipkart API error (${searchRes.status})`
      });
    }

    const orders = (searchData.orderItems || []).map((item) => {
      let status = "On Time";
      if (item.status === "CANCELLED") status = "Rejected";
      else if (item.status === "SHIPPED" || item.status === "DELIVERED") status = "Delivered";
      else if (item.dispatchByDate && Date.now() > Date.parse(item.dispatchByDate)) status = "Late";

      return {
        id: item.orderId || item.orderItemId,
        item: item.title || item.sku || "Flipkart Order",
        amount: Number(item.priceComponents?.sellingPrice || 0),
        status,
        note: `Flipkart ${item.status || "APPROVED"}`,
        date: item.orderDate || new Date().toISOString()
      };
    });

    return sendJson(res, 200, { orders });
  } catch (err) {
    return sendJson(res, 500, { error: err.message });
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (reqUrl.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "OmniSell Free PWA" });
  }
  if (reqUrl.pathname === "/api/ebay/sync" && req.method === "POST") {
    return handleEbaySync(req, res);
  }
  if (reqUrl.pathname === "/api/flipkart/sync" && req.method === "POST") {
    return handleFlipkartSync(req, res);
  }

  let relPath = reqUrl.pathname === "/" ? "/index.html" : reqUrl.pathname;
  const safePath = path.normalize(path.join(__dirname, relPath));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const stat = await fs.stat(safePath);
    const filePath = stat.isDirectory() ? path.join(safePath, "index.html") : safePath;
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`OmniSell Free PWA running at http://localhost:${PORT}`);
});
