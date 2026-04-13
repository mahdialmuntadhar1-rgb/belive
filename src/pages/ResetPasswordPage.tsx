import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { language } = useHomeStore();
  const navigate = useNavigate();

  const translations = {
    title: {
      en: 'Set New Password',
      ar: 'تعيين كلمة مرور جديدة',
      ku: 'وشەی نهێنی نوێ دابنێ'
    },
    desc: {
      en: 'Please enter your new password below.',
      ar: 'يرجى إدخال كلمة المرور الجديدة أدناه.',
      ku: 'تکایە وشەی نهێنی نوێی خۆت لە خوارەوە بنووسە.'
    },
    password: {
      en: 'New Password',
      ar: 'كلمة المرور الجديدة',
      ku: 'وشەی نهێنی نوێ'
    },
    confirmPassword: {
      en: 'Confirm New Password',
      ar: 'تأكيد كلمة المرور الجديدة',
      ku: 'تأکیدکردنەوەی وشەی نهێنی نوێ'
    },
    update: {
      en: 'Update Password',
      ar: 'تحديث كلمة المرور',
      ku: 'نوێکردنەوەی وشەی نهێنی'
    },
    success: {
      en: 'Password updated successfully!',
      ar: 'تم تحديث كلمة المرور بنجاح!',
      ku: 'وشەی نهێنی بە سەرکەوتوویی نوێکرایەوە!'
    },
    backToHome: {
      en: 'Back to Home',
      ar: 'العودة إلى الرئيسية',
      ku: 'گەڕانەوە بۆ سەرەکی'
    },
    matchError: {
      en: 'Passwords do not match',
      ar: 'كلمات المرور غير متطابقة',
      ku: 'وشە نهێنییەکان وەک یەک نین'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(translations.matchError[language]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      setSuccess(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 sm:p-10"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
            {translations.title[language]}
          </h1>
          <p className="text-sm text-[#6B7280]">
            {translations.desc[language]}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-600 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {translations.success[language]}
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold text-accent hover:underline"
            >
              {translations.backToHome[language]}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
                minLength={6}
              />
            </div>

            <div className="relative">
              <div className={`absolute ${language === 'en' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[#6B7280]`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder={translations.confirmPassword[language]}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full ${language === 'en' ? 'pl-11 pr-4' : 'pr-11 pl-4'} py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-accent rounded-2xl focus:outline-none transition-all text-sm`}
                required
                minLength={6}
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
                  {translations.update[language]}
                  <ArrowRight className={`w-4 h-4 ${language === 'en' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
