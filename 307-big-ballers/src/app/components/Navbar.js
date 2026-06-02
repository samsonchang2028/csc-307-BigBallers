'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import AuthButton from './AuthButton';
import { SearchIcon, HeartIcon, CloseIcon, MenuIcon } from './icons';

const HIDDEN_ON = ['/login', '/auth/callback'];

function NavbarInner({ searchInput, onSearchChange, onSearch, onMenuClick }) {
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
      className="sticky top-0 z-40 border-b bg-white"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden shrink-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MenuIcon />
          </button>
        )}

        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-xl" style={{ color: 'var(--poly-green)' }}>
            OptiCart
          </span>
          <span
            className="hidden lg:block text-xs pl-3 border-l"
            style={{ color: 'var(--text-muted-accessible)', borderColor: 'var(--border)' }}
          >
            Grocery deals for Cal Poly students
          </span>
        </Link>

        <div
          className="flex flex-1 items-center rounded-full px-4 py-2 gap-2 max-w-xl mx-auto border min-w-0"
          style={{ borderColor: 'var(--border)', background: '#fafafa' }}
        >
          <SearchIcon style={{ color: 'var(--text-muted-accessible)', flexShrink: 0 }} />
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search for eggs, milk, chicken..."
            aria-label="Search products"
            className="search-input flex-1 bg-transparent outline-none text-sm border-none min-w-0"
          />
          {value && (
            <button
              onClick={clearSearch}
              className="cursor-pointer shrink-0"
              style={{ color: 'var(--text-muted-accessible)' }}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link href="/grocery-list" className="hidden sm:flex flex-col items-center gap-0.5" title="Grocery List">
            <HeartIcon style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Grocery List
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
