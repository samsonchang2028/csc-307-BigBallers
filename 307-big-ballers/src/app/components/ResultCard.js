"use client";

import { useRouter } from "next/navigation";
import ProductPlaceholder from "./ProductPlaceholder";
import { getStoreName } from "./constants";
import { saveProductForDetail, shortStoreName } from "./utils";
import { LeafIcon } from "./icons";

export default function ResultCard({ product, index, onAddToList, isFavorited }) {
  const router = useRouter();

  const prices = [...(product.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = prices[0];
  const storeName = cheapest ? getStoreName(cheapest.store_id, cheapest.store_name) : null;

  const savings = cheapest?.original_price && parseFloat(cheapest.original_price) > parseFloat(cheapest.price)
    ? (parseFloat(cheapest.original_price) - parseFloat(cheapest.price)).toFixed(2)
    : null;

  function viewDetails() {
    saveProductForDetail(product);
    router.push("/product");
  }

  return (
    <div
      onClick={viewDetails}
      className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col relative group"
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 z-10 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
        <button
          onClick={(e) => { e.stopPropagation(); viewDetails(); }}
          className="w-full max-w-[180px] text-sm font-medium text-white px-4 py-2 rounded-lg"
          style={{ background: "var(--poly-green)" }}
        >
          See more details
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToList(product.name); }}
          disabled={isFavorited}
          className="w-full max-w-[180px] text-sm font-medium px-4 py-2 rounded-lg bg-white disabled:opacity-70"
          style={{ color: "var(--poly-green)" }}
        >
          {isFavorited ? "In cart ✓" : "Add to cart"}
        </button>
      </div>

      {/* Top: image + info */}
      <div className="flex items-center gap-4 p-4">
        <ProductPlaceholder name={product.name} image_url={product.image_url} index={index} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] leading-snug mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {product.name}
          </p>
          {product.unit && (
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{product.unit}</p>
          )}
          {cheapest && (
            <>
              <p className="text-2xl font-bold" style={{ color: "var(--poly-green)" }}>
                ${parseFloat(cheapest.price).toFixed(2)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {shortStoreName(storeName)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Bottom: savings bar */}
      <div
        className="flex items-center gap-1.5 px-4 py-2.5 mt-auto border-t text-xs font-medium"
        style={{
          borderColor: "var(--border-light)",
          background: savings ? "var(--savings-green)" : "#fafafa",
          color: savings ? "var(--poly-green)" : "var(--text-muted)",
        }}
      >
        <LeafIcon style={{ width: 12, height: 12, flexShrink: 0 }} />
        {savings
          ? <span>save <strong>${savings}</strong> vs regular price</span>
          : <span>{shortStoreName(storeName)}</span>
        }
      </div>
    </div>
  );
}
