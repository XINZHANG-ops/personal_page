# Asset Optimization Guide

This document describes the asset optimization features implemented for the personal portfolio site.

## Optimization Features

### 1. Image Optimization
- **PNG Images**: Project screenshots use optimized PNG format
- **Beer Images**: Automatically resized to 400x400 PNG via Gradio UI
- **Size Monitoring**: Build script warns if images exceed 500KB
- **Responsive Images**: Images adapt to different screen sizes
- **Fallback Placeholders**: Graceful handling of missing images

### 2. CSS Optimization
- **Minified CSS**: Production-ready minified version (`css/main.min.css`)
- **CSS Custom Properties**: Consistent design system with CSS variables
- **Critical Path**: CSS loaded in document head for optimal rendering
- **Modern Layout**: Uses CSS Grid and Flexbox for efficient layouts
- **BEM Methodology**: Organized, maintainable CSS structure

### 3. JavaScript Optimization
- **Minified JS**: Production-ready minified versions (`js/main.min.js`, `js/beer.js`)
- **Progressive Enhancement**: Site works without JavaScript
- **Event Delegation**: Efficient event handling patterns
- **Pure SVG Charts**: Radar charts using native SVG - infinitely scalable, no external dependencies
- **Modular Code**: IIFE patterns for code organization

### 4. HTML Optimization
- **SEO Meta Tags**: Comprehensive meta tags for search engines
- **Social Media Tags**: Open Graph and Twitter Card meta tags
- **Performance Hints**: Preconnect and preload directives for external resources
- **Semantic HTML**: Proper semantic structure for accessibility
- **ARIA Labels**: Accessibility attributes throughout

### 5. Performance Features
- **Resource Preloading**: Critical CSS and JS files are preloaded
- **No External Dependencies**: All charts rendered with native SVG, no CDN required
- **Gzip Ready**: Assets structured for optimal compression
- **Cache Friendly**: Static assets with proper naming for caching
- **No Lazy Loading**: Beer images load immediately to avoid grey box issues

## Build Scripts

### `npm run build`
Runs the CSS and JavaScript minification:
```bash
node scripts/build-optimize.cjs
```
- Minifies `css/main.css` → `css/main.min.css` (~21% savings)
- Minifies `js/main.js` → `js/main.min.js` (~17% savings)
- Checks image sizes and warns if > 500KB
- Provides file size reports

### `npm run build-beer`
Generates beer gallery JavaScript from data:
```bash
node scripts/build-beer.cjs
```
- Reads `data/beer.jsonl`
- Generates `js/beer.js` with all beer data and UI code
- Updates image paths for pages/ directory structure

### `npm run build-all`
Runs both build scripts in sequence:
```bash
npm run build-beer && npm run build
```

### `npm run perf`
Runs performance analysis:
```bash
node tests/performance-test.js
```
- Analyzes HTML structure
- Checks CSS and JS optimization
- Reviews image sizes and formats
- Provides optimization recommendations

### `npm run optimize`
Runs both build and performance analysis:
```bash
npm run build && npm run perf
```

## File Structure

```
personal_page/
├── index.html              # Main page (uses minified assets)
├── pages/
│   └── beer.html          # Beer gallery page
├── css/
│   ├── main.css           # Development CSS (~36KB)
│   └── main.min.css       # Minified CSS (~28KB, 21% savings)
├── js/
│   ├── main.js            # Development JavaScript (~26KB)
│   ├── main.min.js        # Minified JavaScript (~22KB, 17% savings)
│   └── beer.js            # Generated beer gallery code
├── scripts/
│   ├── build-optimize.cjs # Minification script
│   └── build-beer.cjs     # Beer data → JS generator
├── tests/
│   └── performance-test.js # Performance analysis
└── assets/
    └── images/
        ├── profile/       # Profile photos
        ├── projects/      # Project screenshots (PNG)
        └── beers/         # Beer photos (400x400 PNG)
```

## Performance Metrics

### Current Performance
- **CSS**: 35.7KB → 28.2KB (21.1% savings)
- **JavaScript**: 26.2KB → 21.7KB (17.0% savings)
- **Images**: All under 500KB (monitored by build script)
- **Beer Images**: Standardized at 400x400 PNG

### Performance Targets
- **Images**: < 500KB per image (checked during build)
- **CSS**: Minified and compressed
- **JavaScript**: Minified with clean console output
- **HTML**: Semantic structure with proper meta tags
- **No Lazy Loading**: Images load immediately for beer gallery

## Why No Lazy Loading for Beer Images?

Lazy loading was intentionally removed for beer gallery images because:
- Images are created dynamically with JavaScript
- Lazy loading interfered with Chart.js radar charts
- Images appeared as grey boxes with lazy loading
- For small collections (< 50 beers), performance impact is minimal
- Immediate loading provides better user experience

See [BEER.md](BEER.md) for more details on the beer gallery system.

## Deployment Recommendations

1. **Enable Compression**: GitHub Pages automatically enables gzip
2. **Use Minified Assets**: Always run `npm run build` before deploying
3. **Monitor Performance**: Use Lighthouse and PageSpeed Insights
4. **Test Locally**: Run `python -m http.server 8000` to test before pushing

## Browser Support

The optimization features support:
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **SVG support**: All modern browsers with full SVG 1.1 support
- **Progressive enhancement**: Core content works without JavaScript
- **Accessibility**: WCAG AA compliance with ARIA labels
- **Scalable graphics**: SVG charts scale infinitely without quality loss

## Maintenance Checklist

To maintain optimal performance:

1. **Before Each Deployment**:
   ```bash
   npm run build-all     # Build beer.js and minify assets
   npm run perf          # Check performance metrics
   ```

2. **Image Management**:
   - Keep all images under 500KB
   - Use `python scripts/add_beer.py` for automatic beer image optimization
   - Beer images auto-resize to 400x400 PNG

3. **Code Updates**:
   - Edit `css/main.css` (not main.min.css)
   - Edit `js/main.js` (not main.min.js)
   - Always rebuild after editing

4. **Testing**:
   ```bash
   npm test              # Run unit tests
   npm run optimize      # Build and check performance
   ```

5. **Monitoring**:
   - Check GitHub Pages deployment status
   - Test on real devices and networks
   - Use browser DevTools to check load times
   - Verify all images and assets load correctly

## Common Optimization Issues

### Large CSS File Size
**Problem**: main.min.css is too large

**Solutions**:
- Remove unused CSS styles
- Consolidate duplicate styles
- Use CSS custom properties for repeated values
- Run `npm run build` to minify

### JavaScript Errors
**Problem**: Minified JS causes errors

**Solutions**:
- Check for syntax errors in main.js
- Ensure no console statements in production code
- Test locally before deploying
- Check browser console for error messages

### Slow Image Loading
**Problem**: Images take too long to load

**Solutions**:
- Optimize images to < 500KB
- Use appropriate image formats (PNG for photos)
- Beer images should be 400x400 PNG (auto-handled by add_beer.py)
- Consider using WebP format for future optimization

## Tools and Resources

- **Build Script**: `scripts/build-optimize.cjs` (Node.js CommonJS)
- **Performance Test**: `tests/performance-test.js`
- **Package Manager**: npm
- **Testing Framework**: Vitest
- **Image Processing**: Pillow (Python, for beer images)

## Performance Testing

Run performance tests:
```bash
npm run perf
```

This checks:
- File sizes and optimization ratios
- Image dimensions and formats
- HTML meta tag presence
- Asset references in HTML

## Additional Optimization Ideas

Future enhancements to consider:
- [ ] Convert PNG images to WebP format
- [ ] Implement service worker for offline support
- [ ] Add critical CSS inlining
- [ ] Use font subsetting for custom fonts
- [ ] Implement HTTP/2 server push
- [ ] Add resource hints (prefetch, preload)

---

**Note**: This site prioritizes simplicity and maintainability over aggressive optimization. Current optimizations provide excellent performance for a personal portfolio site.
