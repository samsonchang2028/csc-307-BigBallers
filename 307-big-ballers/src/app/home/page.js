"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ResultCard from "@/app/components/ResultCard";
import StorePanel from "@/app/components/StorePanel";
import { STORE_NAMES } from "@/app/components/constants";
import { SlidersIcon, ChevronDownIcon } from "@/app/components/icons";

const krogerStoreIdMap = { Ralphs: "kroger-ralphs", "Food 4 Less": "kroger-food4less" };
const allStoreIds = Object.keys(STORE_NAMES);

// Categories sold by weight — assume 1 lb if no unit found
const PER_LB_CATEGORIES = new Set(["Meat & Seafood", "Fruit", "Vegetables"]);

function parseQuantity(name, category) {
  if (!name) return null;
  const match = name.match(/(\d+(?:\.\d+)?)\s*(?:ct|count|oz|fl\.?\s*oz|lb|lbs|g|kg|ml|l|pack|pk|piece|pc|slices?)/i);
  if (match) return parseFloat(match[1]);
  if (category && PER_LB_CATEGORIES.has(category)) return 1;
  return null;
}

function unitPrice(price, name, category) {
  const qty = parseQuantity(name, category);
  return qty ? parseFloat(price) / qty : null;
}

function SortFilterPanel({ sortKey, setSortKey, selectedStores, toggleStore, priceCap, setPriceCap, onClear }) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-64 card p-4 z-20 shadow-lg"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">Sort & Filter</span>
        <button onClick={onClear} className="text-xs font-medium" style={{ color: "var(--poly-green)" }}>
          Clear all
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted-accessible)" }}>
        Sort by
      </p>
      <div className="flex flex-col gap-1.5 mb-4">
        {[
          { label: "Relevance",                 val: "relevance"  },
          { label: "Price: Low to High",        val: "price-asc"  },
          { label: "Price: High to Low",        val: "price-desc" },
          { label: "Unit Price: Low to High",   val: "unit-asc"   },
          { label: "Unit Price: High to Low",   val: "unit-desc"  },
        ].map(opt => (
          <label key={opt.val} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              checked={sortKey === opt.val}
              onChange={() => setSortKey(opt.val)}
              style={{ accentColor: "var(--poly-green)" }}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted-accessible)" }}>
        Stores
      </p>
      <div className="flex flex-col gap-1.5 mb-4 max-h-36 overflow-y-auto">
        {allStoreIds.map(id => (
          <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selectedStores.has(id)}
              onChange={() => toggleStore(id)}
              style={{ accentColor: "var(--poly-green)" }}
            />
            {STORE_NAMES[id]}
          </label>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted-accessible)" }}>
        Max price
      </p>
      <div className="flex items-center gap-1 text-sm">
        <span style={{ color: "var(--text-muted-accessible)" }}>$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={priceCap}
          onChange={e => setPriceCap(e.target.value)}
          placeholder="any"
          aria-label="Maximum price"
          className="border px-2 py-1.5 w-full text-sm outline-none"
          style={{ borderColor: "var(--border)", borderRadius: "var(--radius)" }}
        />
      </div>
    </div>
  );
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
  const [activeQuery, setActiveQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("grocery_list").select("product_name");
        if (data) setAddedItems(new Set(data.map(r => r.product_name)));
      }
    }
    init();

    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (cat) { setActiveQuery(cat); search(cat, true); }
    else if (q) { setActiveQuery(q); search(q, false); }
  }, [searchParams]);

  async function toggleList(productName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (addedItems.has(productName)) {
      const { error } = await supabase
        .from("grocery_list")
        .delete()
        .eq("user_id", user.id)
        .eq("product_name", productName);
      if (error) {
        setListFeedback(`Error: ${error.message}`);
        setTimeout(() => setListFeedback(null), 3000);
      } else {
        setAddedItems(prev => { const next = new Set(prev); next.delete(productName); return next; });
      }
      return;
    }

    const { error } = await supabase.from("grocery_list").insert({ user_id: user.id, product_name: productName });
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
        const aMin = Math.min(...a.prices.map(pr => parseFloat(pr.price)));
        const bMin = Math.min(...b.prices.map(pr => parseFloat(pr.price)));
        const aVal = byUnit ? (unitPrice(aMin, a.name, a.category) ?? Infinity) : aMin;
        const bVal = byUnit ? (unitPrice(bMin, b.name, b.category) ?? Infinity) : bMin;
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

  return (
    <div className="p-6">
      {activeQuery ? (
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Results for &apos;{activeQuery}&apos;
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {loading ? "Searching..." : `${displayProducts.length} results found`}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setFilterOpen(v => !v)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 border transition-colors"
              style={{ borderColor: "var(--border)", background: "#fff", color: "var(--text-primary)", borderRadius: "var(--radius)" }}
            >
              <SlidersIcon />
              Sort & Filter
              <ChevronDownIcon style={{ transform: filterOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {filterOpen && (
              <SortFilterPanel
                sortKey={sortKey}
                setSortKey={setSortKey}
                selectedStores={selectedStores}
                toggleStore={toggleStore}
                priceCap={priceCap}
                setPriceCap={setPriceCap}
                onClear={() => { setSelectedStores(new Set(allStoreIds)); setPriceCap(""); setSortKey("relevance"); }}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Search products</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Use the search bar above to compare prices across local stores
          </p>
        </div>
      )}

      {listFeedback && (
        <p className={`text-sm mb-4 ${listFeedback.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
          {listFeedback}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 skeleton" />
          ))}
        </div>
      )}

      {!loading && !activeQuery && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Try searching for milk, eggs, or chicken to get started.
        </p>
      )}

      {!loading && activeQuery && displayProducts.length === 0 && products.length > 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No results match your filters.</p>
      )}

      {!loading && activeQuery && displayProducts.length === 0 && products.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No products found for this search.</p>
      )}

      <div className="flex flex-col gap-3">
        {!loading && displayProducts.map((p, i) => (
          <ResultCard
            key={`${p.name}-${i}`}
            product={p}
            index={i}
            onToggleList={toggleList}
            isFavorited={addedItems.has(p.name)}
            onStoreClick={setActiveStore}
          />
        ))}
      {activeStore && <StorePanel storeName={activeStore} onClose={() => setActiveStore(null)} />}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--text-muted-accessible)" }}>Loading...</div>}>
      <HomeInner />
    </Suspense>
  );
}
