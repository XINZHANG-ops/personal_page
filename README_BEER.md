# 🍺 Beer Scoring System

An automated beer rating system with a Gradio UI for easy data entry, automatic image processing, and beautiful radar chart visualizations.

## Features

✅ **Gradio Web UI** - Easy-to-use interface for adding beers
✅ **Automatic Image Processing** - Auto-resize and convert to 400x400 PNG
✅ **JSONL Data Format** - Simple, human-readable, one beer per line
✅ **Radar Charts** - Visual representation of 6 scoring aspects
✅ **Smart Sorting** - Sort by any score aspect or date
✅ **Responsive Design** - Works on mobile, tablet, desktop

---

## Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (Gradio + Pillow)
pip install -r requirements.txt

# Node dependencies (already installed)
```

### 2. Add Your First Beer

```bash
# Start the Gradio UI
python add_beer.py
```

Open `http://127.0.0.1:7860` in your browser:

1. Fill in beer info (name, style, ABV)
2. Write tasting notes
3. Upload a photo
4. Rate the 6 aspects (sliders 1-10)
5. Click "💾 Save Beer"

### 3. Build the Website

```bash
# Generate beer.js from data/beer.jsonl
npm run build-beer

# Or build everything (beer + CSS/JS optimization)
npm run build-all
```

### 4. View Your Collection

Open `beer.html` in your browser!

---

## System Architecture

```
┌─────────────────┐
│  add_beer.py    │  Gradio UI for adding beers
│  (Gradio UI)    │
└────────┬────────┘
         │
         ↓ saves to
┌─────────────────┐
│ data/beer.jsonl │  One JSON object per line
└────────┬────────┘
         │
         ↓ npm run build-beer
┌─────────────────┐
│   js/beer.js    │  AUTO-GENERATED JavaScript
└────────┬────────┘
         │
         ↓ loaded by
┌─────────────────┐
│   beer.html     │  Your beer gallery page
└─────────────────┘
```

### Data Flow

```
User Input (Gradio)
  ↓
Image Processing (resize to 400x400, convert to PNG)
  ↓
Save to data/beer.jsonl
  ↓
npm run build-beer
  ↓
Generate js/beer.js
  ↓
Website displays beers
```

---

## File Structure

```
personal_page/
├── add_beer.py              # Gradio UI application
├── build-beer.cjs           # Build script (JSONL → JS)
├── requirements.txt         # Python dependencies
├── data/
│   └── beer.jsonl           # Beer data (one per line)
├── assets/images/beers/     # Beer photos (400x400 PNG)
├── js/
│   └── beer.js              # AUTO-GENERATED (don't edit!)
├── beer.html                # Beer gallery page
└── BEER_GUIDE.md            # Complete usage guide
```

---

## The 6 Scoring Aspects

Each beer is rated 1-10 on:

1. **麦芽香 Maltiness** - Malt character and sweetness
2. **颜色深浅 Color Depth** - Darkness or lightness of the beer
3. **浑浊度 Clarity** - How clear vs hazy the beer is
4. **苦度 Bitterness** - Hop bitterness level
5. **其他香味 Other Aromas** - Fruity, spicy, or other aromatic notes
6. **综合 Overall** - Total experience

Scores are visualized in a radar chart on each beer card.

---

## Build Commands Explained

### Beer-Specific Commands

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `python add_beer.py` | Start Gradio UI to add beers | Every time you want to add a new beer |
| `npm run build-beer` | Generate `js/beer.js` from `data/beer.jsonl` | **Required** after adding/editing/deleting beers |

### Main Site Build Commands

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `npm run build` | Minify CSS/JS (creates `main.min.css` and `main.min.js`) | After editing main site CSS/JS files |
| `npm run build-all` | Run `build-beer` + `build` (generates beer.js AND minifies everything) | After adding beers OR editing any CSS/JS |

### Quick Reference

```bash
# Added a new beer via Gradio UI?
npm run build-beer

# Changed beer.html, main.css, or main.js?
npm run build-all

# Just want to rebuild everything to be safe?
npm run build-all
```

### What Gets Generated?

- **`npm run build-beer`** creates:
  - `js/beer.js` (from `data/beer.jsonl`)

- **`npm run build`** creates:
  - `css/main.min.css` (minified version of `css/main.css`)
  - `js/main.min.js` (minified version of `js/main.js`)
  - `index.prod.html` (production HTML with minified assets)

- **`npm run build-all`** creates all of the above

### Important Notes

⚠️ **Always run `npm run build-beer` after adding beers** - The website loads from `js/beer.js`, not directly from `data/beer.jsonl`

💡 **Tip**: Use `npm run build-all` when in doubt - it rebuilds everything

---

## Technical Details

### What is Lazy Loading?

**Lazy loading** is a web optimization technique where images are only loaded when they're about to be visible on screen (e.g., when you scroll down to them). This saves bandwidth and speeds up initial page load.

In HTML, it looks like this:
```html
<img src="image.png" loading="lazy">
```

**Why we DON'T use it in the beer gallery:**
- Our images are created dynamically with JavaScript
- Lazy loading can cause issues with dynamically created images that aren't in the DOM yet
- It was causing images to appear as grey boxes instead of loading
- For a small collection (< 50 beers), the performance benefit is minimal

If you have 100+ beers and want to re-enable lazy loading, you'd need to adjust the image creation timing in the JavaScript.

### CSS Layout Fix

The beer card images use:
```css
.beer-card__image-container {
  position: relative;  /* Not flex - flex was hiding images */
}

.beer-card__image {
  display: block;  /* Ensures image takes up space */
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

Using `display: flex` on the container was causing the images to collapse to zero size, making them invisible (showing only the grey background).

---

## Manual Editing (Advanced)

### Add a beer manually:

1. Add image to `assets/images/beers/beer-name.png` (400x400 recommended)

2. Add a line to `data/beer.jsonl`:
   ```json
   {"id": "beer-id", "name": "Beer Name", "style": "IPA", "abv": 6.5, "date": "2024-01-07", "imageUrl": "assets/images/beers/beer-name.png", "notes": "Tasting notes...", "scores": {"maltiness": 8.5, "colorDepth": 9.0, "clarity": 8.7, "bitterness": 8.0, "otherAromas": 8.5, "overall": 8.6}}
   ```

3. Run `npm run build-beer`

### Edit a beer:

1. Edit the line in `data/beer.jsonl`
2. Run `npm run build-beer`

### Delete a beer:

1. Remove the line from `data/beer.jsonl`
2. Delete the image from `assets/images/beers/`
3. Run `npm run build-beer`

---

## JSONL Format

Each line in `data/beer.jsonl` is a complete JSON object:

```json
{
  "id": "guinness-draught",
  "name": "Guinness Draught",
  "style": "Irish Dry Stout",
  "abv": 4.2,
  "date": "2024-01-07",
  "imageUrl": "assets/images/beers/guinness-draught.png",
  "notes": "Smooth, creamy with roasted malt flavors. Perfect pour with cascading bubbles.",
  "scores": {
    "maltiness": 9.0,
    "colorDepth": 8.0,
    "clarity": 8.5,
    "bitterness": 9.5,
    "otherAromas": 8.5,
    "overall": 8.7
  }
}
```

**Benefits of JSONL:**
- Each line is independent (easy to add/remove)
- Human-readable
- Can be edited in any text editor
- Easy to backup/version control
- Simple to parse

---

## Gradio UI Features

- **Smart Filename Generation** - Beer name → URL-safe filename
- **Auto Image Resizing** - Any image → 400x400 PNG
- **Duplicate Detection** - Prevents adding same beer twice
- **Collection Viewer** - See all your beers sorted by date
- **Validation** - Ensures required fields are filled
- **Score Sliders** - Easy 1-10 rating with 0.5 increments

---

## Tips

1. **Use the Gradio UI** - Much easier than manual editing
2. **Take photos with good lighting** - Better images = better cards
3. **Write notes immediately** - Flavors fade from memory
4. **Be consistent** - Use same scale for all beers
5. **Backup your data** - `data/beer.jsonl` contains everything
6. **Run build after changes** - Website doesn't auto-update

---

## Troubleshooting

**Q: Beer doesn't show on website after adding?**
A: Run `npm run build-beer` - the website loads from `js/beer.js`, not `data/beer.jsonl`

**Q: Image doesn't load?**
A: Check `assets/images/beers/` - filename should match what's in the JSONL

**Q: Gradio UI won't start?**
A: Install dependencies: `pip install -r requirements.txt`

**Q: Can I use JPG images?**
A: Yes! The UI automatically converts to PNG

**Q: How do I backup my data?**
A: Copy `data/beer.jsonl` and `assets/images/beers/` folder

---

## Example Workflow

```bash
# Morning: Try a new beer
# Take a photo

# Afternoon: Add to collection
python add_beer.py
# Fill in form, upload photo, save

# Build website
npm run build-beer

# View your collection
open beer.html

# Commit to git
git add data/beer.jsonl assets/images/beers/ js/beer.js
git commit -m "Add Guinness Draught"
git push
```

---

Enjoy tracking your beer journey! 🍺🎉
