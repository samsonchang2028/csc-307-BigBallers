"use client";
import { useState } from "react";
import StorePanel from "./StorePanel";

const STORE_NAMES = {
  "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
  "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
  "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
  "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
  "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
};

function getStoreName(pr) {
  return pr.store_name ?? STORE_NAMES[pr.store_id] ?? pr.store_id ?? "Unknown";
}

function formatDate(scraped_at) {
  if (!scraped_at) return "—";
  const d = new Date(scraped_at);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ItemCard({ product, onClose }) {
  const [activeStore, setActiveStore] = useState(null);

  const prices = product.prices ?? [];
  const sorted = [...prices].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = sorted[0] ?? null;
  const nextCheapest = sorted[1] ?? null;

  const allPrices = sorted.map(p => parseFloat(p.price));
  const highest = allPrices.length ? Math.max(...allPrices) : null;
  const lowest  = allPrices.length ? Math.min(...allPrices) : null;
  const avg     = allPrices.length ? (allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : null;

  const savingsVsNext = cheapest && nextCheapest
    ? (parseFloat(nextCheapest.price) - parseFloat(cheapest.price)).toFixed(2)
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden"
          style={{ maxWidth: 780 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={onClose}
              className="text-sm mb-3 flex items-center gap-1"
              style={{ color: '#154734' }}
            >
              ← Back to results
            </button>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center text-4xl" style={{ background: '#f3f4f6' }}>
                🛒
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>
                  {product.category && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#e6f4ea', color: '#154734' }}>
                      {product.category}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0">&times;</button>
            </div>
          </div>

          {/* Body: two columns */}
          <div className="flex gap-0">
            {/* Left: price comparison table */}
            <div className="flex-1 p-6 border-r" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Price Comparison</h3>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-sm">
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th className="text-left px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Store</th>
                      <th className="text-right px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Current</th>
                      <th className="text-right px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Regular</th>
                      <th className="text-right px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((pr, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: 'var(--border)', background: i === 0 ? '#f0faf4' : '#fff' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {i === 0 && <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: '#154734' }} />}
                          <button
                            onClick={e => { e.stopPropagation(); setActiveStore(getStoreName(pr)); }}
                            className="hover:underline text-left"
                            style={{ color: '#154734' }}
                          >
                            {getStoreName(pr)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right font-bold" style={{ color: i === 0 ? '#154734' : 'var(--text-primary)' }}>
                          ${parseFloat(pr.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right line-through" style={{ color: 'var(--text-secondary)' }}>
                          {pr.original_price ? `$${parseFloat(pr.original_price).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(pr.scraped_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: cheapest callout + price snapshot */}
            <div className="w-56 shrink-0 p-5 flex flex-col gap-4">
              {cheapest && (
                <div className="rounded-xl p-4 border" style={{ borderColor: '#154734', background: '#f0faf4' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#154734' }}>Cheapest Today</p>
                  <button
                    onClick={() => setActiveStore(getStoreName(cheapest))}
                    className="text-sm font-medium mb-1 hover:underline text-left"
                    style={{ color: '#154734' }}
                  >
                    {getStoreName(cheapest)}
                  </button>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#154734' }}>
                    ${parseFloat(cheapest.price).toFixed(2)}
                  </p>
                  {savingsVsNext && (
                    <div className="rounded-lg p-2 text-xs" style={{ background: '#e6f4ea', color: '#154734' }}>
                      <p className="font-semibold">You save ${savingsVsNext}</p>
                      <p style={{ color: '#4a7c59' }}>vs next lowest store ({getStoreName(nextCheapest)})</p>
                    </div>
                  )}
                </div>
              )}

              {allPrices.length > 0 && (
                <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>Price Snapshot</p>
                  {[
                    { label: 'Highest Price', val: highest },
                    { label: 'Lowest Price',  val: lowest  },
                    { label: 'Average',        val: avg     },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm py-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${row.val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price) && (
                <div className="rounded-xl p-3 border text-xs" style={{ borderColor: '#BD8B13', background: '#fffbeb' }}>
                  <p className="font-semibold mb-1" style={{ color: '#7a5c00' }}>🌟 Best time to buy!</p>
                  <p style={{ color: '#92400e' }}>
                    Currently {Math.round((1 - parseFloat(cheapest.price) / parseFloat(cheapest.original_price)) * 100)}% below regular price. Great time to stock up!
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center py-3 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            ⓘ Prices update regularly. Last updated {formatDate(cheapest?.scraped_at)}.
          </p>
        </div>
      </div>

      {activeStore && (
        <StorePanel storeName={activeStore} onClose={() => setActiveStore(null)} />
      )}
    </>
  );
}
