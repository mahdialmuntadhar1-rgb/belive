import { supabase } from '../lib/supabase';
import { VerifiedBusiness, AgentTask } from '../types';

export const businessService = {
  async getStats() {
    const [
      rawCountResult,
      verifiedCountResult,
      pendingCountResult,
      approvedCountResult,
      taskCountResult,
    ] = await Promise.all([
      supabase.from('raw_businesses').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('agent_tasks').select('*', { count: 'exact', head: true }),
    ]);

    return {
      rawCount: rawCountResult.count ?? 0,
      verifiedCount: verifiedCountResult.count ?? 0,
      pendingCount: pendingCountResult.count ?? 0,
      approvedCount: approvedCountResult.count ?? 0,
      taskCount: taskCountResult.count ?? 0,
    };
  },

  async getVerifiedBusinesses(filters: any) {
    let query = supabase.from('businesses').select('*').order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'All') query = query.eq('status', filters.status.toLowerCase());
    if (filters.city && filters.city !== 'All') query = query.eq('city', filters.city);
    if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category);
    if (filters.minScore) query = query.gte('confidence_score', filters.minScore);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as VerifiedBusiness[];
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
      .eq('id', id);

    if (error) throw error;
  },

  async batchApprove(ids: string[]) {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from('businesses')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;
  },
};

export const cleaningService = {
  repairText(text: string): string {
    if (!text) return '';
    try {
      return decodeURIComponent(escape(text));
    } catch {
      return text;
    }
  },

  calculateScores(business: Partial<VerifiedBusiness>) {
    let vScore = 0;
    let cScore = 0;

    const hasName = !!(business.name_ar || business.name_ku || business.name_en);
    const hasLocation = !!business.city;
    const hasPhone = !!business.phone;

    if (hasName) vScore = 1;
    if (hasName && hasLocation) vScore = 2;
    if (hasName && hasLocation && hasPhone) vScore = 3;

    if (hasName) cScore += 40;
    if (hasLocation) cScore += 30;
    if (hasPhone) cScore += 30;

    return { vScore, cScore };
  },

  async pushToRaw(records: any[]) {
    const { error } = await supabase.from('raw_businesses').insert(records);
    if (error) throw error;
  },
};

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase.from('agent_tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AgentTask[];
  },

  async createTask(task: Partial<AgentTask>) {
    const { error } = await supabase.from('agent_tasks').insert({
      ...task,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async getLogs(taskId: string) {
    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('record_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};
