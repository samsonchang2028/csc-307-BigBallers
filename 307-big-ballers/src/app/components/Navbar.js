'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';

const links = [
  { label: 'Home',         href: '/' },
  { label: 'Search',       href: '/home' },
  { label: 'Grocery List', href: '/grocery-list' },
];

// Pages where the navbar should not appear
const HIDDEN_ON = ['/login', '/auth/callback'];

export default function Navbar() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="bg-green-600 text-white px-6 py-3 flex items-center gap-8">
      <span className="font-bold text-lg tracking-tight">OptiCart</span>

      <div className="flex gap-6 flex-1">
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

      <AuthButton />
    </nav>
  );
}
