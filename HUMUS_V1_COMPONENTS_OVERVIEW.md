# HUMUS Version 1 - Components Overview

This document provides a detailed breakdown of the components built for the HUMUS Version 1 redesign.

## 1. HeroSection.tsx
- **Visuals**: Full-width auto-playing carousel.
- **Content**: Trilingual slogans (English, Arabic, Kurdish) over high-quality background images.
- **Interactions**: Manual navigation via arrows and dot indicators.
- **CTA**: "Explore Now" button to drive user engagement.

## 2. LocationFilter.tsx
- **Visuals**: Horizontal bar with dropdown selectors.
- **Content**: List of 10 Iraqi governorates with dynamic city lists.
- **Interactions**: Selecting a governorate filters the available cities. Selection is persisted in local storage.
- **Impact**: Directly updates the business listings shown in the feed.

## 3. CategoryGrid.tsx
- **Visuals**: Grid of icon-based chips.
- **Content**: 9 core business categories (Food, Shopping, Health, etc.).
- **Interactions**: Toggle selection to filter the feed. "Show All" expands the grid.
- **Design**: Uses soft background colors and emoji icons for a friendly UI.

## 4. TrendingSection.tsx
- **Visuals**: Horizontal scrolling carousel of cards.
- **Content**: Featured businesses with ratings, categories, and addresses.
- **Interactions**: Smooth horizontal scroll with navigation buttons.
- **Features**: "Featured" badge and quick contact buttons (Call, WhatsApp).

## 5. FeedComponent.tsx
- **Visuals**: Vertical stack of social-style posts.
- **Content**: Mixed "Announcements" (updates with images) and "Listings" (business cards).
- **Interactions**: Like, Comment, and Share buttons. Direct contact buttons for immediate conversion.
- **Design**: Clean whitespace, rounded corners, and clear hierarchy.

## 6. HomePage.tsx
- **Role**: The main container that orchestrates all components.
- **Features**: Sticky header with search and account access, responsive layout with a sidebar on desktop, and a mobile-specific bottom navigation bar.
- **Data**: Manages the mock data and provides the structure for Supabase integration.

---

**Design Philosophy**: Social-first, mobile-optimized, and trilingual-ready.
