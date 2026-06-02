"use client";

import { useMemo, useState } from "react";
import { buildPriceHistorySeries } from "./utils";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export default function PriceHistoryChart({ prices }) {
  const series = useMemo(() => buildPriceHistorySeries(prices, 7), [prices]);

  if (!series.length) {
    return (
      <div className="card p-5">
        <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
          Price history
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No price data available yet.
        </p>
      </div>
    );
  }

  const allPoints = series.flatMap(s => s.points.map(p => p.price));
  const rawMin = Math.min(...allPoints);
  const rawMax = Math.max(...allPoints);
  const minY = rawMin === rawMax ? rawMin * 0.95 : Math.floor(rawMin * 0.9 * 100) / 100;
  const maxY = rawMin === rawMax ? rawMax * 1.05 : Math.ceil(rawMax * 1.05 * 100) / 100;
  const rangeY = maxY - minY || 1;

  const width = 480;
  const height = 200;
  const pad = { top: 16, right: 56, bottom: 32, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  function xPos(i, total) {
    return pad.left + (i / (total - 1)) * chartW;
  }

  function yPos(price) {
    return pad.top + chartH - ((price - minY) / rangeY) * chartH;
  }

  const yTicks = [minY, minY + rangeY * 0.33, minY + rangeY * 0.66, maxY];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
          7-day price history
        </h3>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-label="Price history chart">
        {yTicks.map((tick, i) => {
          const y = yPos(tick);
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                ${tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {series[0]?.points.map((pt, i) => (
          <text
            key={i}
            x={xPos(i, Math.max(series[0].points.length - 1, 1))}
            y={height - 8}
            textAnchor={i === 0 ? "start" : "end"}
            fontSize="10"
            fill="#9ca3af"
          >
            {pt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        ))}

        {series.map(s => {
          const total = Math.max(s.points.length - 1, 1);
          const path = s.points
            .map((pt, i) => `${i === 0 ? "M" : "L"} ${xPos(i, total)} ${yPos(pt.price)}`)
            .join(" ");
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.store}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={xPos(s.points.length - 1, total)} cy={yPos(last.price)} r="4" fill={s.color} />
              <rect
                x={width - pad.right + 4}
                y={yPos(last.price) - 10}
                width="48"
                height="20"
                rx="4"
                fill={s.color}
              />
              <text
                x={width - pad.right + 28}
                y={yPos(last.price) + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#fff"
              >
                ${last.price.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-center gap-5 mt-3">
        {series.map(s => (
          <div key={s.store} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.store}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
        Shows the last known price at each store since it was last updated
      </p>
    </div>
  );
}
