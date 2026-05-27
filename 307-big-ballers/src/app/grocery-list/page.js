'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GroceryListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadList() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // quantity column now comes from the DB
      const { data, error } = await supabase
        .from('grocery_list')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error) setItems(data);
      setLoading(false);
    }
    loadList();
  }, [router]);

  async function removeItem(id) {
    const { error } = await supabase.from('grocery_list').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(item => item.id !== id));
  }

  // Update quantity in local state AND in the DB so it persists across sessions
  async function changeQty(id, delta) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);

    // Optimistic update — update UI immediately, then sync to DB
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    await supabase.from('grocery_list').update({ quantity: newQty }).eq('id', id);
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

      {!loading && items.length === 0 && (
        <p className="text-gray-400">
          Your list is empty.{' '}
          <button onClick={() => router.push('/home')} className="underline">Search for items</button>
          {' '}and hit + to add them.
        </p>
      )}

      {!loading && items.length > 0 && (
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

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
