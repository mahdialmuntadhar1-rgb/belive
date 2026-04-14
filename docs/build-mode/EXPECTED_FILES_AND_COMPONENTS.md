# Expected Files, Components & Artifacts
## Hero Section Build Mode Editor - Phase 1

---

## NEW FILES TO CREATE

### 1. `hooks/useBuildMode.ts`
**Purpose:** Custom hook managing build mode state and localStorage operations

**Expected exports:**
```typescript
export interface HeroSlide {
  id: string;
  image: string; // base64 or URL
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export interface BuildModeState {
  heroSlides: HeroSlide[];
}

export function useBuildMode() {
  // Returns:
  return {
    buildModeEnabled: boolean;
    heroSlides: HeroSlide[];
    toggleBuildMode: () => void;
    addSlide: (slide: HeroSlide) => void;
    deleteSlide: (slideId: string) => void;
    updateSlide: (slideId: string, updates: Partial<HeroSlide>) => void;
    reorderSlides: (slideId: string, direction: 'up' | 'down') => void;
    resetToOriginal: () => void;
  }
}
```

**localStorage key:** `belive_hero_build_mode`

---

### 2. `types/buildMode.ts`
**Purpose:** TypeScript type definitions for build mode

**Expected interfaces:**
```typescript
interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface BuildModeData {
  slides: HeroSlide[];
  lastUpdated?: string;
}

type SlideEditPayload = Partial<Omit<HeroSlide, 'id'>>;
type Direction = 'up' | 'down';
```

---

### 3. `components/BuildModeEditor/BuildModeEditor.tsx`
**Purpose:** Main editor panel container

**Expected features:**
- Renders only when `buildModeEnabled === true`
- Right-side floating panel with close/minimize button
- Imports and uses SlideList and HeroSlideEditor
- Shows section for hero slides
- Clean, organized layout
- Responsive design

**Expected props:**
```typescript
interface BuildModeEditorProps {
  onClose?: () => void;
}
```

**Expected child components:** SlideList, HeroSlideEditor

---

### 4. `components/BuildModeEditor/BuildModeToggle.tsx`
**Purpose:** Navbar button to toggle build mode on/off

**Expected features:**
- Button in navbar/header
- Label: "🔨 Build Mode" or similar
- Shows toggle state (ON/OFF visual indicator)
- Calls `toggleBuildMode()` from useBuildMode hook
- Size/style fits navbar context

**Expected props:**
```typescript
interface BuildModeToggleProps {
  isEnabled: boolean;
  onClick: () => void;
}
```

---

### 5. `components/BuildModeEditor/SlideList.tsx`
**Purpose:** Display list of hero slides with thumbnails and controls

**Expected features:**
- Shows all slides in a vertical list
- For each slide:
  - Thumbnail of image (small preview, ~60x40px)
  - Slide order number (1, 2, 3)
  - Edit button (opens HeroSlideEditor for that slide)
  - Delete button (removes slide with confirmation)
  - Up arrow button (reorder up)
  - Down arrow button (reorder down - disabled if last slide)
- "Add New Slide" button at the bottom
- Visual selection/highlight of currently editing slide

**Expected props:**
```typescript
interface SlideListProps {
  slides: HeroSlide[];
  onSelectSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onReorder: (slideId: string, direction: 'up' | 'down') => void;
  onAddSlide: () => void;
  selectedSlideId?: string;
}
```

---

### 6. `components/BuildModeEditor/HeroSlideEditor.tsx`
**Purpose:** Form to edit a single hero slide

**Expected features:**
- Form with fields:
  1. Image Upload / Replace / Remove section (ImageUploader component)
  2. Title text input
  3. Subtitle text input
  4. Button Text text input
  5. Button Link URL input (optional field)
- Save/Cancel buttons (or auto-save on blur)
- Preview section showing what the slide looks like
- Responsive form layout

**Expected props:**
```typescript
interface HeroSlideEditorProps {
  slide: HeroSlide | null;
  onSave: (updates: Partial<HeroSlide>) => void;
  onCancel?: () => void;
}
```

---

### 7. `components/BuildModeEditor/ImageUploader.tsx`
**Purpose:** Reusable image upload component

**Expected features:**
- File input with accept="image/*"
- Drag-and-drop zone
- Paste URL field (optional)
- "Upload" button
- "Replace" button (if image already exists)
- "Remove" button (if image already exists)
- Shows current image thumbnail
- Converts uploaded files to base64 data URL
- Error handling for file size or invalid formats

**Expected props:**
```typescript
interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageDataUrl: string | null) => void;
  onError?: (error: string) => void;
}
```

---

### 8. `contexts/BuildModeContext.tsx` (Optional)
**Purpose:** Context provider for build mode state (optional, if using Context instead of just hook)

**Expected exports:**
```typescript
export const BuildModeProvider: React.FC<{ children: React.ReactNode }>;
export const useBuildModeContext: () => BuildModeContextType;
```

---

## FILES TO MODIFY

### 1. `components/Hero.tsx` (or your current hero component name)
**Changes needed:**
- Import `useBuildMode` hook at top
- Check if `buildModeEnabled === true` and `heroSlides` exists in localStorage
- If in build mode: Use `heroSlides` from hook instead of component props
- If not in build mode: Use original props (default hero data)
- No other logic changes—carousel auto-scroll behavior remains the same
- Add comment: `// BUILD MODE ONLY - Remove before production`

**Example logic:**
```typescript
export function Hero({ defaultSlides }: HeroProps) {
  const { buildModeEnabled, heroSlides } = useBuildMode();
  
  // Use build-mode slides if enabled, otherwise use default
  const slides = buildModeEnabled && heroSlides.length > 0 
    ? heroSlides 
    : defaultSlides;
  
  // Rest of component remains the same...
  return (
    <Carousel slides={slides}>
      {/* Original carousel code */}
    </Carousel>
  );
}
```

---

### 2. `components/Navbar.tsx` (or your header component name)
**Changes needed:**
- Import `BuildModeToggle` component
- Import `useBuildMode` hook
- Add `<BuildModeToggle>` in the navbar/header area (right side preferred)
- Position it so it doesn't clutter existing navigation items
- Add comment: `// BUILD MODE ONLY - Toggle editor`

**Example placement:**
```typescript
export function Navbar() {
  const { buildModeEnabled, toggleBuildMode } = useBuildMode();
  
  return (
    <nav>
      {/* Existing navbar items */}
      
      {/* BUILD MODE ONLY */}
      <BuildModeToggle isEnabled={buildModeEnabled} onClick={toggleBuildMode} />
    </nav>
  );
}
```

---

### 3. `pages/_app.tsx` or `app/layout.tsx` (Top-level layout)
**Changes needed (if using Context):**
- Wrap app with `<BuildModeProvider>` 
- Import the provider at the top
- Add comment: `// BUILD MODE ONLY`

**Example:**
```typescript
import { BuildModeProvider } from '@/contexts/BuildModeContext';

export default function App({ Component, pageProps }) {
  return (
    <BuildModeProvider>
      <Component {...pageProps} />
    </BuildModeProvider>
  );
}
```

---

### 4. `types/index.ts` (or `types.ts` - your central types file)
**Changes needed (optional):**
- Add exports for HeroSlide, BuildModeData, etc.
- Or create separate `types/buildMode.ts` (recommended)

---

## COMPONENT TREE STRUCTURE

When fully implemented, the component hierarchy should look like:

```
<Navbar>
  <BuildModeToggle /> ← Toggle button here
</Navbar>

<main>
  <Hero /> ← Reads from useBuildMode if enabled
  
  {buildModeEnabled && (
    <BuildModeEditor>
      <SlideList>
        {slides.map(slide => (
          <SlideListItem>
            <ImageThumbnail />
            <DeleteButton />
            <EditButton />
            <UpDownButtons />
          </SlideListItem>
        ))}
        <AddSlideButton />
      </SlideList>
      
      <HeroSlideEditor>
        <ImageUploader>
          <FileInput />
          <DragDropZone />
          <PasteURLField />
          <ThumbnailPreview />
        </ImageUploader>
        <TextInputs>
          <TitleInput />
          <SubtitleInput />
          <ButtonTextInput />
          <ButtonLinkInput />
        </TextInputs>
        <SlidePreview />
        <SaveCancelButtons />
      </HeroSlideEditor>
    </BuildModeEditor>
  )}
</main>
```

---

## DATA STRUCTURE EXAMPLE

### localStorage "belive_hero_build_mode"
```json
{
  "slides": [
    {
      "id": "slide_1712000000000",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
      "title": "Welcome to Belive",
      "subtitle": "Discover Iraqi Businesses",
      "buttonText": "Explore Now",
      "buttonLink": "/explore"
    },
    {
      "id": "slide_1712000001000",
      "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "title": "Connect & Grow",
      "subtitle": "Network with thousands of business owners",
      "buttonText": "Join Community",
      "buttonLink": "/community"
    }
  ]
}
```

---

## STYLING NOTES

### BuildModeEditor Panel
- Position: `fixed` or `absolute` on right side
- Width: ~350-400px (responsive, narrower on mobile)
- Max-height: 90vh (scrollable if needed)
- Background: light gray or white (semi-transparent if floating)
- Border: subtle shadow or border
- Padding: 16px or 20px
- Font: inherit from app (probably Tailwind default)
- Z-index: high (above main content)

### Image Thumbnails
- Size: 60px × 40px (or similar aspect ratio)
- Border-radius: 4px
- Object-fit: cover (crop proportionally)
- Background: light gray if no image

### Buttons
- Reuse your existing button styles (Tailwind or styled-components)
- Small buttons for delete/reorder: ~32px height
- Form buttons (Save/Cancel): standard button size
- Hover states for interactivity

### Form Inputs
- Standard text inputs with border and padding
- Label above each field
- Placeholder text where helpful
- Error states if validation needed

---

## WHAT NOT TO CREATE

- ❌ No separate admin page or dashboard route
- ❌ No database migrations or Supabase setup
- ❌ No authentication components
- ❌ No backend API routes for this phase
- ❌ No complex state machine (keep it simple)
- ❌ No drag-and-drop library for reordering (just up/down buttons)
- ❌ No image cropping or editing tools
- ❌ No undo/redo system
- ❌ No version history
- ❌ No export/import of JSON (optional for Phase 2)

---

## ARTIFACTS THAT SHOULD EXIST WHEN DONE

1. ✅ Functional `useBuildMode` hook with localStorage persistence
2. ✅ Visible "Build Mode" toggle in navbar that works
3. ✅ Editor panel that shows/hides correctly
4. ✅ List of hero slides with thumbnails
5. ✅ Ability to add/delete/reorder slides
6. ✅ Image upload that works (file from computer)
7. ✅ Text editing for title, subtitle, button text, button link
8. ✅ Live preview: hero section updates instantly as user edits
9. ✅ localStorage persistence: edits survive page refresh
10. ✅ No build mode = normal app appearance
11. ✅ All code marked with "// BUILD MODE ONLY" comments
12. ✅ TypeScript types defined for hero slides and build mode data
13. ✅ No console errors or warnings

---

## PHASE 2 WILL ADD (Not yet)
- Shaku Maku Feed Editor
- Text/Caption Section Editor
- Featured Business Cards Editor
- Data export/download
- Reset to original modal with confirmation
