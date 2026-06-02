'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryChip from '@/app/components/CategoryChip';
import DealCard, { DealCardSkeleton } from '@/app/components/DealCard';
import StorePanel from '@/app/components/StorePanel';
import { CATEGORIES } from '@/app/components/constants';
import { saveProductForDetail } from '@/app/components/utils';
import { TagIcon, ArrowRightIcon } from '@/app/components/icons';

export default function RootPage() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeStore, setActiveStore] = useState(null);

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.json())
      .then(data => {
        setDeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function goToSearch(query, isCategory, label) {
    if (isCategory) setActiveCategory(label);
    const param = isCategory ? `category=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
    router.push(`/home?${param}`);
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
            onClick={() => router.push('/home')}
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
