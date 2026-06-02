export const CATEGORIES = [
  { label: "Dairy", query: "Dairy", isCategory: true },
  { label: "Produce", query: "Fruit", isCategory: true },
  { label: "Meat", query: "Meat & Seafood", isCategory: true },
  { label: "Bakery", query: "Bakery", isCategory: true },
  { label: "Pantry", query: "Grains & Pasta", isCategory: true },
  { label: "Snacks", query: "Snacks", isCategory: true },
];

export const STORE_NAMES = {
  "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts Farmers Market",
  "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
  "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
  "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
  "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
  "kroger-ralphs": "Ralphs",
  "kroger-food4less": "Food 4 Less",
};

export function getStoreName(id, fallback) {
  return STORE_NAMES[id] ?? fallback ?? id ?? "Unknown";
}
