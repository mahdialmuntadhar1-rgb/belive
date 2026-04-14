# 1️⃣ Google AI Studio Build Mode Prompt
## Belive App - Hero Section Build Mode Editor

Copy and paste the entire text below into Google AI Studio:

---

**You are implementing a temporary Build Mode editor for an existing Next.js app (Belive - Iraqi AI Business Directory).**

**CRITICAL CONSTRAINTS:**
- This is NOT a production system
- This is NOT an admin dashboard
- This is NOT a CMS
- This is temporary code for editing during the build phase
- After testing, edits will be manually pushed to GitHub
- Mark all code with "// BUILD MODE ONLY" comments
- Do NOT create authentication, backend APIs, or database calls
- Do NOT over-engineer anything
- Only implement what is explicitly listed below

**TASK: Build Mode Hero Section Editor (Phase 1 ONLY)**

**What to implement:**
1. Add a "Build Mode" toggle button in the top navbar (Next to or near other header items)
2. When "Build Mode" is ON, show an editor panel on the right side of the screen
3. The editor allows editing of hero carousel slides with:
   - Image upload/replace/remove (from computer or paste external URL)
   - Title text field
   - Subtitle text field
   - Button text field
   - Button link/URL field (optional)
4. Features:
   - Add new slide (with defaults)
   - Delete slide
   - Reorder slides (up/down buttons)
   - View slide thumbnail
   - Live preview: hero section on the page updates INSTANTLY as user edits
5. Save edits to browser localStorage automatically (no save button needed)
6. Persist edits across page refresh
7. When "Build Mode" is OFF, hide the editor (hero still shows edited content)

**Files to create:**
- `hooks/useBuildMode.ts` – manage build mode state and localStorage
- `components/BuildModeEditor/BuildModeEditor.tsx` – main editor panel
- `components/BuildModeEditor/BuildModeToggle.tsx` – navbar button
- `components/BuildModeEditor/HeroSlideEditor.tsx` – slide edit form
- `components/BuildModeEditor/SlideList.tsx` – list of slides with thumbnails
- `components/BuildModeEditor/ImageUploader.tsx` – image upload component
- `types/buildMode.ts` – TypeScript types for hero slides

**Files to modify:**
- `components/Hero.tsx` – Read from localStorage if in build mode, otherwise use original props
- `components/Navbar.tsx` – Add BuildModeToggle button
- (Optional) `types/index.ts` if you have a central types file

**Data format (localStorage key: "belive_hero_build_mode"):**
```json
{
  "slides": [
    {
      "id": "slide_1",
      "image": "base64_string_or_url",
      "title": "Text here",
      "subtitle": "Subtitle text",
      "buttonText": "Button label",
      "buttonLink": "/path-or-url"
    }
  ]
}
```

**UI Requirements:**
- Editor panel: right side floating panel, clean layout, doesn't block main content
- Image preview: show thumbnail of uploaded image
- Image upload: file input + drag-drop + paste URL option
- Slide list: show order, thumbnail, edit/delete/reorder buttons
- Live preview: hero carousel updates instantly (no save button)
- No backend calls, no authentication, no complex styling

**Code Quality:**
- Comment all build-mode code with "// BUILD MODE ONLY - Remove before production"
- Keep components small and focused
- Use clear function names (addSlide, deleteSlide, updateHeroSlide, etc.)
- No mixed concerns between editor logic and carousel logic
- TypeScript strongly recommended

**Behavior:**
- First time: Load current hero section data into localStorage (copy it once)
- User edits: All changes go to localStorage (auto-save on change)
- Build mode toggle: Show/hide editor, but keep edits persistent
- Page refresh: Edits remain (from localStorage)
- Browser close: Edits lost (normal localStorage behavior)

**DO NOT:**
- Create a login/auth system
- Create a backend API
- Create a database
- Create a production CMS
- Hallucinate features (only build what is listed)
- Add admin dashboards or fake UI
- Over-style the editor
- Create server-side code

**VERIFY when done:**
1. Build Mode button appears in navbar and toggles on/off
2. Editor panel shows with slide list, thumbnails, edit/delete/reorder buttons
3. Upload image from computer, see thumbnail and preview
4. Edit title/subtitle/button text, see instant preview on hero
5. Add/delete/reorder slides, see instant preview on hero
6. Toggle Build Mode off, hero still shows edits
7. Refresh page, edits persist
8. All code is marked with "// BUILD MODE ONLY"

**Start with Hero only. Do not add Shaku Maku, text editors, or other sections yet.**
