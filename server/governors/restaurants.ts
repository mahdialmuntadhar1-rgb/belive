import { BaseGovernor, GovernorRuntimeConfig } from "./base-governor.js";
import { GatheredBusiness } from "../pipeline/types.js";

async function fetchWithRetry(url: string, attempts: number, timeoutMs: number): Promise<any> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
}

export class RestaurantsGovernor extends BaseGovernor {
  constructor(config: GovernorRuntimeConfig) {
    super(config);
  }

  async gather(): Promise<GatheredBusiness[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is required for restaurants governor");
    }

    const city = this.config.governorate;
    const query = encodeURIComponent(`restaurants in ${city}, Iraq`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    const data = await fetchWithRetry(url, this.config.retryPolicy.maxAttempts, 8000);

    if (!Array.isArray(data.results)) {
      throw new Error(`Google Places returned invalid payload for ${city}`);
    }

    return data.results.slice(0, this.config.collectionLimit).map((place: any) => ({
      source: "google_places",
      externalId: place.place_id,
      name: String(place.name || "").trim(),
      category: "restaurants",
      governorate: this.config.governorate,
      city: this.config.governorate,
      address: typeof place.formatted_address === "string" ? place.formatted_address.trim() : undefined,
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      sourceUrl: place.place_id ? `https://maps.google.com/?cid=${place.place_id}` : undefined,
      verifiedBySource: false,
      notes: "Collected from Google Places text search.",
    }));
  }
}
