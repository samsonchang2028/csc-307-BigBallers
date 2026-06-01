'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import AuthButton from './AuthButton';
import { SearchIcon, HeartIcon, CloseIcon } from './icons';

const HIDDEN_ON = ['/login', '/auth/callback'];

function NavbarInner({ searchInput, onSearchChange, onSearch }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && pathname === '/home') setLocalSearch(q);
  }, [searchParams, pathname]);

  if (HIDDEN_ON.includes(pathname)) return null;

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

  function clearSearch() {
    if (isControlled) onSearchChange('');
    else setLocalSearch('');
  }

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-sm"
      style={{ background: 'rgba(255,255,255,0.92)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <span className="font-bold text-[22px] tracking-tight" style={{ color: 'var(--poly-green)' }}>
            OptiCart
          </span>
          <span
            className="hidden lg:block text-xs font-medium pl-3 border-l"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            Grocery deals for Cal Poly students
          </span>
        </Link>

        <div
          className="flex flex-1 items-center rounded-full px-4 py-2.5 gap-2.5 max-w-xl mx-auto transition-shadow"
          style={{ border: '1.5px solid var(--border)', background: '#fafafa' }}
        >
          <SearchIcon style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for eggs, milk, chicken..."
            className="search-input flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          {value && (
            <button
              onClick={clearSearch}
              className="p-0.5 rounded-full transition-colors hover:bg-gray-200"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/grocery-list"
            className="flex flex-col items-center gap-0.5 group transition-colors"
            title="Favorites"
          >
            <HeartIcon
              className="transition-colors group-hover:stroke-[var(--poly-green)]"
              style={{ color: 'var(--text-secondary)' }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Favorites
            </span>
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

export default function Navbar(props) {
  return (
    <Suspense fallback={null}>
      <NavbarInner {...props} />
    </Suspense>
  );
}
