# Admin System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      HomePage.tsx                            │
│                                                               │
│  ┌──────────────────┐              ┌──────────────────────┐ │
│  │ AdminEditToggle  │ ────────────→ │ isAdminEditModeOn   │ │
│  │ (Fixed Top-Right)│              │ (State)             │ │
│  └──────────────────┘              └──────────────────────┘ │
│           │                                  │               │
│           └──────────────┬───────────────────┘               │
│                          │                                    │
│                    ┌─────▼──────────┐                        │
│                    │ AdminPanel     │                        │
│                    │ (Modal)        │                        │
│                    └─────┬──────────┘                        │
│                          │                                    │
│          ┌───────────────┼───────────────┐                   │
│          │               │               │                   │
│   ┌──────▼────┐  ┌──────▼────┐  ┌──────▼────┐              │
│   │   Hero    │  │ Features  │  │  Posts    │              │
│   │  Editor   │  │  Editor   │  │  Editor   │              │
│   └───────────┘  └───────────┘  └───────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
          │
          │ (useAdminMode hook)
          │ (useAdminStorage hook)
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Database                               │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ hero_slides  │ │  features    │ │    posts     │        │
│  │              │ │              │ │              │        │
│  │ ✓ image_url  │ │ ✓ title_*    │ │ ✓ content    │        │
│  │ ✓ title_*    │ │ ✓ desc_*     │ │ ✓ image      │        │
│  │ ✓ subtitle_* │ │ ✓ icon       │ │ ✓ status     │        │
│  │ ✓ cta_text   │ │ ✓ sort_order │ │ ✓ likes      │        │
│  │ ✓ cta_link   │ │ ✓ is_active  │ │ ✓ updated_at │        │
│  │ ✓ sort_order │ │ ✓ created_at │ │ ✓ updated_by │        │
│  │ ✓ updated_at │ │ ✓ updated_at │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  RLS Policies: ✓ Public Read, Admin Write                  │
│  Indexes: ✓ sort_order, status, is_active                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
          │
          │ (Storage)
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Storage (assets bucket)                   │
│                                                               │
│  /hero/          /features/        /posts/                  │
│  ├─ slide1.jpg   ├─ feature1.png   ├─ post1.jpg            │
│  ├─ slide2.jpg   ├─ feature2.png   ├─ post2.jpg            │
│  └─ slide3.jpg   └─ feature3.png   └─ post3.jpg            │
│                                                               │
│  Public URLs: ✓ Readable by all, Writable by admins        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
HomePage
├── AdminEditToggle (Floating Button)
│   └── useAdminMode Hook
│       ├── canEditContent (profile.role === 'admin')
│       └── isEditModeOn (Toggle State)
│
├── AdminPanel (Modal)
│   ├── HeroEditor Tab
│   │   ├── HeroSlide List
│   │   ├── HeroSlide Form
│   │   └── useAdminStorage (Image Upload)
│   │
│   ├── FeaturesEditor Tab
│   │   ├── Feature List
│   │   ├── Feature Form
│   │   └── Emoji Icon Picker
│   │
│   └── PostsEditor Tab
│       ├── Post List
│       ├── Post Form
│       └── useAdminStorage (Image Upload)
│
└── [Other HomePage Components]
    └── (Unaffected by Admin System)
```

---

## Data Flow: Edit Operation

```
User Action
     │
     └─→ Admin clicks "Edit" button on Hero
         │
         └─→ Component renders form with current data
             │
             └─→ Admin modifies fields
                 │
                 ├─→ If image changed:
                 │   │
                 │   └─→ useAdminStorage.uploadImage()
                 │       │
                 │       └─→ supabase.storage.upload()
                 │           │
                 │           └─→ getPublicUrl() → URL
                 │               │
                 │               └─→ Set formData.image_url
                 │
                 └─→ Admin clicks "Save"
                     │
                     └─→ supabase.from('hero_slides').update(formData)
                         │
                         └─→ RLS Policy Check ✓ Admin Role
                             │
                             └─→ Database Updated
                                 │
                                 └─→ Component state updated
                                     │
                                     └─→ UI reflects changes immediately
                                         │
                                         └─→ Close modal
```

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│ Layer 1: Frontend UI Rendering              │
│                                              │
│ if (!canEditContent) return null;           │
│ (Edit button not rendered for non-admins)   │
└─────────────────────────────────────────────┘
                    │
                    │ if bypassed (malicious code)
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Layer 2: Supabase Auth Session              │
│                                              │
│ await supabase.auth.getSession()            │
│ (Must be authenticated user)                │
└─────────────────────────────────────────────┘
                    │
                    │ if spoofed
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Layer 3: Role Check (Frontend)              │
│                                              │
│ if (profile?.role !== 'admin')              │
│   (Client-side validation only)             │
└─────────────────────────────────────────────┘
                    │
                    │ if bypassed (API manipulation)
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Layer 4: RLS Policies (Server-side)         │
│                                              │
│ CREATE POLICY "Allow admins..."             │
│   ON hero_slides FOR ALL                    │
│   USING (                                   │
│     profile.role == 'admin'  ✓ ENFORCED    │
│   )                                         │
│ (Database enforces role check)              │
└─────────────────────────────────────────────┘
                    │
                    │ if all bypassed
                    │
                    ▼
           ✗ BLOCKED ✗
    (RLS prevents unauthorized write)
```

---

## User Permission Matrix

```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  Role: admin                                               │
│  ├─ See Edit Toggle Button     ✓ YES                      │
│  ├─ Open Admin Panel           ✓ YES                      │
│  ├─ View All Content           ✓ YES                      │
│  ├─ Edit Hero Slides           ✓ YES                      │
│  ├─ Edit Features              ✓ YES                      │
│  ├─ Create/Edit Posts          ✓ YES                      │
│  ├─ Upload Images              ✓ YES                      │
│  ├─ Delete Content             ✓ YES                      │
│  └─ View Admin Data            ✓ YES                      │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Role: business_owner                                      │
│  ├─ See Edit Toggle Button     ✗ NO                       │
│  ├─ Open Admin Panel           ✗ NO                       │
│  ├─ View All Content           ✓ YES (public only)        │
│  ├─ Edit Hero Slides           ✗ NO                       │
│  ├─ Edit Features              ✗ NO                       │
│  ├─ Create/Edit Posts          ✗ NO (own business only)  │
│  ├─ Upload Images              ✗ NO                       │
│  ├─ Delete Content             ✗ NO                       │
│  └─ View Admin Data            ✗ NO                       │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Role: user (public)                                       │
│  ├─ See Edit Toggle Button     ✗ NO                       │
│  ├─ Open Admin Panel           ✗ NO                       │
│  ├─ View All Content           ✓ YES (public only)        │
│  ├─ Edit Hero Slides           ✗ NO                       │
│  ├─ Edit Features              ✗ NO                       │
│  ├─ Create/Edit Posts          ✗ NO                       │
│  ├─ Upload Images              ✗ NO                       │
│  ├─ Delete Content             ✗ NO                       │
│  └─ View Admin Data            ✗ NO                       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## File Organization

```
src/
├── hooks/
│   ├── useAdminMode.ts              (Access control)
│   └── useAdminStorage.ts           (Image uploads)
│
├── components/
│   ├── admin/
│   │   ├── AdminEditToggle.tsx       (Floating toggle)
│   │   ├── AdminPanel.tsx            (Main modal)
│   │   ├── AdminEditableSection.tsx  (Section wrapper)
│   │   ├── HeroEditor.tsx            (Hero editor)
│   │   ├── FeaturesEditor.tsx        (Features editor)
│   │   ├── PostsEditor.tsx           (Posts editor)
│   │   └── SimpleTextEditor.tsx      (Reusable form)
│   │
│   └── home/
│       └── [Existing components]
│
└── pages/
    └── HomePage.tsx                  (Modified)

migrations/
└── admin_system_schema.sql          (SQL migration)

docs/
├── ADMIN_SYSTEM_SETUP.md            (Complete guide)
├── ADMIN_QUICK_START.md             (Quick setup)
├── IMPLEMENTATION_SUMMARY.md        (Technical details)
└── ADMIN_SYSTEM_ARCHITECTURE.md     (This file)
```

---

## State Management Flow

```
┌─────────────────────────────────────┐
│ HomePage Component State            │
│                                     │
│ - isAdminPanelOpen: boolean        │
│ - useAdminMode hook                │
│   ├─ canEditContent                │
│   ├─ isEditModeOn                  │
│   └─ setIsEditModeOn               │
└─────────────────────────────────────┘
           │
           ├─→ AdminEditToggle (props: onOpenPanel)
           │   │
           │   └─→ useAdminMode (read canEditContent, isEditModeOn)
           │
           └─→ AdminPanel (props: isOpen, onClose)
               │
               ├─→ useEffect() [load data when isOpen]
               │   │
               │   └─→ supabase queries (hero, features, posts)
               │
               ├─→ HeroEditor (props: slides, onUpdate)
               │   ├─→ useAdminStorage (upload image)
               │   └─→ supabase.update()
               │
               ├─→ FeaturesEditor (props: features, onUpdate)
               │   └─→ supabase.insert/update/delete()
               │
               └─→ PostsEditor (props: posts, onUpdate)
                   ├─→ useAdminStorage (upload image)
                   └─→ supabase.insert/update/delete()
```

---

## API/Supabase Integration Points

```
Client ──────────┐
                 │
                 ▼
          ┌────────────────┐
          │ Supabase Auth  │
          │                │
          │ ✓ getSession() │
          │ ✓ onAuthState  │
          └────────────────┘
                 │
                 ├─→ useAuth() hook
                 │
                 ▼
          ┌────────────────┐
          │ Supabase DB    │
          │                │
          │ ✓ SELECT       │
          │ ✓ INSERT       │
          │ ✓ UPDATE       │
          │ ✓ DELETE       │
          │ (RLS enforced) │
          └────────────────┘
                 │
                 ├─→ hero_slides
                 ├─→ features
                 ├─→ posts
                 └─→ profiles
                 │
                 ▼
          ┌────────────────┐
          │ Supabase Store │
          │                │
          │ ✓ upload()     │
          │ ✓ getPublicUrl │
          │ (Public/Auth)  │
          └────────────────┘
                 │
                 ├─→ assets/hero/
                 ├─→ assets/features/
                 └─→ assets/posts/
```

---

## Request/Response Cycle: Saving Hero Slide

```
┌─────────────────┐
│ Admin Form Data │
│                 │
│ {               │
│  title_ar: "...",
│  title_en: "...",
│  image_url: "..." (from upload)
│ }               │
└────────┬────────┘
         │
         ▼
   ┌──────────────────┐
   │ onClick Save     │
   │ Event Handler    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ useAdminStorage.         │
   │ uploadImage()            │
   │ [if image changed]       │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ supabase.storage.        │
   │ from('assets').          │
   │ upload(file)             │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ get Public URL           │
   └────────┬─────────────────┘
            │
            ├─→ Update formData.image_url
            │
            ▼
   ┌──────────────────────────┐
   │ supabase.from(           │
   │ 'hero_slides').          │
   │ update(formData).        │
   │ eq('id', slideId)        │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ RLS Policy Check         │
   │                          │
   │ if (profile.role ==      │
   │     'admin') → ALLOW     │
   │ else → DENY              │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Database Update          │
   │ hero_slides row updated  │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Response to Client       │
   │ { success: true }        │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Update React State       │
   │ setHeroSlides(updated)   │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Re-render Component      │
   │ Close Modal              │
   │ Show Success Message     │
   └──────────────────────────┘
```

---

## Performance Optimization Strategy

```
┌─────────────────────────────┐
│ Code Splitting              │
│                             │
│ Admin components loaded     │
│ only when needed            │
│ (isAdminModeActive check)   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Lazy Loading                │
│                             │
│ AdminPanel modal data       │
│ loaded on open only         │
│ (useEffect dependency)      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Image Optimization          │
│                             │
│ Supabase Storage handles    │
│ image processing            │
│ No client resize/encode     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Database Indexing           │
│                             │
│ idx_hero_slides_sort_order  │
│ idx_features_is_active      │
│ idx_posts_status            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Memoization                 │
│                             │
│ useMemo for canEditContent  │
│ Prevents unnecessary checks │
└─────────────────────────────┘
```

---

**This architecture diagram provides a complete visual understanding of the admin system. Refer to this alongside the code for implementation clarity.**

---

*Architecture Documentation*
*Last Updated: April 17, 2026*
*Status: ✅ Production Ready*
