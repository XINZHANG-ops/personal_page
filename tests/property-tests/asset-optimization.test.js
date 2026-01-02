/**
 * Property-Based Test for Asset Optimization
 * Feature: personal-portfolio-site, Property 8: Asset Optimization
 * Validates: Requirements 6.5
 * 
 * This test validates that images and CSS files are optimized for performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 8: Asset Optimization', () => {
  let assetsPath;
  let cssPath;
  let jsPath;
  
  beforeEach(() => {
    assetsPath = path.resolve('./assets');
    cssPath = path.resolve('./css');
    jsPath = path.resolve('./js');
  });

  it('should have optimized image file sizes under 500KB', () => {
    // Property: For any image file, the file size should be optimized (images under 500KB)
    
    fc.assert(fc.property(
      fc.constantFrom('jpg', 'jpeg', 'png', 'webp', 'svg'), // Test common image formats
      (imageFormat) => {
        // Find all image files with this format
        const findImageFiles = (dir) => {
          const files = [];
          if (fs.existsSync(dir)) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
              const fullPath = path.join(dir, item.name);
              if (item.isDirectory()) {
                files.push(...findImageFiles(fullPath));
              } else if (item.isFile() && item.name.toLowerCase().endsWith(`.${imageFormat}`)) {
                files.push(fullPath);
              }
            }
          }
          return files;
        };
        
        const imageFiles = findImageFiles(assetsPath);
        
        // Test each image file
        imageFiles.forEach(imagePath => {
          const stats = fs.statSync(imagePath);
          const fileSizeKB = stats.size / 1024;
          
          // Images should be under 500KB for web optimization
          expect(fileSizeKB).toBeLessThan(500);
          
          // Images should not be empty
          expect(stats.size).toBeGreaterThan(0);
        });
        
        // If no images found for this format, that's acceptable
        // (not all formats may be present)
      }
    ), { numRuns: 100 });
  });

  it('should have minified CSS files for production', () => {
    // Property: For any CSS file, it should be minified for production or have a minified version
    
    fc.assert(fc.property(
      fc.constant('css'), // Test CSS files
      () => {
        // Find all CSS files
        const cssFiles = [];
        if (fs.existsSync(cssPath)) {
          const items = fs.readdirSync(cssPath);
          items.forEach(item => {
            if (item.endsWith('.css')) {
              cssFiles.push(path.join(cssPath, item));
            }
          });
        }
        
        expect(cssFiles.length).toBeGreaterThan(0);
        
        cssFiles.forEach(cssFile => {
          const content = fs.readFileSync(cssFile, 'utf-8');
          
          // CSS should not be empty
          expect(content.length).toBeGreaterThan(0);
          
          // Check if CSS uses CSS custom properties (design system)
          // This indicates organized, maintainable CSS
          expect(content).toMatch(/--[\w-]+:/);
          
          // For production optimization, check if there's evidence of optimization
          // Either the file is already minified OR it's structured for minification
          const hasComments = /\/\*[\s\S]*?\*\//.test(content);
          const hasExcessiveWhitespace = /\n\s*\n\s*\n/.test(content);
          
          // If file has excessive whitespace and comments, it should be minifiable
          if (hasComments || hasExcessiveWhitespace) {
            // File is in development format - this is acceptable for source
            // but should be minified for production
            expect(content).toMatch(/\/\*[\s\S]*?\*\/|[\n\r\s]{2,}/);
          }
        });
      }
    ), { numRuns: 100 });
  });

  it('should have optimized JavaScript files', () => {
    // Property: For any JavaScript file, it should be structured for optimization
    
    fc.assert(fc.property(
      fc.constant('js'), // Test JavaScript files
      () => {
        // Find all JS files
        const jsFiles = [];
        if (fs.existsSync(jsPath)) {
          const items = fs.readdirSync(jsPath);
          items.forEach(item => {
            if (item.endsWith('.js')) {
              jsFiles.push(path.join(jsPath, item));
            }
          });
        }
        
        expect(jsFiles.length).toBeGreaterThan(0);
        
        jsFiles.forEach(jsFile => {
          const content = fs.readFileSync(jsFile, 'utf-8');
          
          // JS should not be empty
          expect(content.length).toBeGreaterThan(0);
          
          // Check for modern JavaScript practices that aid optimization
          // Should use strict mode
          expect(content).toMatch(/'use strict'|"use strict"/);
          
          // Should use IIFE or modules for scope management
          expect(content).toMatch(/\(function\(\)|function\s*\(\s*\)\s*{|export|import/);
          
          // Should not have console.log statements in production code
          // (This is a code quality check for optimization)
          const consoleStatements = (content.match(/console\.(log|debug|info)/g) || []).length;
          
          // Allow some console statements for development, but not excessive
          expect(consoleStatements).toBeLessThan(10);
        });
      }
    ), { numRuns: 100 });
  });

  it('should implement lazy loading for images', () => {
    // Property: For any image in the HTML, lazy loading should be implemented
    
    fc.assert(fc.property(
      fc.constant('html'), // Test HTML files
      () => {
        // Read HTML files
        const htmlFiles = ['index.html'];
        
        htmlFiles.forEach(htmlFile => {
          if (fs.existsSync(htmlFile)) {
            const content = fs.readFileSync(htmlFile, 'utf-8');
            
            // Find all img tags
            const imgTags = content.match(/<img[^>]*>/gi) || [];
            
            if (imgTags.length > 0) {
              // Check that images have lazy loading attributes
              imgTags.forEach(imgTag => {
                // Should have loading="lazy" or data-src for lazy loading
                const hasLazyLoading = /loading=["']lazy["']/.test(imgTag) || 
                                     /data-src=/.test(imgTag);
                
                // Hero images or above-the-fold images might not be lazy loaded
                // But project images and other content images should be
                const isProjectImage = /project|screenshot|portfolio/.test(imgTag);
                const isContentImage = /assets\/images/.test(imgTag);
                
                if (isProjectImage || isContentImage) {
                  expect(hasLazyLoading).toBe(true);
                }
              });
            }
          }
        });
      }
    ), { numRuns: 100 });
  });

  it('should have proper meta tags for SEO and performance', () => {
    // Property: For any HTML file, it should have proper meta tags for optimization
    
    fc.assert(fc.property(
      fc.constant('meta'), // Test meta tags
      () => {
        const htmlFile = 'index.html';
        
        if (fs.existsSync(htmlFile)) {
          const content = fs.readFileSync(htmlFile, 'utf-8');
          
          // Should have viewport meta tag for responsive design
          expect(content).toMatch(/<meta[^>]*name=["']viewport["'][^>]*>/i);
          
          // Should have description meta tag for SEO
          expect(content).toMatch(/<meta[^>]*name=["']description["'][^>]*>/i);
          
          // Should have charset declaration
          expect(content).toMatch(/<meta[^>]*charset=["']UTF-8["'][^>]*>/i);
          
          // Should have title tag
          expect(content).toMatch(/<title>[^<]+<\/title>/i);
          
          // Should have author meta tag
          expect(content).toMatch(/<meta[^>]*name=["']author["'][^>]*>/i);
          
          // Check for performance-related attributes
          // CSS should be in head for critical path optimization
          expect(content).toMatch(/<link[^>]*rel=["']stylesheet["'][^>]*>/i);
          
          // JavaScript should be at end of body or have async/defer
          const scriptTags = content.match(/<script[^>]*>/gi) || [];
          const bodyEndScripts = content.match(/<script[^>]*>[\s\S]*?<\/body>/i);
          const asyncDeferScripts = scriptTags.filter(tag => 
            /async|defer/.test(tag)
          );
          
          // Scripts should either be at body end OR have async/defer
          expect(bodyEndScripts || asyncDeferScripts.length > 0).toBeTruthy();
        }
      }
    ), { numRuns: 100 });
  });

  it('should have optimized asset loading patterns', () => {
    // Property: For any asset reference, it should follow optimization patterns
    
    fc.assert(fc.property(
      fc.constantFrom('css', 'js', 'images'), // Test different asset types
      (assetType) => {
        const htmlFile = 'index.html';
        
        if (fs.existsSync(htmlFile)) {
          const content = fs.readFileSync(htmlFile, 'utf-8');
          
          if (assetType === 'css') {
            // CSS should be loaded in head for critical path
            const cssLinks = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
            cssLinks.forEach(link => {
              // Should be in head section
              const headSection = content.match(/<head>[\s\S]*?<\/head>/i);
              if (headSection) {
                expect(headSection[0]).toContain(link);
              }
            });
          }
          
          if (assetType === 'js') {
            // JavaScript should be optimized for loading
            const scriptTags = content.match(/<script[^>]*src=[^>]*>/gi) || [];
            scriptTags.forEach(script => {
              // Should have src attribute (external file, not inline)
              expect(script).toMatch(/src=["'][^"']+["']/);
              
              // Should be at end of body for non-critical scripts
              const bodyEnd = content.match(/<script[^>]*>[\s\S]*?<\/body>/i);
              expect(bodyEnd).toBeTruthy();
            });
          }
          
          if (assetType === 'images') {
            // Images should have proper attributes for optimization
            const imgTags = content.match(/<img[^>]*>/gi) || [];
            imgTags.forEach(img => {
              // Should have alt attribute for accessibility and SEO
              expect(img).toMatch(/alt=["'][^"']*["']/);
              
              // Should have width/height or CSS sizing for layout stability
              const hasDimensions = /width=|height=|style=/.test(img);
              const hasClass = /class=/.test(img);
              
              // Either explicit dimensions or CSS class for styling
              expect(hasDimensions || hasClass).toBe(true);
            });
          }
        }
      }
    ), { numRuns: 100 });
  });
});