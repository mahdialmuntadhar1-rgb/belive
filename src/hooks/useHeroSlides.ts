import { useState, useEffect } from 'react';
import { heroService, HeroSlide } from '@/lib/heroService';

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await heroService.getAllSlides(); // Admins see all, public see active
      setSlides(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return { slides, loading, error, refresh: fetchSlides, setSlides };
}
