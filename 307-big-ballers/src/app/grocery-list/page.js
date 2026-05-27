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
    <main className="min-h-screen bg-green-50 px-6 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-green-800 mb-6">My Grocery List</h1>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && items.length === 0 && !dirty && (
          <div className="bg-white rounded-xl border border-green-100 p-8 text-center text-gray-400">
            <p className="text-4xl mb-3">🥦</p>
            <p>Your list is empty.</p>
            <p className="text-sm mt-1">Search for items and hit + to add them.</p>
          </div>
        )}

        {!loading && (items.length > 0 || dirty) && (
          <>
            <ul className="flex flex-col gap-2">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 bg-white border border-green-100 rounded-xl px-5 py-4 shadow-sm"
                >
                  <span className="flex-1 font-medium text-gray-800">{item.product_name}</span>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-7 h-7 rounded-full border border-green-300 text-green-700 hover:bg-green-100 flex items-center justify-center text-sm"
                    >−</button>
                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="w-7 h-7 rounded-full border border-green-300 text-green-700 hover:bg-green-100 flex items-center justify-center text-sm"
                    >+</button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {dirty && (
              <button
                onClick={saveChanges}
                disabled={saving}
                className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
