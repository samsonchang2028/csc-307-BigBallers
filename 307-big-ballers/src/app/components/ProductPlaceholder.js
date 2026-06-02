"use client";
import Image from "next/image";
import { useState } from "react";

// Free images from Unsplash (no API key needed)
const KEYWORD_IMAGES = {
  // Dairy
  milk:      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80",
  egg:       "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
  eggs:      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
  cheese:    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80",
  yogurt:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80",
  butter:    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80",
  // Meat & Seafood
  chicken:   "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&q=80",
  beef:      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80",
  ground:    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80",
  steak:     "https://images.unsplash.com/photo-1558030137-a56c1b002c27?w=200&q=80",
  salmon:    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80",
  shrimp:    "https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?w=200&q=80",
  pork:      "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&q=80",
  bacon:     "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&q=80",
  turkey:    "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=200&q=80",
  // Fruit
  apple:     "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&q=80",
  banana:    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80",
  orange:    "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&q=80",
  strawberry:"https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200&q=80",
  blueberry: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&q=80",
  grape:     "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&q=80",
  mango:     "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=200&q=80",
  peach:     "https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=200&q=80",
  avocado:   "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80",
  lemon:     "https://images.unsplash.com/photo-1582087693628-3b595045dc90?w=200&q=80",
  // Vegetables
  broccoli:  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=200&q=80",
  carrot:    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80",
  spinach:   "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80",
  lettuce:   "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&q=80",
  tomato:    "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=200&q=80",
  onion:     "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&q=80",
  potato:    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80",
  garlic:    "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=200&q=80",
  pepper:    "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&q=80",
  // Bakery
  bread:     "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
  bagel:     "https://images.unsplash.com/photo-1585445490387-7f5def3db37c?w=200&q=80",
  muffin:    "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200&q=80",
  tortilla:  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80",
  baguette:  "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=200&q=80",
  // Grains & Pasta
  rice:      "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=200&q=80",
  pasta:     "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=200&q=80",
  oat:       "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200&q=80",
  cereal:    "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=200&q=80",
  // Snacks
  chip:      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80",
  chips:     "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80",
  cookie:    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&q=80",
  chocolate: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200&q=80",
  granola:   "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=200&q=80",
  // Beverages
  juice:     "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&q=80",
  coffee:    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
  tea:       "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&q=80",
  water:     "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&q=80",
};

function getImageUrl(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [keyword, url] of Object.entries(KEYWORD_IMAGES)) {
    if (lower.includes(keyword)) return url;
  }
  return null;
}

export default function ProductPlaceholder({ name, image_url, index = 0, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = (!imgError && image_url) ? image_url : (!imgError ? getImageUrl(name) : null);
  const dims = size === "lg" ? "w-[120px] h-[120px] text-3xl" : "w-[88px] h-[88px] text-xl";
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";

  if (imageUrl && !imgError) {
    return (
      <div className={`${dims} shrink-0 overflow-hidden bg-gray-100`} style={{ borderRadius: "var(--radius)" }}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center bg-gray-100 font-semibold`}
      style={{ borderRadius: "var(--radius)", color: "var(--poly-green)" }}
    >
      {initial}
    </div>
  );
}
