# OptiCart

A grocery price-comparison web app for Cal Poly students, built with Next.js and Supabase. OptiCart lets users search products, compare prices across local San Luis Obispo stores, save a grocery list, and run a one-click **Optimize** to find the single cheapest store for their whole list.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with the React Compiler enabled
- **UI**: React 19, Tailwind CSS 4, Cal Poly brand colors
- **Backend / Auth / DB**: Supabase (PostgreSQL + Auth)
- **Live prices**: Kroger Products API (Ralphs + Food 4 Less, SLO)
- **Language**: JavaScript (JSX)

## Architecture

```
307-big-ballers/
├── next.config.mjs                # React Compiler + remote image domains
├── eslint.config.mjs
├── postcss.config.mjs
├── jsconfig.json                  # "@/*" path alias -> src/*
└── src/
    ├── app/
    │   ├── layout.js              # Root layout — fonts, metadata, AppShell
    │   ├── globals.css            # Cal Poly brand tokens + helpers
    │   ├── page.js                # Home (/) — Optimize + Best Deals + categories
    │   ├── search/page.js         # Search results (/search) — sort/filter + list
    │   ├── product/page.js        # Product detail (/product) — price table + chart
    │   ├── login/page.js          # Login / signup (/login)
    │   ├── grocery-list/page.js   # Saved grocery list (/grocery-list)
    │   ├── auth/callback/page.js  # Supabase auth callback (/auth/callback)
    │   ├── api/
    │   │   ├── products/route.js  # GET /api/products — search + Kroger merge
    │   │   └── deals/route.js     # GET /api/deals — top deals by savings
    │   └── components/
    │       ├── AppShell.js        # Navbar + Sidebar + Footer wrapper
    │       ├── Navbar.js          # Top bar — logo, search, auth
    │       ├── Sidebar.js         # Left nav + mobile drawer
    │       ├── Footer.js
    │       ├── AuthButton.js      # Login / sign-out button
    │       ├── DealCard.js        # Best-deals card (+ skeleton)
    │       ├── ResultCard.js      # Expandable search result row
    │       ├── StorePanel.js      # Slide-in store info panel
    │       ├── ProductPlaceholder.js
    │       ├── PriceHistoryChart.js  # Current price-by-store bars
    │       ├── CategoryChip.js
    │       ├── CalPolyBadge.js
    │       ├── SearchBar.js
    │       ├── icons.js           # Inline SVG icon set
    │       ├── constants.js       # CATEGORIES, STORE_NAMES, getStoreName
    │       ├── utils.js           # Formatting + sessionStorage helpers
    │       ├── constants.test.mjs # node:test unit tests
    │       └── utils.test.mjs     # node:test unit tests
    └── lib/
        ├── supabase.js            # Supabase client (getSupabase + supabase)
        └── kroger.js              # Kroger API helper (server-side only)
```
<img width="298" height="680" alt="uml" src="https://github.com/user-attachments/assets/964e4e82-5b4f-4d61-a218-06683f00949a" />


## Testing
See coverage folder

## UI Prototype
<img width="1672" height="941" alt="image" src="https://github.com/user-attachments/assets/679e0eaa-d18f-4bd9-bbf7-48851bbe19bf" />
We kept the features but not the design nor the device type

## API Routes

### `GET /api/products`

Returns matched products from Supabase merged with live Kroger results in a unified shape. Supabase and Kroger are fetched in parallel.

**Response layout for our items**:
```json
[
  {
    "name": "Clover Sonoma Whole Milk",
    "category": "Dairy",
    "unit": "1 gal",
    "image_url": null,
    "prices": [
      {
        "price": 4.99,
        "original_price": 5.99,
        "scraped_at": "2025-05-09T21:00:00Z",
        "store_id": "d509a460-ad97-4099-a6df-d03798e03d6d"
      },
      {
        "price": 4.49,
        "original_price": null,
        "scraped_at": null,
        "store_id": null,
        "store_name": "Ralphs",
        "source": "kroger"
      }
    ]
  }
]
```

### `GET /api/deals`

Returns the top 9 products with the biggest savings (`original_price - price`), one row per product (highest-savings store wins), sorted by savings descending. Cached with `s-maxage=60, stale-while-revalidate=120` (`revalidate = 60`).

**Response layout for deals**:
```json
[
  {
    "product_id": 12,
    "name": "Chobani Greek Yogurt",
    "unit": "32 oz",
    "image_url": null,
    "price": "2.50",
    "original_price": "3.99",
    "savings": "1.49",
    "store_name": "Sprouts Farmers Market",
    "store_id": "d509a460-ad97-4099-a6df-d03798e03d6d"
  }
]
```

## Features

- ### Optimize (cheapest store for your list)

- ### Best Deals Today

- ### Search + Sort & Filter

- ### Product Detail (`/product`)

- ### Grocery List

- ### Store Info Panel

- ### Kroger Live Prices

- ### Categories & Stores


## Environment Variables (fill if u plan on running locally lol)

| Variable                        | Description                                            |
|---------------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                               |
| `KROGER_CLIENT_ID`              | Kroger API client ID (server-only)                     |
| `KROGER_CLIENT_SECRET`          | Kroger API client secret (server-only)                 |
| `KROGER_ENV`                    | Optional. `prod` uses the production Kroger host        |
