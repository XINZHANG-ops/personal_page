# Beer Scoring System Guide

## Overview
Your personal beer rating system with 6 scoring aspects, radar chart visualizations, and an easy-to-use Gradio UI for adding beers.

---

## 🚀 Quick Start - Adding a New Beer

### Using the Gradio UI (Recommended)

1. **Install Python dependencies (first time only):**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the UI:**
   ```bash
   python scripts/add_beer.py
   ```

3. **Open in browser:** Go to `http://127.0.0.1:7860`

4. **Fill in the form:**
   - Enter beer name, select style, set ABV
   - Write your tasting notes
   - Upload a photo (drag & drop or click)
   - Rate each of the 6 aspects using sliders (1-10)

5. **Save:** Click "💾 Save Beer" button

6. **Build the website:**
   ```bash
   npm run build-beer
   ```

7. **View:** Open `pages/beer.html` in your browser to see your new beer!

---

## The 6 Scoring Aspects (1-10 scale)

1. **麦芽香 Maltiness** - Malt character and sweetness
2. **颜色深浅 Color Depth** - Darkness or lightness of the beer
3. **浑浊度 Clarity** - How clear vs hazy the beer is
4. **苦度 Bitterness** - Hop bitterness level
5. **其他香味 Other Aromas** - Fruity, spicy, or other aromatic notes
6. **综合 Overall** - Total experience

---

## Beer Terminology

### **Style** - The category/type of beer

**Common Styles:**
- **IPA**: Hoppy, bitter, citrusy, floral
- **Stout**: Dark, roasted, coffee/chocolate, full-bodied
- **Lager**: Crisp, clean, refreshing, light
- **Pilsner**: Golden, hoppy, clean finish
- **Wheat Beer**: Light, fruity, cloudy, refreshing
- **Porter**: Dark, malty, smooth, sweet
- **Sour**: Tart, funky, acidic
- **Amber**: Balanced, malty, caramel
- **Pale Ale**: Balanced hops/malt
- **Belgian**: Complex, fruity, spicy

### **ABV (Alcohol By Volume)** - Strength

- **3-4%**: Light (sessionable)
- **4-6%**: Regular (standard)
- **7-10%**: Strong (intense)
- **10-15%**: Imperial (sipping)
- **15%+**: Extreme (rare)

---

## How It Works

```
1. Add beer via Gradio UI
   ↓
2. Image auto-saved to assets/images/beers/ (resized to 400x400 PNG)
   ↓
3. Beer data saved to data/beer.jsonl
   ↓
4. Run: npm run build-beer
   ↓
5. beer.js generated from beer.jsonl
   ↓
6. Open pages/beer.html to view!
```

### File Structure
```
├── scripts/add_beer.py      # Gradio UI
├── data/beer.jsonl          # Beer data
├── assets/images/beers/     # Photos (400x400 PNG)
├── js/beer.js               # AUTO-GENERATED
└── pages/beer.html          # Gallery page
```

---

## Commands

```bash
# Start Gradio UI to add beers
python scripts/add_beer.py

# Build beer.js from data
npm run build-beer

# Build everything
npm run build-all
```

---

## Tips

1. **Be Consistent** - Use same scale for all beers
2. **Take Notes Immediately** - Flavors fade from memory
3. **Use Half Points** - 7.5, 8.5 are valid!
4. **Compare Similar Styles** - IPA to IPA, Stout to Stout
5. **Context Matters** - Food pairing, temperature, mood

---

## Scoring Guide

- **9.0-10.0**: Exceptional
- **8.0-8.9**: Excellent
- **7.0-7.9**: Very Good
- **6.0-6.9**: Good
- **5.0-5.9**: Average
- **4.0-4.9**: Below Average
- **<4.0**: Poor

---

Enjoy! 🍺
