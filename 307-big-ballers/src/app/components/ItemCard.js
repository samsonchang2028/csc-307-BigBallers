"use client";

export default function ItemCard({ product, onClose }) {
  const prices = product.prices ?? [];
  const sorted = [...prices].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const cheapest = sorted[0] ?? null;

  const storeNames = {
    "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
    "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
    "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
    "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
    "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
  };

  function getStoreName(pr) {
    return pr.store_name ?? storeNames[pr.store_id] ?? pr.store_id ?? "Unknown";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 capitalize">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Best price callout */}
        {cheapest && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">🏷️</span>
            <div>
              <p className="font-semibold text-green-800">Best price at {getStoreName(cheapest)}</p>
              <p className="text-green-700 text-sm">${parseFloat(cheapest.price).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Price comparison table */}
        <h3 className="font-semibold text-gray-700 mb-2">Price Comparison</h3>
        <div className="border rounded-xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Store</th>
                <th className="text-right px-4 py-2">Price</th>
                <th className="text-right px-4 py-2">Regular</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pr, i) => (
                  <tr key={i} className={`border-t ${i === 0 ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{getStoreName(pr)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ${parseFloat(pr.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 line-through">
                      {pr.original_price ? `$${parseFloat(pr.original_price).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 text-center">Prices and availability may vary by location.</p>
      </div>
    </div>
  );
}
