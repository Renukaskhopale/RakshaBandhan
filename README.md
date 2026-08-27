# 🪔 Raksha Bandhan — Cinematic Invitation Website

A premium, cinematic, interactive Raksha Bandhan invitation — designed to feel like an emotional short film inside a browser.

---

## ✨ Features

- 7 full-screen cinematic scenes (Intro → Memories → Bond → Rakhi Reveal → Blast Transformation → Invitation → Emotional Ending)
- Three.js 3D Rakhi with gold beads, red ring, and floating particles
- Canvas-based particle systems (intro dust, blast explosion, invitation ambience)
- GSAP cinematic text reveals with custom easing
- Golden thread animation across Scene 2
- Particle explosion transition (Scene 4 → Scene 5)
- Animated diya flame on intro
- Floating rose petals
- Film grain overlay on memory scene
- Full audio support (with mute toggle)
- Scene navigation (buttons, keyboard arrows, swipe on mobile)
- Fully responsive: desktop → tablet → mobile
- Works offline — no server needed

---

## 🚀 How to Run

### Option 1: Just Open the File
Double-click `index.html` — it will open in your browser. Most features work instantly.

> ⚠️ For videos and some audio to load properly, use Option 2.

### Option 2: Live Server (Recommended)
1. Install [VS Code](https://code.visualstudio.com/)
2. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
3. Right-click `index.html` → **"Open with Live Server"**
4. The site opens at `http://127.0.0.1:5500`

### Option 3: Python HTTP Server
```bash
cd raksha-bandhan-invitation
python3 -m http.server 8080
# Open: http://localhost:8080
```

---

## 🎨 Customize Your Details

Open `script.js` and edit the `CONFIG` block at the very top:

```javascript
const CONFIG = {
  name:           'Your Name',           // ← Your name or family name
  date:           'August 19, 2025',     // ← Event date
  time:           '6:00 PM onwards',     // ← Event time
  venue:          'Your Venue, City',    // ← Venue name and address
  mapsUrl:        'https://maps.google.com/...', // ← Google Maps link (or leave '#')
  primaryColor:   '#C9963E',             // ← Main gold color (optional)
};
```

---

## 📸 How to Add Your Photos

Place your photos in the `assets/images/` folder with these exact filenames:

| File | Used In |
|---|---|
| `assets/images/childhood-1.jpg` | Scene 1 — left photo card |
| `assets/images/childhood-2.jpg` | Scene 1 — center photo card |
| `assets/images/childhood-3.jpg` | Scene 1 — right photo card |
| `assets/images/sibling.jpg`     | Scene 6 — ending background (optional) |
| `assets/images/family.jpg`      | Scene 6 — ending (optional) |

**Tips:**
- Portrait orientation (4:5 ratio) works best for childhood photos
- The site works beautifully even without photos — placeholder gradients are shown
- JPG or PNG both work fine

---

## 🎬 How to Add Videos (Optional)

Place video files in `assets/videos/`:

| File | Used In |
|---|---|
| `assets/videos/intro.mp4`    | Scene 0 — intro background (optional) |
| `assets/videos/memories.mp4` | Scene 1 — memories background |
| `assets/videos/ending.mp4`   | Scene 6 — ending background |

**Tips:**
- Keep videos under 20MB for fast loading
- Use `object-fit: cover` ratio — 16:9 landscape works best
- If a video is missing, a gradient background is shown automatically
- Compress videos with [HandBrake](https://handbrake.fr/) for best performance

---

## 🎵 How to Add Music

Place audio files in `assets/audio/`:

| File | Used In |
|---|---|
| `assets/audio/background.mp3` | Main ambient background music |
| `assets/audio/emotional.mp3`  | Memory and ending scenes |
| `assets/audio/celebration.mp3`| Blast transition and invitation scene |

**Tips:**
- MP3 format recommended
- Keep each file under 5MB
- Music only starts after user clicks "Begin the Journey" (browser policy)
- The site works perfectly without music — no errors

**Free music resources:**
- [Pixabay Music](https://pixabay.com/music/)
- [Mixkit](https://mixkit.co/)
- [Free Music Archive](https://freemusicarchive.org/)
- Search for: *Indian classical ambient*, *Raksha Bandhan background music*

---

## ⌨️ Navigation

| Input | Action |
|---|---|
| `→` Arrow / `Space` | Next scene |
| `←` Arrow | Previous scene |
| Swipe left (mobile) | Next scene |
| Swipe right (mobile) | Previous scene |
| Dot indicators | Jump to any scene |
| BACK / NEXT buttons | Navigate scenes |

---

## 🌐 Deployment

### GitHub Pages (Free)
1. Create a repository on [GitHub](https://github.com)
2. Upload all files (keep the folder structure)
3. Go to **Settings → Pages → Source → main branch**
4. Your site will be live at: `https://yourusername.github.io/raksha-bandhan-invitation/`

### Vercel (Free, Recommended)
1. Sign up at [vercel.com](https://vercel.com)
2. Click **"New Project"** → **"Import from GitHub"** (or drag and drop folder)
3. No settings needed — just deploy
4. Get a shareable link instantly

### Netlify (Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the entire `raksha-bandhan-invitation/` folder
3. Done — instant shareable link

---

## 📁 Project Structure

```
raksha-bandhan-invitation/
│
├── index.html          ← Main HTML (7 scene sections)
├── style.css           ← All visual styles, animations, responsive
├── script.js           ← Cinematic engine: Three.js, GSAP, particles
├── README.md           ← This file
│
└── assets/
    ├── images/         ← Add your family/sibling photos here
    ├── videos/         ← Add background videos here (optional)
    └── audio/          ← Add background music here (optional)
```

---

## 🛠️ Libraries Used (all via CDN)

| Library | Version | Purpose |
|---|---|---|
| Three.js | r134 | 3D Rakhi, particles, lighting |
| GSAP | 3.12.2 | Cinematic animations, text reveals |
| GSAP TextPlugin | 3.12.2 | Text animation |
| GSAP CustomEase | 3.12.2 | Silk easing curve |
| Lenis | 1.0.29 | Smooth scrolling base |
| Google Fonts | — | Cinzel Decorative, Cormorant Garamond |

---

## 📱 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

---

## ❤️ Made with love for Raksha Bandhan

*"A thread. A promise. A bond called Sibling Love."*
