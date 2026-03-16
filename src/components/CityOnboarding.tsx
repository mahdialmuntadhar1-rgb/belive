import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CITIES, COLORS } from '../constants';
import { Language } from '../types';

interface CityOnboardingProps {
  onComplete: (city: string, lang: Language) => void;
}

const CityOnboarding: React.FC<CityOnboardingProps> = ({ onComplete }) => {
  const [lang, setLang] = useState<Language>('en');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  const texts = {
    tagline: {
      en: 'Where do you want to discover?',
      ar: 'أين تريد أن تكتشف؟',
      ku: 'دەتەوێت لەکوێ بدۆزیتەوە؟',
    },
    exploreAll: {
      en: "I'll explore all of Iraq",
      ar: 'سأستكشف كل العراق',
      ku: 'هەموو عێراق دەگەڕێم',
    },
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    setTimeout(() => {
      onComplete(cityId, lang);
    }, 400);
  };

  const handleExploreAll = () => {
    onComplete('all', lang);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto"
      style={{ backgroundColor: COLORS.darkNavy }}
    >
      <div className="w-full max-w-md flex flex-col items-center space-y-8 py-12">
        {/* Logo & Tagline */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-black tracking-tighter"
            style={{ color: COLORS.gold }}
          >
            IRAQ COMPASS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium"
            style={{ color: COLORS.cream }}
          >
            {texts.tagline[lang]}
          </motion.p>
        </div>

        {/* Language Selector */}
        <div className="flex space-x-2 bg-white/5 p-1 rounded-full border border-white/10">
          {(['en', 'ar', 'ku'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                lang === l ? 'shadow-lg' : 'opacity-40 hover:opacity-100'
              }`}
              style={{
                backgroundColor: lang === l ? COLORS.gold : 'transparent',
                color: lang === l ? COLORS.darkNavy : COLORS.cream,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {CITIES.map((city) => (
            <motion.button
              key={city.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={
                selectedCityId === city.id
                  ? { scale: 1.1, boxShadow: `0 0 20px ${COLORS.gold}` }
                  : {}
              }
              onClick={() => handleCitySelect(city.id)}
              className="flex flex-col items-center p-6 rounded-2xl border transition-all text-center space-y-2"
              style={{
                backgroundColor: COLORS.navyMid,
                borderColor: selectedCityId === city.id ? COLORS.gold : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-3xl">{city.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-lg" style={{ color: COLORS.cream }}>
                  {city.name[lang]}
                </span>
                <span className="text-xs opacity-40" style={{ color: COLORS.cream }}>
                  {city.governorate[lang]}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Explore All Link */}
        <button
          onClick={handleExploreAll}
          className="text-sm font-bold underline transition-all hover:opacity-70"
          style={{ color: COLORS.gold }}
        >
          {texts.exploreAll[lang]}
        </button>
      </div>
    </motion.div>
  );
};

export default CityOnboarding;
