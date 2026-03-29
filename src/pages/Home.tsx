import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Search, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CityGrid } from '../components/CityGrid';
import { supabase } from '../lib/supabase';

interface Business {
  id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
  category: string;
  city: string;
  address: string;
  status: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Restaurant', label: 'Restaurants' },
  { id: 'Hospital', label: 'Hospitals' },
  { id: 'Retail', label: 'Retail' },
  { id: 'Car Dealer', label: 'Automotive' },
  { id: 'Pharmacy', label: 'Pharmacy' },
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadBusinesses() {
      setLoading(true);
      let query = supabase.from('businesses').select('*');
      if (selectedCity) query = query.eq('city', selectedCity);
      if (selectedCat !== 'all') query = query.eq('category', selectedCat);

      const { data } = await query;
      if (active) {
        setBusinesses((data ?? []) as Business[]);
        setLoading(false);
      }
    }
    loadBusinesses();
    return () => {
      active = false;
    };
  }, [selectedCity, selectedCat]);

  const filteredBusinesses = useMemo(
    () =>
      businesses.filter((b) => {
        const q = searchTerm.toLowerCase();
        return (b.name_en || '').toLowerCase().includes(q) || (b.name_ar || '').includes(searchTerm) || (b.name_ku || '').includes(searchTerm);
      }),
    [businesses, searchTerm],
  );

  return (
    <div className="min-h-screen pb-20 text-white">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-vibrant-purple rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(188,19,254,0.5)]">
            <MapPin className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-glow">IRAQ COMPASS</h1>
        </div>
        <Link to="/admin" className="glass px-4 py-2 rounded-full text-sm font-medium hover:bg-vibrant-purple transition-colors">
          Admin Portal
        </Link>
      </header>

      <main className="max-w-7xl mx-auto mt-8">
        <AnimatePresence mode="wait">
          {!selectedCity ? (
            <motion.div key="gov-grid" className="space-y-8">
              <div className="text-center space-y-4 px-6">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase">Select <span className="text-vibrant-purple">City</span></h2>
              </div>
              <CityGrid onSelect={setSelectedCity} agentStatuses={{}} />
            </motion.div>
          ) : (
            <motion.div key="drill-down" className="space-y-8 px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCity(null)} className="p-3 glass rounded-full hover:bg-vibrant-purple transition-colors"><ArrowLeft size={20} /></button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedCity}</h2>
                </div>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input type="text" placeholder="Search businesses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full glass pl-12 pr-4 py-3 rounded-2xl" />
                </div>
              </div>

              <div className="flex overflow-x-auto gap-4 py-4 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className="flex-none px-6 py-2 rounded-full border">
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="glass rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead><tr><th className="px-8 py-5">Business Name</th><th className="px-8 py-5">Category</th><th className="px-8 py-5">Status</th></tr></thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="px-8 py-10">Loading...</td></tr>
                    ) : filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5">
                          <td className="px-8 py-6"><div className="font-bold text-lg">{b.name_en || 'Unnamed'}</div><div className="text-xs text-white/40">{b.address}</div></td>
                          <td className="px-8 py-6">{b.category}</td>
                          <td className="px-8 py-6">{b.status === 'verified' ? <><CheckCircle2 size={16} className="inline" /> Verified</> : <><Clock size={16} className="inline" /> {b.status || 'Pending'}</>}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="px-8 py-20 text-center text-white/20">No businesses found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
