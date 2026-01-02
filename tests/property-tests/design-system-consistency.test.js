/**
 * Property-Based Test for Design System Consistency
 * Feature: personal-portfolio-site, Property 9: Design System Consistency
 * Validates: Requirements 7.2
 * 
 * This test validates that color and font declarations use defined CSS custom properties (variables) for consistency
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 9: Design System Consistency', () => {
  let cssContent;
  
  beforeEach(() => {
    // Load CSS content for analysis
    const cssPath = path.resolve('./css/main.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');
  });

  /**
   * Extract all CSS custom properties (variables) from the CSS content
   * @returns {Object} Object with variable names as keys and values as values
   */
  function extractCSSVariables() {
    const variables = {};
    
    // Match CSS custom properties in :root
    const rootMatch = cssContent.match(/:root\s*{([^}]*)}/s);
    if (rootMatch) {
      const rootContent = rootMatch[1];
      const variableMatches = rootContent.match(/--[\w-]+:\s*[^;]+;/g) || [];
      
      variableMatches.forEach(match => {
        const [property, value] = match.split(':').map(s => s.trim());
        const cleanValue = value.replace(';', '').trim();
        variables[property] = cleanValue;
      });
    }
    
    return variables;
  }

  /**
   * Extract all color declarations from CSS (excluding variables)
   * @returns {Array} Array of color declarations with their context
   */
  function extractColorDeclarations() {
    const colorDeclarations = [];
    
    // Remove :root block to avoid matching variable definitions
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]*}/s, '');
    
    // Match color properties (color, background-color, border-color, etc.)
    const colorPatterns = [
      /color:\s*([^;]+);/gi,
      /background-color:\s*([^;]+);/gi,
      /border-color:\s*([^;]+);/gi,
      /background:\s*([^;]+);/gi
    ];
    
    colorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cssWithoutRoot)) !== null) {
        const value = match[1].trim();
        // Skip if it's already using a CSS variable
        if (!value.startsWith('var(')) {
          colorDeclarations.push({
            property: match[0],
            value: value,
            fullMatch: match[0]
          });
        }
      }
    });
    
    return colorDeclarations;
  }

  /**
   * Extract all font declarations from CSS (excluding variables)
   * @returns {Array} Array of font declarations with their context
   */
  function extractFontDeclarations() {
    const fontDeclarations = [];
    
    // Remove :root block to avoid matching variable definitions
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]*}/s, '');
    
    // Match font properties
    const fontPatterns = [
      /font-family:\s*([^;]+);/gi,
      /font-size:\s*([^;]+);/gi,
      /font-weight:\s*([^;]+);/gi
    ];
    
    fontPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(cssWithoutRoot)) !== null) {
        const value = match[1].trim();
        // Skip if it's already using a CSS variable
        if (!value.startsWith('var(')) {
          fontDeclarations.push({
            property: match[0],
            value: value,
            fullMatch: match[0]
          });
        }
      }
    });
    
    return fontDeclarations;
  }

  /**
   * Check if a color value has a corresponding CSS variable
   * @param {string} colorValue - The color value to check
   * @param {Object} variables - CSS variables object
   * @returns {boolean} Whether a corresponding variable exists
   */
  function hasCorrespondingColorVariable(colorValue, variables) {
    // Normalize the color value
    const normalizedValue = colorValue.toLowerCase().trim();
    
    // Check if any color variable matches this value
    return Object.entries(variables).some(([varName, varValue]) => {
      if (varName.includes('color')) {
        return varValue.toLowerCase().trim() === normalizedValue;
      }
      return false;
    });
  }

  /**
   * Check if a font value has a corresponding CSS variable
   * @param {string} fontValue - The font value to check
   * @param {Object} variables - CSS variables object
   * @returns {boolean} Whether a corresponding variable exists
   */
  function hasCorrespondingFontVariable(fontValue, variables) {
    // Normalize the font value
    const normalizedValue = fontValue.toLowerCase().trim();
    
    // Check if any font variable matches this value
    return Object.entries(variables).some(([varName, varValue]) => {
      if (varName.includes('font')) {
        return varValue.toLowerCase().trim() === normalizedValue;
      }
      return false;
    });
  }

  it('should use CSS custom properties for all color declarations', () => {
    // Property: For any color declaration in CSS, it should use defined CSS custom properties (variables) for consistency
    
    const variables = extractCSSVariables();
    const colorDeclarations = extractColorDeclarations();
    
    // Should have color variables defined
    const colorVariables = Object.keys(variables).filter(key => key.includes('color'));
    expect(colorVariables.length).toBeGreaterThan(0);
    
    fc.assert(fc.property(
      fc.constantFrom(...colorDeclarations.map((_, index) => index)), // Index of color declaration
      (declarationIndex) => {
        if (declarationIndex >= colorDeclarations.length) return true;
        
        const declaration = colorDeclarations[declarationIndex];
        const { value, property } = declaration;
        
        // Skip certain exceptions that are acceptable
        const acceptableExceptions = [
          'transparent',
          'inherit',
          'initial',
          'unset',
          'currentColor',
          'rgba(0, 0, 0, 0)', // Transparent variations
          'rgba(255, 255, 255, 0)',
          /rgba\([^)]+,\s*0\)/, // Any transparent rgba
          /linear-gradient/, // Gradients can use variables within them
          /radial-gradient/
        ];
        
        const isException = acceptableExceptions.some(exception => {
          if (typeof exception === 'string') {
            return value.toLowerCase().includes(exception.toLowerCase());
          } else {
            return exception.test(value);
          }
        });
        
        if (isException) return true;
        
        // Check if this color value should use a CSS variable
        const shouldUseVariable = hasCorrespondingColorVariable(value, variables);
        
        if (shouldUseVariable) {
          // This color has a corresponding variable but isn't using it
          console.warn(`Color declaration "${property}" should use CSS variable instead of direct value "${value}"`);
          expect(false).toBe(true); // Force failure with descriptive message
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use CSS custom properties for all font declarations', () => {
    // Property: For any font declaration in CSS, it should use defined CSS custom properties (variables) for consistency
    
    const variables = extractCSSVariables();
    const fontDeclarations = extractFontDeclarations();
    
    // Should have font variables defined
    const fontVariables = Object.keys(variables).filter(key => key.includes('font'));
    expect(fontVariables.length).toBeGreaterThan(0);
    
    fc.assert(fc.property(
      fc.constantFrom(...fontDeclarations.map((_, index) => index)), // Index of font declaration
      (declarationIndex) => {
        if (declarationIndex >= fontDeclarations.length) return true;
        
        const declaration = fontDeclarations[declarationIndex];
        const { value, property } = declaration;
        
        // Skip certain exceptions that are acceptable
        const acceptableExceptions = [
          'inherit',
          'initial',
          'unset',
          'normal',
          'bold',
          'bolder',
          'lighter',
          /^\d+$/, // Numeric font-weight values like 400, 600
          /^[1-9]\d{2}$/ // Font-weight values 100-900
        ];
        
        const isException = acceptableExceptions.some(exception => {
          if (typeof exception === 'string') {
            return value.toLowerCase() === exception.toLowerCase();
          } else {
            return exception.test(value);
          }
        });
        
        if (isException) return true;
        
        // Check if this font value should use a CSS variable
        const shouldUseVariable = hasCorrespondingFontVariable(value, variables);
        
        if (shouldUseVariable) {
          // This font has a corresponding variable but isn't using it
          console.warn(`Font declaration "${property}" should use CSS variable instead of direct value "${value}"`);
          expect(false).toBe(true); // Force failure with descriptive message
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should have comprehensive CSS custom properties for design system', () => {
    // Property: The design system should have CSS variables for all major design tokens
    
    const variables = extractCSSVariables();
    const variableNames = Object.keys(variables);
    
    // Required design system categories
    const requiredCategories = [
      { category: 'colors', pattern: /--color-/, minCount: 5 },
      { category: 'fonts', pattern: /--font-/, minCount: 2 },
      { category: 'spacing', pattern: /--space-/, minCount: 4 },
      { category: 'layout', pattern: /--/, minCount: 1 } // Any other layout variables
    ];
    
    fc.assert(fc.property(
      fc.constantFrom(...requiredCategories), // Test each category
      (categoryInfo) => {
        const { category, pattern, minCount } = categoryInfo;
        const categoryVariables = variableNames.filter(name => pattern.test(name));
        
        expect(categoryVariables.length).toBeGreaterThanOrEqual(minCount);
        
        // Each variable should have a non-empty value
        categoryVariables.forEach(varName => {
          const value = variables[varName];
          expect(value).toBeTruthy();
          expect(value.length).toBeGreaterThan(0);
        });
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use consistent spacing values based on 8px base unit', () => {
    // Property: All spacing values should be based on the 8px base unit system
    
    const variables = extractCSSVariables();
    const spacingVariables = Object.entries(variables).filter(([name]) => name.includes('space'));
    
    expect(spacingVariables.length).toBeGreaterThan(0);
    
    fc.assert(fc.property(
      fc.constantFrom(...spacingVariables), // Test each spacing variable
      ([varName, varValue]) => {
        // Parse the rem value and convert to pixels (assuming 1rem = 16px)
        const remMatch = varValue.match(/^([\d.]+)rem$/);
        if (remMatch) {
          const remValue = parseFloat(remMatch[1]);
          const pixelValue = remValue * 16; // Convert rem to pixels
          
          // Should be a multiple of 8px (with some tolerance for floating point)
          const isMultipleOf8 = Math.abs(pixelValue % 8) < 0.1;
          expect(isMultipleOf8).toBe(true);
        }
        
        return true;
      }
    ), { numRuns: 100 });
  });

  it('should use consistent typography scale', () => {
    // Property: Font sizes should follow a consistent modular scale
    
    const variables = extractCSSVariables();
    const fontSizeVariables = Object.entries(variables)
      .filter(([name]) => name.includes('font-size'))
      .sort(([, a], [, b]) => {
        // Sort by rem value
        const aRem = parseFloat(a.match(/^([\d.]+)rem$/)?.[1] || '0');
        const bRem = parseFloat(b.match(/^([\d.]+)rem$/)?.[1] || '0');
        return aRem - bRem;
      });
    
    expect(fontSizeVariables.length).toBeGreaterThan(2);
    
    // Check that font sizes follow a consistent scale (approximately 1.25 ratio)
    for (let i = 1; i < fontSizeVariables.length; i++) {
      const [, currentValue] = fontSizeVariables[i];
      const [, previousValue] = fontSizeVariables[i - 1];
      
      const currentRem = parseFloat(currentValue.match(/^([\d.]+)rem$/)?.[1] || '0');
      const previousRem = parseFloat(previousValue.match(/^([\d.]+)rem$/)?.[1] || '0');
      
      if (currentRem > 0 && previousRem > 0) {
        const ratio = currentRem / previousRem;
        // Should be approximately 1.25 (modular scale) with some tolerance
        expect(ratio).toBeGreaterThan(1.1);
        expect(ratio).toBeLessThan(1.4);
      }
    }
  });

  it('should have proper CSS variable naming conventions', () => {
    // Property: CSS variables should follow consistent naming conventions
    
    const variables = extractCSSVariables();
    const variableNames = Object.keys(variables);
    
    fc.assert(fc.property(
      fc.constantFrom(...variableNames), // Test each variable name
      (varName) => {
        // Should start with --
        expect(varName).toMatch(/^--/);
        
        // Should use kebab-case (lowercase with hyphens)
        expect(varName).toMatch(/^--[a-z][a-z0-9-]*$/);
        
        // Should not have consecutive hyphens
        expect(varName).not.toMatch(/--/);
        
        // Should not end with hyphen
        expect(varName).not.toMatch(/-$/);
        
        return true;
      }
    ), { numRuns: 100 });
  });
});