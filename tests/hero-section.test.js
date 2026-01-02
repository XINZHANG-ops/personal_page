// Unit tests for hero section content
// Requirements: 1.2, 1.3, 1.4

import { describe, it, expect, beforeEach } from 'vitest';

describe('Hero Section Content', () => {
  beforeEach(() => {
    // DOM is loaded by setup.js
  });

  it('should contain required identity elements', () => {
    const heroSection = document.querySelector('#hero');
    expect(heroSection).toBeTruthy();
    
    const heroTitle = document.querySelector('.hero__title');
    expect(heroTitle).toBeTruthy();
    expect(heroTitle.textContent).toContain('AI/ML Engineer & Researcher');
  });

  it('should verify AI/ML engineer and researcher identity is present', () => {
    // Check title contains AI/ML Engineer & Researcher
    const heroTitle = document.querySelector('.hero__title');
    expect(heroTitle.textContent).toMatch(/AI\/ML Engineer.*Researcher/i);
    
    // Check description mentions AI/ML expertise
    const heroDescription = document.querySelector('.hero__description');
    expect(heroDescription).toBeTruthy();
    expect(heroDescription.textContent).toMatch(/AI|machine learning|intelligent systems/i);
    
    // Check typing animation includes relevant terms
    const typingWords = document.querySelector('.hero__typing-words');
    expect(typingWords).toBeTruthy();
    const words = typingWords.getAttribute('data-words');
    expect(words).toMatch(/builder|researcher|engineer/i);
  });

  it('should check for builder mindset and hands-on approach mentions', () => {
    const heroDescription = document.querySelector('.hero__description');
    expect(heroDescription).toBeTruthy();
    
    // Check for builder mindset
    expect(heroDescription.textContent).toMatch(/builder|building|hands-on|practical/i);
    
    // Check for research approach
    expect(heroDescription.textContent).toMatch(/research|curiosity|cutting-edge/i);
    
    // Check typing animation includes "builder"
    const typingWords = document.querySelector('.hero__typing-words');
    const words = typingWords.getAttribute('data-words');
    expect(words).toContain('builder');
  });

  it('should have proper call-to-action buttons', () => {
    const heroActions = document.querySelector('.hero__actions');
    expect(heroActions).toBeTruthy();
    
    const buttons = heroActions.querySelectorAll('.btn');
    expect(buttons.length).toBe(3);
    
    // Check for Contact, Projects, Writing buttons
    const buttonTexts = Array.from(buttons).map(btn => btn.textContent.trim());
    expect(buttonTexts).toContain('Contact');
    expect(buttonTexts).toContain('Projects');
    expect(buttonTexts).toContain('Writing');
  });

  it('should have typing animation elements', () => {
    const typingContainer = document.querySelector('.hero__typing-container');
    expect(typingContainer).toBeTruthy();
    
    const typingText = document.querySelector('.hero__typing-text');
    expect(typingText).toBeTruthy();
    
    const typingWords = document.querySelector('.hero__typing-words');
    expect(typingWords).toBeTruthy();
    expect(typingWords.hasAttribute('data-words')).toBe(true);
    
    const typingCursor = document.querySelector('.hero__typing-cursor');
    expect(typingCursor).toBeTruthy();
  });

  it('should have professional description highlighting key aspects', () => {
    const heroDescription = document.querySelector('.hero__description');
    expect(heroDescription).toBeTruthy();
    
    const description = heroDescription.textContent;
    
    // Check for industrial experience mention
    expect(description).toMatch(/industrial|experience|practical/i);
    
    // Check for research curiosity
    expect(description).toMatch(/research|curiosity/i);
    
    // Check for AI impact reflection
    expect(description).toMatch(/AI.*impact|transformative/i);
    
    // Check for meaningful solutions focus
    expect(description).toMatch(/solutions|meaningful/i);
  });
});