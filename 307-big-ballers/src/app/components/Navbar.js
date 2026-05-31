'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';

const links = [
  { label: 'Home',         href: '/' },
  { label: 'Search',       href: '/search' },
  { label: 'Grocery List', href: '/grocery-list' },
];

// Pages where the navbar should not appear
const HIDDEN_ON = ['/login', '/auth/callback'];

export default function Navbar() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent text-white px-6 py-3 flex items-center">
      <span className="font-bold text-3xl tracking-tight w-1/4">OptiCart</span>

      <div className="flex gap-6 justify-center flex-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm hover:text-green-200 transition-colors ${
              pathname === link.href ? 'font-semibold underline underline-offset-4' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="w-1/4 flex justify-end">
        <AuthButton />
      </div>
    </nav>
  );
}
