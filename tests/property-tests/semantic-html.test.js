/**
 * Property-Based Test for Semantic HTML Structure
 * Feature: personal-portfolio-site, Property 6: Semantic HTML Structure
 * Validates: Requirements 5.4
 * 
 * This test validates semantic HTML structure using browser APIs
 * Run this test by opening semantic-html-test.html in a browser
 */

// Simple property-based testing framework
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function runPropertyTest(generator, property, numRuns = 100) {
  for (let i = 0; i < numRuns; i++) {
    const testValue = generator();
    try {
      property(testValue);
    } catch (error) {
      throw new Error(`Property failed on run ${i + 1} with value: ${testValue}. Error: ${error.message}`);
    }
  }
}

// Generators for property-based testing
const semanticElementGenerator = () => {
  const elements = ['header', 'main', 'section', 'article', 'footer', 'nav'];
  return elements[Math.floor(Math.random() * elements.length)];
};

// Load HTML content for testing
function loadHTMLForTesting() {
  return fetch('./index.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    });
}

// Property tests
function testSemanticElementsUsage(doc) {
  runPropertyTest(
    semanticElementGenerator,
    (semanticElement) => {
      const elements = doc.querySelectorAll(semanticElement);
      
      if (elements.length > 0) {
        elements.forEach(element => {
          // Semantic elements should not be empty containers without purpose
          const hasContent = element.textContent.trim().length > 0 || 
                            element.children.length > 0;
          
          // Semantic elements should have appropriate attributes when needed
          const hasAppropriateAttributes = 
            element.tagName.toLowerCase() === 'section' ? 
              element.id || element.className : true;
          
          assert(hasContent, `Semantic element ${semanticElement} should have content`);
          assert(hasAppropriateAttributes, `Semantic element ${semanticElement} should have appropriate attributes`);
        });
      }
    },
    100
  );
}

function testSemanticStructureHierarchy(doc) {
  runPropertyTest(
    () => doc,
    (document) => {
      // Check for proper semantic structure
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const footer = document.querySelector('footer');
      
      // Property: A well-structured HTML document should have these semantic elements
      assert(header, 'Document should have a header element');
      assert(main, 'Document should have a main element');
      assert(footer, 'Document should have a footer element');
      
      // Property: Main content should be within main element
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const isInMain = main.contains(section);
        assert(isInMain, 'All sections should be within the main element');
      });
      
      // Property: Navigation should be in header or nav element
      const nav = document.querySelector('nav');
      if (nav) {
        const isInHeader = header.contains(nav);
        assert(isInHeader, 'Navigation should be within the header element');
      }
    },
    100
  );
}

function testSemanticVsDivUsage(doc) {
  runPropertyTest(
    () => doc,
    (document) => {
      // Count semantic elements vs divs in key areas
      const semanticElements = document.querySelectorAll('header, main, section, article, footer, nav, aside');
      const structuralDivs = document.querySelectorAll('div[class*="header"], div[class*="main"], div[class*="section"], div[class*="footer"]');
      
      // Property: We should prefer semantic elements over divs with semantic class names
      if (semanticElements.length > 0) {
        assert(
          structuralDivs.length <= semanticElements.length,
          'Should prefer semantic elements over divs with semantic class names'
        );
      }
    },
    100
  );
}

// Main test runner
async function runSemanticHTMLTests() {
  try {
    console.log('Loading HTML for testing...');
    const doc = await loadHTMLForTesting();
    
    console.log('Running Property 6: Semantic HTML Structure tests...');
    
    console.log('Test 1: Semantic elements usage...');
    testSemanticElementsUsage(doc);
    console.log('✓ Test 1 passed');
    
    console.log('Test 2: Semantic structure hierarchy...');
    testSemanticStructureHierarchy(doc);
    console.log('✓ Test 2 passed');
    
    console.log('Test 3: Semantic vs div usage...');
    testSemanticVsDivUsage(doc);
    console.log('✓ Test 3 passed');
    
    console.log('🎉 All Property 6 tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Property test failed:', error.message);
    return false;
  }
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runSemanticHTMLTests };
}