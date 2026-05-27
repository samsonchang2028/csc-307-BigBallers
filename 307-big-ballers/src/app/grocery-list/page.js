'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GroceryListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set()); // IDs deleted locally but not yet in DB
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false); // true when there are unsaved changes

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
    // Only update local state — DB delete happens on Save
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

    // Delete removed items
    if (removedIds.size > 0) {
      await supabase.from('grocery_list').delete().in('id', [...removedIds]);
    }

    // Update quantities for remaining items
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
    <main className="min-h-screen p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/home')} className="text-sm text-gray-500 underline">
          Back to search
        </button>
        <h1 className="text-2xl font-bold">My Grocery List</h1>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && items.length === 0 && !dirty && (
        <p className="text-gray-400">
          Your list is empty.{' '}
          <button onClick={() => router.push('/home')} className="underline">Search for items</button>
          {' '}and hit + to add them.
        </p>
      )}

      {!loading && (items.length > 0 || dirty) && (
        <>
          <ul className="flex flex-col gap-3 max-w-md">
            {items.map(item => (
              <li key={item.id} className="flex items-center gap-4 border rounded px-4 py-3">
                <span className="flex-1 font-medium">{item.product_name}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="w-7 h-7 border rounded hover:bg-gray-100"
                  >−</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="w-7 h-7 border rounded hover:bg-gray-100"
                  >+</button>
                </div>

                <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {dirty && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="mt-6 bg-black text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </>
      )}
    </main>
  );
}
