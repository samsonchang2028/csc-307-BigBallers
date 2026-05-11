"use client"
import {useRouter} from "next/navigation";
import { useState } from "react";

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

    const [searchInput, setSearchInput] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortAsc, setSortAsc] = useState(null);

    function toggleSort() {
        setSortAsc(prev => prev === null ? true : prev === true ? false : null);
    }

    const sortLabel = sortAsc === null ? "Sort by Price" : sortAsc ? "Price: Low → High" : "Price: High → Low";

    const displayProducts = (() => {
        if (sortAsc === null) return products;
        return [...products]
            .map(p => ({
                ...p,
                prices: [...(p.prices ?? [])].sort((a, b) =>
                    sortAsc
                        ? parseFloat(a.price) - parseFloat(b.price)
                        : parseFloat(b.price) - parseFloat(a.price)
                ),
            }))
            .sort((a, b) => {
                const aMin = Math.min(...(a.prices ?? []).map(pr => parseFloat(pr.price)));
                const bMin = Math.min(...(b.prices ?? []).map(pr => parseFloat(pr.price)));
                return sortAsc ? aMin - bMin : bMin - aMin;
            });
    })();

    async function search(query) {
        if (!query) return;
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setProducts(res.ok ? data : []);
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
            <div className="p-4">
                <h1>Items:</h1>
                {loading && <p>Loading...</p>}
                {!loading && displayProducts.map((p, i) => (
                    <div key={i} className="mb-2">
                        <strong>{p.name}</strong>
                        {p.prices?.map((pr, j) => (
                            <div key={j} className="ml-4 text-sm">
                                ${pr.price}
                                {pr.store_id && <span className="text-gray-500"> ({storeNames[pr.store_id] ?? pr.store_id})</span>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}