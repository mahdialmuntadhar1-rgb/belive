import assert from "node:assert/strict";
import { scoreConfidence } from "../pipeline/confidence.js";
import { deduplicateBusinesses } from "../pipeline/deduplication.js";
import { normalizeBusiness, normalizePhone, normalizeWebsite } from "../pipeline/normalization.js";
import { loadConfig } from "../config.js";

const normalizedPhone = normalizePhone("0770 123 4567");
assert.equal(normalizedPhone, "+9647701234567");

const normalizedWebsite = normalizeWebsite("example.com/");
assert.equal(normalizedWebsite, "https://example.com");

const normalized = normalizeBusiness({
  source: "google_places",
  name: " مطعم دجلة ",
  category: "restaurants",
  governorate: "Baghdad",
  city: "Baghdad",
  phone: "0770 123 4567",
});
assert.equal(normalized.normalizedName, "مطعم دجلة");

const score = scoreConfidence({
  ...normalized,
  reviewCount: 30,
  rating: 4.2,
  coordinates: { lat: 33.3, lng: 44.4 },
});
assert.ok(score >= 0.75);

const dedupe = deduplicateBusinesses([
  normalized,
  { ...normalized, source: "google_places", externalId: "another" },
]);
assert.equal(dedupe.accepted.length, 1);

const config = loadConfig({
  NODE_ENV: "development",
  PORT: "3000",
  DEMO_MODE: "false",
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
});
assert.equal(config.port, 3000);

console.log("Sanity checks passed.");
