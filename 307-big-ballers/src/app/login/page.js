'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  // updates ui when changed
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //the error message if user isnt in supabase or psw wrong
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //async to allow supabase to check credentials
  async function handleLogin(e) {
     // stops the browser from reloading the page on form submit
    e.preventDefault();
    setLoading(true);
    setError(null);

    //Supabase returns {data, error}
    const { data, error } = await supabase.auth.signInWithPassword({ email, password});

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // go to dashboard if login successful
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm p-8 border shadow">
        <h1 className="text-2xl font-bold">Log in to Opticart</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
