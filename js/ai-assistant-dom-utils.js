/**
 * AI Assistant DOM Utilities
 * Helper functions for DOM manipulation
 */

(function(window) {
  'use strict';

  class DOMUtils {
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    static escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Apply position styles to an element
     * @param {HTMLElement} element - Target element
     * @param {Object} position - Position object {left, right, top, bottom}
     */
    static applyPosition(element, position) {
      element.style.left = position.left || '';
      element.style.right = position.right || '';
      element.style.top = position.top || '';
      element.style.bottom = position.bottom || '';
    }

    /**
     * Reset position styles to empty
     * @param {HTMLElement} element - Target element
     */
    static resetPosition(element) {
      element.style.left = '';
      element.style.right = '';
      element.style.top = '';
      element.style.bottom = '';
    }

    /**
     * Update element text content by data-i18n attribute
     * @param {HTMLElement} container - Container element to search within
     * @param {Function} translator - Translation function (key, lang) => string
     * @param {string} lang - Current language
     */
    static updateTranslations(container, translator, lang) {
      container.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translator(key, lang);
      });
    }

    /**
     * Update placeholder by data-i18n-placeholder attribute
     * @param {HTMLElement} input - Input element
     * @param {Function} translator - Translation function (key, lang) => string
     * @param {string} lang - Current language
     */
    static updatePlaceholder(input, translator, lang) {
      const key = input.getAttribute('data-i18n-placeholder');
      if (key) {
        input.placeholder = translator(key, lang);
      }
    }

    /**
     * Scroll element to bottom
     * @param {HTMLElement} element - Element to scroll
     */
    static scrollToBottom(element) {
      element.scrollTop = element.scrollHeight;
    }

    /**
     * Get client coordinates from mouse or touch event
     * @param {Event} event - Mouse or touch event
     * @returns {Object} Coordinates {clientX, clientY}
     */
    static getEventCoordinates(event) {
      if (event.type.startsWith('touch')) {
        return {
          clientX: event.touches[0].clientX,
          clientY: event.touches[0].clientY
        };
      }
      return {
        clientX: event.clientX,
        clientY: event.clientY
      };
    }

    /**
     * Check if event target is within specified elements
     * @param {Event} event - DOM event
     * @param {string} selector - CSS selector
     * @returns {boolean} Whether target matches selector
     */
    static isTargetWithin(event, selector) {
      return event.target.closest(selector) !== null;
    }

    /**
     * Remove element from DOM if it exists
     * @param {HTMLElement} element - Element to remove
     */
    static removeElement(element) {
      if (element && element.parentElement) {
        element.parentElement.remove();
      }
    }

    /**
     * Set cursor style for multiple elements
     * @param {HTMLElement[]} elements - Array of elements
     * @param {string} cursor - Cursor style
     */
    static setCursor(elements, cursor) {
      elements.forEach(el => {
        if (el) {
          el.style.cursor = cursor;
        }
      });
    }
  }

  window.DOMUtils = DOMUtils;

})(window);
