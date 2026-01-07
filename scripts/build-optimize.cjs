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
    // More conservative minification to avoid breaking code
    return js
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove single-line comments that start at beginning of line (with optional whitespace)
        .replace(/^\s*\/\/.*$/gm, '')
        // Remove extra whitespace and newlines (but keep single spaces)
        .replace(/\n\s*\n/g, '\n')
        .replace(/\n/g, '')
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

console.log('✨ Asset optimization complete!');
console.log('');
console.log('📋 Performance Tips:');
console.log('   • Enable gzip compression on your server');
console.log('   • Consider using a CDN for static assets');
console.log('   • Monitor Core Web Vitals with Lighthouse');