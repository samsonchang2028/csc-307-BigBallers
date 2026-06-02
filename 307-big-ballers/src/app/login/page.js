'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import cartIcon from '@/assets/opticart-logo.png';
import textLogo from '@/assets/opticart-text-logo.png';

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src={cartIcon.src} alt="OptiCart" style={{ height: 64, width: 'auto' }} />
          <img src={textLogo.src} alt="OptiCart" style={{ height: 36, width: 'auto', marginTop: 8 }} />
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your groceries, one destination
          </p>
        </div>

        <form
          onSubmit={mode === 'login' ? handleLogin : handleSignup}
          className="card p-8 flex flex-col gap-4"
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Log in to your account' : 'Create an account'}
          </h2>

          {error   && <p className="text-sm text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: 'var(--radius)' }}>{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2" style={{ borderRadius: 'var(--radius)' }}>{success}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="search-input border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="search-input border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'var(--poly-green)', borderRadius: 'var(--radius)' }}
          >
            {loading
              ? (mode === 'login' ? 'Logging in...' : 'Signing up...')
              : (mode === 'login' ? 'Log in' : 'Sign up')}
          </button>

          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? (
              <>No account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-medium" style={{ color: 'var(--poly-green)' }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-medium" style={{ color: 'var(--poly-green)' }}>
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
