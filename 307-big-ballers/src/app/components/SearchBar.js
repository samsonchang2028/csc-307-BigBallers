'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ placeholder = 'Search for eggs, milk, chicken...' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const trimmed = query.trim();
  const canSuggest = trimmed.length >= 2;

  useEffect(() => {
    if (!canSuggest) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const seen = new Set();
          const unique = data.filter(p => {
            if (seen.has(p.name)) return false;
            seen.add(p.name);
            return true;
          }).slice(0, 6);
          setSuggestions(unique);
          setOpen(unique.length > 0);
        }
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [trimmed, canSuggest]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function navigate(q) {
    setOpen(false);
    router.push(`/home?q=${encodeURIComponent(q.trim())}`);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) navigate(query);
    if (e.key === 'Escape') setOpen(false);
  }

  function handleSelect(name) {
    setQuery(name);
    navigate(name);
  }

  function handleChange(e) {
    const next = e.target.value;
    setQuery(next);
    if (next.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
    }
  }

  function cheapestPrice(product) {
    if (!product.prices?.length) return null;
    const min = Math.min(...product.prices.map(p => parseFloat(p.price)));
    return isNaN(min) ? null : min.toFixed(2);
  }

  const visibleSuggestions = canSuggest ? suggestions : [];
  const dropdownOpen = open && canSuggest;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className="flex items-center border rounded-full px-4 py-3 gap-2 shadow-sm"
        style={{ borderColor: dropdownOpen ? '#154734' : '#e5e7eb', background: '#fff', transition: 'border-color 0.15s' }}
      >
        <span className="text-gray-400 text-lg" aria-hidden="true">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => visibleSuggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          onClick={() => query.trim() && navigate(query)}
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ background: '#154734' }}
        >
          Search
        </button>
      </div>

      {dropdownOpen && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: '#fff', borderColor: '#e5e7eb' }}
        >
          {loading && (
            <li className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Searching…
            </li>
          )}
          {!loading && visibleSuggestions.map((product, i) => {
            const price = cheapestPrice(product);
            return (
              <li
                key={i}
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(product.name)}
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 text-sm border-b last:border-b-0"
                style={{ borderColor: '#f3f4f6' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base" aria-hidden="true">🛒</span>
                  <span className="truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                  {product.category && (
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {product.category}
                    </span>
                  )}
                </div>
                {price && (
                  <span className="text-sm font-semibold shrink-0 ml-3" style={{ color: '#154734' }}>
                    from ${price}
                  </span>
                )}
              </li>
            );
          })}
          {!loading && visibleSuggestions.length > 0 && (
            <li
              onClick={() => navigate(query)}
              className="px-4 py-2.5 cursor-pointer text-sm font-medium text-center"
              style={{ background: '#f9fafb', color: '#154734' }}
            >
              See all results for &apos;{query}&apos; →
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
