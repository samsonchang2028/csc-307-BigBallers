'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryChip from '@/app/components/CategoryChip';
import DealCard, { DealCardSkeleton } from '@/app/components/DealCard';
import StorePanel from '@/app/components/StorePanel';
import { CATEGORIES, STORE_NAMES, getStoreName } from '@/app/components/constants';
import { saveProductForDetail } from '@/app/components/utils';
import { TagIcon, ArrowRightIcon } from '@/app/components/icons';
import { supabase } from '@/lib/supabase';
import sproutsLogo       from '@/assets/sprouts.png';
import smartFinalLogo    from '@/assets/smart-final.png';
import groceryOutletLogo from '@/assets/grocery-outlet.png';
import calFreshLogo      from '@/assets/cal-fresh.png';
import traderJoesLogo    from '@/assets/trader-joes.png';
import ralphsLogo        from '@/assets/ralphs.png';
import food4lessLogo     from '@/assets/food4less.png';
import cartIcon          from '@/assets/opticart-logo.png';

const krogerStoreIdMap = { Ralphs: 'kroger-ralphs', 'Food 4 Less': 'kroger-food4less' };

const STORE_LOGOS = {
  'd509a460-ad97-4099-a6df-d03798e03d6d': sproutsLogo,
  '0c293cf1-2b65-4d9e-9cb2-4688b41460f7': smartFinalLogo,
  'eefcee75-d1f4-49c3-8a40-c59982d72287': groceryOutletLogo,
  '9ae30061-19f8-41f5-8bdf-85694ddec2dc': calFreshLogo,
  '1971e92b-78af-4dcc-9bfa-cf3349b649ef': traderJoesLogo,
  'kroger-ralphs':    ralphsLogo,
  'kroger-food4less': food4lessLogo,
};

export default function RootPage() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeStore, setActiveStore] = useState(null);
  const [addedItems, setAddedItems] = useState(new Map());
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('grocery_list').select('product_name, quantity');
        if (data) setAddedItems(new Map(data.map(r => [r.product_name, r.quantity ?? 1])));
      }
    }
    init();
  }, []);

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.json())
      .then(data => {
        setDeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function optimize() {
    setOptimizing(true);
    setOptimizeResult(null);

    const names = [...addedItems.keys()];
    if (names.length === 0) {
      setOptimizeResult({ empty: true });
      setOptimizing(false);
      return;
    }

    const fetched = await Promise.all(
      names.map(name =>
        fetch(`/api/products?q=${encodeURIComponent(name)}`)
          .then(r => r.json())
          .then(list => list.find(p => p.name === name) || list[0] || null)
          .catch(() => null)
      )
    );

    const storeTotals = {};
    const storeItemCounts = {};
    names.forEach((name, i) => {
      const product = fetched[i];
      if (!product?.prices?.length) return;
      const qty = addedItems.get(name) ?? 1;
      const byStore = {};
      product.prices.forEach(pr => {
        const id = pr.source === 'kroger' ? krogerStoreIdMap[pr.store_name] : pr.store_id;
        if (!id) return;
        const p = parseFloat(pr.price);
        if (!byStore[id] || p < byStore[id]) byStore[id] = p;
      });
      Object.entries(byStore).forEach(([id, price]) => {
        storeTotals[id] = (storeTotals[id] ?? 0) + price * qty;
        storeItemCounts[id] = (storeItemCounts[id] ?? 0) + 1;
      });
    });

    if (Object.keys(storeTotals).length === 0) {
      setOptimizeResult({ noData: true });
      setOptimizing(false);
      return;
    }

    // Build per-store missing item lists
    const storeMissingItems = {};
    names.forEach((name, i) => {
      const product = fetched[i];
      const productStoreIds = new Set(
        (product?.prices ?? [])
          .map(pr => pr.source === 'kroger' ? krogerStoreIdMap[pr.store_name] : pr.store_id)
          .filter(Boolean)
      );
      Object.keys(storeTotals).forEach(storeId => {
        if (!productStoreIds.has(storeId)) {
          if (!storeMissingItems[storeId]) storeMissingItems[storeId] = [];
          storeMissingItems[storeId].push(name);
        }
      });
    });

    // Primary: most items covered. Tiebreak: lowest total cost.
    const sortedStores = Object.entries(storeTotals)
      .sort((a, b) => {
        const countDiff = (storeItemCounts[b[0]] ?? 0) - (storeItemCounts[a[0]] ?? 0);
        return countDiff !== 0 ? countDiff : a[1] - b[1];
      });
    const bestId = sortedStores[0][0];

    const allStores = sortedStores.map(([storeId, total]) => ({
      storeId,
      total,
      itemCount: storeItemCounts[storeId] ?? 0,
      missingItems: storeMissingItems[storeId] ?? [],
    }));

    setOptimizeResult({
      storeId: bestId,
      storeName: getStoreName(bestId),
      total: storeTotals[bestId],
      missingCount: (storeMissingItems[bestId] ?? []).length,
      totalItems: names.length,
      allStores,
    });
    setOptimizing(false);
  }

  function goToSearch(query, isCategory, label) {
    if (isCategory) setActiveCategory(label);
    const param = isCategory ? `category=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
    router.push(`/search?${param}`);
  }

  return (
    <div>
      <div className="border-b bg-white" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.label}
              label={cat.label}
              active={activeCategory === cat.label}
              onClick={() => goToSearch(cat.query, cat.isCategory, cat.label)}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 pt-14 pb-2">
        <button
          onClick={optimize}
          disabled={optimizing}
          className="w-1/2 mx-auto py-8 flex items-center justify-center gap-3 text-lg font-bold text-white tracking-wide transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ background: 'var(--poly-green)', borderRadius: 'var(--radius)' }}
        >
          <img src={cartIcon.src} alt="" style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          {optimizing ? 'Thinking really hard...' : 'OPTIMIZE'}
        </button>

        {optimizeResult?.empty && (
          <div className="card mt-4 w-1/2 mx-auto px-6 py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Your grocery list is empty 
          </div>
        )}
        {optimizeResult?.noData && (
          <div className="card mt-4 w-1/2 mx-auto px-6 py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Could not find price data for your list
          </div>
        )}
        {optimizeResult?.storeId && (
          <div className="w-3/4 mx-auto">
            <div className="card mt-4 px-6 py-10 flex flex-col items-center gap-4 text-center">
              {STORE_LOGOS[optimizeResult.storeId] && (
                <img
                  src={STORE_LOGOS[optimizeResult.storeId].src}
                  alt={optimizeResult.storeName}
                  style={{ height: 96, width: 'auto', objectFit: 'contain' }}
                />
              )}
              <div>
                <p className="text-sm mt-1" style={{ color: 'var(--savings-green-text)' }}>
                  is the cheapest store for your grocery list
                  <br />
                  ${optimizeResult.total.toFixed(2)} estimated total
                </p>
                {optimizeResult.missingCount > 0 && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted-accessible)' }}>
                    {optimizeResult.missingCount} of {optimizeResult.totalItems} items not available here
                  </p>
                )}
              </div>
            </div>

            <div className="card mt-3 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-light)', background: '#fafafa' }}>
                    <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: 'var(--text-muted-accessible)' }}>Store</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: 'var(--text-muted-accessible)' }}>Est. Total</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: 'var(--text-muted-accessible)' }}>Missing items</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizeResult.allStores.map(({ storeId, total, missingItems }, i) => (
                    <tr
                      key={storeId}
                      className="border-b last:border-0"
                      style={{ borderColor: 'var(--border-light)', background: i === 0 ? 'var(--savings-green)' : 'transparent' }}
                    >
                      <td className="px-4 py-3">
                        {STORE_LOGOS[storeId]
                          ? <img src={STORE_LOGOS[storeId].src} alt={getStoreName(storeId)} style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                          : <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{getStoreName(storeId)}</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ${total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {missingItems.length === 0
                            ? <span style={{ color: 'var(--poly-green)' }}>All items available</span>
                            : missingItems.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TagIcon style={{ color: 'var(--poly-green)' }} />
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Best Deals Today
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              The biggest savings across your favorite stores
            </p>
          </div>
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-1 text-sm font-medium cursor-pointer"
            style={{ color: 'var(--poly-green)' }}
          >
            See all deals
            <ArrowRightIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <DealCardSkeleton key={i} index={i} />)
            : deals.map((deal, i) => (
                <DealCard
                  key={`${deal.product_id}-${deal.store_id}`}
                  deal={deal}
                  index={i}
                  onClick={() => {
                    saveProductForDetail({
                      name: deal.name,
                      unit: deal.unit,
                      image_url: deal.image_url,
                      prices: [{
                        price: deal.price,
                        original_price: deal.original_price,
                        store_id: deal.store_id,
                        store_name: deal.store_name,
                      }],
                    });
                    router.push('/product');
                  }}
                  onStoreClick={setActiveStore}
                />
              ))}
        </div>

        {!loading && deals.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            No deals found right now. Check back soon!
          </p>
        )}
      </div>

      {activeStore && <StorePanel storeName={activeStore} onClose={() => setActiveStore(null)} />}
    </div>
  );
}
