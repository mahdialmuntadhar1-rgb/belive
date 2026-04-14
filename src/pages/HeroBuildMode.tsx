// BUILD MODE ONLY - Temporary local editor for Hero section
// This is a development tool for visual editing before pushing to GitHub
// Uses localStorage for persistence - no backend, no auth, no Supabase
// DELETE THIS FILE after production deployment

import { useState, useEffect, ChangeEvent } from 'react';

interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
}

const STORAGE_KEY = 'hero-build-mode-data';

export default function HeroBuildMode() {
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'Find the Best in Iraq',
    subtitle: 'Discover local businesses, reviews, and updates.',
    buttonText: 'Explore Now',
    imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop'
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHeroData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load hero data from localStorage');
      }
    }
  }, []);

  // Save to localStorage on change
  const saveToLocalStorage = (newData: HeroData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showToast('Uploading...', 'info');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert to base64 for localStorage storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newData = { ...heroData, imageUrl: base64 };
        setHeroData(newData);
        saveToLocalStorage(newData);
        setUploading(false);
        showToast('✓ Saved locally', 'success');
      };
      reader.onerror = () => {
        setUploading(false);
        showToast('Upload failed', 'error');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      showToast('Upload failed', 'error');
    }
  };

  const handleRemoveImage = () => {
    const newData = { ...heroData, imageUrl: '' };
    setHeroData(newData);
    saveToLocalStorage(newData);
    showToast('✓ Saved locally', 'success');
  };

  const handleTextChange = (field: keyof HeroData, value: string) => {
    const newData = { ...heroData, [field]: value };
    setHeroData(newData);
    saveToLocalStorage(newData);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    const defaultData: HeroData = {
      title: 'Find the Best in Iraq',
      subtitle: 'Discover local businesses, reviews, and updates.',
      buttonText: 'Explore Now',
      imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop'
    };
    setHeroData(defaultData);
    showToast('✓ Reset to default', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Warning Banner */}
        <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 mb-8">
          <h1 className="text-orange-800 font-bold text-lg mb-1">⚠️ BUILD MODE ONLY</h1>
          <p className="text-orange-700 text-sm">This is a temporary local editor for development. Data is stored in localStorage only.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Hero Editor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => handleTextChange('subtitle', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={heroData.buttonText}
                  onChange={(e) => handleTextChange('buttonText', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleRemoveImage}
                    disabled={!heroData.imageUrl || uploading}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Live Preview</h2>
            
            <div className="relative overflow-hidden rounded-lg bg-slate-900 p-8 text-white min-h-[300px]">
              {heroData.imageUrl && (
                <div className="absolute inset-0 opacity-40">
                  <img src={heroData.imageUrl} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent" />
                </div>
              )}
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">{heroData.title}</h1>
                <p className="text-sm text-gray-300 mb-4">{heroData.subtitle}</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {heroData.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-up ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
