import { getSupabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("prices")
    .select(`
      price,
      original_price,
      store_id,
      products ( id, name, unit ),
      stores ( name )
    `)
    .not("original_price", "is", null)
    .limit(100);

  if (error) return Response.json({ error }, { status: 500 });

  const withSavings = data
    .filter(row => parseFloat(row.original_price) > parseFloat(row.price))
    .map(row => ({
      product_id: row.products?.id,
      name: row.products?.name,
      unit: row.products?.unit,
      price: row.price,
      original_price: row.original_price,
      savings: (parseFloat(row.original_price) - parseFloat(row.price)).toFixed(2),
      store_name: row.stores?.name,
      store_id: row.store_id,
    }));

  const byProduct = new Map();
  for (const deal of withSavings) {
    const id = deal.product_id ?? deal.name;
    const existing = byProduct.get(id);
    if (!existing || parseFloat(deal.savings) > parseFloat(existing.savings)) {
      byProduct.set(id, deal);
    }
  }

  const top = [...byProduct.values()]
    .sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings))
    .slice(0, 9);

  return Response.json(top, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
  });
}
