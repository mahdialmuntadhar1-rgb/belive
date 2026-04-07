import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SLOGANS = [
  {
    en: "Discover Iraq's hidden gems",
    ar: "اكتشف جواهر العراق الخفية",
    ku: "گەوهەرە شاراوەکانی عێراق بدۆزەرەوە"
  },
  {
    en: "Grow your business with us",
    ar: "نمِّ عملك التجاري معنا",
    ku: "کارەکەت لەگەڵ ئێمە گەشە پێ بدە"
  },
  {
    en: "Verified reviews you can trust",
    ar: "مراجعات موثوقة يمكنك الاعتماد عليها",
    ku: "پێداچوونەوەی ڕاست و باوەڕپێکراو"
  }
];

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 5);
  const [currentSlogan, setCurrentSlogan] = React.useState(0);
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';

  // Capture PWA install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  const installTranslations = {
    install: {
      en: 'Install App',
      ar: 'تثبيت التطبيق',
      ku: 'دامەزراندنی ئەپ'
    },
    installDesc: {
      en: 'Get the best experience on your device',
      ar: 'احصل على أفضل تجربة على جهازك',
      ku: 'باشترین ئەزموون بەدەستبهێنە لەسەر ئامێرەکەت'
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="w-full px-4 sm:px-6 pt-6 pb-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-bg-dark via-bg-dark to-slate-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] border border-white/10"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-12 py-10 sm:py-14">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-6 py-2.5 glass rounded-full border border-white/10 flex items-center gap-4 shadow-2xl"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-dark bg-slate-200 overflow-hidden shadow-lg">
                  <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">
                {language === 'ar' ? 'أكثر من ١٠ آلاف مستخدم نشط' : language === 'ku' ? 'زیاتر لە ١٠ هەزار بەکارهێنەری چالاک' : '10k+ active users in Iraq'}
              </span>
            </div>
          </motion.div>

          {/* PWA Install Button - Prominent & Glowing */}
          {isInstallable && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="mb-8 group relative px-8 py-4 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl shadow-[0_0_40px_rgba(255,159,28,0.4)] hover:shadow-[0_0_60px_rgba(255,159,28,0.6)] transition-all duration-500"
            >
              {/* Animated glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary animate-pulse blur-xl opacity-50" />
              
              <div className="relative flex items-center gap-3">
                <Download className="w-5 h-5 text-bg-dark animate-bounce" />
                <div className="text-left">
                  <span className="block text-[11px] font-black text-bg-dark uppercase tracking-[0.2em]">
                    {installTranslations.install[language]}
                  </span>
                  <span className="block text-[8px] text-bg-dark/70 font-bold">
                    {installTranslations.installDesc[language]}
                  </span>
                </div>
              </div>
            </motion.button>
          )}

          {/* Slogan with Animation */}
          <div className="h-24 sm:h-32 flex flex-col items-center justify-center w-full mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlogan}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter poppins-bold leading-tight drop-shadow-2xl max-w-4xl uppercase text-center">
                  {SLOGANS[currentSlogan][language]}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Search Bar - ChatGPT Inspired Design */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full max-w-4xl relative group px-4"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000" />
            <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] overflow-hidden p-2 border border-white/20 group-focus-within:border-primary/50 transition-all duration-500">
              <div className={`flex items-center flex-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="px-5 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن أي شيء في العراق...' : language === 'ku' ? 'بگەڕێ بۆ هەر شتێک لە عێراق...' : 'Search for anything in Iraq...'}
                  className={`flex-1 py-4 text-base font-bold text-bg-dark focus:outline-none bg-transparent placeholder:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>
              <div className="flex items-center gap-2 px-2">
                <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-bg-dark text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[18px] hover:bg-primary hover:text-bg-dark transition-all active:scale-95 shadow-xl border border-white/10 group/btn">
                  {language === 'ar' ? 'بحث' : language === 'ku' ? 'گەڕان' : 'Search'}
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Live Activity Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center gap-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                {language === 'ar' ? '١,٢٤٠ متصل الآن' : language === 'ku' ? '١,٢٤٠ کەس ئێستا چالاکن' : '1,240 Online Now'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                {language === 'ar' ? '٥٠+ عمل جديد اليوم' : language === 'ku' ? '٥٠+ کارێکی نوێ ئەمڕۆ' : '50+ New Businesses Today'}
              </span>
            </div>
          </motion.div>

          {/* Global Helper Line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-[11px] text-white/50 font-black uppercase tracking-[0.2em] text-center"
          >
            {language === 'ar' 
              ? 'ابحث عن الأنشطة أو شاهد ما يحدث حولك' 
              : language === 'ku' 
                ? 'کارەکان بدۆزەوە یان ببینە چی لە دەورتدا ڕوودەدات'
                : 'Find businesses or see what\'s happening around you'}
          </motion.p>
        </div>
      </motion.div>
    </div>
  </section>
  );
}
