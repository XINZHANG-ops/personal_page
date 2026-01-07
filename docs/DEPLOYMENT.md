# Deployment Guide

This document provides instructions for deploying the personal portfolio site to GitHub Pages or GitLab Pages.

---

## 📦 GitHub Pages Deployment (Current Setup)

Your site is currently configured for GitHub Pages deployment.

### Quick Start

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```

2. **Enable GitHub Pages** (first time only):
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select branch: `main`
   - Under "Folder", select: `/ (root)`
   - Click **Save**

3. **Access your site**:
   ```
   https://[username].github.io/[repository-name]
   ```
   For example: `https://xinzhang-ops.github.io/personal_page`

### File Structure

GitHub Pages will serve files directly from the root directory:

```
personal_page/
├── index.html              # Main landing page (served at root URL)
├── pages/
│   └── beer.html          # Beer page (accessed via /pages/beer.html)
├── css/
│   ├── main.css
│   └── main.min.css       # Minified CSS (production)
├── js/
│   ├── main.js
│   ├── main.min.js        # Minified JS (production)
│   └── beer.js            # Beer gallery functionality
├── assets/
│   ├── images/            # All images
│   └── icons/             # Favicons
└── data/
    └── beer.jsonl         # Beer data source
```

### Before Deploying

Always build and test locally:

```bash
# Build optimized assets
npm run build-beer  # Generate beer.js from data
npm run build       # Minify CSS and JS

# Test locally
# Open index.html in browser or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Updating Content

1. **Edit content**: Modify HTML, CSS, or JS files
2. **Add beers**: Use `python scripts/add_beer.py`
3. **Rebuild**: Run `npm run build-all`
4. **Commit and push**: Changes auto-deploy to GitHub Pages

### Deployment Time

- GitHub Pages typically updates within **1-5 minutes** after push
- Check deployment status: Repository → **Actions** (if using GitHub Actions) or **Settings → Pages**

---

## 🦊 GitLab Pages Deployment (Alternative)

If you want to use GitLab Pages instead, the repository includes a `.gitlab-ci.yml` configuration.

### Setup

1. **Push to GitLab** instead of GitHub:
   ```bash
   git remote add gitlab https://gitlab.com/[username]/[repo-name].git
   git push gitlab main
   ```

2. **Enable GitLab Pages** (usually enabled by default)

3. **Pipeline runs automatically**:
   - **Test**: Validates HTML and runs tests
   - **Build**: Optimizes assets and creates `public` directory
   - **Deploy**: Deploys to GitLab Pages

### Site URL

```
https://[username].gitlab.io/[repository-name]
```

### GitLab CI/CD Pipeline

The `.gitlab-ci.yml` includes these jobs:

1. **Test Job**: Runs `npm test` and validation
2. **Build Job**: Runs `npm run build`, creates `public/` directory
3. **Pages Job**: Deploys `public/` to GitLab Pages
4. **Performance Job** (manual): Optional performance testing

---

## 🛠️ Local Development

### Prerequisites

- **Node.js** and **npm** installed
- **Python** (for beer rating UI)

### Development Workflow

```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt  # For beer system

# 2. Make changes to your files
# - Edit index.html for content
# - Edit css/main.css for styles
# - Edit js/main.js for functionality

# 3. Add beers (optional)
python scripts/add_beer.py
npm run build-beer

# 4. Build optimized assets
npm run build

# 5. Test locally
python -m http.server 8000
# Open http://localhost:8000

# 6. Deploy
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🔍 Troubleshooting

### Images Not Loading

**Problem**: Images show as broken after deployment

**Solutions**:
- Check that all image paths are relative (not absolute)
- Verify images exist in `assets/images/`
- For beer.html, paths should use `../assets/` (one level up)
- For index.html, paths should use `assets/` (same level)

### Beer Gallery Not Showing

**Problem**: Beer page is empty or showing errors

**Solutions**:
```bash
# Rebuild beer.js from data
npm run build-beer

# Check that data/beer.jsonl exists and is valid JSON
cat data/beer.jsonl

# Verify beer.js was generated
ls -lh js/beer.js
```

### 404 Errors on GitHub Pages

**Problem**: Pages show 404 errors

**Solutions**:
- Verify GitHub Pages is enabled in repository settings
- Check that branch is set to `main` and folder to `/ (root)`
- Wait 1-5 minutes for deployment to complete
- Verify index.html exists in repository root
- Check that file names match exactly (case-sensitive)

### Navigation Links Broken

**Problem**: Clicking nav links gives 404

**Solutions**:
- Beer page nav links should use `../index.html#section`
- Index page nav links should use `#section`
- Beer link from index should use `pages/beer.html`

### CSS/JS Not Loading

**Problem**: Site has no styling or functionality

**Solutions**:
- Run `npm run build` to generate minified files
- Check that index.html references correct paths:
  - `css/main.min.css` (not `../css/main.min.css`)
  - `js/main.min.js` (not `../js/main.min.js`)
- Clear browser cache (Cmd+Shift+R on Mac)

---

## 🚀 Performance Tips

### Before Deploying

1. **Minify assets**: Always run `npm run build`
2. **Optimize images**: Keep images under 500KB
3. **Test locally**: Verify everything works
4. **Check file sizes**: Run `npm run build` to see optimization stats

### After Deploying

1. **Test on mobile**: Check responsive design
2. **Check loading speed**: Use [PageSpeed Insights](https://pagespeed.web.dev/)
3. **Verify all links**: Click through navigation
4. **Test on different browsers**: Chrome, Firefox, Safari

---

## 📊 Deployment Checklist

Before pushing to production:

- [ ] Run `npm run build-beer` if beer data changed
- [ ] Run `npm run build` to minify CSS/JS
- [ ] Test index.html locally
- [ ] Test pages/beer.html locally
- [ ] Verify all images load
- [ ] Check navigation links work
- [ ] Test on mobile viewport
- [ ] Commit changes with clear message
- [ ] Push to GitHub/GitLab

---

## 🔐 Security Notes

- Only static files are deployed (no server-side code)
- No sensitive data should be committed (no API keys, passwords)
- External links open in new tabs (`target="_blank"`)
- Use relative paths (not absolute) for portability

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitLab Pages Documentation](https://docs.gitlab.com/ee/user/project/pages/)
- [Web Performance Best Practices](https://web.dev/vitals/)

---

**Current Setup**: This repository is configured for **GitHub Pages** deployment from the `main` branch root directory.
