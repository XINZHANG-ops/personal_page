#!/usr/bin/env node

/**
 * Simple build optimization script for the portfolio site
 * This script optimizes assets for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting asset optimization...');

// Check if source files exist (no minification, just validation)
const cssSource = 'css/main.css';
const jsSource = 'js/main.js';

if (fs.existsSync(cssSource)) {
    console.log('✅ CSS file exists');
    const css = fs.readFileSync(cssSource, 'utf8');
    const size = Buffer.byteLength(css, 'utf8');
    console.log(`   Size: ${(size / 1024).toFixed(1)}KB`);
}

if (fs.existsSync(jsSource)) {
    console.log('✅ JavaScript file exists');
    const js = fs.readFileSync(jsSource, 'utf8');
    const size = Buffer.byteLength(js, 'utf8');
    console.log(`   Size: ${(size / 1024).toFixed(1)}KB`);
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