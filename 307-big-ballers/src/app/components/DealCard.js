"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TagIcon, HeartIcon } from "./icons";
import { getStoreName } from "./constants";
import { shortStoreName } from "./utils";
import ProductPlaceholder from "./ProductPlaceholder";

export default function DealCard({ deal, index = 0, onClick, onStoreClick }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);

  const storeName = getStoreName(deal.store_id, deal.store_name);
  const shortStore = shortStoreName(storeName);

  useEffect(() => {
    async function checkFavorite() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("grocery_list")
        .select("product_name")
        .eq("user_id", user.id)
        .eq("product_name", deal.name)
        .maybeSingle();

      if (data) setFavorited(true);
    }

    checkFavorite();
  }, [deal.name]);

  async function toggleFavorite(e) {
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (favorited) {
      await supabase
        .from("grocery_list")
        .delete()
        .eq("user_id", user.id)
        .eq("product_name", deal.name);

      setFavorited(false);
    } else {
      await supabase.from("grocery_list").insert({
        user_id: user.id,
        product_name: deal.name
      });

      setFavorited(true);
    }
  }
  return (
      <button
      onClick={onClick}
      className="card card-hover text-left overflow-hidden flex flex-col relative"
    >
      <div className="absolute top-2 right-2 z-10" onClick={toggleFavorite}>
       <HeartIcon
          className={`cursor-pointer transition-all duration-200 ${
            favorited
              ? "text-red-500 fill-red-500 scale-110"
              : "text-red-500 hover:scale-110"
          }`}
          width={24}
          height={24}
        />
      </div>
      <div className="flex items-center gap-4 p-4 pb-3">
        <ProductPlaceholder name={deal.name} index={index} imageUrl={deal.image_url} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug mb-0.5">{deal.name}</p>
          {deal.unit && <p className="text-xs mb-2" style={{ color: 'var(--text-muted-accessible)' }}>{deal.unit}</p>}
          <p className="text-2xl font-bold leading-none mb-1" style={{ color: 'var(--poly-green)' }}>
            ${parseFloat(deal.price).toFixed(2)}
          </p>
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onStoreClick?.(shortStore); }}
            onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), onStoreClick?.(shortStore))}
            className="text-xs truncate hover:underline text-left cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >{storeName}</span>
        </div>
      </div>
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs font-medium"
        style={{ background: 'var(--savings-green)', color: 'var(--savings-green-text)' }}
      >
        <TagIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
        <span>save <strong>${deal.savings}</strong> vs other stores</span>
      </div>
    </button>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-4 pb-3">
        <div className="w-[88px] h-[88px] skeleton shrink-0" style={{ borderRadius: 'var(--radius)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton w-3/4" />
          <div className="h-3 skeleton w-1/4" />
          <div className="h-7 skeleton w-1/3 mt-2" />
          <div className="h-3 skeleton w-1/2" />
        </div>
      </div>
      <div className="h-8 skeleton" />
    </div>
  );
}
