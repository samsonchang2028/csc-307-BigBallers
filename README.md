# OptiCart

A grocery price-comparison web app for Cal Poly students, built with Next.js and Supabase. OptiCart lets users search products, compare prices across local San Luis Obispo stores, save a grocery list, and run a one-click **Optimize** to find the single cheapest store for their whole list.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with the React Compiler enabled
- **UI**: React 19, Tailwind CSS 4, Cal Poly brand colors
- **Backend / Auth / DB**: Supabase (PostgreSQL + Auth)
- **Live prices**: Kroger Products API (Ralphs + Food 4 Less, SLO)
- **Language**: JavaScript (JSX)

## Project Structure

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

## Pages

| Route            | Description                                                                        |
|------------------|------------------------------------------------------------------------------------|
| `/`              | Home — category chips, **Optimize** (cheapest store for your list), Best Deals grid |
| `/search`        | Search results — sort & filter popover, per-store price columns, expandable rows   |
| `/product`       | Full product detail — price comparison table, "best time to buy", price-by-store chart |
| `/login`         | Email/password login and signup via Supabase Auth                                  |
| `/grocery-list`  | Saved list with quantities, per-item price breakdown, and a store filter           |
| `/auth/callback` | Supabase auth redirect handler                                                     |

> Note: product detail is a dedicated `/product` page. The selected product is handed off via `sessionStorage` (`saveProductForDetail` / `loadProductForDetail` in `utils.js`), so opening `/product` directly redirects back to `/search`.

## API Routes

### `GET /api/products`

Returns matched products from Supabase merged with live Kroger results in a unified shape. Supabase and Kroger are fetched in parallel.

**Query params** (one required):
- `q` — free-text search across product `name` and `category`
- `category` — exact category filter (e.g. `Dairy`, `Meat & Seafood`)

Supabase prices are deduplicated to the latest `scraped_at` per `store_id`. Kroger items are normalized to the same shape with `source: "kroger"` and `store_name` set (no `store_id`).

**Response**:
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

**Response**:
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

### Optimize (cheapest store for your list)
On the home page, **Optimize** fetches a price match for every item in your grocery list (respecting saved quantities), sums each store's total, and ranks stores by **most items covered**, breaking ties by **lowest total cost**. The result shows the winning store plus a full table of every store's estimated total and which items it is missing.

### Best Deals Today
The home page shows a grid of the top deals from `/api/deals`. Each `DealCard` shows the product, price in Poly Green, store name (clickable → `StorePanel`), and a savings badge. Clicking a card opens the `/product` detail page.

### Search + Sort & Filter
`/search` reads `?q=` or `?category=` from the URL (category chips deep-link here). A popover supports:
- **Sort**: Relevance, Price Low→High / High→Low, **Unit Price** Low→High / High→Low
- **Stores**: toggle any of the 7 stores on/off
- **Max price** cap

Unit-price sorting parses a quantity from the product name (`ct`, `oz`, `lb`, `g`, `ml`, `pack`, etc.) and assumes 1 lb for Meat, Fruit, and Vegetables when no unit is present.

### Product Detail (`/product`)
- Price comparison table (Store / Current / Regular / Last Updated), cheapest row highlighted
- "Best time to buy" callout when the cheapest price is below the cross-store average
- `PriceHistoryChart` — horizontal bars of the current price at each store (no fabricated history)
- Spec cards for Brand, Category, and Size

### Grocery List
Authenticated users add items from search/detail to the Supabase `grocery_list` table (with `quantity`). The list page supports inline quantity steppers, expandable per-item price breakdowns, a "Why this price?" explanation, and a store filter that greys out items unavailable at the checked stores. Changes are batched and saved with **Save Changes**.

### Store Info Panel
Clicking any store name opens `StorePanel`, a slide-in drawer with address, phone, hours, tags, and website. Store details are defined in `StorePanel.js`.

### Kroger Live Prices
`lib/kroger.js` fetches live prices from Ralphs and Food 4 Less (SLO) in parallel, using client-credentials OAuth with a cached token. Results are normalized into the standard product shape. Requires `KROGER_CLIENT_ID` / `KROGER_CLIENT_SECRET`; `KROGER_ENV=prod` switches from the certification host to production.

### Categories & Stores
Category chips (`constants.js`): **Dairy, Produce (Fruit), Meat (Meat & Seafood), Bakery, Pantry (Grains & Pasta), Snacks** — the chip label can differ from the DB category it queries.

Stores (`STORE_NAMES`): **Sprouts Farmers Market, Smart & Final, Grocery Outlet, Cal Fresh, Trader Joe's, Ralphs, Food 4 Less**. The first five are Supabase UUIDs; Ralphs/Food 4 Less use synthetic IDs (`kroger-ralphs`, `kroger-food4less`).

## Branding

Cal Poly official brand colors (CSS tokens in `globals.css`):
- **Poly Green** `#154734` — primary actions, prices, active states
- **Mustang Gold** `#BD8B13` — accent
- **Stadium Gold** `#F8E08E`
- **Savings Green** `#e8f5ec` / text `#1a6b42` — savings highlights

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with:
  - `products` (`id`, `name`, `category`, `unit`, `image_url`)
  - `prices` (`price`, `original_price`, `scraped_at`, `store_id`, `product_id`)
  - `stores` (`id`, `name`)
  - `grocery_list` (`id`, `user_id`, `product_name`, `quantity`, `created_at`)
  - Email/password auth enabled
- (Optional) Kroger Developer account for live Ralphs / Food 4 Less prices

### Setup

1. Install dependencies:

```bash
cd 307-big-ballers
npm install
```

2. Create `.env.local` inside `307-big-ballers/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KROGER_CLIENT_ID=your_kroger_client_id
KROGER_CLIENT_SECRET=your_kroger_client_secret
# optional: KROGER_ENV=prod
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start development server                 |
| `npm run build`  | Build for production                     |
| `npm run start`  | Start production server                  |
| `npm run lint`   | Run ESLint                               |
| `npm run format` | Format with Prettier                     |

Unit tests use Node's built-in test runner:

```bash
node --test src/app/components/utils.test.mjs src/app/components/constants.test.mjs
```

## Environment Variables

| Variable                        | Description                                            |
|---------------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                               |
| `KROGER_CLIENT_ID`              | Kroger API client ID (server-only)                     |
| `KROGER_CLIENT_SECRET`          | Kroger API client secret (server-only)                 |
| `KROGER_ENV`                    | Optional. `prod` uses the production Kroger host        |

> **Never commit `.env.local`** — it is already in `.gitignore`.

## Data Design Note

Each row in `products` is a store-specific SKU. Products are **not** matched into canonical cross-store items; price comparison shows whatever stores carry that SKU, and Kroger results are appended as additional entries from the live API.

For full technical details, see [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md).
