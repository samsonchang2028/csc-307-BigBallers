# OptiCart

A grocery price comparison web app built with Next.js and Supabase. OptiCart lets users browse products by category, compare prices, and manage their account — all in one place.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Backend / Auth / DB**: Supabase (PostgreSQL + Auth)
- **Language**: JavaScript (JSX)

## Project Structure

```
src/
├── app/
│   ├── layout.js          # Root layout (metadata, global CSS)
│   ├── page.js            # Landing page (/)
│   ├── home/
│   │   └── page.js        # Product browsing page (/home)
│   ├── login/
│   │   └── page.js        # Login page (/login)
│   ├── dashboard/
│   │   └── page.js        # Authenticated dashboard (/dashboard)
│   └── api/
│       └── products/
│           └── route.js   # GET /api/products — price lookup endpoint
└── lib/
    └── supabase.js        # Supabase client singleton
```

## Pages

| Route        | Description                                                  |
|--------------|--------------------------------------------------------------|
| `/`          | Landing page with Login button and tagline                   |
| `/home`      | Browse products by category (Dairy, Produce, Meat)           |
| `/login`     | Email/password login via Supabase Auth                       |
| `/dashboard` | Protected page showing logged-in user info and logout button |

## API Routes

### `GET /api/products`

Returns the 10 most recently scraped price records joined with product names.

**Query params**: `q` (unused currently, reserved for search)

**Response**:
```json
[
  {
    "price": 2.99,
    "original_price": 3.49,
    "scraped_at": "2025-05-09T21:00:00Z",
    "products": { "name": "Whole Milk" }
  }
]
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with:
  - `products` table (columns: `id`, `name`, `price`)
  - `prices` table (columns: `price`, `original_price`, `scraped_at`, `product_id`)
  - Email/password auth enabled

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Scripts

| Command       | Description                        |
|---------------|------------------------------------|
| `npm run dev`   | Start development server           |
| `npm run build` | Build for production               |
| `npm run start` | Start production server            |
| `npm run lint`  | Run ESLint                         |
| `npm run format`| Format code with Prettier          |

## Environment Variables

| Variable                        | Description                  |
|---------------------------------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

> **Never commit `.env.local`** — it is already listed in `.gitignore`.
