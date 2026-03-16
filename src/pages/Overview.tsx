import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Bot,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { businessService } from '../services/dashboardService';

const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    rawCount: 0,
    verifiedCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    taskCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await businessService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Raw Businesses', value: stats.rawCount, icon: <Database size={24} />, color: 'bg-blue-500' },
    { label: 'Total Verified', value: stats.verifiedCount, icon: <CheckCircle2 size={24} />, color: 'bg-emerald-500' },
    { label: 'Pending Review', value: stats.pendingCount, icon: <Clock size={24} />, color: 'bg-amber-500' },
    { label: 'Approved & Ready', value: stats.approvedCount, icon: <TrendingUp size={24} />, color: 'bg-[#C9A84C]' },
    { label: 'Duplicates Detected', value: 0, icon: <Copy size={24} />, color: 'bg-rose-500' },
    { label: 'Agent Tasks', value: stats.taskCount, icon: <Bot size={24} />, color: 'bg-[#1B2B5E]' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black text-[#1B2B5E] tracking-tight">DASHBOARD OVERVIEW</h2>
        <p className="text-gray-500 font-medium">Real-time verification metrics for Iraq Compass</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-[#1B2B5E]">
                {loading ? '...' : card.value.toLocaleString()}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#1B2B5E] flex items-center gap-2">
              <Activity size={20} className="text-[#C9A84C]" />
              Recent Agent Activity
            </h3>
            <button className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1B2B5E]/5 flex items-center justify-center text-[#1B2B5E]">
                  <Bot size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Cleaner-0{i} normalized 150 records</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">2 minutes ago • Sulaymaniyah Dataset</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">Success</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-[#1B2B5E] mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-rose-500" />
            Critical Flags
          </h3>
          <div className="flex flex-col items-center justify-center h-48 text-center opacity-20">
            <CheckCircle2 size={48} className="mb-2" />
            <p className="text-sm font-bold uppercase tracking-widest">No critical issues detected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
