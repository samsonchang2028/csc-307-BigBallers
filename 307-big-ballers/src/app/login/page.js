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

  function switchMode(next) { setMode(next); setError(null); setSuccess(null); }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/');
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else if (data.user?.identities?.length === 0) setError('This email is already registered');
    else if (data.session) router.push('/');
    else setSuccess('Check your email to confirm your account, then log in.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🛒</span>
          <h1 className="text-2xl font-bold mt-2" style={{ color: '#154734' }}>OptiCart</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Compare grocery prices across local stores</p>
        </div>

        <form
          onSubmit={mode === 'login' ? handleLogin : handleSignup}
          className="card p-8 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Log in to your account' : 'Create an account'}
          </h2>

          {error   && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => e.target.style.borderColor = '#154734'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded-lg px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)' }}
            onFocus={e => e.target.style.borderColor = '#154734'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: '#154734' }}
          >
            {loading
              ? (mode === 'login' ? 'Logging in...' : 'Signing up...')
              : (mode === 'login' ? 'Log in' : 'Sign up')}
          </button>

          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <>No account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-medium" style={{ color: '#154734' }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-medium" style={{ color: '#154734' }}>
                  Log in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
