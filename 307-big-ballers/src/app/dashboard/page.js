'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState(null); // will hold the logged-in user's info
  const router = useRouter();

  useEffect(() => {
    // When this page loads, check if there's a real logged-in session.
    // This prevents someone from just typing /dashboard in the URL bar to skip login.
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login'); // no session → kick them back to login
      } else {
        setUser(data.user); // session found → save the user so we can show their email
      }
    }
    checkUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut(); // clears the session from the browser
    router.push('/login');
  }

  // Show nothing while we're still checking the session
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome!</h1>
      <p className="text-gray-600">Logged in as: {user.email}</p>
      <button
        onClick={handleLogout}
        className="bg-black text-white rounded px-4 py-2"
      >
        Log out
      </button>
    </div>
  );
}
