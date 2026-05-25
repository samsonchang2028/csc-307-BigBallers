import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  const words = q.trim().split(/\s+/).filter(Boolean);
  let query = supabaseServer
    .from("products")
    .select(`
      name,
      prices ( price, original_price, scraped_at, store_id )
    `);

  for (const word of words) {
    query = query.ilike("name", `%${word}%`);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("Supabase error:", JSON.stringify(error, null, 2));
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
  return Response.json(data);
}
