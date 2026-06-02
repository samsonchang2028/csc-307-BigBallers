'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductPlaceholder from '@/app/components/ProductPlaceholder';
import { STORE_NAMES, getStoreName } from '@/app/components/constants';
import { formatRelativeTime, saveProductForDetail, shortStoreName } from '@/app/components/utils';
import { LeafIcon, TagIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@/app/components/icons';
import sproutsLogo       from '@/assets/sprouts.png';
import smartFinalLogo    from '@/assets/smart-final.png';
import groceryOutletLogo from '@/assets/grocery-outlet.png';
import calFreshLogo      from '@/assets/cal-fresh.png';
import traderJoesLogo    from '@/assets/trader-joes.png';
import ralphsLogo        from '@/assets/ralphs.png';
import food4lessLogo     from '@/assets/food4less.png';

const STORE_LOGOS = {
  "d509a460-ad97-4099-a6df-d03798e03d6d": sproutsLogo,
  "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": smartFinalLogo,
  "eefcee75-d1f4-49c3-8a40-c59982d72287": groceryOutletLogo,
  "9ae30061-19f8-41f5-8bdf-85694ddec2dc": calFreshLogo,
  "1971e92b-78af-4dcc-9bfa-cf3349b649ef": traderJoesLogo,
  "kroger-ralphs":    ralphsLogo,
  "kroger-food4less": food4lessLogo,
};

export default function GroceryListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [productCache, setProductCache] = useState({});
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [checkedStores, setCheckedStores] = useState(new Set(Object.keys(STORE_NAMES)));

  useEffect(() => {
    async function loadList() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('grocery_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error) {
        setItems(data);
        // Eagerly fetch all product data so grey-out works immediately
        const results = await Promise.all(
          data.map(item =>
            fetch(`/api/products?q=${encodeURIComponent(item.product_name)}`)
              .then(r => r.json())
              .then(products => ({
                name: item.product_name,
                match: products.find(p => p.name === item.product_name) || products[0] || null,
              }))
              .catch(() => ({ name: item.product_name, match: null }))
          )
        );
        const cache = {};
        results.forEach(({ name, match }) => { cache[name] = match; });
        setProductCache(cache);
      }
      setLoading(false);
    }
    loadList();
  }, [router]);

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.id !== id));
    setRemovedIds(prev => new Set(prev).add(id));
    setDirty(true);
  }

  function changeQty(id, delta) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
    setDirty(true);
  }

  async function toggleCard(item) {
    const { id, product_name } = item;
    if (expandedItems.has(id)) {
      setExpandedItems(prev => { const next = new Set(prev); next.delete(id); return next; });
      return;
    }
    setExpandedItems(prev => new Set(prev).add(id));
    if (productCache[product_name]) return;
    setLoadingItems(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(product_name)}`);
      const products = await res.json();
      const match = products.find(p => p.name === product_name) || products[0] || null;
      setProductCache(prev => ({ ...prev, [product_name]: match }));
    } finally {
      setLoadingItems(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  function isGreyedOut(item) {
    const product = productCache[item.product_name];
    if (!product?.prices?.length) return false;
    return product.prices.every(pr => !checkedStores.has(pr.store_id));
  }

  function toggleStore(id) {
    setCheckedStores(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function saveChanges() {
    setSaving(true);

    if (removedIds.size > 0) {
      await supabase.from('grocery_list').delete().in('id', [...removedIds]);
    }

    await Promise.all(
      items.map(item =>
        supabase.from('grocery_list').update({ quantity: item.quantity }).eq('id', item.id)
      )
    );

    setRemovedIds(new Set());
    setDirty(false);
    setSaving(false);
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--poly-green)' }}>
          My Grocery List
        </h1>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

        {!loading && items.length === 0 && !dirty && (
          <div className="card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <p>Your list is empty.</p>
            <p className="text-sm mt-1">Search for items and add them to your list.</p>
          </div>
        )}

        {!loading && (items.length > 0 || dirty) && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Grocery list */}
            <div className="flex-1 min-w-0">
              <ul className="flex flex-col gap-2">
                {items.map(item => {
                  const isExpanded = expandedItems.has(item.id);
                  const isLoading  = loadingItems.has(item.id);
                  const product    = productCache[item.product_name];
                  const greyed     = isGreyedOut(item);

                  const prices        = [...(product?.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                  const cheapest      = prices[0];
                  const displayStores = prices.slice(0, 3);
                  const cheapestStore = cheapest ? getStoreName(cheapest.store_id, cheapest.store_name) : null;
                  const lastUpdated   = prices.reduce((latest, pr) => {
                    if (!pr.scraped_at) return latest;
                    return !latest || new Date(pr.scraped_at) > new Date(latest) ? pr.scraped_at : latest;
                  }, null);
                  const whyText = cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price)
                    ? `${shortStoreName(cheapestStore)} has this item on sale — ${Math.round((1 - parseFloat(cheapest.price) / parseFloat(cheapest.original_price)) * 100)}% off regular price.`
                    : cheapestStore
                      ? `${shortStoreName(cheapestStore)} currently has the lowest price for this item across compared stores.`
                      : null;

                  return (
                    <li
                      key={item.id}
                      className="card overflow-hidden transition-opacity"
                      style={{ opacity: greyed ? 0.4 : 1 }}
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.product_name}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            aria-label={`Decrease quantity of ${item.product_name}`}
                            className="w-7 h-7 flex items-center justify-center text-sm border transition-colors"
                            style={{ borderColor: 'var(--poly-green)', color: 'var(--poly-green)', borderRadius: 'var(--radius-pill)' }}
                          >−</button>
                          <span className="w-5 text-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            aria-label={`Increase quantity of ${item.product_name}`}
                            className="w-7 h-7 flex items-center justify-center text-sm border transition-colors"
                            style={{ borderColor: 'var(--poly-green)', color: 'var(--poly-green)', borderRadius: 'var(--radius-pill)' }}
                          >+</button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>

                        <button
                          onClick={() => toggleCard(item)}
                          aria-label={isExpanded ? 'Collapse product details' : 'Expand product details'}
                          className="shrink-0 transition-colors"
                          style={{ color: 'var(--text-muted-accessible)' }}
                        >
                          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>
                      </div>

                      {isExpanded && (
                        isLoading ? (
                          <div className="px-5 pb-4 text-sm border-t" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)', background: '#fafafa' }}>
                            Loading…
                          </div>
                        ) : product ? (
                          <>
                            <div
                              className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3 border-t"
                              style={{ borderColor: 'var(--border-light)' }}
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                <ProductPlaceholder name={product.name} index={0} size="md" imageUrl={product.image_url} />
                                <div className="flex-1 min-w-0">
                                  {product.unit && (
                                    <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted-accessible)' }}>{product.unit}</p>
                                  )}
                                  {cheapestStore && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--savings-green-text)' }}>
                                      <LeafIcon />
                                      <span>Cheapest at {shortStoreName(cheapestStore)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {displayStores.map((pr, j) => {
                                  const store = shortStoreName(getStoreName(pr.store_id, pr.store_name));
                                  const isBest = pr === cheapest;
                                  return (
                                    <div
                                      key={j}
                                      className="text-center px-3 py-2 min-w-[72px]"
                                      style={{ background: isBest ? 'var(--savings-green)' : '#fafafa', borderRadius: 'var(--radius)' }}
                                    >
                                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted-accessible)' }}>{store}</p>
                                      <p className="text-sm font-bold" style={{ color: isBest ? 'var(--poly-green)' : 'var(--text-primary)' }}>
                                        ${parseFloat(pr.price).toFixed(2)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div
                              className="px-4 pb-4 pt-3 border-t grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:items-end"
                              style={{ borderColor: 'var(--border-light)', background: '#fafafa' }}
                            >
                              {whyText && (
                                <div className="flex items-start gap-2">
                                  <TagIcon style={{ color: 'var(--poly-green)', flexShrink: 0, marginTop: 2 }} />
                                  <div>
                                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Why this price?</p>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{whyText}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <ClockIcon style={{ color: 'var(--text-muted-accessible)', flexShrink: 0, marginTop: 2 }} />
                                <div>
                                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Last updated</p>
                                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatRelativeTime(lastUpdated)}</p>
                                </div>
                              </div>
                              <div>
                                <button
                                  onClick={() => { saveProductForDetail(product); router.push('/product'); }}
                                  className="text-sm font-medium text-white px-4 py-2 cursor-pointer"
                                  style={{ background: 'var(--poly-green)', borderRadius: 'var(--radius)' }}
                                >
                                  View details
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="px-5 pb-4 text-sm border-t" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)', background: '#fafafa' }}>
                            Product details unavailable.
                          </div>
                        )
                      )}
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={saveChanges}
                disabled={!dirty || saving}
                className="mt-6 w-full py-3 font-medium text-white transition-opacity disabled:opacity-30 disabled:pointer-events-none"
                style={{ background: 'var(--poly-green)', borderRadius: 'var(--radius)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Store filter panel */}
            <div className="w-full lg:w-56 shrink-0 lg:sticky lg:top-20 card p-4">
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Filter by store
              </p>
              {Object.entries(STORE_NAMES).map(([id, name]) => (
                <label key={id} className="flex items-center gap-2 py-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkedStores.has(id)}
                    onChange={() => toggleStore(id)}
                    className="w-4 h-4 shrink-0 accent-[var(--poly-green)]"
                  />
                  {STORE_LOGOS[id] && (
                    <img src={STORE_LOGOS[id].src} alt={name} style={{ height: 20, width: 'auto', objectFit: 'contain' }} />
                  )}
                </label>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
