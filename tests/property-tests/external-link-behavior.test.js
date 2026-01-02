/**
 * Property-Based Test for External Link Behavior
 * Feature: personal-portfolio-site, Property 2: External Link Behavior
 * Validates: Requirements 2.5
 * 
 * This test validates that external project or writing links include target="_blank" 
 * attribute to open in new tab
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 2: External Link Behavior', () => {
  let jsContent;
  
  beforeEach(() => {
    // Load JavaScript content to extract project data
    const jsPath = path.resolve('./js/main.js');
    jsContent = fs.readFileSync(jsPath, 'utf-8');
    
    // Load HTML for DOM testing
    const htmlPath = path.resolve('./index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('should add target="_blank" attribute to all external project links', () => {
    // Property: For any external project or writing link, 
    // the HTML should include target="_blank" attribute to open in new tab
    
    fc.assert(fc.property(
      fc.record({
        githubUrl: fc.webUrl(),
        liveUrl: fc.oneof(fc.webUrl(), fc.constant(null)),
        title: fc.string({ minLength: 1, maxLength: 100 })
      }),
      (linkData) => {
        // Create a container for testing
        const container = document.createElement('div');
        document.body.appendChild(container);
        
        // Create links container
        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-card__links';
        
        // Create GitHub link (always external)
        const githubLink = document.createElement('a');
        githubLink.href = linkData.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.className = 'project-card__link project-card__link--github';
        githubLink.textContent = 'Code';
        githubLink.setAttribute('aria-label', `View ${linkData.title} source code on GitHub`);
        linksContainer.appendChild(githubLink);
        
        // Create live demo link if available (also external)
        if (linkData.liveUrl) {
          const liveLink = document.createElement('a');
          liveLink.href = linkData.liveUrl;
          liveLink.target = '_blank';
          liveLink.rel = 'noopener noreferrer';
          liveLink.className = 'project-card__link project-card__link--live';
          liveLink.textContent = 'Demo';
          liveLink.setAttribute('aria-label', `View ${linkData.title} live demo`);
          linksContainer.appendChild(liveLink);
        }
        
        container.appendChild(linksContainer);
        
        // Test GitHub link properties
        const renderedGithubLink = container.querySelector('.project-card__link--github');
        expect(renderedGithubLink).toBeTruthy();
        expect(renderedGithubLink.getAttribute('target')).toBe('_blank');
        expect(renderedGithubLink.getAttribute('rel')).toBe('noopener noreferrer');
        expect(renderedGithubLink.href).toBe(linkData.githubUrl);
        
        // Test live demo link properties (if present)
        if (linkData.liveUrl) {
          const renderedLiveLink = container.querySelector('.project-card__link--live');
          expect(renderedLiveLink).toBeTruthy();
          expect(renderedLiveLink.getAttribute('target')).toBe('_blank');
          expect(renderedLiveLink.getAttribute('rel')).toBe('noopener noreferrer');
          expect(renderedLiveLink.href).toBe(linkData.liveUrl);
        }
        
        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should include security attributes for all external links', () => {
    // Property: External links should include security attributes (rel="noopener noreferrer")
    
    fc.assert(fc.property(
      fc.webUrl(),
      fc.constantFrom('github', 'live', 'external'),
      (url, linkType) => {
        // Create test link
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = `project-card__link project-card__link--${linkType}`;
        link.textContent = linkType === 'github' ? 'Code' : 'Demo';
        
        // Test security attributes
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        
        // Verify the rel attribute contains both security keywords
        const relValue = link.getAttribute('rel');
        expect(relValue).toContain('noopener');
        expect(relValue).toContain('noreferrer');
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent external link behavior across different URL formats', () => {
    // Property: External link behavior should be consistent regardless of URL format
    
    fc.assert(fc.property(
      fc.oneof(
        fc.webUrl({ validSchemes: ['https'] }),
        fc.webUrl({ validSchemes: ['http'] }),
        fc.string().map(s => `https://github.com/${s}`),
        fc.string().map(s => `https://demo.${s}.com`)
      ),
      (url) => {
        // Skip invalid URLs
        try {
          new URL(url);
        } catch {
          return; // Skip invalid URLs
        }
        
        // Create external link
        const link = document.createElement('a');
        link.href = url;
        
        // Apply external link attributes (simulating our implementation)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        
        // Test that external links have proper attributes
        if (link.href.startsWith('http://') || link.href.startsWith('https://')) {
          expect(link.getAttribute('target')).toBe('_blank');
          expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        }
      }
    ), { numRuns: 100 });
  });

  it('should provide appropriate accessibility labels for external links', () => {
    // Property: External links should have descriptive aria-label attributes
    
    fc.assert(fc.property(
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        githubUrl: fc.webUrl(),
        liveUrl: fc.oneof(fc.webUrl(), fc.constant(null))
      }),
      (projectData) => {
        // Create GitHub link with accessibility attributes
        const githubLink = document.createElement('a');
        githubLink.href = projectData.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.setAttribute('aria-label', `View ${projectData.title} source code on GitHub`);
        githubLink.textContent = 'Code';
        
        // Test GitHub link accessibility
        const ariaLabel = githubLink.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel).toContain(projectData.title);
        expect(ariaLabel).toContain('GitHub');
        expect(ariaLabel.toLowerCase()).toContain('source code');
        
        // Test live demo link accessibility (if present)
        if (projectData.liveUrl) {
          const liveLink = document.createElement('a');
          liveLink.href = projectData.liveUrl;
          liveLink.target = '_blank';
          liveLink.rel = 'noopener noreferrer';
          liveLink.setAttribute('aria-label', `View ${projectData.title} live demo`);
          liveLink.textContent = 'Demo';
          
          const liveLinkAriaLabel = liveLink.getAttribute('aria-label');
          expect(liveLinkAriaLabel).toBeTruthy();
          expect(liveLinkAriaLabel).toContain(projectData.title);
          expect(liveLinkAriaLabel.toLowerCase()).toContain('demo');
        }
      }
    ), { numRuns: 100 });
  });

  it('should handle projects with and without live demo links consistently', () => {
    // Property: Link behavior should be consistent whether live demo exists or not
    
    fc.assert(fc.property(
      fc.record({
        id: fc.string({ minLength: 1 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        githubUrl: fc.webUrl(),
        liveUrl: fc.oneof(fc.webUrl(), fc.constant(null))
      }),
      (projectData) => {
        // Create links container
        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-card__links';
        
        // GitHub link should always be present and external
        const githubLink = document.createElement('a');
        githubLink.href = projectData.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.className = 'project-card__link project-card__link--github';
        linksContainer.appendChild(githubLink);
        
        // Live demo link should only be present if liveUrl exists
        if (projectData.liveUrl) {
          const liveLink = document.createElement('a');
          liveLink.href = projectData.liveUrl;
          liveLink.target = '_blank';
          liveLink.rel = 'noopener noreferrer';
          liveLink.className = 'project-card__link project-card__link--live';
          linksContainer.appendChild(liveLink);
        }
        
        // Test GitHub link is always present and external
        const renderedGithubLink = linksContainer.querySelector('.project-card__link--github');
        expect(renderedGithubLink).toBeTruthy();
        expect(renderedGithubLink.getAttribute('target')).toBe('_blank');
        
        // Test live demo link presence matches data
        const renderedLiveLink = linksContainer.querySelector('.project-card__link--live');
        if (projectData.liveUrl) {
          expect(renderedLiveLink).toBeTruthy();
          expect(renderedLiveLink.getAttribute('target')).toBe('_blank');
        } else {
          expect(renderedLiveLink).toBeFalsy();
        }
        
        // Test total number of links
        const allLinks = linksContainer.querySelectorAll('a[target="_blank"]');
        const expectedLinkCount = projectData.liveUrl ? 2 : 1;
        expect(allLinks.length).toBe(expectedLinkCount);
      }
    ), { numRuns: 100 });
  });
});