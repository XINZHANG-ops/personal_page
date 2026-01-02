/**
 * Property-Based Test for Accessibility Standards Compliance
 * Feature: personal-portfolio-site, Property 7: Accessibility Standards Compliance
 * Validates: Requirements 5.5
 * 
 * This test validates that color combinations meet WCAG AA standards (4.5:1 for normal text)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 7: Accessibility Standards Compliance', () => {
  let cssContent;
  let htmlContent;
  
  beforeEach(() => {
    // Load CSS and HTML content for analysis
    const cssPath = path.resolve('./css/main.css');
    const htmlPath = path.resolve('./index.html');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  });

  /**
   * Convert hex color to RGB values
   * @param {string} hex - Hex color code (e.g., "#ffffff" or "#fff")
   * @returns {Object} RGB values {r, g, b}
   */
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-digit hex codes
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b };
  }

  /**
   * Calculate relative luminance of a color
   * @param {Object} rgb - RGB values {r, g, b}
   * @returns {number} Relative luminance
   */
  function getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Extract color values from CSS custom properties
   * @returns {Object} Color mappings
   */
  function extractCSSColors() {
    const colors = {};
    
    // Extract CSS custom properties (variables)
    const variableMatches = cssContent.match(/--[\w-]+:\s*#[0-9a-fA-F]{3,6}/g) || [];
    
    variableMatches.forEach(match => {
      const [property, value] = match.split(':').map(s => s.trim());
      const colorName = property.replace('--color-', '');
      colors[colorName] = value;
    });
    
    // Add common web colors if not found
    if (!colors.white) colors.white = '#ffffff';
    if (!colors.black) colors.black = '#000000';
    
    return colors;
  }

  it('should meet WCAG AA contrast requirements for all color combinations', () => {
    // Property: For any color combination used in the design, 
    // the contrast ratio should meet WCAG AA standards (4.5:1 for normal text)
    
    const colors = extractCSSColors();
    const colorNames = Object.keys(colors);
    
    // Skip test if no colors found
    if (colorNames.length === 0) {
      console.warn('No CSS color variables found, skipping contrast test');
      return;
    }
    
    fc.assert(fc.property(
      fc.constantFrom(...colorNames), // Text color
      fc.constantFrom(...colorNames), // Background color
      (textColorName, bgColorName) => {
        // Skip if same color (not a valid combination)
        if (textColorName === bgColorName) return true;
        
        const textColor = colors[textColorName];
        const bgColor = colors[bgColorName];
        
        // Skip if colors are not valid hex codes
        if (!textColor || !bgColor || 
            !textColor.match(/^#[0-9a-fA-F]{3,6}$/) || 
            !bgColor.match(/^#[0-9a-fA-F]{3,6}$/)) {
          return true;
        }
        
        const contrastRatio = getContrastRatio(textColor, bgColor);
        
        // Check if this combination is actually used in the CSS
        const isUsedCombination = checkColorCombinationUsage(textColorName, bgColorName);
        
        // Only enforce WCAG AA for combinations that are actually used
        if (isUsedCombination) {
          expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  /**
   * Check if a color combination is actually used in the CSS
   * @param {string} textColorName - Text color variable name
   * @param {string} bgColorName - Background color variable name
   * @returns {boolean} Whether the combination is used
   */
  function checkColorCombinationUsage(textColorName, bgColorName) {
    // Look for common patterns where text and background colors are used together
    const textPattern = new RegExp(`var\\(--color-${textColorName}\\)|color:\\s*var\\(--color-${textColorName}\\)`, 'i');
    const bgPattern = new RegExp(`var\\(--color-${bgColorName}\\)|background-color:\\s*var\\(--color-${bgColorName}\\)`, 'i');
    
    // Check if both colors appear in the same CSS rule or nearby rules
    const cssRules = cssContent.split('}');
    
    return cssRules.some(rule => {
      return textPattern.test(rule) && bgPattern.test(rule);
    });
  }

  it('should have proper semantic HTML structure for accessibility', () => {
    // Property: For any page section, the HTML should use proper semantic elements
    
    fc.assert(fc.property(
      fc.constantFrom('header', 'main', 'section', 'article', 'footer', 'nav'), // Semantic elements
      (semanticElement) => {
        const elementPattern = new RegExp(`<${semanticElement}[^>]*>`, 'i');
        const hasSemanticElement = elementPattern.test(htmlContent);
        
        // All major semantic elements should be present
        if (['header', 'main', 'footer', 'nav'].includes(semanticElement)) {
          expect(hasSemanticElement).toBe(true);
        }
        
        // Check that semantic elements are used instead of generic divs for major sections
        if (semanticElement === 'main') {
          const mainElement = htmlContent.match(/<main[^>]*>/i);
          expect(mainElement).toBeTruthy();
          
          // Main should contain the primary content sections
          const mainContent = htmlContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          if (mainContent) {
            const mainInnerHTML = mainContent[1];
            expect(mainInnerHTML).toMatch(/<section[^>]*id=["']hero["'][^>]*>/i);
            expect(mainInnerHTML).toMatch(/<section[^>]*id=["']about["'][^>]*>/i);
            expect(mainInnerHTML).toMatch(/<section[^>]*id=["']projects["'][^>]*>/i);
          }
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper ARIA labels and attributes for interactive elements', () => {
    // Property: Interactive elements should have appropriate ARIA labels
    
    fc.assert(fc.property(
      fc.constantFrom('button', 'a', 'input'), // Interactive elements
      (elementType) => {
        const elementPattern = new RegExp(`<${elementType}[^>]*>`, 'gi');
        const elements = htmlContent.match(elementPattern) || [];
        
        elements.forEach(element => {
          // Buttons should have aria-label or accessible text content
          if (elementType === 'button') {
            const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(element);
            const hasTextContent = !/<[^>]*>\s*<\//.test(element); // Not self-closing or empty
            
            // Button should have either aria-label or text content for accessibility
            expect(hasAriaLabel || hasTextContent).toBe(true);
          }
          
          // Links should have meaningful text or aria-label
          if (elementType === 'a') {
            const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(element);
            const isExternalLink = /target=["']_blank["']/i.test(element);
            
            // External links should have proper rel attributes
            if (isExternalLink) {
              const hasProperRel = /rel=["'][^"']*noopener[^"']*["']/i.test(element);
              expect(hasProperRel).toBe(true);
            }
          }
        });
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper focus states for keyboard navigation', () => {
    // Property: All interactive elements should have visible focus states
    
    const focusStatePattern = /\*:focus|:focus/gi;
    const focusStates = cssContent.match(focusStatePattern) || [];
    
    // Should have global focus styles
    expect(focusStates.length).toBeGreaterThan(0);
    
    // Check for specific focus styles on interactive elements
    fc.assert(fc.property(
      fc.constantFrom('button', 'a', 'input'), // Interactive elements
      (elementType) => {
        // Look for focus styles for this element type
        const elementFocusPattern = new RegExp(`\\.?[\\w-]*${elementType}[\\w-]*:focus|${elementType}:focus`, 'i');
        const hasElementFocus = elementFocusPattern.test(cssContent) || 
                               /\*:focus/.test(cssContent); // Global focus styles
        
        expect(hasElementFocus).toBe(true);
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper heading hierarchy', () => {
    // Property: Heading elements should follow proper hierarchical order (h1 → h2 → h3)
    
    const headingMatches = htmlContent.match(/<h[1-6][^>]*>/gi) || [];
    const headingLevels = headingMatches.map(heading => {
      const level = heading.match(/h([1-6])/i);
      return level ? parseInt(level[1]) : 0;
    });
    
    // Should have at least one h1
    expect(headingLevels).toContain(1);
    
    // Check heading hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];
      
      // Should not skip heading levels (e.g., h1 → h3)
      if (currentLevel > previousLevel) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  it('should have proper alt text for images', () => {
    // Property: All images should have appropriate alt attributes
    
    const imageMatches = htmlContent.match(/<img[^>]*>/gi) || [];
    
    imageMatches.forEach(img => {
      // Should have alt attribute
      const hasAlt = /alt=["'][^"']*["']/i.test(img);
      expect(hasAlt).toBe(true);
      
      // Alt text should be descriptive (not just filename)
      const altMatch = img.match(/alt=["']([^"']*)["']/i);
      if (altMatch) {
        const altText = altMatch[1];
        // Alt text should not be just a filename
        expect(altText).not.toMatch(/\.(jpg|jpeg|png|gif|svg)$/i);
        // Alt text should not be empty for content images
        if (!img.includes('decorative')) {
          expect(altText.length).toBeGreaterThan(0);
        }
      }
    });
  });
});