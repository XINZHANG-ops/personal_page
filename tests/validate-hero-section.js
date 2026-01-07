// Manual validation script for hero section
// This can be run when Node.js is available to validate the implementation

const fs = require('fs');
const path = require('path');

function validateHeroSection() {
    console.log('Validating Hero Section Implementation...\n');
    
    // Read the HTML file
    const htmlPath = path.resolve('./index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    
    // Check for required elements
    const checks = [
        {
            name: 'Hero section exists',
            test: htmlContent.includes('id="hero"'),
        },
        {
            name: 'AI/ML Engineer & Researcher title present',
            test: htmlContent.includes('AI/ML Engineer & Researcher'),
        },
        {
            name: 'Typing animation elements present',
            test: htmlContent.includes('hero__typing-words') && htmlContent.includes('data-words'),
        },
        {
            name: 'Professional description present',
            test: htmlContent.includes('industrial AI experience') && htmlContent.includes('research curiosity'),
        },
        {
            name: 'Builder mindset mentioned',
            test: htmlContent.includes('builder') && htmlContent.includes('hands-on'),
        },
        {
            name: 'AI impact reflection present',
            test: htmlContent.includes('AI\'s transformative impact') || htmlContent.includes('transformative impact'),
        },
        {
            name: 'Call-to-action buttons present',
            test: htmlContent.includes('Contact') && htmlContent.includes('Projects') && htmlContent.includes('Writing'),
        }
    ];
    
    let passed = 0;
    let total = checks.length;
    
    checks.forEach(check => {
        const status = check.test ? '✓ PASS' : '✗ FAIL';
        console.log(`${status}: ${check.name}`);
        if (check.test) passed++;
    });
    
    console.log(`\nResults: ${passed}/${total} checks passed`);
    
    if (passed === total) {
        console.log('🎉 All hero section requirements implemented successfully!');
    } else {
        console.log('❌ Some requirements are missing. Please review the implementation.');
    }
}

// Run validation
validateHeroSection();