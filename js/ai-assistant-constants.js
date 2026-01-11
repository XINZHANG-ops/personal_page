/**
 * AI Assistant Constants
 * Centralized configuration for all hardcoded values
 */

export const ICONS = {
  ROBOT: '🤖',
  USER: '👤',
  CLOSE_X: '×',
  CLOSE_CROSS: '✕'
};

export const DIMENSIONS = {
  CHAT_WIDTH: 380,
  CHAT_HEIGHT: 500,
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

export const TIMING = {
  RECONNECT_INTERVAL: 5000,
  RESIZE_DEBOUNCE: 50,
  DRAG_RESET_DELAY: 100,
  TYPING_ANIMATION: 1400
};

export const LIMITS = {
  MAX_MESSAGES: 50,
  CHAT_HISTORY_LIMIT: 10
};

export const STORAGE_KEYS = {
  CHAT_HISTORY: 'ai-chat-history',
  CHAT_OPEN: 'ai-chat-open',
  SESSION_ID: 'ai-session-id'
};

export const CSS_CLASSES = {
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

export const API_CONFIG = {
  DEFAULT_SERVER_URL: 'http://localhost:8080/chat',
  HEALTH_ENDPOINT: '/health',
  CHAT_ENDPOINT: '/chat'
};

export const MESSAGES = {
  ERROR_CONNECTION: "I'm offline right now. Please make sure the AI server is running locally on port 8080.",
  ERROR_GENERIC: "Sorry, I encountered an error. Please try again later.",
  ERROR_PROCESSING: "I couldn't process that request."
};

export const ARIA_LABELS = {
  TOGGLE_OPEN: 'Open AI Assistant',
  TOGGLE_CLOSE: 'Close AI Assistant'
};

export const CONTEXT_INFO = {
  NAME: "Xin Zhang",
  ROLE: "Senior AI/ML Engineer",
  EXPERTISE: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
  LANGUAGES: ["Python", "JavaScript", "SQL", "Bash"],
  LOCATION: "Waterloo, ON"
};
