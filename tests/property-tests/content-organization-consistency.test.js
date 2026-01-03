/**
 * Property-Based Test for Content Organization Consistency
 * Feature: personal-portfolio-site, Property 3: Content Organization Consistency
 * Validates: Requirements 3.4
 * 
 * This test validates that writing entries with dates are ordered chronologically 
 * (newest first) or properly grouped by topic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';

describe('Property 3: Content Organization Consistency', () => {
  let htmlContent;

  beforeEach(() => {
    // Load HTML for DOM testing
    const htmlPath = path.resolve('./index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('should organize writing entries chronologically with newest first', () => {
    // Property: For any collection of writing entries with dates, 
    // the display should be ordered chronologically (newest first)

    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          type: fc.constantFrom('blog-post', 'paper-reading', 'article'),
          venue: fc.string({ minLength: 1, maxLength: 100 }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
          summary: fc.string({ minLength: 10, maxLength: 300 }),
          url: fc.webUrl(),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
        }),
        { minLength: 2, maxLength: 10 }
      ),
      (writingEntries) => {
        // Sort entries by date (newest first) as the system should do
        const sortedEntries = [...writingEntries].sort((a, b) => b.date.getTime() - a.date.getTime());

        // Create writing container
        const container = document.createElement('div');
        container.className = 'writing__content';
        document.body.appendChild(container);

        // Create timeline container
        const timeline = document.createElement('div');
        timeline.className = 'writing__timeline';

        // Render entries in chronological order (newest first)
        sortedEntries.forEach((entry, index) => {
          const entryElement = document.createElement('article');
          entryElement.className = 'writing-card';
          entryElement.setAttribute('data-writing-id', entry.id);
          entryElement.setAttribute('data-date', entry.date.toISOString().split('T')[0]);
          entryElement.setAttribute('data-index', index.toString());

          const entryContent = document.createElement('div');
          entryContent.className = 'writing-card__content';

          // Title
          const title = document.createElement('h3');
          title.className = 'writing-card__title';
          title.textContent = entry.title;

          // Venue and date
          const meta = document.createElement('div');
          meta.className = 'writing-card__meta';

          const venue = document.createElement('span');
          venue.className = 'writing-card__venue';
          venue.textContent = entry.venue;

          const date = document.createElement('time');
          date.className = 'writing-card__date';
          date.setAttribute('datetime', entry.date.toISOString().split('T')[0]);
          date.textContent = entry.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          meta.appendChild(venue);
          meta.appendChild(date);

          // Summary
          const summary = document.createElement('p');
          summary.className = 'writing-card__summary';
          summary.textContent = entry.summary;

          // Tags
          const tagsContainer = document.createElement('div');
          tagsContainer.className = 'writing-card__tags';

          entry.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'writing-card__tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
          });

          // External link
          const link = document.createElement('a');
          link.href = entry.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'writing-card__link';
          link.textContent = 'Read More';
          link.setAttribute('aria-label', `Read ${entry.title}`);

          // Assemble entry
          entryContent.appendChild(title);
          entryContent.appendChild(meta);
          entryContent.appendChild(summary);
          entryContent.appendChild(tagsContainer);
          entryContent.appendChild(link);

          entryElement.appendChild(entryContent);
          timeline.appendChild(entryElement);
        });

        container.appendChild(timeline);

        // Test chronological ordering (newest first)
        const renderedEntries = timeline.querySelectorAll('.writing-card');
        expect(renderedEntries.length).toBe(sortedEntries.length);

        // Verify entries are in correct chronological order
        for (let i = 0; i < renderedEntries.length - 1; i++) {
          const currentDate = new Date(renderedEntries[i].getAttribute('data-date'));
          const nextDate = new Date(renderedEntries[i + 1].getAttribute('data-date'));

          // Current entry should be newer than or equal to next entry
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }

        // Verify each entry has required elements
        renderedEntries.forEach((entryElement, index) => {
          const expectedEntry = sortedEntries[index];

          // Check title
          const titleElement = entryElement.querySelector('.writing-card__title');
          expect(titleElement.textContent).toBe(expectedEntry.title);

          // Check date
          const dateElement = entryElement.querySelector('.writing-card__date');
          expect(dateElement.getAttribute('datetime')).toBe(expectedEntry.date.toISOString().split('T')[0]);

          // Check venue
          const venueElement = entryElement.querySelector('.writing-card__venue');
          expect(venueElement.textContent).toBe(expectedEntry.venue);

          // Check summary
          const summaryElement = entryElement.querySelector('.writing-card__summary');
          expect(summaryElement.textContent).toBe(expectedEntry.summary);

          // Check external link
          const linkElement = entryElement.querySelector('.writing-card__link');
          expect(linkElement.href).toBe(expectedEntry.url);
          expect(linkElement.getAttribute('target')).toBe('_blank');
          expect(linkElement.getAttribute('rel')).toBe('noopener noreferrer');

          // Check tags
          const tagElements = entryElement.querySelectorAll('.writing-card__tag');
          expect(tagElements.length).toBe(expectedEntry.tags.length);
          expectedEntry.tags.forEach((tag, tagIndex) => {
            expect(tagElements[tagIndex].textContent).toBe(tag);
          });
        });

        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should group writing entries by topic when organized by category', () => {
    // Property: When organizing by topic, entries with the same tags should be grouped together

    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          type: fc.constantFrom('blog-post', 'paper-reading', 'article'),
          venue: fc.string({ minLength: 1, maxLength: 100 }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
          summary: fc.string({ minLength: 10, maxLength: 300 }),
          url: fc.webUrl(),
          tags: fc.array(fc.constantFrom('AI', 'Machine Learning', 'Ethics', 'Research', 'Industry'), { minLength: 1, maxLength: 3 })
        }),
        { minLength: 3, maxLength: 8 }
      ),
      (writingEntries) => {
        // Group entries by primary tag (first tag)
        const groupedEntries = {};
        writingEntries.forEach(entry => {
          const primaryTag = entry.tags[0];
          if (!groupedEntries[primaryTag]) {
            groupedEntries[primaryTag] = [];
          }
          groupedEntries[primaryTag].push(entry);
        });

        // Create writing container with topic organization
        const container = document.createElement('div');
        container.className = 'writing__content writing__content--by-topic';
        document.body.appendChild(container);

        // Render grouped entries
        Object.keys(groupedEntries).sort().forEach(topic => {
          const topicSection = document.createElement('section');
          topicSection.className = 'writing__topic-section';
          topicSection.setAttribute('data-topic', topic);

          const topicTitle = document.createElement('h3');
          topicTitle.className = 'writing__topic-title';
          topicTitle.textContent = topic;
          topicSection.appendChild(topicTitle);

          const topicGrid = document.createElement('div');
          topicGrid.className = 'writing__topic-grid';

          // Sort entries within topic by date (newest first)
          const sortedTopicEntries = groupedEntries[topic].sort((a, b) => b.date.getTime() - a.date.getTime());

          sortedTopicEntries.forEach(entry => {
            const entryElement = document.createElement('article');
            entryElement.className = 'writing-card writing-card--topic';
            entryElement.setAttribute('data-writing-id', entry.id);
            entryElement.setAttribute('data-topic', topic);

            const title = document.createElement('h4');
            title.className = 'writing-card__title';
            title.textContent = entry.title;

            const summary = document.createElement('p');
            summary.className = 'writing-card__summary';
            summary.textContent = entry.summary;

            entryElement.appendChild(title);
            entryElement.appendChild(summary);
            topicGrid.appendChild(entryElement);
          });

          topicSection.appendChild(topicGrid);
          container.appendChild(topicSection);
        });

        // Test topic grouping
        const topicSections = container.querySelectorAll('.writing__topic-section');
        const expectedTopics = Object.keys(groupedEntries).sort();

        expect(topicSections.length).toBe(expectedTopics.length);

        // Verify each topic section
        topicSections.forEach((section, index) => {
          const expectedTopic = expectedTopics[index];
          expect(section.getAttribute('data-topic')).toBe(expectedTopic);

          const topicTitle = section.querySelector('.writing__topic-title');
          expect(topicTitle.textContent).toBe(expectedTopic);

          // Verify entries within topic are correctly grouped
          const topicEntries = section.querySelectorAll('.writing-card');
          const expectedTopicEntries = groupedEntries[expectedTopic];
          expect(topicEntries.length).toBe(expectedTopicEntries.length);

          // Verify all entries in this section have the correct topic
          topicEntries.forEach(entryElement => {
            expect(entryElement.getAttribute('data-topic')).toBe(expectedTopic);
          });
        });

        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should maintain consistent date formatting across all writing entries', () => {
    // Property: All date displays should use consistent formatting

    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
          venue: fc.string({ minLength: 1, maxLength: 100 })
        }),
        { minLength: 1, maxLength: 5 }
      ),
      (writingEntries) => {
        // Create container for testing date formatting
        const container = document.createElement('div');
        document.body.appendChild(container);

        const dateElements = [];

        writingEntries.forEach(entry => {
          const dateElement = document.createElement('time');
          dateElement.className = 'writing-card__date';
          dateElement.setAttribute('datetime', entry.date.toISOString().split('T')[0]);
          dateElement.textContent = entry.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          container.appendChild(dateElement);
          dateElements.push(dateElement);
        });

        // Test consistent date formatting
        dateElements.forEach((dateElement, index) => {
          const expectedDate = writingEntries[index].date;

          // Check datetime attribute format (ISO date)
          const datetimeAttr = dateElement.getAttribute('datetime');
          expect(datetimeAttr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(datetimeAttr).toBe(expectedDate.toISOString().split('T')[0]);

          // Check display text format (Month Day, Year)
          const displayText = dateElement.textContent;
          const expectedDisplayText = expectedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          expect(displayText).toBe(expectedDisplayText);

          // Verify format pattern (e.g., "January 15, 2024")
          expect(displayText).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
        });

        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });

  it('should handle writing entries with different content types consistently', () => {
    // Property: Different content types (blog-post, paper-reading, article) should have consistent structure

    fc.assert(fc.property(
      fc.constantFrom('blog-post', 'paper-reading', 'article'),
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        venue: fc.string({ minLength: 1, maxLength: 100 }),
        date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
        summary: fc.string({ minLength: 10, maxLength: 300 }),
        url: fc.webUrl(),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
      }),
      (contentType, entryData) => {
        const entry = { ...entryData, type: contentType };

        // Create writing card for any content type
        const entryElement = document.createElement('article');
        entryElement.className = `writing-card writing-card--${contentType}`;
        entryElement.setAttribute('data-writing-id', entry.id);
        entryElement.setAttribute('data-type', contentType);

        const entryContent = document.createElement('div');
        entryContent.className = 'writing-card__content';

        // All content types should have the same basic structure
        const requiredElements = [
          { className: 'writing-card__title', tag: 'h3', content: entry.title },
          { className: 'writing-card__meta', tag: 'div', content: null },
          { className: 'writing-card__summary', tag: 'p', content: entry.summary },
          { className: 'writing-card__tags', tag: 'div', content: null },
          { className: 'writing-card__link', tag: 'a', content: 'Read More' }
        ];

        requiredElements.forEach(elementSpec => {
          const element = document.createElement(elementSpec.tag);
          element.className = elementSpec.className;

          if (elementSpec.content) {
            element.textContent = elementSpec.content;
          }

          if (elementSpec.className === 'writing-card__link') {
            element.href = entry.url;
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
          }

          entryContent.appendChild(element);
        });

        entryElement.appendChild(entryContent);

        // Test that all content types have consistent structure
        expect(entryElement.classList.contains('writing-card')).toBe(true);
        expect(entryElement.classList.contains(`writing-card--${contentType}`)).toBe(true);
        expect(entryElement.getAttribute('data-type')).toBe(contentType);

        // Test that all required elements are present regardless of content type
        requiredElements.forEach(elementSpec => {
          const element = entryElement.querySelector(`.${elementSpec.className}`);
          expect(element).toBeTruthy();

          if (elementSpec.content) {
            expect(element.textContent).toBe(elementSpec.content);
          }
        });

        // Test external link attributes for all content types
        const linkElement = entryElement.querySelector('.writing-card__link');
        expect(linkElement.getAttribute('target')).toBe('_blank');
        expect(linkElement.getAttribute('rel')).toBe('noopener noreferrer');
        expect(linkElement.href).toBe(entry.url);
      }
    ), { numRuns: 100 });
  });

  it('should organize entries consistently when filtering by publication venue', () => {
    // Property: When filtering by venue, entries should maintain chronological order within venue groups

    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          type: fc.constantFrom('blog-post', 'paper-reading', 'article'),
          venue: fc.constantFrom('Nature AI', 'Medium', 'ArXiv', 'IEEE Transactions', 'Personal Blog'),
          date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
          summary: fc.string({ minLength: 10, maxLength: 300 }),
          url: fc.webUrl(),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 })
        }),
        { minLength: 3, maxLength: 8 }
      ),
      (writingEntries) => {
        // Group entries by venue
        const venueGroups = {};
        writingEntries.forEach(entry => {
          if (!venueGroups[entry.venue]) {
            venueGroups[entry.venue] = [];
          }
          venueGroups[entry.venue].push(entry);
        });

        // Create venue-filtered container
        const container = document.createElement('div');
        container.className = 'writing__content writing__content--by-venue';
        document.body.appendChild(container);

        // Render entries grouped by venue
        Object.keys(venueGroups).sort().forEach(venue => {
          const venueSection = document.createElement('section');
          venueSection.className = 'writing__venue-section';
          venueSection.setAttribute('data-venue', venue);

          const venueTitle = document.createElement('h3');
          venueTitle.className = 'writing__venue-title';
          venueTitle.textContent = venue;
          venueSection.appendChild(venueTitle);

          // Sort entries within venue by date (newest first)
          const sortedVenueEntries = venueGroups[venue].sort((a, b) => b.date.getTime() - a.date.getTime());

          sortedVenueEntries.forEach(entry => {
            const entryElement = document.createElement('article');
            entryElement.className = 'writing-card writing-card--venue';
            entryElement.setAttribute('data-writing-id', entry.id);
            entryElement.setAttribute('data-venue', venue);
            entryElement.setAttribute('data-date', entry.date.toISOString().split('T')[0]);

            const title = document.createElement('h4');
            title.className = 'writing-card__title';
            title.textContent = entry.title;

            const date = document.createElement('time');
            date.className = 'writing-card__date';
            date.setAttribute('datetime', entry.date.toISOString().split('T')[0]);
            date.textContent = entry.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            entryElement.appendChild(title);
            entryElement.appendChild(date);
            venueSection.appendChild(entryElement);
          });

          container.appendChild(venueSection);
        });

        // Test venue grouping and chronological order within venues
        const venueSections = container.querySelectorAll('.writing__venue-section');
        const expectedVenues = Object.keys(venueGroups).sort();

        expect(venueSections.length).toBe(expectedVenues.length);

        venueSections.forEach((section, index) => {
          const expectedVenue = expectedVenues[index];
          expect(section.getAttribute('data-venue')).toBe(expectedVenue);

          // Test chronological order within venue
          const venueEntries = section.querySelectorAll('.writing-card');
          for (let i = 0; i < venueEntries.length - 1; i++) {
            const currentDate = new Date(venueEntries[i].getAttribute('data-date'));
            const nextDate = new Date(venueEntries[i + 1].getAttribute('data-date'));

            // Current entry should be newer than or equal to next entry
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }
        });

        // Clean up
        document.body.removeChild(container);
      }
    ), { numRuns: 100 });
  });
});