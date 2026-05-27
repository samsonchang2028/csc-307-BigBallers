'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GroceryListPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // loads exisiting list from supabase if existing
    async function loadList() {
      // Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      // If no user is logged inthen send em to /login
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch this user's grocery list from Supabase.
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
    // Delete the row by its primary key
    const { error } = await supabase
      .from('grocery_list')
      .delete()
      .eq('id', id);

    if (!error) {
      // Update local state so the UI removes the item immediately
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/home')}
          className="text-sm text-gray-500 underline"
        >
          Back to search
        </button>
        <h1 className="text-2xl font-bold">My Grocery List</h1>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && items.length === 0 && (
        <p className="text-gray-400">
          Your list is empty. Search for items on the{' '}
          <button onClick={() => router.push('/home')} className="underline">
            home page
          </button>{' '}
          and hit + to add them.
        </p>
      )}

      {/* the actual list of items, with a remove button for each */}
      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-3 max-w-md">
          {items.map(item => (
            <li key={item.id} className="flex justify-between items-center border rounded px-4 py-3">
              <span>{item.product_name}</span>
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
