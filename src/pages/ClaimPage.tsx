import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Phone, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Store,
  MapPin,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export default function ClaimPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Phone Lookup
  const [phone, setPhone] = useState('');
  const [matches, setMatches] = useState<any[]>([]);
  
  // Step 2: Selection
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  
  // Step 3: Account Creation
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Search for businesses with this phone
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .or(`phone.eq.${phone},phone_1.eq.${phone},phone_2.eq.${phone}`)
        .is('owner_id', null); // Only unclaimed businesses
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        setMatches(data);
        setStep(2);
      } else {
        setError('No unclaimed businesses found with this phone number. Please contact support if you believe this is an error.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Sign up user
      const authData = await signUp(formData.email, formData.password, { full_name: formData.fullName });
      
      if (authData?.user) {
        // 2. Create claim request
        const { error: claimError } = await supabase
          .from('claim_requests')
          .insert([{
            business_id: selectedBusiness.id,
            user_id: authData.user.id,
            phone: phone,
            status: 'pending'
          }]);
        
        if (claimError) throw claimError;
        
        setStep(4); // Success step
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#2CA6A4] rounded-[28px] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-[#2CA6A4]/20"
          >
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-[#1A2B4B] poppins-bold uppercase tracking-tight mb-4">Claim Your Business</h1>
          <p className="text-slate-500 font-medium">Verify your ownership and start managing your presence on Shaku Maku.</p>
        </div>

        <div className="bg-white rounded-[48px] shadow-premium p-10 border border-slate-100 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
            <motion.div 
              className="h-full bg-[#2CA6A4]"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Step 1: Phone Lookup</h3>
                  <p className="text-sm text-slate-400 font-medium">Enter the phone number associated with your business listing.</p>
                </div>

                <form onSubmit={handlePhoneLookup} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] transition-all text-lg font-bold"
                        placeholder="07XXXXXXXX"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#1A2B4B] text-white font-black rounded-2xl hover:bg-[#2A3B5B] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Find My Business</>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Step 2: Select Business</h3>
                  <p className="text-sm text-slate-400 font-medium">We found {matches.length} matching listings. Which one is yours?</p>
                </div>

                <div className="space-y-4">
                  {matches.map(biz => (
                    <button 
                      key={biz.id}
                      onClick={() => setSelectedBusiness(biz)}
                      className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${selectedBusiness?.id === biz.id ? 'border-[#2CA6A4] bg-[#2CA6A4]/5' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${selectedBusiness?.id === biz.id ? 'bg-[#2CA6A4] text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                        <Store className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg">{biz.name}</p>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {biz.governorate}</span>
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {biz.category}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedBusiness}
                  className="w-full py-5 bg-[#1A2B4B] text-white font-black rounded-2xl hover:bg-[#2A3B5B] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  Continue to Verification <ArrowRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setStep(1)}
                  className="w-full text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                >
                  Back to Search
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Step 3: Create Account</h3>
                  <p className="text-sm text-slate-400 font-medium">Create your owner account to manage <strong>{selectedBusiness.name}</strong>.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="password" 
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-[#2CA6A4] text-white font-black rounded-2xl hover:bg-[#1e7a78] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#2CA6A4]/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Submit Claim Request</>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black poppins-bold uppercase tracking-tight mb-4 text-[#1A2B4B]">Request Submitted!</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                  Thank you for claiming <strong>{selectedBusiness.name}</strong>. Our team will review your request and verify your ownership. You'll receive an email once approved.
                </p>
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#1A2B4B] text-white font-black rounded-2xl hover:bg-[#2A3B5B] transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-200"
                >
                  Back to Home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Need help? <a href="#" className="text-[#2CA6A4] hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
