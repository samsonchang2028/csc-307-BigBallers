"use client";

import { useMemo } from "react";
import { buildPriceHistorySeries } from "./utils";

export default function PriceHistoryChart({ prices }) {
  const series = useMemo(() => buildPriceHistorySeries(prices), [prices]);

  if (!series.length) {
    return (
      <div className="card p-5">
        <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
          Current prices by store
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No price data available yet.
        </p>
      </div>
    );
  }

  const maxPrice = Math.max(...series.map((s) => s.price));

  return (
    <div className="card p-5">
      <h3 className="font-bold text-base mb-4" style={{ color: "var(--text-primary)" }}>
        Current prices by store
      </h3>

      <div className="flex flex-col gap-3">
        {series.map((s) => (
          <div key={s.store} className="flex items-center gap-3">
            <span className="text-xs font-medium w-24 shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>
              {s.store}
            </span>
            <div className="flex-1 h-5 rounded" style={{ background: "#f3f4f6" }}>
              <div
                className="h-full rounded flex items-center justify-end px-2"
                style={{
                  width: `${maxPrice > 0 ? Math.max((s.price / maxPrice) * 100, 12) : 100}%`,
                  background: s.color,
                }}
              >
                <span className="text-xs font-semibold text-white">${s.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted-accessible)" }}>
        Latest known price at each store. Historical trends aren&apos;t available yet.
      </p>
    </div>
  );
}
