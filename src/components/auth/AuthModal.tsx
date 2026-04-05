import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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

        if (signUpData.user) {
          // Create profile in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signUpData.user.id,
                email: email,
                full_name: name,
                role: role,
              },
            ]);
          if (profileError) throw profileError;
        }
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (googleError) throw googleError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
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

            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {isLogin 
                    ? 'Log in to access your saved places and reviews.' 
                    : 'Join Shakou Marku to discover and share the best of Iraq.'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
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
                        Normal User
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
                        Business Owner
                      </button>
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-[#2CA6A4] hover:underline">
                      Forgot Password?
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
                      {isLogin ? 'Log In' : 'Sign Up'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Or continue with</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 py-3 border border-[#E5E7EB] rounded-2xl hover:bg-[#F5F7F9] transition-all text-sm font-bold text-[#2B2F33]"
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
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-bold text-[#2CA6A4] hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
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
