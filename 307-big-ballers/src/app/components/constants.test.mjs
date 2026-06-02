import { test } from "node:test";
import assert from "node:assert/strict";
import { getStoreName } from "./constants.js";

test("getStoreName resolves a known store id to its name", () => {
  assert.equal(getStoreName("kroger-ralphs"), "Ralphs");
  assert.equal(
    getStoreName("d509a460-ad97-4099-a6df-d03798e03d6d"),
    "Sprouts Farmers Market"
  );
});

test("getStoreName uses the fallback for an unknown id", () => {
  assert.equal(getStoreName("not-a-real-id", "Whole Foods"), "Whole Foods");
});

test("getStoreName returns the id when no fallback and id is unknown", () => {
  assert.equal(getStoreName("xyz"), "xyz");
  assert.equal(getStoreName(undefined, undefined), "Unknown");
});
