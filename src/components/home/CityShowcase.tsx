import { motion } from "motion/react";
import { MapPin, ChevronRight } from "lucide-react";
import { useHomeStore } from "@/stores/homeStore";

const cities = [
  {
    name: { en: "Baghdad", ar: "بغداد", ku: "بەغدا" },
    image: "https://images.unsplash.com/photo-1545562083-a600704fa487?auto=format&fit=crop&q=80&w=800",
    count: "4.2k+",
    color: "from-primary/20 to-primary/5"
  },
  {
    name: { en: "Erbil", ar: "أربيل", ku: "هەولێر" },
    image: "https://images.unsplash.com/photo-1589182337358-2cb63acfa18b?auto=format&fit=crop&q=80&w=800",
    count: "2.8k+",
    color: "from-secondary/20 to-secondary/5"
  },
  {
    name: { en: "Basra", ar: "البصرة", ku: "بەسرە" },
    image: "https://images.unsplash.com/photo-1623057000739-386c80b24d78?auto=format&fit=crop&q=80&w=800",
    count: "1.5k+",
    color: "from-accent/20 to-accent/5"
  },
  {
    name: { en: "Sulaymaniyah", ar: "السليمانية", ku: "سلێمانی" },
    image: "https://images.unsplash.com/photo-1605146761889-44a581c327e4?auto=format&fit=crop&q=80&w=800",
    count: "1.9k+",
    color: "from-primary/20 to-primary/5"
  },
  {
    name: { en: "Duhok", ar: "دهوك", ku: "دهۆک" },
    image: "https://images.unsplash.com/photo-1623057000739-386c80b24d78?auto=format&fit=crop&q=80&w=800",
    count: "1.2k+",
    color: "from-secondary/20 to-secondary/5"
  }
];

export default function CityShowcase() {
  const { language } = useHomeStore();

  return (
    <section className="py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-primary rounded-full" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Local Discovery</span>
            </div>
            <h2 className="text-4xl font-black text-text-main poppins-bold tracking-tighter">
              {language === 'ar' ? 'استكشف المدن' : language === 'ku' ? 'شارەکان بگەڕێ' : 'Explore Cities'}
            </h2>
          </div>
          <button className="group flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors">
            {language === 'ar' ? 'عرض الكل' : language === 'ku' ? 'بینینی هەموو' : 'View All Cities'}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4 snap-x">
          {cities.map((city, index) => (
            <motion.div
              key={city.name.en}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[280px] group cursor-pointer snap-start"
            >
              <div className="relative h-[380px] rounded-[40px] overflow-hidden shadow-social group-hover:shadow-2xl transition-all duration-700">
                {/* Background Image */}
                <img
                  src={city.image}
                  alt={city.name.en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlays */}
                <div className={`absolute inset-0 bg-gradient-to-b ${city.color} mix-blend-overlay opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                      {city.count} Places
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white poppins-bold tracking-tight mb-2">
                    {city.name[language as keyof typeof city.name]}
                  </h3>
                  <div className="h-1 w-0 group-hover:w-12 bg-primary transition-all duration-500 rounded-full" />
                </div>

                {/* Glass Badge */}
                <div className="absolute top-6 right-6 glass-dark px-4 py-2 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Explore</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
