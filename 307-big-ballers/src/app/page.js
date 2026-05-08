'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// This is the homepage ("/"). It doesn't show anything — it just checks
// whether the user is already logged in and sends them to the right place.
export default function Home() {
  const router = useRouter(); // lets us navigate programmatically

  useEffect(() => {
    // useEffect runs this function once when the page loads.
    // We check if Supabase has a saved session (i.e. the user already logged in).
    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/dashboard'); // logged in → go to dashboard
      } else {
        router.replace('/login'); // not logged in → go to login
      }
    }
    checkSession();
  }, []); // the empty [] means "run this only once on mount"

  return null; // nothing to show while redirecting
}
