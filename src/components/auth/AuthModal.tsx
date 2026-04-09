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
    errorMessages: {
      en: {
        generic: 'An error occurred during authentication',
        network: 'Network error: Could not connect to server. Please check your internet connection.',
        emailExists: 'This email is already registered. Please log in instead.',
        invalidCredentials: 'Invalid email or password. Please try again.',
        weakPassword: 'Password is too weak. Please use at least 6 characters.',
        profileFailed: 'Account created but profile setup failed. Please contact support.',
        missingFields: 'Please fill in all required fields.',
      },
      ar: {
        generic: 'حدث خطأ أثناء المصادقة',
        network: 'خطأ في الاتصال: لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        emailExists: 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.',
        invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
        weakPassword: 'كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف على الأقل.',
        profileFailed: 'تم إنشاء الحساب لكن فشل إعداد الملف الشخصي. يرجى الاتصال بالدعم.',
        missingFields: 'يرجى ملء جميع الحقول المطلوبة.',
      },
      ku: {
        generic: 'هەڵەیەک ڕوویدا لە کاتی دڵنیاکردنەوە',
        network: 'هەڵەی ئێنتەرنێت: ناتوانرێت پەیوەندی بە سێرڤەر بکرێت. تکایە پەیوەندی ئینتەرنێتەکەت بپشکە.',
        emailExists: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە لەباتی تۆمارکردن.',
        invalidCredentials: 'ئیمەیڵ یان وشەی نهێنی هەڵەیە. تکایە دووبارە هەوڵبدەرەوە.',
        weakPassword: 'وشەی نهێنی زۆر لاوەکییە. تکایە بە لانیکەم 6 پیت بەکاربهێنە.',
        profileFailed: 'هەژمار دروست کرا بەڵام دامەزراندنی پرۆفایل شکستی هێنا. تکایە پەیوەندی بە پشتگیری بکە.',
        missingFields: 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە.',
      }
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

  // Helper function to get localized error message
  const getErrorMessage = (error: Error | any): string => {
    const messages = translations.errorMessages[language];
    const msg = error?.message || '';
    
    // Check for specific error patterns
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
      return messages.network;
    }
    if (msg.includes('User already registered') || msg.includes('already exists') || error?.code === '23505') {
      return messages.emailExists;
    }
    if (msg.includes('Invalid login credentials') || msg.includes('Invalid email or password')) {
      return messages.invalidCredentials;
    }
    if (msg.includes('Password should be at least') || msg.includes('weak')) {
      return messages.weakPassword;
    }
    if (msg.includes('Database error saving new user') || msg.includes('profiles')) {
      return messages.profileFailed;
    }
    
    return messages.generic;
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const messages = translations.errorMessages[language];
    
    if (!email || !email.includes('@')) {
      setError(messages.missingFields);
      return false;
    }
    
    if (!isForgot && !password) {
      setError(messages.missingFields);
      return false;
    }
    
    if (!isLogin && !isForgot && !name.trim()) {
      setError(messages.missingFields);
      return false;
    }
    
    if (!isForgot && password.length < 6) {
      setError(messages.weakPassword);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        throw new Error('Supabase configuration missing');
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
          email,
          password,
        });
        if (signInError) throw signInError;
        onClose();
      } else {
        // Sign up with metadata - profile will be auto-created by trigger
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
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
          // Wait briefly for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify profile was created
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', signUpData.user.id)
            .single();
          
          if (profileError || !profileData) {
            console.warn('[Auth] Profile auto-creation may have failed:', profileError);
            // Try to create profile manually as fallback
            const { error: manualInsertError } = await supabase
              .from('profiles')
              .insert([{
                id: signUpData.user.id,
                email: signUpData.user.email,
                full_name: name.trim(),
                role: role,
              }]);
            
            if (manualInsertError) {
              console.error('[Auth] Manual profile creation failed:', manualInsertError);
              throw new Error('profile_failed');
            }
          }
          
          setSuccess(language === 'ar' 
            ? 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.' 
            : language === 'ku' 
              ? 'هەژمار بە سەرکەوتوویی دروست کرا! ئێستا دەتوانی بچیتە ژوورەوە.'
              : 'Account created successfully! You can now log in.');
          
          // Clear form and switch to login after 2 seconds
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('[Auth] Error:', err);
      setError(getErrorMessage(err));
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


                {isLogin && !isForgot && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      if (!email) {
                        setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter your email first');
                        return;
                      }
                      setLoading(true);
                      setError(null);
                      try {
                        const { error: magicError } = await supabase.auth.signInWithOtp({
                          email,
                          options: {
                            emailRedirectTo: window.location.origin,
                          },
                        });
                        if (magicError) throw magicError;
                        setSuccess(language === 'ar' ? 'تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني' : 'Magic link sent to your email');
                      } catch (err: any) {
                        setError(err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full py-3.5 bg-white border-2 border-slate-200 hover:border-primary text-bg-dark font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    {language === 'ar' ? 'تسجيل الدخول برابط سحري' : language === 'ku' ? 'چوونەژوورەوە بە لینکی سیحراوی' : 'Sign in with Magic Link'}
                  </button>
                )}
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
