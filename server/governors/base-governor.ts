import { supabaseAdmin } from "../supabase-admin.js";
import { scoreConfidence } from "../pipeline/confidence.js";
import { deduplicateBusinesses } from "../pipeline/deduplication.js";
import { normalizeBusiness } from "../pipeline/normalization.js";
import { CandidateBusiness, GatheredBusiness, NormalizedBusiness } from "../pipeline/types.js";

export type GovernorRuntimeConfig = {
  agentName: string;
  governorate: string;
  categories: string[];
  sourceAdapters: string[];
  collectionLimit: number;
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
  rateLimitPolicy: {
    requestsPerMinute: number;
  };
};

export abstract class BaseGovernor {
  protected supabase = supabaseAdmin;
  constructor(public config: GovernorRuntimeConfig) {}

  validateConfig() {
    if (!this.config.sourceAdapters.length) {
      throw new Error(`${this.config.agentName}: sourceAdapters must not be empty`);
    }
  }

  abstract gather(): Promise<GatheredBusiness[]>;

  normalize(items: GatheredBusiness[]): NormalizedBusiness[] {
    return items.map(normalizeBusiness);
  }

  deduplicate(items: NormalizedBusiness[]) {
    return deduplicateBusinesses(items);
  }

  scoreConfidence(items: NormalizedBusiness[]) {
    return items.map((item) => ({ item, score: scoreConfidence(item) }));
  }

  async persist(items: CandidateBusiness[]) {
    if (!items.length) {
      return { inserted: 0, skipped: 0 };
    }

    const insertable = items.filter((x) => !x.isDemo);

    if (!insertable.length) {
      return { inserted: 0, skipped: items.length };
    }

    const { error } = await this.supabase.from("businesses").upsert(
      insertable.map((item) => ({
        business_id: item.businessId,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        governorate: item.governorate,
        city: item.city,
        district: item.district,
        contact: item.contact,
        location: item.location,
        confidence_score: item.confidenceScore,
        verification_status: item.verificationStatus,
        review_state: item.reviewState,
        source_records: item.sourceRecords,
        agent_notes: item.agentNotes,
      })),
      { onConflict: "business_id" },
    );

    if (error) {
      throw new Error(`Persist failed for ${this.config.agentName}: ${error.message}`);
    }

    return { inserted: insertable.length, skipped: items.length - insertable.length };
  }

  async report(result: { inserted: number; skipped: number; ambiguous: number; status: string }) {
    await this.supabase.from("agent_logs").insert({
      agent_name: this.config.agentName,
      action: "run",
      details: JSON.stringify(result),
      result: result.status,
    });
  }

  protected toCandidate(item: NormalizedBusiness, confidenceScore: number): CandidateBusiness {
    const businessId = `${item.governorate}-${item.category}-${item.normalizedName}`.replace(/\s+/g, "-").toLowerCase();

    return {
      businessId,
      name: { en: item.name, ar: null, ku: null },
      category: item.category,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      contact: {
        phone: item.normalizedPhone,
        website: item.normalizedWebsite,
        social: item.social,
      },
      location: {
        address: item.address,
        coordinates: item.coordinates,
      },
      confidenceScore,
      verificationStatus: confidenceScore >= 0.85 ? "approved" : "pending_review",
      reviewState: confidenceScore >= 0.85 ? "published" : "candidate",
      sourceRecords: [{ source: item.source, sourceUrl: item.sourceUrl, externalId: item.externalId }],
      agentNotes: item.notes,
      isDemo: item.isDemo,
    };
  }

  async run() {
    this.validateConfig();
    const gathered = await this.gather();
    const normalized = this.normalize(gathered);
    const deduplicated = this.deduplicate(normalized);
    const scored = this.scoreConfidence(deduplicated.accepted);

    const candidates = scored.map(({ item, score }) => this.toCandidate(item, score));
    const persistResult = await this.persist(candidates);

    await this.report({
      inserted: persistResult.inserted,
      skipped: persistResult.skipped,
      ambiguous: deduplicated.ambiguous.length,
      status: "success",
    });

    return {
      ...persistResult,
      ambiguous: deduplicated.ambiguous,
      totalGathered: gathered.length,
      totalAccepted: deduplicated.accepted.length,
    };
  }
}
