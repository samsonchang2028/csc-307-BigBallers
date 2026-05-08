'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in even though they shouldnt be able to get here without being logged in, this is just in case they type in the url or something
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
      } else {
        setUser(data.user);
      }
    }
    checkUser();
  }, []);

  async function handleLogout() {
    //kill session and then send them to login page
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Show nothing while we're still checking the session
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Opticart</h1>
      <p className="text-gray-600">You are logged in as: {user.email}</p>
      <button
        onClick={handleLogout}
        className="bg-black text-white rounded px-4 py-2"
      >
        Log out
      </button>
    </div>
  );
}
