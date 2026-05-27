"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const categoryMap = {
    Dairy: "milk",
    Produce: "banana",
    Meat: "chicken",
    Bakery: "bread",
    Pantry: "rice",
    Snacks: "chips",
  };

  const categoryIcons = {
    Dairy: "🥛",
    Produce: "🥬",
    Meat: "🥩",
    Bakery: "🍞",
    Pantry: "🥫",
    Snacks: "🍪",
  };

  const storeNames = {
    "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
    "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
    "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
    "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
    "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
  };

  const allStoreIds = Object.keys(storeNames);

  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(null);
  const [selectedStores, setSelectedStores] = useState(new Set(allStoreIds));
  const [priceCap, setPriceCap] = useState("");

  function toggleStore(id) {
    setSelectedStores((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort() {
    setSortAsc((prev) => (prev === null ? true : prev === true ? false : null));
  }

  const sortLabel =
    sortAsc === null
      ? "Sort"
      : sortAsc
      ? "Low → High"
      : "High → Low";

  const displayProducts = (() => {
    const cap = priceCap !== "" ? parseFloat(priceCap) : null;

    let result = products
      .map((p) => ({
        ...p,
        prices: (p.prices ?? []).filter(
          (pr) =>
            selectedStores.has(pr.store_id) &&
            (cap === null || parseFloat(pr.price) <= cap)
        ),
      }))
      .filter((p) => p.prices.length > 0);

    if (sortAsc === null) return result;

    return result
      .map((p) => ({
        ...p,
        prices: [...p.prices].sort((a, b) =>
          sortAsc
            ? parseFloat(a.price) - parseFloat(b.price)
            : parseFloat(b.price) - parseFloat(a.price)
        ),
      }))
      .sort((a, b) => {
        const aMin = Math.min(...a.prices.map((pr) => parseFloat(pr.price)));
        const bMin = Math.min(...b.prices.map((pr) => parseFloat(pr.price)));
        return sortAsc ? aMin - bMin : bMin - aMin;
      });
  })();

  async function search(query) {
    if (!query) return;

    setLoading(true);
    const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setProducts(res.ok ? data : []);
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") search(searchInput);
  }

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-4 pt-10 pb-24 text-black">
      <header className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold text-green-700">OptiCart</h1>

        <Link
            href="/login"
            className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
            Login
        </Link>
    </header>

      <div className="flex items-center gap-3 border rounded-2xl px-4 py-3 shadow-sm mb-5 text-gray-500">
        <span>🔍</span>
        <input
          className="flex-1 outline-none text-sm text-black placeholder:text-gray-400"
          placeholder="Search for eggs, milk, chicken..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto mb-5 pb-1 whitespace-nowrap">
        {Object.keys(categoryMap).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSearchInput(categoryMap[cat]);
              search(categoryMap[cat]);
            }}
            className="min-w-[72px] border rounded-2xl py-3 text-center text-xs shadow-sm bg-white text-black"
          >
            <div className="text-xl mb-1">{categoryIcons[cat]}</div>
            <div>{cat}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
        <button
          onClick={toggleSort}
          className="border rounded-full px-3 py-2 text-xs font-semibold"
        >
          {sortLabel}
        </button>

        {allStoreIds.map((id) => (
          <button
            key={id}
            onClick={() => toggleStore(id)}
            className={`border rounded-full px-3 py-2 text-xs whitespace-nowrap ${
              selectedStores.has(id)
                ? "bg-green-700 text-white"
                : "bg-white text-black"
            }`}
          >
            {storeNames[id]}
          </button>
        ))}

        <input
          type="number"
          min="0"
          step="0.01"
          value={priceCap}
          onChange={(e) => setPriceCap(e.target.value)}
          placeholder="Max $"
          className="border rounded-full px-3 py-2 text-xs w-20"
        />
      </div>

      <section className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">
          {products.length ? "Search Results" : "Best Deals Today"}
        </h2>
        <button className="text-green-700 font-semibold">See all</button>
      </section>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && displayProducts.length === 0 && (
        <p className="text-gray-500 text-sm">
          Search for an item or tap a category.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {!loading &&
          displayProducts.map((p) => {
            const bestPrice = p.prices?.[0];
            const savings =
              bestPrice?.original_price
                ? Number(bestPrice.original_price) - Number(bestPrice.price)
                : null;

            return (
              <Link
                key={p.id}
                href={`/product/${bestPrice?.id}`}
                className="bg-white border rounded-3xl p-4 shadow-sm relative text-black block"
              >
                <button
                  type="button"
                  className="absolute right-4 top-4 text-xl text-gray-500"
                >
                  ♡
                </button>

                <div className="h-20 flex items-center justify-center mb-3">
                  <img
                    src={p.image_url || "/images/default.png"}
                    alt={p.name || "Product image"}
                    className="h-10 w-10 object-contain"
                  />
                </div>

                <h3 className="font-bold text-sm leading-tight capitalize pr-6">
                  {p.name}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {storeNames[bestPrice?.store_id] ?? "Store"}
                </p>

                <p className="text-2xl font-bold text-green-700 mt-3">
                  ${bestPrice?.price}
                </p>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-2 mt-3">
                  {savings && savings > 0 ? (
                    <>
                      <p className="text-green-700 font-bold text-sm">
                        save ${savings.toFixed(2)}
                      </p>
                      <p className="text-xs text-black">vs other stores</p>
                    </>
                  ) : (
                    <p className="text-green-700 font-bold text-sm">
                      best price
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 max-w-md w-full bg-white border-t px-8 py-3 flex justify-between">
        <Link href="/home" className="text-green-700 text-center">
          <div className="text-2xl">🏠</div>
          <p className="text-xs font-semibold">Home</p>
        </Link>

        <button className="text-black text-center">
          <div className="text-2xl">🔎</div>
          <p className="text-xs">Search</p>
        </button>

        <button className="text-black text-center">
          <div className="text-2xl">♥️</div>
          <p className="text-xs">Favorites</p>
        </button>

         <button className="text-black text-center">
          <div className="text-2xl">👤</div>
          <p className="text-xs">Account</p>
        </button>
      </nav>
    </main>
  );
}