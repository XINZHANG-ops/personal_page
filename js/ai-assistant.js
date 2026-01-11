/**
 * AI Assistant Chat Widget
 * Connects to locally hosted AI model server
 */

(function(window) {
  'use strict';

  // Use global utilities loaded from separate files
  const { ICONS, DIMENSIONS, TIMING, LIMITS, STORAGE_KEYS, CSS_CLASSES, API_CONFIG, MESSAGES, CONTEXT_INFO } = window;
  const { StorageManager, PositionManager, Templates, DOMUtils } = window;

class AIAssistant {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      serverUrl: config.serverUrl || API_CONFIG.DEFAULT_SERVER_URL,
      maxMessages: config.maxMessages || LIMITS.MAX_MESSAGES,
      reconnectInterval: config.reconnectInterval || TIMING.RECONNECT_INTERVAL,
      ...config
    };

    // State - Load from localStorage to persist across pages
    this.isOpen = this.loadChatState();
    this.isConnected = false;
    this.messages = [];
    this.isTyping = false;
    this.sessionId = this.getSessionId();
    this.wasDragging = false;

    // Track position as percentage for zoom consistency
    this.positionPercentage = null; // { x: %, y: % }

    // Initialize
    this.init();
    this.checkConnection();
    this.loadChatHistory();

    // Apply current language translations
    this.updateTranslations();

    // Restore open state if it was previously open
    if (this.isOpen) {
      this.openChat();
    }
  }

  init() {
    // Create chat widget HTML
    this.createChatWidget();

    // Get DOM elements
    this.elements = {
      widget: document.getElementById('ai-assistant'),
      toggle: document.getElementById('ai-toggle'),
      window: document.getElementById('ai-window'),
      close: document.getElementById('ai-close'),
      messages: document.getElementById('ai-messages'),
      input: document.getElementById('ai-input'),
      send: document.getElementById('ai-send'),
      status: document.getElementById('ai-status'),
      header: document.getElementById('ai-header')
    };

    // Add event listeners
    this.setupEventListeners();
    this.setupDraggable();
    this.setupResizeHandler();
  }

  getTranslations(lang) {
    const translations = {
      en: {
        title: 'AI Assistant',
        welcome: "Hi! I'm Xin's AI assistant. Ask me about his work, projects, or research!",
        placeholder: 'Type your message...',
        send: 'Send'
      },
      zh: {
        title: 'AI 助手',
        welcome: '你好！我是张信的AI助手。可以问我关于他的工作、项目或研究的问题！',
        placeholder: '输入您的消息...',
        send: '发送'
      }
    };
    return translations[lang] || translations.en;
  }

  createChatWidget() {
    // Get current language for initial text
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const translations = this.getTranslations(currentLang);

    const widgetHTML = Templates.chatWidget(translations);

    // Add to page
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  setupEventListeners() {
    // Toggle chat window - will be prevented if dragging
    this.elements.toggle.addEventListener('click', (e) => {
      if (!this.wasDragging) {
        this.toggleChat();
      }
      this.wasDragging = false;
    });
    this.elements.close.addEventListener('click', () => this.closeChat());

    // Send message
    this.elements.send.addEventListener('click', () => this.sendMessage());
    this.elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize input
    this.elements.input.addEventListener('input', () => {
      this.elements.input.style.height = 'auto';
      this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, DIMENSIONS.INPUT_MAX_HEIGHT) + 'px';
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.saveChatState(this.isOpen);
    this.updateChatVisibility();
    if (this.isOpen) {
      this.updateWindowPosition();
    }
  }

  openChat() {
    this.isOpen = true;
    this.saveChatState(true);
    this.updateChatVisibility();
    this.updateWindowPosition();
  }

  closeChat() {
    this.isOpen = false;
    this.saveChatState(false);
    this.updateChatVisibility();
  }

  updateChatVisibility() {
    if (this.isOpen) {
      this.elements.window.classList.add(CSS_CLASSES.WINDOW_OPEN);
      this.elements.toggle.classList.add(CSS_CLASSES.TOGGLE_ACTIVE);
      this.elements.toggle.innerHTML = ICONS.CLOSE_CROSS;
      this.elements.input.focus();
      this.scrollToBottom();
    } else {
      this.elements.window.classList.remove(CSS_CLASSES.WINDOW_OPEN);
      this.elements.toggle.classList.remove(CSS_CLASSES.TOGGLE_ACTIVE);
      this.elements.toggle.innerHTML = ICONS.ROBOT;
    }
  }

  // Smart positioning: position window based on toggle button location
  updateWindowPosition() {
    const toggleRect = this.elements.toggle.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Reset any previous positioning
    DOMUtils.resetPosition(this.elements.window);

    // Calculate and apply optimal position
    const position = PositionManager.calculateChatPosition(toggleRect, windowWidth, windowHeight);
    DOMUtils.applyPosition(this.elements.window, position);
  }

  async sendMessage() {
    const message = this.elements.input.value.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage('user', message);

    // Clear input
    this.elements.input.value = '';
    this.elements.input.style.height = 'auto';

    // Disable input while processing
    this.setTyping(true);

    try {
      // Send to server
      const response = await this.sendToServer(message);

      // Add AI response
      this.addMessage('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', this.getErrorMessage(error));
    } finally {
      this.setTyping(false);
    }
  }

  async sendToServer(message) {
    // Include session ID for user isolation
    const requestData = {
      message: message,
      session_id: this.sessionId,
      context: {
        ...CONTEXT_INFO,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch(this.config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Update session ID if server provides a new one
      if (data.session_id && data.session_id !== this.sessionId) {
        this.sessionId = data.session_id;
        this.saveSessionId(data.session_id);
      }

      return data.response || data.message || MESSAGES.ERROR_PROCESSING;
    } catch (error) {
      // Check if server is not running
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        this.isConnected = false;
        this.updateConnectionStatus();
        throw new Error('connection');
      }
      throw error;
    }
  }

  addMessage(type, content) {
    const messageHTML = Templates.message(type, DOMUtils.escapeHtml(content));

    // Remove typing indicator if exists
    const typingIndicator = this.elements.messages.querySelector(`.${CSS_CLASSES.MESSAGE_TYPING}`);
    if (typingIndicator) {
      DOMUtils.removeElement(typingIndicator);
    }

    this.elements.messages.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();

    // Save to history
    this.messages.push({ type, content, timestamp: Date.now() });
    this.saveChatHistory();

    // Limit messages
    if (this.messages.length > LIMITS.MAX_MESSAGES) {
      this.messages.shift();
      this.elements.messages.firstElementChild.remove();
    }
  }

  setTyping(isTyping) {
    this.isTyping = isTyping;
    this.elements.input.disabled = isTyping;
    this.elements.send.disabled = isTyping;

    if (isTyping) {
      // Add typing indicator
      const typingHTML = Templates.typingIndicator();
      this.elements.messages.insertAdjacentHTML('beforeend', typingHTML);
      this.scrollToBottom();
    } else {
      // Remove typing indicator
      const typingIndicator = this.elements.messages.querySelector(`.${CSS_CLASSES.MESSAGE_TYPING}`);
      if (typingIndicator) {
        DOMUtils.removeElement(typingIndicator);
      }
    }
  }

  async checkConnection() {
    try {
      const response = await fetch(this.config.serverUrl.replace(API_CONFIG.CHAT_ENDPOINT, API_CONFIG.HEALTH_ENDPOINT), {
        method: 'GET',
        mode: 'cors'
      });

      this.isConnected = response.ok;
    } catch (error) {
      this.isConnected = false;
    }

    this.updateConnectionStatus();

    // Retry connection periodically
    setTimeout(() => this.checkConnection(), this.config.reconnectInterval);
  }

  updateConnectionStatus() {
    if (this.isConnected) {
      this.elements.status.classList.remove(CSS_CLASSES.STATUS_OFFLINE);
      this.elements.status.title = 'Connected';
    } else {
      this.elements.status.classList.add(CSS_CLASSES.STATUS_OFFLINE);
      this.elements.status.title = 'Offline - Start your local AI server';
    }
  }

  getErrorMessage(error) {
    if (error.message === 'connection') {
      return MESSAGES.ERROR_CONNECTION;
    }
    return MESSAGES.ERROR_GENERIC;
  }

  scrollToBottom() {
    DOMUtils.scrollToBottom(this.elements.messages);
  }

  saveChatHistory() {
    StorageManager.set(STORAGE_KEYS.CHAT_HISTORY, this.messages.slice(-LIMITS.CHAT_HISTORY_LIMIT));
  }

  loadChatHistory() {
    const history = StorageManager.get(STORAGE_KEYS.CHAT_HISTORY, []);
    history.forEach(msg => {
      if (msg.type !== 'assistant' || msg.content !== this.elements.messages.firstElementChild?.textContent) {
        this.addMessage(msg.type, msg.content);
      }
    });
  }

  saveChatState(isOpen) {
    StorageManager.set(STORAGE_KEYS.CHAT_OPEN, isOpen);
  }

  loadChatState() {
    return StorageManager.get(STORAGE_KEYS.CHAT_OPEN, false);
  }

  getSessionId() {
    let sessionId = StorageManager.get(STORAGE_KEYS.SESSION_ID);

    if (!sessionId) {
      // Generate a client-side session ID if none exists
      // This will be replaced by server-generated ID on first message
      sessionId = 'client-' + Math.random().toString(36).substring(2, 11);
      StorageManager.set(STORAGE_KEYS.SESSION_ID, sessionId);
    }

    return sessionId || 'temp-' + Math.random().toString(36).substring(2, 11);
  }

  saveSessionId(sessionId) {
    StorageManager.set(STORAGE_KEYS.SESSION_ID, sessionId);
  }

  clearSession() {
    // Clear the session (useful for starting fresh)
    StorageManager.removeMultiple([STORAGE_KEYS.SESSION_ID, STORAGE_KEYS.CHAT_HISTORY]);
    this.sessionId = this.getSessionId();
    this.messages = [];

    // Clear chat messages from UI
    if (this.elements.messages) {
      const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
      const translations = this.getTranslations(currentLang);
      this.elements.messages.innerHTML = Templates.welcomeMessage(translations.welcome);
    }
  }

  // Update translations when language changes
  updateTranslations() {
    if (window.i18n) {
      const lang = window.i18n.getCurrentLanguage();

      // Update all translatable elements in the chat widget
      DOMUtils.updateTranslations(this.elements.widget, window.i18n.t.bind(window.i18n), lang);

      // Update placeholder
      DOMUtils.updatePlaceholder(this.elements.input, window.i18n.t.bind(window.i18n), lang);
    }
  }

  // Setup resize handler to constrain toggle within viewport on zoom/resize
  setupResizeHandler() {
    let resizeTimeout;
    let isResizing = false;

    window.addEventListener('resize', () => {
      // Immediately update position on resize start (no debounce for first update)
      if (!isResizing && this.positionPercentage) {
        isResizing = true;
        this.updatePositionFromPercentage();
      }

      // Debounce for subsequent updates during continuous resize
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.positionPercentage) {
          this.updatePositionFromPercentage();
        }
        isResizing = false;
      }, TIMING.RESIZE_DEBOUNCE);
    });
  }

  // Helper method to update position from stored percentage
  updatePositionFromPercentage() {
    if (!this.positionPercentage) return;

    // Get toggle button dimensions
    const toggleRect = this.elements.toggle.getBoundingClientRect();
    const toggleWidth = toggleRect.width;
    const toggleHeight = toggleRect.height;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position from percentage
    const pixelPosition = PositionManager.fromPercentage(
      this.positionPercentage,
      viewportWidth,
      viewportHeight
    );

    // Get boundaries and constrain position
    const boundaries = PositionManager.getBoundaries(
      toggleWidth,
      toggleHeight,
      viewportWidth,
      viewportHeight
    );

    const constrainedPosition = PositionManager.constrainPosition(
      pixelPosition.x,
      pixelPosition.y,
      boundaries
    );

    // Update position
    this.elements.widget.style.left = `${constrainedPosition.x}px`;
    this.elements.widget.style.top = `${constrainedPosition.y}px`;

    // Update chat window position if open
    if (this.isOpen) {
      this.updateWindowPosition();
    }
  }

  // Setup draggable functionality
  setupDraggable() {
    let isDragging = false;
    let hasMoved = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    const dragStart = (e) => {
      // Prevent dragging when interacting with input or textarea
      if (DOMUtils.isTargetWithin(e, 'input, textarea')) {
        return;
      }

      // Only allow dragging on toggle button (not header)
      const isToggle = DOMUtils.isTargetWithin(e, '#ai-toggle');
      const isCloseButton = DOMUtils.isTargetWithin(e, '#ai-close');

      if (!isToggle || isCloseButton) {
        return;
      }

      const coords = DOMUtils.getEventCoordinates(e);
      initialX = coords.clientX;
      initialY = coords.clientY;

      // Get current position
      const rect = this.elements.widget.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;

      isDragging = true;
      hasMoved = false;
    };

    const drag = (e) => {
      if (!isDragging) return;

      const coords = DOMUtils.getEventCoordinates(e);
      const deltaX = coords.clientX - initialX;
      const deltaY = coords.clientY - initialY;

      // Check if movement exceeds threshold
      if (PositionManager.exceedsDragThreshold(deltaX, deltaY)) {
        hasMoved = true;
        e.preventDefault();

        let newX = currentX + deltaX;
        let newY = currentY + deltaY;

        // Get toggle button dimensions
        const toggleRect = this.elements.toggle.getBoundingClientRect();
        const toggleWidth = toggleRect.width;
        const toggleHeight = toggleRect.height;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get boundaries and constrain position
        const boundaries = PositionManager.getBoundaries(
          toggleWidth,
          toggleHeight,
          viewportWidth,
          viewportHeight
        );

        const constrainedPosition = PositionManager.constrainPosition(newX, newY, boundaries);
        newX = constrainedPosition.x;
        newY = constrainedPosition.y;

        // Store position as percentage for zoom consistency
        this.positionPercentage = PositionManager.toPercentage(
          newX,
          newY,
          viewportWidth,
          viewportHeight
        );

        // Update position
        this.elements.widget.style.position = 'fixed';
        this.elements.widget.style.left = `${newX}px`;
        this.elements.widget.style.top = `${newY}px`;
        this.elements.widget.style.right = 'auto';
        this.elements.widget.style.bottom = 'auto';

        // Update cursor
        DOMUtils.setCursor([this.elements.widget, this.elements.header, this.elements.toggle], 'grabbing');

        // Update chat window position in real-time if open
        if (this.isOpen) {
          this.updateWindowPosition();
        }
      }
    };

    const dragEnd = (e) => {
      if (!isDragging) return;

      // If the user didn't move (just clicked), allow the click event to proceed
      if (!hasMoved) {
        isDragging = false;
        hasMoved = false;
        this.wasDragging = false;
        return;
      }

      // Set flag to prevent toggle on drag
      this.wasDragging = true;

      // Prevent click event if user was dragging
      e.preventDefault();
      e.stopPropagation();

      isDragging = false;
      hasMoved = false;
      DOMUtils.setCursor([this.elements.widget, this.elements.header, this.elements.toggle], '');

      // Update window position if chat is open
      if (this.isOpen && hasMoved) {
        this.updateWindowPosition();
      }

      // Reset flag after a short delay to allow click event to be skipped
      setTimeout(() => {
        this.wasDragging = false;
      }, TIMING.DRAG_RESET_DELAY);
    };

    // Toggle button dragging only
    this.elements.toggle.addEventListener('mousedown', dragStart);
    this.elements.toggle.addEventListener('touchstart', dragStart);

    // Global mouse/touch move and end events
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
  }
}

// Expose AIAssistant to window
window.AIAssistant = AIAssistant;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if assistant already exists (for page navigation)
  if (!window.aiAssistant) {
    // Get server URL from configuration
    const serverUrl = window.AI_SERVER_CONFIG
      ? window.AI_SERVER_CONFIG.serverUrl
      : API_CONFIG.DEFAULT_SERVER_URL;

    console.log('AI Assistant: Initializing with server URL:', serverUrl);

    // Initialize AI Assistant
    window.aiAssistant = new AIAssistant({
      serverUrl: serverUrl,
      maxMessages: LIMITS.MAX_MESSAGES,
      reconnectInterval: TIMING.RECONNECT_INTERVAL
    });

    // Listen for language changes
    window.addEventListener('languageChange', () => {
      if (window.aiAssistant) {
        window.aiAssistant.updateTranslations();
      }
    });

    // Show warning if on GitHub Pages without proper configuration
    if (window.AI_SERVER_CONFIG && window.AI_SERVER_CONFIG.isGitHubPages()) {
      if (serverUrl.includes('your-ngrok-id')) {
        console.warn('⚠️ AI Assistant: Please update the ngrok URL in js/ai-assistant-config.js');
      }
    }
  }
});

})(window);