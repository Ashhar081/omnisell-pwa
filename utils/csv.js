function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("late") || s.includes("delay") || s.includes("overdue") || s.includes("breach")) {
    return "Late";
  }
  if (s.includes("reject") || s.includes("cancel") || s.includes("rto") || s.includes("return") || s.includes("fail")) {
    return "Rejected";
  }
  if (s.includes("deliver") || s.includes("complet") || s.includes("shipped")) {
    return "Delivered";
  }
  return "On Time";
}

function findCol(headers, candidates) {
  const lowered = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const cand of candidates) {
    const idx = lowered.findIndex((h) => h.includes(cand));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseOrdersCsv(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV फ़ाइल में कम से कम हेडर और 1 ऑर्डर लाइन होनी चाहिए।");
  }

  const headers = splitCsvLine(lines[0]);
  const idIdx = findCol(headers, ["orderid", "orderno", "order", "id"]);
  const itemIdx = findCol(headers, ["product", "item", "title", "sku", "name"]);
  const amountIdx = findCol(headers, ["amount", "total", "price", "revenue", "value"]);
  const statusIdx = findCol(headers, ["status", "orderstatus", "state"]);
  const noteIdx = findCol(headers, ["note", "reason", "sla", "remark", "delay"]);
  const dateIdx = findCol(headers, ["date", "purchasedate", "createdat", "orderdate"]);

  if (idIdx === -1 && itemIdx === -1) {
    throw new Error("Order ID या Product कॉलम नहीं मिला। कृपया सैंपल CSV फ़ॉर्मेट देखें।");
  }

  const orders = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.every((c) => !c)) continue;

    const rawAmount = amountIdx !== -1 ? cols[amountIdx] : "0";
    const parsedAmount = Number(String(rawAmount).replace(/[^0-9.-]/g, "")) || 0;
    const rawDate = dateIdx !== -1 ? cols[dateIdx] : "";
    const parsedDate = rawDate && !Number.isNaN(Date.parse(rawDate))
      ? new Date(rawDate).toISOString()
      : new Date().toISOString();

    orders.push({
      id: (idIdx !== -1 && cols[idIdx]) || `IMP-${Date.now().toString().slice(-4)}-${i}`,
      item: (itemIdx !== -1 && cols[itemIdx]) || "Imported Item",
      amount: parsedAmount,
      status: normalizeStatus(statusIdx !== -1 ? cols[statusIdx] : "On Time"),
      note: (noteIdx !== -1 && cols[noteIdx]) || "Imported via CSV",
      date: parsedDate
    });
  }
  return orders;
}

export function buildSampleCsv(storeName = "Amazon.ca") {
  const today = new Date().toISOString().slice(0, 10);
  return [
    "Order ID,Product,Amount,Status,SLA Note,Order Date",
    `CSV-1001,${storeName} Wireless Mouse,49.99,On Time,Dispatch scheduled today,${today}`,
    `CSV-1002,${storeName} USB-C Hub,64.50,Late,Dispatch overdue by 2 hours,${today}`,
    `CSV-1003,${storeName} Phone Stand,24.00,Rejected,Cancelled by customer,${today}`,
    `CSV-1004,${storeName} Laptop Sleeve,39.99,Delivered,Delivered on time,${today}`
  ].join("\n");
}
