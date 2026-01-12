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
     * Chat window is positioned with toggle button attached to its corner
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

      // Calculate available space on each side
      const spaceOnRight = windowWidth - toggleRect.right;
      const spaceOnLeft = toggleRect.left;
      const spaceBelow = windowHeight - toggleRect.bottom;
      const spaceAbove = toggleRect.top;

      // Determine best position: prioritize above, then below, then left/right
      // Position chat window so toggle is attached to one of its corners

      if (spaceAbove >= chatHeight + gap) {
        // Chat above toggle
        position.bottom = `${windowHeight - toggleRect.top + gap}px`;

        // Align horizontally - use toggle center position to decide alignment
        const toggleCenterX = toggleRect.left + (toggleRect.width / 2);
        if (toggleCenterX < windowWidth / 2) {
          // Toggle on left half, align chat to left
          position.left = `${toggleRect.left}px`;
        } else {
          // Toggle on right half, align chat to right
          position.right = `${windowWidth - toggleRect.right}px`;
        }
      } else if (spaceBelow >= chatHeight + gap) {
        // Chat below toggle
        position.top = `${toggleRect.bottom + gap}px`;

        // Align horizontally - use toggle center position to decide alignment
        const toggleCenterX = toggleRect.left + (toggleRect.width / 2);
        if (toggleCenterX < windowWidth / 2) {
          // Toggle on left half, align chat to left
          position.left = `${toggleRect.left}px`;
        } else {
          // Toggle on right half, align chat to right
          position.right = `${windowWidth - toggleRect.right}px`;
        }
      } else if (spaceOnLeft >= chatWidth + gap) {
        // Chat to the left of toggle
        position.right = `${windowWidth - toggleRect.left}px`;

        // Align vertically - use toggle center position to decide alignment
        const toggleCenterY = toggleRect.top + (toggleRect.height / 2);
        if (toggleCenterY < windowHeight / 2) {
          // Toggle on top half, align chat to top
          position.top = `${toggleRect.top}px`;
        } else {
          // Toggle on bottom half, align chat to bottom
          position.bottom = `${windowHeight - toggleRect.bottom}px`;
        }
      } else if (spaceOnRight >= chatWidth + gap) {
        // Chat to the right of toggle (add gap to avoid covering blue focus ring)
        position.left = `${toggleRect.right + gap}px`;

        // Align vertically - use toggle center position to decide alignment
        const toggleCenterY = toggleRect.top + (toggleRect.height / 2);
        if (toggleCenterY < windowHeight / 2) {
          // Toggle on top half, align chat to top
          position.top = `${toggleRect.top}px`;
        } else {
          // Toggle on bottom half, align chat to bottom
          position.bottom = `${windowHeight - toggleRect.bottom}px`;
        }
      } else {
        // Not enough space anywhere, center it
        const left = Math.max(gap, (windowWidth - chatWidth) / 2);
        const top = Math.max(gap, (windowHeight - chatHeight) / 2);
        position.left = `${left}px`;
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
