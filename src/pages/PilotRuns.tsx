import React from 'react';
import { 
  Zap, Play, Clock, CheckCircle2, 
  AlertCircle, History, Search, Filter,
  MoreVertical, ChevronLeft, ChevronRight,
  Database, Activity, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function PilotRuns() {
  const runs = [
    { id: '1', name: 'Sulaymaniyah Social Enrichment', date: '2026-03-23', status: 'Completed', records: 5000, success: 98, agent: 'SUL_AGENT' },
    { id: '2', name: 'Baghdad Text Repair', date: '2026-03-22', status: 'Completed', records: 16200, success: 95, agent: 'BGW_AGENT' },
    { id: '3', name: 'Basra Data Enrichment', date: '2026-03-21', status: 'Failed', records: 7000, success: 40, agent: 'BSR_AGENT' },
    { id: '4', name: 'Erbil QC Check', date: '2026-03-20', status: 'Completed', records: 3300, success: 100, agent: 'ERB_AGENT' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-emerald-500/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <History className="text-emerald-400" size={28} />
            Pilot Run History
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Historical Execution Log & Performance Audit</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search runs..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Execution Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Agent ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Records</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Success</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {runs.map((run, i) => (
                <motion.tr 
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-emerald-500/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${run.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <Zap size={14} />
                      </div>
                      <span className="text-xs font-black text-slate-100 uppercase tracking-wide">{run.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest">{run.agent}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{run.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      run.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Database size={12} />
                      <span className="text-xs font-bold">{run.records.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${run.success >= 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{ width: `${run.success}%` }} 
                        />
                      </div>
                      <span className={`text-[10px] font-black ${run.success >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>{run.success}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-600 hover:text-emerald-400 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Showing 4 of 4 historical runs
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1.5 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
