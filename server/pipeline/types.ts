export type MultilingualText = {
  en?: string | null;
  ar?: string | null;
  ku?: string | null;
};

export type GatheredBusiness = {
  source: string;
  externalId?: string;
  name: string;
  category: string;
  governorate: string;
  city: string;
  district?: string;
  address?: string;
  phone?: string;
  website?: string;
  social?: {
    instagram?: string;
    facebook?: string;
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  rating?: number;
  reviewCount?: number;
  sourceUrl?: string;
  verifiedBySource?: boolean;
  notes?: string;
  isDemo?: boolean;
};

export type NormalizedBusiness = GatheredBusiness & {
  normalizedName: string;
  normalizedPhone?: string;
  normalizedWebsite?: string;
  normalizedAddress?: string;
};

export type CandidateBusiness = {
  businessId: string;
  name: MultilingualText;
  category: string;
  subcategory?: string;
  governorate: string;
  city: string;
  district?: string;
  contact: Record<string, unknown>;
  location: Record<string, unknown>;
  confidenceScore: number;
  verificationStatus: "pending_review" | "approved" | "rejected";
  reviewState: "raw" | "candidate" | "published";
  sourceRecords: Record<string, unknown>[];
  agentNotes?: string;
  isDemo?: boolean;
};
