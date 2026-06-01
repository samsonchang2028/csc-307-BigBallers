'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserIcon } from './icons';

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
      <button
        onClick={handleSignOut}
        className="flex flex-col items-center gap-0.5 group transition-colors"
        title="Sign out"
      >
        <UserIcon style={{ color: 'var(--poly-green)' }} />
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Sign out
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className="flex flex-col items-center gap-0.5 group transition-colors"
      title="Log in"
    >
      <UserIcon
        className="transition-colors group-hover:stroke-[var(--poly-green)]"
        style={{ color: 'var(--text-secondary)' }}
      />
      <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        Log in
      </span>
    </button>
  );
}
