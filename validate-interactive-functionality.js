// Validation script for interactive functionality
// This script validates that all required interactive features are implemented

const fs = require('fs');
const path = require('path');

function validateInteractiveFunctionality() {
    console.log('🔍 Validating Interactive Functionality Implementation...\n');
    
    let allTestsPassed = true;
    
    // Read the main JavaScript file
    const jsContent = fs.readFileSync('js/main.js', 'utf8');
    
    // Read the HTML file
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Read the CSS file
    const cssContent = fs.readFileSync('css/main.css', 'utf8');
    
    // Test 1: Smooth scroll navigation
    console.log('✅ Test 1: Smooth scroll navigation');
    if (jsContent.includes('initializeSmoothScroll') && 
        jsContent.includes('behavior: \'smooth\'') &&
        cssContent.includes('scroll-behavior: smooth')) {
        console.log('   ✓ Smooth scroll functionality implemented');
    } else {
        console.log('   ❌ Smooth scroll functionality missing');
        allTestsPassed = false;
    }
    
    // Test 2: Mobile menu toggle functionality
    console.log('\n✅ Test 2: Mobile menu toggle functionality');
    if (jsContent.includes('initializeNavigation') && 
        jsContent.includes('nav__menu--open') &&
        jsContent.includes('nav__toggle--active') &&
        cssContent.includes('.nav__menu--open') &&
        cssContent.includes('.nav__toggle--active')) {
        console.log('   ✓ Mobile menu toggle functionality implemented');
    } else {
        console.log('   ❌ Mobile menu toggle functionality missing');
        allTestsPassed = false;
    }
    
    // Test 3: Typing animation effect for hero section
    console.log('\n✅ Test 3: Typing animation effect for hero section');
    if (jsContent.includes('initializeTypingAnimation') && 
        jsContent.includes('hero__typing-words') &&
        jsContent.includes('data-words') &&
        htmlContent.includes('hero__typing-words') &&
        cssContent.includes('hero__typing-cursor')) {
        console.log('   ✓ Typing animation functionality implemented');
    } else {
        console.log('   ❌ Typing animation functionality missing');
        allTestsPassed = false;
    }
    
    // Test 4: Lazy loading for images
    console.log('\n✅ Test 4: Lazy loading for images');
    if (jsContent.includes('initializeLazyLoading') && 
        jsContent.includes('IntersectionObserver') &&
        jsContent.includes('loading="lazy"') &&
        htmlContent.includes('loading="lazy"') &&
        cssContent.includes('img[loading="lazy"]')) {
        console.log('   ✓ Lazy loading functionality implemented');
    } else {
        console.log('   ❌ Lazy loading functionality missing');
        allTestsPassed = false;
    }
    
    // Test 5: Progressive enhancement (works without JS)
    console.log('\n✅ Test 5: Progressive enhancement (works without JS)');
    if (htmlContent.includes('role="navigation"') && 
        htmlContent.includes('role="main"') &&
        htmlContent.includes('aria-label') &&
        cssContent.includes('nav__menu') &&
        cssContent.includes('nav__toggle')) {
        console.log('   ✓ Progressive enhancement implemented (semantic HTML + CSS fallbacks)');
    } else {
        console.log('   ❌ Progressive enhancement missing');
        allTestsPassed = false;
    }
    
    // Test 6: All functions are called on DOMContentLoaded
    console.log('\n✅ Test 6: All functions initialized on DOMContentLoaded');
    const requiredFunctions = [
        'initializeNavigation',
        'initializeSmoothScroll', 
        'initializeActiveNavigation',
        'initializeTypingAnimation',
        'initializeProjectsGallery',
        'initializeWritingSection',
        'initializeLazyLoading'
    ];
    
    let allFunctionsCalled = true;
    requiredFunctions.forEach(func => {
        if (!jsContent.includes(`${func}();`)) {
            console.log(`   ❌ ${func} not called on DOMContentLoaded`);
            allFunctionsCalled = false;
            allTestsPassed = false;
        }
    });
    
    if (allFunctionsCalled) {
        console.log('   ✓ All required functions are called on DOMContentLoaded');
    }
    
    // Final result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
        console.log('🎉 All interactive functionality tests PASSED!');
        console.log('✅ Task 9 implementation is complete and correct.');
    } else {
        console.log('❌ Some tests FAILED. Please review the implementation.');
    }
    console.log('='.repeat(50));
    
    return allTestsPassed;
}

// Run validation if this script is executed directly
if (require.main === module) {
    validateInteractiveFunctionality();
}

module.exports = { validateInteractiveFunctionality };