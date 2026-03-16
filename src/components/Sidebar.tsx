import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Wand2, 
  Bot, 
  Download, 
  LogOut,
  Compass
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Overview', labelAr: 'نظرة عامة' },
    { to: '/review', icon: <CheckSquare size={20} />, label: 'Business Review', labelAr: 'مراجعة الأعمال' },
    { to: '/cleaner', icon: <Wand2 size={20} />, label: 'Data Cleaner', labelAr: 'منظف البيانات' },
    { to: '/tasks', icon: <Bot size={20} />, label: 'Agent Tasks', labelAr: 'مهام الوكيل' },
    { to: '/export', icon: <Download size={20} />, label: 'Export Data', labelAr: 'تصدير البيانات' },
  ];

  return (
    <aside className="w-64 bg-[#1B2B5E] text-white flex flex-col h-screen sticky top-0 border-r border-white/10">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Compass className="text-[#C9A84C]" size={32} />
        <div>
          <h1 className="font-bold text-lg tracking-tight">IRAQ COMPASS</h1>
          <p className="text-[10px] text-[#C9A84C] font-bold uppercase tracking-widest">Internal Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center justify-between p-3 rounded-xl transition-all group
              ${isActive ? 'bg-[#C9A84C] text-[#1B2B5E] font-bold shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity" dir="rtl">
              {item.labelAr}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 w-full p-3 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
