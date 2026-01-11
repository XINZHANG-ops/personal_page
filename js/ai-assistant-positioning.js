/**
 * AI Assistant Position Manager
 * Utilities for calculating and managing widget positioning
 */

(function(window) {
  'use strict';

  class PositionManager {
    /**
     * Get margin value in pixels (2rem)
     * @returns {number} Margin in pixels
     */
    static getMargin() {
      return parseFloat(getComputedStyle(document.documentElement).fontSize) * 2;
    }

    /**
     * Calculate boundary constraints for positioning
     * @param {number} toggleWidth - Toggle button width
     * @param {number} toggleHeight - Toggle button height
     * @param {number} viewportWidth - Viewport width
     * @param {number} viewportHeight - Viewport height
     * @returns {Object} Boundary constraints {minX, maxX, minY, maxY}
     */
    static getBoundaries(toggleWidth, toggleHeight, viewportWidth, viewportHeight) {
      const margin = this.getMargin();
      return {
        minX: margin,
        maxX: viewportWidth - toggleWidth - margin,
        minY: margin,
        maxY: viewportHeight - toggleHeight - margin
      };
    }

    /**
     * Constrain position to boundaries
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} boundaries - Boundary constraints
     * @returns {Object} Constrained position {x, y}
     */
    static constrainPosition(x, y, boundaries) {
      return {
        x: Math.max(boundaries.minX, Math.min(x, boundaries.maxX)),
        y: Math.max(boundaries.minY, Math.min(y, boundaries.maxY))
      };
    }

    /**
     * Convert pixel position to percentage
     * @param {number} x - X position in pixels
     * @param {number} y - Y position in pixels
     * @param {number} viewportWidth - Viewport width
     * @param {number} viewportHeight - Viewport height
     * @returns {Object} Position as percentage {x, y}
     */
    static toPercentage(x, y, viewportWidth, viewportHeight) {
      return {
        x: (x / viewportWidth) * 100,
        y: (y / viewportHeight) * 100
      };
    }

    /**
     * Convert percentage position to pixels
     * @param {Object} percentage - Position as percentage {x, y}
     * @param {number} viewportWidth - Viewport width
     * @param {number} viewportHeight - Viewport height
     * @returns {Object} Position in pixels {x, y}
     */
    static fromPercentage(percentage, viewportWidth, viewportHeight) {
      return {
        x: (percentage.x / 100) * viewportWidth,
        y: (percentage.y / 100) * viewportHeight
      };
    }

    /**
     * Calculate optimal chat window position relative to toggle
     * @param {DOMRect} toggleRect - Toggle button bounding rect
     * @param {number} windowWidth - Viewport width
     * @param {number} windowHeight - Viewport height
     * @returns {Object} Position styles {left, right, top, bottom}
     */
    static calculateChatPosition(toggleRect, windowWidth, windowHeight) {
      const chatWidth = window.DIMENSIONS.CHAT_WIDTH;
      const chatHeight = window.DIMENSIONS.CHAT_HEIGHT;
      const gap = window.DIMENSIONS.POSITION_GAP;

      const position = {
        left: '',
        right: '',
        top: '',
        bottom: ''
      };

      // Calculate available space
      const spaceOnRight = windowWidth - toggleRect.right;
      const spaceOnLeft = toggleRect.left;
      const spaceBelow = windowHeight - toggleRect.bottom;
      const spaceAbove = toggleRect.top;

      // Determine horizontal position
      if (spaceOnRight >= chatWidth) {
        position.left = `${toggleRect.right + gap}px`;
      } else if (spaceOnLeft >= chatWidth) {
        position.right = `${windowWidth - toggleRect.left + gap}px`;
      } else {
        const left = Math.max(gap, (windowWidth - chatWidth) / 2);
        position.left = `${left}px`;
      }

      // Determine vertical position
      if (spaceBelow >= chatHeight) {
        position.top = `${toggleRect.bottom + gap}px`;
      } else if (spaceAbove >= chatHeight) {
        position.bottom = `${windowHeight - toggleRect.top + gap}px`;
      } else {
        const top = Math.max(gap, (windowHeight - chatHeight) / 2);
        position.top = `${top}px`;
      }

      return position;
    }

    /**
     * Check if movement exceeds drag threshold
     * @param {number} deltaX - X movement delta
     * @param {number} deltaY - Y movement delta
     * @returns {boolean} Whether threshold is exceeded
     */
    static exceedsDragThreshold(deltaX, deltaY) {
      return Math.abs(deltaX) > window.DIMENSIONS.DRAG_THRESHOLD ||
             Math.abs(deltaY) > window.DIMENSIONS.DRAG_THRESHOLD;
    }
  }

  window.PositionManager = PositionManager;

})(window);
