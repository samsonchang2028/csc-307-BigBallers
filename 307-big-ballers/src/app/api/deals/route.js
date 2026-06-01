import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("prices")
    .select(`
      price,
      original_price,
      store_id,
      products ( id, name ),
      stores ( name )
    `)
    .not("original_price", "is", null)
    .limit(200);

  if (error) return Response.json({ error }, { status: 500 });

  // Keep only rows where original_price > price, compute savings
  const withSavings = data
    .filter(row => parseFloat(row.original_price) > parseFloat(row.price))
    .map(row => ({
      product_id: row.products?.id,
      name: row.products?.name,
      price: row.price,
      original_price: row.original_price,
      savings: (parseFloat(row.original_price) - parseFloat(row.price)).toFixed(2),
      store_name: row.stores?.name,
      store_id: row.store_id,
    }));

  // Sort by savings desc, take top 6
  withSavings.sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings));

  return Response.json(withSavings.slice(0, 6));
}
