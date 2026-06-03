"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductPlaceholder from "./ProductPlaceholder";
import { getStoreName } from "./constants";
import { formatRelativeTime, saveProductForDetail, shortStoreName } from "./utils";
import { LeafIcon, TagIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from "./icons";

export default function ResultCard({ product, index, onToggleList, isFavorited, onStoreClick }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(index === 0);

  const prices = [...(product.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = prices[0];
  const displayStores = prices.slice(0, 3);

  const cheapestStore = cheapest ? getStoreName(cheapest.store_id, cheapest.store_name) : null;
  const lastUpdated = prices.reduce((latest, pr) => {
    if (!pr.scraped_at) return latest;
    return !latest || new Date(pr.scraped_at) > new Date(latest) ? pr.scraped_at : latest;
  }, null);

  const whyText = cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price)
    ? `${shortStoreName(cheapestStore)} has this item on sale — ${Math.round((1 - parseFloat(cheapest.price) / parseFloat(cheapest.original_price)) * 100)}% off regular price.`
    : `${shortStoreName(cheapestStore)} currently has the lowest price for this item across compared stores.`;

  function viewDetails() {
    saveProductForDetail(product);
    router.push("/product");
  }

  return (
    <div className="card overflow-hidden">
      <div
        onClick={() => setExpanded(v => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setExpanded(v => !v)}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-4 p-4 text-left cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <ProductPlaceholder name={product.name} index={index} size="md" imageUrl={product.image_url} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] mb-0.5" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </p>
            {product.unit && (
              <p className="text-xs mb-1.5" style={{ color: "var(--text-muted-accessible)" }}>
                {product.unit}
              </p>
            )}
            {cheapestStore && (
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--savings-green-text)" }}>
                <LeafIcon />
                <span>Cheapest at {shortStoreName(cheapestStore)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {displayStores.map((pr, j) => {
            const store = shortStoreName(getStoreName(pr.store_id, pr.store_name));
            const isBest = pr === cheapest;
            return (
              <div
                key={j}
                className="text-center px-3 py-2 min-w-[72px]"
                style={{ background: isBest ? "var(--savings-green)" : "#fafafa", borderRadius: "var(--radius)" }}
              >
                <button
                  onClick={e => { e.stopPropagation(); onStoreClick?.(store); }}
                  className="text-xs font-medium mb-1 hover:underline block w-full"
                  style={{ color: "var(--text-muted-accessible)" }}
                >
                  {store}
                </button>
                <p className="text-sm font-bold" style={{ color: isBest ? "var(--poly-green)" : "var(--text-primary)" }}>
                  ${parseFloat(pr.price).toFixed(2)}
                </p>
              </div>
            );
          })}
          <div className="shrink-0 ml-1" style={{ color: "var(--text-muted-accessible)" }}>
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="px-4 pb-4 pt-3 border-t grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 md:items-end"
          style={{ borderColor: "var(--border-light)", background: "#fafafa" }}
        >
          <div className="flex items-start gap-2">
            <TagIcon style={{ color: "var(--poly-green)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Why this price?</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{whyText}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ClockIcon style={{ color: "var(--text-muted-accessible)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Last updated</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{formatRelativeTime(lastUpdated)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleList(product.name)}
              className="text-xs px-3 py-2 border font-medium transition-colors"
              style={{
                borderColor: isFavorited ? "var(--poly-green)" : "var(--border)",
                color: isFavorited ? "var(--poly-green)" : "var(--text-secondary)",
                background: isFavorited ? "var(--savings-green)" : "#fff",
                borderRadius: "var(--radius)",
              }}
            >
              {isFavorited ? "In list" : "Add to list"}
            </button>
            <button
              onClick={viewDetails}
              className="text-sm font-medium text-white px-4 py-2"
              style={{ background: "var(--poly-green)", borderRadius: "var(--radius)" }}
            >
              View details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
