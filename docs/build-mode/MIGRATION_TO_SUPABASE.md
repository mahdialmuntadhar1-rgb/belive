# Migration Guide: Build Mode → Supabase Production System
## From localStorage Editor to Real Backend

This guide explains how to migrate from the temporary Build Mode editor (localStorage) to a production Supabase database when you're ready to deploy.

---

## Overview

**Current State (Build Mode):**
- Data stored in browser localStorage
- Single-user, no authentication
- Temporary editing system
- Data lost when browser is cleared
- Designed for AI Studio build phase

**Target State (Supabase Production):**
- Data stored in Supabase PostgreSQL database
- Admin authentication (optional, but recommended)
- Real CMS backend
- Persistent data
- Scalable to multiple users/admins

---

## Phase Timing

**Do NOT migrate until:**
- ✅ Build Mode editor is complete and tested
- ✅ You've settled on the final hero design
- ✅ You have a Supabase project set up
- ✅ You're ready to deploy to production

**Do migrate when:**
- ✅ Hero editor works well locally
- ✅ You want to keep edits permanently
- ✅ You want real admin access control
- ✅ You're ready to push to Vercel with backend

---

## Step-by-Step Migration

### Step 1: Set Up Supabase Project

1. Create a new Supabase project (or use existing)
2. Copy your Supabase URL and anon key
3. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

---

### Step 2: Create Database Tables

Run these SQL migrations in Supabase SQL editor:

#### Table 1: hero_slides
```sql
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  image_url TEXT,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  button_text TEXT NOT NULL,
  button_link TEXT,
  slide_order INT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE
);

CREATE INDEX hero_slides_order ON hero_slides(slide_order);
```

#### Table 2: hero_edits_history (Optional - for audit trail)
```sql
CREATE TABLE hero_edits_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  slide_id UUID REFERENCES hero_slides(id) ON DELETE CASCADE,
  edited_by TEXT NOT NULL,
  changes JSONB NOT NULL,
  notes TEXT
);
```

#### Set Up RLS (Row-Level Security)
```sql
-- Allow anyone to view published slides
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero slides are viewable by everyone"
  ON hero_slides FOR SELECT USING (is_published = TRUE);

-- Only authenticated admins can edit
CREATE POLICY "Only authenticated admins can edit hero slides"
  ON hero_slides FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

### Step 3: Migrate Data from localStorage to Supabase

#### Option A: Manual Migration (Recommended for first time)
1. Open browser DevTools → Application → LocalStorage
2. Find "belive_hero_build_mode" key
3. Copy the JSON value
4. In Supabase dashboard, insert rows manually
5. Or use Supabase API client to bulk insert

#### Option B: Automated Migration Script
Create `scripts/migrate-hero-to-supabase.ts`:

```typescript
// BUILD MODE MIGRATION SCRIPT - Run once, then delete
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateHeroData() {
  // Get data from localStorage (client-side, you'll need to export this)
  const localData = JSON.parse(
    localStorage.getItem('belive_hero_build_mode') || '{}'
  );

  if (!localData.slides || localData.slides.length === 0) {
    console.log('No slides to migrate');
    return;
  }

  // Transform and insert into Supabase
  const slides = localData.slides.map((slide: any, index: number) => ({
    image_url: slide.image, // base64 or URL
    title: slide.title,
    subtitle: slide.subtitle,
    button_text: slide.buttonText,
    button_link: slide.buttonLink,
    slide_order: index + 1,
    is_published: true,
  }));

  const { data, error } = await supabase
    .from('hero_slides')
    .insert(slides)
    .select();

  if (error) {
    console.error('Migration error:', error);
  } else {
    console.log('Migrated slides:', data);
  }
}

// Run: npx ts-node scripts/migrate-hero-to-supabase.ts
```

---

### Step 4: Update useBuildMode → useSuperbaseHero

Replace the custom hook with Supabase client:

#### Old: `hooks/useBuildMode.ts`
```typescript
// BUILD MODE ONLY - localStorage based
export function useBuildMode() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  
  useEffect(() => {
    const data = localStorage.getItem('belive_hero_build_mode');
    if (data) {
      const parsed = JSON.parse(data);
      setHeroSlides(parsed.slides);
    }
  }, []);
  
  // ... save to localStorage
}
```

#### New: `hooks/useSuperbaseHero.ts`
```typescript
// PRODUCTION - Supabase based
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link?: string;
  slide_order: number;
  is_published: boolean;
}

export function useSuperbaseHero() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch slides on mount
  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_published', true)
        .order('slide_order', { ascending: true });

      if (error) throw error;
      setHeroSlides(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addSlide(slide: Omit<HeroSlide, 'id'>) {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select();

    if (error) {
      setError(error.message);
    } else {
      await fetchSlides();
    }
  }

  async function updateSlide(id: string, updates: Partial<HeroSlide>) {
    const { error } = await supabase
      .from('hero_slides')
      .update(updates)
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await fetchSlides();
    }
  }

  async function deleteSlide(id: string) {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await fetchSlides();
    }
  }

  return {
    heroSlides,
    loading,
    error,
    addSlide,
    updateSlide,
    deleteSlide,
    refetch: fetchSlides,
  };
}
```

---

### Step 5: Update Hero Component

Replace localStorage reading with Supabase hook:

#### Old: `components/Hero.tsx`
```typescript
export function Hero({ defaultSlides }: HeroProps) {
  const { buildModeEnabled, heroSlides } = useBuildMode();
  
  const slides = buildModeEnabled && heroSlides.length > 0 
    ? heroSlides 
    : defaultSlides;
  
  return <Carousel slides={slides} />;
}
```

#### New: `components/Hero.tsx`
```typescript
export function Hero({ defaultSlides }: HeroProps) {
  const { heroSlides, loading } = useSuperbaseHero();
  
  // Use Supabase slides if available, otherwise default
  const slides = heroSlides.length > 0 ? heroSlides : defaultSlides;
  
  if (loading) {
    return <LoadingSpinner />; // Or show default while loading
  }
  
  return <Carousel slides={slides} />;
}
```

---

### Step 6: Replace Build Mode Editor with Admin Dashboard

You now have options:

#### Option A: Minimal Admin Panel (Recommended)
Keep the same UI but connect to Supabase:

```typescript
// components/AdminHeroEditor/AdminHeroEditor.tsx
import { useSuperbaseHero } from '@/hooks/useSuperbaseHero';

export function AdminHeroEditor() {
  const { heroSlides, addSlide, updateSlide, deleteSlide } = useSuperbaseHero();
  
  // Same UI as before, but now saves to Supabase instead of localStorage
  // No major refactoring needed
}
```

#### Option B: Supabase Realtime (Advanced)
Add live updates across multiple admins:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('hero_slides_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'hero_slides'
    }, (payload) => {
      console.log('Change received!', payload);
      fetchSlides(); // Refetch to stay in sync
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

### Step 7: Storage for Large Images

If base64 images in localStorage are too large, use Supabase Storage:

#### Create Storage Bucket
1. Supabase Dashboard → Storage
2. Create bucket: "hero-images" (public)
3. Set bucket to public (for CDN access)

#### Update Image Upload Logic
```typescript
async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('hero-images')
    .upload(fileName, file);

  if (error) throw error;

  // Return public URL
  return supabase.storage
    .from('hero-images')
    .getPublicUrl(data.path).data.publicUrl;
}
```

Then save URL to database instead of base64.

---

### Step 8: Add Admin Authentication (Optional)

For real production, add auth:

#### Create Auth Policy
```sql
-- Only authenticated users can edit
CREATE POLICY "Authenticated admins can edit"
  ON hero_slides FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

#### Protect Admin Routes
```typescript
// middleware.ts or app/api/admin/route.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if accessing admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

---

### Step 9: Remove Build Mode Code

Once Supabase is working:

#### Delete Files
- `hooks/useBuildMode.ts` ✓
- `components/BuildModeEditor/` ✓ (entire folder)
- `types/buildMode.ts` ✓

#### Remove from Navbar
```typescript
// Remove this line
<BuildModeToggle isEnabled={buildModeEnabled} onClick={toggleBuildMode} />
```

#### Clean Up Imports
Remove all "BUILD MODE ONLY" imports and code.

---

### Step 10: Test & Deploy

1. **Local Testing:**
   - Test hero loading from Supabase
   - Test admin editor (if added)
   - Test image uploads (if using Storage)

2. **Commit to GitHub:**
   - Remove all BUILD MODE code
   - Commit Supabase migration

3. **Deploy to Vercel:**
   - Add environment variables (Supabase keys)
   - Verify .env.local is in .gitignore
   - Deploy

---

## Data Comparison

| Feature | Build Mode | Supabase |
|---------|-----------|----------|
| Storage | localStorage | PostgreSQL database |
| Persistence | Browser only | Permanent |
| Multi-user | No | Yes (with auth) |
| Images | base64 in localStorage | URLs (via Storage bucket) |
| Scalability | Limited (5MB) | Unlimited |
| Backup | None | Automatic |
| Access Control | None | RLS policies |
| Cost | Free | Free tier + optional paid |

---

## Troubleshooting Migration

### Issue: Images are broken after migration
**Solution:** If using base64, they should still work. If using URLs, verify bucket is public and images exist.

### Issue: Build Mode data doesn't appear in Supabase
**Solution:** Verify migration script ran. Check Supabase dashboard to confirm data was inserted.

### Issue: Page loads slower with Supabase
**Solution:** Add loading state in Hero component. Consider caching with `stale-while-revalidate`.

### Issue: Changes don't update across tabs
**Solution:** Add Realtime subscription or use polling `setInterval(() => fetchSlides(), 5000)`.

---

## Future Enhancements (Post-Migration)

- ✅ Multi-language support (add language field to slides)
- ✅ Scheduled publishing (add published_at timestamp)
- ✅ Slide analytics (track views, clicks)
- ✅ Multiple hero configurations (A/B testing)
- ✅ Backup/restore functionality
- ✅ Webhook integrations (publish events)

---

## File Structure After Migration

```
src/
├── components/
│   ├── Hero.tsx (MODIFIED - uses useSuperbaseHero)
│   ├── Navbar.tsx (MODIFIED - removed BuildModeToggle)
│   ├── AdminHeroEditor/ (NEW - optional)
│   │   ├── AdminHeroEditor.tsx
│   │   ├── HeroSlideEditor.tsx
│   │   └── ImageUploader.tsx
│   └── ...
├── hooks/
│   ├── useSuperbaseHero.ts (NEW)
│   └── ... (useBuildMode.ts DELETED)
├── lib/
│   ├── supabase.ts (NEW - client config)
│   └── ...
├── types/
│   ├── hero.ts (NEW - replaces buildMode.ts)
│   └── ... (buildMode.ts DELETED)
└── ...
```

---

## Completion Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables added to Vercel
- [ ] Database tables created (hero_slides, hero_edits_history)
- [ ] Data migrated from localStorage
- [ ] useSuperbaseHero hook implemented
- [ ] Hero component updated to use Supabase
- [ ] Image upload connected to Storage bucket (if needed)
- [ ] Admin authentication set up (if needed)
- [ ] Build mode code deleted
- [ ] Local testing passed
- [ ] Deployed to Vercel successfully
- [ ] Images loading correctly in production
- [ ] No console errors in production

---

## Support

For Supabase documentation, visit: https://supabase.com/docs

For Next.js + Supabase integration: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
