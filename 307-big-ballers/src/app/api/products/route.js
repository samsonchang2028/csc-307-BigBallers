import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const { data, error } = await supabase
    .from("prices")
    .select(
      `
    price,
    original_price,
    scraped_at,
    products ( name )
  `,
    )
    .order("scraped_at", { ascending: false })
    .limit(10);

  if (error) return Response.json({ error }, { status: 500 });
  return Response.json(data);
}
