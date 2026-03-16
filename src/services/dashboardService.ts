import { supabase } from '../lib/supabase';
import { RawBusiness, VerifiedBusiness, AgentTask } from '../types';

export const businessService = {
  async getStats() {
    const [
      { count: rawCount },
      { count: verifiedCount },
      { count: pendingCount },
      { count: approvedCount },
      { count: taskCount }
    ] = await Promise.all([
      supabase.from('raw_businesses').select('*', { count: 'exact', head: true }),
      supabase.from('verified_businesses').select('*', { count: 'exact', head: true }),
      supabase.from('verified_businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('verified_businesses').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('agent_tasks').select('*', { count: 'exact', head: true })
    ]);

    return {
      rawCount: rawCount || 0,
      verifiedCount: verifiedCount || 0,
      pendingCount: pendingCount || 0,
      approvedCount: approvedCount || 0,
      taskCount: taskCount || 0
    };
  },

  async getVerifiedBusinesses(filters: any) {
    let query = supabase.from('verified_businesses').select('*');
    
    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase());
    }
    if (filters.governorate && filters.governorate !== 'All') {
      query = query.eq('governorate', filters.governorate);
    }
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters.minScore) {
      query = query.gte('confidence_score', filters.minScore);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as VerifiedBusiness[];
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('verified_businesses')
      .update({ 
        status, 
        approved_at: status === 'approved' ? new Date().toISOString() : null 
      })
      .eq('id', id);
    if (error) throw error;
  },

  async batchApprove(ids: string[]) {
    const { error } = await supabase
      .from('verified_businesses')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .in('id', ids);
    if (error) throw error;
  }
};

export const cleaningService = {
  repairText(text: string): string {
    if (!text) return '';
    // Basic Mojibake repair for common Arabic/Kurdish UTF-8 issues
    // In a real scenario, this would be more complex
    try {
      return decodeURIComponent(escape(text));
    } catch (e) {
      return text;
    }
  },

  calculateScores(business: Partial<VerifiedBusiness>) {
    let vScore = 0;
    let cScore = 0;

    const hasName = !!(business.name_ar || business.name_ku || business.name_en);
    const hasLocation = !!(business.governorate && business.city);
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
  }
};

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as AgentTask[];
  },

  async createTask(task: Partial<AgentTask>) {
    const { error } = await supabase.from('agent_tasks').insert([task]);
    if (error) throw error;
  },

  async getLogs(taskId: string) {
    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('record_id', taskId) // Assuming record_id links to task for logs
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};
