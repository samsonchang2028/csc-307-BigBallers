'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  function switchMode(next) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.session) {
      router.push('/');
    } else {
      setSuccess('Check your email to confirm your account, then log in.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={mode === 'login' ? handleLogin : handleSignup}
        className="flex flex-col gap-4 w-full max-w-sm p-8 border shadow"
      >
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? 'Log in to Opticart' : 'Sign up for Opticart'}
        </h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

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
          {loading
            ? mode === 'login' ? 'Logging in...' : 'Signing up...'
            : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <p className="text-sm text-center text-gray-500">
          {mode === 'login' ? (
            <>No account?{' '}
              <button type="button" onClick={() => switchMode('signup')} className="underline">
                Sign up
              </button>
            </>
          ) : (
            <>Have an account?{' '}
              <button type="button" onClick={() => switchMode('login')} className="underline">
                Log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
