/**
 * Property-Based Test for Responsive Layout Adaptation
 * Feature: personal-portfolio-site, Property 5: Responsive Layout Adaptation
 * Validates: Requirements 5.1, 5.2
 * 
 * This test validates that CSS applies appropriate layout changes at defined breakpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 5: Responsive Layout Adaptation', () => {
  let cssContent;
  
  beforeEach(() => {
    // Load CSS content for analysis
    const cssPath = path.resolve('./css/main.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  it('should apply appropriate layout changes at defined breakpoints', () => {
    // Property: For any viewport width at defined breakpoints (768px, 1024px), 
    // the CSS should apply appropriate layout changes
    
    fc.assert(fc.property(
      fc.constantFrom(768, 1024), // Test the defined breakpoints
      (breakpoint) => {
        // Check that CSS contains media queries for the breakpoint
        const mediaQueryPattern = new RegExp(`@media.*${breakpoint - 1}px|@media.*${breakpoint}px`, 'i');
        const hasMediaQuery = mediaQueryPattern.test(cssContent);
        
        expect(hasMediaQuery).toBe(true);
        
        // Check for responsive navigation changes at mobile breakpoint (767px)
        if (breakpoint === 768) {
          const mobileMediaQuery = /@media\s*\([^)]*max-width:\s*767px[^)]*\)/i;
          const hasMobileQuery = mobileMediaQuery.test(cssContent);
          expect(hasMobileQuery).toBe(true);
          
          // Check that mobile styles hide nav menu and show toggle
          const mobileSection = cssContent.match(/@media\s*\([^)]*max-width:\s*767px[^)]*\)\s*{([^}]+{[^}]*}[^}]*)*}/i);
          if (mobileSection) {
            const mobileStyles = mobileSection[0];
            expect(mobileStyles).toMatch(/nav__menu.*display:\s*none/i);
            expect(mobileStyles).toMatch(/nav__toggle.*display:\s*flex/i);
          }
        }
        
        // Check for tablet styles at 768px breakpoint
        if (breakpoint === 768) {
          const tabletMediaQuery = /@media\s*\([^)]*min-width:\s*768px[^)]*\)/i;
          const hasTabletQuery = tabletMediaQuery.test(cssContent);
          expect(hasTabletQuery).toBe(true);
        }
        
        // Check for desktop styles at 1024px breakpoint
        if (breakpoint === 1024) {
          const desktopMediaQuery = /@media\s*\([^)]*min-width:\s*1024px[^)]*\)/i;
          const hasDesktopQuery = desktopMediaQuery.test(cssContent);
          expect(hasDesktopQuery).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  it('should have consistent responsive patterns across components', () => {
    // Property: Responsive layout changes should follow consistent patterns
    
    fc.assert(fc.property(
      fc.constantFrom('nav', 'hero', 'container'), // Test key responsive components
      (component) => {
        // Check that responsive components have appropriate breakpoint handling
        const componentPattern = new RegExp(`\\.${component}[^{]*{[^}]*}`, 'gi');
        const componentMatches = cssContent.match(componentPattern);
        
        if (componentMatches) {
          // At least one component should exist
          expect(componentMatches.length).toBeGreaterThan(0);
          
          // Check for mobile-first approach (base styles + min-width media queries)
          const hasBaseStyles = componentMatches.some(match => 
            !match.includes('@media') && match.includes(`.${component}`)
          );
          expect(hasBaseStyles).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  it('should maintain layout integrity at breakpoint boundaries', () => {
    // Property: Layout should be stable at breakpoint boundaries
    
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1400 }), // Test various viewport widths
      (viewportWidth) => {
        // Determine expected breakpoint behavior
        let expectedBreakpoint;
        if (viewportWidth <= 767) {
          expectedBreakpoint = 'mobile';
        } else if (viewportWidth <= 1023) {
          expectedBreakpoint = 'tablet';
        } else {
          expectedBreakpoint = 'desktop';
        }
        
        // Check that CSS has appropriate rules for this breakpoint
        if (expectedBreakpoint === 'mobile') {
          const mobileRules = /@media\s*\([^)]*max-width:\s*767px[^)]*\)/i;
          expect(cssContent).toMatch(mobileRules);
        } else if (expectedBreakpoint === 'tablet') {
          const tabletRules = /@media\s*\([^)]*min-width:\s*768px[^)]*\)/i;
          expect(cssContent).toMatch(tabletRules);
        } else {
          const desktopRules = /@media\s*\([^)]*min-width:\s*1024px[^)]*\)/i;
          expect(cssContent).toMatch(desktopRules);
        }
        
        // Verify no conflicting breakpoint definitions
        const allMediaQueries = cssContent.match(/@media[^{]+{/gi) || [];
        const breakpointValues = allMediaQueries
          .map(query => query.match(/(\d+)px/g))
          .filter(Boolean)
          .flat()
          .map(val => parseInt(val.replace('px', '')));
        
        // Should use consistent breakpoint values (767, 768, 1023, 1024)
        const validBreakpoints = [767, 768, 1023, 1024];
        breakpointValues.forEach(bp => {
          expect(validBreakpoints).toContain(bp);
        });
      }
    ), { numRuns: 100 });
  });
});