"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthButton from "@/app/components/AuthButton";
import ItemCard from "@/app/components/ItemCard";

export default function Home(){

    const router = useRouter();

    async function addToList(productName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { error } = await supabase.from('grocery_list').insert({ user_id: user.id, product_name: productName });
        if (error) {
            setListFeedback(`Error: ${error.message}`);
            setTimeout(() => setListFeedback(null), 3000);
        } else {
            setAddedItems(prev => new Set(prev).add(productName));
        }
    }

    const storeNames = {
        "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
        "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
        "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
        "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
        "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
        "kroger-ralphs": "Ralphs",
        "kroger-food4less": "Food 4 Less",
    };

    const krogerStoreIdMap = {
        "Ralphs": "kroger-ralphs",
        "Food 4 Less": "kroger-food4less",
    };

    const allStoreIds = Object.keys(storeNames);

    const [searchInput, setSearchInput] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortAsc, setSortAsc] = useState(null);
    const [selectedStores, setSelectedStores] = useState(new Set(allStoreIds));
    const [priceCap, setPriceCap] = useState("");
    const [listFeedback, setListFeedback] = useState(null);
    const [addedItems, setAddedItems] = useState(new Set());
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        async function loadExisting() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('grocery_list').select('product_name');
            if (data) setAddedItems(new Set(data.map(row => row.product_name)));
        }
        loadExisting();
    }, []);

    function toggleStore(id) {
        setSelectedStores(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleSort() {
        setSortAsc(prev => prev === null ? true : prev === true ? false : null);
    }

    const sortLabel = sortAsc === null ? "Sort by Price" : sortAsc ? "Price: Low → High" : "Price: High → Low";

    const displayProducts = (() => {
        const cap = priceCap !== "" ? parseFloat(priceCap) : null;
        let result = products
            .map(p => ({
                ...p,
                prices: (p.prices ?? []).filter(pr => {
                    const effectiveId = pr.source === "kroger"
                        ? krogerStoreIdMap[pr.store_name]
                        : pr.store_id;
                    return selectedStores.has(effectiveId) &&
                        (cap === null || parseFloat(pr.price) <= cap);
                }),
            }))
            .filter(p => p.prices.length > 0);

        if (sortAsc === null) return result;

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

    async function search(query, isCategory = false) {
        if (!query) return;
        setLoading(true);
        const param = isCategory ? `category=${encodeURIComponent(query)}` : `q=${encodeURIComponent(query)}`;
        const res = await fetch(`/api/products?${param}`);
        const data = await res.json();
        setProducts(res.ok ? data : []);
        setLoading(false);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") search(searchInput);
    }

    return (
        <main className="min-h-screen flex flex-col">
            <div className="flex p-4 items-center gap-3">
                <input
                    className="flex-1 p-2 rounded border"
                    placeholder="Search for groceries..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button>❤️</button>
                <AuthButton />
            </div>
            <div className="flex p-4 gap-4 flex-wrap">
                {["Dairy", "Fruit", "Vegetables", "Meat & Seafood", "Bakery", "Grains & Pasta", "Snacks", "Beverages"].map(cat => (
                    <button key={cat} onClick={() => { setSearchInput(""); search(cat, true); }} className="border px-4 py-2 rounded">
                        {cat}
                    </button>
                ))}
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
                {listFeedback && (
                    <p className={`text-sm mb-2 ${listFeedback.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                        {listFeedback}
                    </p>
                )}
                <h1>Items:</h1>
                {loading && <p>Loading...</p>}
                {!loading && displayProducts.map((p, i) => (
                    <div key={i} className="mb-2 cursor-pointer hover:bg-gray-50 rounded p-1" onClick={() => setSelectedProduct(p)}>
                        <div className="flex items-center gap-2">
                            <strong>{p.name}</strong>
                            <button
                                onClick={(e) => { e.stopPropagation(); addToList(p.name); }}
                                disabled={addedItems.has(p.name)}
                                className={`text-xs border px-2 py-0.5 rounded transition-colors ${addedItems.has(p.name) ? 'bg-green-500 text-white border-green-500' : 'hover:bg-black hover:text-white'}`}
                                title="Add to grocery list"
                            >{addedItems.has(p.name) ? '✓' : '+'}</button>
                        </div>
                        {p.prices?.map((pr, j) => (
                            <div key={j} className="ml-4 text-sm">
                                ${pr.price}
                                {pr.original_price && <span className="text-gray-400 line-through ml-1">${pr.original_price}</span>}
                                {(pr.store_name || pr.store_id) && (
                                    <span className="text-gray-500"> ({pr.store_name ?? storeNames[pr.store_id] ?? pr.store_id})</span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {selectedProduct && (
                <ItemCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </main>
    );
}
