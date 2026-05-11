import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .select(`
      name,
      prices ( price, original_price, scraped_at, store_id )
    `)
    .ilike("name", `%${q}%`)
    .limit(50);

  if (error) {
    console.error("Supabase error:", JSON.stringify(error, null, 2));
    return Response.json({ error }, { status: 500 });
  }
  return Response.json(data);
}
