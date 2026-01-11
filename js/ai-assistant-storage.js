/**
 * AI Assistant Storage Manager
 * Centralized localStorage operations with error handling
 */

(function(window) {
  'use strict';

  class StorageManager {
    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found or error
     * @returns {*} Parsed value or default
     */
    static get(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (e) {
        console.error(`Failed to get ${key}:`, e);
        return defaultValue;
      }
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    static set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error(`Failed to save ${key}:`, e);
        return false;
      }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    static remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error(`Failed to remove ${key}:`, e);
        return false;
      }
    }

    /**
     * Clear multiple items from localStorage
     * @param {string[]} keys - Array of storage keys
     * @returns {boolean} Success status
     */
    static removeMultiple(keys) {
      try {
        keys.forEach(key => localStorage.removeItem(key));
        return true;
      } catch (e) {
        console.error('Failed to clear items:', e);
        return false;
      }
    }

    /**
     * Check if key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Whether key exists
     */
    static has(key) {
      try {
        return localStorage.getItem(key) !== null;
      } catch (e) {
        console.error(`Failed to check ${key}:`, e);
        return false;
      }
    }
  }

  window.StorageManager = StorageManager;

})(window);
