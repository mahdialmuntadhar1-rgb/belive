import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import LocationFilter from "@/components/home/LocationFilter";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrendingSection from "@/components/home/TrendingSection";
import FeedComponent from "@/components/home/FeedComponent";
import { useHomeStore } from "@/stores/homeStore";
import type { Business } from "@/lib/supabase";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedGovernorate, selectedCity } = useHomeStore();

  useEffect(() => {
    // Simulate loading businesses from Supabase
    // This will be replaced with actual Supabase query
    const loadBusinesses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual Supabase fetch
        const mockData = generateMockBusinesses();
        setBusinesses(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [selectedGovernorate, selectedCity]);

  return (
    <div className="min-h-screen bg-humus-off-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#004E89] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold text-humus-dark hidden sm:block poppins-bold">HUMUS</h1>
          </div>

          {/* Search Bar - Minimal */}
          <div className="flex-1 mx-4 max-w-xs hidden md:block">
            <input
              type="text"
              placeholder="Search businesses..."
              className="w-full px-3 py-2 text-sm border-2 border-humus-deep-blue rounded-lg focus:outline-none focus:border-humus-cyan transition-all"
            />
          </div>

          {/* Account Icon */}
          <button className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
            <span className="text-gray-600">👤</span>
          </button>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <HeroSection businesses={businesses} />

      {/* Location Filter Bar */}
      <LocationFilter />

      {/* Category Chips Grid */}
      <CategoryGrid />

      {/* Trending Section */}
      {businesses.length > 0 && (
        <TrendingSection businesses={businesses.filter(b => b.isFeatured).slice(0, 5)} />
      )}

      {/* Main Feed */}
      <div className="max-w-full">
        <FeedComponent businesses={businesses} loading={loading} />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">
            <div>
              <h3 className="font-bold text-humus-dark mb-4 poppins-semibold">HUMUS</h3>
              <p className="text-xs leading-relaxed">Iraq's most comprehensive business directory. Connecting you with the best local services across all governorates.</p>
            </div>
            <div>
              <p className="font-bold text-humus-dark mb-4 poppins-semibold">Company</p>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-humus-coral transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-humus-dark mb-4 poppins-semibold">Support</p>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-humus-coral transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Safety Center</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-humus-dark mb-4 poppins-semibold">Legal</p>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-humus-coral transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-humus-coral transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} HUMUS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mock data generator
function generateMockBusinesses(): Business[] {
  return [
    {
      id: "1",
      name: "Abu Ali Restaurant",
      nameAr: "مطعم أبو علي",
      nameKu: "Restoran Abu Ali",
      category: "dining_cuisine",
      governorate: "Baghdad",
      city: "Kadhimiya",
      address: "Baghdad, Kadhimiya",
      phone: "+9647701234567",
      rating: 4.8,
      reviewCount: 120,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1504674900759-b58551b1efc8?w=400&h=300&fit=crop",
      website: "https://abuali.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Coffee House",
      nameAr: "كافية",
      nameKu: "Kava House",
      category: "cafe_coffee",
      governorate: "Baghdad",
      city: "Adhamiyah",
      address: "Baghdad, Adhamiyah",
      phone: "+9647702234567",
      rating: 4.5,
      reviewCount: 85,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Clinic Dr. Fatima",
      nameAr: "عيادة د. فاطمة",
      nameKu: "Klinika Dr. Fatima",
      category: "clinics",
      governorate: "Baghdad",
      city: "Adhamiyah",
      address: "Baghdad, Adhamiyah",
      phone: "+9647703234567",
      rating: 4.9,
      reviewCount: 89,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1576091160550-112173f31c74?w=400&h=300&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      name: "Fashion Store Erbil",
      nameAr: "متجر الموضة",
      nameKu: "Fashion Store",
      category: "shopping_retail",
      governorate: "Erbil",
      city: "Erbil Center",
      address: "Erbil, City Center",
      phone: "+9647704234567",
      rating: 4.3,
      reviewCount: 45,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1555529669-e69e7fa0ba9b?w=400&h=300&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "5",
      name: "Basra Tech Services",
      nameAr: "خدمات تقنية البصرة",
      nameKu: "Basra Tech Services",
      category: "business_services",
      governorate: "Basra",
      city: "Basra City",
      address: "Basra, City Center",
      phone: "+9647705234567",
      rating: 4.6,
      reviewCount: 120,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}
