/**
 * Property-Based Test for Visual Hierarchy Structure
 * Feature: personal-portfolio-site, Property 10: Visual Hierarchy Structure
 * Validates: Requirements 7.4
 * 
 * This test validates that heading elements follow proper hierarchical order (h1 → h2 → h3) without skipping levels
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 10: Visual Hierarchy Structure', () => {
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
   * Extract all heading elements from HTML content
   * @returns {Array} Array of heading objects with level and text
   */
  function extractHeadings() {
    const headingMatches = htmlContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
    
    return headingMatches.map(heading => {
      const levelMatch = heading.match(/h([1-6])/i);
      const textMatch = heading.match(/>([^<]+)</);
      
      return {
        level: levelMatch ? parseInt(levelMatch[1]) : 0,
        text: textMatch ? textMatch[1].trim() : '',
        element: heading
      };
    });
  }

  /**
   * Check if heading hierarchy is valid (no skipped levels)
   * @param {Array} headings - Array of heading objects
   * @returns {boolean} Whether hierarchy is valid
   */
  function isValidHierarchy(headings) {
    if (headings.length === 0) return true;
    
    // First heading should be h1
    if (headings[0].level !== 1) return false;
    
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i].level;
      const previousLevel = headings[i - 1].level;
      
      // Can stay same level, go up one level, or go down any number of levels
      // But cannot skip levels when going down (e.g., h1 → h3)
      if (currentLevel > previousLevel && currentLevel - previousLevel > 1) {
        return false;
      }
    }
    
    return true;
  }

  it('should follow proper hierarchical order without skipping levels', () => {
    // Property: For any heading elements, they should follow proper hierarchical order (h1 → h2 → h3) without skipping levels
    
    const headings = extractHeadings();
    
    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0);
    
    fc.assert(fc.property(
      fc.constant(headings), // Use actual headings from the document
      (headingList) => {
        // Check that hierarchy is valid
        const isValid = isValidHierarchy(headingList);
        expect(isValid).toBe(true);
        
        // Should start with h1
        if (headingList.length > 0) {
          expect(headingList[0].level).toBe(1);
        }
        
        // Check each heading transition
        for (let i = 1; i < headingList.length; i++) {
          const current = headingList[i];
          const previous = headingList[i - 1];
          
          // When increasing level, should only increase by 1
          if (current.level > previous.level) {
            expect(current.level - previous.level).toBeLessThanOrEqual(1);
          }
          
          // Level should be between 1 and 6
          expect(current.level).toBeGreaterThanOrEqual(1);
          expect(current.level).toBeLessThanOrEqual(6);
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have consistent visual styling for heading levels', () => {
    // Property: Heading levels should have consistent and appropriate visual styling
    
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 6 }), // Test all heading levels
      (headingLevel) => {
        const headingSelector = `h${headingLevel}`;
        
        // Check if CSS has styles for this heading level
        const headingStylePattern = new RegExp(`h${headingLevel}[^{]*{[^}]*font-size[^}]*}`, 'i');
        const hasHeadingStyles = headingStylePattern.test(cssContent) || 
                                cssContent.includes(`h1, h2, h3, h4, h5, h6`) ||
                                cssContent.includes(`h1,h2,h3,h4,h5,h6`);
        
        // Should have some styling for headings
        expect(hasHeadingStyles).toBe(true);
        
        // Check for font-size hierarchy in CSS custom properties
        const fontSizePattern = /--font-size-(\w+):\s*([^;]+)/g;
        const fontSizes = [];
        let match;
        
        while ((match = fontSizePattern.exec(cssContent)) !== null) {
          fontSizes.push({
            name: match[1],
            value: match[2].trim()
          });
        }
        
        // Should have a range of font sizes defined
        expect(fontSizes.length).toBeGreaterThan(2);
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should maintain semantic meaning in heading structure', () => {
    // Property: Headings should represent actual content hierarchy, not just visual styling
    
    const headings = extractHeadings();
    
    fc.assert(fc.property(
      fc.constant(headings),
      (headingList) => {
        // Check that headings have meaningful text content
        headingList.forEach(heading => {
          // Heading text should not be empty
          expect(heading.text.length).toBeGreaterThan(0);
          
          // Heading text should not be just numbers or symbols
          expect(heading.text).toMatch(/[a-zA-Z]/);
          
          // Heading should not be overly long (likely not a proper heading)
          expect(heading.text.length).toBeLessThan(200);
        });
        
        // Should have logical progression of content
        if (headingList.length > 1) {
          // First heading should be the main title
          const firstHeading = headingList[0];
          expect(firstHeading.level).toBe(1);
          
          // Should have section headings (h2) for major content areas
          const sectionHeadings = headingList.filter(h => h.level === 2);
          expect(sectionHeadings.length).toBeGreaterThan(0);
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use headings appropriately within semantic sections', () => {
    // Property: Headings should be properly nested within semantic HTML sections
    
    fc.assert(fc.property(
      fc.constantFrom('section', 'article', 'aside', 'header', 'main'), // Semantic containers
      (sectionType) => {
        // Find sections of this type
        const sectionPattern = new RegExp(`<${sectionType}[^>]*>(.*?)<\/${sectionType}>`, 'gis');
        const sections = htmlContent.match(sectionPattern) || [];
        
        sections.forEach(section => {
          // Each section should ideally have a heading
          const hasHeading = /<h[1-6][^>]*>/i.test(section);
          
          // Main sections should have headings
          if (sectionType === 'section' || sectionType === 'main') {
            // Allow some flexibility - not all sections need headings (e.g., hero sections with different structure)
            // But major content sections should have them
            const hasId = /id=["'][^"']*["']/.test(section);
            if (hasId) {
              // Sections with IDs (navigation targets) should have headings or clear content structure
              const hasHeadingOrTitle = hasHeading || /class=["'][^"']*title[^"']*["']/.test(section);
              expect(hasHeadingOrTitle).toBe(true);
            }
          }
        });
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have proper heading distribution across page sections', () => {
    // Property: Headings should be distributed appropriately across different page sections
    
    const headings = extractHeadings();
    
    // Group headings by their containing sections
    const sectionHeadings = {};
    
    // Find major sections
    const sections = ['hero', 'about', 'projects', 'writing', 'contact'];
    
    sections.forEach(sectionId => {
      const sectionPattern = new RegExp(`<section[^>]*id=["']${sectionId}["'][^>]*>(.*?)<\/section>`, 'is');
      const sectionMatch = htmlContent.match(sectionPattern);
      
      if (sectionMatch) {
        const sectionContent = sectionMatch[1];
        const sectionHeadingMatches = sectionContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
        
        sectionHeadings[sectionId] = sectionHeadingMatches.map(heading => {
          const levelMatch = heading.match(/h([1-6])/i);
          return levelMatch ? parseInt(levelMatch[1]) : 0;
        });
      }
    });
    
    fc.assert(fc.property(
      fc.constant(sectionHeadings),
      (sectionHeadingMap) => {
        // Each major section should have appropriate heading structure
        Object.entries(sectionHeadingMap).forEach(([sectionId, headingLevels]) => {
          if (headingLevels.length > 0) {
            // Section headings should typically start with h2 (since h1 is page title)
            const firstHeading = Math.min(...headingLevels);
            
            // Allow h1 in hero section, h2 in other sections
            if (sectionId === 'hero') {
              expect(firstHeading).toBeGreaterThanOrEqual(1);
            } else {
              expect(firstHeading).toBeGreaterThanOrEqual(2);
            }
            
            // Headings within a section should follow hierarchy
            for (let i = 1; i < headingLevels.length; i++) {
              const current = headingLevels[i];
              const previous = headingLevels[i - 1];
              
              // Should not skip levels within a section
              if (current > previous) {
                expect(current - previous).toBeLessThanOrEqual(1);
              }
            }
          }
        });
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have accessible heading structure for screen readers', () => {
    // Property: Heading structure should provide clear navigation for screen readers
    
    const headings = extractHeadings();
    
    fc.assert(fc.property(
      fc.constant(headings),
      (headingList) => {
        // Should have a clear document outline
        if (headingList.length > 0) {
          // Document should start with h1
          expect(headingList[0].level).toBe(1);
          
          // Should have multiple levels for complex content
          const uniqueLevels = [...new Set(headingList.map(h => h.level))];
          expect(uniqueLevels.length).toBeGreaterThan(1);
          
          // Should not have too deep nesting (accessibility guideline)
          const maxLevel = Math.max(...headingList.map(h => h.level));
          expect(maxLevel).toBeLessThanOrEqual(4); // Reasonable depth limit
          
          // Each heading should provide meaningful navigation
          headingList.forEach(heading => {
            // Heading text should be descriptive
            expect(heading.text.length).toBeGreaterThan(2);
            
            // Should not be all caps (screen reader issue)
            const isAllCaps = heading.text === heading.text.toUpperCase() && 
                             heading.text !== heading.text.toLowerCase();
            expect(isAllCaps).toBe(false);
          });
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });
});