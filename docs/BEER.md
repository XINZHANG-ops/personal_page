# 🍺 Beer Scoring System Documentation

An automated beer rating system with a Gradio UI for easy data entry, automatic image processing, and beautiful radar chart visualizations.

## Features

✅ **Gradio Web UI** - Easy-to-use interface for adding beers
✅ **Automatic Image Processing** - Auto-resize and convert to 400x400 PNG
✅ **JSONL Data Format** - Simple, human-readable, one beer per line
✅ **SVG Radar Charts** - Pure vector graphics, infinitely scalable
✅ **Smart Sorting** - Sort by any score aspect or date
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **No External Dependencies** - All charts rendered natively, no CDN required

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (Gradio + Pillow)
pip install -r requirements.txt
```

### 2. Add Your First Beer

#### Using the Gradio UI (Recommended)

```bash
# Start the UI
python scripts/add_beer.py

# Browser opens automatically to http://127.0.0.1:7860
```

**Fill in the form:**
- Enter beer name, select style, set ABV
- Write your tasting notes
- Upload a photo (drag & drop or click)
- Rate each of the 6 aspects using sliders (1-10)
- Click "💾 Save Beer" button

### 3. Build the Website

```bash
# Generate beer.js from data/beer.jsonl
npm run build-beer
```

### 4. View Your Collection

Open `pages/beer.html` in your browser!

---

## 📊 Scoring System

Each beer is rated on 6 aspects (1-10 scale):

### The 6 Scoring Aspects

1. **麦芽香 (Maltiness)** - Malt aroma and sweetness
2. **颜色深浅 (Color Depth)** - From pale yellow to deep black
3. **浑浊度 (Clarity)** - From crystal clear to opaque
4. **苦度 (Bitterness)** - Hop bitterness level
5. **其他香味 (Other Aromas)** - Fruit, spice, coffee notes
6. **综合 (Overall)** - Your overall impression

### Adding Beers Manually (Advanced)

If you prefer to edit the data file directly:

```bash
# Edit data/beer.jsonl
# Each line is a JSON object:
```

```json
{
  "name": "Example IPA",
  "style": "IPA",
  "abv": 6.5,
  "notes": "Citrus forward with pine finish",
  "scores": {
    "maltiness": 5,
    "colorDepth": 6,
    "clarity": 7,
    "bitterness": 8,
    "otherAromas": 7,
    "overall": 7.5
  },
  "imageUrl": "../assets/images/beers/example-ipa.png",
  "date": "2024-01-15"
}
```

Then rebuild: `npm run build-beer`

---

## 🖼️ Image Management

### Automatic Processing
The Gradio UI automatically:
- Resizes images to 400x400px
- Converts to PNG format
- Saves to `assets/images/beers/`
- Uses timestamp-based naming

### Manual Image Addition
1. Add images to `assets/images/beers/`
2. Use format: `beer-name-timestamp.png`
3. Reference in JSONL: `"imageUrl": "../assets/images/beers/your-image.png"`
   (Note: Use `../` prefix because beer.html is in the pages/ directory)

---

## 📁 File Structure

```
data/
└── beer.jsonl              # Beer data (one JSON per line)

scripts/
├── add_beer.py            # Gradio UI for adding beers
└── build-beer.cjs         # Generates beer.js from JSONL

js/
└── beer.js                # Auto-generated, DO NOT EDIT

pages/
└── beer.html              # Beer gallery page

assets/images/beers/       # Beer photos (400x400 PNG)
```

---

## 🛠️ Technical Details

### Data Format (JSONL)
- One beer per line
- Human-readable JSON
- Easy to version control
- Simple to edit manually

### Build Process
```
data/beer.jsonl → build-beer.cjs → js/beer.js → pages/beer.html
```

### SVG Radar Charts
- **Pure vector graphics**: Infinitely scalable, no quality loss when zooming
- **No external dependencies**: No Chart.js or CDN, just native SVG
- **Lightweight**: Smaller file size, faster loading
- **Accessible**: Built-in tooltips show score details on hover
- **Custom implementation**: Full control over appearance and behavior

### Performance
- No lazy loading for beer images (prevents grey box issues)
- Minified assets in production
- Responsive grid layout
- Hardware-accelerated animations
- SVG charts render instantly with no external libraries

---

## 🎨 Customization

### Modify Scoring Aspects
Edit the scoring categories in:
- `scripts/add_beer.py` - Update Gradio form
- `scripts/build-beer.cjs` - Update template
- `css/main.css` - Update styles

### Change Visual Theme
Beer cards use CSS custom properties:
```css
.beer-card {
  --beer-card-bg: #ffffff;
  --beer-card-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

---

## 🐛 Troubleshooting

### Port 7860 Already in Use
```bash
# Kill existing process
pkill -f "python.*add_beer.py"
# or
lsof -ti:7860 | xargs kill
```

### Images Not Loading
- Check image path starts with `../` in beer.js
- Verify images exist in `assets/images/beers/`
- Check browser console for 404 errors

### Build Not Working
```bash
# Clean and rebuild
rm js/beer.js
npm run build-beer
```

---

## 🚢 Deployment

The beer gallery is part of the main portfolio site:
1. Add beers locally using Gradio UI
2. Build with `npm run build-beer`
3. Commit and push to GitHub
4. GitHub Pages auto-deploys

---

## 📈 Future Enhancements

- [ ] Beer style statistics
- [ ] Favorite beers section
- [ ] Export to CSV/PDF
- [ ] Share individual beer ratings
- [ ] Comparison mode
- [ ] Tasting session tracker