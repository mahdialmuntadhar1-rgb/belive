import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

type UserRole = 'user' | 'business_owner';
const MIN_PASSWORD_LENGTH = 8;

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isForgot, setIsForgot] = useState(initialMode === 'forgot');
  
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
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { language } = useHomeStore();

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
    noAccount: {
      en: "Don't have an account?",
      ar: 'ليس لديك حساب؟',
      ku: 'هەژمارت نییە؟'
    },
    haveAccount: {
      en: 'Already have an account?',
      ar: 'لديك حساب بالفعل؟',
      ku: 'پێشتر هەژمارت دروستکردووە؟'
    },
    signupSuccess: {
      en: 'Account created successfully! Please check your email to confirm your account.',
      ar: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.',
      ku: 'هەژمارەکە بە سەرکەوتوویی دروستکرا! تکایە ئیمەیڵەکەت بپشکنە بۆ پشتڕاستکردنەوەی هەژمار.'
    },
    requiredName: {
      en: 'Full name is required',
      ar: 'الاسم الكامل مطلوب',
      ku: 'ناوی تەواو پێویستە'
    },
    requiredRole: {
      en: 'Please select an account type',
      ar: 'يرجى اختيار نوع الحساب',
      ku: 'تکایە جۆری هەژمار هەڵبژێرە'
    },
    requiredEmail: {
      en: 'Email is required',
      ar: 'البريد الإلكتروني مطلوب',
      ku: 'ئیمەیڵ پێویستە'
    },
    invalidEmail: {
      en: 'Please enter a valid email address',
      ar: 'يرجى إدخال بريد إلكتروني صحيح',
      ku: 'تکایە ئیمەیڵێکی دروست بنووسە'
    },
    requiredPassword: {
      en: 'Password is required',
      ar: 'كلمة المرور مطلوبة',
      ku: 'وشەی نهێنی پێویستە'
    },
    weakPassword: {
      en: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ar: `يجب أن تكون كلمة المرور ${MIN_PASSWORD_LENGTH} أحرف على الأقل`,
      ku: `وشەی نهێنی دەبێت لانیکەم ${MIN_PASSWORD_LENGTH} پیت بێت`
    },
    friendlyAuthFailure: {
      en: 'Unable to create account. Please try again.',
      ar: 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى',
      ku: 'نەتوانرا هەژمارەکە دروست بکرێت، تکایە دووبارە هەوڵبدەرەوە'
    },
    friendlyProfileFailure: {
      en: 'An error occurred while saving account details.',
      ar: 'حدث خطأ أثناء حفظ بيانات الحساب',
      ku: 'هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردنی زانیاری هەژمار'
    },
    emailInUse: {
      en: 'This email is already in use',
      ar: 'البريد الإلكتروني مستخدم بالفعل',
      ku: 'ئەم ئیمەیڵە پێشتر بەکارهاتووە'
    }
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const normalizeAuthError = (rawMessage: string, fallback: string) => {
    const message = rawMessage.toLowerCase();
    if (message.includes('already registered') || message.includes('already in use') || message.includes('duplicate key')) {
      return translations.emailInUse[language];
    }
    if (message.includes('database error saving new user')) {
      return translations.friendlyProfileFailure[language];
    }
    if (message.includes('failed to fetch') || message.includes('network')) {
      return language === 'ar'
        ? 'تعذر الاتصال بالخادم، يرجى التحقق من الإنترنت والمحاولة مرة أخرى'
        : language === 'ku'
          ? 'نەتوانرا پەیوەندی بە سێرڤەر بکرێت، تکایە ئینتەرنێتەکەت بپشکنە و دووبارە هەوڵبدەرەوە'
          : 'Unable to reach the server. Please check your internet connection and try again.';
    }
    return fallback;
  };

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return translations.requiredEmail[language];
    if (!isValidEmail(trimmedEmail)) return translations.invalidEmail[language];

    if (!isForgot && !password) return translations.requiredPassword[language];
    if (!isForgot && password.length < MIN_PASSWORD_LENGTH) return translations.weakPassword[language];

    if (!isLogin && !isForgot) {
      if (!trimmedName) return translations.requiredName[language];
      if (!role) return translations.requiredRole[language];
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;

        if (signUpData.user) {
          const hasSession = Boolean(signUpData.session?.user?.id);
          if (hasSession) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: signUpData.user.id,
                  email: signUpData.user.email,
                  full_name: name.trim(),
                  role,
                },
                { onConflict: 'id' }
              );

            if (profileError) {
              console.error('Profile save error after signup:', profileError);
              throw new Error('PROFILE_SAVE_FAILED');
            }
          }

          setSuccess(translations.signupSuccess[language]);
          return;
        }
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      let message = translations.friendlyAuthFailure[language];
      if (err instanceof Error) {
        if (err.message === 'PROFILE_SAVE_FAILED') {
          message = translations.friendlyProfileFailure[language];
        } else {
          message = normalizeAuthError(err.message, translations.friendlyAuthFailure[language]);
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
                        className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                        required={!isLogin && !isForgot}
                      />
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-[#F5F7F9] rounded-2xl border border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => setRole('user')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          role === 'user' 
                            ? 'bg-white text-accent shadow-sm' 
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
                            ? 'bg-white text-accent shadow-sm' 
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
