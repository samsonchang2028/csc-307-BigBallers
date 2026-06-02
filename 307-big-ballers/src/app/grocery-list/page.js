'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GroceryListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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
              {items.map(item => (
                <li
                  key={item.id}
                  className="card flex items-center gap-4 px-5 py-4"
                >
                  <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.product_name}
                  </span>

                  {/* Quantity controls */}
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
                </li>
              ))}
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
