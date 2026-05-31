"use client";

const STORE_NAMES = {
  "d509a460-ad97-4099-a6df-d03798e03d6d": "Sprouts",
  "0c293cf1-2b65-4d9e-9cb2-4688b41460f7": "Smart & Final",
  "eefcee75-d1f4-49c3-8a40-c59982d72287": "Grocery Outlet",
  "9ae30061-19f8-41f5-8bdf-85694ddec2dc": "Cal Fresh",
  "1971e92b-78af-4dcc-9bfa-cf3349b649ef": "Trader Joe's",
};

function getStoreName(pr) {
  return pr.store_name ?? STORE_NAMES[pr.store_id] ?? pr.store_id ?? "Unknown";
}

export default function ItemCard({ product, onClose }) {
  const pr = product.prices?.[0] ?? null;
  const storeName = pr ? getStoreName(pr) : null;
  const hasDiscount = pr?.original_price && parseFloat(pr.original_price) > parseFloat(pr.price);
  const savings = hasDiscount
    ? (parseFloat(pr.original_price) - parseFloat(pr.price)).toFixed(2)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0">&times;</button>
        </div>

        {/* Category badge */}
        {product.category && (
          <span className="inline-block text-xs font-medium text-green-700 bg-green-100 rounded-full px-3 py-0.5 mb-4">
            {product.category}
          </span>
        )}

        {/* Price + store */}
        {pr && (
          <div className="border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{storeName}</p>
                <p className="text-3xl font-bold text-gray-900">${parseFloat(pr.price).toFixed(2)}</p>
                {hasDiscount && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    Regular <span className="line-through">${parseFloat(pr.original_price).toFixed(2)}</span>
                    <span className="text-green-600 ml-1">Save ${savings}</span>
                  </p>
                )}
              </div>
              {hasDiscount && (
                <div className="bg-green-100 text-green-700 text-sm font-semibold rounded-full px-3 py-1">
                  Sale
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">Prices and availability may vary by location.</p>
      </div>
    </div>
  );
}
