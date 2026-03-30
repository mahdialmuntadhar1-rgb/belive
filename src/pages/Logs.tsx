import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Terminal, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

const LOGS = [
  { id: 1, time: '17:05:22', agent: 'QC Manager', action: 'Record Verified', details: 'Cafe Baghdad (ID: 4231) passed all checks', type: 'success' },
  { id: 2, time: '17:04:15', agent: 'Duplicate Detector', action: 'Duplicate Found', details: 'Potential match for "Al-Mansour Hotel" in Baghdad', type: 'warning' },
  { id: 3, time: '17:02:48', agent: 'Google Maps Scraper', action: 'API Call', details: 'GET /places/nearby?location=33.31,44.36', type: 'info' },
  { id: 4, time: '17:00:10', agent: 'Language Repair', action: 'Encoding Fix', details: 'Repaired mojibake in 42 records from Basra dataset', type: 'success' },
  { id: 5, time: '16:58:33', agent: 'Erbil Agent', action: 'System Error', details: 'Connection timeout while fetching Erbil Mall data', type: 'error' },
  { id: 6, time: '16:55:12', agent: 'Phone Extractor', action: 'Pattern Match', details: 'Extracted 12 new phone numbers from Facebook links', type: 'success' },
  { id: 7, time: '16:52:05', agent: 'System', action: 'Task Started', details: 'Batch verification for Sulaymaniyah dataset started', type: 'info' },
];

const Logs: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#1B2B5E] tracking-tight">SYSTEM LOGS</h2>
          <p className="text-gray-500 font-medium">Comprehensive audit trail of all agent operations</p>
        </div>
        <button className="bg-[#1B2B5E] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
          <Download size={18} />
          Export Logs
        </button>
      </header>

      {/* Log Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search logs by agent, action, or details..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:outline-none">
            <option>All Agents</option>
            <option>QC Manager</option>
            <option>Duplicate Detector</option>
            <option>Google Maps Scraper</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:outline-none">
            <option>All Levels</option>
            <option>Success</option>
            <option>Warning</option>
            <option>Error</option>
            <option>Info</option>
          </select>
        </div>
      </div>

      {/* Terminal-style Log View */}
      <div className="bg-[#151619] rounded-[32px] shadow-2xl overflow-hidden border border-white/5">
        <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Terminal size={12} />
              Live System Output
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
        </div>

        <div className="p-6 font-mono text-xs space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {LOGS.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 group"
            >
              <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
              <span className={`font-bold whitespace-nowrap min-w-[120px] ${
                log.agent === 'System' ? 'text-purple-400' : 'text-[#C9A84C]'
              }`}>
                {log.agent}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                log.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                'bg-blue-500/10 text-blue-400'
              }`}>
                {log.action}
              </span>
              <span className="text-white/60 group-hover:text-white transition-colors">
                {log.details}
              </span>
            </motion.div>
          ))}
          <div className="flex items-center gap-2 text-white/20 pt-4">
            <Clock size={12} />
            <span>Waiting for new events...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
