/**
 * AI Assistant Constants
 * Centralized configuration for all hardcoded values
 */

(function(window) {
  'use strict';

  // Define all constants
  const ICONS = {
    ROBOT: '🤖',
    USER: '👤',
    CLOSE_X: '×',
    CLOSE_CROSS: '✕'
  };

  const DIMENSIONS = {
    CHAT_WIDTH: 380,
    CHAT_HEIGHT: 500,
    CHAT_MIN_WIDTH: 280,
    CHAT_MIN_HEIGHT: 300,
    CHAT_MAX_WIDTH_VW: 90,
    CHAT_MAX_HEIGHT_VH: 70,
    POSITION_GAP: 5,
    DRAG_THRESHOLD: 5,
    TOGGLE_WIDTH: 60,
    TOGGLE_HEIGHT: 60,
    TOGGLE_WIDTH_MOBILE: 50,
    TOGGLE_HEIGHT_MOBILE: 50,
    TOGGLE_FONT_SIZE: 28,
    TOGGLE_FONT_SIZE_MOBILE: 24,
    AVATAR_SIZE: 32,
    AVATAR_FONT_SIZE: 16,
    INPUT_MIN_HEIGHT: 40,
    INPUT_MAX_HEIGHT: 100
  };

  const TIMING = {
    RECONNECT_INTERVAL: 5000,
    RESIZE_DEBOUNCE: 50,
    DRAG_RESET_DELAY: 100,
    TYPING_ANIMATION: 1400
  };

  const LIMITS = {
    MAX_MESSAGES: 50,
    CHAT_HISTORY_LIMIT: 10
  };

  const STORAGE_KEYS = {
    CHAT_HISTORY: 'ai-chat-history',
    CHAT_OPEN: 'ai-chat-open',
    SESSION_ID: 'ai-session-id',
    CHAT_SIZE: 'ai-chat-size'
  };

  const CSS_CLASSES = {
    WINDOW: 'ai-assistant__window',
    WINDOW_OPEN: 'ai-assistant__window--open',
    TOGGLE: 'ai-assistant__toggle',
    TOGGLE_ACTIVE: 'ai-assistant__toggle--active',
    STATUS: 'ai-assistant__status',
    STATUS_OFFLINE: 'ai-assistant__status--offline',
    MESSAGE: 'ai-message',
    MESSAGE_USER: 'ai-message--user',
    MESSAGE_ASSISTANT: 'ai-message--assistant',
    MESSAGE_AVATAR: 'ai-message__avatar',
    MESSAGE_CONTENT: 'ai-message__content',
    MESSAGE_TYPING: 'ai-message__typing'
  };

  const API_CONFIG = {
    DEFAULT_SERVER_URL: 'http://localhost:8080/chat',
    HEALTH_ENDPOINT: '/health',
    CHAT_ENDPOINT: '/chat'
  };

  const MESSAGES = {
    ERROR_CONNECTION: "I'm offline right now. Please make sure the AI server is running locally on port 8080.",
    ERROR_GENERIC: "Sorry, I encountered an error. Please try again later.",
    ERROR_PROCESSING: "I couldn't process that request."
  };

  const ARIA_LABELS = {
    TOGGLE_OPEN: 'Open AI Assistant',
    TOGGLE_CLOSE: 'Close AI Assistant'
  };

  const CONTEXT_INFO = {
    name: "Xin Zhang",
    role: "Senior AI/ML Engineer",
    expertise: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
    languages: ["Python", "JavaScript", "SQL", "Bash"],
    location: "Waterloo, ON"
  };

  // Context type options for @ mentions
  const CONTEXT_TYPES = [
    {
      id: 'beer',
      labelKey: 'ai.contextBeer',
      icon: '🍺',
      color: '#FFA500'
    },
    {
      id: 'paper',
      labelKey: 'ai.contextPaper',
      icon: '📄',
      color: '#4682B4'
    }
  ];

  // Expose to window
  window.ICONS = ICONS;
  window.DIMENSIONS = DIMENSIONS;
  window.TIMING = TIMING;
  window.LIMITS = LIMITS;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.CSS_CLASSES = CSS_CLASSES;
  window.API_CONFIG = API_CONFIG;
  window.MESSAGES = MESSAGES;
  window.ARIA_LABELS = ARIA_LABELS;
  window.CONTEXT_INFO = CONTEXT_INFO;
  window.CONTEXT_TYPES = CONTEXT_TYPES;

  // Also create a grouped object for convenience
  window.AI_CONSTANTS = {
    ICONS,
    DIMENSIONS,
    TIMING,
    LIMITS,
    STORAGE_KEYS,
    CSS_CLASSES,
    API_CONFIG,
    MESSAGES,
    ARIA_LABELS,
    CONTEXT_INFO,
    CONTEXT_TYPES
  };

})(window);
