/**
 * // BUILD MODE ONLY
 * TypeScript types for the Build Mode editor - Phase 1.
 */

export interface HeroSlide {
  id: string;
  image: string; // base64 or URL
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface BuildModeData {
  slides: HeroSlide[];
  lastUpdated?: string;
}

export type SlideEditPayload = Partial<Omit<HeroSlide, 'id'>>;
export type Direction = 'up' | 'down';
