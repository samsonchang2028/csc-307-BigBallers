"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductPlaceholder from "./ProductPlaceholder";
import { extractSize, getStoreName } from "./constants";
import { formatRelativeTime, saveProductForDetail, shortStoreName } from "./utils";
import { LeafIcon, TagIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from "./icons";

export default function ResultCard({ product, index, onAddToList, isFavorited }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(index === 0);

  const prices = [...(product.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = prices[0];
  const size = extractSize(product.name);
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
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-[#fafafa]"
      >
        <ProductPlaceholder name={product.name} index={index} size="md" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] mb-0.5" style={{ color: "var(--text-primary)" }}>
            {product.name}
          </p>
          {size && (
            <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
              {size}
            </p>
          )}
          {cheapestStore && (
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--savings-green-text)" }}>
              <LeafIcon />
              <span>Cheapest at {shortStoreName(cheapestStore)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {displayStores.map((pr, j) => {
            const store = shortStoreName(getStoreName(pr.store_id, pr.store_name));
            const isBest = pr === cheapest;
            return (
              <div
                key={j}
                className="text-center rounded-lg px-3 py-2 min-w-[72px]"
                style={isBest ? { background: "var(--savings-green)" } : { background: "#fafafa" }}
              >
                <p className="text-[10px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  {store}
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: isBest ? "var(--poly-green)" : "var(--text-primary)" }}
                >
                  ${parseFloat(pr.price).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 ml-1" style={{ color: "var(--text-muted)" }}>
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 pt-1 border-t grid grid-cols-[1fr_1fr_auto] gap-4 items-end"
          style={{ borderColor: "var(--border-light)", background: "#fafafa" }}
        >
          <div className="flex items-start gap-2">
            <TagIcon style={{ color: "var(--poly-green)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                Why this price?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {whyText}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ClockIcon style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                Last updated
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {formatRelativeTime(lastUpdated)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); onAddToList(product.name); }}
              disabled={isFavorited}
              className="text-xs px-3 py-2 rounded-lg border font-medium transition-colors disabled:opacity-60"
              style={{
                borderColor: "var(--border)",
                color: isFavorited ? "var(--poly-green)" : "var(--text-secondary)",
              }}
            >
              {isFavorited ? "In favorites" : "Add to favorites"}
            </button>
            <button
              onClick={viewDetails}
              className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "var(--poly-green)" }}
            >
              View details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
