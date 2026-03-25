import { BaseGovernor, GovernorRuntimeConfig } from "./base-governor.js";
import { GatheredBusiness } from "../pipeline/types.js";

export class QualityControlGovernor extends BaseGovernor {
  constructor(config: GovernorRuntimeConfig) {
    super(config);
  }

  async gather(): Promise<GatheredBusiness[]> {
    // QC governor does not collect businesses directly.
    return [];
  }

  override async run() {
    const lowConfidenceThreshold = 0.65;

    await this.supabase
      .from("businesses")
      .update({ review_state: "candidate", verification_status: "pending_review" })
      .lt("confidence_score", lowConfidenceThreshold)
      .neq("review_state", "raw");

    const { data: pendingReview } = await this.supabase
      .from("businesses")
      .select("id", { count: "exact" })
      .eq("verification_status", "pending_review");

    await this.report({
      inserted: 0,
      skipped: 0,
      ambiguous: pendingReview?.length || 0,
      status: "success",
    });

    return { inserted: 0, skipped: 0, totalGathered: 0, totalAccepted: 0, ambiguous: [] };
  }
}
