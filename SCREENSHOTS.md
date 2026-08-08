# 📸 Screenshot Guide

This guide explains what screenshots to capture for the README.

## Setup

1. Create a `screenshots/` folder in the project root:
   ```bash
   mkdir screenshots
   ```

2. Take screenshots using your browser's built-in tools or a tool like:
   - **Windows**: `Win + Shift + S` → Save to `screenshots/`
   - **Mac**: `Cmd + Shift + 4` → Save to `screenshots/`
   - **Browser Extension**: Full Page Screenshot or Awesome Screenshot

---

## Required Screenshots

### 1. **Landing Page** (`landing-page.png`)
**URL**: `http://localhost:3000/`

**What to capture:**
- Full page showing:
  - Glassmorphic floating island at the top (with logo + "Start Your Route" button)
  - 3D liquid metal hero section with sphere
  - Three tilted cards (01 MAP, 02 FEED, 03 LOOP)
- Make sure the page is scrolled to show the hero and at least 2 cards

**Tips:**
- Use full-page screenshot extension to capture the entire landing page
- Make sure the aurora shader is NOT visible (landing page has no shader)

---

### 2. **Auth Page** (`auth-page.png`)
**URL**: `http://localhost:3000/auth`

**What to capture:**
- The modern login/signup form with glassmorphic design
- Show either the Sign In or Sign Up tab (your choice)
- Center the form in the viewport

**Tips:**
- Crop to show just the central auth card + some surrounding space
- No need to fill in the form fields

---

### 3. **Onboarding Page** (`onboarding-page.png`)
**URL**: `http://localhost:3000/onboarding`

**What to capture:**
- The chat interface showing at least 2-3 messages
- The AI bot icon and user message bubbles
- The input field at the bottom with "Send" button
- Progress indicator at the top ("Step 1 of 4")

**How to get this:**
1. Navigate to `/onboarding`
2. Answer the first question ("Who do you want to become?")
3. Let the AI respond with the second question
4. Take screenshot showing both messages + input field

**Tips:**
- Make sure the aurora shader background is visible (cyan/green flowing animation)
- Show the floating island header at the top with "Curator AI" branding

---

### 4. **Identity Page** (`identity-page.png`)
**URL**: `http://localhost:3000/identity`

**What to capture:**
- The full identity map page showing:
  - Radar chart (pentagon) with 5 dimensions
  - Gap theme card on the right ("Primary Focus Area: Focus")
  - Current behavior traits tags
  - Aspirational identity traits tags
- The page header ("Identity Gap Analysis")

**How to get this:**
- Complete the onboarding flow first (answer all 4 questions)
- You'll be redirected to `/identity`
- Take a full-page screenshot showing the radar chart + sidebar

**Tips:**
- The radar chart should show both the orange "Current Identity" area and the green "Goal Identity" outline
- Make sure the aurora shader is visible in the background

---

### 5. **Recommendations Page** (`recommendations-page.png`)
**URL**: `http://localhost:3000/recommendations?gapTheme=Focus`

**What to capture:**
- The daily feed showing all 3 recommendation cards
- Each card should show:
  - Resource type icon (Book, Course, Video, etc.)
  - Title
  - Description
  - "View Resource" and "Reflect" buttons
- The page header ("Curated Growth Moments")

**How to get this:**
- Navigate to identity page first
- Click "View Curated Resources" button
- Take screenshot showing all 3 cards stacked vertically

**Tips:**
- Aurora shader should be visible
- Try to capture the hover state on one card (it will glow)

---

### 6. **Reflection Modal** (`reflection-modal.png`)
**URL**: Navigate to recommendations page, click "Reflect" button on any card

**What to capture:**
- The reflection dialog overlay showing:
  - "Reflect on [Resource Title]" header
  - Textarea for journaling
  - "Submit Reflection" button
  - The darkened background behind the modal

**How to get this:**
1. Go to recommendations page
2. Click the "Reflect" button on any resource card
3. The modal will appear
4. Take screenshot

**Tips:**
- You can type a sample reflection in the textarea to show how it looks
- Capture the full modal including the blurred background

---

## Optional Screenshots

### 7. **Reflection Success Banner** (`reflection-success.png`)
- After submitting a reflection, capture the success banner showing updated alignment score
- Shows on the recommendations page after reflection is complete

### 8. **Mobile View** (if responsive)
- Capture landing page, auth, and onboarding on mobile screen size (375px width)
- Use browser DevTools responsive mode

---

## Image Specifications

- **Format**: PNG (best quality) or JPG (smaller file size)
- **Resolution**: 1920×1080 or higher for full-page shots
- **File size**: Compress if over 500KB (use tinypng.com)
- **Naming**: Use kebab-case (e.g., `landing-page.png`, not `Landing Page.png`)

---

## After Taking Screenshots

1. Save all images to `screenshots/` folder:
   ```
   curator-ai/
   ├── screenshots/
   │   ├── landing-page.png
   │   ├── auth-page.png
   │   ├── onboarding-page.png
   │   ├── identity-page.png
   │   ├── recommendations-page.png
   │   └── reflection-modal.png
   ├── README.md
   └── ...
   ```

2. Update README.md image links:
   - Replace `<!-- Replace with: ![Landing Page](./screenshots/landing-page.png) -->`
   - With: `![Landing Page](./screenshots/landing-page.png)`

3. Commit and push:
   ```bash
   git add screenshots/ README.md
   git commit -m "Add frontend screenshots to README"
   git push
   ```

---

## Tips for Great Screenshots

✅ **Do:**
- Use a clean browser window (close unnecessary tabs)
- Make sure the shader animations are visible where expected
- Show realistic content (filled forms, typed messages, etc.)
- Capture in light mode for better visibility

❌ **Don't:**
- Include personal information in forms
- Show browser dev tools or extensions
- Use low resolution or blurry images
- Forget to show the aurora shader on app pages

---

## Need Help?

If you're not sure what a particular screen looks like:
1. Start the dev server: `npm run dev`
2. Navigate to the URL listed above
3. Follow the steps to reach that screen
4. Take the screenshot

For full-page screenshots in Chrome:
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "screenshot"
4. Select "Capture full size screenshot"
