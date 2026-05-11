import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("prices").select(`
      id,
      price,
      original_price,
      scraped_at,
      source_url,
      products ( name ),
      stores ( name, address )
    `);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <h2>{item.products.name}</h2>
          <p>
            Store: {item.stores.name} — {item.stores.address}
          </p>
          <p>Price: ${item.price}</p>
          {item.original_price ? (
            <p>Original: ${item.original_price}</p>
          ) : (
            <p>No original price</p>
          )}
        </div>
      ))}
    </div>
  );
}
