'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryChip from '@/app/components/CategoryChip';
import DealCard, { DealCardSkeleton } from '@/app/components/DealCard';
import Footer from '@/app/components/Footer';
import { CATEGORIES } from '@/app/components/constants';
import { saveProductForDetail } from '@/app/components/utils';
import { TagIcon, ArrowRightIcon } from '@/app/components/icons';

export default function RootPage() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <div
        className="border-b"
        style={{ background: '#fff', borderColor: 'var(--border-light)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-3 flex-wrap">
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <TagIcon style={{ color: 'var(--poly-green)' }} />
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Best Deals Today
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              The biggest savings across your favorite stores
            </p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70 shrink-0 mt-1"
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
                  animationDelay={i * 60}
                  onClick={() => {
                    saveProductForDetail({
                      name: deal.name,
                      prices: [{
                        price: deal.price,
                        original_price: deal.original_price,
                        store_id: deal.store_id,
                        store_name: deal.store_name,
                      }],
                    });
                    router.push('/product');
                  }}
                />
              ))}
        </div>

        {!loading && deals.length === 0 && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            No deals found right now. Check back soon!
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
