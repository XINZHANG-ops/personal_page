#!/usr/bin/env node

/**
 * Simple performance testing script for the portfolio site
 * Tests loading performance and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ Performance Analysis Report');
console.log('================================');

// Analyze HTML structure
function analyzeHTML() {
    console.log('\n📄 HTML Analysis:');
    
    if (!fs.existsSync('index.html')) {
        console.log('   ❌ index.html not found');
        return;
    }
    
    const html = fs.readFileSync('index.html', 'utf8');
    
    // Check for critical performance elements
    const checks = [
        {
            name: 'Viewport meta tag',
            test: /<meta[^>]*name=["']viewport["']/i.test(html),
            impact: 'High - Required for mobile optimization'
        },
        {
            name: 'Charset declaration',
            test: /<meta[^>]*charset/i.test(html),
            impact: 'Medium - Prevents encoding issues'
        },
        {
            name: 'Preconnect to external domains',
            test: /<link[^>]*rel=["']preconnect["']/i.test(html),
            impact: 'Medium - Reduces DNS lookup time'
        },
        {
            name: 'Preload critical resources',
            test: /<link[^>]*rel=["']preload["']/i.test(html),
            impact: 'High - Improves critical path loading'
        },
        {
            name: 'Lazy loading images',
            test: /loading=["']lazy["']/i.test(html),
            impact: 'High - Reduces initial page load'
        },
        {
            name: 'External links security',
            test: /rel=["'][^"']*noopener[^"']*["']/i.test(html),
            impact: 'Medium - Security and performance'
        }
    ];
    
    checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        console.log(`   ${status} ${check.name}`);
        if (!check.test) {
            console.log(`      Impact: ${check.impact}`);
        }
    });
}

// Analyze CSS optimization
function analyzeCSS() {
    console.log('\n🎨 CSS Analysis:');
    
    const cssFiles = ['css/main.css', 'css/main.min.css'];
    
    cssFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const css = fs.readFileSync(file, 'utf8');
            const sizeKB = (Buffer.byteLength(css, 'utf8') / 1024).toFixed(1);
            const isMinified = file.includes('.min.');
            
            console.log(`   📁 ${file}: ${sizeKB}KB ${isMinified ? '(minified)' : ''}`);
            
            // Check for optimization opportunities
            if (!isMinified) {
                const comments = (css.match(/\/\*[\s\S]*?\*\//g) || []).length;
                const emptyLines = (css.match(/\n\s*\n/g) || []).length;
                
                if (comments > 0 || emptyLines > 10) {
                    console.log(`      💡 Can be minified (${comments} comments, ${emptyLines} empty lines)`);
                }
            }
            
            // Check for modern CSS features
            const hasCustomProps = /--[\w-]+:/.test(css);
            const hasGridOrFlex = /(display:\s*(grid|flex)|grid-template|flex-direction)/.test(css);
            
            if (hasCustomProps) console.log('      ✅ Uses CSS custom properties');
            if (hasGridOrFlex) console.log('      ✅ Uses modern layout (Grid/Flexbox)');
        }
    });
}

// Analyze JavaScript optimization
function analyzeJS() {
    console.log('\n⚙️  JavaScript Analysis:');
    
    const jsFiles = ['js/main.js', 'js/main.min.js'];
    
    jsFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const js = fs.readFileSync(file, 'utf8');
            const sizeKB = (Buffer.byteLength(js, 'utf8') / 1024).toFixed(1);
            const isMinified = file.includes('.min.');
            
            console.log(`   📁 ${file}: ${sizeKB}KB ${isMinified ? '(minified)' : ''}`);
            
            // Check for performance patterns
            const hasStrictMode = /'use strict'|"use strict"/.test(js);
            const hasIIFE = /\(function\(\)/.test(js);
            const hasEventListeners = /addEventListener/.test(js);
            const hasLazyLoading = /IntersectionObserver/.test(js);
            
            if (hasStrictMode) console.log('      ✅ Uses strict mode');
            if (hasIIFE) console.log('      ✅ Uses IIFE pattern');
            if (hasEventListeners) console.log('      ✅ Uses modern event handling');
            if (hasLazyLoading) console.log('      ✅ Implements lazy loading');
            
            // Check for potential issues
            const consoleStatements = (js.match(/console\.(log|debug|info)/g) || []).length;
            if (consoleStatements > 5) {
                console.log(`      ⚠️  ${consoleStatements} console statements (consider removing for production)`);
            }
        }
    });
}

// Analyze images
function analyzeImages() {
    console.log('\n🖼️  Image Analysis:');
    
    const imagesDir = 'assets/images';
    if (!fs.existsSync(imagesDir)) {
        console.log('   ❌ Images directory not found');
        return;
    }
    
    const images = fs.readdirSync(imagesDir).filter(file => 
        /\.(jpg|jpeg|png|svg|webp|gif)$/i.test(file)
    );
    
    if (images.length === 0) {
        console.log('   ❌ No images found');
        return;
    }
    
    let totalSize = 0;
    let optimizedCount = 0;
    
    images.forEach(image => {
        const imagePath = path.join(imagesDir, image);
        const stats = fs.statSync(imagePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        totalSize += stats.size;
        
        const isOptimized = stats.size <= 500 * 1024; // 500KB threshold
        if (isOptimized) optimizedCount++;
        
        const status = isOptimized ? '✅' : '⚠️ ';
        const format = path.extname(image).toLowerCase();
        
        console.log(`   ${status} ${image}: ${sizeKB}KB ${format}`);
        
        if (!isOptimized) {
            console.log(`      💡 Consider optimizing (target: <500KB)`);
        }
        
        // Format recommendations
        if (format === '.jpg' || format === '.jpeg') {
            console.log('      💡 Consider WebP format for better compression');
        }
        if (format === '.png' && stats.size > 100 * 1024) {
            console.log('      💡 Consider JPEG for photos or WebP for better compression');
        }
    });
    
    const totalSizeKB = (totalSize / 1024).toFixed(1);
    const optimizationRate = ((optimizedCount / images.length) * 100).toFixed(0);
    
    console.log(`\n   📊 Summary: ${images.length} images, ${totalSizeKB}KB total`);
    console.log(`   📈 Optimization rate: ${optimizationRate}% (${optimizedCount}/${images.length})`);
}

// Generate recommendations
function generateRecommendations() {
    console.log('\n💡 Performance Recommendations:');
    console.log('================================');
    
    const recommendations = [
        '1. Enable gzip/brotli compression on your web server',
        '2. Set proper cache headers for static assets (CSS, JS, images)',
        '3. Use a Content Delivery Network (CDN) for global performance',
        '4. Consider implementing Service Worker for offline functionality',
        '5. Monitor Core Web Vitals with Google PageSpeed Insights',
        '6. Test on real devices and slow network connections',
        '7. Consider critical CSS inlining for above-the-fold content',
        '8. Implement resource hints (preload, prefetch) for key resources'
    ];
    
    recommendations.forEach(rec => console.log(`   ${rec}`));
    
    console.log('\n🔗 Useful Tools:');
    console.log('   • Google PageSpeed Insights: https://pagespeed.web.dev/');
    console.log('   • WebPageTest: https://www.webpagetest.org/');
    console.log('   • Lighthouse (built into Chrome DevTools)');
    console.log('   • GTmetrix: https://gtmetrix.com/');
}

// Run all analyses
analyzeHTML();
analyzeCSS();
analyzeJS();
analyzeImages();
generateRecommendations();

console.log('\n✨ Performance analysis complete!');