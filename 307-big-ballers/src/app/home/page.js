"use client"
import {useRouter} from "next/navigation";
import { useState } from "react";

const UNIT_PATTERNS = [
  { regex: /(\d+\.?\d*)\s*(?:fl\.?\s*oz)/i,          unit: "fl oz", toFlOz: 1 },
  { regex: /(\d+\.?\d*)\s*gal(?:lon)?s?/i,            unit: "gal",   toFlOz: 128 },
  { regex: /(\d+\.?\d*)\s*(?:qt|quarts?)/i,           unit: "qt",    toFlOz: 32 },
  { regex: /(\d+\.?\d*)\s*(?:pt|pints?)/i,            unit: "pt",    toFlOz: 16 },
  { regex: /(\d+\.?\d*)\s*cups?/i,                    unit: "cup",   toFlOz: 8 },
  { regex: /(\d+\.?\d*)\s*ml/i,                       unit: "ml",    toFlOz: 1 / 29.5735 },
  { regex: /(\d+\.?\d*)\s*l(?:iter)?s?(?!\w)/i,       unit: "L",     toFlOz: 33.814 },
  { regex: /(\d+\.?\d*)\s*(?:lbs?|pounds?)/i,         unit: "lb",    toOz: 16 },
  { regex: /(\d+\.?\d*)\s*kg/i,                       unit: "kg",    toOz: 35.274 },
  { regex: /(\d+\.?\d*)\s*g(?:rams?)?(?!\w)/i,        unit: "g",     toOz: 1 / 28.3495 },
  { regex: /(\d+\.?\d*)\s*oz\b/i,                     unit: "oz",    toOz: 1 },
  { regex: /(\d+)\s*(?:ct|count|pk|pack|pcs?|pieces?|each)/i, unit: "ct", toCt: 1 },
];

function parseUnitSize(name) {
  for (const p of UNIT_PATTERNS) {
    const m = name.match(p.regex);
    if (m) {
      const qty = parseFloat(m[1]);
      if (p.toFlOz !== undefined) return { display: `${qty} ${p.unit}`, normalized: qty * p.toFlOz, normUnit: "fl oz" };
      if (p.toOz   !== undefined) return { display: `${qty} ${p.unit}`, normalized: qty * p.toOz,   normUnit: "oz" };
      if (p.toCt   !== undefined) return { display: `${qty} ct`,        normalized: qty,             normUnit: "ct" };
    }
  }
  return null;
}

function scoreProduct(name, query) {
  const n = name.toLowerCase();
  const q = query.toLowerCase().trim();
  if (n === q) return 4;
  if (n.startsWith(q + " ") || n.startsWith(q + ",")) return 3;
  const words = q.split(/\s+/);
  if (words.every(w => new RegExp(`\\b${w}`, "i").test(name))) return 2;
  return 1;
}

function pricePerUnit(price, unit) {
  if (!unit) return null;
  const ppu = parseFloat(price) / unit.normalized;
  const formatted = ppu < 0.10
    ? `${(ppu * 100).toFixed(1)}¢`
    : `$${ppu.toFixed(2)}`;
  return `${formatted}/${unit.normUnit}`;
}

export default function Home(){

    const router = useRouter();
    const categoryMap = {
        Dairy: "milk",
        Produce: "banana",
        Meat: "chicken"
    };

    const storeNames = {
        "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
        "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
        "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
        "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
        "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
    };

    const storeDetails = {
        "d509a460-ad97-4099-a6df-d03798e03d6d": {
            name: "Sprouts Farmers Market",
            address: "1319 Johnson Ave, San Luis Obispo, CA 93401",
            hours: "Mon–Sun: 7:00 AM – 10:00 PM",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sprouts_logo.svg/1280px-Sprouts_logo.svg.png",
        },
        "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": {
            name: "Smart & Final",
            address: "3910 Broad St, San Luis Obispo, CA 93401",
            hours: "Mon–Sun: 6:00 AM – 11:00 PM",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Smart_%26_Final_logo.svg/1280px-Smart_%26_Final_logo.svg.png",
        },
        "eefcee75-d1f4-49c3-8a40-c59982d72287": {
            name: "Grocery Outlet",
            address: "269 Madonna Rd, San Luis Obispo, CA 93405",
            hours: "Mon–Sun: 8:00 AM – 9:00 PM",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Grocery_Outlet_logo.svg/1280px-Grocery_Outlet_logo.svg.png",
        },
        "9ae30061-19f8-41f5-8bdf-85694ddec2dc": {
            name: "Cal Fresh Market",
            address: "785 Foothill Blvd, San Luis Obispo, CA 93405",
            hours: "Mon–Sat: 8:00 AM – 8:00 PM, Sun: 9:00 AM – 6:00 PM",
            image: "https://placehold.co/400x200?text=Cal+Fresh",
        },
        "1971e92b-78af-4dcc-9bfa-cf3349b649ef": {
            name: "Trader Joe's",
            address: "1035 Madonna Rd, San Luis Obispo, CA 93405",
            hours: "Mon–Sun: 8:00 AM – 9:00 PM",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Trader_Joe%27s_logo.svg/1280px-Trader_Joe%27s_logo.svg.png",
        },
    };

    const allStoreIds = Object.keys(storeNames);

    const [searchInput, setSearchInput] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortAsc, setSortAsc] = useState(null);
    const [selectedStores, setSelectedStores] = useState(new Set(allStoreIds));
    const [priceCap, setPriceCap] = useState("");
    const [selectedStore, setSelectedStore] = useState(null);

    function toggleStore(id) {
        setSelectedStores(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSort() {
        setSortAsc(prev =>
            prev === null ? true : prev === true ? false : prev === false ? "unit" : null
        );
    }

    const sortLabel =
        sortAsc === null  ? "Sort by Price" :
        sortAsc === true  ? "Price: Low → High" :
        sortAsc === false ? "Price: High → Low" :
                            "Unit Price: Low → High";

    const displayProducts = (() => {
        const cap = priceCap !== "" ? parseFloat(priceCap) : null;
        let result = products
            .map(p => ({
                ...p,
                prices: (p.prices ?? []).filter(pr =>
                    selectedStores.has(pr.store_id) &&
                    (cap === null || parseFloat(pr.price) <= cap)
                ),
            }))
            .filter(p => p.prices.length > 0);

        if (sortAsc === null) return result;

        if (sortAsc === "unit") {
            return result
                .map(p => {
                    const unit = parseUnitSize(p.name);
                    const prices = [...p.prices].sort((a, b) => {
                        const ppuA = unit ? parseFloat(a.price) / unit.normalized : parseFloat(a.price);
                        const ppuB = unit ? parseFloat(b.price) / unit.normalized : parseFloat(b.price);
                        return ppuA - ppuB;
                    });
                    return { ...p, prices };
                })
                .sort((a, b) => {
                    const uA = parseUnitSize(a.name);
                    const uB = parseUnitSize(b.name);
                    const ppuA = uA ? Math.min(...a.prices.map(pr => parseFloat(pr.price) / uA.normalized)) : Infinity;
                    const ppuB = uB ? Math.min(...b.prices.map(pr => parseFloat(pr.price) / uB.normalized)) : Infinity;
                    return ppuA - ppuB;
                });
        }

        return result
            .map(p => ({
                ...p,
                prices: [...p.prices].sort((a, b) =>
                    sortAsc
                        ? parseFloat(a.price) - parseFloat(b.price)
                        : parseFloat(b.price) - parseFloat(a.price)
                ),
            }))
            .sort((a, b) => {
                const aMin = Math.min(...a.prices.map(pr => parseFloat(pr.price)));
                const bMin = Math.min(...b.prices.map(pr => parseFloat(pr.price)));
                return sortAsc ? aMin - bMin : bMin - aMin;
            });
    })();

    async function search(query) {
        if (!query) return;
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const sorted = res.ok
            ? [...data].sort((a, b) => scoreProduct(b.name, query) - scoreProduct(a.name, query))
            : [];
        setProducts(sorted);
        setLoading(false);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") search(searchInput);
    }

    return (
        <main className="min-h-screen flex flex-col">
            <div className="flex justify-between p-4 items-center">
                <h1>OptiCart</h1>
                <input
                    className="flex-1 mx-4 p-2 rounded border"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex gap-4">
                    <button>❤️</button>
                    <button onClick={() => router.push("/login")}>Login</button>
                </div>
            </div>
            <div className="flex p-4 gap-4">
                <button onClick={() => { setSearchInput("milk"); search("milk"); }} className="border px-4 py-2 rounded">Dairy</button>
                <button onClick={() => { setSearchInput("banana"); search("banana"); }} className="border px-4 py-2 rounded">Produce</button>
                <button onClick={() => { setSearchInput("chicken"); search("chicken"); }} className="border px-4 py-2 rounded">Meat</button>
                <button onClick={toggleSort} className="border px-4 py-2 rounded">{sortLabel}</button>
            </div>
            <div className="flex px-4 pb-2 gap-2 flex-wrap items-center">
                {allStoreIds.map(id => (
                    <button
                        key={id}
                        onClick={() => toggleStore(id)}
                        className={`border px-3 py-1 rounded text-sm ${selectedStores.has(id) ? "bg-black text-white" : "text-gray-400"}`}
                    >
                        {storeNames[id]}
                    </button>
                ))}
                <label className="text-sm ml-2">Max price: $
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceCap}
                        onChange={e => setPriceCap(e.target.value)}
                        placeholder="any"
                        className="border rounded px-2 py-1 w-20 ml-1"
                    />
                </label>
            </div>
            <div className="p-4">
                <h1>Items:</h1>
                {loading && <p>Loading...</p>}
                {!loading && displayProducts.map((p, i) => {
                    const unit = parseUnitSize(p.name);
                    return (
                        <div key={i} className="mb-2">
                            <strong>{p.name}</strong>
                            {unit && <span className="ml-2 text-xs text-gray-400">({unit.display})</span>}
                            {p.prices?.map((pr, j) => {
                                const ppu = pricePerUnit(pr.price, unit);
                                return (
                                    <div key={j} className="ml-4 text-sm">
                                        ${pr.price}
                                        {ppu && <span className="ml-2 text-blue-600 font-medium text-xs">{ppu}</span>}
                                        {pr.store_id && (
                                            <button
                                                onClick={() => setSelectedStore(pr.store_id)}
                                                className="ml-1 text-gray-500 underline hover:text-blue-600"
                                            >
                                                ({storeNames[pr.store_id] ?? pr.store_id})
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            {selectedStore && (() => {
                const s = storeDetails[selectedStore];
                return (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setSelectedStore(null)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="relative">
                                <img
                                    src={s.image}
                                    alt={s.name}
                                    className="w-full h-48 object-contain bg-gray-50 p-6"
                                />
                                <button
                                    onClick={() => setSelectedStore(null)}
                                    className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-600 hover:text-black text-lg leading-none"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-5">
                                <h2 className="text-xl font-bold mb-3">{s.name}</h2>
                                <p className="text-sm text-gray-600 mb-2">📍 {s.address}</p>
                                <p className="text-sm text-gray-600">🕐 {s.hours}</p>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </main>
    );
}