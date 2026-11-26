export const FX_TO_INR = {
  INR: 1,
  USD: 84.5,
  CAD: 60.2,
  GBP: 107.0,
  EUR: 91.5,
  AED: 23.0,
  MXN: 4.15
};

export const CURRENCY_SYMBOL = {
  INR: "₹",
  USD: "$",
  CAD: "C$",
  GBP: "£",
  EUR: "€",
  AED: "AED ",
  MXN: "MX$"
};

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function daysAgo(d) {
  return new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();
}

export const GLOBAL_PLATFORMS = [
  {
    id: "amazon-ca",
    name: "Amazon.ca",
    region: "North America",
    country: "Canada",
    currency: "CAD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon SP-API के लिए Professional प्लान की शर्त होती है, इसलिए 100% फ्री CSV रिपोर्ट सिंक सक्रिय है।",
    defaultConnected: true,
    seedOrders: [
      { id: "CA-702-9182", item: "Wireless Earbuds Pro", amount: 89.99, status: "Late", note: "Dispatch overdue by 3h 20m", date: hoursAgo(4) },
      { id: "CA-702-9185", item: "USB-C Fast Hub 7-in-1", amount: 45.50, status: "Rejected", note: "Buyer cancelled before pickup", date: hoursAgo(5) },
      { id: "CA-702-9191", item: "Ergonomic Laptop Stand", amount: 64.00, status: "On Time", note: "Ship within 4h", date: hoursAgo(2) },
      { id: "CA-702-9198", item: "Smart Desk Lamp", amount: 72.00, status: "Late", note: "Carrier pickup delayed", date: hoursAgo(6) },
      { id: "CA-702-9204", item: "Mechanical Keycaps Set", amount: 39.99, status: "Delivered", note: "Completed on SLA", date: hoursAgo(7) },
      { id: "CA-702-9110", item: "MagSafe Desk Charger", amount: 54.00, status: "Delivered", note: "Delivered on time", date: daysAgo(2) },
      { id: "CA-702-9072", item: "Aluminum Phone Dock", amount: 38.00, status: "Rejected", note: "Returned in transit", date: daysAgo(4) },
      { id: "CA-702-8941", item: "Noise Cancelling Headset", amount: 159.00, status: "Delivered", note: "Completed", date: daysAgo(12) }
    ]
  },
  {
    id: "ebay-us",
    name: "eBay US",
    region: "North America",
    country: "USA",
    currency: "USD",
    integrationMode: "free_api",
    apiLabel: "Free eBay Sell API (5,000/day)",
    apiNote: "eBay Developers Program पूरी तरह फ्री है — रोज़ 5,000 API कॉल्स फ्री मिलती हैं।",
    defaultConnected: true,
    seedOrders: [
      { id: "EB-441-0912", item: "Vintage Camera Lens 50mm", amount: 145.00, status: "Late", note: "Tracking upload due in 1h", date: hoursAgo(3) },
      { id: "EB-441-0919", item: "Leather Watch Strap", amount: 34.00, status: "On Time", note: "Label printed", date: hoursAgo(1) },
      { id: "EB-441-0923", item: "Bluetooth Speaker Mini", amount: 58.00, status: "Rejected", note: "Payment verification failed", date: hoursAgo(5) },
      { id: "EB-441-0930", item: "Gaming Mouse Pad XL", amount: 22.50, status: "Delivered", note: "Delivered early", date: hoursAgo(6) },
      { id: "EB-441-0880", item: "USB Condenser Mic", amount: 79.00, status: "Delivered", note: "Completed", date: daysAgo(3) },
      { id: "EB-441-0812", item: "Studio Monitor Stand", amount: 62.00, status: "Late", note: "Delayed carrier scan", date: daysAgo(5) },
      { id: "EB-441-0755", item: "DSLR Battery Grip", amount: 48.00, status: "Delivered", note: "Completed", date: daysAgo(15) }
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "free_api",
    apiLabel: "Free Flipkart Seller API v3",
    apiNote: "Flipkart Marketplace Seller API पूरी तरह फ्री है (एक्टिव GSTIN/Seller अकाउंट पर)।",
    defaultConnected: true,
    seedOrders: [
      { id: "OD-3319-8821", item: "Cotton Kurta Set", amount: 1299, status: "Late", note: "RTD breach by 2h", date: hoursAgo(4) },
      { id: "OD-3319-8834", item: "Stainless Bottle 1L", amount: 649, status: "On Time", note: "Pickup scheduled 5 PM", date: hoursAgo(2) },
      { id: "OD-3319-8840", item: "Bluetooth Neckband", amount: 1499, status: "Rejected", note: "Address unserviceable", date: hoursAgo(5) },
      { id: "OD-3319-8847", item: "LED Study Light", amount: 899, status: "Delivered", note: "Handed over to Ekart", date: hoursAgo(8) },
      { id: "OD-3319-8790", item: "Laptop Backpack 28L", amount: 1599, status: "Delivered", note: "Delivered", date: daysAgo(2) },
      { id: "OD-3319-8612", item: "Wireless Keyboard Combo", amount: 1899, status: "Rejected", note: "RTO customer unavailable", date: daysAgo(6) },
      { id: "OD-3319-8402", item: "Ceramic Coffee Mug Set", amount: 549, status: "Delivered", note: "Completed", date: daysAgo(18) }
    ]
  },
  {
    id: "meesho",
    name: "Meesho",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Meesho पब्लिक सेल्फ-सर्व API नहीं देता, इसलिए फ्री CSV/Excel रिपोर्ट अपलोड इस्तेमाल होता है।",
    defaultConnected: true,
    seedOrders: [
      { id: "MS-992-1102", item: "Printed Bedsheet Queen", amount: 489, status: "Rejected", note: "COD RTO / Cancelled", date: hoursAgo(3) },
      { id: "MS-992-1108", item: "Kitchen Spice Rack", amount: 349, status: "Late", note: "Manifest pending", date: hoursAgo(4) },
      { id: "MS-992-1114", item: "Men's Sports Tee", amount: 299, status: "On Time", note: "Packed & ready", date: hoursAgo(1) },
      { id: "MS-992-1122", item: "Wall Clock Modern", amount: 599, status: "Delivered", note: "Completed", date: hoursAgo(6) },
      { id: "MS-992-1091", item: "Cotton Dupatta Pack", amount: 429, status: "On Time", note: "Ready to ship", date: hoursAgo(2) },
      { id: "MS-992-1020", item: "Silicone Cookware Set", amount: 749, status: "Delivered", note: "Completed", date: daysAgo(3) },
      { id: "MS-992-0950", item: "Kids Hoodie Fleece", amount: 529, status: "Rejected", note: "Size exchange cancelled", date: daysAgo(11) }
    ]
  },
  {
    id: "amazon-us",
    name: "Amazon.com (US)",
    region: "North America",
    country: "USA",
    currency: "USD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon US ऑर्डर रिपोर्ट्स CSV से बिना किसी पेड प्लान के सिंक करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "US-112-8810", item: "Portable SSD 1TB", amount: 94.99, status: "On Time", note: "Ready for carrier", date: hoursAgo(2) },
      { id: "US-112-8814", item: "Desk Mat Felt", amount: 29.99, status: "Late", note: "Shipment scan pending", date: hoursAgo(5) },
      { id: "US-112-8700", item: "USB-C GaN Charger 65W", amount: 42.00, status: "Delivered", note: "Completed", date: daysAgo(2) }
    ]
  },
  {
    id: "amazon-in",
    name: "Amazon.in",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon India Seller Central से ऑर्डर रिपोर्ट CSV अपलोड करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "IN-404-3311", item: "Smart Plug 16A", amount: 999, status: "On Time", note: "Easy Ship ready", date: hoursAgo(2) },
      { id: "IN-404-3318", item: "Tripod Stand", amount: 1199, status: "Rejected", note: "Cancelled by customer", date: hoursAgo(4) }
    ]
  },
  {
    id: "amazon-uk",
    name: "Amazon.co.uk",
    region: "Europe",
    country: "UK",
    currency: "GBP",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon UK ऑर्डर रिपोर्ट्स फ्री में सिंक करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "UK-205-7721", item: "Travel Adapter UK/EU", amount: 24.99, status: "On Time", note: "Dispatched", date: hoursAgo(3) }
    ]
  },
  {
    id: "amazon-de",
    name: "Amazon.de",
    region: "Europe",
    country: "Germany",
    currency: "EUR",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon Germany ऑर्डर रिपोर्ट्स फ्री में सिंक करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "DE-309-1188", item: "Insulated Mug 500ml", amount: 29.00, status: "On Time", note: "On schedule", date: hoursAgo(3) }
    ]
  },
  {
    id: "amazon-ae",
    name: "Amazon.ae",
    region: "Middle East",
    country: "UAE",
    currency: "AED",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon UAE ऑर्डर रिपोर्ट्स फ्री में सिंक करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "AE-501-1201", item: "Wireless Car Charger", amount: 115.00, status: "On Time", note: "Ready", date: hoursAgo(4) }
    ]
  },
  {
    id: "amazon-mx",
    name: "Amazon.com.mx",
    region: "North America",
    country: "Mexico",
    currency: "MXN",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Amazon Mexico ऑर्डर रिपोर्ट्स फ्री में सिंक करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "MX-801-4402", item: "Phone Tripod Mini", amount: 420.00, status: "Delivered", note: "Completed", date: daysAgo(1) }
    ]
  },
  {
    id: "ebay-uk",
    name: "eBay UK",
    region: "Europe",
    country: "UK",
    currency: "GBP",
    integrationMode: "free_api",
    apiLabel: "Free eBay Sell API (5,000/day)",
    apiNote: "eBay Developers Program का फ्री API टियर सपोर्ट।",
    defaultConnected: false,
    seedOrders: [
      { id: "EBUK-9912", item: "Retro Game Controller", amount: 32.00, status: "On Time", note: "Royal Mail label ready", date: hoursAgo(2) }
    ]
  },
  {
    id: "ebay-ca",
    name: "eBay Canada",
    region: "North America",
    country: "Canada",
    currency: "CAD",
    integrationMode: "free_api",
    apiLabel: "Free eBay Sell API (5,000/day)",
    apiNote: "eBay Canada फ्री API और CSV दोनों को सपोर्ट करता है।",
    defaultConnected: false,
    seedOrders: [
      { id: "EBCA-2110", item: "Winter Cycling Gloves", amount: 44.00, status: "Late", note: "Dispatch due today", date: hoursAgo(5) }
    ]
  },
  {
    id: "walmart",
    name: "Walmart Marketplace",
    region: "North America",
    country: "USA / Canada",
    currency: "USD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Walmart Seller Center से CSV एक्सपोर्ट इम्पोर्ट करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "WM-881-4402", item: "Air Fryer Liner Pack", amount: 18.50, status: "Late", note: "Due in 45m", date: hoursAgo(3) }
    ]
  },
  {
    id: "etsy",
    name: "Etsy",
    region: "Global",
    country: "Worldwide",
    currency: "USD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Etsy Shop Manager से Orders CSV इम्पोर्ट करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "ET-512-9012", item: "Handmade Brass Tray", amount: 54.00, status: "On Time", note: "Custom order", date: hoursAgo(4) }
    ]
  },
  {
    id: "shopify",
    name: "Shopify Store",
    region: "Global",
    country: "Worldwide",
    currency: "USD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Shopify Orders CSV एक्सपोर्ट इम्पोर्ट करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "SH-1042", item: "Skincare Combo Kit", amount: 68.00, status: "Delivered", note: "Fulfilled", date: hoursAgo(5) }
    ]
  },
  {
    id: "myntra",
    name: "Myntra",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "Myntra Partner Portal रिपोर्ट इम्पोर्ट करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "MYN-7731", item: "Denim Jacket Slim", amount: 2199, status: "On Time", note: "Packed", date: hoursAgo(3) }
    ]
  },
  {
    id: "jiomart",
    name: "JioMart",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "JioMart Seller रिपोर्ट इम्पोर्ट करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "JM-2281", item: "Stainless Lunch Box", amount: 799, status: "Delivered", note: "Completed", date: daysAgo(1) }
    ]
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    region: "Global",
    country: "Worldwide",
    currency: "USD",
    integrationMode: "csv_report",
    apiLabel: "CSV Report Sync (100% Free)",
    apiNote: "AliExpress ऑर्डर एक्सपोर्ट CSV अपलोड करें।",
    defaultConnected: false,
    seedOrders: [
      { id: "AE-661-2301", item: "Phone Gimbal Mount", amount: 38.00, status: "Late", note: "Customs label pending", date: hoursAgo(6) }
    ]
  }
];
