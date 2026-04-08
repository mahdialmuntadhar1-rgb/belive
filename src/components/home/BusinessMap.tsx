import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { Star, MapPin, Phone, ArrowRight } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface BusinessMapProps {
  businesses: Business[];
  onBusinessClick: (business: Business) => void;
}

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function BusinessMap({ businesses, onBusinessClick }: BusinessMapProps) {
  const { language } = useHomeStore();
  
  // Default center (Iraq)
  const defaultCenter: [number, number] = [33.3152, 44.3661]; // Baghdad
  const [center, setCenter] = React.useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = React.useState(6);

  // Filter businesses that have coordinates or mock them for demo
  const businessesWithCoords = businesses.map((b, idx) => {
    if (b.lat && b.lng) return b;
    // Mock coordinates around Baghdad for demo purposes if missing
    // In a real app, these would come from the DB
    const lat = 33.3152 + (Math.random() - 0.5) * 0.5;
    const lng = 44.3661 + (Math.random() - 0.5) * 0.5;
    return { ...b, lat, lng };
  });

  useEffect(() => {
    if (businessesWithCoords.length > 0 && businessesWithCoords[0].lat && businessesWithCoords[0].lng) {
      setCenter([businessesWithCoords[0].lat, businessesWithCoords[0].lng]);
      setZoom(12);
    }
  }, [businesses]);

  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden border border-slate-100 shadow-premium relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businessesWithCoords.map((business) => (
          <Marker 
            key={business.id} 
            position={[business.lat!, business.lng!]}
          >
            <Popup className="business-popup">
              <div className="p-2 min-w-[200px] dir-rtl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-bg-dark text-sm leading-tight">
                      {language === 'ar' ? (business.nameAr || business.name) : business.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                      <Star className="w-3 h-3 text-secondary fill-secondary" />
                      <span>{business.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">
                  {business.address}
                </p>

                <button 
                  onClick={() => onBusinessClick(business)}
                  className="w-full py-2 bg-bg-dark text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all"
                >
                  <span>{language === 'ar' ? 'عرض الملف' : 'View Profile'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
