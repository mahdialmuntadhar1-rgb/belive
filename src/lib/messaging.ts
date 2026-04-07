import { supabase } from '@/services/supabase';

/**
 * Messaging Library - Frontend
 * 
 * This module provides functions for the Messaging Dashboard UI.
 * It calls backend API endpoints that securely handle:
 * - Campaign creation
 * - Message queuing (fetching businesses from Supabase)
 * - Message sending (via Nabda WhatsApp API)
 * 
 * The backend keeps secrets (NABDA_API_KEY, SUPABASE_SERVICE_ROLE_KEY) secure.
 */

// ============================================================================
// API ENDPOINT CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Helper to make API requests to backend
 */
async function apiRequest<T>(
  endpoint: string,
  options?: { method?: string; body?: unknown }
): Promise<{ data?: T; error?: Error }> {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    
    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        error: new Error(result.error || `HTTP ${response.status}`),
      };
    }

    return { data: result as T };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

// ============================================================================
// CORE TYPES (MVP)
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  message_text: string;
  governorate_filter: string | null;
  category_filter: string | null;
  status: 'draft' | 'pending' | 'sending' | 'completed' | 'failed' | 'queued' | 'active';
  is_testing_mode: boolean;
  total_selected: number;
  created_at: string;
}

export interface Message {
  id: string;
  campaign_id: string;
  business_id: string;
  business_name: string;
  phone_number: string;
  message_text: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'replied';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Conversation {
  business_id: string;
  business_name: string;
  phone_number: string;
  last_message_at: string;
  unread_count: number;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  direction: 'outbound' | 'inbound';
  text: string;
  status: string;
  created_at: string;
}

// ============================================================================
// CAMPAIGN FUNCTIONS
// ============================================================================

export async function createCampaign(campaign: {
  name: string;
  message_text: string;
  governorate_filter: string | null;
  category_filter: string | null;
  is_testing_mode: boolean;
}): Promise<{ data: Campaign | null; error: Error | null }> {
  console.log('[messaging] Creating campaign via API:', campaign.name);

  // Call backend API
  const { data: result, error } = await apiRequest<{
    campaign: Campaign;
    filters: {
      governorate_filter: string | null;
      category_filter: string | null;
      is_testing_mode: boolean;
    };
  }>('/api/campaigns/create', {
    method: 'POST',
    body: {
      name: campaign.name,
      message_template: campaign.message_text,
      governorate_filter: campaign.governorate_filter,
      category_filter: campaign.category_filter,
      is_testing_mode: campaign.is_testing_mode,
    },
  });

  if (error || !result?.campaign) {
    console.error('[messaging] Failed to create campaign:', error);
    return { data: null, error: error || new Error('Failed to create campaign') };
  }

  // Enhance campaign with frontend fields for compatibility
  const campaignWithExtras: Campaign = {
    ...result.campaign,
    message_text: campaign.message_text,
    governorate_filter: campaign.governorate_filter,
    category_filter: campaign.category_filter,
    is_testing_mode: campaign.is_testing_mode,
    total_selected: 0,
  };

  console.log('[messaging] Campaign created:', campaignWithExtras.id);
  return { data: campaignWithExtras, error: null };
}

export async function fetchCampaigns(): Promise<{ data: Campaign[]; error: Error | null }> {
  console.log('[messaging] Fetching campaigns...');
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Map to Campaign interface with compatibility fields
    const campaigns: Campaign[] = (data || []).map(c => ({
      ...c,
      message_text: c.message_template || '',
      governorate_filter: null,
      category_filter: null,
      is_testing_mode: false,
      total_selected: c.total_recipients || 0,
    }));

    console.log(`[messaging] Fetched ${campaigns.length} campaigns`);
    return { data: campaigns, error: null };
  } catch (error) {
    console.error('[messaging] Failed to fetch campaigns:', error);
    return { data: [], error: error as Error };
  }
}

// ============================================================================
// BUSINESS TARGETING
// ============================================================================

export async function fetchTargetBusinesses(filters?: {
  governorate?: string | null;
  category?: string | null;
  limit?: number;
}): Promise<{ 
  businesses: { id: string; name: string; phone: string; governorate: string; category: string }[];
  total: number;
  error: Error | null 
}> {
  console.log('[messaging] Fetching target businesses:', filters);
  
  try {
    // Build query with multiple phone field options and corrected status
    let query = supabase
      .from('businesses')
      .select('id, business_name, phone, phone_1, phone_2, whatsapp, governorate, category', { count: 'exact' })
      .eq('status', 'approved')
      .or('phone.not.is.null,phone_1.not.is.null,phone_2.not.is.null,whatsapp.not.is.null');
    
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate);
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    const { data, error, count } = await query.order('created_at', { ascending: false }).limit(filters?.limit || 10000);
    
    if (error) throw error;
    
    const businesses = (data || []).map(b => {
      // Try multiple phone fields in order of preference
      const phone = b.whatsapp || b.phone || b.phone_1 || b.phone_2;
      return {
        id: b.id,
        name: b.business_name,
        phone: phone,
        governorate: b.governorate,
        category: b.category
      };
    }).filter(b => b.phone && b.phone.trim() !== ''); // Filter out businesses with no valid phone
    
    console.log(`[messaging] Found ${businesses.length} businesses with phone numbers (from ${count || 0} total approved records)`);
    return { businesses, total: businesses.length, error: null };
  } catch (error) {
    console.error('[messaging] Failed to fetch businesses:', error);
    return { businesses: [], total: 0, error: error as Error };
  }
}

// ============================================================================
// MESSAGE QUEUE & SEND
// ============================================================================

export async function queueMessages(
  campaignId: string,
  businesses: { id: string; name: string; phone: string }[],
  messageText: string,
  filters?: {
    governorate?: string | null;
    category?: string | null;
    is_testing_mode?: boolean;
  }
): Promise<{ count: number; error: Error | null }> {
  console.log(`[messaging] Queuing messages via API for campaign ${campaignId}`);

  const { data, error } = await apiRequest<{
    queued: number;
    total_matching: number;
    campaign_id: string;
  }>('/api/messages/queue', {
    method: 'POST',
    body: {
      campaign_id: campaignId,
      message_template: messageText,
      governorate_filter: filters?.governorate || null,
      category_filter: filters?.category || null,
      is_testing_mode: filters?.is_testing_mode || false,
    },
  });

  if (error) {
    console.error('[messaging] Failed to queue messages:', error);
    return { count: 0, error };
  }

  console.log(`[messaging] Queued ${data?.queued || 0} messages`);
  return { count: data?.queued || 0, error: null };
}

export async function fetchPendingMessages(campaignId?: string): Promise<{ data: Message[]; error: Error | null }> {
  console.log('[messaging] Fetching pending messages...');
  
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .in('status', ['queued', 'pending'])
      .order('created_at', { ascending: true });
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { data, error } = await query.limit(100);
    
    if (error) throw error;

    // Map to Message interface with compatibility fields
    const messages: Message[] = (data || []).map(m => ({
      ...m,
      business_name: '', // Will be populated by UI if needed
      phone_number: m.phone,
      message_text: m.message_body,
    }));

    console.log(`[messaging] Found ${messages.length} pending messages`);
    return { data: messages, error: null };
  } catch (error) {
    console.error('[messaging] Failed to fetch pending messages:', error);
    return { data: [], error: error as Error };
  }
}

export async function markMessageSent(messageId: string): Promise<{ success: boolean; error: Error | null }> {
  console.log('[messaging] Marking message as sent:', messageId);
  
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', messageId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('[messaging] Failed to mark sent:', error);
    return { success: false, error: error as Error };
  }
}

export async function markMessageFailed(messageId: string, errorMsg: string): Promise<{ success: boolean; error: Error | null }> {
  console.log('[messaging] Marking message as failed:', messageId);
  
  try {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'failed', error_message: errorMsg })
      .eq('id', messageId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// ============================================================================
// SEND MESSAGES VIA BACKEND API
// ============================================================================

/**
 * Send queued messages via backend API
 * Backend endpoint: POST /api/messages/send
 */
export async function sendQueuedMessages(options?: {
  campaignId?: string;
  batchSize?: number;
}): Promise<{
  success: boolean;
  sent?: number;
  failed?: number;
  error?: Error;
}> {
  console.log('[messaging] Sending messages via API...');

  const { data, error } = await apiRequest<{
    processed: number;
    sent: number;
    failed: number;
    results: Array<{ message_id: string; status: string; error?: string }>;
  }>('/api/messages/send', {
    method: 'POST',
    body: {
      campaign_id: options?.campaignId,
      batch_size: options?.batchSize || 20,
      delay_ms: 4000, // ~15 messages per minute
    },
  });

  if (error) {
    console.error('[messaging] Failed to send messages:', error);
    return { success: false, error };
  }

  console.log(`[messaging] Send complete: ${data?.sent} sent, ${data?.failed} failed`);
  return {
    success: true,
    sent: data?.sent,
    failed: data?.failed,
  };
}

// ============================================================================
// INBOX / CONVERSATIONS
// ============================================================================

export async function fetchConversations(): Promise<{ data: Conversation[]; error: Error | null }> {
  console.log('[messaging] Fetching conversations...');
  
  try {
    // First, get all conversations with their latest info
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    
    if (convError) throw convError;
    
    const result: Conversation[] = [];
    
    for (const conv of (conversations || [])) {
      // Get all messages for this conversation
      const { data: msgs, error: msgError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });
      
      if (!msgError && msgs) {
        result.push({
          business_id: conv.business_id,
          business_name: conv.business_name || 'Unknown',
          phone_number: conv.phone_number,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread_count || 0,
          messages: msgs.map(m => ({
            id: m.id,
            direction: m.direction as 'outbound' | 'inbound',
            text: m.message_text,
            status: m.status,
            created_at: m.created_at
          }))
        });
      }
    }
    
    console.log(`[messaging] Found ${result.length} conversations`);
    return { data: result, error: null };
  } catch (error) {
    console.error('[messaging] Failed to fetch conversations:', error);
    return { data: [], error: error as Error };
  }
}

// ============================================================================
// CATEGORIES & GOVERNORATES
// ============================================================================

export const CATEGORIES = [
  { id: 'Restaurant', label: 'Restaurants', icon: 'Restaurant' },
  { id: 'Cafe', label: 'Cafes', icon: 'Cafe' },
  { id: 'Hotel', label: 'Hotels', icon: 'Hotel' },
  { id: 'Hospital', label: 'Hospitals', icon: 'Hospital' },
  { id: 'Clinic', label: 'Clinics', icon: 'Clinic' },
  { id: 'Pharmacy', label: 'Pharmacies', icon: 'Pharmacy' },
  { id: 'Supermarket', label: 'Supermarkets', icon: 'Supermarket' },
  { id: 'Shopping', label: 'Shopping', icon: 'Shopping' },
  { id: 'Gym', label: 'Gyms', icon: 'Gym' },
  { id: 'Salon', label: 'Salons', icon: 'Salon' },
  { id: 'Car Repair', label: 'Car Repair', icon: 'Car Repair' },
  { id: 'Electronics', label: 'Electronics', icon: 'Electronics' },
  { id: 'Education', label: 'Education', icon: 'Education' },
  { id: 'Real Estate', label: 'Real Estate', icon: 'Real Estate' },
  { id: 'Travel', label: 'Travel', icon: 'Travel' },
  { id: 'Bank', label: 'Banks', icon: 'Bank' },
  { id: 'Other', label: 'Other', icon: 'Other' },
];

export const GOVERNORATES = [
  'Baghdad', 'Basra', 'Mosul', 'Erbil', 'Sulaymaniyah', 'Najaf', 'Karbala',
  'Kirkuk', 'Duhok', 'Anbar', 'Babil', 'Dhi Qar', 'Diyala', 'Maysan',
  'Muthanna', 'Qadisiyyah', 'Saladin', 'Wasit'
];
