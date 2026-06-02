"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductPlaceholder from "@/app/components/ProductPlaceholder";
import StorePanel from "@/app/components/StorePanel";
import PriceHistoryChart from "@/app/components/PriceHistoryChart";
import { getStoreName } from "@/app/components/constants";
import {
  loadProductForDetail,
  saveProductForDetail,
  extractBrand,
  formatRelativeTime,
  shortStoreName,
} from "@/app/components/utils";
import {
  ChevronLeftIcon,
  HeartIcon,
  TagIcon,
  TrendUpIcon,
  CategoryIcon,
  InfoIcon,
} from "@/app/components/icons";

function SpecCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex-1 min-w-[160px] p-4 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "var(--savings-green)", color: "var(--poly-green)" }}
      >
        <Icon style={{ width: 16, height: 16 }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted-accessible)" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ProductDetailInner() {
  const router = useRouter();
  const [product] = useState(() => loadProductForDetail());
  const [favorited, setFavorited] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const loading = product === null;

  useEffect(() => {
    if (!product) router.replace("/home");
  }, [product, router]);

  useEffect(() => {
    if (!product) return;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("grocery_list")
        .select("product_name")
        .eq("product_name", product.name)
        .maybeSingle();
      if (data) setFavorited(true);
    });
  }, [product]);

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (favorited) {
      await supabase.from("grocery_list").delete().eq("user_id", user.id).eq("product_name", product.name);
      setFavorited(false);
    } else {
      await supabase.from("grocery_list").insert({ user_id: user.id, product_name: product.name });
      setFavorited(true);
    }
  }

  if (loading || !product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="h-6 w-32 skeleton rounded mb-8" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            <div className="h-40 skeleton rounded-xl" />
            <div className="h-64 skeleton rounded-xl" />
          </div>
          <div className="h-80 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const prices = [...(product.prices ?? [])].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = prices[0];
  const brand = extractBrand(product.name);
  const avg = prices.length
    ? prices.reduce((s, p) => s + parseFloat(p.price), 0) / prices.length
    : 0;
  const belowAvg = cheapest && avg > 0
    ? { amount: (avg - parseFloat(cheapest.price)).toFixed(2), pct: Math.round((1 - parseFloat(cheapest.price) / avg) * 100) }
    : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
        style={{ color: "var(--poly-green)" }}
      >
        <ChevronLeftIcon />
        Back to results
      </button>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-5">
          <div className="flex gap-6 items-start">
            <ProductPlaceholder name={product.name} index={0} size="lg" imageUrl={product.image_url} />
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {product.name}
              </h1>
              {product.category && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-3"
                  style={{ background: "var(--savings-green)", color: "var(--poly-green)" }}
                >
                  <CategoryIcon name={product.category} style={{ width: 14, height: 14 }} />
                  {product.category}
                </span>
              )}
              {product.unit && (
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  {brand} product, {product.unit}
                </p>
              )}
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: favorited ? "var(--poly-green)" : "var(--border)",
                  color: favorited ? "var(--poly-green)" : "var(--text-secondary)",
                  background: favorited ? "var(--savings-green)" : "#fff",
                }}
              >
                <HeartIcon style={{ width: 16, height: 16 }} />
                {favorited ? "In list" : "Add to list"}
              </button>
            </div>
          </div>

          {/* Price comparison table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
              <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Price comparison
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Store", "Current Price", "Regular Price", "Last Updated"].map(h => (
                    <th
                      key={h}
                      className={`px-5 py-2.5 font-medium text-xs uppercase tracking-wide ${h === "Store" ? "text-left" : "text-right"}`}
                      style={{ color: "var(--text-muted-accessible)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.map((pr, i) => {
                  const store = getStoreName(pr.store_id, pr.store_name);
                  const isBest = i === 0;
                  return (
                    <tr
                      key={i}
                      className="border-t"
                      style={{
                        borderColor: "var(--border-light)",
                        background: isBest ? "var(--savings-green)" : "#fff",
                      }}
                    >
                      <td
                        className="px-5 py-3.5 font-medium"
                        style={{
                          color: "var(--text-primary)",
                          borderLeft: isBest ? "3px solid var(--poly-green)" : "3px solid transparent",
                        }}
                      >
                        <button onClick={() => setActiveStore(shortStoreName(store))} className="hover:underline font-medium text-left">{store}</button>
                      </td>
                      <td
                        className="px-5 py-3.5 text-right font-bold"
                        style={{ color: isBest ? "var(--poly-green)" : "var(--text-primary)" }}
                      >
                        ${parseFloat(pr.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right line-through" style={{ color: "var(--text-muted-accessible)" }}>
                        {pr.original_price ? `$${parseFloat(pr.original_price).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs" style={{ color: "var(--text-secondary)" }}>
                        {formatRelativeTime(pr.scraped_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="flex items-center gap-2 px-5 py-3 border-t text-xs"
              style={{ borderColor: "var(--border-light)", color: "var(--text-muted-accessible)" }}
            >
              <InfoIcon style={{ width: 14, height: 14 }} />
              Prices and availability may vary by location
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {belowAvg && cheapest && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "var(--savings-green)", border: "1px solid rgba(21,71,52,0.12)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--poly-green)", color: "#fff" }}
              >
                <TrendUpIcon style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="font-bold text-sm mb-0.5" style={{ color: "var(--poly-green)" }}>
                  Best time to buy!
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--savings-green-text)" }}>
                  Great news! The current price at {shortStoreName(getStoreName(cheapest.store_id, cheapest.store_name))} is{" "}
                  <strong>${belowAvg.amount}</strong> ({belowAvg.pct}%) below the average across stores.
                </p>
              </div>
            </div>
          )}

          <PriceHistoryChart prices={prices} />
        </div>
      </div>

      {/* Spec bar */}
      <div className="flex flex-wrap gap-3 mt-6">
        <SpecCard icon={TagIcon} label="Brand" value={brand} />
        <SpecCard icon={TagIcon} label="Category" value={product.category ?? "Grocery"} />
        <SpecCard icon={InfoIcon} label="Size" value={product.unit ?? "—"} />
      </div>
      {activeStore && <StorePanel storeName={activeStore} onClose={() => setActiveStore(null)} />}
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--text-muted-accessible)" }}>Loading...</div>}>
      <ProductDetailInner />
    </Suspense>
  );
}
