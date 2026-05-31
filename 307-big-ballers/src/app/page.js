'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [listLoaded, setListLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('grocery_list')
          .select('*')
          .order('created_at', { ascending: true });
        if (data) setGroceryList(data);
      }
      setListLoaded(true);
    }
    init();
  }, []);

  async function optimize() {
    if (!user) { router.push('/login'); return; }
    if (groceryList.length === 0) return;

    setOptimizing(true);
    setResult(null);

    // storeId -> { name, total, itemsFound }
    const storeTotals = {};

    await Promise.all(
      groceryList.map(async (listItem) => {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, prices ( price, original_price, scraped_at, store_id, stores ( name ) )')
          .ilike('name', `%${listItem.product_name}%`)
          .limit(10);

        if (!products?.length) return;

        // Deduplicate prices per store_id (latest scraped_at), then find cheapest across all matching products
        const bestPerStore = {}; // storeId -> { price, storeName }

        for (const product of products) {
          // Keep only latest price per store for this product
          const latestPerStore = {};
          for (const pr of product.prices ?? []) {
            const existing = latestPerStore[pr.store_id];
            if (!existing || pr.scraped_at > existing.scraped_at) {
              latestPerStore[pr.store_id] = pr;
            }
          }

          // Track minimum price across all matching products per store
          for (const pr of Object.values(latestPerStore)) {
            const price = parseFloat(pr.price);
            const storeName = pr.stores?.name ?? pr.store_id;
            if (!bestPerStore[pr.store_id] || price < bestPerStore[pr.store_id].price) {
              bestPerStore[pr.store_id] = { price, storeName };
            }
          }
        }

        for (const [storeId, { price, storeName }] of Object.entries(bestPerStore)) {
          if (!storeTotals[storeId]) {
            storeTotals[storeId] = { name: storeName, total: 0, itemsFound: 0 };
          }
          storeTotals[storeId].total += price * (listItem.quantity ?? 1);
          storeTotals[storeId].itemsFound += 1;
        }
      })
    );

    // Sort by most items covered first, then cheapest total
    const ranked = Object.entries(storeTotals)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.itemsFound - a.itemsFound || a.total - b.total);

    setResult({ ranked, totalItems: groceryList.length });
    setOptimizing(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-700 to-green-50 flex flex-col">

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
          Grocery price optimizer
        </p>
        <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          One list.<br />Best price.
        </h1>
        <p className="text-green-100 text-lg mb-12 max-w-sm">
          We scan your grocery list across every local store and tell you exactly where to shop.
        </p>

        <button
          onClick={optimize}
          disabled={optimizing || (listLoaded && !!user && groceryList.length === 0)}
          className="bg-white text-green-700 hover:bg-green-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-3xl font-black px-20 py-7 rounded-3xl shadow-2xl transition-all duration-150 tracking-tight"
        >
          {optimizing ? (
            <span className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 border-[3px] border-green-600 border-t-transparent rounded-full animate-spin" />
              Optimizing...
            </span>
          ) : 'OPTIMIZE'}
        </button>

        {listLoaded && !!user && groceryList.length === 0 && (
          <p className="mt-5 text-green-100 text-sm">
            Your list is empty.{' '}
            <Link href="/search" className="underline font-semibold">Add some items first.</Link>
          </p>
        )}

        {listLoaded && !user && (
          <p className="mt-5 text-green-100 text-sm">
            <Link href="/login" className="underline font-semibold">Sign in</Link>{' '}
            to optimize your grocery list.
          </p>
        )}

        {listLoaded && !!user && groceryList.length > 0 && !result && !optimizing && (
          <p className="mt-5 text-green-200 text-sm">
            {groceryList.length} item{groceryList.length !== 1 ? 's' : ''} on your list
          </p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="px-6 pb-16 max-w-md mx-auto w-full">
          {result.ranked.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600">No price data found for your items.</p>
              <p className="text-sm text-gray-400 mt-1">
                Search for your items first so we can track their prices.
              </p>
            </div>
          ) : (
            <>
              {/* Winner */}
              <div className="bg-white rounded-2xl px-6 py-6 mb-3 shadow-xl border-2 border-green-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-1">Best store</p>
                    <p className="text-3xl font-black text-gray-900">{result.ranked[0].name}</p>
                    <p className="text-green-600 text-sm mt-1">
                      {result.ranked[0].itemsFound}/{result.totalItems} items &middot; ~${result.ranked[0].total.toFixed(2)} total
                    </p>
                  </div>
                  <span className="text-4xl">🏆</span>
                </div>
              </div>

              {/* Runner-ups */}
              {result.ranked.length > 1 && (
                <p className="text-xs text-green-800 font-semibold uppercase tracking-widest mb-2 ml-1 mt-4">
                  Other stores
                </p>
              )}
              <ul className="flex flex-col gap-2">
                {result.ranked.slice(1).map((store) => (
                  <li
                    key={store.id}
                    className="bg-white border border-green-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{store.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {store.itemsFound}/{result.totalItems} items
                      </span>
                    </div>
                    <span className="font-bold text-gray-700">${store.total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-center gap-10 pb-8 text-sm text-green-700">
        <Link href="/search" className="hover:underline">Search →</Link>
        <Link href="/grocery-list" className="hover:underline">My List →</Link>
      </div>
    </main>
  );
}
