// Kroger API helper — server-side only (uses secret credentials)
// Covers Kroger-owned stores: Food 4 Less (SLO area)
// Location IDs can be found via GET /v1/locations?filter.zipCode=93401&filter.chain=FOOD4LESS

const BASE_URL = process.env.KROGER_ENV === "prod"
  ? "https://api.kroger.com"
  : "https://api-ce.kroger.com";

const TOKEN_URL = `${BASE_URL}/v1/connect/oauth2/token`;
const PRODUCTS_URL = `${BASE_URL}/v1/products`;

// Kroger-owned SLO store locations
const SLO_STORES = [
  { locationId: "70300133", name: "Ralphs" },       // 201 Madonna Rd, SLO
  { locationId: "01400943", name: "Food 4 Less" },  // SLO
];

let _token = null;
let _tokenExpiry = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const creds = Buffer.from(
    `${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=product.compact",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kroger token error ${res.status}: ${body}`);
  }

  const json = await res.json();
  _token = json.access_token;
  _tokenExpiry = Date.now() + (json.expires_in - 60) * 1000; // refresh 60s early
  return _token;
}

/**
 * Search Kroger products by term at the SLO Food 4 Less location.
 * Returns an array of { name, price, sale_price, store } objects.
 */
export async function searchKrogerProducts(query) {
  if (!process.env.KROGER_CLIENT_ID || !process.env.KROGER_CLIENT_SECRET) {
    console.error("[Kroger] Missing credentials in env");
    return [];
  }

  try {
    console.log("[Kroger] Fetching products for:", query);
    const token = await getToken();
    console.log("[Kroger] Token acquired");

    const results = await Promise.all(
      SLO_STORES.map(async ({ locationId, name }) => {
        const params = new URLSearchParams({
          "filter.term": query,
          "filter.locationId": locationId,
          "filter.limit": "10",
        });
        const res = await fetch(`${PRODUCTS_URL}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return (json.data ?? []).map((item) => {
          const priceInfo = item.items?.[0]?.price;
          const frontImg = item.images?.find(img => img.perspective === "front");
          const thumbUrl = frontImg?.sizes?.find(s => s.size === "medium")?.url
            ?? frontImg?.sizes?.find(s => s.size === "small")?.url
            ?? frontImg?.sizes?.find(s => s.size === "thumbnail")?.url
            ?? frontImg?.sizes?.[0]?.url
            ?? null;
          return {
            name: item.description,
            price: priceInfo?.regular ?? null,
            sale_price: priceInfo?.promo ?? null,
            store: name,
            source: "kroger",
            image_url: thumbUrl,
          };
        }).filter((item) => item.price !== null);
      })
    );

    return results.flat();
  } catch (err) {
    console.error("Kroger API error:", err.message);
    return [];
  }
}
