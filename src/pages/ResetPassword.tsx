import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a recovery token in the URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#2B2F33] mb-2">Password Updated!</h2>
              <p className="text-sm text-[#6B7280]">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2B2F33] mb-2">Reset Password</h2>
                <p className="text-sm text-[#6B7280]">Enter your new password below</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2CA6A4] hover:bg-[#1e7a78] text-white font-bold rounded-2xl shadow-lg shadow-[#2CA6A4]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-bold text-[#6B7280] hover:text-[#2CA6A4] transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
