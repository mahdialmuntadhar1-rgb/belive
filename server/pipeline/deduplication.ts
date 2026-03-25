import { NormalizedBusiness } from "./types.js";

function scorePair(a: NormalizedBusiness, b: NormalizedBusiness): number {
  let score = 0;
  if (a.normalizedName === b.normalizedName) score += 0.5;
  if (a.normalizedPhone && b.normalizedPhone && a.normalizedPhone === b.normalizedPhone) score += 0.35;
  if (a.normalizedWebsite && b.normalizedWebsite && a.normalizedWebsite === b.normalizedWebsite) score += 0.15;
  return score;
}

export function deduplicateBusinesses(items: NormalizedBusiness[]) {
  const accepted: NormalizedBusiness[] = [];
  const ambiguous: Array<{ candidate: NormalizedBusiness; matchedWith: string; score: number }> = [];

  for (const item of items) {
    const conflict = accepted
      .map((existing) => ({ existing, score: scorePair(item, existing) }))
      .sort((a, b) => b.score - a.score)[0];

    if (!conflict || conflict.score < 0.6) {
      accepted.push(item);
      continue;
    }

    if (conflict.score >= 0.85) {
      // hard duplicate, skip
      continue;
    }

    ambiguous.push({ candidate: item, matchedWith: conflict.existing.name, score: conflict.score });
  }

  return { accepted, ambiguous };
}
