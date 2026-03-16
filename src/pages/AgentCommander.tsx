import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, Trash2, FileText, History, CheckCircle, 
  AlertCircle, Loader2, Upload, X, ChevronRight, 
  MessageSquare, Settings, Activity, Globe, Phone,
  MapPin, Search, Plus, Play, Filter, MoreVertical,
  Eye, Edit2, LayoutDashboard, Database, LogOut, Menu, Clock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface Agent {
  id: number;
  name: string;
  role: string;
  icon: React.ReactNode;
  specialization: string;
}

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface UploadedFile {
  name: string;
  content: string;
  size: number;
}

interface TaskTemplate {
  id: number;
  label: string;
  prompt: string;
}

// --- Constants ---
const AGENTS: Agent[] = [
  { id: 1, name: "Orchestrator", role: "Queue Manager & Overseer", icon: <LayoutDashboard size={14} />, specialization: "Manages task assignment and queue health." },
  { id: 2, name: "Finder Agent", role: "Business Lead Discovery", icon: <Search size={14} />, specialization: "Discovers business leads using Maps and Social Media." },
  { id: 3, name: "Verifier Agent", role: "Data Validation & Scoring", icon: <CheckCircle size={14} />, specialization: "Validates data and assigns verification scores." },
  { id: 4, name: "Postcard Designer", role: "Visual Card Creator", icon: <Globe size={14} />, specialization: "Creates rich visual business postcards." },
  { id: 5, name: "Data Cleaner", role: "Normalize & Deduplicate", icon: <Database size={14} />, specialization: "Normalizes and deduplicates business datasets." },
  { id: 6, name: "Translator", role: "AR / EN / KU Translation", icon: <Globe size={14} />, specialization: "Translates content between Arabic, English, and Kurdish." },
  { id: 7, name: "Phone Normalizer", role: "Iraqi Phone Format Fixer", icon: <Phone size={14} />, specialization: "Fixes Iraqi phone numbers to standard format." },
  { id: 8, name: "Category Classifier", role: "Business Categorization", icon: <Filter size={14} />, specialization: "Classifies businesses into allowed categories." },
  { id: 9, name: "Address Resolver", role: "Geocoding & Maps", icon: <MapPin size={14} />, specialization: "Resolves and normalizes Iraqi addresses." },
  { id: 10, name: "Social Scraper", role: "Instagram & Facebook", icon: <Activity size={14} />, specialization: "Analyzes business social presence." },
  { id: 11, name: "Review Aggregator", role: "Ratings & Feedback", icon: <MessageSquare size={14} />, specialization: "Aggregates and analyzes customer reviews." },
  { id: 12, name: "Image Hunter", role: "Logo & Photo Discovery", icon: <Eye size={14} />, specialization: "Finds business logos and cover photos." },
  { id: 13, name: "Hours Extractor", role: "Opening Times Parser", icon: <Clock size={14} />, specialization: "Parses business operating hours." },
  { id: 14, name: "Duplicate Detector", role: "Cross-Source Matching", icon: <Plus size={14} />, specialization: "Detects duplicate entries across sources." },
  { id: 15, name: "Score Calculator", role: "Verification Scoring", icon: <Activity size={14} />, specialization: "Calculates weighted verification scores." },
  { id: 16, name: "Export Agent", role: "Data Export & Formats", icon: <FileText size={14} />, specialization: "Formats data for export (JSON/CSV)." },
  { id: 17, name: "QA Inspector", role: "Quality Assurance", icon: <CheckCircle size={14} />, specialization: "Performs final quality assurance checks." },
  { id: 18, name: "Iraq Compass AI", role: "General Assistant", icon: <Bot size={14} />, specialization: "General assistant for platform strategy and tech." },
];

const AGENT_SYSTEM_PROMPTS: Record<number, string> = {
  1: "You are the Orchestrator and QC Overseer for Iraq Compass. You manage a queue of 17 specialist AI agents. Handle task assignment, monitor queue health (Pending→Processing→Completed), detect stalled agents, ensure data quality. Categories: restaurants, cafes, bakeries, hotels, gyms, beauty_salons, pharmacies, supermarkets. Be professional and concise.",
  2: "You are the Finder Agent for Iraq Compass. Discover real business leads across Iraq using Google Maps, Instagram, Facebook. Output: {raw_name, found_on, source_url, confidence:'high|medium|low', raw_phone, raw_address, social_links, notes}. Never fabricate. HIGH confidence = found on 2+ sources.",
  3: "You are the Verifier Agent for Iraq Compass. Check: Iraqi phone format (Zain:0750/0751, Korek:0770/0771, AsiaCell:0770/0772/0773), name consistency, address on maps, website resolving, social activity <6 months. Score: +20 Google Maps +20 active social +15 phone +15 website +15 address. Output: {verified, score:0-100, recommendation:'publish|hold|reject', failed_fields:[]}",
  4: "You are the Postcard Designer for Iraq Compass. Create rich business cards: logo_url, cover_image_url, headline(EN/AR/KU max 6 words), tagline, description(2-3 factual sentences), highlights [3], badge(verified/unverified/new/popular), call_to_action. Warm local Iraqi tone. ONLY facts.",
  5: "You are the Data Cleaner for Iraq Compass. Normalize raw Iraqi business data: deduplicate (name similarity, phone, address), normalize names (no emojis, fix caps, remove marketing phrases), standardize phones to +964 format, enforce allowed categories: restaurants, cafes, bakeries, hotels, gyms, beauty_salons, pharmacies, supermarkets.",
  6: "You are the Arabic/Kurdish Translator for Iraq Compass. Translate between English, Iraqi Arabic, and Sorani Kurdish. Use established local names when they exist. Maintain factual accuracy and cultural context.",
  7: "You are the Phone Normalizer for Iraq Compass. Convert phones to Iraqi format. Operators: Zain 0750/0751, Korek 0770/0771, AsiaCell 0770/0772/0773. Output: {original, normalized, operator, valid:true/false}. Flag suspicious numbers.",
  8: "You are the Category Classifier for Iraq Compass. Assign each business to exactly one: restaurants, cafes, bakeries, hotels, gyms, beauty_salons, pharmacies, supermarkets. Understand Iraqi naming patterns. Flag unclear cases.",
  9: "You are the Address Resolver for Iraq Compass. Parse and normalize Iraqi addresses: neighborhood, district, city, governorate, Iraq. Know all 18 Iraqi governorates. Infer location from context when needed.",
  10: "You are the Social Scraper for Iraq Compass. Analyze business social presence on Instagram and Facebook: account existence, follower count, last post date (active = <6 months), extract phone/address/hours from bio. Flag inactive accounts.",
  11: "You are the Review Aggregator for Iraq Compass. Analyze customer reviews from Google Maps, TripAdvisor, Facebook. Output: avg rating, review count, sentiment summary, most mentioned features.",
  12: "You are the Image Hunter for Iraq Compass. Find business images: logo (from Facebook/Instagram/website), cover photo. Provide direct URLs only. Set null if not found. Never use placeholders.",
  13: "You are the Hours Extractor for Iraq Compass. Parse operating hours from various formats. Handle Iraqi business patterns: Friday closures, Ramadan schedules. Note unconfirmed hours.",
  14: "You are the Duplicate Detector for Iraq Compass. Find duplicates: name similarity >80%, exact phone match, address proximity <50m. Output: {duplicate_pair:[id1,id2], similarity_score, match_fields, recommendation:'merge|review|keep_both'}",
  15: "You are the Score Calculator for Iraq Compass. Calculate verification scores based on: data completeness, source reliability, cross-source consistency, freshness, engagement. Output weighted scores per category and overall 0-100.",
  16: "You are the Export Agent for Iraq Compass. Format data for: clean JSON (Supabase insertion), CSV (spreadsheets), formatted tables. Ensure all required fields present before export.",
  17: "You are the QA Inspector for Iraq Compass. Final quality check before publishing. Verify: all required fields present, no placeholders, valid URLs, phone format valid, category from allowed list, trilingual complete, score >= 60. Output pass/fail per record with specific issues.",
  18: "You are Iraq Compass AI, general assistant for the Iraq Compass platform. Help with: platform strategy, data architecture, agent coordination, Supabase schema, React/Vite/TypeScript/Tailwind, Iraqi market insights, multilingual content (EN/AR/KU). Design tokens: Navy #1B2B5E, Gold #C9A84C, Cream #F5F0E8. 18 AI agents.",
};

const TASK_TEMPLATES: TaskTemplate[] = [
  { id: 1, label: "Find businesses in Sulaymaniyah", prompt: "Find 10 verified businesses in Sulaymaniyah, Iraq. Focus on restaurants, cafes, and hotels. For each provide: name (EN/AR/KU), phone, address, category, source URL. Output as structured JSON array." },
  { id: 2, label: "Clean uploaded dataset", prompt: "Clean and normalize the uploaded dataset. Remove duplicates, standardize phones to Iraqi format (07XX-XXXXXXX), normalize business names (no emojis, fix capitalization), output clean JSON array with all corrections noted." },
  { id: 3, label: "Verify business list", prompt: "Verify each business. Check phone format (Zain: 0750/0751, Korek:0770/0771, AsiaCell:0770/0772/0773), confirm category, verify social activity. Assign score 0-100. Output: [{name, score, status:'publish|hold|reject', issues:[]}]" },
  { id: 4, label: "Create postcards (EN/AR/KU)", prompt: "For each business create postcard JSON: headline(EN/AR/KU max 6 words), tagline, description (2-3 sentences), 3 highlights, badge, call-to-action. Warm local Iraqi tone, factual only." },
  { id: 5, label: "Translate to Arabic & Kurdish", prompt: "Translate all business names, descriptions, categories, taglines to Iraqi Arabic and Sorani Kurdish. Output trilingual JSON with keys: en, ar, ku per text field." },
  { id: 6, label: "Generate directory report", prompt: "Analyze uploaded data: total count, by category, by city, verification rate, average score, top 3 per category, data quality issues found." },
  { id: 7, label: "Fix all phone numbers", prompt: "Normalize all phones to Iraqi format. Zain:0750/0751, Korek:0770/0771, AsiaCell:0770/0772/0773. Output: [{original_phone, normalized, operator, valid, issue}]" },
  { id: 8, label: "Detect duplicates", prompt: "Find duplicate entries. Check: name similarity >80%, matching phones, similar addresses. Output: [{duplicate_pair:[id1,id2], similarity_score, match_fields, recommendation:'merge|review|keep_both'}]" },
  { id: 9, label: "Assign categories", prompt: "Assign correct category from: restaurants, cafes, bakeries, hotels, gyms, beauty_salons, pharmacies, supermarkets. Flag unclear cases. Output updated JSON." },
  { id: 10, label: "Final QA check", prompt: "Quality check before publishing. Verify: all fields present, no placeholders, valid URLs, phone format correct, trilingual complete, score >= 60. Pass/fail per record with specific issues." },
];

const COLORS = {
  navy: '#1B2B5E',
  gold: '#C9A84C',
  cream: '#F5F0E8',
  white: '#FFFFFF',
  border: 'rgba(27, 43, 94, 0.1)',
};

export default function AgentCommander() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'files' | 'history'>('task');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistories, selectedAgent.id, isLoading]);

  const currentHistory = chatHistories[selectedAgent.id] || [];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let fullPrompt = text;
    if (uploadedFiles.length > 0) {
      fullPrompt += "\n\n";
      uploadedFiles.forEach(file => {
        fullPrompt += `--- Attached: ${file.name} (${file.size} bytes) ---\n${file.content.substring(0, 3000)}\n\n`;
      });
    }

    const userMessage: Message = { role: 'user', parts: [{ text: fullPrompt }] };
    const newHistory = [...currentHistory, userMessage];
    
    setChatHistories(prev => ({
      ...prev,
      [selectedAgent.id]: newHistory
    }));
    setInputText('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config: { systemInstruction: AGENT_SYSTEM_PROMPTS[selectedAgent.id] },
        contents: newHistory
      });

      const modelText = result.text || '';

      const modelMessage: Message = { role: 'model', parts: [{ text: modelText }] };
      setChatHistories(prev => ({
        ...prev,
        [selectedAgent.id]: [...newHistory, modelMessage]
      }));
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = { 
        role: 'model', 
        parts: [{ text: `⚠️ Error: Failed to communicate with ${selectedAgent.name}. Please check your API key and network connection.` }] 
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedAgent.id]: [...newHistory, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = Number(e.target.value);
    setSelectedTemplate(templateId);
    const template = TASK_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomPrompt(template.prompt);
    }
  };

  const handleAssignTask = () => {
    if (!customPrompt.trim()) return;
    handleSendMessage(customPrompt);
    setCustomPrompt('');
    setSelectedTemplate('');
    // On mobile, we might want to switch view, but for now we stay.
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const content = event.target?.result as string;
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          content: content,
          size: file.size
        }]);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearChat = () => {
    setChatHistories(prev => ({
      ...prev,
      [selectedAgent.id]: []
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-gray-900 overflow-hidden">
      {/* Top Nav (Placeholder for consistency) */}
      <div className="h-14 border-b border-gray-200 flex items-center px-6 justify-between bg-white z-20">
        <div className="flex items-center gap-3">
          <Bot className="text-[#1B2B5E]" size={24} />
          <h1 className="font-bold text-lg tracking-tight text-[#1B2B5E]">AGENT COMMANDER</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Network Online
          </div>
          <Link to="/admin" className="text-xs font-bold text-[#C9A84C] hover:underline">Back to Admin</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* LEFT COLUMN — Agent Sidebar */}
        <aside className="w-full md:w-[200px] bg-[#1B2B5E] flex flex-row md:flex-col flex-shrink-0 overflow-x-auto md:overflow-y-auto custom-scrollbar">
          <div className="hidden md:block p-4 border-b border-white/10">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9A84C] opacity-60">18 AGENTS</span>
          </div>
          <div className="flex flex-row md:flex-col flex-1">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`flex-shrink-0 md:w-full text-left p-3 flex flex-col gap-0.5 transition-all relative group ${
                  selectedAgent.id === agent.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                {selectedAgent.id === agent.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A84C] hidden md:block" />
                )}
                {selectedAgent.id === agent.id && (
                  <div className="absolute left-0 right-0 bottom-0 h-1 bg-[#C9A84C] md:hidden" />
                )}
                <span className="text-[9px] font-bold text-[#C9A84C] opacity-50">AGENT {agent.id.toString().padStart(2, '0')}</span>
                <span className="text-[12px] font-medium text-white truncate max-w-[100px] md:max-w-none">{agent.name}</span>
                <span className="hidden md:block text-[10px] text-white/40 truncate">{agent.role}</span>
              </button>
            ))}
          </div>
          <div className="hidden md:block p-3 bg-black/20 border-t border-white/10">
            <div className="flex items-center gap-2 text-[10px] text-white/60">
              <Activity size={12} className="text-[#C9A84C]" />
              <span className="truncate">Active: {selectedAgent.name}</span>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN — Live Chat Window */}
        <main className="flex-1 flex flex-col bg-white border-r border-gray-200 relative overflow-hidden">
          {/* Chat Header */}
          <div className="h-14 border-b border-gray-200 flex items-center px-6 justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1B2B5E] flex items-center justify-center text-[#C9A84C]">
                {selectedAgent.icon}
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#1B2B5E]">{selectedAgent.name}</h2>
                <p className="text-[10px] text-gray-400">{selectedAgent.role}</p>
              </div>
            </div>
            <button 
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-gray">
            {currentHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Bot size={48} className="text-[#1B2B5E]" />
                <p className="text-sm font-medium">Select an agent and assign a task</p>
              </div>
            ) : (
              currentHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1B2B5E] text-[#F5F0E8] rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 border border-gray-200 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto relative">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                placeholder={`Message ${selectedAgent.name}...`}
                className="w-full glass border border-gray-200 rounded-2xl pl-4 pr-14 py-3 text-sm focus:outline-none focus:border-[#C9A84C] transition-all resize-none"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={isLoading || !inputText.trim()}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                  isLoading || !inputText.trim() 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-[#1B2B5E] text-[#C9A84C] hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-gray-400">
              <span>Press Enter to send</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Shift+Enter for new line</span>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN — Control Panel */}
        <aside className="hidden lg:flex w-[260px] bg-white flex-col flex-shrink-0 border-l border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(['task', 'files', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-[#1B2B5E]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B2B5E]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar-gray">
            <AnimatePresence mode="wait">
              {activeTab === 'task' && (
                <motion.div
                  key="task-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Agent {selectedAgent.id} Ready
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Task Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={handleTemplateChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#C9A84C]"
                    >
                      <option value="">Select a template...</option>
                      {TASK_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Custom Prompt</label>
                    <textarea
                      rows={6}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe the task..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#C9A84C] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAssignTask}
                    disabled={isLoading || !customPrompt.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                      isLoading || !customPrompt.trim()
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-[#C9A84C] text-[#1B2B5E] hover:shadow-lg active:scale-95'
                    }`}
                  >
                    Assign Task to Agent
                  </button>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-[#1B2B5E] uppercase tracking-widest mb-2">Specialization</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed italic">
                      "{selectedAgent.specialization}"
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'files' && (
                <motion.div
                  key="files-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Upload Documents</h3>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#C9A84C] hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#C9A84C] transition-all">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-gray-600">Click to browse</p>
                      <p className="text-[9px] text-gray-400">JSON, CSV, TXT</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      multiple 
                      accept=".json,.csv,.txt" 
                      className="hidden" 
                    />
                  </div>

                  <div className="space-y-3">
                    {uploadedFiles.length === 0 ? (
                      <div className="text-center py-8 opacity-30">
                        <FileText size={32} className="mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No files uploaded yet</p>
                      </div>
                    ) : (
                      uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={16} className="text-[#1B2B5E] flex-shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-[11px] font-bold text-gray-700 truncate">{file.name}</p>
                              <p className="text-[9px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFile(idx)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex gap-2">
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 leading-relaxed">
                        Uploaded files are automatically appended to your next message so the agent can work on your data.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Conversations</h3>
                  
                  {Object.keys(chatHistories).filter(id => chatHistories[Number(id)].length > 0).length === 0 ? (
                    <div className="text-center py-12 opacity-30">
                      <History size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No active conversations yet</p>
                    </div>
                  ) : (
                    Object.keys(chatHistories).map(id => {
                      const agent = AGENTS.find(a => a.id === Number(id));
                      if (!agent || chatHistories[Number(id)].length === 0) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedAgent(agent)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            selectedAgent.id === agent.id 
                              ? 'bg-[#1B2B5E]/5 border-[#1B2B5E]/20' 
                              : 'bg-white border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1B2B5E] flex items-center justify-center text-[#C9A84C]">
                              {agent.icon}
                            </div>
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-gray-700">{agent.name}</p>
                              <p className="text-[9px] text-gray-400">{chatHistories[Number(id)].length} messages</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-300" />
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* Mobile Control Panel Drawer Toggle */}
      <button 
        onClick={() => setActiveTab(activeTab === 'task' ? 'task' : activeTab)} // Just to trigger re-render or state if needed
        className="lg:hidden fixed bottom-20 right-6 w-12 h-12 bg-[#1B2B5E] text-[#C9A84C] rounded-full shadow-2xl flex items-center justify-center z-30"
        style={{ display: activeTab ? 'flex' : 'none' }} // Always show if we want to access panel
      >
        <Settings size={24} />
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C9A84C;
          border-radius: 10px;
          opacity: 0.5;
        }
        
        .custom-scrollbar-gray::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar-gray::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-gray::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}

function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={to} className={className} onClick={(e) => {
      e.preventDefault();
      window.history.pushState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }}>
      {children}
    </a>
  );
}
