"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ItemCard from "@/app/components/ItemCard";

const CATEGORIES = [
  { label: 'Dairy',    emoji: '🥛', query: 'Dairy',          isCategory: true },
  { label: 'Produce',  emoji: '🥬', query: 'Fruit',          isCategory: true },
  { label: 'Meat',     emoji: '🥩', query: 'Meat & Seafood', isCategory: true },
  { label: 'Bakery',   emoji: '🥐', query: 'Bakery',         isCategory: true },
  { label: 'Pantry',   emoji: '🥫', query: 'Grains & Pasta', isCategory: true },
  { label: 'Snacks',   emoji: '🍿', query: 'Snacks',         isCategory: true },
];

const storeNames = {
  "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
  "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
  "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
  "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
  "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
  "kroger-ralphs": "Ralphs",
  "kroger-food4less": "Food 4 Less",
};

const krogerStoreIdMap = { "Ralphs": "kroger-ralphs", "Food 4 Less": "kroger-food4less" };
const allStoreIds = Object.keys(storeNames);

// Categories sold by weight — assume 1 lb if no unit found
const PER_LB_CATEGORIES = new Set(['Meat & Seafood', 'Fruit', 'Vegetables']);

// Parse a quantity from a product name, e.g. "Eggs 12 ct" -> 12, "64 fl oz juice" -> 64
function parseQuantity(name, category) {
  if (!name) return null;
  const match = name.match(/(\d+(?:\.\d+)?)\s*(?:ct|count|oz|fl\.?\s*oz|lb|lbs|g|kg|ml|l|pack|pk|piece|pc|slices?)/i);
  if (match) return parseFloat(match[1]);
  // Fallback: per-lb categories with no explicit unit → assume 1 lb
  if (category && PER_LB_CATEGORIES.has(category)) return 1;
  return null;
}

function unitPrice(price, name, category) {
  const qty = parseQuantity(name, category);
  return qty ? parseFloat(price) / qty : null;
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("relevance");
  const [selectedStores, setSelectedStores] = useState(new Set(allStoreIds));
  const [priceCap, setPriceCap] = useState("");
  const [listFeedback, setListFeedback] = useState(null);
  const [addedItems, setAddedItems] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeQuery, setActiveQuery] = useState("");

  // Load grocery list + handle URL params on mount
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('grocery_list').select('product_name');
        if (data) setAddedItems(new Set(data.map(r => r.product_name)));
      }
    }
    init();

    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (cat) { setActiveQuery(cat); search(cat, true); }
    else if (q) { setActiveQuery(q); search(q, false); }
  }, []);

  async function addToList(productName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { error } = await supabase.from('grocery_list').insert({ user_id: user.id, product_name: productName });
    if (error) {
      setListFeedback(`Error: ${error.message}`);
      setTimeout(() => setListFeedback(null), 3000);
    } else {
      setAddedItems(prev => new Set(prev).add(productName));
    }
  }

  function toggleStore(id) {
    setSelectedStores(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const displayProducts = (() => {
    const cap = priceCap !== "" ? parseFloat(priceCap) : null;
    let result = products
      .map(p => ({
        ...p,
        prices: (p.prices ?? []).filter(pr => {
          const effectiveId = pr.source === "kroger" ? krogerStoreIdMap[pr.store_name] : pr.store_id;
          return selectedStores.has(effectiveId) && (cap === null || parseFloat(pr.price) <= cap);
        }),
      }))
      .filter(p => p.prices.length > 0);

    if (sortKey === "relevance") return result;

    const asc = sortKey === "price-asc" || sortKey === "unit-asc";
    const byUnit = sortKey === "unit-asc" || sortKey === "unit-desc";

    return result
      .map(p => ({
        ...p,
        prices: [...p.prices].sort((a, b) => {
          const av = byUnit ? (unitPrice(a.price, p.name, p.category) ?? Infinity) : parseFloat(a.price);
          const bv = byUnit ? (unitPrice(b.price, p.name, p.category) ?? Infinity) : parseFloat(b.price);
          return asc ? av - bv : bv - av;
        }),
      }))
      .sort((a, b) => {
        const aVal = byUnit
          ? (unitPrice(Math.min(...a.prices.map(pr => parseFloat(pr.price))), a.name, a.category) ?? Infinity)
          : Math.min(...a.prices.map(pr => parseFloat(pr.price)));
        const bVal = byUnit
          ? (unitPrice(Math.min(...b.prices.map(pr => parseFloat(pr.price))), b.name, b.category) ?? Infinity)
          : Math.min(...b.prices.map(pr => parseFloat(pr.price)));
        return asc ? aVal - bVal : bVal - aVal;
      });
  })();

  async function search(query, isCategory = false) {
    if (!query) return;
    setLoading(true);
    const param = isCategory ? `category=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
    const res = await fetch(`/api/products?${param}`);
    const data = await res.json();
    setProducts(res.ok ? data : []);
    setLoading(false);
  }

  function handleCategoryClick(cat) {
    if (activeQuery === cat.label) {
      setActiveQuery('');
      setProducts([]);
    } else {
      setActiveQuery(cat.label);
      search(cat.query, cat.isCategory);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Category chips */}
      <div className="px-6 py-4 flex gap-3 flex-wrap" style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeQuery === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
              style={{
                background: isActive ? '#154734' : '#f9fafb',
                color: isActive ? '#fff' : 'var(--text-primary)',
                borderColor: isActive ? '#154734' : 'var(--border)',
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Filters sidebar */}
        <aside className="w-56 shrink-0 p-5 border-r" style={{ background: '#fff', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm">Filters</span>
            <button
              onClick={() => { setSelectedStores(new Set(allStoreIds)); setPriceCap(""); setSortKey("relevance"); }}
              className="text-xs"
              style={{ color: '#154734' }}
            >
              Clear all
            </button>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Stores</p>
          <div className="flex flex-col gap-2 mb-5">
            {allStoreIds.map(id => (
              <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStores.has(id)}
                  onChange={() => toggleStore(id)}
                  className="rounded"
                  style={{ accentColor: '#154734' }}
                />
                {storeNames[id]}
              </label>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Sort by</p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              { label: 'Relevance',              val: 'relevance'  },
              { label: 'Price: Low to High',     val: 'price-asc'  },
              { label: 'Price: High to Low',     val: 'price-desc' },
              { label: 'Unit Price: Low to High',  val: 'unit-asc'   },
              { label: 'Unit Price: High to Low',  val: 'unit-desc'  },
            ].map(opt => (
              <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={sortKey === opt.val}
                  onChange={() => setSortKey(opt.val)}
                  style={{ accentColor: '#154734' }}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Max price</p>
          <div className="flex items-center gap-1 text-sm">
            <span>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceCap}
              onChange={e => setPriceCap(e.target.value)}
              placeholder="any"
              className="border rounded px-2 py-1 w-full text-sm"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 p-6">
          {activeQuery && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                Results for <span style={{ color: '#154734' }}>'{activeQuery}'</span>
              </h2>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {displayProducts.length} results found
              </span>
            </div>
          )}

          {listFeedback && (
            <p className={`text-sm mb-3 ${listFeedback.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
              {listFeedback}
            </p>
          )}

          {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

          {!loading && !activeQuery && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Select a category or search for a product to see results.
            </p>
          )}

          {!loading && activeQuery && displayProducts.length === 0 && products.length > 0 && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No results match your filters.</p>
          )}

          <div className="flex flex-col gap-3">
            {!loading && displayProducts.map((p, i) => {
              const cheapest = [...(p.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
              const hasDiscount = cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price);
              const qty = parseQuantity(p.name, p.category);
              const cheapestUnit = cheapest && qty ? parseFloat(cheapest.price) / qty : null;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedProduct(p)}
                  className="card flex items-center gap-4 px-4 py-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-2xl" style={{ background: '#f3f4f6' }}>
                    🛒
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <div className="flex items-center gap-2">
                      {p.category && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.category}</p>}
                      {cheapestUnit !== null && (
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>${cheapestUnit.toFixed(2)}/unit</p>
                      )}
                    </div>
                  </div>

                  {/* Per-store prices */}
                  <div className="flex items-center gap-3 shrink-0">
                    {p.prices.slice(0, 3).map((pr, j) => {
                      const name = pr.store_name ?? storeNames[pr.store_id] ?? pr.store_id ?? "";
                      const isCheapest = pr === cheapest;
                      return (
                        <div key={j} className="text-center">
                          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{name}</p>
                          <span
                            className="text-sm font-bold px-2 py-0.5 rounded-full"
                            style={isCheapest
                              ? { background: '#e6f4ea', color: '#154734' }
                              : { color: 'var(--text-primary)' }
                            }
                          >
                            ${parseFloat(pr.price).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add to list + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasDiscount && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F8E08E', color: '#7a5c00' }}>
                        save ${(parseFloat(cheapest.original_price) - parseFloat(cheapest.price)).toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); addToList(p.name); }}
                      disabled={addedItems.has(p.name)}
                      className="w-7 h-7 rounded-full border text-sm flex items-center justify-center transition-colors"
                      style={addedItems.has(p.name)
                        ? { background: '#154734', color: '#fff', borderColor: '#154734' }
                        : { borderColor: 'var(--border)' }
                      }
                      title="Add to grocery list"
                    >
                      {addedItems.has(p.name) ? '✓' : '+'}
                    </button>
                    <span style={{ color: 'var(--text-secondary)' }}>›</span>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && displayProducts.length > 0 && (
            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
              ⓘ Prices update regularly. Check back often for the best deals!
            </p>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ItemCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading...</div>}>
      <HomeInner />
    </Suspense>
  );
}
