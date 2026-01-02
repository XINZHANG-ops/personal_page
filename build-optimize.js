#!/usr/bin/env node

/**
 * Simple build optimization script for the portfolio site
 * This script optimizes assets for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting asset optimization...');

// Function to minify CSS (basic minification)
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around specific characters
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .replace(/:\s*/g, ':')
        .replace(/,\s*/g, ',')
        .replace(/}\s*/g, '}')
        // Remove trailing semicolons before }
        .replace(/;}/g, '}')
        .trim();
}

// Function to minify JavaScript (basic minification)
function minifyJS(js) {
    return js
        // Remove single-line comments (but preserve URLs)
        .replace(/\/\/(?![^\n]*https?:)[^\n]*/g, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace (but preserve strings)
        .replace(/\s+/g, ' ')
        // Remove whitespace around operators and punctuation
        .replace(/\s*([{}();,:])\s*/g, '$1')
        .trim();
}

// Check if source files exist
const cssSource = 'css/main.css';
const jsSource = 'js/main.js';

if (fs.existsSync(cssSource)) {
    console.log('📦 Minifying CSS...');
    const css = fs.readFileSync(cssSource, 'utf8');
    const minifiedCSS = minifyCSS(css);
    fs.writeFileSync('css/main.min.css', minifiedCSS);
    
    const originalSize = Buffer.byteLength(css, 'utf8');
    const minifiedSize = Buffer.byteLength(minifiedCSS, 'utf8');
    const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`   Minified: ${(minifiedSize / 1024).toFixed(1)}KB`);
    console.log(`   Savings: ${savings}%`);
}

if (fs.existsSync(jsSource)) {
    console.log('📦 Minifying JavaScript...');
    const js = fs.readFileSync(jsSource, 'utf8');
    const minifiedJS = minifyJS(js);
    fs.writeFileSync('js/main.min.js', minifiedJS);
    
    const originalSize = Buffer.byteLength(js, 'utf8');
    const minifiedSize = Buffer.byteLength(minifiedJS, 'utf8');
    const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`   Minified: ${(minifiedSize / 1024).toFixed(1)}KB`);
    console.log(`   Savings: ${savings}%`);
}

// Check image sizes
console.log('🖼️  Checking image optimization...');
const imagesDir = 'assets/images';
if (fs.existsSync(imagesDir)) {
    const images = fs.readdirSync(imagesDir).filter(file => 
        file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.webp')
    );
    
    images.forEach(image => {
        const imagePath = path.join(imagesDir, image);
        const stats = fs.statSync(imagePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        
        if (stats.size > 500 * 1024) { // 500KB threshold
            console.log(`   ⚠️  ${image}: ${sizeKB}KB (consider optimizing)`);
        } else {
            console.log(`   ✅ ${image}: ${sizeKB}KB`);
        }
    });
}

// Create production HTML with minified assets
console.log('📄 Creating production HTML...');
const indexPath = 'index.html';
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace with minified versions
    html = html.replace('css/main.css', 'css/main.min.css');
    html = html.replace('js/main.js', 'js/main.min.js');
    
    fs.writeFileSync('index.prod.html', html);
    console.log('   Created index.prod.html with minified assets');
}

console.log('✨ Asset optimization complete!');
console.log('');
console.log('📋 Performance Tips:');
console.log('   • Use index.prod.html for production deployment');
console.log('   • Enable gzip compression on your server');
console.log('   • Consider using a CDN for static assets');
console.log('   • Monitor Core Web Vitals with Lighthouse');