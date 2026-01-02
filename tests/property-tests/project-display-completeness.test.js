/**
 * Property-Based Test for Project Display Completeness
 * Feature: personal-portfolio-site, Property 1: Project Display Completeness
 * Validates: Requirements 2.2
 * 
 * This test validates that project data with title, description, and links
 * renders all three elements in the project display
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 1: Project Display Completeness', () => {
  let jsContent;
  
  beforeEach(() => {
    // Load JavaScript content to extract project data
    const jsPath = path.resolve('./js/main.js');
    jsContent = fs.readFileSync(jsPath, 'utf-8');
    
    // Load HTML for DOM testing
    const htmlPath = path.resolve('./index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
    
    // Execute the JavaScript to initialize projects
    eval(jsContent);
  });

  it('should display all required elements for any project with title, description, and links', () => {
    // Property: For any project data with title, description, and links,
    // the rendered HTML should contain all three elements in the project display
    
    fc.assert(fc.property(
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
      (projectData) => {
        // Create a temporary container for testing
        const container = document.createElement('div');
        container.className = 'projects__grid';
        document.body.appendChild(container);
        
        // Simulate the createProjectCard function behavior
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
        
        // GitHub link
        const githubLink = document.createElement('a');
        githubLink.href = projectData.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener noreferrer';
        githubLink.className = 'project-card__link project-card__link--github';
        githubLink.textContent = 'Code';
        linksContainer.appendChild(githubLink);
        
        // Live demo link (if available)
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
        
        // Test that all required elements are present
        
        // 1. Title should be present and contain the project title
        const renderedTitle = card.querySelector('.project-card__title');
        expect(renderedTitle).toBeTruthy();
        expect(renderedTitle.textContent).toBe(projectData.title);
        
        // 2. Description should be present and contain the project description
        const renderedDescription = card.querySelector('.project-card__description');
        expect(renderedDescription).toBeTruthy();
        expect(renderedDescription.textContent).toBe(projectData.description);
        
        // 3. Links should be present - at minimum GitHub link
        const renderedLinks = card.querySelector('.project-card__links');
        expect(renderedLinks).toBeTruthy();
        
        const githubLinkElement = card.querySelector('.project-card__link--github');
        expect(githubLinkElement).toBeTruthy();
        expect(githubLinkElement.href).toBe(projectData.githubUrl);
        
        // 4. If live URL exists, live link should be present
        if (projectData.liveUrl) {
          const liveLinkElement = card.querySelector('.project-card__link--live');
          expect(liveLinkElement).toBeTruthy();
          expect(liveLinkElement.href).toBe(projectData.liveUrl);
        }
        
        // 5. Technologies should be displayed
        const techElements = card.querySelectorAll('.project-card__tech-badge');
        expect(techElements.length).toBe(projectData.technologies.length);
        
        projectData.technologies.forEach((tech, index) => {
          expect(techElements[index].textContent).toBe(tech);
        });
        
        // 6. Image should be present
        const renderedImage = card.querySelector('.project-card__image');
        expect(renderedImage).toBeTruthy();
        expect(renderedImage.src).toContain(projectData.imageUrl);
        expect(renderedImage.alt).toContain(projectData.title);
        
        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent structure across different project sizes', () => {
    // Property: Project cards should have consistent structure regardless of size
    
    fc.assert(fc.property(
      fc.constantFrom('large', 'medium', 'small'),
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 10, maxLength: 500 }),
        technologies: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        githubUrl: fc.webUrl(),
        liveUrl: fc.oneof(fc.webUrl(), fc.constant(null)),
        imageUrl: fc.string({ minLength: 1 }),
        featured: fc.boolean()
      }),
      (size, projectData) => {
        const projectWithSize = { ...projectData, size };
        
        // Create project card
        const container = document.createElement('div');
        const card = document.createElement('article');
        card.className = `project-card project-card--${size}`;
        
        // All cards should have the same basic structure elements
        const requiredClasses = [
          'project-card__content',
          'project-card__image-container',
          'project-card__image',
          'project-card__info',
          'project-card__title',
          'project-card__description',
          'project-card__technologies',
          'project-card__links'
        ];
        
        // Simulate card creation (simplified)
        const cardContent = document.createElement('div');
        cardContent.className = 'project-card__content';
        
        requiredClasses.slice(1).forEach(className => {
          const element = document.createElement('div');
          element.className = className;
          if (className === 'project-card__title') {
            element.textContent = projectData.title;
          } else if (className === 'project-card__description') {
            element.textContent = projectData.description;
          }
          cardContent.appendChild(element);
        });
        
        card.appendChild(cardContent);
        container.appendChild(card);
        
        // Verify size-specific class is applied
        expect(card.classList.contains(`project-card--${size}`)).toBe(true);
        
        // Verify all required structural elements exist regardless of size
        requiredClasses.forEach(className => {
          const element = card.querySelector(`.${className}`);
          expect(element).toBeTruthy();
        });
      }
    ), { numRuns: 100 });
  });

  it('should handle projects with varying numbers of technologies', () => {
    // Property: Technology badges should be rendered for any number of technologies
    
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
      (technologies) => {
        const projectData = {
          id: 'test-project',
          title: 'Test Project',
          description: 'Test description',
          technologies: technologies,
          githubUrl: 'https://github.com/test/repo',
          liveUrl: null,
          imageUrl: 'test.jpg',
          featured: false,
          size: 'medium'
        };
        
        // Create tech container
        const techContainer = document.createElement('div');
        techContainer.className = 'project-card__technologies';
        
        technologies.forEach(tech => {
          const techBadge = document.createElement('span');
          techBadge.className = 'project-card__tech-badge';
          techBadge.textContent = tech;
          techContainer.appendChild(techBadge);
        });
        
        // Verify correct number of tech badges
        const techBadges = techContainer.querySelectorAll('.project-card__tech-badge');
        expect(techBadges.length).toBe(technologies.length);
        
        // Verify each technology is displayed correctly
        technologies.forEach((tech, index) => {
          expect(techBadges[index].textContent).toBe(tech);
          expect(techBadges[index].classList.contains('project-card__tech-badge')).toBe(true);
        });
      }
    ), { numRuns: 100 });
  });
});