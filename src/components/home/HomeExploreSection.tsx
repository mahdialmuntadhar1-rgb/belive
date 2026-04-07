import LocationFilter from '@/components/home/LocationFilter';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrendingSection from '@/components/home/TrendingSection';
import CategoryBusinessSections from '@/components/home/CategoryBusinessSections';
import type { Business } from '@/lib/supabase';

interface HomeExploreSectionProps {
  businesses: Business[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onBusinessClick: (business: Business) => void;
}

export default function HomeExploreSection({
  businesses,
  loading,
  hasMore,
  totalCount,
  onLoadMore,
  onBusinessClick
}: HomeExploreSectionProps) {
  return (
    <div className="space-y-8">
      <LocationFilter businesses={businesses} />
      <CategoryGrid />
      <TrendingSection businesses={businesses} loading={loading} onBusinessClick={onBusinessClick} />
      <div id="business-grid">
        <CategoryBusinessSections
          businesses={businesses}
          loading={loading}
          hasMore={hasMore}
          totalCount={totalCount}
          onLoadMore={onLoadMore}
          onBusinessClick={onBusinessClick}
        />
      </div>
    </div>
  );
}
