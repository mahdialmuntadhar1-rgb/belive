import { BaseGovernor, GovernorRuntimeConfig } from "./base-governor.js";
import { QualityControlGovernor } from "./qc-manager.js";
import { RestaurantsGovernor } from "./restaurants.js";

class UnsupportedGovernor extends BaseGovernor {
  constructor(config: GovernorRuntimeConfig, private reason: string) {
    super(config);
  }

  async gather(): Promise<import("../pipeline/types.js").GatheredBusiness[]> {
    throw new Error(`${this.config.agentName}: ${this.reason}`);
  }
}

export const agentConfigs: GovernorRuntimeConfig[] = [
  { agentName: "Agent-01", governorate: "Baghdad", categories: ["restaurants"], sourceAdapters: ["google_places"], collectionLimit: 30, retryPolicy: { maxAttempts: 3, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 60 } },
  { agentName: "Agent-02", governorate: "Basra", categories: ["cafes"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-03", governorate: "Nineveh", categories: ["bakeries"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-04", governorate: "Erbil", categories: ["hotels"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-05", governorate: "Sulaymaniyah", categories: ["gyms"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-06", governorate: "Kirkuk", categories: ["beauty_salons"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-07", governorate: "Duhok", categories: ["pharmacies"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-08", governorate: "Anbar", categories: ["supermarkets"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-09", governorate: "Babil", categories: ["restaurants"], sourceAdapters: ["google_places"], collectionLimit: 30, retryPolicy: { maxAttempts: 3, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 60 } },
  { agentName: "Agent-10", governorate: "Karbala", categories: ["cafes"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-11", governorate: "Wasit", categories: ["bakeries"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-12", governorate: "Dhi Qar", categories: ["hotels"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-13", governorate: "Maysan", categories: ["gyms"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-14", governorate: "Muthanna", categories: ["beauty_salons"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-15", governorate: "Najaf", categories: ["pharmacies"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-16", governorate: "Qadisiyyah", categories: ["supermarkets"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "Agent-17", governorate: "Saladin", categories: ["restaurants"], sourceAdapters: ["google_places"], collectionLimit: 30, retryPolicy: { maxAttempts: 3, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 60 } },
  { agentName: "Agent-18", governorate: "Diyala", categories: ["cafes"], sourceAdapters: ["not_implemented"], collectionLimit: 30, retryPolicy: { maxAttempts: 2, backoffMs: 500 }, rateLimitPolicy: { requestsPerMinute: 30 } },
  { agentName: "QC Overseer", governorate: "Iraq", categories: ["quality_control"], sourceAdapters: ["supabase"], collectionLimit: 0, retryPolicy: { maxAttempts: 1, backoffMs: 0 }, rateLimitPolicy: { requestsPerMinute: 10 } },
];

function createGovernor(config: GovernorRuntimeConfig): BaseGovernor {
  if (config.agentName === "QC Overseer") return new QualityControlGovernor(config);
  if (config.categories.includes("restaurants") && config.sourceAdapters.includes("google_places")) {
    return new RestaurantsGovernor(config);
  }
  return new UnsupportedGovernor(config, "No implemented source adapter for configured category.");
}

const governors = new Map(agentConfigs.map((config) => [config.agentName, createGovernor(config)]));

export async function runGovernor(agentName: string) {
  const governor = governors.get(agentName);
  if (!governor) throw new Error(`Governor ${agentName} not found`);
  return governor.run();
}

export async function runAllGovernors() {
  const results = [];
  for (const agentName of governors.keys()) {
    try {
      const result = await runGovernor(agentName);
      results.push({ agentName, status: "success", result });
    } catch (error: any) {
      results.push({ agentName, status: "error", error: error.message });
    }
  }
  return results;
}
