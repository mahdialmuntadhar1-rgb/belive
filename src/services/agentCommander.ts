import { supabase } from '../lib/supabase';

export interface BusinessRecord {
  id?: string;
  name: { en: string; ar: string; ku: string };
  description: { en: string; ar: string; ku: string };
  category: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  governorate: string;
  confidence_score?: number;
  is_verified?: boolean;
  needs_review?: boolean;
  scraped_photo_url?: string;
  ai_processed_data?: any;
}

export class AgentCommander {
  static async triggerRegionalAgent(governorate: string) {
    const response = await fetch(`/api/agents/${encodeURIComponent(governorate)}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || `Failed to trigger ${governorate}`);
    }

    return response.json();
  }

  static async runQCOverseer(recordId: string, confidenceScore: number) {
    const needsReview = confidenceScore < 0.85;

    const { error } = await supabase
      .from('businesses')
      .update({
        review_state: needsReview ? 'candidate' : 'published',
        verification_status: needsReview ? 'pending_review' : 'approved',
        confidence_score: confidenceScore,
      })
      .eq('id', recordId);

    if (error) throw error;

    return { needsReview };
  }

  static async manualOverride(recordId: string, updates: Partial<BusinessRecord>) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        verification_status: 'approved',
        review_state: 'published',
        approved_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .select();

    if (error) throw error;
    return data;
  }
}
