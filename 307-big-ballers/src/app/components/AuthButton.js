'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// im jus using this component in the header to show the user email and a logout button if they're logged in, or a login button if they're not
export default function AuthButton() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="bg-black text-white rounded px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className="bg-black text-white rounded px-4 py-2 text-sm"
    >
      Log in
    </button>
  );
}
