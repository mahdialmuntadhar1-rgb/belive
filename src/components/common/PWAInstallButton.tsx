import React, { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const { language } = useHomeStore();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-md"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center font-black">✕</div>
              </button>

              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary">
                  <Download className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary poppins-bold uppercase tracking-tight">
                    {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {language === 'ar' 
                      ? 'للحصول على أفضل تجربة، يرجى النقر على أيقونة المشاركة في متصفحك واختيار "إضافة إلى الشاشة الرئيسية".' 
                      : 'For the best experience, please click the share icon in your browser and select "Add to Home Screen".'}
                  </p>
                </div>

                <div className="w-full p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">
                    📤
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 1</p>
                    <p className="text-xs font-bold text-slate-600">Tap Share Icon</p>
                  </div>
                </div>

                <div className="w-full p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">
                    ➕
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 2</p>
                    <p className="text-xs font-bold text-slate-600">Add to Home Screen</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-premium hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {language === 'ar' ? 'فهمت' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[100]"
        >
          <button
            onClick={handleInstall}
            className="group relative flex items-center gap-2 sm:gap-4 bg-primary text-white px-4 sm:px-8 py-3 sm:py-5 rounded-2xl sm:rounded-[32px] shadow-[0_0_30px_rgba(255,159,28,0.6)] hover:shadow-[0_0_50px_rgba(255,159,28,0.8)] hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden border-2 border-white/20"
          >
          {/* Intense Glowing Animation */}
          <motion.div
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent/20 blur-xl"
          />
          
          {/* Scanning Light Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
          
          <div className="relative flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md">
            <Download className="w-6 h-6 animate-bounce" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-white"
            />
          </div>

          <div className="relative flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">
                {language === 'ar' ? 'تثبيت الآن' : 'Install Now'}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            </div>
            <span className="text-lg font-black poppins-bold tracking-tight">
              {language === 'ar' ? 'تحميل شكو ماكو' : 'Download Shaku Maku'}
            </span>
          </div>

          <div className="relative ml-2 p-2 bg-accent rounded-xl text-primary">
            <Smartphone className="w-5 h-5" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  </>
);
}
