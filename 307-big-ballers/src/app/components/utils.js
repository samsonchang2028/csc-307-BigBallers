export function formatRelativeTime(dateStr) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function extractBrand(name) {
  if (!name) return "—";
  const parts = name.split(/[\s,]+/);
  return parts[0] ?? "—";
}

export function shortStoreName(name) {
  if (!name) return "Store";
  if (name.includes("Sprouts")) return "Sprouts";
  if (name.includes("Ralphs")) return "Ralphs";
  if (name.includes("Trader")) return "Trader Joe's";
  if (name.includes("Smart")) return "Smart & Final";
  if (name.includes("Grocery Outlet")) return "Grocery Outlet";
  if (name.includes("Cal Fresh")) return "Cal Fresh";
  if (name.includes("Food 4 Less")) return "Food 4 Less";
  return name.split(" ")[0];
}

const CHART_COLORS = ["#154734", "#2a9d8f", "#F2C75C", "#BD8B13", "#6b3a6e"];

/** Build chart series from actual price + scraped_at only. Lines stay flat when there's no history. */
export function buildPriceHistorySeries(prices, days = 7) {
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - days);

  return [...prices]
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, 4)
    .map((pr, i) => {
      const price = parseFloat(pr.price);
      const scrapedAt = pr.scraped_at ? new Date(pr.scraped_at) : now;
      const store = shortStoreName(pr.store_name ?? pr.store_id ?? `Store ${i + 1}`);

      const lineStart = scrapedAt < rangeStart ? rangeStart : scrapedAt;

      return {
        store,
        color: CHART_COLORS[i % CHART_COLORS.length],
        points: [
          { date: lineStart, price },
          { date: now, price },
        ],
        currentPrice: price,
      };
    });
}

export function saveProductForDetail(product) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("opticart_product", JSON.stringify(product));
  }
}

export function loadProductForDetail() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("opticart_product");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
