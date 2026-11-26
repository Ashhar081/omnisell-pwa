# OmniSell — 100% Free Global E-Commerce Seller Hub (PWA)

Apple-inspired Progressive Web App (PWA) built with zero paid services or external dependencies. Works smoothly on **iPhone/iPad Safari ("Add to Home Screen")**, **Android Chrome**, and **Desktop**.

## Features
- **My Connected Stores**: Unified dashboard with Today / 7-Day / 30-Day metrics, multi-currency conversion (INR, USD, CAD, GBP, EUR), Orders, Revenue, Rejected, and Late SLA counts.
- **Store Details Drill-Down**: Click any store (`Amazon.ca`, `eBay US`, `Flipkart`, `Meesho`, etc.) to view Today's Orders, Revenue, Rejected, and Late shipments, filter by status, and update order status.
- **Global Marketplace Directory**: 18 worldwide marketplaces across North America, India, Europe, Middle East, and Global.
- **100% Free Hybrid Sync**:
  - **CSV Report Import** for Amazon (US/CA/IN/UK/DE/AE/MX), Meesho, Walmart, Etsy, Shopify, etc.
  - **Free Official APIs** support for **eBay Sell API** (5,000 free calls/day) and **Flipkart Seller API v3** (free).

## Run Locally
```bash
cd /data/user/0/ai.antigem/files/home/projects/jarvis/omnisell-pwa
node server.mjs
```
Then open `http://localhost:4173` in your browser.

## Free Public Hosting (For iPhone Safari "Add to Home Screen")
Upload this `omnisell-pwa` folder to any free static host:
- **GitHub Pages** (free)
- **Cloudflare Pages** (free)
- **Vercel / Netlify** (free tier)

On iPhone Safari, open the hosted HTTPS URL → tap **Share** → **Add to Home Screen**.
