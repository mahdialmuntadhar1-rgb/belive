/**
 * // BUILD MODE ONLY
 * TypeScript types for the Build Mode editor - Phase 1.
 */

export interface HeroSlide {
  id: string;
  image: string; // base64 or URL
}

export interface FeedItem {
  id: string;
  image: string;
  caption?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface BuildModeData {
  slides: HeroSlide[];
  feedItems: FeedItem[];
  lastUpdated?: string;
}

export type SlideEditPayload = Partial<Omit<HeroSlide, 'id'>>;
export type Direction = 'up' | 'down';
