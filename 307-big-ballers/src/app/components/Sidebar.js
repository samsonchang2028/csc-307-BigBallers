"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, HeartIcon, TagIcon, InfoIcon, GradCapIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/home", label: "Search", icon: SearchIcon },
  { href: "/grocery-list", label: "Favorites", icon: HeartIcon },
  { href: "/home?category=Dairy", label: "Deals", icon: TagIcon },
  { href: "/#about", label: "About", icon: InfoIcon },
];

function CalPolyBadge() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="4" fill="#154734" />
      <text x="24" y="31" textAnchor="middle" fill="#F8E08E" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">
        CP
      </text>
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/home")) return pathname === "/home";
    return pathname === href.split("?")[0];
  }

  return (
    <aside
      className="w-52 shrink-0 flex flex-col border-r p-4"
      style={{ background: "#fff", borderColor: "var(--border-light)", minHeight: "calc(100vh - 73px)" }}
    >
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer"
              style={
                active
                  ? { background: "var(--savings-green)", color: "var(--poly-green)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <Icon style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto p-4 border"
        style={{ background: "#faf9f6", borderColor: "var(--border-light)", borderRadius: "var(--radius)" }}
      >
        <div className="flex items-start gap-2 mb-3">
          <div style={{ color: "var(--poly-green)" }}>
            <GradCapIcon style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-xs font-semibold leading-snug" style={{ color: "var(--poly-green)" }}>
              Built for Cal Poly
            </p>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
              Save more. Stress less. We compare prices at local stores so you don&apos;t have to.
            </p>
          </div>
        </div>
        <CalPolyBadge />
      </div>
    </aside>
  );
}
