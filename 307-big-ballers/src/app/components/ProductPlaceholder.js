"use client";

import { useState } from "react";

export default function ProductPlaceholder({ name, index = 0, size = "md", imageUrl }) {
  const [failed, setFailed] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const dims = size === "lg" ? "w-[120px] h-[120px] text-3xl" : "w-[88px] h-[88px] text-xl";

  if (imageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote product image with unknown host; next/image would require wildcard remotePatterns
      <img
        src={imageUrl}
        alt={name ?? "Product"}
        onError={() => setFailed(true)}
        className={`${dims} shrink-0 object-cover bg-gray-100`}
        style={{ borderRadius: "var(--radius)" }}
      />
    );
  }

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center bg-gray-100 font-semibold`}
      style={{ borderRadius: 'var(--radius)', color: 'var(--poly-green)' }}
      aria-label={name ?? "Product"}
      role="img"
    >
      {initial}
    </div>
  );
}
