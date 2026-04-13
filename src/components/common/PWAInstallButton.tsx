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
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[100] bg-white/95 backdrop-blur-xl p-3 rounded-[24px] shadow-2xl border border-slate-100 flex items-center gap-4 max-w-[280px]"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-bg-dark uppercase tracking-tight leading-tight mb-0.5 truncate">
                {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
              </p>
              <p className="text-[8px] text-slate-500 font-bold leading-tight truncate">
                {language === 'ar' ? 'للوصول السريع وتلقي التحديثات' : 'For quick access & updates'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 text-slate-400 hover:text-bg-dark transition-colors"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center font-black text-[10px]">✕</div>
              </button>
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:bg-accent hover:text-bg-dark transition-all"
              >
                {language === 'ar' ? 'تثبيت' : 'Install'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
