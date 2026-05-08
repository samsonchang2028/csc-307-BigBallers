'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// This page doesnt rlly appear it just uses / and checks if the user is logged in or not and redirects them to the right place
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // checking if the user is already logged in
    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      // user is logged in
      if (data.user) {
        router.replace('/dashboard');
      // user is not logged in so put em on login page
      } else {
        router.replace('/login');
      }
    }
    checkSession();
    // run when we first load the app
  }, []);

  // we dotn need any components on this page caus this is basically redirect page
  return null;
}
