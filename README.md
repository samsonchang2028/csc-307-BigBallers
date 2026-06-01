# OptiCart

A grocery price comparison web app built with Next.js and Supabase. OptiCart lets users browse products by category, compare prices across local stores, and manage their grocery list — all in one place.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Cal Poly brand colors
- **Backend / Auth / DB**: Supabase (PostgreSQL + Auth)
- **Language**: JavaScript (JSX)

## Project Structure

```
src/
├── app/
│   ├── layout.js                  # Root layout — metadata, global CSS, Navbar
│   ├── globals.css                # Cal Poly brand tokens (Poly Green, Mustang Gold)
│   ├── page.js                    # Home page (/) — Best Deals grid + category chips
│   ├── home/
│   │   └── page.js                # Search results page (/home) — filters + product list
│   ├── login/
│   │   └── page.js                # Login/signup page (/login)
│   ├── dashboard/
│   │   └── page.js                # Authenticated user dashboard (/dashboard)
│   ├── grocery-list/
│   │   └── page.js                # Saved grocery list (/grocery-list)
│   ├── auth/callback/
│   │   └── page.js                # Supabase auth callback (/auth/callback)
│   ├── components/
│   │   ├── Navbar.js              # Top navbar — logo, search bar, auth button
│   │   ├── AuthButton.js          # Login/logout/signup button
│   │   └── ItemCard.js            # Product detail modal — price table, cheapest callout
│   └── api/
│       ├── products/
│       │   └── route.js           # GET /api/products — search + Kroger live prices
│       └── deals/
│           └── route.js           # GET /api/deals — top 6 products by savings
└── lib/
    ├── supabase.js                # Supabase client singleton
    └── kroger.js                  # Kroger API helper (server-side only)
```

## Pages

| Route           | Description                                                          |
|-----------------|----------------------------------------------------------------------|
| `/`             | Home — Best Deals Today grid, category chips, footer taglines        |
| `/home`         | Search results — filters sidebar, per-store price columns, item list |
| `/login`        | Email/password login and signup via Supabase Auth                    |
| `/dashboard`    | Authenticated user info + logout                                     |
| `/grocery-list` | Saved grocery list for logged-in users                               |

## API Routes

### `GET /api/products`

Returns matched products from Supabase + live Kroger API results, merged into a unified shape.

**Query params**:
- `q` — free-text search across product name and category
- `category` — exact category filter (e.g. `Dairy`, `Meat & Seafood`)

**Response**:
```json
[
  {
    "name": "Clover Sonoma Whole Milk",
    "category": "Dairy",
    "prices": [
      {
        "price": 4.99,
        "original_price": 5.99,
        "scraped_at": "2025-05-09T21:00:00Z",
        "store_id": "d509a460-...",
        "store_name": null
      }
    ]
  }
]
```

### `GET /api/deals`

Returns the top 6 products with the biggest price savings (`original_price - price`), sorted by savings descending.

**Response**:
```json
[
  {
    "name": "Chobani Greek Yogurt",
    "price": "2.50",
    "original_price": "3.99",
    "savings": "1.49",
    "store_name": "Sprouts",
    "store_id": "d509a460-..."
  }
]
```

## Features

### Home Page — Best Deals Today
The root `/` page shows a 3-column grid of the top 6 deals fetched from `/api/deals`. Each card shows a product image placeholder, name, price in Poly Green, store name, and a savings badge. Clicking a card opens the ItemCard modal. Category chips at the top navigate to `/home?category=...`.

### Search Results Page
`/home` shows a two-column layout: a filters sidebar on the left and product results on the right. Supports URL params (`?q=` or `?category=`) so category chips on the home page deep-link directly into filtered results.

### Kroger API Integration
Live price data from Ralphs and Food 4 Less (SLO locations) is fetched in parallel with Supabase on every search. Results are normalized into the same shape as scraped products. Requires `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET` env vars.

### Product Categories
8 categories: **Dairy, Fruit, Vegetables, Meat & Seafood, Bakery, Grains & Pasta, Snacks, Beverages**. Category chips use an exact `eq` filter for accuracy and performance.

### ItemCard — Product Detail Modal
Clicking any product opens a modal with:
- Price comparison table (Store / Current Price / Regular Price / Last Updated)
- Cheapest Today callout box with savings vs next-lowest store
- Price Snapshot (highest / lowest / average across stores)
- "Best time to buy" badge when item is on sale

### Grocery List
Authenticated users can add products to their Supabase `grocery_list` table from search results. Already-added items show a green checkmark. Redirects to `/login` if not authenticated.

### Filters
- Toggle individual stores on/off (checkboxes)
- Sort by Relevance / Price: Low to High / Price: High to Low (radio)
- Set a max price cap

## Branding

Uses Cal Poly official brand colors:
- **Poly Green** `#154734` — primary actions, prices, active states
- **Mustang Gold** `#BD8B13` — accent
- **Stadium Gold** `#F8E08E` — savings badges

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with:
  - `products` table (columns: `id`, `name`, `category`, `image_url`)
  - `prices` table (columns: `price`, `original_price`, `scraped_at`, `store_id`, `product_id`)
  - `stores` table (columns: `id`, `name`)
  - `grocery_list` table (columns: `id`, `user_id`, `product_name`)
  - Email/password auth enabled
- (Optional) Kroger Developer account for live Kroger prices

### Setup

1. Clone the repo and install dependencies:

```bash
cd 307-big-ballers
npm install
```

2. Create a `.env.local` file inside `307-big-ballers/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KROGER_CLIENT_ID=your_kroger_client_id
KROGER_CLIENT_SECRET=your_kroger_client_secret
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Scripts

| Command          | Description                  |
|------------------|------------------------------|
| `npm run dev`    | Start development server     |
| `npm run build`  | Build for production         |
| `npm run start`  | Start production server      |
| `npm run lint`   | Run ESLint                   |
| `npm run format` | Format code with Prettier    |

## Environment Variables

| Variable                        | Description                            |
|---------------------------------|----------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key          |
| `KROGER_CLIENT_ID`              | Kroger API client ID (server-only)     |
| `KROGER_CLIENT_SECRET`          | Kroger API client secret (server-only) |

> **Never commit `.env.local`** — it is already listed in `.gitignore`.

## Data Design Note

Each product in the DB is a store-specific SKU. Products are **not** matched across stores into canonical items — the ItemCard shows all prices for that SKU across whichever stores carry it.
