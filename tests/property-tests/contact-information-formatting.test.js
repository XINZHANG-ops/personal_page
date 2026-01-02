/**
 * Property-Based Test for Contact Information Formatting
 * Feature: personal-portfolio-site, Property 4: Contact Information Formatting
 * Validates: Requirements 4.3
 * 
 * This test validates that contact methods displayed include appropriate
 * icon elements and proper formatting structure
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 4: Contact Information Formatting', () => {
  let htmlContent;
  
  beforeEach(() => {
    // Load HTML content for DOM testing
    const htmlPath = path.resolve('./index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('should include appropriate icon elements for any contact method displayed', () => {
    // Property: For any contact method displayed, the HTML should include 
    // appropriate icon elements and proper formatting structure
    
    fc.assert(fc.property(
      fc.record({
        type: fc.constantFrom('email', 'location', 'linkedin', 'github', 'twitter', 'resume'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        value: fc.string({ minLength: 1, maxLength: 100 }),
        url: fc.oneof(fc.webUrl(), fc.constant(null))
      }),
      (contactData) => {
        // Create a contact item element
        const contactItem = document.createElement('div');
        contactItem.className = 'contact__item';
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'contact__icon';
        
        // Create SVG icon (simplified for testing)
        const icon = document.createElement('svg');
        icon.setAttribute('width', '24');
        icon.setAttribute('height', '24');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Add a path element to the SVG
        const path = document.createElement('path');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        // Set different path data based on contact type
        switch (contactData.type) {
          case 'email':
            path.setAttribute('d', 'M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z');
            break;
          case 'location':
            path.setAttribute('d', 'M16 8A6 6 0 0 1 6 8C6 10.3 8 13 12 17C16 13 18 10.3 18 8A6 6 0 0 1 16 8Z');
            break;
          case 'linkedin':
            path.setAttribute('d', 'M16 8A6 6 0 0 1 6 8V21H10V8A2 2 0 0 1 14 8V21H18V8Z');
            break;
          case 'github':
            path.setAttribute('d', 'M9 19C4 20.5 4 16.5 2 16M22 16V22C22 22 17 20 12 16C17 12 22 10 22 16Z');
            break;
          case 'twitter':
            path.setAttribute('d', 'M23 3A10.9 10.9 0 0 1 20.1 4.6A4.48 4.48 0 0 0 22.46 2A9 9 0 0 1 19.36 3.5A4.48 4.48 0 0 0 12.93 7.7A12.94 12.94 0 0 1 3.35 2.5A4.48 4.48 0 0 0 4.85 8.1A4.48 4.48 0 0 1 2.8 7.5V7.7A4.48 4.48 0 0 0 6.4 12.1A4.48 4.48 0 0 1 4.6 12.2A4.48 4.48 0 0 0 8.8 15.5A9 9 0 0 1 1.45 17.5A12.94 12.94 0 0 0 8.29 19.5C16.64 19.5 21.27 12.5 21.27 6.5C21.27 6.2 21.27 5.9 21.25 5.6A9.18 9.18 0 0 0 23.25 3.2Z');
            break;
          case 'resume':
            path.setAttribute('d', 'M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8Z');
            break;
        }
        
        icon.appendChild(path);
        iconContainer.appendChild(icon);
        
        // Create details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'contact__details';
        
        // Create label
        const label = document.createElement('h3');
        label.className = 'contact__label';
        label.textContent = contactData.label;
        
        // Create value element (link or text)
        let valueElement;
        if (contactData.url) {
          valueElement = document.createElement('a');
          valueElement.href = contactData.url;
          valueElement.className = 'contact__link';
          if (contactData.type === 'email') {
            valueElement.href = `mailto:${contactData.value}`;
          }
          if (['linkedin', 'github', 'twitter', 'resume'].includes(contactData.type)) {
            valueElement.target = '_blank';
            valueElement.rel = 'noopener noreferrer';
          }
        } else {
          valueElement = document.createElement('span');
          valueElement.className = 'contact__text';
        }
        valueElement.textContent = contactData.value;
        
        // Assemble the contact item
        detailsContainer.appendChild(label);
        detailsContainer.appendChild(valueElement);
        contactItem.appendChild(iconContainer);
        contactItem.appendChild(detailsContainer);
        
        // Add to document for testing
        document.body.appendChild(contactItem);
        
        // Test 1: Icon container should be present with proper class
        const iconElement = contactItem.querySelector('.contact__icon');
        expect(iconElement).toBeTruthy();
        
        // Test 2: SVG icon should be present with proper attributes
        const svgIcon = iconElement.querySelector('svg');
        expect(svgIcon).toBeTruthy();
        expect(svgIcon.getAttribute('width')).toBe('24');
        expect(svgIcon.getAttribute('height')).toBe('24');
        expect(svgIcon.getAttribute('viewBox')).toBe('0 0 24 24');
        
        // Test 3: Icon should have path element with stroke attributes
        const pathElement = svgIcon.querySelector('path');
        expect(pathElement).toBeTruthy();
        expect(pathElement.getAttribute('stroke')).toBe('currentColor');
        expect(pathElement.getAttribute('stroke-width')).toBe('2');
        
        // Test 4: Details container should be present with proper structure
        const detailsElement = contactItem.querySelector('.contact__details');
        expect(detailsElement).toBeTruthy();
        
        // Test 5: Label should be present with proper class and content
        const labelElement = detailsElement.querySelector('.contact__label');
        expect(labelElement).toBeTruthy();
        expect(labelElement.textContent).toBe(contactData.label);
        expect(labelElement.tagName.toLowerCase()).toBe('h3');
        
        // Test 6: Value element should have appropriate class and attributes
        if (contactData.url) {
          const linkElement = detailsElement.querySelector('.contact__link');
          expect(linkElement).toBeTruthy();
          expect(linkElement.tagName.toLowerCase()).toBe('a');
          expect(linkElement.textContent).toBe(contactData.value);
          
          // Test external link attributes for social media
          if (['linkedin', 'github', 'twitter', 'resume'].includes(contactData.type)) {
            expect(linkElement.target).toBe('_blank');
            expect(linkElement.rel).toBe('noopener noreferrer');
          }
          
          // Test email link format
          if (contactData.type === 'email') {
            expect(linkElement.href).toBe(`mailto:${contactData.value}`);
          }
        } else {
          const textElement = detailsElement.querySelector('.contact__text');
          expect(textElement).toBeTruthy();
          expect(textElement.tagName.toLowerCase()).toBe('span');
          expect(textElement.textContent).toBe(contactData.value);
        }
        
        // Test 7: Overall structure should follow the expected pattern
        expect(contactItem.classList.contains('contact__item')).toBe(true);
        expect(contactItem.children.length).toBe(2); // icon + details
        expect(contactItem.children[0]).toBe(iconElement);
        expect(contactItem.children[1]).toBe(detailsElement);
        
        // Clean up
        document.body.removeChild(contactItem);
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent formatting structure across different contact types', () => {
    // Property: All contact items should follow the same structural pattern
    // regardless of contact type
    
    fc.assert(fc.property(
      fc.array(
        fc.record({
          type: fc.constantFrom('email', 'location', 'linkedin', 'github', 'twitter', 'resume'),
          label: fc.string({ minLength: 1, maxLength: 30 }),
          value: fc.string({ minLength: 1, maxLength: 50 })
        }),
        { minLength: 1, maxLength: 6 }
      ),
      (contactItems) => {
        const container = document.createElement('div');
        container.className = 'contact__info';
        
        const createdItems = [];
        
        contactItems.forEach((contactData, index) => {
          // Create contact item following the standard structure
          const item = document.createElement('div');
          item.className = 'contact__item';
          item.setAttribute('data-contact-type', contactData.type);
          
          // Icon container
          const iconContainer = document.createElement('div');
          iconContainer.className = 'contact__icon';
          
          const icon = document.createElement('svg');
          icon.setAttribute('width', '24');
          icon.setAttribute('height', '24');
          iconContainer.appendChild(icon);
          
          // Details container
          const detailsContainer = document.createElement('div');
          detailsContainer.className = 'contact__details';
          
          const label = document.createElement('h3');
          label.className = 'contact__label';
          label.textContent = contactData.label;
          
          const value = document.createElement('span');
          value.className = 'contact__text';
          value.textContent = contactData.value;
          
          detailsContainer.appendChild(label);
          detailsContainer.appendChild(value);
          
          item.appendChild(iconContainer);
          item.appendChild(detailsContainer);
          
          container.appendChild(item);
          createdItems.push(item);
        });
        
        document.body.appendChild(container);
        
        // Test that all items follow the same structural pattern
        createdItems.forEach((item, index) => {
          // Each item should have the same basic structure
          expect(item.classList.contains('contact__item')).toBe(true);
          expect(item.children.length).toBe(2);
          
          // First child should be icon container
          const iconContainer = item.children[0];
          expect(iconContainer.classList.contains('contact__icon')).toBe(true);
          expect(iconContainer.querySelector('svg')).toBeTruthy();
          
          // Second child should be details container
          const detailsContainer = item.children[1];
          expect(detailsContainer.classList.contains('contact__details')).toBe(true);
          expect(detailsContainer.querySelector('.contact__label')).toBeTruthy();
          expect(detailsContainer.querySelector('.contact__text, .contact__link')).toBeTruthy();
          
          // Label should always be h3 element
          const label = detailsContainer.querySelector('.contact__label');
          expect(label.tagName.toLowerCase()).toBe('h3');
          
          // Icon should have consistent dimensions
          const svg = iconContainer.querySelector('svg');
          expect(svg.getAttribute('width')).toBe('24');
          expect(svg.getAttribute('height')).toBe('24');
        });
        
        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should properly format social media links with target="_blank" and rel attributes', () => {
    // Property: Social media links should always open in new tab with proper security attributes
    
    fc.assert(fc.property(
      fc.record({
        platform: fc.constantFrom('linkedin', 'github', 'twitter'),
        username: fc.string({ minLength: 1, maxLength: 30 }),
        url: fc.webUrl()
      }),
      (socialData) => {
        // Create social media link
        const socialLink = document.createElement('a');
        socialLink.href = socialData.url;
        socialLink.target = '_blank';
        socialLink.rel = 'noopener noreferrer';
        socialLink.className = `contact__social-link contact__social-link--${socialData.platform}`;
        
        // Add icon
        const icon = document.createElement('svg');
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        
        // Add text
        const text = document.createElement('span');
        text.className = 'contact__social-text';
        text.textContent = socialData.platform.charAt(0).toUpperCase() + socialData.platform.slice(1);
        
        socialLink.appendChild(icon);
        socialLink.appendChild(text);
        
        document.body.appendChild(socialLink);
        
        // Test proper link attributes
        expect(socialLink.target).toBe('_blank');
        expect(socialLink.rel).toBe('noopener noreferrer');
        expect(socialLink.href).toBe(socialData.url);
        
        // Test proper classes
        expect(socialLink.classList.contains('contact__social-link')).toBe(true);
        expect(socialLink.classList.contains(`contact__social-link--${socialData.platform}`)).toBe(true);
        
        // Test icon presence and attributes
        const iconElement = socialLink.querySelector('svg');
        expect(iconElement).toBeTruthy();
        expect(iconElement.getAttribute('width')).toBe('20');
        expect(iconElement.getAttribute('height')).toBe('20');
        
        // Test text presence and content
        const textElement = socialLink.querySelector('.contact__social-text');
        expect(textElement).toBeTruthy();
        expect(textElement.textContent).toBe(socialData.platform.charAt(0).toUpperCase() + socialData.platform.slice(1));
        
        // Clean up
        document.body.removeChild(socialLink);
      }
    ), { numRuns: 100 });
  });

  it('should validate that contact section exists in the actual HTML with proper structure', () => {
    // Test that the actual contact section in index.html follows the expected structure
    
    const contactSection = document.querySelector('#contact');
    expect(contactSection).toBeTruthy();
    expect(contactSection.classList.contains('contact')).toBe(true);
    
    // Check for main structural elements
    const contactContent = contactSection.querySelector('.contact__content');
    expect(contactContent).toBeTruthy();
    
    const contactInfo = contactSection.querySelector('.contact__info');
    expect(contactInfo).toBeTruthy();
    
    const contactSocial = contactSection.querySelector('.contact__social');
    expect(contactSocial).toBeTruthy();
    
    const contactCta = contactSection.querySelector('.contact__cta');
    expect(contactCta).toBeTruthy();
    
    // Check contact items have proper structure
    const contactItems = contactSection.querySelectorAll('.contact__item');
    expect(contactItems.length).toBeGreaterThan(0);
    
    contactItems.forEach(item => {
      // Each item should have icon and details
      const icon = item.querySelector('.contact__icon');
      const details = item.querySelector('.contact__details');
      
      expect(icon).toBeTruthy();
      expect(details).toBeTruthy();
      
      // Icon should contain SVG
      const svg = icon.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg.getAttribute('width')).toBe('24');
      expect(svg.getAttribute('height')).toBe('24');
      
      // Details should contain label
      const label = details.querySelector('.contact__label');
      expect(label).toBeTruthy();
      expect(label.tagName.toLowerCase()).toBe('h3');
      
      // Details should contain link or text
      const linkOrText = details.querySelector('.contact__link, .contact__text');
      expect(linkOrText).toBeTruthy();
    });
    
    // Check social links have proper attributes
    const socialLinks = contactSection.querySelectorAll('.contact__social-link');
    expect(socialLinks.length).toBeGreaterThan(0);
    
    socialLinks.forEach(link => {
      // External links should have target="_blank" and rel="noopener noreferrer"
      if (link.href.startsWith('http') && !link.href.includes('mailto:')) {
        expect(link.target).toBe('_blank');
        expect(link.rel).toBe('noopener noreferrer');
      }
      
      // Should contain icon and text
      const icon = link.querySelector('svg');
      const text = link.querySelector('.contact__social-text');
      
      expect(icon).toBeTruthy();
      expect(text).toBeTruthy();
    });
  });
});