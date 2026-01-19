# Personal Portfolio Website
test
Portfolio website for Xin Zhang - AI/ML Engineer and Researcher

**Live Site:** https://xinzhang-ops.github.io/personal_page/

---

## 📁 Project Structure

```
personal_page/
├── index.html              # Main portfolio page
├── pages/                  # HTML pages
│   ├── beer.html          # Beer rating gallery
│   └── test-*.html        # Test pages
├── scripts/                # Build and utility scripts
│   ├── add_beer.py        # Gradio UI for adding beers
│   ├── build-beer.cjs     # Build script for beer.js
│   └── build-optimize.cjs # Build script for minification
├── css/
│   ├── main.css           # Main stylesheet (edit this)
│   └── main.min.css       # Minified CSS (auto-generated)
├── js/
│   ├── main.js            # Main site JavaScript (edit this)
│   ├── main.min.js        # Minified JS (auto-generated)
│   └── beer.js            # Beer gallery JS (auto-generated)
├── assets/
│   └── images/
│       ├── profile/       # Profile photos
│       ├── projects/      # Project screenshots
│       └── beers/         # Beer photos
├── data/
│   └── beer.jsonl         # Beer data (one beer per line)
├── docs/                   # Documentation
│   ├── BEER.md            # Beer system documentation
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── OPTIMIZATION.md    # Performance optimization
├── tests/                  # Test files
│   ├── performance-test.js
│   ├── validate-*.js
│   └── verify-deployment.js
└── readme.md              # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (for beer rating system)
pip install -r requirements.txt

# Node dependencies (if not already installed)
npm install
```

### 2. Development

```bash
# Edit the site
# - Edit index.html for content
# - Edit css/main.css for styles
# - Edit js/main.js for functionality

# After making changes, rebuild:
npm run build-all
```

### 3. Add Beer Ratings

```bash
# Start the Gradio UI
python scripts/add_beer.py

# After adding beers, rebuild
npm run build-beer
```

---

## 🛠️ Build Commands

### Main Commands

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `npm run build` | Minify CSS/JS for the main site | After editing `main.css` or `main.js` |
| `npm run build-beer` | Generate `beer.js` from beer data | After adding/editing beers via Gradio UI |
| `npm run build-all` | Run both `build-beer` + `build` | **Safest option** - rebuilds everything |

### Other Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests |
| `npm run perf` | Performance testing |
| `npm run optimize` | Build + performance test |
| `npm run verify-deployment` | Verify deployment is ready |
| `npm run deploy-check` | Run tests + verify deployment |

### Quick Reference

```bash
# Changed main site HTML/CSS/JS?
npm run build

# Added a new beer?
npm run build-beer

# Not sure what changed? Rebuild everything:
npm run build-all
```

---

## 📦 What Gets Generated?

### `npm run build` creates:
- `css/main.min.css` - Minified CSS (~21% smaller)
- `js/main.min.js` - Minified JavaScript (~17% smaller)

### `npm run build-beer` creates:
- `js/beer.js` - Auto-generated from `data/beer.jsonl`

### `npm run build-all` creates:
- All of the above

---

## ⚙️ How It Works

### Main Site
1. Edit files: `index.html`, `css/main.css`, `js/main.js`
2. Run `npm run build` to minify CSS/JS
3. The site loads the minified versions for better performance

### Beer Rating System
1. Add beers via `python scripts/add_beer.py` (Gradio UI)
2. Data saved to `data/beer.jsonl` (one JSON object per line)
3. Run `npm run build-beer` to generate `js/beer.js`
4. `pages/beer.html` loads `js/beer.js` to display beers

**Why the build step?** The website loads from the generated files (`beer.js`, `main.min.css`) not the source files. This allows for:
- Automatic code generation from data
- Minification for faster loading
- Separation of data and presentation

---

## 🍺 Beer Scoring System

See **[docs/BEER.md](docs/BEER.md)** for full documentation on:
- Using the Gradio UI to add beers
- Rating system (6 aspects)
- Manual editing of beer data
- Troubleshooting

Quick workflow:
```bash
# Add a beer
python scripts/add_beer.py

# Rebuild
npm run build-beer

# View
open pages/beer.html
```

---

## 📝 Editing Content

### Update Profile/About Section
Edit `index.html` - find the section with `id="about"`

### Add/Edit Projects
Edit `js/main.js` - find the `projects` array:
```javascript
const projects = [
    {
        id: "project-id",
        title: "Project Title",
        description: "Project description...",
        technologies: ["Tech1", "Tech2"],
        liveUrl: "https://...",
        githubUrl: "https://github.com/...",
        imageUrl: "assets/images/projects/project.png",
        featured: true,
        size: "medium"
    }
];
```

After editing, run `npm run build` to minify.

### Add/Edit Writing
Edit `js/main.js` - find the `writings` array:
```javascript
const writings = [
    {
        id: "writing-id",
        title: "Title",
        description: "Description...",
        date: "2024-01-01",
        url: "https://...",
        type: "article"
    }
];
```

After editing, run `npm run build` to minify.

---

## 🎨 Customizing Styles

Edit `css/main.css`:
- CSS custom properties (variables) at the top
- Mobile-first responsive design
- Breakpoints: 768px (tablet), 1024px (desktop), 1440px (large)

After editing, run `npm run build` to create `main.min.css`.

---

## 🚢 Deployment

The site is deployed to GitHub Pages:
- **Source:** `main` branch
- **URL:** https://xinzhang-ops.github.io/personal_page/

To deploy changes:
```bash
# Make changes
# Build everything
npm run build-all

# Commit and push
git add .
git commit -m "Update site"
git push
```

GitHub Pages will automatically update (may take a few minutes).

---

## 📚 Documentation

- **[Beer System](docs/BEER.md)** - Complete beer rating system documentation and guide
- **[Deployment](docs/DEPLOYMENT.md)** - GitHub/GitLab Pages deployment instructions
- **[Optimization](docs/OPTIMIZATION.md)** - Performance optimization and best practices

---

## 🔧 Technical Notes

### Why Minify?
- **Performance:** Smaller files = faster loading
- **main.css:** 35.7KB → 28.2KB (21.1% savings)
- **main.js:** 26.2KB → 21.7KB (17.0% savings)

### Why Not Lazy Loading for Beer Images?
Lazy loading was causing images to appear as grey boxes because:
- Images are created dynamically with JavaScript
- Lazy loading interferes with dynamically created images
- For small collections (<50 beers), performance impact is minimal

See [docs/BEER.md](docs/BEER.md) for more technical details.

---

## 🤝 Contributing

This is a personal portfolio, but if you find bugs or have suggestions:
1. Open an issue
2. Submit a pull request

---

## 📄 License

Personal portfolio - all rights reserved.

---

**Questions?** Check the documentation files or open an issue.
