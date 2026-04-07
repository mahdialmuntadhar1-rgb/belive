#!/usr/bin/env node
/**
 * Bulk Messaging Sender for WhatsApp Cloud API
 * Production-ready worker with rate limiting, retries, and campaign sync
 * 
 * Usage: node scripts/bulk-sender.js <campaign_id>
 * Or: npm run bulk-send -- <campaign_id>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from project root
dotenv.config({ path: join(__dirname, '../.env') });

// ==================== CONFIGURATION ====================

const CONFIG = {
  // Rate limiting: 25 messages per minute = 1 message every 2.4 seconds
  // Using 3000ms (20 msg/min) to be safe and avoid rate limits
  MESSAGE_DELAY_MS: parseInt(process.env.BULK_SEND_DELAY_MS) || 3000,
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 5000,
  BATCH_SIZE: 100, // Fetch businesses in batches
  STATE_FILE: join(__dirname, '../.bulk-sender-state.json'),
  // Testing mode: limit to 20 businesses max
  TESTING_MODE: process.env.BULK_SEND_TEST_MODE === 'true',
  TEST_MODE_LIMIT: 20,
};

// WhatsApp Cloud API Config
const WHATSAPP_API = {
  BASE_URL: 'https://graph.facebook.com/v18.0',
  TOKEN: process.env.WHATSAPP_API_TOKEN,
  PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
};

// Supabase Config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ==================== STATE MANAGEMENT ====================

class CampaignState {
  constructor(campaignId) {
    this.campaignId = campaignId;
    this.state = this.load();
  }

  load() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
        if (data.campaignId === this.campaignId) {
          console.log('📂 Resuming from previous state');
          return data;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load state file');
    }
    return {
      campaignId: this.campaignId,
      status: 'running', // running, paused, completed, failed
      processedCount: 0,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
      retryCount: 0,
      lastProcessedId: null,
      errors: [],
      startedAt: new Date().toISOString(),
      pausedAt: null,
      completedAt: null,
    };
  }

  save() {
    try {
      fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.warn('⚠️ Could not save state file');
    }
  }

  update(updates) {
    this.state = { ...this.state, ...updates };
    this.save();
  }

  isPaused() {
    return this.state.status === 'paused';
  }

  isRunning() {
    return this.state.status === 'running';
  }

  pause() {
    this.update({ status: 'paused', pausedAt: new Date().toISOString() });
    console.log('⏸️ Campaign paused. Run again to resume.');
  }

  complete() {
    this.update({ 
      status: 'completed', 
      completedAt: new Date().toISOString() 
    });
    this.printFinalStats();
    this.cleanup();
  }

  fail(error) {
    this.update({ 
      status: 'failed', 
      errors: [...this.state.errors, error.message || error]
    });
    console.error('❌ Campaign failed:', error);
  }

  printProgress(total) {
    const { processedCount, sentCount, failedCount, skippedCount } = this.state;
    const percent = ((processedCount / total) * 100).toFixed(1);
    const eta = this.calculateETA(total - processedCount);
    
    console.log(`\n📊 Progress: ${processedCount}/${total} (${percent}%) | ✅ Sent: ${sentCount} | ❌ Failed: ${failedCount} | ⏭️ Skipped: ${skippedCount} | ⏱️ ETA: ${eta}`);
  }

  printFinalStats() {
    const { startedAt, completedAt, sentCount, failedCount, skippedCount, retryCount } = this.state;
    const duration = completedAt && startedAt 
      ? ((new Date(completedAt) - new Date(startedAt)) / 1000 / 60).toFixed(1)
      : 0;
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 CAMPAIGN COMPLETED');
    console.log('='.repeat(50));
    console.log(`✅ Sent: ${sentCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`🔄 Retries: ${retryCount}`);
    console.log(`⏱️ Duration: ${duration} minutes`);
    console.log('='.repeat(50));
  }

  calculateETA(remaining) {
    const minutes = Math.ceil((remaining * CONFIG.MESSAGE_DELAY_MS) / 1000 / 60);
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  cleanup() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        fs.unlinkSync(CONFIG.STATE_FILE);
        console.log('🧹 State file cleaned up');
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// ==================== WHATSAPP API CLIENT ====================

class WhatsAppClient {
  constructor() {
    if (!WHATSAPP_API.TOKEN || !WHATSAPP_API.PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials missing. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
    }
  }

  async sendMessage(phone, messageBody) {
    // Format phone number (remove + if present, ensure country code)
    const formattedPhone = phone.replace(/^\+/, '').replace(/\s/g, '');

    const url = `${WHATSAPP_API.BASE_URL}/${WHATSAPP_API.PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API.TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    return {
      externalMessageId: data.messages?.[0]?.id,
      status: 'sent',
    };
  }
}

// ==================== BULK SENDER ====================

class BulkMessageSender {
  constructor(campaignId) {
    this.campaignId = campaignId;
    this.state = new CampaignState(campaignId);
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.whatsapp = new WhatsAppClient();
    
    // Handle graceful shutdown
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Pausing campaign...`);
      this.state.pause();
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  async run(filters = {}) {
    try {
      console.log('🚀 Starting bulk messaging campaign...');
      console.log(`Campaign ID: ${this.campaignId}`);
      console.log(`Rate limit: ${(60000 / CONFIG.MESSAGE_DELAY_MS).toFixed(0)} messages/minute`);
      console.log(`Max retries: ${CONFIG.MAX_RETRIES}`);
      if (CONFIG.TESTING_MODE) {
        console.log(`🧪 TEST MODE: Max ${CONFIG.TEST_MODE_LIMIT} businesses`);
      }
      console.log('');

      // Fetch campaign details
      const campaign = await this.getCampaign();
      if (!campaign) {
        throw new Error(`Campaign not found: ${this.campaignId}`);
      }

      console.log(`📢 Campaign: ${campaign.name}`);
      console.log(`📝 Template: ${campaign.message_template?.substring(0, 50)}...`);
      console.log('');

      // Get target businesses from REAL Supabase businesses table
      const businesses = await this.getTargetBusinesses(campaign, filters);
      
      if (businesses.length === 0) {
        console.log('✅ No new businesses to message. All already contacted or no valid phones.');
        this.state.complete();
        return;
      }

      console.log(`\n🎯 QUEUED: ${businesses.length} businesses ready for messaging`);
      console.log('');

      // Process each business
      for (let i = 0; i < businesses.length; i++) {
        // Check if paused
        if (this.state.isPaused()) {
          console.log('⏸️ Campaign is paused. Exiting...');
          return;
        }

        const business = businesses[i];
        const overallIndex = this.state.state.processedCount + i;

        // Show progress every 10 messages
        if (i % 10 === 0 || i === businesses.length - 1) {
          this.state.printProgress(businesses.length + this.state.state.processedCount);
        }

        // Process this business
        await this.processBusiness(business, campaign);

        // Rate limiting delay (skip after last message)
        if (i < businesses.length - 1) {
          await this.delay(CONFIG.MESSAGE_DELAY_MS);
        }
      }

      // Update final campaign stats
      await this.updateCampaignStats();
      this.state.complete();

    } catch (error) {
      this.state.fail(error);
      process.exit(1);
    }
  }

  async getCampaign() {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', this.campaignId)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }

    return data;
  }

  async getTargetBusinesses(campaign, filters = {}) {
    console.log('🔍 Fetching businesses from Supabase...');
    console.log(`   Filters: ${JSON.stringify({
      governorate: filters.governorate || 'any',
      category: filters.category || 'any',
      city: filters.city || 'any',
      has_phone: true
    })}`);

    // Build query for businesses - ONLY from real Supabase businesses table
    let query = this.supabase
      .from('businesses')
      .select('id, name, phone, governorate, city, category')
      .not('phone', 'is', null)
      .neq('phone', '');

    // Apply filters from campaign or CLI args
    if (filters.governorate) {
      query = query.eq('governorate', filters.governorate);
      console.log(`   📍 Filter: governorate = ${filters.governorate}`);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
      console.log(`   🏷️ Filter: category = ${filters.category}`);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
      console.log(`   🏙️ Filter: city = ${filters.city}`);
    }

    // Exclude businesses already in conversations (deduplication)
    const { data: existingConversations } = await this.supabase
      .from('conversations')
      .select('business_id')
      .not('business_id', 'is', null);

    const contactedBusinessIds = new Set(
      (existingConversations || []).map(c => c.business_id)
    );

    console.log(`   📋 Excluding ${contactedBusinessIds.size} already-contacted businesses`);

    // Resume from last processed if state exists
    if (this.state.state.lastProcessedId) {
      console.log(`📍 Resuming after business: ${this.state.state.lastProcessedId}`);
    }

    const { data: businesses, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch businesses: ${error.message}`);
    }

    console.log(`   📊 Raw businesses from Supabase: ${businesses?.length || 0}`);

    // Filter out already contacted and invalid phones
    let validBusinesses = (businesses || [])
      .filter(b => {
        // Skip if already in conversations
        if (contactedBusinessIds.has(b.id)) {
          return false;
        }

        // Validate phone number (basic Iraq format check)
        const phone = b.phone?.replace(/\s/g, '');
        if (!phone || phone.length < 10) {
          return false;
        }

        // Must start with +964 or 964 or 07
        const validPrefix = /^(\+?964|07)/.test(phone);
        if (!validPrefix) {
          return false;
        }

        return true;
      })
      // Resume from last processed
      .filter((b) => {
        if (!this.state.state.lastProcessedId) return true;
        return b.id > this.state.state.lastProcessedId; // Assuming ID is sortable
      });

    // Apply testing mode limit (20 businesses max)
    if (CONFIG.TESTING_MODE) {
      const beforeLimit = validBusinesses.length;
      validBusinesses = validBusinesses.slice(0, CONFIG.TEST_MODE_LIMIT);
      console.log(`\n🧪 TESTING MODE: Limited to ${CONFIG.TEST_MODE_LIMIT} businesses (from ${beforeLimit})`);
    }

    // Log summary
    console.log(`\n✅ Businesses selected: ${validBusinesses.length}`);
    console.log(`   📞 With valid phones: ${validBusinesses.length}`);
    console.log(`   📍 Governorates: ${[...new Set(validBusinesses.map(b => b.governorate))].join(', ')}`);
    console.log(`   🏷️ Categories: ${[...new Set(validBusinesses.map(b => b.category))].join(', ')}`);
    
    return validBusinesses;
  }

  async processBusiness(business, campaign) {
    const phone = business.phone.replace(/\s/g, '');
    
    try {
      console.log(`📤 [${business.name?.substring(0, 30) || 'Unknown'}] ${phone}`);

      // 1. Insert message record (pending)
      const { data: message, error: insertError } = await this.supabase
        .from('messages')
        .insert({
          campaign_id: this.campaignId,
          business_id: business.id,
          phone: phone,
          message_body: campaign.message_template || 'Hello!',
          status: 'pending',
          channel: campaign.channel || 'whatsapp',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create message record: ${insertError.message}`);
      }

      // 2. Send via WhatsApp API (with retries)
      let attempt = 0;
      let lastError = null;

      while (attempt <= CONFIG.MAX_RETRIES) {
        try {
          const result = await this.whatsapp.sendMessage(
            phone, 
            campaign.message_template || 'Hello!'
          );

          // 3. Update message status to sent
          const { error: updateError } = await this.supabase
            .from('messages')
            .update({
              status: 'sent',
              external_message_id: result.externalMessageId,
              sent_at: new Date().toISOString(),
            })
            .eq('id', message.id);

          if (updateError) {
            console.warn('⚠️ Failed to update message status:', updateError.message);
          }

          // 4. Create conversation record
          await this.supabase
            .from('conversations')
            .upsert({
              business_id: business.id,
              phone: phone,
              last_outbound_message_id: message.id,
              last_message: campaign.message_template,
              last_message_at: new Date().toISOString(),
              message_count: 1,
              replied: false,
              converted: false,
            }, { onConflict: 'business_id,phone' });

          this.state.update({ 
            sentCount: this.state.state.sentCount + 1,
            lastProcessedId: business.id,
          });

          console.log(`  ✅ Sent (ID: ${result.externalMessageId?.substring(0, 20)}...)`);
          return; // Success, exit retry loop

        } catch (error) {
          lastError = error;
          attempt++;
          
          if (attempt <= CONFIG.MAX_RETRIES) {
            console.log(`  ⚠️ Retry ${attempt}/${CONFIG.MAX_RETRIES} after error: ${error.message}`);
            this.state.update({ retryCount: this.state.state.retryCount + 1 });
            await this.delay(CONFIG.RETRY_DELAY_MS);
          }
        }
      }

      // All retries failed
      throw lastError;

    } catch (error) {
      // Update message status to failed
      await this.supabase
        .from('messages')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('business_id', business.id)
        .eq('campaign_id', this.campaignId)
        .order('created_at', { ascending: false })
        .limit(1);

      this.state.update({ 
        failedCount: this.state.state.failedCount + 1,
        errors: [...this.state.state.errors, `${business.id}: ${error.message}`].slice(-10),
        lastProcessedId: business.id,
      });

      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  async updateCampaignStats() {
    try {
      await this.supabase.rpc('update_campaign_stats', { 
        p_campaign_id: this.campaignId 
      });
      console.log('📊 Campaign stats updated');
    } catch (error) {
      console.warn('⚠️ Failed to update campaign stats:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==================== CLI ENTRY POINT ====================

async function main() {
  const campaignId = process.argv[2];
  
  // Parse optional filter args
  const args = process.argv.slice(3);
  const filters = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--governorate' && args[i + 1]) {
      filters.governorate = args[i + 1];
      i++;
    } else if (arg === '--category' && args[i + 1]) {
      filters.category = args[i + 1];
      i++;
    } else if (arg === '--city' && args[i + 1]) {
      filters.city = args[i + 1];
      i++;
    }
  }

  if (!campaignId) {
    console.error('❌ Usage: node bulk-sender.js <campaign_id> [options]');
    console.error('   Or: npm run bulk-send -- <campaign_id> [options]');
    console.error('');
    console.error('Options:');
    console.error('   --governorate <name>   Filter by governorate (e.g., Baghdad)');
    console.error('   --category <name>     Filter by category (e.g., Restaurant)');
    console.error('   --city <name>         Filter by city (e.g., Mansour)');
    console.error('');
    console.error('Environment Variables:');
    console.error('   BULK_SEND_TEST_MODE=true   Limit to 20 businesses (testing)');
    console.error('   BULK_SEND_DELAY_MS=3000    Delay between messages (ms)');
    process.exit(1);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(campaignId)) {
    console.error('❌ Invalid campaign ID format. Expected UUID.');
    process.exit(1);
  }

  const sender = new BulkMessageSender(campaignId);
  await sender.run(filters);
}

main();
