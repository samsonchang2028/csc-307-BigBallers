"use client";
import { useEffect } from "react";

const STORE_DATA = {
  "Sprouts": {
    emoji: "🌿",
    address: "1422 Calle Joaquin, San Luis Obispo, CA 93405",
    phone: "(805) 541-6480",
    hours: [
      { day: "Mon–Sat", time: "7:00 AM – 10:00 PM" },
      { day: "Sunday",  time: "7:00 AM – 9:00 PM"  },
    ],
    website: "https://www.sprouts.com",
    description: "Farmers market-style grocery store specializing in fresh, natural, and organic foods at affordable prices.",
    tags: ["Organic", "Natural", "Bulk Foods", "Fresh Produce"],
  },
  "Smart & Final": {
    emoji: "🏪",
    address: "1235 Madonna Rd, San Luis Obispo, CA 93405",
    phone: "(805) 543-3737",
    hours: [
      { day: "Mon–Sun", time: "6:00 AM – 11:00 PM" },
    ],
    website: "https://www.smartandfinal.com",
    description: "Warehouse-style grocery store offering bulk quantities and everyday essentials at competitive prices.",
    tags: ["Bulk", "Warehouse", "Everyday Essentials"],
  },
  "Grocery Outlet": {
    emoji: "🏷️",
    address: "3977 S Higuera St, San Luis Obispo, CA 93401",
    phone: "(805) 439-3700",
    hours: [
      { day: "Mon–Sun", time: "8:00 AM – 9:00 PM" },
    ],
    website: "https://www.groceryoutlet.com",
    description: "Independently operated discount grocery store offering deeply discounted name-brand and organic products.",
    tags: ["Discount", "Name Brands", "Organic Deals"],
  },
  "Cal Fresh": {
    emoji: "🎓",
    address: "1 Grand Ave, San Luis Obispo, CA 93407",
    phone: "(805) 756-1000",
    hours: [
      { day: "Mon–Fri", time: "8:00 AM – 6:00 PM" },
      { day: "Sat–Sun", time: "Closed" },
    ],
    website: "https://www.calpolyfoodpantry.org",
    description: "Cal Poly's on-campus food resource supporting students with affordable and accessible grocery options.",
    tags: ["Student Friendly", "On-Campus", "Affordable"],
  },
  "Trader Joe's": {
    emoji: "🌺",
    address: "3977 S Higuera St Ste 100, San Luis Obispo, CA 93401",
    phone: "(805) 783-2780",
    hours: [
      { day: "Mon–Sun", time: "8:00 AM – 9:00 PM" },
    ],
    website: "https://www.traderjoes.com",
    description: "Neighborhood grocery store known for unique private-label products, international foods, and great value.",
    tags: ["Private Label", "International", "Unique Products"],
  },
  "Ralphs": {
    emoji: "🛒",
    address: "1117 Los Osos Valley Rd, Los Osos, CA 93402",
    phone: "(805) 528-5300",
    hours: [
      { day: "Mon–Sun", time: "6:00 AM – 11:00 PM" },
    ],
    website: "https://www.ralphs.com",
    description: "Full-service supermarket chain offering a wide selection of groceries, fresh produce, and household items.",
    tags: ["Full Service", "Pharmacy", "Loyalty Rewards"],
  },
  "Food 4 Less": {
    emoji: "💲",
    address: "1030 Higuera St, San Luis Obispo, CA 93401",
    phone: "(805) 543-3737",
    hours: [
      { day: "Mon–Sun", time: "6:00 AM – 11:00 PM" },
    ],
    website: "https://www.food4less.com",
    description: "No-frills warehouse-style grocery store offering low prices on everyday groceries and fresh produce.",
    tags: ["Low Prices", "No Frills", "Warehouse Style"],
  },
};

export default function StorePanel({ storeName, onClose }) {
  const store = STORE_DATA[storeName];

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto shadow-2xl"
        style={{ width: 360, background: "#fff", animation: "slideInRight 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Store Info
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none"
              style={{ background: "#f3f4f6", color: "#6b7280" }}
              aria-label="Close store panel"
            >
              ×
            </button>
          </div>

          {/* Store image placeholder */}
          <div
            className="w-full h-36 rounded-xl flex items-center justify-center text-6xl mb-4"
            style={{ background: "#f0faf4" }}
          >
            {store ? store.emoji : "🏪"}
          </div>

          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {storeName}
          </h2>

          {store && (
            <div className="flex flex-wrap gap-1 mt-2">
              {store.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "#e6f4ea", color: "#154734" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {store ? (
          <div className="flex flex-col gap-5 p-5">
            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {store.description}
            </p>

            {/* Address */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>
                Address
              </p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{store.address}</p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>
                Phone
              </p>
              <a
                href={`tel:${store.phone}`}
                className="text-sm font-medium"
                style={{ color: "#154734" }}
              >
                {store.phone}
              </a>
            </div>

            {/* Hours */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>
                Store Hours
              </p>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                {store.hours.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-4 py-2 text-sm"
                    style={{
                      background: i % 2 === 0 ? "#f9fafb" : "#fff",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>{h.day}</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Website */}
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors"
              style={{ borderColor: "#154734", color: "#154734" }}
            >
              🌐 Visit Website
            </a>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No additional info available for this store.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
