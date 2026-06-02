import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPriceHistorySeries } from "./utils.js";

test("buildPriceHistorySeries sorts ascending by price and maps to {store, color, price}", () => {
  const series = buildPriceHistorySeries([
    { price: "3.50", store_name: "Ralphs" },
    { price: "1.99", store_name: "Sprouts Farmers Market" },
  ]);
  assert.equal(series.length, 2);
  assert.equal(series[0].price, 1.99);
  assert.equal(series[0].store, "Sprouts");
  assert.equal(series[1].store, "Ralphs");
  assert.ok(series[0].color);
});

test("buildPriceHistorySeries caps at 4 stores", () => {
  const prices = Array.from({ length: 7 }, (_, i) => ({ price: i + 1, store_name: `Store ${i}` }));
  assert.equal(buildPriceHistorySeries(prices).length, 4);
});

test("buildPriceHistorySeries ignores invalid prices and handles empty/undefined input", () => {
  assert.deepEqual(buildPriceHistorySeries(undefined), []);
  assert.deepEqual(buildPriceHistorySeries([]), []);
  const series = buildPriceHistorySeries([{ price: null }, { price: "2.00", store_id: "x" }]);
  assert.equal(series.length, 1);
  assert.equal(series[0].price, 2);
});
