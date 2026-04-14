import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Search, CheckCircle2, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useBusinessClaim } from '@/hooks/useBusinessClaim';
import { useHomeStore } from '@/stores/homeStore';

interface BusinessClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

export default function BusinessClaimModal({
  isOpen,
  onClose,
  onClaimSuccess,
}: BusinessClaimModalProps) {
  const { language } = useHomeStore();
  const { searchBusinessesByPhone, claimBusiness, clearSearch, loading, error, matches } =
    useBusinessClaim();

  const [phoneInput, setPhoneInput] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [claimingBusinessId, setClaimingBusinessId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const translations = {
    title: {
      en: 'Claim Your Business',
      ar: 'المطالبة بعملك التجاري',
      ku: 'داوای کارەکەت بکە',
    },
    description: {
      en: 'Enter your business phone number to find and claim your business listing.',
      ar: 'أدخل رقم هاتفك التجاري للعثور على تصنيفك والمطالبة به.',
      ku: 'ژمارەی تێلەفۆنی کارەکەت بنووسە بۆ دۆزینەوە و داوای فێڵێسەتەکەت.',
    },
    phoneLabel: {
      en: 'Business Phone Number',
      ar: 'رقم هاتف العمل',
      ku: 'ژمارەی تێلەفۆنی کار',
    },
    phonePlaceholder: {
      en: 'e.g., 07508891221 or +9647508891221',
      ar: 'مثال: 07508891221 أو +9647508891221',
      ku: 'نموونە: 07508891221 یا +9647508891221',
    },
    searchButton: {
      en: 'Search for Business',
      ar: 'البحث عن العمل',
      ku: 'گەڕان بۆ کار',
    },
    searchingButton: {
      en: 'Searching...',
      ar: 'جاري البحث...',
      ku: 'گەڕان...',
    },
    noResultsTitle: {
      en: 'No Business Found',
      ar: 'لم يتم العثور على عمل',
      ku: 'هیچ کار نەدۆزرایەوە',
    },
    noResultsDesc: {
      en: 'We could not find a business with that phone number. Please check and try again.',
      ar: 'لم نتمكن من العثور على عمل برقم هاتف. يرجى التحقق والمحاولة مرة أخرى.',
      ku: 'ناتوانمان بیسترا بکاریان دۆزینەوە. تکایە بپشک و دووبارە هەوڵبدەرەوە.',
    },
    foundBusinesses: {
      en: 'Found Businesses',
      ar: 'الأعمال المكتشفة',
      ku: 'کارە دۆزراوەکان',
    },
    selectBusiness: {
      en: 'Select the business you want to claim:',
      ar: 'اختر العمل الذي تريد المطالبة به:',
      ku: 'کاری ئەو داوای کردن دەتەوێت هەڵبژێرە:',
    },
    claimButton: {
      en: 'Claim This Business',
      ar: 'المطالبة بهذا العمل',
      ku: 'داوای ئەم کارە بکە',
    },
    claimingButton: {
      en: 'Claiming...',
      ar: 'جاري المطالبة...',
      ku: 'داواکردن...',
    },
    claimSuccessTitle: {
      en: 'Business Claimed Successfully!',
      ar: 'تمت المطالبة بالعمل بنجاح!',
      ku: 'بە سەرکەوتوویی داوای کاری کرا!',
    },
    claimSuccessDesc: {
      en: 'You can now manage your business profile and post updates.',
      ar: 'يمكنك الآن إدارة ملف عملك ونشر التحديثات.',
      ku: 'ئێستا دەتوانی پرۆفایلی کارەکەت بەڕێوەبێر و نوێکارییەکان بڵاو بکەیت.',
    },
    newSearch: {
      en: 'Search Another Business',
      ar: 'البحث عن عمل آخر',
      ku: 'گەڕان بۆ کاری دیکە',
    },
    alreadyClaimed: {
      en: 'This business is already claimed',
      ar: 'تمت المطالبة بهذا العمل بالفعل',
      ku: 'پێشتر داوای ئەم کارە کرا',
    },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchBusinessesByPhone(phoneInput);
  };

  const handleClaim = async (businessId: string) => {
    setClaimingBusinessId(businessId);
    const success = await claimBusiness(businessId);
    if (success) {
      setClaimSuccess(true);
      setPhoneInput('');
      setSelectedBusinessId(null);
      setTimeout(() => {
        if (onClaimSuccess) {
          onClaimSuccess();
        }
        onClose();
      }, 2000);
    }
    setClaimingBusinessId(null);
  };

  const handleNewSearch = () => {
    setPhoneInput('');
    setSelectedBusinessId(null);
    clearSearch();
    setClaimSuccess(false);
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
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F7F9] transition-colors text-[#6B7280] z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
              {!claimSuccess ? (
                <>
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2 text-center">
                      {translations.title[language]}
                    </h2>
                    <p className="text-sm text-[#6B7280] text-center">
                      {translations.description[language]}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600 font-bold">{error}</p>
                    </motion.div>
                  )}

                  {matches.length === 0 && !loading && !claimSuccess ? (
                    <form onSubmit={handleSearch} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-[#2B2F33] uppercase tracking-[0.3em] mb-2">
                          {translations.phoneLabel[language]}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder={translations.phonePlaceholder[language]}
                            className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-primary rounded-2xl focus:outline-none transition-all text-sm"
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !phoneInput.trim()}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {translations.searchingButton[language]}
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            {translations.searchButton[language]}
                          </>
                        )}
                      </button>
                    </form>
                  ) : null}

                  {matches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-xs font-black text-[#2B2F33] uppercase tracking-[0.3em] mb-4">
                          {translations.foundBusinesses[language]} ({matches.length})
                        </p>
                        <p className="text-sm text-[#6B7280] mb-4">{translations.selectBusiness[language]}</p>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {matches.map((business) => (
                          <motion.div
                            key={business.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                              selectedBusinessId === business.id
                                ? 'border-primary bg-primary/5'
                                : 'border-[#E5E7EB] hover:border-primary'
                            }`}
                            onClick={() => setSelectedBusinessId(business.id)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#2B2F33] truncate">{business.name}</h4>
                                {business.nameAr && (
                                  <p className="text-xs text-[#6B7280] truncate">{business.nameAr}</p>
                                )}
                                <p className="text-[11px] text-[#9CA3AF] mt-1">
                                  {business.phone}
                                </p>
                                <p className="text-[11px] text-[#9CA3AF]">
                                  {business.city}, {business.governorate}
                                </p>
                              </div>
                              {business.ownerId && (
                                <div className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-lg whitespace-nowrap">
                                  {translations.alreadyClaimed[language]}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {selectedBusinessId && !claimingBusinessId && (
                        <button
                          onClick={() => handleClaim(selectedBusinessId)}
                          disabled={loading || !selectedBusinessId}
                          className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                          {claimingBusinessId === selectedBusinessId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {translations.claimingButton[language]}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              {translations.claimButton[language]}
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={handleNewSearch}
                        className="w-full py-3 bg-white border-2 border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:border-primary hover:text-primary transition-all"
                      >
                        {translations.newSearch[language]}
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
                      {translations.claimSuccessTitle[language]}
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      {translations.claimSuccessDesc[language]}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
