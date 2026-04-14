# Verification Checklist for Build Mode Editor
## Hero Section - Phase 1

Use this checklist AFTER Google AI Studio completes implementation. Test each item before pushing to GitHub.

---

## 1. NAVBAR & TOGGLE BUTTON

### Visual Appearance
- [ ] "Build Mode" button appears in the top navbar/header area
- [ ] Button is clearly visible and readable
- [ ] Button position doesn't clutter existing navbar items
- [ ] Button style matches the app's design language

### Toggle Functionality
- [ ] Clicking the button changes visual state (e.g., color changes, text updates)
- [ ] Button shows "Build Mode ON" or similar indicator when enabled
- [ ] Button shows "Build Mode OFF" or similar indicator when disabled
- [ ] Toggle works reliably (no flicker, no lag)

### Toggle Behavior
- [ ] When toggled ON: Editor panel appears
- [ ] When toggled OFF: Editor panel disappears
- [ ] Hero section remains visible and unchanged when toggling
- [ ] No page reload or navigation when toggling

---

## 2. EDITOR PANEL - APPEARANCE & LAYOUT

### Panel Presence
- [ ] Editor panel appears on right side of screen when build mode is ON
- [ ] Panel is a floating or side-mounted container (doesn't push main content)
- [ ] Panel has clear visual separation from main content
- [ ] Panel is fully visible without horizontal scrolling

### Panel Responsiveness
- [ ] Panel doesn't cover critical UI elements on desktop
- [ ] Panel is readable and usable on tablet size screens (tested at 1024px width)
- [ ] Panel is usable on mobile (stack or collapse if needed)
- [ ] Scrolling within panel works if content is taller than viewport

### Panel Controls
- [ ] Panel has a close button or minimize button
- [ ] Close/minimize button works correctly
- [ ] Panel stays open until user clicks close (persists state during edits)
- [ ] No accidental panel closures when editing

### Visual Polish
- [ ] Panel background is clean (white, light gray, or semi-transparent)
- [ ] Panel has subtle shadow or border for depth
- [ ] Text is readable (good contrast, appropriate font size)
- [ ] Spacing and padding feel balanced

---

## 3. SLIDE LIST

### Slide Display
- [ ] All hero slides are listed in the editor
- [ ] Slides are ordered (1, 2, 3, etc.) with visible order numbers
- [ ] Each slide shows a thumbnail preview of its image
- [ ] Thumbnails are the correct size (~60px × 40px or similar)
- [ ] Missing images show a placeholder (gray box or "No Image" text)

### Slide Thumbnails
- [ ] Image thumbnail matches the actual image in the hero
- [ ] Thumbnail aspect ratio is consistent for all slides
- [ ] Thumbnails update immediately when image is changed

### Slide List Interactions
- [ ] Clicking a slide (or its edit button) opens the slide editor form
- [ ] Previously selected slide is visually highlighted
- [ ] Visual selection changes when clicking a different slide

### Add New Slide
- [ ] "Add New Slide" button is visible at the bottom of the list
- [ ] Clicking "Add New Slide" creates a new slide with default values
  - Default image: placeholder or empty
  - Default title: "New Slide" or empty
  - Default subtitle: empty
  - Default button text: "Click Me" or similar
  - Default button link: empty
- [ ] New slide appears at the end of the list
- [ ] New slide is automatically selected after creation
- [ ] New slide editor form opens after creation

### Delete Slide
- [ ] Each slide has a delete button (trash icon or "Delete" text)
- [ ] Clicking delete removes the slide from the list
- [ ] Deleted slide is removed from the hero carousel immediately
- [ ] Deleting a slide updates the slide numbers (no gaps)
- [ ] Cannot delete all slides (at least one must remain) - OR allows deletion gracefully

### Reorder Slides
- [ ] Each slide has up/down arrow buttons for reordering
- [ ] Up arrow is disabled on the first slide
- [ ] Down arrow is disabled on the last slide
- [ ] Clicking up arrow moves slide up in the list
- [ ] Clicking down arrow moves slide down in the list
- [ ] Slide order numbers update after reordering
- [ ] Hero carousel order updates immediately after reordering
- [ ] Reordering is smooth with no visual jumps

---

## 4. SLIDE EDITOR FORM

### Form Opening
- [ ] Clicking a slide opens the editor form for that slide
- [ ] Form shows the current values for the selected slide
- [ ] Form closes when user clicks back to the slide list (if applicable)
- [ ] Form updates when user selects a different slide

### Image Upload Section
- [ ] Image upload section is clearly labeled
- [ ] File input accepts image files (JPEG, PNG, WebP, etc.)
- [ ] File input rejects non-image files gracefully
- [ ] Drag-and-drop zone is visible and labeled
- [ ] User can drag an image file onto the drop zone
- [ ] Drag-and-drop uploads the image and shows preview
- [ ] "Replace" button appears if an image already exists
- [ ] Clicking "Replace" allows selection of a new image
- [ ] "Remove" button appears if an image exists
- [ ] Clicking "Remove" clears the image (shows placeholder)
- [ ] After upload/replace/remove, thumbnail updates immediately in slide list

### Image Preview in Editor
- [ ] Uploaded/selected image shows as a preview in the form
- [ ] Preview image is a reasonable size (e.g., 200-250px width)
- [ ] Preview updates immediately after upload

### Text Input Fields
- [ ] Title input field is visible and labeled
- [ ] Subtitle input field is visible and labeled
- [ ] Button Text input field is visible and labeled
- [ ] Button Link input field is visible and labeled (marked optional if desired)
- [ ] All fields are text inputs (not dropdowns or other controls)
- [ ] User can type and edit text in all fields
- [ ] Text appears in the field as user types (no lag)

### Form Save Behavior
- [ ] Edits are saved automatically as user types (auto-save on blur) OR
- [ ] Clicking outside a field saves the edit OR
- [ ] Form has explicit Save/Cancel buttons
- [ ] Save/Cancel buttons (if present) work correctly
- [ ] No "save" confirmation or modal needed

---

## 5. LIVE PREVIEW - INSTANT UPDATES

### Title & Subtitle Updates
- [ ] Edit the Title field and see the hero section title change **immediately**
- [ ] Edit the Subtitle field and see the hero section subtitle change **immediately**
- [ ] Changes appear on the page without page reload
- [ ] Changes appear without clicking "Save"

### Button Text Updates
- [ ] Edit the Button Text field
- [ ] Hero section button text updates immediately
- [ ] Button label changes on the page instantly

### Button Link Updates
- [ ] Edit the Button Link field
- [ ] Button href attribute updates (verify in browser inspector if needed)
- [ ] No visual change needed, but change should be saved

### Image Updates
- [ ] Upload a new image to a slide
- [ ] Hero carousel image updates immediately
- [ ] Old image is replaced with new image instantly
- [ ] No page reload or carousel reset

### Add Slide - Instant Preview
- [ ] Click "Add New Slide"
- [ ] Hero carousel shows the new slide immediately
- [ ] New slide appears at the end of the carousel (or appropriate position)
- [ ] Carousel can be manually scrolled/swiped to see the new slide

### Delete Slide - Instant Preview
- [ ] Delete a slide from the editor
- [ ] Slide disappears from the hero carousel immediately
- [ ] No page reload
- [ ] Carousel displays remaining slides correctly

### Reorder Slide - Instant Preview
- [ ] Reorder a slide using up/down buttons
- [ ] Hero carousel order updates immediately
- [ ] Manual swipe/scroll in carousel shows new order
- [ ] No page reload

---

## 6. IMAGE HANDLING

### File Upload
- [ ] User can select image from computer using file input
- [ ] Selected image is uploaded and converted to displayable format (base64 or URL)
- [ ] Image displays in thumbnail and preview
- [ ] File size handling: large images are accepted (base64 can be stored in localStorage)

### Drag & Drop
- [ ] Image upload area accepts drag-and-drop
- [ ] User can drag an image file onto the zone
- [ ] Dropping triggers upload (no additional click needed)
- [ ] Visual feedback shows drop zone is active (e.g., highlight, border change)
- [ ] Uploaded image displays after drop

### URL Paste (Optional)
- [ ] If URL paste feature is implemented: user can paste image URL
- [ ] Pasted URL image loads and displays
- [ ] Invalid URLs show error message

### Image Size Limits
- [ ] Very large images are handled without crashing (base64 localStorage limit is ~5MB per entry)
- [ ] Error message if image is too large (if applicable)
- [ ] Images are compressed or resized if needed (or warning shown)

### Image Display Quality
- [ ] Images display clearly in thumbnails
- [ ] Images display clearly in live preview
- [ ] No image distortion or stretching
- [ ] Aspect ratio is maintained

---

## 7. DATA PERSISTENCE

### localStorage Saving
- [ ] Open browser DevTools → Application → LocalStorage
- [ ] Verify key "belive_hero_build_mode" exists
- [ ] Value is valid JSON with slides array
- [ ] Each slide has: id, image, title, subtitle, buttonText, buttonLink

### Auto-Save
- [ ] Make an edit (change title, upload image, etc.)
- [ ] Check localStorage immediately
- [ ] New data is saved to localStorage instantly (no delay)
- [ ] Edit appears in localStorage value

### Page Refresh Persistence
- [ ] Make an edit (e.g., change a slide title)
- [ ] Refresh the page (Ctrl+R or Cmd+R)
- [ ] Build mode is still enabled (if toggle state was ON)
- [ ] All edits are still present (same slides, images, text)
- [ ] No data loss

### Browser Persistence
- [ ] Make an edit
- [ ] Close the browser tab
- [ ] Reopen the app in a new tab
- [ ] localStorage data persists (edits are still there)

### Multiple Tabs
- [ ] Open the app in two browser tabs
- [ ] Edit something in Tab 1
- [ ] Switch to Tab 2
- [ ] Tab 2 does NOT automatically reflect changes from Tab 1 (normal localStorage behavior)
- [ ] Refresh Tab 2
- [ ] Edits from Tab 1 now appear (localStorage is loaded)

---

## 8. HERO CAROUSEL BEHAVIOR

### Auto-Scroll Still Works
- [ ] Hero carousel still auto-scrolls through slides (if it did originally)
- [ ] Auto-scroll timing is unchanged
- [ ] Carousel transitions are smooth
- [ ] No janky or broken animations

### Manual Navigation Still Works
- [ ] User can manually swipe/click to navigate slides (if carousel supports it)
- [ ] Navigation is responsive and smooth
- [ ] New/reordered/deleted slides are navigable correctly

### Visual Quality
- [ ] Hero section still looks premium and polished
- [ ] No visual degradation from build mode
- [ ] Images display clearly
- [ ] Text is readable
- [ ] Buttons are clickable and styled correctly

---

## 9. BUILD MODE TOGGLE - OFF STATE

### Editor Disappears
- [ ] Click Build Mode button to toggle OFF
- [ ] Editor panel disappears completely
- [ ] App looks like a normal finished product

### Hero Content Persists
- [ ] After toggling OFF, hero still shows all edited content
- [ ] All edits made during build mode are visible
- [ ] Images are still there
- [ ] Text changes are still there
- [ ] Slide order is maintained

### No Trace of Build Mode
- [ ] Build Mode button text changes to show it's OFF
- [ ] No floating buttons, panels, or UI remnants visible
- [ ] Hero looks like part of the final product

---

## 10. CODE QUALITY

### Comments Present
- [ ] All build-mode related code has "// BUILD MODE ONLY" comments
- [ ] Comments appear at the top of build-mode functions/components
- [ ] Comments are visible when opening files in code editor

### File Organization
- [ ] New files exist in expected locations:
  - `hooks/useBuildMode.ts` ✓
  - `components/BuildModeEditor/*.tsx` ✓
  - `types/buildMode.ts` ✓
- [ ] Modified files show build-mode imports/usage clearly
- [ ] File structure is clean and logical

### No Console Errors
- [ ] Open browser DevTools → Console tab
- [ ] Toggle build mode ON: no errors in console
- [ ] Edit a slide: no errors in console
- [ ] Upload an image: no errors in console
- [ ] Toggle build mode OFF: no errors in console
- [ ] Refresh page: no errors in console

### No Warnings
- [ ] No React warnings about missing keys in lists
- [ ] No warnings about missing dependencies in hooks
- [ ] No TypeScript errors (if using TypeScript)

---

## 11. ACCESSIBILITY & USABILITY

### Keyboard Navigation
- [ ] Tab key moves focus through form inputs and buttons
- [ ] Enter key submits forms (if applicable)
- [ ] No keyboard traps (focus doesn't get stuck)

### Labels & Descriptions
- [ ] Form fields have visible labels (not just placeholder text)
- [ ] Image upload zone is clearly labeled
- [ ] Add/delete/reorder buttons have clear icons or text labels

### Mobile Usability
- [ ] Editor panel is usable on mobile (width < 768px)
- [ ] Touch targets are large enough (buttons, inputs are tap-friendly)
- [ ] No overlapping elements on mobile

---

## 12. EDGE CASES

### Empty State
- [ ] If hero is created with no slides: editor handles gracefully
- [ ] "Add New Slide" button works even with zero slides
- [ ] Hero renders properly when new slide is added

### Many Slides
- [ ] Create 5-10 slides and verify:
  - [ ] Slide list remains usable (scrollable if needed)
  - [ ] All slides appear in carousel
  - [ ] Reordering still works
  - [ ] Delete/add works

### Large Images
- [ ] Upload a large image (2-3 MB): handles without crashing
- [ ] Upload a very high-resolution image: displays correctly
- [ ] localStorage doesn't break under image size

### Special Characters
- [ ] Enter special characters in title: é, ñ, 中文, العربية, emojis
- [ ] Special characters display correctly in editor and hero

### Long Text
- [ ] Enter very long title (100+ characters): doesn't overflow or break layout
- [ ] Text wraps appropriately in hero section

---

## 13. FINAL VERIFICATION SUMMARY

### Must Have (Critical)
- [ ] Build Mode toggle button works
- [ ] Editor panel shows/hides correctly
- [ ] Can add/delete/reorder slides
- [ ] Can upload/replace/remove images
- [ ] Can edit title, subtitle, button text
- [ ] Live preview updates instantly
- [ ] Edits persist in localStorage
- [ ] Page refresh keeps edits
- [ ] No console errors

### Should Have (Important)
- [ ] Image upload via drag-and-drop works
- [ ] Slide thumbnails display
- [ ] Editor is responsive on mobile
- [ ] Code has "// BUILD MODE ONLY" comments
- [ ] File structure matches expected layout

### Nice to Have (Optional)
- [ ] URL paste for images
- [ ] Keyboard navigation support
- [ ] Smooth animations/transitions
- [ ] "Remove image" placeholder design

---

## Testing Checklist - Quick Version

1. [ ] Build Mode button appears and toggles
2. [ ] Editor panel opens/closes
3. [ ] Add slide works
4. [ ] Delete slide works
5. [ ] Reorder slides works
6. [ ] Upload image works
7. [ ] Edit text works
8. [ ] Live preview updates instantly
9. [ ] Page refresh keeps edits
10. [ ] No console errors
11. [ ] Code has "// BUILD MODE ONLY" comments
12. [ ] Hero still looks professional

---

## If Tests Fail

### Common Issues & Solutions

**Issue:** Build Mode button doesn't appear
- Check: Is `<BuildModeToggle />` added to Navbar?
- Check: Is the hook `useBuildMode()` being called?
- Fix: Verify imports and component placement

**Issue:** Editor panel doesn't show edits
- Check: Is `useBuildMode()` being called in Hero component?
- Check: Is Hero component using `buildModeEnabled` state?
- Fix: Verify Hero component reads from hook

**Issue:** Images don't upload
- Check: Is `<ImageUploader />` component implemented?
- Check: Is file input accepting image/* files?
- Fix: Verify file input type and onChange handler

**Issue:** Changes don't persist after refresh
- Check: Is localStorage being written to?
- Check: Is the key correct: "belive_hero_build_mode"?
- Check: Is useBuildMode hook reading from localStorage on mount?
- Fix: Verify localStorage logic in custom hook

**Issue:** Hero updates lag behind edits
- Check: Are updates being triggered on state change?
- Check: Is React re-rendering the component?
- Fix: Verify state management and re-render triggers

---

## Sign-Off

When all items are checked:
- [ ] Implementation is complete
- [ ] All tests pass
- [ ] Code quality is acceptable
- [ ] Ready to commit to GitHub
- [ ] Ready for Phase 2 (Shaku Maku Feed Editor)
