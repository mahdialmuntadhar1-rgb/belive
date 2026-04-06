import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'user' | 'business_owner';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useHomeStore();

  const translations = {
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
      en: 'Log in to access your saved places and reviews.',
      ar: 'سجل الدخول للوصول إلى الأماكن المحفوظة والمراجعات.',
      ku: 'بچۆ ژوورەوە بۆ دەستگەیشتن بە شوێنە پاشەکەوتکراوەکان و پێداچوونەوەکان.'
    },
    signupDesc: {
      en: 'Join Saku Maku to discover and share the best of Iraq.',
      ar: 'انضم إلى شکو ماکو لاكتشاف ومشاركة الأفضل في العراق.',
      ku: 'ببە بە ئەندام لە شکو ماکو بۆ دۆزینەوە و هاوبەشکردنی باشترینەکانی عێراق.'
    },
    fullName: {
      en: 'Full Name',
      ar: 'الاسم الكامل',
      ku: 'ناوی تەواو'
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
    normalUser: {
      en: 'Normal User',
      ar: 'مستخدم عادي',
      ku: 'بەکارهێنەری ئاسایی'
    },
    businessOwner: {
      en: 'Business Owner',
      ar: 'صاحب عمل',
      ku: 'خاوەن کار'
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
    or: {
      en: 'Or continue with',
      ar: 'أو استمر بواسطة',
      ku: 'یان بەردەوام بە لەڕێگەی'
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

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            },
          },
        });
        if (signUpError) throw signUpError;

        // Profile is auto-created by the handle_new_user DB trigger.
        // No manual insert needed here — the trigger inserts id, full_name, role.
      }
      onClose();
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

  const isGoogleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleGoogleLogin = async () => {
    if (!isGoogleConfigured) {
      setError('Google login is not configured for this deployment.');
      return;
    }
    setError(null);
    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        throw new Error('Supabase is not configured. Google login will not work.');
      }

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (googleError) throw googleError;
    } catch (err) {
      console.error('Google Auth error:', err);
      let message = 'Failed to sign in with Google';
      if (err instanceof Error) {
        message = err.message;
        if (message.includes('Failed to fetch')) {
          message = 'Network error: Could not connect to Google authentication. This might be due to missing Supabase configuration or network restrictions.';
        }
      }
      setError(message);
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
                  {isLogin ? translations.welcome[language] : translations.create[language]}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {isLogin 
                    ? translations.loginDesc[language] 
                    : translations.signupDesc[language]}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
                  {error}
                </div>
              )}

              {!import.meta.env.VITE_SUPABASE_URL && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                  ⚠️ Supabase Configuration Missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder={translations.fullName[language]}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                        required={!isLogin}
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-[#F5F7F9] rounded-2xl border border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => setRole('user')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'user' 
                            ? 'bg-white text-[#2CA6A4] shadow-sm' 
                            : 'text-[#6B7280] hover:text-[#2B2F33]'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {translations.normalUser[language]}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('business_owner')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'business_owner' 
                            ? 'bg-white text-[#E87A41] shadow-sm' 
                            : 'text-[#6B7280] hover:text-[#2B2F33]'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        {translations.businessOwner[language]}
                      </button>
                    </div>
                  </>
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
                    className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                    required
                  />
                </div>

                <div className="relative">
                  <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder={translations.password[language]}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm`}
                    required
                  />
                </div>

                {isLogin && (
                  <div className={`flex ${language === 'en' ? 'justify-end' : 'justify-start'}`}>
                    <button type="button" className="text-xs font-bold text-[#2CA6A4] hover:underline">
                      {translations.forgot[language]}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2CA6A4] hover:bg-[#1e7a78] text-white font-bold rounded-2xl shadow-lg shadow-[#2CA6A4]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? translations.login[language] : translations.signup[language]}
                      <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{translations.or[language]}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={!isGoogleConfigured}
                  title={!isGoogleConfigured ? 'Google login is not configured for this deployment' : undefined}
                  className="flex items-center justify-center gap-3 py-3 border border-[#E5E7EB] rounded-2xl hover:bg-[#F5F7F9] transition-all text-sm font-bold text-[#2B2F33] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#6B7280]">
                  {isLogin ? translations.noAccount[language] : translations.haveAccount[language]}{' '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-bold text-[#2CA6A4] hover:underline"
                  >
                    {isLogin ? translations.signup[language] : translations.login[language]}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
