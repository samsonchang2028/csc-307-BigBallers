'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductPlaceholder from '@/app/components/ProductPlaceholder';
import { getStoreName } from '@/app/components/constants';
import { formatRelativeTime, saveProductForDetail, shortStoreName } from '@/app/components/utils';
import { LeafIcon, TagIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@/app/components/icons';

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

  useEffect(() => {
    async function loadList() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('grocery_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error) setItems(data);
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
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--poly-green)' }}>
          My Grocery List
        </h1>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}

        {!loading && items.length === 0 && !dirty && (
          <div className="card p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <p className="text-4xl mb-3">🥦</p>
            <p>Your list is empty.</p>
            <p className="text-sm mt-1">Search for items and add them to your list.</p>
          </div>
        )}

        {!loading && (items.length > 0 || dirty) && (
          <>
            <ul className="flex flex-col gap-2">
              {items.map(item => {
                const isExpanded = expandedItems.has(item.id);
                const isLoading  = loadingItems.has(item.id);
                const product    = productCache[item.product_name];

                const prices       = [...(product?.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                const cheapest     = prices[0];
                const displayStores = prices.slice(0, 3);
                const cheapestStore = cheapest ? getStoreName(cheapest.store_id, cheapest.store_name) : null;
                const lastUpdated  = prices.reduce((latest, pr) => {
                  if (!pr.scraped_at) return latest;
                  return !latest || new Date(pr.scraped_at) > new Date(latest) ? pr.scraped_at : latest;
                }, null);
                const whyText = cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price)
                  ? `${shortStoreName(cheapestStore)} has this item on sale — ${Math.round((1 - parseFloat(cheapest.price) / parseFloat(cheapest.original_price)) * 100)}% off regular price.`
                  : cheapestStore
                    ? `${shortStoreName(cheapestStore)} currently has the lowest price for this item across compared stores.`
                    : null;

                return (
                  <li key={item.id} className="card overflow-hidden">
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
          </>
        )}
      </div>
    </div>
  );
}
