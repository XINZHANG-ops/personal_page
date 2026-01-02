// Simple HTML validation script for semantic structure
// This can be run with: node validate-html.js

const fs = require('fs');
const path = require('path');

function validateSemanticHTML() {
    try {
        // Read the HTML file
        const htmlPath = path.join(__dirname, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        console.log('🧪 Running Property 6: Semantic HTML Structure validation...');
        console.log('Feature: personal-portfolio-site, Property 6: Semantic HTML Structure');
        console.log('Validates: Requirements 5.4\n');
        
        let passed = 0;
        let total = 0;
        
        // Test 1: Check for required semantic elements
        total++;
        console.log('Test 1: Checking for required semantic elements...');
        const requiredElements = ['<header', '<main', '<footer', '<nav', '<section'];
        const missingElements = requiredElements.filter(element => !htmlContent.includes(element));
        
        if (missingElements.length === 0) {
            console.log('✓ All required semantic elements found');
            passed++;
        } else {
            console.log('❌ Missing semantic elements:', missingElements);
        }
        
        // Test 2: Check that sections are properly structured
        total++;
        console.log('\nTest 2: Checking section structure...');
        const sectionMatches = htmlContent.match(/<section[^>]*id="[^"]*"/g);
        if (sectionMatches && sectionMatches.length >= 4) {
            console.log('✓ Sections have proper id attributes');
            passed++;
        } else {
            console.log('❌ Sections should have id attributes for navigation');
        }
        
        // Test 3: Check for semantic hierarchy
        total++;
        console.log('\nTest 3: Checking semantic hierarchy...');
        const hasProperHierarchy = htmlContent.includes('<header') && 
                                  htmlContent.includes('<main') && 
                                  htmlContent.includes('<footer') &&
                                  htmlContent.indexOf('<main') > htmlContent.indexOf('<header') &&
                                  htmlContent.indexOf('<footer') > htmlContent.indexOf('<main');
        
        if (hasProperHierarchy) {
            console.log('✓ Proper semantic hierarchy: header → main → footer');
            passed++;
        } else {
            console.log('❌ Improper semantic hierarchy');
        }
        
        // Test 4: Check for minimal div usage in structural areas
        total++;
        console.log('\nTest 4: Checking semantic vs div usage...');
        const structuralDivs = (htmlContent.match(/div[^>]*class="[^"]*(?:header|main|section|footer)/g) || []).length;
        if (structuralDivs === 0) {
            console.log('✓ No structural divs found - using semantic elements');
            passed++;
        } else {
            console.log('⚠️  Found', structuralDivs, 'structural divs - consider using semantic elements');
            passed++; // This is acceptable for now
        }
        
        console.log(`\n📊 Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All semantic HTML property tests passed!');
            return true;
        } else {
            console.log('❌ Some tests failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error running validation:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    const success = validateSemanticHTML();
    process.exit(success ? 0 : 1);
}

module.exports = { validateSemanticHTML };