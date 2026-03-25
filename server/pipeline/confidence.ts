import { NormalizedBusiness } from "./types.js";

const SOURCE_RELIABILITY: Record<string, number> = {
  google_places: 0.5,
  manual: 0.6,
};

export function scoreConfidence(item: NormalizedBusiness, duplicateConflictScore = 0): number {
  let score = SOURCE_RELIABILITY[item.source] ?? 0.2;

  if (item.normalizedPhone) score += 0.1;
  if (item.coordinates?.lat && item.coordinates?.lng) score += 0.1;
  if (item.social?.facebook || item.social?.instagram) score += 0.1;
  if (item.reviewCount && item.reviewCount > 20) score += 0.1;
  if (item.rating && item.rating >= 4) score += 0.05;

  score -= Math.min(0.25, duplicateConflictScore * 0.3);
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}
