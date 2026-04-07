import FeedComponent from '@/components/home/FeedComponent';
import type { Business } from '@/lib/supabase';

interface HomeSocialSectionProps {
  businesses: Business[];
  loading: boolean;
}

export default function HomeSocialSection({ businesses, loading }: HomeSocialSectionProps) {
  return <FeedComponent businesses={businesses} loading={loading} />;
}
