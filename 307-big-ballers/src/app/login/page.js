'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  // useState creates a piece of state. Think of it as a variable React watches.
  // When you call setEmail("something"), React updates the UI automatically.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // holds any error message to show the user
  const [loading, setLoading] = useState(false); // tracks whether we're waiting on Supabase

  const router = useRouter();

  // This runs when the user submits the form.
  // It's async because talking to Supabase takes time (network request).
  async function handleLogin(e) {
    e.preventDefault(); // stops the browser from reloading the page on form submit
    setLoading(true);
    setError(null);

    // Ask Supabase to check the email + password.
    // Supabase returns { data, error } — we destructure both.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message); // show the error to the user
    } else {
      router.push('/dashboard'); // success → go to dashboard
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm p-8 border rounded-lg shadow"
      >
        <h1 className="text-2xl font-bold">Log in</h1>

        {/* If there's an error, show it in red */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // update state as user types
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
