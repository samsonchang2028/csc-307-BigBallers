'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthButton from './AuthButton';

const HIDDEN_ON = ['/login', '/auth/callback'];

export default function Navbar({ searchInput, onSearchChange, onSearch }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState('');

  // Seed the input from the URL ?q= param whenever it changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setLocalSearch(q);
  }, [searchParams]);

  if (HIDDEN_ON.includes(pathname)) return null;

  // Support both controlled (props) and uncontrolled (local state) modes
  const isControlled = onSearchChange !== undefined;
  const value = isControlled ? searchInput : localSearch;

  function handleChange(e) {
    if (isControlled) onSearchChange(e.target.value);
    else setLocalSearch(e.target.value);
  }

  function handleSearch() {
    if (onSearch) onSearch(value);
    else if (value.trim()) router.push(`/home?q=${encodeURIComponent(value.trim())}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }} className="px-6 py-3 flex items-center gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-2xl">🛒</span>
        <span className="font-bold text-xl" style={{ color: '#154734' }}>OptiCart</span>
      </Link>

      {/* Search bar */}
      <div className="flex flex-1 items-center border rounded-full px-4 py-2 gap-2" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for eggs, milk, chicken..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button onClick={handleSearch} className="text-gray-400 hover:text-gray-600">
          🔍
        </button>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/grocery-list" title="Grocery List" className="text-gray-500 hover:text-gray-700 text-xl">🛒</Link>
        <AuthButton />
      </div>
    </nav>
  );
}
