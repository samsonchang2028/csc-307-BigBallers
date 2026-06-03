# OptiCart — Technical Documentation

This document describes the actual implementation of OptiCart as found in `307-big-ballers/src`. It is derived directly from the source code.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Data Model](#data-model)
4. [API Routes](#api-routes)
5. [Library Layer (`src/lib`)](#library-layer-srclib)
6. [Pages (`src/app`)](#pages-srcapp)
7. [Components (`src/app/components`)](#components-srcappcomponents)
8. [Constants & Utilities](#constants--utilities)
9. [Styling & Theme](#styling--theme)
10. [Testing](#testing)
11. [Configuration](#configuration)

---

## Architecture Overview

OptiCart is a Next.js 16 App Router application. The UI is almost entirely client-rendered (`'use client'`), while two server route handlers (`/api/products`, `/api/deals`) talk to Supabase and the Kroger API.

```
Browser (React 19 client components)
   │
   ├── supabase-js (auth + grocery_list reads/writes, direct from browser)
   │
   └── fetch /api/* ──► Next.js route handlers (server)
                              ├── Supabase (products, prices, stores)
                              └── Kroger Products API (live SLO prices)
```

Key architectural points:

- **Two Supabase access paths.** Client components import the browser singleton `supabase` from `lib/supabase.js`. Server route handlers call `getSupabase()` from the same module. Both use the public anon key.
- **No canonical product matching.** Each `products` row is a store-specific SKU. Comparison simply shows whichever stores carry that SKU, plus live Kroger entries appended on the fly.
- **Product hand-off via `sessionStorage`.** There is no `/product/[id]` dynamic route. The selected product object is serialized into `sessionStorage` before navigating to `/product`.

---

## Data Flow

### Search flow
1. User types in the `Navbar` search box → navigates to `/search?q=...`. Category chips on the home page navigate to `/search?category=...`.
2. `search/page.js` (`HomeInner`) reads `q` / `category` from the URL and calls `GET /api/products`.
3. The route handler queries Supabase **and** Kroger in parallel, dedupes Supabase prices, normalizes Kroger items, and returns a merged array.
4. The page applies client-side store filtering, max-price cap, and sorting, then renders `ResultCard`s.

### Deals flow
1. Home page (`page.js`) calls `GET /api/deals` on mount.
2. The route handler pulls priced rows with a non-null `original_price`, computes savings, keeps the highest-savings row per product, and returns the top 9.
3. Each deal renders a `DealCard`; clicking one stores the product and routes to `/product`.

### Optimize flow
1. On mount, the home page loads the user's `grocery_list` (names + quantities) from Supabase.
2. Clicking **OPTIMIZE** fetches a product match per item via `GET /api/products?q=<name>` in parallel.
3. For each store, it takes the cheapest price per item, multiplies by quantity, and accumulates a per-store total and covered-item count.
4. Stores are ranked by **items covered (desc)**, tie-broken by **total cost (asc)**. The winner and a full breakdown table (totals + missing items) are displayed.

### Grocery list flow
1. `grocery-list/page.js` loads the user's list ordered by `created_at` and eagerly fetches product data for every item so the store-filter grey-out works immediately.
2. Quantity steppers and removals mutate local state and mark the list `dirty`.
3. **Save Changes** deletes removed rows (`.in('id', ...)`) and updates quantities for remaining rows.

---

## Data Model

Supabase/PostgreSQL tables referenced in code:

### `products`
| Column      | Notes                                       |
|-------------|---------------------------------------------|
| `id`        | Primary key (used by `/api/deals`).         |
| `name`      | Product name; also searched in `/api/products`. |
| `category`  | e.g. `Dairy`, `Meat & Seafood`. Searched/filtered. |
| `unit`      | Display size, e.g. `32 oz`.                 |
| `image_url` | Optional image.                             |

### `prices`
| Column           | Notes                                                       |
|------------------|-------------------------------------------------------------|
| `price`          | Current price.                                              |
| `original_price` | Regular price; non-null implies a deal. Used by `/api/deals`. |
| `scraped_at`     | Timestamp used to dedupe to the latest price per store.     |
| `store_id`       | FK to `stores`.                                             |
| `product_id`     | FK to `products` (joined in `/api/deals`).                  |

### `stores`
| Column | Notes                              |
|--------|------------------------------------|
| `id`   | UUID; mapped to display names.     |
| `name` | Joined in `/api/deals`.            |

### `grocery_list`
| Column         | Notes                                  |
|----------------|----------------------------------------|
| `id`           | Primary key.                           |
| `user_id`      | Supabase auth user id.                 |
| `product_name` | Stored by name (not FK).               |
| `quantity`     | Defaults to 1 in UI logic.             |
| `created_at`   | Used for ordering the list.            |

> Note: `grocery_list` keys items by `product_name`, not a product FK. This is why Optimize and the list page re-resolve each item through `/api/products`.

---

## API Routes

### `GET /api/products` — `src/app/api/products/route.js`

**Parameters** (at least one required): `q` or `category`. Missing both → `400`.

**Behavior:**
- Builds a Supabase query selecting `name, category, unit, image_url, prices ( price, original_price, scraped_at, store_id )`.
  - `category` → `.eq("category", category)`.
  - `q` → `.or("name.ilike.%q%,category.ilike.%q%")`.
  - Limited to 50 rows.
- Runs the Supabase query and `searchKrogerProducts(q ?? category)` in parallel via `Promise.all`.
- On Supabase error → `500` with the error.
- **Dedup:** for each product, keeps only the row with the greatest `scraped_at` per `store_id`.
- **Kroger normalization:** each Kroger item becomes a product with a single price entry:
  - `price` = `sale_price ?? price`
  - `original_price` = `sale_price ? price : null`
  - `scraped_at` = `null`, `store_id` = `null`, `store_name` = store, `source` = `"kroger"`.
- Returns `[...dedupedSupabase, ...krogerProducts]`.

### `GET /api/deals` — `src/app/api/deals/route.js`

- `export const revalidate = 60`.
- Selects priced rows joined to `products (id, name, unit, image_url)` and `stores (name)`, filtering `original_price` not null, limit 100.
- Filters to rows where `original_price > price`, computes `savings = (original_price - price).toFixed(2)`.
- Reduces to the **highest-savings row per product** (`product_id ?? name` as key).
- Sorts by savings desc, slices the top **9**.
- Returns with header `Cache-Control: s-maxage=60, stale-while-revalidate=120`.

---

## Library Layer (`src/lib`)

### `supabase.js`
- `getSupabase()` — lazily creates and memoizes a Supabase client from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Used by server route handlers.
- `supabase` — a convenience client created only in the browser (`typeof window !== "undefined"`), otherwise `null`. Used by client components.

### `kroger.js` (server-side only)
- **Host selection:** `KROGER_ENV === "prod"` → `https://api.kroger.com`; otherwise the certification host `https://api-ce.kroger.com`.
- **SLO stores:** `SLO_STORES = [{ 70300133, Ralphs }, { 01400943, Food 4 Less }]`.
- **`getToken()`** — client-credentials OAuth (`scope=product.compact`) with Basic auth from `KROGER_CLIENT_ID:KROGER_CLIENT_SECRET`. Caches the token in module state and refreshes 60s before expiry.
- **`searchKrogerProducts(query)`** — returns `[]` if credentials are missing or on any error. Otherwise queries each SLO store's `/v1/products` (`filter.term`, `filter.locationId`, `filter.limit=10`) in parallel, maps each item to `{ name, price (regular), sale_price (promo), store, source: "kroger", image_url }`, drops items with a null price, and flattens results.

---

## Pages (`src/app`)

### `layout.js`
Root layout. Loads the Inter font (CSS variable `--font-inter`), sets metadata (`title: "OptiCart"`), and wraps all children in `AppShell`.

### `page.js` — Home (`/`)
- Category chip bar (from `CATEGORIES`) deep-links to `/search?category=...`.
- **OPTIMIZE** button and result UI (see [Optimize flow](#optimize-flow)). Holds maps for store totals, item counts, and missing items; renders the winning store with its logo plus a breakdown table.
- **Best Deals Today** grid: 9 `DealCardSkeleton`s while loading, then `DealCard`s from `/api/deals`.
- Maintains `STORE_LOGOS` (UUID/synthetic-id → imported PNG) and `krogerStoreIdMap` (`Ralphs`→`kroger-ralphs`, `Food 4 Less`→`kroger-food4less`).
- Clicking a store name opens `StorePanel`.

### `search/page.js` — Search (`/search`)
- `HomeInner` wrapped in `Suspense` (needs `useSearchParams`).
- Reads `category` or `q`; fetches `/api/products` with a `cancelled` guard against race conditions.
- **Filtering:** `selectedStores` (default all 7) and a numeric `priceCap`. Kroger entries map through `krogerStoreIdMap` for filtering.
- **Sorting** (`sortKey`): `relevance` (no sort), `price-asc/desc`, `unit-asc/desc`. Unit price uses `parseQuantity` (regex over `ct/oz/lb/g/kg/ml/l/pack/...`) and assumes 1 lb for `Meat & Seafood`, `Fruit`, `Vegetables` when no unit is found.
- Auth-gated add/remove to `grocery_list`; unauthenticated users are routed to `/login`.

### `product/page.js` — Product Detail (`/product`)
- Loads the product from `sessionStorage` via `loadProductForDetail()`; if absent, `router.replace("/search")`.
- Sorts prices ascending; cheapest highlighted. Computes the cross-store average and shows a **Best time to buy** callout when the cheapest is below average (with amount and percentage).
- Price comparison table: Store / Current Price / Regular Price / Last Updated (`formatRelativeTime`). Store names open `StorePanel`.
- Renders `PriceHistoryChart` and three `SpecCard`s (Brand via `extractBrand`, Category, Size).
- Add/remove to list checks `grocery_list` by `product_name`.

### `login/page.js` — Login / Signup (`/login`)
- Single form toggling between `login` and `signup` modes.
- `signInWithPassword` on login (→ `/`); `signUp` on signup. Detects already-registered emails (`identities.length === 0`), routes to `/` if a session is returned, otherwise prompts for email confirmation.

### `grocery-list/page.js` — Grocery List (`/grocery-list`)
- Redirects unauthenticated users to `/login`.
- Loads list ordered by `created_at`; eagerly fetches each item's product data into `productCache`.
- Inline quantity steppers (min 1), remove, and expandable per-item breakdown (top 3 stores, cheapest highlighted, "Why this price?" text, last-updated).
- Right-hand **Filter by store** panel greys out items not sold at any checked store.
- **Save Changes** batches deletes + quantity updates.

### `auth/callback/page.js`
Supabase auth redirect handler.

---

## Components (`src/app/components`)

| Component            | Responsibility |
|----------------------|----------------|
| `AppShell`           | App frame. Renders `Navbar` + `Sidebar` + `Footer`; returns bare children on `/login` and `/auth/callback`. Owns the mobile drawer state. |
| `Navbar`             | Sticky top bar: logo, controlled/uncontrolled search box (Enter or click to search), grocery-list link, `AuthButton`. Hidden on `/login` and `/auth/callback`. Wrapped in `Suspense` and re-keyed by path + `q`. |
| `Sidebar`            | Left nav (Home / Search / Grocery List) with active-state styling; static on `md+`, drawer on mobile. Includes a "Built for Cal Poly" card. |
| `Footer`             | Site footer. |
| `AuthButton`         | Subscribes to `onAuthStateChange`; shows Sign out (authenticated) or Log in. |
| `DealCard`           | Best-deals card with image, price, clickable store, and savings badge. Exports `DealCardSkeleton`. |
| `ResultCard`         | Expandable search row: image, unit, cheapest-store tag, up to 3 store price tiles, "Why this price?", last-updated, add-to-list, view-details. First card starts expanded. |
| `StorePanel`         | Slide-in drawer with hard-coded `STORE_DATA` (emoji, address, phone, hours, website, description, tags). Closes on Escape or backdrop click. |
| `ProductPlaceholder` | Image-or-fallback tile (sizes `md`/`lg`). |
| `PriceHistoryChart`  | Horizontal bars of current price per store from `buildPriceHistorySeries` (no fabricated history). |
| `CategoryChip`       | Pill button for category navigation. |
| `CalPolyBadge`       | Cal Poly branding badge. |
| `SearchBar`          | Standalone search input. |
| `icons.js`           | Inline SVG icon set. |

---

## Constants & Utilities

### `constants.js`
- `CATEGORIES` — 6 chips. The display `label` may differ from the DB `query`:
  - Dairy → `Dairy`
  - Produce → `Fruit`
  - Meat → `Meat & Seafood`
  - Bakery → `Bakery`
  - Pantry → `Grains & Pasta`
  - Snacks → `Snacks`
- `STORE_NAMES` — id → display name for 7 stores (5 Supabase UUIDs + `kroger-ralphs`, `kroger-food4less`).
- `getStoreName(id, fallback)` — returns the mapped name, else `fallback`, else `id`, else `"Unknown"`.

### `utils.js`
- `formatRelativeTime(dateStr)` — "Just now" / "N hours ago" / "N days ago" / short date; `"Recently"` when null.
- `extractBrand(name)` — first token of the product name.
- `shortStoreName(name)` — maps full store names to short labels (Sprouts, Ralphs, Trader Joe's, etc.).
- `buildPriceHistorySeries(prices)` — up to 4 cheapest valid prices as `{ store, color, price }` bars.
- `saveProductForDetail(product)` / `loadProductForDetail()` — `sessionStorage` hand-off under key `opticart_product`.

---

## Styling & Theme

Defined as CSS custom properties in `globals.css`:

| Token                     | Value     | Use |
|---------------------------|-----------|-----|
| `--poly-green`            | `#154734` | Primary actions, prices, active states |
| `--poly-green-dark`       | `#0f3326` | Darker green |
| `--poly-gold`             | `#BD8B13` | Accent |
| `--stadium-gold`          | `#F8E08E` | Accent |
| `--savings-green`         | `#e8f5ec` | Savings highlight background |
| `--savings-green-text`    | `#1a6b42` | Savings text |
| `--background`            | `#f9f9f9` | Page background |
| `--card-bg`               | `#ffffff` | Card surfaces |

Helpers: `.card` / `.card-hover` (shadow + border), `.search-input:focus` (green border), a `shimmer` keyframe with `.skeleton`, and a `prefers-reduced-motion` block that disables animations.

---

## Testing

Unit tests use Node's built-in test runner (`node:test`) as `.mjs` files:

- `components/utils.test.mjs`
- `components/constants.test.mjs`

Run:

```bash
node --test src/app/components/utils.test.mjs src/app/components/constants.test.mjs
```

There is no separate test framework dependency; tests rely on `node:test` and `node:assert`.

---

## Configuration

### `next.config.mjs`
- `reactCompiler: true` — React Compiler enabled.
- `images.domains: ["images.unsplash.com", "www.kroger.com"]` — allowed remote image hosts.

### `jsconfig.json`
- `@/*` path alias → `src/*`.

### Environment variables
| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key |
| `KROGER_CLIENT_ID` | server | Kroger OAuth client id |
| `KROGER_CLIENT_SECRET` | server | Kroger OAuth client secret |
| `KROGER_ENV` | server | `prod` selects the production Kroger host; otherwise the certification host |

### Scripts (`package.json`)
`dev`, `build`, `start`, `lint` (eslint), `format` (prettier).
