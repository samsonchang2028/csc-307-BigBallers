"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, HeartIcon, InfoIcon, GradCapIcon, CloseIcon } from "./icons";
import CalPolyBadge from "./CalPolyBadge";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/home", label: "Search", icon: SearchIcon },
  { href: "/grocery-list", label: "Grocery List", icon: HeartIcon },
  { href: "/#about", label: "About", icon: InfoIcon },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/home")) return pathname === "/home";
    return pathname === href.split("?")[0];
  }

  const panel = (
    <aside
      className="w-52 shrink-0 flex flex-col border-r p-4 h-full"
      style={{ background: "#fff", borderColor: "var(--border-light)" }}
    >
      <div className="flex items-center justify-end md:hidden mb-2">
        <button onClick={onClose} aria-label="Close menu" style={{ color: "var(--text-secondary)" }}>
          <CloseIcon />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer rounded"
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
            <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
              Save more. Stress less. We compare prices at local stores so you don&apos;t have to.
            </p>
          </div>
        </div>
        <CalPolyBadge />
      </div>
    </aside>
  );

  return (
    <>
      {/* Static sidebar on md+ */}
      <div className="hidden md:flex">{panel}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full">{panel}</div>
        </div>
      )}
    </>
  );
}
