import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Info,
  Wand2
} from 'lucide-react';
import { motion } from 'motion/react';

const QC_RECORDS = [
  { id: 1, name: 'Cafe Baghdad', issue: 'Missing Phone', confidence: 65, city: 'Baghdad', category: 'Cafe' },
  { id: 2, name: 'Erbil Tech Store', issue: 'Invalid Coordinates', confidence: 42, city: 'Erbil', category: 'Retail' },
  { id: 3, name: 'Basra Logistics', issue: 'Duplicate Detected', confidence: 78, city: 'Basra', category: 'Services' },
  { id: 4, name: 'Sulaymaniyah Hotel', issue: 'Language Corruption', confidence: 55, city: 'Sulaymaniyah', category: 'Travel' },
  { id: 5, name: 'Najaf Pharmacy', issue: 'Category Mismatch', confidence: 61, city: 'Najaf', category: 'Healthcare' },
];

const QC: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#1B2B5E] tracking-tight">QUALITY CONTROL</h2>
          <p className="text-gray-500 font-medium">Automated flags requiring human intervention</p>
        </div>
        <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={14} />
          124 Records Flagged
        </div>
      </header>

      {/* QC Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Missing Fields', count: 423, color: 'text-amber-600' },
          { label: 'Duplicates', count: 124, color: 'text-rose-600' },
          { label: 'Low Confidence', count: 854, color: 'text-blue-600' },
          { label: 'Invalid Data', count: 67, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* QC Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search flagged records..."
                className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C9A84C] w-64"
              />
            </div>
            <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 focus:outline-none">
              <option>All Issues</option>
              <option>Missing Phone</option>
              <option>Duplicates</option>
              <option>Invalid Location</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Record Name</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {QC_RECORDS.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1B2B5E]">{record.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{record.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-rose-500" />
                      <span className="text-xs font-bold text-rose-700">{record.issue}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${record.confidence > 70 ? 'bg-emerald-500' : record.confidence > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${record.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-500">{record.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase">{record.city}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Fix Automatically">
                        <Wand2 size={16} />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Manual Edit">
                        <Info size={16} />
                      </button>
                      <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Discard">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Rules Config */}
      <div className="bg-[#1B2B5E] p-8 rounded-[32px] text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black uppercase tracking-tight">QC Agent Ruleset</h3>
          <button className="text-xs font-black text-[#C9A84C] uppercase tracking-widest hover:underline">Edit Rules</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { rule: 'Phone Validation', desc: 'Must match Iraqi mobile/landline patterns', status: 'Active' },
            { rule: 'Coordinate Check', desc: 'Must fall within Iraqi borders', status: 'Active' },
            { rule: 'Duplicate Threshold', desc: 'Flag if name + city similarity > 85%', status: 'Active' },
          ].map((rule, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-[#C9A84C]">{rule.rule}</p>
                <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">{rule.status}</span>
              </div>
              <p className="text-[10px] text-white/60">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QC;
