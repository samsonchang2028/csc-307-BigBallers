import { getSupabase } from "@/lib/supabase";
import { searchKrogerProducts } from "@/lib/kroger";

// Demo-quality canonicalization: maps brand-y scraped names to canonical
// concepts so multiple brand variants collapse into one card per (name, unit).
// Order matters — first matching rule wins. Add more as you find gaps.
const CANONICAL_RULES = [
  { canonical: "eggs",      include: ["egg"],
    exclude: ["chocolate", "noodle", "roll", "salad", "yolk", "sandwich", "kit", "beater", "substitute", "mayonnaise", "scramble", "truffle", "deviled"] },
  { canonical: "almond milk", include: ["almond milk"] },
  { canonical: "oat milk",    include: ["oat milk"] },
  { canonical: "soy milk",    include: ["soy milk"] },
  { canonical: "milk",      include: ["milk"],
    exclude: ["chocolate", "condensed", "powder", "evaporated", "coconut"] },
  { canonical: "bread",     include: ["bread"], exclude: ["crumb", "stuffing", "pudding"] },
  { canonical: "bagels",    include: ["bagel"] },
  { canonical: "tortillas", include: ["tortilla"], exclude: ["chip"] },
  { canonical: "butter",    include: ["butter"], exclude: ["peanut", "nut", "almond", "cashew", "cookie"] },
  { canonical: "cheese",    include: ["cheese"], exclude: ["cake", "popcorn", "cracker"] },
  { canonical: "yogurt",    include: ["yogurt", "yoghurt"] },
  { canonical: "rice",      include: ["rice"], exclude: ["krispie", "cake", "milk", "vinegar", "wine"] },
  { canonical: "pasta",     include: ["pasta", "spaghetti", "penne", "linguine", "fettuccine", "macaroni"], exclude: ["sauce", "salad"] },
  { canonical: "chicken",   include: ["chicken"], exclude: ["soup", "broth", "stock", "flavor", "bouillon"] },
  { canonical: "beef",      include: ["beef"], exclude: ["broth", "stock", "flavor", "bouillon", "jerky"] },
  { canonical: "bananas",   include: ["banana"], exclude: ["chip", "bread", "muffin"] },
  { canonical: "apples",    include: ["apple"], exclude: ["sauce", "juice", "cider", "pie"] },
  { canonical: "oranges",   include: ["orange"], exclude: ["juice", "soda"] },
  { canonical: "strawberries", include: ["strawberr"], exclude: ["jam", "jelly", "yogurt", "ice cream"] },
  { canonical: "blueberries",  include: ["blueberr"], exclude: ["jam", "jelly", "muffin", "yogurt"] },
];

function canonicalize(name) {
  const lower = name.toLowerCase();
  for (const rule of CANONICAL_RULES) {
    const matchesInclude = rule.include.some((kw) => lower.includes(kw));
    const matchesExclude = (rule.exclude ?? []).some((kw) => lower.includes(kw));
    if (matchesInclude && !matchesExclude) return rule.canonical;
  }
  return name; // no rule matched — keep original
}

// Try to pull a size out of a brand-y product name when the DB `unit` column
// is null. Handles patterns like:
//   "... - 12 each"          → "12 ct"
//   "... 12 count ..."       → "12 ct"
//   "... 16 ounce"           → "16 oz"
//   "... - 1 gallon"         → "1 gal"
function extractUnitFromName(name) {
  if (!name) return null;
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:each|count|ct|pack|pk)\b/i,
    /(\d+(?:\.\d+)?)\s*(?:ounce|oz)\b/i,
    /(\d+(?:\.\d+)?)\s*(?:pound|lbs?)\b/i,
    /(\d+(?:\.\d+)?)\s*(?:gallon|gal)\b/i,
    /(\d+(?:\.\d+)?)\s*(?:liter|litre|l)\b/i,
    /(\d+(?:\.\d+)?)\s*(?:fl\s*oz)\b/i,
  ];
  const normalize = [
    (n) => `${n} ct`,
    (n) => `${n} oz`,
    (n) => `${n} lb`,
    (n) => `${n} gal`,
    (n) => `${n} l`,
    (n) => `${n} fl oz`,
  ];
  for (let i = 0; i < patterns.length; i++) {
    const m = name.match(patterns[i]);
    if (m) return normalize[i](m[1]);
  }
  return null;
}

export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");

  if (!q && !category) {
    return Response.json({ error: "Missing query parameter: q or category" }, { status: 400 });
  }

  let dbQuery = supabase
    .from("products")
    .select(`name, unit, category, prices ( price, original_price, scraped_at, store_id )`);

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  } else {
    dbQuery = dbQuery.or(`name.ilike.%${q}%,category.ilike.%${q}%`);
  }

  // Bumped to 200 since we collapse many brand rows into few canonical cards.
  const [supabaseResult, krogerItems] = await Promise.all([
    dbQuery.limit(200),
    searchKrogerProducts(q ?? category),
  ]);

  if (supabaseResult.error) {
    console.error("Supabase error:", JSON.stringify(supabaseResult.error, null, 2));
    return Response.json({ error: supabaseResult.error }, { status: 500 });
  }

  // Group by (canonical_name, unit) — every brand variant of "eggs / 12 ct"
  // ends up in the same bucket, with all its prices pooled. If the DB unit is
  // null, try to extract a size from the product name as a fallback.
  const groups = {};
  for (const product of supabaseResult.data) {
    const canonical = canonicalize(product.name);
    const unit = product.unit ?? extractUnitFromName(product.name);
    const key = unit ? `${canonical}|${unit}` : canonical;
    if (!groups[key]) {
      groups[key] = {
        name: canonical,
        unit: unit,
        category: product.category,
        prices: [],
      };
    }
    groups[key].prices.push(...(product.prices ?? []));
  }

  // Within each group, keep only the cheapest price per store_id.
  const deduped = Object.values(groups).map((product) => {
    const cheapest = {};
    for (const pr of product.prices) {
      const existing = cheapest[pr.store_id];
      if (!existing || parseFloat(pr.price) < parseFloat(existing.price)) {
        cheapest[pr.store_id] = pr;
      }
    }
    return { ...product, prices: Object.values(cheapest) };
  });

  // Normalize Kroger results into the same shape as Supabase products
  const krogerProducts = krogerItems.map((item) => ({
    name: item.name,
    prices: [
      {
        price: item.sale_price ?? item.price,
        original_price: item.sale_price ? item.price : null,
        scraped_at: null,
        store_id: null,
        store_name: item.store,
        source: "kroger",
      },
    ],
  }));

  return Response.json([...deduped, ...krogerProducts]);
}
