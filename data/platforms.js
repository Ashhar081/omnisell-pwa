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
    dashboardUrl: "https://sellercentral.amazon.ca/",
    ordersUrl: "https://sellercentral.amazon.ca/orders-v3",
    defaultConnected: false,
    seedOrders: [
      { id: "CA-702-9182", item: "Wireless Earbuds Pro", amount: 89.99, status: "Late", note: "Dispatch overdue by 3h 20m", date: hoursAgo(4) },
      { id: "CA-702-9185", item: "USB-C Fast Hub 7-in-1", amount: 45.50, status: "Rejected", note: "Buyer cancelled before pickup", date: hoursAgo(5) },
      { id: "CA-702-9191", item: "Ergonomic Laptop Stand", amount: 64.00, status: "On Time", note: "Ship within 4h", date: hoursAgo(2) },
      { id: "CA-702-9198", item: "Smart Desk Lamp", amount: 72.00, status: "Late", note: "Carrier pickup delayed", date: hoursAgo(6) },
      { id: "CA-702-9204", item: "Mechanical Keycaps Set", amount: 39.99, status: "Delivered", note: "Completed on SLA", date: hoursAgo(7) },
      { id: "CA-702-9110", item: "MagSafe Desk Charger", amount: 54.00, status: "Delivered", note: "Delivered on time", date: daysAgo(2) }
    ]
  },
  {
    id: "ebay-us",
    name: "eBay US",
    region: "North America",
    country: "USA",
    currency: "USD",
    integrationMode: "free_api",
    dashboardUrl: "https://www.ebay.com/sh/ovw",
    ordersUrl: "https://www.ebay.com/sh/ord/",
    defaultConnected: false,
    seedOrders: [
      { id: "EB-441-0912", item: "Vintage Camera Lens 50mm", amount: 145.00, status: "Late", note: "Tracking upload due in 1h", date: hoursAgo(3) },
      { id: "EB-441-0919", item: "Leather Watch Strap", amount: 34.00, status: "On Time", note: "Label printed", date: hoursAgo(1) },
      { id: "EB-441-0923", item: "Bluetooth Speaker Mini", amount: 58.00, status: "Rejected", note: "Payment verification failed", date: hoursAgo(5) },
      { id: "EB-441-0930", item: "Gaming Mouse Pad XL", amount: 22.50, status: "Delivered", note: "Delivered early", date: hoursAgo(6) }
    ]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "free_api",
    dashboardUrl: "https://seller.flipkart.com/",
    ordersUrl: "https://seller.flipkart.com/",
    defaultConnected: false,
    seedOrders: [
      { id: "OD-3319-8821", item: "Cotton Kurta Set", amount: 1299, status: "Late", note: "RTD breach by 2h", date: hoursAgo(4) },
      { id: "OD-3319-8834", item: "Stainless Bottle 1L", amount: 649, status: "On Time", note: "Pickup scheduled 5 PM", date: hoursAgo(2) },
      { id: "OD-3319-8840", item: "Bluetooth Neckband", amount: 1499, status: "Rejected", note: "Address unserviceable", date: hoursAgo(5) },
      { id: "OD-3319-8847", item: "LED Study Light", amount: 899, status: "Delivered", note: "Handed over to Ekart", date: hoursAgo(8) }
    ]
  },
  {
    id: "meesho",
    name: "Meesho",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    dashboardUrl: "https://supplier.meesho.com/",
    ordersUrl: "https://supplier.meesho.com/panel/v3/new/orders",
    defaultConnected: false,
    seedOrders: [
      { id: "MS-992-1102", item: "Printed Bedsheet Queen", amount: 489, status: "Rejected", note: "COD RTO / Cancelled", date: hoursAgo(3) },
      { id: "MS-992-1108", item: "Kitchen Spice Rack", amount: 349, status: "Late", note: "Manifest pending", date: hoursAgo(4) },
      { id: "MS-992-1114", item: "Men's Sports Tee", amount: 299, status: "On Time", note: "Packed & ready", date: hoursAgo(1) },
      { id: "MS-992-1122", item: "Wall Clock Modern", amount: 599, status: "Delivered", note: "Completed", date: hoursAgo(6) }
    ]
  },
  {
    id: "amazon-us",
    name: "Amazon.com",
    region: "North America",
    country: "USA",
    currency: "USD",
    integrationMode: "csv_report",
    dashboardUrl: "https://sellercentral.amazon.com/",
    ordersUrl: "https://sellercentral.amazon.com/orders-v3",
    defaultConnected: false,
    seedOrders: [
      { id: "US-112-8810", item: "Portable SSD 1TB", amount: 94.99, status: "On Time", note: "Ready for carrier", date: hoursAgo(2) },
      { id: "US-112-8814", item: "Desk Mat Felt", amount: 29.99, status: "Late", note: "Shipment scan pending", date: hoursAgo(5) }
    ]
  },
  {
    id: "amazon-in",
    name: "Amazon.in",
    region: "India",
    country: "India",
    currency: "INR",
    integrationMode: "csv_report",
    dashboardUrl: "https://sellercentral.amazon.in/",
    ordersUrl: "https://sellercentral.amazon.in/orders-v3",
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
    dashboardUrl: "https://sellercentral.amazon.co.uk/",
    ordersUrl: "https://sellercentral.amazon.co.uk/orders-v3",
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
    dashboardUrl: "https://sellercentral.amazon.de/",
    ordersUrl: "https://sellercentral.amazon.de/orders-v3",
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
    dashboardUrl: "https://sellercentral.amazon.ae/",
    ordersUrl: "https://sellercentral.amazon.ae/orders-v3",
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
    dashboardUrl: "https://sellercentral.amazon.com.mx/",
    ordersUrl: "https://sellercentral.amazon.com.mx/orders-v3",
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
    dashboardUrl: "https://www.ebay.co.uk/sh/ovw",
    ordersUrl: "https://www.ebay.co.uk/sh/ord/",
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
    dashboardUrl: "https://www.ebay.ca/sh/ovw",
    ordersUrl: "https://www.ebay.ca/sh/ord/",
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
    dashboardUrl: "https://seller.walmart.com/",
    ordersUrl: "https://seller.walmart.com/orders",
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
    dashboardUrl: "https://www.etsy.com/your/shops/me/dashboard",
    ordersUrl: "https://www.etsy.com/your/orders/sold",
    defaultConnected: false,
    seedOrders: [
      { id: "ET-512-9012", item: "Handmade Brass Tray", amount: 54.00, status: "On Time", note: "Custom order", date: hoursAgo(4) }
    ]
  },
  {
    id: "shopify",
    name: "Shopify",
    region: "Global",
    country: "Worldwide",
    currency: "USD",
    integrationMode: "csv_report",
    dashboardUrl: "https://admin.shopify.com/",
    ordersUrl: "https://admin.shopify.com/orders",
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
    dashboardUrl: "https://partners.myntra.com/",
    ordersUrl: "https://partners.myntra.com/",
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
    dashboardUrl: "https://seller.jiomart.com/",
    ordersUrl: "https://seller.jiomart.com/",
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
    dashboardUrl: "https://gsp.aliexpress.com/",
    ordersUrl: "https://gsp.aliexpress.com/",
    defaultConnected: false,
    seedOrders: [
      { id: "AE-661-2301", item: "Phone Gimbal Mount", amount: 38.00, status: "Late", note: "Customs label pending", date: hoursAgo(6) }
    ]
  }
];
