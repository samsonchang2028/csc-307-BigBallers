import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("prices")
    .select(`
      id,
      price,
      original_price,
      products ( name, image_url ),
      stores ( name, address )
    `)
    .eq("id", id)
    .single();

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-5 pt-10 pb-10 text-black">
      <Link href="/" className="text-green-700 font-semibold">
        ← Back
      </Link>

      <div className="h-40 flex items-center justify-center mt-6">
        <img
          src={item.products.image_url || "/images/default.png"}
          alt={item.products.name}
          className="max-h-36 object-contain"
        />
      </div>

      <h1 className="text-2xl font-bold mt-6 capitalize">
        {item.products.name}
      </h1>

      <p className="text-gray-500 mt-1">{item.stores.name}</p>

      <p className="text-4xl font-bold text-green-700 mt-5">
        ${item.price}
      </p>

      {item.original_price && (
        <p className="text-gray-500 line-through">
          Was ${item.original_price}
        </p>
      )}
    </main>
  );
}