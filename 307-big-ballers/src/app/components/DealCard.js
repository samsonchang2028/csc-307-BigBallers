import { TagIcon } from "./icons";
import { extractSize, getStoreName } from "./constants";
import ProductPlaceholder from "./ProductPlaceholder";

export default function DealCard({ deal, index = 0, onClick, animationDelay = 0 }) {
  const size = extractSize(deal.name);
  const displayName = size
    ? deal.name.replace(new RegExp(`\\b${size}\\b`, "i"), "").trim()
    : deal.name;
  const storeName = getStoreName(deal.store_id, deal.store_name);

  return (
    <button
      onClick={onClick}
      className="card card-hover text-left overflow-hidden flex flex-col animate-fade-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center gap-4 p-4 pb-3">
        <ProductPlaceholder name={deal.name} index={index} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] leading-snug mb-0.5" style={{ color: "var(--text-primary)" }}>
            {displayName}
          </p>
          {size && (
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              {size}
            </p>
          )}
          <p className="text-[26px] font-bold leading-none mb-1.5" style={{ color: "var(--poly-green)" }}>
            ${parseFloat(deal.price).toFixed(2)}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
            {storeName}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium"
        style={{ background: "var(--savings-green)", color: "var(--savings-green-text)" }}
      >
        <TagIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
        <span>
          save <strong>${deal.savings}</strong> vs other stores
        </span>
      </div>
    </button>
  );
}

export function DealCardSkeleton({ index = 0 }) {
  return (
    <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-center gap-4 p-4 pb-3">
        <div className="w-[88px] h-[88px] rounded-xl skeleton shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded skeleton w-3/4" />
          <div className="h-3 rounded skeleton w-1/4" />
          <div className="h-7 rounded skeleton w-1/3 mt-2" />
          <div className="h-3 rounded skeleton w-1/2" />
        </div>
      </div>
      <div className="h-9 skeleton" />
    </div>
  );
}
