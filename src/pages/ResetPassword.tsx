import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useHomeStore } from '@/stores/homeStore';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { language } = useHomeStore();
  const navigate = useNavigate();

  const translations = {
    title: {
      en: 'Reset Your Password',
      ar: 'إعادة تعيين كلمة المرور',
      ku: 'وشەی نهێنی خۆت دووبارە ڕێکبخە'
    },
    description: {
      en: 'Enter your new password below.',
      ar: 'أدخل كلمة المرور الجديدة أدناه.',
      ku: 'وشەی نهێنی نوێ خوارەوە بنووسە.'
    },
    newPassword: {
      en: 'New Password',
      ar: 'كلمة المرور الجديدة',
      ku: 'وشەی نهێنی نوێ'
    },
    confirmPassword: {
      en: 'Confirm Password',
      ar: 'تأكيد كلمة المرور',
      ku: 'دووبارە شوێنی وشەی نهێنی'
    },
    submit: {
      en: 'Update Password',
      ar: 'تحديث كلمة المرور',
      ku: 'نوێکردنەوەی وشەی نهێنی'
    },
    successTitle: {
      en: 'Password Updated!',
      ar: 'تم تحديث كلمة المرور!',
      ku: 'وشەی نهێنی نوێکرایەوە!'
    },
    successMessage: {
      en: 'Your password has been successfully updated. You can now log in with your new password.',
      ar: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      ku: 'وشەی نهێنی بە سەرکەوتوویی نوێکرایەوە. ئێستا دەتوانیت بە وشەی نهێنی نوێ بچیتەژوورەوە.'
    },
    backToLogin: {
      en: 'Back to Login',
      ar: 'العودة لتسجيل الدخول',
      ku: 'گەڕانەوە بۆ چوونەژوورەوە'
    },
    passwordMismatch: {
      en: 'Passwords do not match',
      ar: 'كلمات المرور غير متطابقة',
      ku: 'وشەی نهێنی هاوشێوە نییە'
    },
    passwordTooShort: {
      en: 'Password must be at least 6 characters',
      ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      ku: 'وشەی نهێنی دەبێت لە 6 پیت زیاتر بێت'
    }
  };

  useEffect(() => {
    // Check if we have the hash in the URL from the reset link
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(translations.passwordTooShort[language]);
      return;
    }

    if (password !== confirmPassword) {
      setError(translations.passwordMismatch[language]);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      let message = 'An error occurred while updating your password';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7F9] to-[#E5E7EB] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 sm:p-10 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
            {translations.successTitle[language]}
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            {translations.successMessage[language]}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-primary hover:bg-bg-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {translations.backToLogin[language]}
            <ArrowRight className={`w-4 h-4 ${language === 'en' ? '' : 'rotate-180'}`} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F9] to-[#E5E7EB] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
              {translations.title[language]}
            </h2>
            <p className="text-sm text-[#6B7280]">
              {translations.description[language]}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={translations.newPassword[language]}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${language === 'en' ? 'pl-11 pr-12' : 'pr-11 pl-12'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${language === 'en' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#2B2F33]`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={translations.confirmPassword[language]}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-bg-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {translations.submit[language]}
                  <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
