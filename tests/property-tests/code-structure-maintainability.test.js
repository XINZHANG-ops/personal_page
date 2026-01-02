/**
 * Property-Based Test for Code Structure Maintainability
 * Feature: personal-portfolio-site, Property 11: Code Structure Maintainability
 * Validates: Requirements 8.2
 * 
 * This test validates that HTML files avoid inline styles and all styling is in external CSS files
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 11: Code Structure Maintainability', () => {
  let htmlContent;
  let cssContent;
  
  beforeEach(() => {
    // Load HTML and CSS content for analysis
    const htmlPath = path.resolve('./index.html');
    const cssPath = path.resolve('./css/main.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Extract all HTML elements with style attributes
   * @returns {Array} Array of elements with inline styles
   */
  function extractInlineStyles() {
    const inlineStyleMatches = htmlContent.match(/<[^>]+style\s*=\s*["'][^"']*["'][^>]*>/gi) || [];
    return inlineStyleMatches.map(match => ({
      element: match,
      style: match.match(/style\s*=\s*["']([^"']*)["']/i)?.[1] || ''
    }));
  }

  /**
   * Extract all <style> blocks from HTML
   * @returns {Array} Array of style blocks found in HTML
   */
  function extractStyleBlocks() {
    const styleBlockMatches = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
    return styleBlockMatches;
  }

  /**
   * Check if CSS is properly organized in external files
   * @returns {Object} Analysis of CSS organization
   */
  function analyzeCSSOrganization() {
    const analysis = {
      hasExternalCSS: false,
      cssFileSize: 0,
      hasCustomProperties: false,
      hasModularStructure: false
    };

    // Check if external CSS file exists and has content
    if (cssContent && cssContent.length > 0) {
      analysis.hasExternalCSS = true;
      analysis.cssFileSize = cssContent.length;
    }

    // Check for CSS custom properties (design system)
    if (cssContent.includes(':root') && cssContent.includes('--')) {
      analysis.hasCustomProperties = true;
    }

    // Check for modular CSS structure (comments, sections)
    const hasComments = /\/\*[\s\S]*?\*\//.test(cssContent);
    const hasSections = cssContent.split('/*').length > 3; // Multiple comment sections
    analysis.hasModularStructure = hasComments && hasSections;

    return analysis;
  }

  /**
   * Extract all HTML files in the project
   * @returns {Array} Array of HTML file paths
   */
  function getHTMLFiles() {
    const htmlFiles = ['./index.html'];
    
    // Check for additional HTML files
    try {
      const files = fs.readdirSync('./');
      const additionalHtmlFiles = files
        .filter(file => file.endsWith('.html') && file !== 'index.html')
        .map(file => `./${file}`);
      htmlFiles.push(...additionalHtmlFiles);
    } catch (error) {
      // Continue with just index.html if directory read fails
    }
    
    return htmlFiles;
  }

  it('should avoid inline styles in HTML files', () => {
    // Property: For any HTML file, inline styles should be avoided and all styling should be in external CSS files
    
    const inlineStyles = extractInlineStyles();
    
    fc.assert(fc.property(
      fc.constantFrom(...inlineStyles.map((_, index) => index)), // Index of inline style
      (styleIndex) => {
        if (styleIndex >= inlineStyles.length) return true;
        
        const inlineStyle = inlineStyles[styleIndex];
        const { element, style } = inlineStyle;
        
        // Check for acceptable exceptions
        const acceptableExceptions = [
          // Utility styles that are acceptable inline
          'display: none', // For dynamic show/hide
          'visibility: hidden', // For accessibility
          'position: absolute; left: -9999px', // Screen reader only content
          'clip: rect(0, 0, 0, 0)', // Screen reader only content
        ];
        
        const isAcceptableException = acceptableExceptions.some(exception => 
          style.toLowerCase().includes(exception.toLowerCase())
        );
        
        if (!isAcceptableException) {
          console.warn(`Found inline style that should be moved to CSS: ${element}`);
          expect(false).toBe(true); // Force failure with descriptive message
        }
        
        return true;
      }
    ), { numRuns: 100 });
    
    // Overall check: should have minimal or no inline styles
    expect(inlineStyles.length).toBeLessThanOrEqual(2); // Allow very few exceptions
  });

  it('should avoid style blocks in HTML files', () => {
    // Property: HTML files should not contain <style> blocks, all CSS should be external
    
    const styleBlocks = extractStyleBlocks();
    
    fc.assert(fc.property(
      fc.constantFrom(...styleBlocks.map((_, index) => index)), // Index of style block
      (blockIndex) => {
        if (blockIndex >= styleBlocks.length) return true;
        
        const styleBlock = styleBlocks[blockIndex];
        
        // Check for acceptable exceptions (very limited)
        const acceptableExceptions = [
          // Critical CSS for above-the-fold content (very small)
          /font-display:\s*swap/i, // Font loading optimization
          /critical/i // Explicitly marked as critical CSS
        ];
        
        const isAcceptableException = acceptableExceptions.some(exception => 
          exception.test(styleBlock)
        );
        
        if (!isAcceptableException) {
          console.warn(`Found style block that should be moved to external CSS: ${styleBlock.substring(0, 100)}...`);
          expect(false).toBe(true); // Force failure with descriptive message
        }
        
        return true;
      }
    ), { numRuns: 100 });
    
    // Overall check: should have no style blocks
    expect(styleBlocks.length).toBe(0);
  });

  it('should have proper CSS organization in external files', () => {
    // Property: CSS should be properly organized in external files with good structure
    
    const cssAnalysis = analyzeCSSOrganization();
    
    // Should have external CSS file
    expect(cssAnalysis.hasExternalCSS).toBe(true);
    
    // CSS file should have substantial content
    expect(cssAnalysis.cssFileSize).toBeGreaterThan(1000); // At least 1KB of CSS
    
    // Should use CSS custom properties for maintainability
    expect(cssAnalysis.hasCustomProperties).toBe(true);
    
    // Should have modular structure with comments and sections
    expect(cssAnalysis.hasModularStructure).toBe(true);
  });

  it('should have consistent HTML structure patterns', () => {
    // Property: Similar content sections should follow the same HTML structure pattern for consistency
    
    // Extract section elements
    const sectionMatches = htmlContent.match(/<section[^>]*>[\s\S]*?<\/section>/gi) || [];
    
    fc.assert(fc.property(
      fc.constantFrom(...sectionMatches.map((_, index) => index)), // Index of section
      (sectionIndex) => {
        if (sectionIndex >= sectionMatches.length) return true;
        
        const section = sectionMatches[sectionIndex];
        
        // Each section should have proper structure
        // 1. Should have an id attribute
        const hasId = /id\s*=\s*["'][^"']+["']/i.test(section);
        expect(hasId).toBe(true);
        
        // 2. Should have proper heading structure
        const hasHeading = /<h[1-6][^>]*>/i.test(section);
        expect(hasHeading).toBe(true);
        
        // 3. Should use semantic class names
        const classMatch = section.match(/class\s*=\s*["']([^"']*)["']/i);
        if (classMatch) {
          const className = classMatch[1];
          // Class names should be descriptive, not generic
          expect(className).not.toMatch(/^(div|span|content|wrapper)$/i);
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper separation of concerns', () => {
    // Property: HTML should focus on structure, CSS on presentation, JS on behavior
    
    // HTML should not contain presentation-related attributes (deprecated)
    const presentationAttributes = [
      'bgcolor', 'color', 'width', 'height', 'align', 'valign', 
      'border', 'cellpadding', 'cellspacing', 'size', 'face'
    ];
    
    fc.assert(fc.property(
      fc.constantFrom(...presentationAttributes), // Test each deprecated attribute
      (attribute) => {
        const attributePattern = new RegExp(`\\s${attribute}\\s*=`, 'i');
        const hasDeprecatedAttribute = attributePattern.test(htmlContent);
        
        if (hasDeprecatedAttribute) {
          console.warn(`Found deprecated presentation attribute "${attribute}" in HTML`);
          expect(false).toBe(true); // Force failure
        }
        
        return true;
      }
    ), { numRuns: 100 });
    
    // HTML should not contain JavaScript event handlers inline
    const eventHandlers = [
      'onclick', 'onload', 'onmouseover', 'onmouseout', 'onchange', 
      'onsubmit', 'onfocus', 'onblur', 'onkeydown', 'onkeyup'
    ];
    
    fc.assert(fc.property(
      fc.constantFrom(...eventHandlers), // Test each event handler
      (handler) => {
        const handlerPattern = new RegExp(`\\s${handler}\\s*=`, 'i');
        const hasInlineHandler = handlerPattern.test(htmlContent);
        
        if (hasInlineHandler) {
          console.warn(`Found inline event handler "${handler}" in HTML`);
          expect(false).toBe(true); // Force failure
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have maintainable CSS class naming conventions', () => {
    // Property: CSS classes should follow consistent naming conventions for maintainability
    
    // Extract all CSS class selectors
    const classSelectors = cssContent.match(/\.[a-zA-Z][a-zA-Z0-9_-]*(?:\s|{|,|:)/g) || [];
    const uniqueClasses = [...new Set(classSelectors.map(cls => cls.replace(/[^a-zA-Z0-9_-]/g, '')))];
    
    fc.assert(fc.property(
      fc.constantFrom(...uniqueClasses), // Test each CSS class
      (className) => {
        if (!className || className.length === 0) return true;
        
        // Should follow BEM-like or consistent naming convention
        // 1. Should use lowercase and hyphens (kebab-case)
        const isKebabCase = /^[a-z][a-z0-9-]*$/.test(className);
        
        // 2. Should not use camelCase or snake_case for CSS classes
        const isCamelCase = /[A-Z]/.test(className);
        const hasUnderscore = className.includes('_') && !className.includes('__'); // Allow BEM modifiers
        
        if (!isKebabCase || isCamelCase || hasUnderscore) {
          console.warn(`CSS class "${className}" should follow kebab-case naming convention`);
          expect(false).toBe(true); // Force failure
        }
        
        // 3. Should be descriptive, not generic
        const genericNames = ['content', 'wrapper', 'container', 'div', 'span', 'item'];
        const isGeneric = genericNames.includes(className.toLowerCase());
        
        if (isGeneric && !className.includes('-')) { // Allow compound names like 'nav-item'
          console.warn(`CSS class "${className}" is too generic, should be more descriptive`);
          expect(false).toBe(true); // Force failure
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper file organization structure', () => {
    // Property: Project should have proper file organization for maintainability
    
    const expectedDirectories = ['css', 'js', 'assets'];
    const expectedFiles = ['index.html', 'css/main.css'];
    
    fc.assert(fc.property(
      fc.constantFrom(...expectedFiles), // Test each expected file
      (filePath) => {
        const fileExists = fs.existsSync(filePath);
        expect(fileExists).toBe(true);
        
        // Files should have reasonable content
        if (fileExists) {
          const content = fs.readFileSync(filePath, 'utf-8');
          expect(content.length).toBeGreaterThan(0);
        }
        
        return true;
      }
    ), { numRuns: 100 });
    
    // Check directory structure
    expectedDirectories.forEach(dir => {
      const dirExists = fs.existsSync(dir);
      expect(dirExists).toBe(true);
    });
  });

  it('should have clear content update patterns', () => {
    // Property: HTML should have clear comments indicating where to add new content
    
    const contentUpdateComments = [
      /<!--[\s\S]*?add.*?project/i,
      /<!--[\s\S]*?add.*?writing/i,
      /<!--[\s\S]*?update.*?content/i,
      /<!--[\s\S]*?new.*?entry/i
    ];
    
    fc.assert(fc.property(
      fc.constantFrom(...contentUpdateComments), // Test each comment pattern
      (commentPattern) => {
        const hasUpdateComment = commentPattern.test(htmlContent);
        
        // At least some content sections should have update instructions
        // This is checked in aggregate rather than requiring all patterns
        return true;
      }
    ), { numRuns: 100 });
    
    // Overall check: should have some content update comments
    const totalUpdateComments = contentUpdateComments.reduce((count, pattern) => {
      return count + (pattern.test(htmlContent) ? 1 : 0);
    }, 0);
    
    expect(totalUpdateComments).toBeGreaterThan(0);
  });
});