import React, { useState, useEffect, useRef } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

// iOS Safari detection
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export default function PWAInstallButton() {
  const deferredPrompt = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);
  const { language } = useHomeStore();

  const isIOSSafari = isIOS() && isSafari();

  useEffect(() => {
    const handler = (e: any) => {
      console.log('[PWA Install] beforeinstallprompt event fired', e);
      e.preventDefault();
      deferredPrompt.current = e;
      console.log('[PWA Install] Deferred prompt stored');
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA Install] App already installed (standalone mode)');
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    console.log('[PWA Install] Button clicked');
    console.log('[PWA Install] Platform:', isIOSSafari ? 'iOS Safari' : 'Android/Desktop');
    console.log('[PWA Install] Deferred prompt exists:', !!deferredPrompt.current);

    // iOS Safari: show instructions (no native install)
    if (isIOSSafari) {
      console.log('[PWA Install] iOS Safari detected - showing instructions');
      setShowInstructions(true);
      return;
    }

    // Android/Desktop: use native install prompt
    if (!deferredPrompt.current) {
      console.log('[PWA Install] No deferred prompt available - install not available');
      // No install prompt available - show clear message
      setInstallFailed(true);
      setTimeout(() => setInstallFailed(false), 5000);
      return;
    }

    try {
      console.log('[PWA Install] Calling prompt()');
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      console.log('[PWA Install] User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA Install] Install accepted - hiding button');
        setIsVisible(false);
      } else if (outcome === 'dismissed') {
        console.log('[PWA Install] Install dismissed - clearing prompt');
        // User dismissed - clear the prompt so they can try again later
        deferredPrompt.current = null;
      }
    } catch (error) {
      console.error('[PWA Install] Install failed:', error);
      // Install failed - show clear message
      setInstallFailed(true);
      setTimeout(() => setInstallFailed(false), 5000);
    }
  };

  // Platform-specific button text
  const getButtonText = () => {
    if (isIOSSafari) {
      return language === 'ar' ? 'إضافة للشاشة الرئيسية' : 'Add to Home Screen';
    }
    return language === 'ar' ? 'تثبيت التطبيق' : 'Install App';
  };

  const getSubButtonText = () => {
    if (isIOSSafari) {
      return 'Shaku Maku';
    }
    return 'Shaku Maku';
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {language === 'ar' ? 'إضافة للشاشة الرئيسية' : 'Add to Home Screen'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {language === 'ar' 
                      ? 'لإضافة التطبيق، اتبع الخطوات التالية:' 
                      : 'To add the app, follow these steps:'}
                  </p>
                </div>

                <div className="w-full space-y-3 text-left">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 font-bold text-slate-700">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {language === 'ar' ? 'اضغط على أيقونة المشاركة' : 'Tap the Share button'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'ar' ? 'في أسفل الشاشة' : 'At the bottom of the screen'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 font-bold text-slate-700">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {language === 'ar' ? 'مرر للأسفل' : 'Scroll down'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'ar' ? 'في القائمة' : 'In the menu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 font-bold text-slate-700">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {language === 'ar' ? 'اختر "إضافة للشاشة الرئيسية"' : 'Tap "Add to Home Screen"'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {language === 'ar' ? 'لإضافة التطبيق' : 'To add the app'}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {language === 'ar' ? 'فهمت' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {installFailed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-4 sm:right-6 z-[100] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg text-sm"
          >
            {language === 'ar' 
              ? 'غير متاح للتثبيت حالياً' 
              : 'Install not available right now'}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-12 md:bottom-24 right-4 sm:right-6 z-[100]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <button
            onClick={handleInstall}
            className="flex items-center gap-3 bg-primary text-white px-4 py-4 md:px-5 md:py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
          >
            <Download className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">
                {getButtonText()}
              </span>
              <span className="text-xs opacity-90">
                {getSubButtonText()}
              </span>
            </div>
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
