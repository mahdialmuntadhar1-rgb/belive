import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}


export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isForgot, setIsForgot] = useState(initialMode === 'forgot');
  const { signIn, signUp } = useAuth();
  
  // Reset state when modal opens with a specific mode
  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setIsForgot(initialMode === 'forgot');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { language } = useHomeStore();

  const navigate = useNavigate();

  const translations = {
    forgotTitle: {
      en: 'Reset Password',
      ar: 'إعادة تعيين كلمة المرور',
      ku: 'دووبارە ڕێکخستنەوەی وشەی نهێنی'
    },
    forgotDesc: {
      en: 'Enter your email to receive a password reset link.',
      ar: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور.',
      ku: 'ئیمەیڵەکەت بنووسە بۆ وەرگرتنی لینکی دووبارە ڕێکخستنەوەی وشەی نهێنی.'
    },
    resetSent: {
      en: 'Reset link sent! Check your email.',
      ar: 'تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني.',
      ku: 'لینکی دووبارە ڕێکخستنەوە نێردرا! سەیری ئیمەیڵەکەت بکە.'
    },
    backToLogin: {
      en: 'Back to Login',
      ar: 'العودة لتسجيل الدخول',
      ku: 'گەڕانەوە بۆ چوونەژوورەوە'
    },
    sendReset: {
      en: 'Send Reset Link',
      ar: 'إرسال رابط إعادة التعيين',
      ku: 'ناردنی لینکی دووبارە ڕێکخستنەوە'
    },
    welcome: {
      en: 'Welcome Back',
      ar: 'مرحباً بعودتك',
      ku: 'بەخێربێیتەوە'
    },
    create: {
      en: 'Create Account',
      ar: 'إنشاء حساب',
      ku: 'دروستکردنی هەژمار'
    },
    loginDesc: {
      en: 'Log in to access your business dashboard.',
      ar: 'سجل الدخول للوصول إلى لوحة التحكم الخاصة بك.',
      ku: 'بچۆ ژوورەوە بۆ دەستگەیشتن بە داشبۆردی کارەکەت.'
    },
    signupDesc: {
      en: 'Create your business owner account to manage your listings.',
      ar: 'أنشئ حساب صاحب العمل لإدارة قوائمك.',
      ku: 'هەژماری خاوەنی کار دروست بکە بۆ بەڕێوەبردنی لیستەکانت.'
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الهاتف',
      ku: 'ژمارەی تەلەفۆن'
    },
    email: {
      en: 'Email Address',
      ar: 'البريد الإلكتروني',
      ku: 'ناونیشانی ئیمەیڵ'
    },
    password: {
      en: 'Password',
      ar: 'كلمة المرور',
      ku: 'وشەی نهێنی'
    },
    login: {
      en: 'Log In',
      ar: 'تسجيل الدخول',
      ku: 'چوونەژوورەوە'
    },
    signup: {
      en: 'Sign Up',
      ar: 'إنشاء حساب',
      ku: 'خۆت تۆمار بکە'
    },
    forgot: {
      en: 'Forgot Password?',
      ar: 'نسيت كلمة المرور؟',
      ku: 'وشەی نهێنیت لەبیرچووە؟'
    },
    noAccount: {
      en: "Don't have an account?",
      ar: 'ليس لديك حساب؟',
      ku: 'هەژمارت نییە؟'
    },
    haveAccount: {
      en: 'Already have an account?',
      ar: 'لديك حساب بالفعل؟',
      ku: 'پێشتر هەژمارت دروستکردووە؟'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
      }

      if (isForgot) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setSuccess(translations.resetSent[language]);
        return;
      }

      if (isLogin) {
        await signIn(email, password);
        // After successful login, redirect to dashboard
        onClose();
        navigate('/dashboard');
      } else {
        await signUp(email, password, {
          phone: phone,
        });
        setSuccess(language === 'ar' ? 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.' : 'Account created! Please check your email to verify your account.');
        return;
      }
    } catch (err) {
      console.error('Auth error:', err);
      let message = 'An error occurred during authentication';
      if (err instanceof Error) {
        message = err.message;
        if (message.includes('Failed to fetch')) {
          message = 'Network error: Could not connect to authentication server. Please check your internet connection or Supabase configuration.';
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F7F9] transition-colors text-[#6B7280]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
                  {isForgot 
                    ? translations.forgotTitle[language] 
                    : isLogin 
                      ? translations.welcome[language] 
                      : translations.create[language]}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {isForgot
                    ? translations.forgotDesc[language]
                    : isLogin 
                      ? translations.loginDesc[language] 
                      : translations.signupDesc[language]}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-600 font-bold">
                  {success}
                </div>
              )}

              {!import.meta.env.VITE_SUPABASE_URL && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                  ⚠️ Supabase Configuration Missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isForgot && (
                  <div className="relative">
                    <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder={translations.phone[language]}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                      required={!isLogin && !isForgot}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder={translations.email[language]}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                    required
                  />
                </div>

                {!isForgot && (
                  <div className="relative">
                    <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder={translations.password[language]}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                      required={!isForgot}
                    />
                  </div>
                )}

                {isLogin && !isForgot && (
                  <div className={`flex ${language === 'en' ? 'justify-end' : 'justify-start'}`}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgot(true);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-bold text-accent hover:underline"
                    >
                      {translations.forgot[language]}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-bg-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isForgot 
                        ? translations.sendReset[language] 
                        : isLogin 
                          ? translations.login[language] 
                          : translations.signup[language]}
                      <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                    </>
                  )}
                </button>

              </form>

              {isForgot && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsForgot(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs font-bold text-[#6B7280] hover:text-primary transition-colors"
                  >
                    ← {translations.backToLogin[language]}
                  </button>
                </div>
              )}

              {!isForgot && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-[#6B7280]">
                    {isLogin ? translations.noAccount[language] : translations.haveAccount[language]}{' '}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                        setSuccess(null);
                      }}
                      className="font-bold text-accent hover:underline"
                    >
                      {isLogin ? translations.signup[language] : translations.login[language]}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
