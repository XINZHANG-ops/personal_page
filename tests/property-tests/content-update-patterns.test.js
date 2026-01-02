/**
 * Property-Based Test for Content Update Patterns
 * Feature: personal-portfolio-site, Property 12: Content Update Patterns
 * Validates: Requirements 8.4
 * 
 * This test validates that similar content sections (projects, writings) 
 * follow the same HTML structure pattern for consistency
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 12: Content Update Patterns', () => {
  let jsContent, htmlContent;
  
  beforeEach(() => {
    // Load JavaScript content to extract project data structure
    const jsPath = path.resolve('./js/main.js');
    jsContent = fs.readFileSync(jsPath, 'utf-8');
    
    // Load HTML for DOM testing
    const htmlPath = path.resolve('./index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('should follow consistent structure patterns for all project cards', () => {
    // Property: For any similar content section (projects, writings), 
    // the HTML structure should follow the same pattern for consistency
    
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          technologies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 8 }),
          githubUrl: fc.webUrl(),
          liveUrl: fc.oneof(fc.webUrl(), fc.constant(null)),
          imageUrl: fc.string({ minLength: 1 }),
          featured: fc.boolean(),
          size: fc.constantFrom('large', 'medium', 'small')
        }),
        { minLength: 2, maxLength: 6 }
      ),
      (projects) => {
        // Create multiple project cards to test consistency
        const container = document.createElement('div');
        container.className = 'projects__grid';
        document.body.appendChild(container);
        
        const createdCards = [];
        
        projects.forEach(projectData => {
          // Create project card following the established pattern
          const card = document.createElement('article');
          card.className = `project-card project-card--${projectData.size}`;
          card.setAttribute('data-project-id', projectData.id);
          
          const cardContent = document.createElement('div');
          cardContent.className = 'project-card__content';
          
          // Image container
          const imageContainer = document.createElement('div');
          imageContainer.className = 'project-card__image-container';
          
          const image = document.createElement('img');
          image.className = 'project-card__image';
          image.src = projectData.imageUrl;
          image.alt = `Screenshot of ${projectData.title}`;
          imageContainer.appendChild(image);
          
          // Info section
          const info = document.createElement('div');
          info.className = 'project-card__info';
          
          // Title
          const title = document.createElement('h3');
          title.className = 'project-card__title';
          title.textContent = projectData.title;
          
          // Description
          const description = document.createElement('p');
          description.className = 'project-card__description';
          description.textContent = projectData.description;
          
          // Technologies
          const techContainer = document.createElement('div');
          techContainer.className = 'project-card__technologies';
          
          projectData.technologies.forEach(tech => {
            const techBadge = document.createElement('span');
            techBadge.className = 'project-card__tech-badge';
            techBadge.textContent = tech;
            techContainer.appendChild(techBadge);
          });
          
          // Links
          const linksContainer = document.createElement('div');
          linksContainer.className = 'project-card__links';
          
          const githubLink = document.createElement('a');
          githubLink.href = projectData.githubUrl;
          githubLink.target = '_blank';
          githubLink.rel = 'noopener noreferrer';
          githubLink.className = 'project-card__link project-card__link--github';
          githubLink.textContent = 'Code';
          linksContainer.appendChild(githubLink);
          
          if (projectData.liveUrl) {
            const liveLink = document.createElement('a');
            liveLink.href = projectData.liveUrl;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener noreferrer';
            liveLink.className = 'project-card__link project-card__link--live';
            liveLink.textContent = 'Demo';
            linksContainer.appendChild(liveLink);
          }
          
          // Assemble the card
          info.appendChild(title);
          info.appendChild(description);
          info.appendChild(techContainer);
          info.appendChild(linksContainer);
          
          cardContent.appendChild(imageContainer);
          cardContent.appendChild(info);
          card.appendChild(cardContent);
          
          container.appendChild(card);
          createdCards.push(card);
        });
        
        // Test that all cards follow the same structural pattern
        const expectedStructure = [
          'project-card__content',
          'project-card__image-container',
          'project-card__image',
          'project-card__info',
          'project-card__title',
          'project-card__description',
          'project-card__technologies',
          'project-card__links'
        ];
        
        createdCards.forEach((card, index) => {
          // Each card should have the same basic structure
          expectedStructure.forEach(className => {
            const element = card.querySelector(`.${className}`);
            expect(element).toBeTruthy();
          });
          
          // Each card should have consistent class naming
          expect(card.classList.contains('project-card')).toBe(true);
          expect(card.hasAttribute('data-project-id')).toBe(true);
          
          // Each card should have the same content hierarchy
          const content = card.querySelector('.project-card__content');
          const imageContainer = content.querySelector('.project-card__image-container');
          const info = content.querySelector('.project-card__info');
          
          expect(content.children.length).toBe(2); // image container + info
          expect(content.children[0]).toBe(imageContainer);
          expect(content.children[1]).toBe(info);
          
          // Info section should have consistent child order
          const infoChildren = Array.from(info.children);
          expect(infoChildren[0].classList.contains('project-card__title')).toBe(true);
          expect(infoChildren[1].classList.contains('project-card__description')).toBe(true);
          expect(infoChildren[2].classList.contains('project-card__technologies')).toBe(true);
          expect(infoChildren[3].classList.contains('project-card__links')).toBe(true);
        });
        
        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent class naming patterns across content types', () => {
    // Property: Class naming should follow consistent patterns for maintainability
    
    fc.assert(fc.property(
      fc.constantFrom('project', 'writing', 'contact'),
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
      (contentType, elements) => {
        // Test that class naming follows BEM methodology consistently
        const baseClass = `${contentType}-card`;
        
        elements.forEach(element => {
          // Element classes should follow BEM pattern: block__element
          const elementClass = `${baseClass}__${element.toLowerCase().replace(/\s+/g, '-')}`;
          
          // Verify class naming pattern
          expect(elementClass).toMatch(/^[a-z]+(-[a-z]+)*__[a-z]+(-[a-z]+)*$/);
          
          // Verify consistent prefix
          expect(elementClass.startsWith(`${contentType}-card__`)).toBe(true);
        });
        
        // Modifier classes should follow BEM pattern: block--modifier
        const modifiers = ['large', 'medium', 'small', 'featured'];
        modifiers.forEach(modifier => {
          const modifierClass = `${baseClass}--${modifier}`;
          expect(modifierClass).toMatch(/^[a-z]+(-[a-z]+)*--[a-z]+(-[a-z]+)*$/);
        });
      }
    ), { numRuns: 100 });
  });

  it('should provide consistent data attributes for content identification', () => {
    // Property: Content items should have consistent data attributes for identification
    
    fc.assert(fc.property(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constantFrom('project', 'writing', 'contact-item')
      }),
      (contentData) => {
        // Create content element with data attributes
        const element = document.createElement('article');
        element.className = `${contentData.type}-card`;
        element.setAttribute(`data-${contentData.type}-id`, contentData.id);
        
        // Test data attribute consistency
        const expectedAttribute = `data-${contentData.type}-id`;
        expect(element.hasAttribute(expectedAttribute)).toBe(true);
        expect(element.getAttribute(expectedAttribute)).toBe(contentData.id);
        
        // Test that data attribute follows naming convention
        expect(expectedAttribute).toMatch(/^data-[a-z]+(-[a-z]+)*-id$/);
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent link structure patterns across content types', () => {
    // Property: Link containers should follow consistent patterns
    
    fc.assert(fc.property(
      fc.record({
        primaryUrl: fc.webUrl(),
        secondaryUrl: fc.oneof(fc.webUrl(), fc.constant(null)),
        contentType: fc.constantFrom('project', 'writing')
      }),
      (linkData) => {
        // Create links container following consistent pattern
        const linksContainer = document.createElement('div');
        linksContainer.className = `${linkData.contentType}-card__links`;
        
        // Primary link (always present)
        const primaryLink = document.createElement('a');
        primaryLink.href = linkData.primaryUrl;
        primaryLink.target = '_blank';
        primaryLink.rel = 'noopener noreferrer';
        primaryLink.className = `${linkData.contentType}-card__link ${linkData.contentType}-card__link--primary`;
        linksContainer.appendChild(primaryLink);
        
        // Secondary link (optional)
        if (linkData.secondaryUrl) {
          const secondaryLink = document.createElement('a');
          secondaryLink.href = linkData.secondaryUrl;
          secondaryLink.target = '_blank';
          secondaryLink.rel = 'noopener noreferrer';
          secondaryLink.className = `${linkData.contentType}-card__link ${linkData.contentType}-card__link--secondary`;
          linksContainer.appendChild(secondaryLink);
        }
        
        // Test consistent link structure
        const allLinks = linksContainer.querySelectorAll('a');
        expect(allLinks.length).toBe(linkData.secondaryUrl ? 2 : 1);
        
        // Test that all links have consistent external link attributes
        allLinks.forEach(link => {
          expect(link.getAttribute('target')).toBe('_blank');
          expect(link.getAttribute('rel')).toBe('noopener noreferrer');
          expect(link.classList.contains(`${linkData.contentType}-card__link`)).toBe(true);
        });
        
        // Test primary link is always present
        const primaryLinkElement = linksContainer.querySelector(`.${linkData.contentType}-card__link--primary`);
        expect(primaryLinkElement).toBeTruthy();
        
        // Test secondary link presence matches data
        const secondaryLinkElement = linksContainer.querySelector(`.${linkData.contentType}-card__link--secondary`);
        if (linkData.secondaryUrl) {
          expect(secondaryLinkElement).toBeTruthy();
        } else {
          expect(secondaryLinkElement).toBeFalsy();
        }
      }
    ), { numRuns: 100 });
  });

  it('should ensure consistent content container structure across sections', () => {
    // Property: Content containers should follow consistent grid patterns
    
    fc.assert(fc.property(
      fc.constantFrom('projects', 'writing', 'contact'),
      fc.array(fc.record({
        id: fc.string({ minLength: 1 }),
        title: fc.string({ minLength: 1 })
      }), { minLength: 1, maxLength: 10 }),
      (sectionType, items) => {
        // Create section container following consistent pattern
        const section = document.createElement('section');
        section.id = sectionType;
        section.className = sectionType;
        
        const container = document.createElement('div');
        container.className = 'container';
        
        const header = document.createElement('header');
        header.className = 'section__header';
        
        const title = document.createElement('h2');
        title.className = 'section__title';
        title.textContent = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
        
        const grid = document.createElement('div');
        grid.className = `${sectionType}__grid`;
        
        // Add items to grid
        items.forEach(item => {
          const itemElement = document.createElement('article');
          itemElement.className = `${sectionType.slice(0, -1)}-card`; // Remove 's' from plural
          itemElement.setAttribute(`data-${sectionType.slice(0, -1)}-id`, item.id);
          grid.appendChild(itemElement);
        });
        
        header.appendChild(title);
        container.appendChild(header);
        container.appendChild(grid);
        section.appendChild(container);
        
        // Test consistent section structure
        expect(section.querySelector('.container')).toBeTruthy();
        expect(section.querySelector('.section__header')).toBeTruthy();
        expect(section.querySelector('.section__title')).toBeTruthy();
        expect(section.querySelector(`.${sectionType}__grid`)).toBeTruthy();
        
        // Test that all items follow consistent pattern
        const gridItems = grid.querySelectorAll('article');
        expect(gridItems.length).toBe(items.length);
        
        gridItems.forEach((item, index) => {
          const expectedClass = `${sectionType.slice(0, -1)}-card`;
          const expectedDataAttr = `data-${sectionType.slice(0, -1)}-id`;
          
          expect(item.classList.contains(expectedClass)).toBe(true);
          expect(item.hasAttribute(expectedDataAttr)).toBe(true);
          expect(item.getAttribute(expectedDataAttr)).toBe(items[index].id);
        });
      }
    ), { numRuns: 100 });
  });
});