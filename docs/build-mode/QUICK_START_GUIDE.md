# Quick Start Guide
## Implementation in 3 Steps

---

## Step 1️⃣: Hand Off to Google AI Studio
### (5 minutes)

**Copy the entire text from this file:**
👉 **GOOGLE_AI_STUDIO_PROMPT.md**

**Paste it into Google AI Studio / Claude Code and say:**
> "Implement this exactly as specified. Do not deviate from the requirements."

**What to expect:**
- AI Studio will ask clarifying questions (answer them)
- It will implement the Build Mode editor
- It will commit to GitHub
- Total time: 30 minutes to 2 hours

---

## Step 2️⃣: Pull Code & Verify Files
### (10 minutes)

**After Google AI Studio commits, pull the code:**
```bash
git pull origin main
```

**Check that all files exist:**
```
src/
├── components/
│   ├── Hero.tsx (MODIFIED)
│   ├── Navbar.tsx (MODIFIED)
│   └── BuildModeEditor/
│       ├── BuildModeEditor.tsx ✓
│       ├── BuildModeToggle.tsx ✓
│       ├── HeroSlideEditor.tsx ✓
│       ├── SlideList.tsx ✓
│       └── ImageUploader.tsx ✓
├── hooks/
│   └── useBuildMode.ts ✓
└── types/
    └── buildMode.ts ✓
```

**Verify file content:**
- [ ] All "BUILD MODE ONLY" comments are present
- [ ] No console errors when opening files
- [ ] TypeScript types are defined

---

## Step 3️⃣: Test Everything
### (30 minutes)

**Run the app:**
```bash
npm run dev
```

**Open a browser and test:**

### Quick Test (5 minutes)
- [ ] "Build Mode" button appears in navbar
- [ ] Click button → editor panel appears
- [ ] Click button again → panel disappears
- [ ] Click "Add New Slide" → new slide added
- [ ] Edit title → hero title updates instantly
- [ ] Upload image → image appears in hero
- [ ] Refresh page → edits still there

### Full Test (25 minutes)
👉 Use **VERIFICATION_CHECKLIST.md**  
This has 100+ detailed test items organized by feature

---

## If All Tests Pass ✅

You're done! Your Build Mode editor is ready.

### Next:
1. Test in Google AI Studio with real edits
2. Make final design tweaks
3. Commit final version to GitHub
4. Deploy to Vercel

---

## If Tests Fail ❌

### Common Issues:

**Issue: Build Mode button doesn't appear**
- Check: Is `<BuildModeToggle />` in Navbar.tsx?
- Fix: Verify import and component usage

**Issue: Editor panel doesn't show edits**
- Check: Is `useBuildMode()` called in Hero.tsx?
- Fix: Verify Hero reads from hook

**Issue: Images don't upload**
- Check: Is `<ImageUploader />` implemented?
- Fix: Verify file input type="file" accept="image/*"

**Issue: Changes don't persist**
- Check: Is localStorage being written?
- Fix: Verify `useBuildMode.ts` saves to localStorage

**Issue: Any console errors**
- Check: Open DevTools (F12) → Console tab
- Fix: Look for red error messages and fix them

👉 For more troubleshooting, see **VERIFICATION_CHECKLIST.md** → "If Tests Fail" section

---

## Timeline

| Task | Time | Owner |
|------|------|-------|
| Hand off to AI Studio | 5 min | You |
| AI Studio implements | 30-120 min | Google AI Studio |
| Pull code & verify files | 10 min | You |
| Run test suite | 30 min | You |
| Debug (if needed) | 15-30 min | You |
| **Total** | **1.5-3 hours** | - |

---

## What You're Building

A **lightweight editor** inside your app that lets you:

```
🎨 Edit Hero Slides
├─ 📤 Upload images
├─ ✏️  Edit text (title, subtitle, button)
├─ ➕ Add slides
├─ ➖ Delete slides
├─ 🔄 Reorder slides
└─ 💾 Auto-save to browser

✅ Live Preview
└─ Hero updates instantly as you edit

🔒 Temporary Build Mode
└─ Data in browser, easy to replace with Supabase later
```

---

## Where to Find Things

| What | File |
|------|------|
| 🎯 Main Directive | GOOGLE_AI_STUDIO_PROMPT.md |
| 📋 Detailed Spec | GOOGLE_AI_STUDIO_DIRECTIVE.md |
| 📁 File Checklist | EXPECTED_FILES_AND_COMPONENTS.md |
| ✅ Test Checklist | VERIFICATION_CHECKLIST.md |
| 🚀 Future Migration | MIGRATION_TO_SUPABASE.md |
| 📖 Full Guide | README_IMPLEMENTATION_PACKAGE.md |

---

## Success Looks Like

### After 1 hour:
```
✅ Build Mode button visible
✅ Editor panel appears/disappears
✅ Can add/delete/reorder slides
✅ Can upload images
✅ Can edit text
✅ Live preview works
✅ Edits persist on refresh
✅ No console errors
```

---

## Key Constraints (Don't Forget!)

🚫 **Don't Build:**
- ❌ Admin login/auth
- ❌ Backend API
- ❌ Production CMS
- ❌ Fake features
- ❌ Unnecessary complexity

✅ **Do Build:**
- ✅ Simple, working editor
- ✅ localStorage persistence
- ✅ Live preview
- ✅ Clean code with "BUILD MODE ONLY" comments
- ✅ Easy to replace with Supabase later

---

## Questions?

### For Scope Questions:
→ Check **GOOGLE_AI_STUDIO_PROMPT.md** "DO NOT" section

### For File/Component Questions:
→ Check **EXPECTED_FILES_AND_COMPONENTS.md**

### For Testing Questions:
→ Check **VERIFICATION_CHECKLIST.md**

### For Migration Questions:
→ Check **MIGRATION_TO_SUPABASE.md**

### For Detailed Requirements:
→ Check **GOOGLE_AI_STUDIO_DIRECTIVE.md**

---

## Let's Do This! 🚀

1. Open **GOOGLE_AI_STUDIO_PROMPT.md**
2. Copy the entire content
3. Paste into Google AI Studio
4. Come back in 1-2 hours
5. Run the verification checklist
6. Done! 🎉

Good luck! You've got this. 💪
