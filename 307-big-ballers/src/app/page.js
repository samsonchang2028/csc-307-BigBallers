'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ItemCard from '@/app/components/ItemCard';
import StorePanel from '@/app/components/StorePanel';

const CATEGORIES = [
  { label: 'Dairy',    emoji: '🥛', query: 'Dairy',          isCategory: true },
  { label: 'Produce',  emoji: '🥬', query: 'Fruit',          isCategory: true },
  { label: 'Meat',     emoji: '🥩', query: 'Meat & Seafood', isCategory: true },
  { label: 'Bakery',   emoji: '🥐', query: 'Bakery',         isCategory: true },
  { label: 'Pantry',   emoji: '🥫', query: 'Grains & Pasta', isCategory: true },
  { label: 'Snacks',   emoji: '🍿', query: 'Snacks',         isCategory: true },
];

export default function RootPage() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeStore, setActiveStore] = useState(null);

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setDeals(data) : setDeals([]));
  }, []);

  function goToSearch(query, isCategory) {
    const param = isCategory ? `category=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
    router.push(`/home?${param}`);
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Category chips */}
      <div className="px-6 py-4 flex gap-3 flex-wrap" style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => goToSearch(cat.query, cat.isCategory)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:border-transparent"
            style={{ borderColor: 'var(--border)', background: '#f9fafb' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#154734'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#154734'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Best Deals Today */}
      <div className="px-6 py-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Best Deals Today</h2>
          <button
            onClick={() => router.push('/home')}
            className="text-sm font-medium"
            style={{ color: '#154734' }}
          >
            View all deals →
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Top price drops and biggest savings across stores
        </p>

        {deals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading deals...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deals.map((deal, i) => (
              <div
                key={i}
                className="card text-left p-4 hover:shadow-md transition-shadow flex flex-col gap-2 cursor-pointer"
                onClick={() => setSelectedProduct({ name: deal.name, prices: [{ price: deal.price, original_price: deal.original_price, store_id: deal.store_id, store_name: deal.store_name }] })}
              >
                {/* Top: image + name/price */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-3xl" style={{ background: '#f3f4f6' }}>
                    🛒
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{deal.name}</p>
                    <p className="text-2xl font-bold" style={{ color: '#154734' }}>
                      ${parseFloat(deal.price).toFixed(2)}
                    </p>
                    {/* Clickable store name */}
                    <button
                      onClick={e => { e.stopPropagation(); setActiveStore(deal.store_name); }}
                      className="text-xs hover:underline text-left"
                      style={{ color: '#154734' }}
                    >
                      {deal.store_name}
                    </button>
                  </div>
                </div>
                {/* Savings badge */}
                <div className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#f0faf4', color: '#154734' }}>
                  <span>🏷</span>
                  <span>save <strong>${deal.savings}</strong> vs other stores</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer taglines */}
      <div className="px-6 py-8 grid grid-cols-3 gap-4 text-center border-t" style={{ borderColor: 'var(--border)' }}>
        {[
          { icon: '🏪', title: 'Compare prices', sub: 'Across local stores' },
          { icon: '💰', title: 'Save money',     sub: 'Find the best deals' },
          { icon: '🛒', title: 'Shop smarter',   sub: 'Every day' },
        ].map(item => (
          <div key={item.title}>
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ItemCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {activeStore && (
        <StorePanel storeName={activeStore} onClose={() => setActiveStore(null)} />
      )}
    </main>
  );
}
