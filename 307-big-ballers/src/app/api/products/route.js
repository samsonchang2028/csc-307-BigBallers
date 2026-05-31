import { getSupabase } from "@/lib/supabase";
import { searchKrogerProducts } from "@/lib/kroger";

export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  // Run Supabase and Kroger fetches in parallel
  const [supabaseResult, krogerItems] = await Promise.all([
    supabase
      .from("products")
      .select(`name, prices ( price, original_price, scraped_at, store_id )`)
      .ilike("name", `%${q}%`)
      .limit(50),
    searchKrogerProducts(q),
  ]);

  if (supabaseResult.error) {
    console.error("Supabase error:", JSON.stringify(supabaseResult.error, null, 2));
    return Response.json({ error: supabaseResult.error }, { status: 500 });
  }

  // Deduplicate prices: keep only the latest scraped_at per store_id
  const deduped = supabaseResult.data.map((product) => {
    const latest = {};
    for (const pr of product.prices ?? []) {
      const existing = latest[pr.store_id];
      if (!existing || pr.scraped_at > existing.scraped_at) {
        latest[pr.store_id] = pr;
      }
    }
    return { ...product, prices: Object.values(latest) };
  });

  // Normalize Kroger results into the same shape as Supabase products
  const krogerProducts = krogerItems.map((item) => ({
    name: item.name,
    prices: [
      {
        price: item.sale_price ?? item.price,
        original_price: item.sale_price ? item.price : null,
        scraped_at: null,
        store_id: null,
        store_name: item.store,
        source: "kroger",
      },
    ],
  }));

  return Response.json([...deduped, ...krogerProducts]);
}
