import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, PlusCircle, LogOut, Settings, ChevronDown, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

interface HomeHeaderProps {
  onAddBusiness: () => void;
  onAuth: (mode: 'login' | 'signup') => void;
}

export default function HomeHeader({ onAddBusiness, onAuth }: HomeHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage } = useHomeStore();
  const { buildModeEnabled, toggleBuildMode } = useBuildMode();

  const isRTL = language === 'ar' || language === 'ku';
  const hasBuildModeAccess = canAccessBuildMode();

  const translations = {
    addBusiness: { en: 'Add Business', ar: 'أضف عملك', ku: 'کارەکەت زیاد بکە' },
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم', ku: 'داشبۆرد' },
    settings: { en: 'Settings', ar: 'الإعدادات', ku: 'ڕێکخستنەکان' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج', ku: 'چوونەدەرەوە' },
    owner: { en: 'Owner', ar: 'مالك', ku: 'خاوەن' },
    login: { en: 'Login', ar: 'دخول', ku: 'چوونەژوورەوە' },
    register: { en: 'Register', ar: 'تۆمارکردن', ku: 'تۆمارکردن' },
    claim: { en: 'Claim Business', ar: 'طالب بعملك', ku: 'داوای کارەکەت بکە' },
    admin: { en: 'Admin Dashboard', ar: 'لوحة الإدارة', ku: 'داشبۆردی بەڕێوەبەر' }
  };

  return (
    <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div 
          className="flex items-center gap-2 group cursor-pointer shrink-0" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0F7B6C] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-[10deg] transition-all duration-500 border border-white/10">
            <span className="text-[#C8A96A] font-black text-lg sm:text-xl">ش</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-lg font-black text-[#111827] poppins-bold tracking-tighter leading-none uppercase">
              {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
            </h1>
          </div>
        </div>

        {/* Center: Language Selection (Small buttons side by side) */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            {[
              { id: 'ar', label: 'AR' },
              { id: 'en', label: 'EN' },
              { id: 'ku', label: 'KU' }
            ].map((lang) => (
              <button 
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`px-3 py-1 rounded-full text-[9px] font-black transition-all duration-300 ${
                  language === lang.id 
                    ? 'bg-[#0F7B6C] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-[#0F7B6C]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* BUILD MODE ONLY - Toggle Button */}
          {hasBuildModeAccess && (
            <button 
              onClick={toggleBuildMode}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                buildModeEnabled 
                  ? 'bg-primary text-white border-primary shadow-lg' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-primary'
              }`}
            >
              Build Mode
            </button>
          )}
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Language Toggle (Minimal) */}
          <div className="flex sm:hidden items-center bg-slate-100/50 p-0.5 rounded-lg border border-slate-200/50 mr-1">
            {['ar', 'en'].map((lang) => (
              <button 
                key={lang}
                onClick={() => setLanguage(lang as any)}
                className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                  language === lang ? 'bg-[#0F7B6C] text-white' : 'text-slate-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {authLoading ? (
            <div className="w-8 h-8 rounded-lg bg-slate-50 animate-pulse" />
          ) : (
            <>
              {!user ? (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onAuth('login')}
                    className="px-3 py-2 text-[#111827] text-[9px] font-black rounded-xl hover:text-[#0F7B6C] transition-all uppercase tracking-widest"
                  >
                    {translations.login[language]}
                  </button>
                  <button 
                    onClick={() => onAuth('signup')}
                    className="px-4 py-2 bg-[#0F7B6C] text-white text-[9px] font-black rounded-xl shadow-md hover:bg-[#0d6b5e] transition-all uppercase tracking-widest"
                  >
                    {translations.register[language]}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-xl bg-white border border-slate-100 hover:border-[#0F7B6C] transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0F7B6C] flex items-center justify-center text-white text-[10px] font-black">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {/* ... menu content ... */}

                      <AnimatePresence>
                        {showUserMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-2xl shadow-card border border-slate-100 py-2 z-[70] overflow-hidden`}
                          >
                            <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                              <p className="text-[10px] font-black text-primary truncate">{profile?.full_name || user.email}</p>
                              <p className="text-[8px] font-bold text-slate-400 truncate mt-0.5">{user.email}</p>
                            </div>
                            
                            {profile?.role === 'business_owner' && (
                              <Link 
                                to="/dashboard"
                                onClick={() => setShowUserMenu(false)}
                                className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-accent flex items-center gap-3 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4" /> {translations.dashboard[language]}
                              </Link>
                            )}

                            {(profile?.role === 'admin' || user?.email === 'safaribosafar@gmail.com') && (
                              <Link 
                                to="/admin"
                                onClick={() => setShowUserMenu(false)}
                                className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-3 transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" /> {translations.admin[language]}
                              </Link>
                            )}

                            <button className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-3 transition-colors">
                              <Settings className="w-4 h-4" /> {translations.settings[language]}
                            </button>
                            
                            <div className="h-px bg-slate-100 my-1" />
                            
                            <button 
                              onClick={() => {
                                signOut();
                                setShowUserMenu(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <LogOut className="w-4 h-4" /> {translations.signOut[language]}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
    </header>
  );
}
