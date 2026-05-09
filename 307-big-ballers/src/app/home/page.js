"use client"
import {useRouter} from "next/navigation";
import { useState, useEffect} from "react";
import { supabase } from "@/lib/supabase";

export default function Home(){

    const router = useRouter();
    const categoryMap = {
        Dairy: "milk",
        Produce: "banana",
        Meat: "chicken"
        };
    
        
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    useEffect(() => {
        async function fetchProducts() {
            if (!selectedCategory) return;

            const searchTerm = categoryMap[selectedCategory];

            const { data, error } = await supabase
            .from("products")
            .select("*")
            .ilike("name", `%${searchTerm}%`);

            if (error) {
            console.error(error);
            } else {
            setProducts(data);
            }
        }

        fetchProducts();
        }, [selectedCategory]);

    return (
        <main className="min-h-screen flex flex-col">
            <div className="flex justify-between p-4 items-center">
                <h1>OptiCart</h1>
                <input className="flex-1 mx-4 p-2 rounded border" placeholder="Search..."></input>
                <div className="flex gap-4">
                    <button >❤️</button>
                    <button onClick={() => router.push("/login")}>Login</button>
                </div>
            </div>
            <div className="flex p-4 gap-4">
                <button onClick={() => setSelectedCategory("Dairy")}className="border px-4 py-2 rounded">Dairy</button>
                <button onClick={() => setSelectedCategory("Produce")} className="border px-4 py-2 rounded">Produce</button>
                <button onClick={() => setSelectedCategory("Meat")} className="border px-4 py-2 rounded">Meat</button>
            </div>
            <div className="p-4">
                <h1>Items: </h1>
                {products.map((p) => (
                    <div key={p.id}>
                    {p.name} - ${p.price}
                    </div>
                ))}
            </div>
        </main>
    );
}