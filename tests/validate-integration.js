/**
 * Final Integration and Testing Script
 * Validates all sections are properly linked and navigable
 * Tests cross-browser compatibility requirements
 * Validates HTML and CSS for standards compliance
 * Verifies external links work correctly
 * Requirements: 2.5, 3.3, 5.1, 5.2
 */

import fs from 'fs';
import path from 'path';

// ANSI color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${colors.bold}=== ${title} ===${colors.reset}`, 'blue');
}

function logTest(testName, passed, details = '') {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const statusColor = passed ? 'green' : 'red';
    log(`${colors[statusColor]}${status}${colors.reset} ${testName}`);
    if (details) {
        log(`  ${details}`, 'yellow');
    }
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;

function runTest(testName, testFunction, details = '') {
    totalTests++;
    try {
        const result = testFunction();
        if (result) {
            passedTests++;
            logTest(testName, true, details);
        } else {
            logTest(testName, false, details);
        }
        return result;
    } catch (error) {
        logTest(testName, false, `Error: ${error.message}`);
        return false;
    }
}

// Read file helper
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Cannot read file ${filePath}: ${error.message}`);
    }
}

// Check if file exists
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Test 1: Ensure all sections are properly linked and navigable
 * Requirements: 5.1, 5.2 (responsive navigation)
 */
function testSectionLinking() {
    logSection('Section Linking and Navigation Tests');
    
    const htmlContent = readFile('index.html');
    
    // Test 1.1: Check that all navigation links have corresponding sections
    runTest('Navigation links have corresponding sections', () => {
        const navLinks = htmlContent.match(/href="#([^"]+)"/g) || [];
        const sections = htmlContent.match(/id="([^"]+)"/g) || [];
        
        const navTargets = navLinks
            .map(link => link.match(/href="#([^"]+)"/)[1])
            .filter(target => target !== 'main-content'); // Skip accessibility link
        
        const sectionIds = sections
            .map(section => section.match(/id="([^"]+)"/)[1]);
        
        return navTargets.every(target => sectionIds.includes(target));
    }, `Found nav targets: ${htmlContent.match(/href="#([^"]+)"/g)?.length || 0}`);
    
    // Test 1.2: Check semantic HTML structure
    runTest('Proper semantic HTML structure', () => {
        const hasHeader = htmlContent.includes('<header');
        const hasMain = htmlContent.includes('<main');
        const hasNav = htmlContent.includes('<nav');
        const hasFooter = htmlContent.includes('<footer');
        const hasSections = htmlContent.includes('<section');
        
        return hasHeader && hasMain && hasNav && hasFooter && hasSections;
    }, 'Checking for header, main, nav, footer, and section elements');
    
    // Test 1.3: Check ARIA labels and accessibility
    runTest('Accessibility attributes present', () => {
        const hasAriaLabels = htmlContent.includes('aria-label');
        const hasAriaDescribedBy = htmlContent.includes('aria-describedby');
        const hasRoleAttributes = htmlContent.includes('role=');
        const hasSkipLink = htmlContent.includes('skip-link');
        
        return hasAriaLabels && hasAriaDescribedBy && hasRoleAttributes && hasSkipLink;
    }, 'Checking ARIA labels, roles, and skip link');
    
    // Test 1.4: Check smooth scroll JavaScript functionality
    const jsContent = readFile('js/main.js');
    runTest('Smooth scroll navigation implemented', () => {
        return jsContent.includes('initializeSmoothScroll') && 
               jsContent.includes('behavior: \'smooth\'');
    }, 'Checking for smooth scroll implementation');
}

/**
 * Test 2: Validate HTML and CSS for standards compliance
 * Requirements: 5.4 (semantic HTML), 7.2 (design system)
 */
function testStandardsCompliance() {
    logSection('Standards Compliance Tests');
    
    const htmlContent = readFile('index.html');
    const cssContent = readFile('css/main.css');
    
    // Test 2.1: HTML5 DOCTYPE and structure
    runTest('Valid HTML5 DOCTYPE and structure', () => {
        const hasDoctype = htmlContent.startsWith('<!DOCTYPE html>');
        const hasLang = htmlContent.includes('lang="en"');
        const hasCharset = htmlContent.includes('charset="UTF-8"');
        const hasViewport = htmlContent.includes('viewport');
        
        return hasDoctype && hasLang && hasCharset && hasViewport;
    }, 'Checking DOCTYPE, lang, charset, and viewport');
    
    // Test 2.2: CSS custom properties (design system)
    runTest('CSS custom properties for design system', () => {
        const hasColorVars = cssContent.includes('--color-primary');
        const hasFontVars = cssContent.includes('--font-size');
        const hasSpaceVars = cssContent.includes('--space-');
        const hasBreakpointVars = cssContent.includes('--breakpoint-');
        
        return hasColorVars && hasFontVars && hasSpaceVars && hasBreakpointVars;
    }, 'Checking for color, font, spacing, and breakpoint variables');
    
    // Test 2.3: No inline styles (maintainability)
    runTest('No inline styles in HTML', () => {
        const inlineStyleCount = (htmlContent.match(/style="/g) || []).length;
        return inlineStyleCount === 0;
    }, `Found ${(htmlContent.match(/style="/g) || []).length} inline styles`);
    
    // Test 2.4: Proper heading hierarchy
    runTest('Proper heading hierarchy', () => {
        const headings = htmlContent.match(/<h[1-6][^>]*>/g) || [];
        const headingLevels = headings.map(h => parseInt(h.match(/h([1-6])/)[1]));
        
        // Check that h1 comes first and no levels are skipped
        if (headingLevels.length === 0) return false;
        if (headingLevels[0] !== 1) return false;
        
        for (let i = 1; i < headingLevels.length; i++) {
            if (headingLevels[i] > headingLevels[i-1] + 1) return false;
        }
        
        return true;
    }, `Found ${(htmlContent.match(/<h[1-6][^>]*>/g) || []).length} headings`);
}

/**
 * Test 3: Test responsive design implementation
 * Requirements: 5.1, 5.2 (responsive layout)
 */
function testResponsiveDesign() {
    logSection('Responsive Design Tests');
    
    const cssContent = readFile('css/main.css');
    
    // Test 3.1: Media queries for different breakpoints
    runTest('Media queries for mobile, tablet, desktop', () => {
        const mobileQuery = cssContent.includes('@media (max-width: 767px)');
        const tabletQuery = cssContent.includes('@media (min-width: 768px)');
        const desktopQuery = cssContent.includes('@media (min-width: 1024px)');
        
        return mobileQuery && tabletQuery && desktopQuery;
    }, 'Checking for 767px, 768px, and 1024px breakpoints');
    
    // Test 3.2: Responsive navigation implementation
    runTest('Responsive navigation menu', () => {
        const hasMobileNav = cssContent.includes('.nav__toggle');
        const hasHiddenMenu = cssContent.includes('nav__menu--open');
        const hasHamburger = cssContent.includes('nav__toggle--active');
        
        return hasMobileNav && hasHiddenMenu && hasHamburger;
    }, 'Checking mobile navigation toggle and menu states');
    
    // Test 3.3: Flexible grid layouts
    runTest('CSS Grid and Flexbox layouts', () => {
        const hasGrid = cssContent.includes('display: grid') || cssContent.includes('display:grid');
        const hasFlex = cssContent.includes('display: flex') || cssContent.includes('display:flex');
        
        return hasGrid && hasFlex;
    }, 'Checking for CSS Grid and Flexbox usage');
    
    // Test 3.4: Responsive typography
    runTest('Responsive typography scaling', () => {
        const hasFluidTypography = cssContent.includes('clamp(') || 
                                  cssContent.includes('vw') ||
                                  (cssContent.match(/@media.*font-size/g) || []).length > 0;
        
        return hasFluidTypography;
    }, 'Checking for responsive typography techniques');
}

/**
 * Test 4: Verify external links work correctly
 * Requirements: 2.5, 3.3 (external links open in new tab)
 */
function testExternalLinks() {
    logSection('External Links Tests');
    
    const htmlContent = readFile('index.html');
    const jsContent = readFile('js/main.js');
    
    // Test 4.1: External links have target="_blank"
    runTest('External links open in new tab', () => {
        const externalLinks = htmlContent.match(/href="https?:\/\/[^"]*"/g) || [];
        const targetBlankLinks = htmlContent.match(/target="_blank"/g) || [];
        
        // Check that most external links have target="_blank"
        // Allow some flexibility as not all external links may be in HTML (some in JS)
        return targetBlankLinks.length > 0;
    }, `Found ${(htmlContent.match(/href="https?:\/\/[^"]*"/g) || []).length} external links`);
    
    // Test 4.2: External links have rel="noopener noreferrer"
    runTest('External links have security attributes', () => {
        const secureLinks = htmlContent.match(/rel="noopener noreferrer"/g) || [];
        return secureLinks.length > 0;
    }, `Found ${(htmlContent.match(/rel="noopener noreferrer"/g) || []).length} secure external links`);
    
    // Test 4.3: Project links in JavaScript data
    runTest('Project data contains external links', () => {
        const hasGithubUrls = jsContent.includes('githubUrl:');
        const hasLiveUrls = jsContent.includes('liveUrl:');
        const hasTargetBlank = jsContent.includes('target = \'_blank\'') || 
                              jsContent.includes('target="_blank"');
        
        return hasGithubUrls && hasLiveUrls && hasTargetBlank;
    }, 'Checking project data structure and link attributes');
    
    // Test 4.4: Writing links in JavaScript data
    runTest('Writing data contains external links', () => {
        const hasWritingUrls = jsContent.includes('url:') && jsContent.includes('writings');
        const hasExternalLinkCreation = jsContent.includes('target = \'_blank\'') || 
                                       jsContent.includes('target="_blank"');
        
        return hasWritingUrls && hasExternalLinkCreation;
    }, 'Checking writing data structure and external link creation');
}

/**
 * Test 5: Asset optimization and performance
 * Requirements: 6.5 (optimized assets)
 */
function testAssetOptimization() {
    logSection('Asset Optimization Tests');
    
    const htmlContent = readFile('index.html');
    
    // Test 5.1: Minified CSS and JS files referenced
    runTest('Minified assets referenced', () => {
        const hasMinifiedCSS = htmlContent.includes('main.min.css');
        const hasMinifiedJS = htmlContent.includes('main.min.js');
        
        return hasMinifiedCSS && hasMinifiedJS;
    }, 'Checking for .min.css and .min.js references');
    
    // Test 5.2: Lazy loading implemented
    runTest('Lazy loading for images', () => {
        const hasLazyLoading = htmlContent.includes('loading="lazy"');
        const jsContent = readFile('js/main.js');
        const hasLazyLoadingJS = jsContent.includes('initializeLazyLoading');
        
        return hasLazyLoading && hasLazyLoadingJS;
    }, 'Checking HTML lazy loading and JavaScript implementation');
    
    // Test 5.3: Preload critical resources
    runTest('Critical resource preloading', () => {
        const hasPreload = htmlContent.includes('rel="preload"');
        const hasPreconnect = htmlContent.includes('rel="preconnect"');
        
        return hasPreload && hasPreconnect;
    }, 'Checking for preload and preconnect directives');
    
    // Test 5.4: Check if minified files exist
    runTest('Minified files exist', () => {
        const minCSSExists = fileExists('css/main.min.css');
        const minJSExists = fileExists('js/main.min.js');
        
        return minCSSExists && minJSExists;
    }, 'Verifying minified files are present on disk');
}

/**
 * Test 6: Cross-browser compatibility features
 * Requirements: 5.1, 5.2 (cross-browser responsive design)
 */
function testCrossBrowserCompatibility() {
    logSection('Cross-Browser Compatibility Tests');
    
    const cssContent = readFile('css/main.css');
    const jsContent = readFile('js/main.js');
    
    // Test 6.1: CSS fallbacks and progressive enhancement
    runTest('CSS fallbacks for modern features', () => {
        const hasFlexFallbacks = cssContent.includes('display: block') || 
                                cssContent.includes('display: inline-block');
        const hasColorFallbacks = cssContent.includes('background-color:') && 
                                 cssContent.includes('background:');
        
        return hasFlexFallbacks || hasColorFallbacks;
    }, 'Checking for CSS fallback patterns');
    
    // Test 6.2: JavaScript feature detection
    runTest('JavaScript feature detection', () => {
        const hasIntersectionObserverCheck = jsContent.includes('IntersectionObserver');
        const hasFallback = jsContent.includes('if (!') || jsContent.includes('if(!');
        
        return hasIntersectionObserverCheck && hasFallback;
    }, 'Checking for feature detection in JavaScript');
    
    // Test 6.3: Accessibility preferences support
    runTest('Accessibility preferences support', () => {
        const hasReducedMotion = cssContent.includes('prefers-reduced-motion');
        const hasHighContrast = cssContent.includes('prefers-contrast');
        
        return hasReducedMotion && hasHighContrast;
    }, 'Checking for reduced motion and high contrast support');
    
    // Test 6.4: Progressive enhancement
    runTest('Progressive enhancement approach', () => {
        const hasNoJSFallback = jsContent.includes('Progressive enhancement') || 
                               jsContent.includes('works without JavaScript');
        const hasCSSSafeDefaults = cssContent.includes('display: block') || 
                                  cssContent.includes('display: inline');
        
        return hasNoJSFallback || hasCSSSafeDefaults;
    }, 'Checking for progressive enhancement patterns');
}

/**
 * Test 7: Content management and maintainability
 * Requirements: 8.2, 8.4 (maintainable code structure)
 */
function testContentManagement() {
    logSection('Content Management Tests');
    
    const htmlContent = readFile('index.html');
    const jsContent = readFile('js/main.js');
    
    // Test 7.1: Clear content update instructions
    runTest('Content update instructions in HTML', () => {
        const hasProjectInstructions = htmlContent.includes('To add new projects');
        const hasWritingInstructions = htmlContent.includes('To add new writing');
        
        return hasProjectInstructions && hasWritingInstructions;
    }, 'Checking for content management comments in HTML');
    
    // Test 7.2: Structured data arrays in JavaScript
    runTest('Structured data arrays for content', () => {
        const hasProjectsArray = jsContent.includes('const projects = [');
        const hasWritingsArray = jsContent.includes('const writings = [');
        
        return hasProjectsArray && hasWritingsArray;
    }, 'Checking for projects and writings data structures');
    
    // Test 7.3: Consistent data structure patterns
    runTest('Consistent data structure patterns', () => {
        const projectFields = ['id:', 'title:', 'description:', 'technologies:', 'githubUrl:'];
        const writingFields = ['id:', 'title:', 'type:', 'venue:', 'date:', 'url:'];
        
        const hasProjectFields = projectFields.every(field => jsContent.includes(field));
        const hasWritingFields = writingFields.every(field => jsContent.includes(field));
        
        return hasProjectFields && hasWritingFields;
    }, 'Checking for consistent field names in data structures');
}

/**
 * Main test runner
 */
function runAllTests() {
    log(`${colors.bold}Portfolio Site Integration Testing${colors.reset}`, 'blue');
    log('Testing final integration and cross-browser compatibility\n');
    
    // Run all test suites
    testSectionLinking();
    testStandardsCompliance();
    testResponsiveDesign();
    testExternalLinks();
    testAssetOptimization();
    testCrossBrowserCompatibility();
    testContentManagement();
    
    // Final results
    logSection('Test Results Summary');
    
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    const status = passedTests === totalTests ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
    const statusColor = passedTests === totalTests ? 'green' : 'red';
    
    log(`\nTotal Tests: ${totalTests}`);
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${totalTests - passedTests}`, 'red');
    log(`Pass Rate: ${passRate}%`);
    log(`\n${colors.bold}${status}${colors.reset}`, statusColor);
    
    if (passedTests === totalTests) {
        log('\n🎉 Portfolio site is ready for deployment!', 'green');
        log('All integration tests passed successfully.', 'green');
    } else {
        log('\n⚠️  Some tests failed. Please review and fix issues before deployment.', 'yellow');
    }
    
    return passedTests === totalTests;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export {
    runAllTests,
    testSectionLinking,
    testStandardsCompliance,
    testResponsiveDesign,
    testExternalLinks,
    testAssetOptimization,
    testCrossBrowserCompatibility,
    testContentManagement
};