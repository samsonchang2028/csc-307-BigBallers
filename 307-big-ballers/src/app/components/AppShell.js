"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const BARE_ROUTES = ["/login", "/auth/callback"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (BARE_ROUTES.includes(pathname)) return children;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
