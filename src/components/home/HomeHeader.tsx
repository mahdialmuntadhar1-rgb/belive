import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, PlusCircle, LogOut, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useHomeStore } from '@/stores/homeStore';

interface HomeHeaderProps {
  onAddBusiness: () => void;
  onAuth: (mode: 'login' | 'signup') => void;
}

export default function HomeHeader({ onAddBusiness, onAuth }: HomeHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage } = useHomeStore();

  const isRTL = language === 'ar' || language === 'ku';

  const translations = {
    addBusiness: { en: 'Add Business', ar: 'أضف عملك', ku: 'کارەکەت زیاد بکە' },
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم', ku: 'داشبۆرد' },
    settings: { en: 'Settings', ar: 'الإعدادات', ku: 'ڕێکخستنەکان' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج', ku: 'چوونەدەرەوە' },
    owner: { en: 'Owner', ar: 'مالك', ku: 'خاوەن' },
    login: { en: 'Login', ar: 'دخول', ku: 'چوونەژوورەوە' },
    register: { en: 'Register', ar: 'تۆمارکردن', ku: 'تۆمارکردن' }
  };

  return (
    <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col gap-2 sm:gap-3">
        {/* Top Row: Logo & Auth */}
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Brand */}
          <div 
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-[10deg] transition-all duration-500 border border-white/10">
              <span className="text-accent font-black text-xl sm:text-2xl">ش</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-xl font-black text-primary poppins-bold tracking-tighter leading-none uppercase">
                {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
              </h1>
              <p className="text-[7px] sm:text-[9px] text-accent font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">
                {language === 'ar' ? 'دليل العراق' : 'Iraq Directory'}
              </p>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {authLoading ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 animate-pulse" />
            ) : (
              <>
                {!user ? (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onAuth('login')}
                      className="px-2 sm:px-4 py-2 sm:py-3 text-text-muted text-[9px] sm:text-[10px] font-black rounded-xl hover:text-primary transition-all uppercase tracking-widest"
                    >
                      {translations.login[language]}
                    </button>
                    <button 
                      onClick={() => onAuth('signup')}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-primary text-white text-[9px] sm:text-[10px] font-black rounded-xl sm:rounded-2xl shadow-premium hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      <User className="w-4 h-4 sm:w-5 h-5" />
                      <span className="hidden sm:inline">{translations.register[language]}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={onAddBusiness}
                      className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-primary text-[10px] font-black rounded-2xl hover:border-accent hover:text-accent transition-all uppercase tracking-widest shadow-sm"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>{translations.addBusiness[language]}</span>
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 p-1 rounded-2xl bg-white border border-slate-100 hover:border-primary transition-all shadow-sm group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-[12px] font-black">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                      </button>

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
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Language Selection (Separate buttons below logo and registration) */}
        <div className="flex justify-center border-t border-slate-50 pt-2 pb-1">
          <div className="flex items-center gap-2 sm:gap-4">
            {[
              { id: 'en', label: 'English', flag: '🇬🇧' },
              { id: 'ar', label: 'العربية', flag: '🇮🇶' },
              { id: 'ku', label: 'کوردی', flag: '☀️' }
            ].map((lang) => (
              <button 
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 uppercase flex items-center gap-2 border ${
                  language === lang.id 
                    ? 'bg-primary text-white border-primary shadow-md scale-105' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-primary/30 hover:text-primary'
                }`}
              >
                <span className="text-sm sm:text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
