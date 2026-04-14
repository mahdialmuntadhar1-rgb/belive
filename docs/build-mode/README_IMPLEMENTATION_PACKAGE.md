# Google AI Studio Build Mode Implementation Package
## Belive App - Hero Section Editor

**Project:** Iraqi AI Business Directory (Belive)  
**Phase:** 1 - Hero Section Build Mode Editor  
**Status:** Ready for Google AI Studio Implementation  
**Created:** April 14, 2026  

---

## 📦 What's in This Package

This package contains **5 documents** to guide Google AI Studio through implementing a lightweight Build Mode editor for your Belive app. Use them in order:

### 1. **[GOOGLE_AI_STUDIO_PROMPT.md](./GOOGLE_AI_STUDIO_PROMPT.md)** 
🎯 **START HERE**  
Copy and paste this entire prompt directly into Google AI Studio. This is the directive that tells AI Studio what to build.

**Why this format?**
- Explicit constraints to prevent hallucination
- Narrow scope (Hero only, Phase 1)
- Clear DO NOT list to avoid over-building
- Built-in verification steps

---

### 2. **[GOOGLE_AI_STUDIO_DIRECTIVE.md](./GOOGLE_AI_STUDIO_DIRECTIVE.md)**
📋 **Reference Document**  
Detailed specification with:
- Complete requirements for Build Mode editor
- UI/UX rules and expectations
- Data handling strategy (localStorage)
- Code organization structure
- Verification checklist (comprehensive)

**Use this when:**
- Google AI Studio asks clarifying questions
- You need to explain why something is needed
- You want to understand the "why" behind requirements

---

### 3. **[EXPECTED_FILES_AND_COMPONENTS.md](./EXPECTED_FILES_AND_COMPONENTS.md)**
📁 **Deliverables Checklist**  
Detailed breakdown of:
- Exact files that should be created (7 new files)
- Exact files that should be modified (2-3 existing files)
- Expected component tree structure
- Data format examples (localStorage JSON)
- Component interfaces and expected exports

**Use this to verify:**
- Google AI Studio created all the right files
- Files are in the right locations
- Components have the expected functions/props

---

### 4. **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)**
✅ **Testing Guide**  
Comprehensive checklist with 100+ items organized by feature:
- Navbar & toggle button
- Editor panel appearance
- Slide list functionality
- Image upload testing
- Live preview validation
- Data persistence checks
- Code quality review
- Edge case handling

**Use this to:**
- Manually test every feature
- Catch bugs before pushing to GitHub
- Sign off on implementation quality

---

### 5. **[MIGRATION_TO_SUPABASE.md](./MIGRATION_TO_SUPABASE.md)**
🚀 **Future Migration Guide**  
Step-by-step guide for migrating from Build Mode (localStorage) to Supabase production:
- Database schema
- Migration script
- Hook replacement strategy
- Removing build mode code
- Adding admin authentication (optional)

**Use this when:**
- Build Mode is complete and working
- You're ready to deploy to production
- You want permanent data storage

---

## 🚀 How to Use This Package

### For You (Project Owner):
1. Read **GOOGLE_AI_STUDIO_PROMPT.md** to understand what you're asking for
2. Copy the prompt into Google AI Studio
3. Let it implement
4. Use **EXPECTED_FILES_AND_COMPONENTS.md** to verify files exist
5. Use **VERIFICATION_CHECKLIST.md** to test everything

### For Google AI Studio:
1. Receive **GOOGLE_AI_STUDIO_PROMPT.md**
2. Implement according to specifications
3. Create all files in expected locations
4. Mark all code with "// BUILD MODE ONLY" comments
5. Ensure live preview works and data persists

### For You Again (After Implementation):
1. Pull code from GitHub
2. Run the app locally
3. Check **VERIFICATION_CHECKLIST.md** line-by-line
4. Test all features
5. Verify no console errors
6. Commit and push to GitHub
7. Deploy to Vercel

### For Future Migration:
1. When ready for production
2. Follow **MIGRATION_TO_SUPABASE.md**
3. Set up Supabase
4. Migrate data
5. Remove Build Mode code
6. Deploy with real backend

---

## 📋 Quick Summary

### What Gets Built
✅ Floating "Build Mode" button in navbar  
✅ Editor panel with slide list  
✅ Image upload (file + drag-drop)  
✅ Text editing (title, subtitle, button, link)  
✅ Add/delete/reorder slides  
✅ Live preview (instant updates)  
✅ localStorage persistence  
✅ Responsive design  

### What Stays Out
❌ Admin authentication  
❌ Backend API calls  
❌ Production CMS  
❌ Database integration  
❌ Complex state management  
❌ Unnecessary UI polish  

### Technologies Used
- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **State:** React hooks + localStorage
- **Storage:** Browser localStorage (temporary)
- **Images:** base64 data URLs

---

## 🎯 Success Criteria

### The build is complete when:
- ✅ All files exist in correct locations
- ✅ Build Mode button toggles on/off
- ✅ Editor panel appears when enabled
- ✅ Can upload images (from computer, drag-drop)
- ✅ Can edit all text fields (title, subtitle, etc.)
- ✅ Live preview updates instantly (no refresh needed)
- ✅ Data persists in localStorage
- ✅ Page refresh keeps edits
- ✅ Zero console errors
- ✅ Code has "// BUILD MODE ONLY" comments

### Verification takes ~30 minutes:
1. Run through VERIFICATION_CHECKLIST.md
2. Test each feature
3. Check file structure
4. Review code quality

---

## 📂 File Structure After Implementation

```
src/
├── components/
│   ├── Hero.tsx (MODIFIED)
│   ├── Navbar.tsx (MODIFIED)
│   └── BuildModeEditor/ (NEW FOLDER)
│       ├── BuildModeEditor.tsx
│       ├── BuildModeToggle.tsx
│       ├── HeroSlideEditor.tsx
│       ├── SlideList.tsx
│       └── ImageUploader.tsx
├── hooks/
│   └── useBuildMode.ts (NEW)
├── types/
│   └── buildMode.ts (NEW)
└── ...
```

---

## 🔄 Implementation Workflow

```
You Hand Off Documents to Google AI Studio
           ↓
      AI Studio Reads GOOGLE_AI_STUDIO_PROMPT.md
           ↓
      AI Studio Implements Feature
           ↓
      AI Studio Commits to GitHub
           ↓
      You Pull Code Locally
           ↓
      You Check EXPECTED_FILES_AND_COMPONENTS.md
           ↓
      You Run VERIFICATION_CHECKLIST.md
           ↓
      All Tests Pass? ✅
           ↓
      Deploy to Vercel
           ↓
      (Later) Follow MIGRATION_TO_SUPABASE.md for production
```

---

## ⚠️ Important Notes

### Scope: Hero Section Only
- Phase 1 covers **Hero carousel editing only**
- Shaku Maku Feed editor comes in Phase 2 (if needed)
- Text/captions editor comes in Phase 3 (if needed)

### This is Temporary
- Build Mode is for the **AI Studio build phase**
- Data is in **browser localStorage** (not permanent)
- Easy to **replace with Supabase** later
- All code marked with **"// BUILD MODE ONLY"** comments

### Live Preview is Critical
- Every edit must update the hero **instantly**
- No save button or refresh needed
- User sees exactly what it looks like before pushing to GitHub

### Data Persistence
- Uses browser **localStorage** (simple, no backend needed)
- Survives page refresh
- Lost when browser cache is cleared
- Perfect for build phase

---

## 🆘 If Something Goes Wrong

### Google AI Studio Hallucinates Features
→ Point to the "DO NOT" section in GOOGLE_AI_STUDIO_PROMPT.md

### Live Preview Doesn't Update
→ Check Hero component is using useBuildMode hook
→ Verify Hero component re-renders on state change

### Data Doesn't Persist After Refresh
→ Check useBuildMode hook is reading from localStorage on mount
→ Verify key is "belive_hero_build_mode"

### Images Don't Upload
→ Check ImageUploader component is implemented
→ Verify file input has accept="image/*"

### Console Errors
→ Check all imports are correct
→ Check hooks are called at top level (not conditionally)
→ Check TypeScript types match

---

## 📞 Next Steps

### Right Now:
1. Review **GOOGLE_AI_STUDIO_PROMPT.md**
2. Share with Google AI Studio / Claude Code

### After Implementation:
1. Pull code from GitHub
2. Test using **VERIFICATION_CHECKLIST.md**
3. Fix any issues
4. Commit and push

### For Phase 2 (Shaku Maku):
- Similar process
- Same Build Mode architecture
- Feed items instead of carousel slides

### For Production (Supabase):
- Reference **MIGRATION_TO_SUPABASE.md**
- Set up database
- Migrate data
- Replace localStorage with Supabase
- Add admin auth if needed

---

## 📖 Document Reference

| Document | Purpose | When to Use |
|----------|---------|------------|
| GOOGLE_AI_STUDIO_PROMPT.md | Directive for AI Studio | Before implementation |
| GOOGLE_AI_STUDIO_DIRECTIVE.md | Detailed spec | During implementation |
| EXPECTED_FILES_AND_COMPONENTS.md | Deliverables checklist | After implementation |
| VERIFICATION_CHECKLIST.md | Testing guide | During testing phase |
| MIGRATION_TO_SUPABASE.md | Production migration | When moving to backend |

---

## ✨ Key Features

### For Users (During Build):
- 🎨 Visual editor with live preview
- 📤 Drag-and-drop image upload
- ✏️ Edit all text fields
- ➕ Add/delete/reorder slides
- 💾 Auto-save (no button needed)
- 🔄 Edits persist across refresh

### For Developers:
- 🧹 Clean, modular code
- 📝 Clear comments marking build-mode code
- 🔌 Easy to swap with Supabase later
- 📦 No external dependencies needed
- ✅ TypeScript ready
- 🎯 No console errors

### For the Project:
- ⚡ Fast iteration during build
- 🎨 Visual feedback immediately
- 🔒 No backend complexity
- 📱 Responsive design
- 🚀 Scales to production cleanly

---

## 🎓 Learning Resources

If you need more context:
- React hooks: https://react.dev/reference/react
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- TypeScript interfaces: https://www.typescriptlang.org/docs/handbook/2/objects.html
- Tailwind CSS: https://tailwindcss.com/docs

---

## 📝 Version Info

- **Package Version:** 1.0
- **Date Created:** April 14, 2026
- **Tech Stack:** Next.js 14+, TypeScript, React 18+, Tailwind CSS
- **Status:** Ready for Implementation
- **Phase:** 1 of 3 (Hero only)

---

## ✅ Checklist Before Handing Off

- [x] All 5 documents created and complete
- [x] GOOGLE_AI_STUDIO_PROMPT.md is clear and explicit
- [x] EXPECTED_FILES_AND_COMPONENTS.md lists all deliverables
- [x] VERIFICATION_CHECKLIST.md is comprehensive
- [x] MIGRATION_TO_SUPABASE.md is detailed
- [x] File structure is clear
- [x] Success criteria are specific
- [x] DO NOT section prevents over-building
- [x] Comments explain purpose of each document

---

## 🚀 Ready to Start?

1. **Next Step:** Copy entire content of **GOOGLE_AI_STUDIO_PROMPT.md** into Google AI Studio
2. **Then:** Let it build and implement
3. **Finally:** Follow **VERIFICATION_CHECKLIST.md** to test

Good luck! This should result in a clean, functional Build Mode editor that makes it easy to edit your hero section before pushing to GitHub. 🎉
