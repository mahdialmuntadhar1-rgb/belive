# Google AI Studio Build Mode Implementation Directive
## Iraqi AI Business Directory - Belive App

**Status:** Implementation Phase 1 - Hero Section Editor Only  
**Project Type:** Existing app modification (not new project)  
**Workflow:** AI Studio → GitHub → Vercel deployment  
**Target Tech Stack:** Next.js + TypeScript + Tailwind CSS  

---

## OBJECTIVE
Add a lightweight, temporary "Build Mode" editor to the Belive app homepage that allows visual editing of the Hero section during the AI Studio build phase. This is **NOT** a production CMS, admin dashboard, or authentication system. This is a temporary in-app editor that persists only in browser localStorage and can be easily replaced with Supabase later.

---

## SCOPE: HERO SECTION EDITOR ONLY (Phase 1)

### What the Hero Editor Must Do
The editor allows editing of a multi-slide hero carousel with the following capabilities:

#### For Each Hero Slide:
- Upload/replace hero background image (from user's computer)
- Edit slide title (text)
- Edit slide subtitle (text)
- Edit button text (CTA text)
- Set button link/URL (optional)
- View live preview instantly on the page

#### For All Slides:
- Add a new slide with default values
- Delete any slide
- Reorder slides (up/down arrow controls)
- View thumbnail of each slide
- The hero carousel should auto-scroll as it does currently
- The hero should maintain its premium, polished appearance

---

## IMPLEMENTATION REQUIREMENTS

### A) UI/UX Rules
1. **Build Mode Toggle:**
   - Add "Build Mode" button in the top navbar/header area
   - Make it obvious and easy to find
   - When toggled ON: show the editor panel
   - When toggled OFF: hide the editor (normal view)
   - Visual indicator showing current mode (e.g., "🔨 Build Mode ON" or similar)

2. **Editor Panel:**
   - Opens as a side panel (right side preferred) or floating panel
   - Clean, organized layout
   - Does not obstruct main app content
   - Easy to close/minimize
   - Responsive on all screen sizes

3. **Slide List in Editor:**
   - Show all hero slides in a list
   - Each slide shows:
     - Thumbnail of the current image (small preview)
     - Slide order number
     - Edit/Delete buttons
     - Up/Down arrow buttons for reordering

4. **Slide Editor Form:**
   - When user clicks a slide or "Add New Slide":
     - Show a form with fields:
       - **Image Upload:** clear file input or drag-drop area
       - **Replace Button:** replace current image with new upload
       - **Remove Button:** delete current image (use placeholder)
       - **Paste URL:** optional text field to paste external image URL
       - **Title:** text input field
       - **Subtitle:** text input field
       - **Button Text:** text input field
       - **Button Link:** URL input field (optional)
     - Show a **Preview** of the slide below the form (what it looks like on the actual page)
     - "Save" and "Cancel" buttons (or auto-save on blur)

5. **Live Preview:**
   - All edits update the hero section on the main page **instantly** as the user types or uploads
   - No need to click "Save" and refresh—changes are immediate
   - User sees exactly what the hero will look like before pushing to GitHub

### B) Data Handling (Build Mode Only)
1. **Storage:**
   - Use browser `localStorage` to persist edits across page refreshes
   - Key structure: `belive_hero_build_mode` (JSON string)
   - Include: array of slide objects with { id, image, title, subtitle, buttonText, buttonLink }

2. **Data Format (Example):**
   ```json
   {
     "slides": [
       {
         "id": "slide_1",
         "image": "base64_encoded_or_url_string",
         "title": "Welcome to Belive",
         "subtitle": "Connect with Iraqi businesses",
         "buttonText": "Explore",
         "buttonLink": "/explore"
       }
     ]
   }
   ```

3. **Initial Data:**
   - On first load, copy the current hero section data into the build-mode structure
   - User edits the build-mode data, NOT the original hardcoded component props
   - When user toggles off Build Mode, the hero still displays the edited version (persisted in localStorage)

4. **No Backend, No Auth:**
   - Do not create a database call
   - Do not add authentication
   - Do not use external APIs
   - All edits are local to this browser session
   - When user is ready to push to GitHub, they manually copy the final JSON into the source code

### C) File/Component Organization
1. **New Files to Create:**
   - `hooks/useBuildMode.ts` – Custom hook for managing build mode state and localStorage
   - `components/BuildModeEditor/BuildModeEditor.tsx` – Main editor panel component
   - `components/BuildModeEditor/HeroSlideEditor.tsx` – Slide editing form
   - `components/BuildModeEditor/SlideList.tsx` – List of slides with thumbnails
   - `components/BuildModeEditor/BuildModeToggle.tsx` – Navbar button to toggle editor

2. **Existing Files to Modify:**
   - `components/Hero.tsx` (or your current hero component) – Read from build-mode localStorage when available
   - `components/Navbar.tsx` (or your header) – Add BuildModeToggle button
   - `app/page.tsx` (or homepage) – Wrap with BuildModeProvider if using context
   - `styles/globals.css` (if needed) – Add minimal styles for editor panel

3. **Structure to Follow:**
   ```
   src/
   ├── components/
   │   ├── Hero.tsx (MODIFIED)
   │   ├── Navbar.tsx (MODIFIED)
   │   ├── BuildModeEditor/
   │   │   ├── BuildModeEditor.tsx (NEW)
   │   │   ├── BuildModeToggle.tsx (NEW)
   │   │   ├── HeroSlideEditor.tsx (NEW)
   │   │   ├── SlideList.tsx (NEW)
   │   │   └── ImageUploader.tsx (NEW - reusable image upload component)
   │   └── ...
   ├── hooks/
   │   ├── useBuildMode.ts (NEW)
   │   └── ...
   ├── types/ (if using TypeScript)
   │   ├── buildMode.ts (NEW - TypeScript interfaces for build mode data)
   │   └── ...
   └── ...
   ```

### D) Code Quality Requirements
1. **Comments:**
   - Mark all build-mode code with `// BUILD MODE ONLY - Remove before production` comments
   - Mark data structures with `// TEMPORARY - Replace with Supabase tables later`
   - Clearly separate build-mode logic from production logic

2. **Naming:**
   - Use clear, descriptive names: `buildModeEnabled`, `heroSlides`, `updateHeroSlide()`
   - Avoid abbreviations like `bm` or `hse`
   - Function names should start with verb: `addSlide()`, `deleteSlide()`, `saveSlideEdit()`

3. **Modular Code:**
   - Keep components small and single-responsibility
   - ImageUploader should be a separate reusable component
   - useBuildMode hook handles all localStorage logic
   - No mixed concerns (don't put hero carousel logic inside editor logic)

4. **No Mock Claims:**
   - Only implement what is explicitly listed above
   - Do not claim features that are not visible in the editor panel or live preview
   - If a feature is not yet implemented, do not describe it as if it works
   - If image upload doesn't work, don't describe the upload button as functional

### E) Image Handling
1. **Upload Options:**
   - File input: User selects image from computer
   - Drag-and-drop: User drags image into upload area
   - Paste URL: User pastes external image URL (optional nice-to-have)

2. **Image Storage:**
   - Convert uploaded images to base64 data URLs
   - Store base64 strings in localStorage (browser handles the size limit gracefully)
   - OR store image as file and reference local path during build phase
   - When user is ready to push to GitHub, they move final images to `/public` and update image paths in code

3. **Image Display:**
   - Show thumbnail of uploaded image in slide list
   - Show preview of image in slide editor form
   - Show final image in live hero preview on the page

### F) Build Mode Behavior
1. **Toggling On:**
   - Button click toggles build mode ON
   - Editor panel appears
   - Hero section stays visible below editor
   - User can see both at once

2. **Toggling Off:**
   - Button click toggles build mode OFF
   - Editor panel disappears
   - Hero section remains with all edits applied (from localStorage)
   - App looks like a normal finished product

3. **Persistence:**
   - Edits persist in localStorage automatically
   - Page refresh keeps all edits
   - Browser tab close loses edits (normal localStorage behavior)
   - No "Save" button needed—auto-save on every change

4. **Reset:**
   - Optional: Add a "Reset to Original" button in the editor (clears localStorage for hero)
   - Optional: Add a "Download JSON" button for user to save their edits as a file

---

## WHAT NOT TO DO
- ❌ Do not create a production admin dashboard
- ❌ Do not add user authentication or login
- ❌ Do not create a backend API or database calls
- ❌ Do not build a complex content management system
- ❌ Do not over-engineer the data structure
- ❌ Do not add unnecessary UI polish that distracts from functionality
- ❌ Do not create hidden/fake features that don't actually work
- ❌ Do not modify the hero carousel auto-scroll behavior
- ❌ Do not require server-side operations

---

## VERIFICATION CHECKLIST
After implementation, verify the following:

### Build Mode Toggle
- [ ] "Build Mode" button appears in the top navbar
- [ ] Clicking the button toggles build mode ON
- [ ] Build mode has a visual indicator (color change, icon, text label)
- [ ] Clicking again toggles build mode OFF
- [ ] Editor panel only shows when build mode is ON

### Hero Editor Panel
- [ ] Editor panel opens on the right side (or as floating panel)
- [ ] Panel shows a list of all hero slides
- [ ] Each slide shows a thumbnail image
- [ ] Each slide shows its order number (1, 2, 3, etc.)
- [ ] Each slide has Edit and Delete buttons
- [ ] Each slide has Up/Down arrow buttons for reordering

### Slide Editing
- [ ] Clicking a slide or "Add New Slide" opens the editor form
- [ ] Form shows all fields: Image Upload, Title, Subtitle, Button Text, Button Link
- [ ] Image upload accepts file selection from computer
- [ ] Image upload shows a "Replace" button to swap images
- [ ] Image upload shows a "Remove" button to clear image
- [ ] Form fields are editable (text inputs respond to typing)
- [ ] Form has a visible preview of the slide below it
- [ ] Preview updates instantly as user types (no need to click Save)

### Live Preview on Page
- [ ] Hero section on the main page updates instantly as user edits
- [ ] When user changes title, the hero title changes immediately
- [ ] When user changes image, the hero image changes immediately
- [ ] When user adds a slide, it appears in the hero carousel immediately
- [ ] When user deletes a slide, it disappears from the carousel immediately
- [ ] When user reorders slides, the carousel order updates immediately
- [ ] Hero carousel still auto-scrolls correctly

### Image Upload
- [ ] File input accepts image files (JPEG, PNG, WebP, etc.)
- [ ] Uploaded image displays as thumbnail in the editor
- [ ] Uploaded image displays in the live hero preview
- [ ] Image can be replaced by uploading a new one
- [ ] Image can be removed (placeholder shows instead)

### Data Persistence
- [ ] Edits are saved to localStorage automatically
- [ ] Page refresh keeps all edits intact
- [ ] Build mode toggle state persists (if user was in edit mode, closing panel and reopening shows edits still there)
- [ ] New browser tab does NOT have the edits (localStorage is per-tab/origin)

### Code Quality
- [ ] All build-mode code has "BUILD MODE ONLY" comments
- [ ] File structure matches the described organization
- [ ] No console errors or warnings when toggling build mode
- [ ] No console errors when uploading images
- [ ] No console errors when adding/deleting/reordering slides

### Hero Appearance
- [ ] Hero section still looks premium and polished (no visual degradation)
- [ ] Hero carousel auto-scroll still works correctly
- [ ] Build mode toggle doesn't clutter the navbar
- [ ] Editor panel doesn't block important content

---

## PHASE 2 (Future - Not in This Directive)
After Phase 1 (Hero Editor) is complete and tested:
- Shaku Maku Feed Editor
- Text/Caption Editor
- Featured Business Cards (if applicable)

---

## MIGRATION TO SUPABASE (Future)
When ready to move to production:
1. Create Supabase tables: `hero_slides`, `feed_items`, `content_sections`
2. Create API routes to fetch/update data from Supabase
3. Replace `useBuildMode` hook with `useSuperbaseHero` hook
4. Replace localStorage logic with Supabase RPC calls
5. Remove all "BUILD MODE ONLY" code
6. Add authentication for admin access (if needed in production)

---

## FINAL NOTES
- This is a build-phase tool, not a production system
- All edits are temporary and local to the browser
- User must manually integrate final edits into GitHub before deployment
- Code should be clean and easy to remove later
- Do not over-build; keep it simple and functional
