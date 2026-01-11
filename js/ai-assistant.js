/**
 * AI Assistant Chat Widget
 * Connects to locally hosted AI model server
 */

class AIAssistant {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      serverUrl: config.serverUrl || 'http://localhost:8080/chat',
      maxMessages: config.maxMessages || 50,
      reconnectInterval: config.reconnectInterval || 5000,
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

  createChatWidget() {
    // Get current language for initial text
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
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

    const t = translations[currentLang] || translations.en;

    const widgetHTML = `
      <div id="ai-assistant" class="ai-assistant">
        <!-- Toggle Button -->
        <button id="ai-toggle" class="ai-assistant__toggle" aria-label="Open AI Assistant">
          🤖
        </button>

        <!-- Chat Window -->
        <div id="ai-window" class="ai-assistant__window">
          <!-- Header -->
          <div id="ai-header" class="ai-assistant__header">
            <h3 class="ai-assistant__title">
              <span id="ai-status" class="ai-assistant__status"></span>
              <span data-i18n="ai.title">${t.title}</span>
            </h3>
            <button id="ai-close" class="ai-assistant__close" aria-label="Close">
              ×
            </button>
          </div>

          <!-- Messages -->
          <div id="ai-messages" class="ai-assistant__messages">
            <!-- Welcome message -->
            <div class="ai-message ai-message--assistant">
              <div class="ai-message__avatar">🤖</div>
              <div class="ai-message__content" data-i18n="ai.welcome">
                ${t.welcome}
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="ai-assistant__input-container">
            <textarea
              id="ai-input"
              class="ai-assistant__input"
              placeholder="${t.placeholder}"
              data-i18n-placeholder="ai.placeholder"
              rows="1"
            ></textarea>
            <button id="ai-send" class="ai-assistant__send">
              <span data-i18n="ai.send">${t.send}</span>
            </button>
          </div>
        </div>
      </div>
    `;

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
      this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 100) + 'px';
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
      this.elements.window.classList.add('ai-assistant__window--open');
      this.elements.toggle.classList.add('ai-assistant__toggle--active');
      this.elements.toggle.innerHTML = '✕';
      this.elements.input.focus();
      this.scrollToBottom();
    } else {
      this.elements.window.classList.remove('ai-assistant__window--open');
      this.elements.toggle.classList.remove('ai-assistant__toggle--active');
      this.elements.toggle.innerHTML = '🤖';
    }
  }

  // Smart positioning: position window based on toggle button location
  updateWindowPosition() {
    const toggleRect = this.elements.toggle.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = 380;
    const chatHeight = 500;
    const gap = 5; // Reduced gap for closer positioning

    // Reset any previous positioning
    this.elements.window.style.left = '';
    this.elements.window.style.right = '';
    this.elements.window.style.top = '';
    this.elements.window.style.bottom = '';

    // Determine horizontal position
    const spaceOnRight = windowWidth - toggleRect.right;
    const spaceOnLeft = toggleRect.left;

    if (spaceOnRight >= chatWidth) {
      // Position to the right of toggle
      this.elements.window.style.left = `${toggleRect.right + gap}px`;
    } else if (spaceOnLeft >= chatWidth) {
      // Position to the left of toggle
      this.elements.window.style.right = `${windowWidth - toggleRect.left + gap}px`;
    } else {
      // Center horizontally if not enough space on either side
      const left = Math.max(gap, (windowWidth - chatWidth) / 2);
      this.elements.window.style.left = `${left}px`;
    }

    // Determine vertical position
    const spaceBelow = windowHeight - toggleRect.bottom;
    const spaceAbove = toggleRect.top;

    if (spaceBelow >= chatHeight) {
      // Position below toggle
      this.elements.window.style.top = `${toggleRect.bottom + gap}px`;
    } else if (spaceAbove >= chatHeight) {
      // Position above toggle
      this.elements.window.style.bottom = `${windowHeight - toggleRect.top + gap}px`;
    } else {
      // Center vertically if not enough space above or below
      const top = Math.max(gap, (windowHeight - chatHeight) / 2);
      this.elements.window.style.top = `${top}px`;
    }
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
        name: "Xin Zhang",
        role: "Senior AI/ML Engineer",
        expertise: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
        languages: ["Python", "JavaScript", "SQL", "Bash"],
        location: "Waterloo, ON",
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

      return data.response || data.message || "I couldn't process that request.";
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
    const messageHTML = `
      <div class="ai-message ai-message--${type}">
        <div class="ai-message__avatar">${type === 'user' ? '👤' : '🤖'}</div>
        <div class="ai-message__content">${this.escapeHtml(content)}</div>
      </div>
    `;

    // Remove typing indicator if exists
    const typingIndicator = this.elements.messages.querySelector('.ai-message__typing');
    if (typingIndicator) {
      typingIndicator.parentElement.remove();
    }

    this.elements.messages.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();

    // Save to history
    this.messages.push({ type, content, timestamp: Date.now() });
    this.saveChatHistory();

    // Limit messages
    if (this.messages.length > this.config.maxMessages) {
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
      const typingHTML = `
        <div class="ai-message ai-message--assistant">
          <div class="ai-message__avatar">🤖</div>
          <div class="ai-message__content ai-message__typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
      this.elements.messages.insertAdjacentHTML('beforeend', typingHTML);
      this.scrollToBottom();
    } else {
      // Remove typing indicator
      const typingIndicator = this.elements.messages.querySelector('.ai-message__typing');
      if (typingIndicator) {
        typingIndicator.parentElement.remove();
      }
    }
  }

  async checkConnection() {
    try {
      const response = await fetch(this.config.serverUrl.replace('/chat', '/health'), {
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
      this.elements.status.classList.remove('ai-assistant__status--offline');
      this.elements.status.title = 'Connected';
    } else {
      this.elements.status.classList.add('ai-assistant__status--offline');
      this.elements.status.title = 'Offline - Start your local AI server';
    }
  }

  getErrorMessage(error) {
    if (error.message === 'connection') {
      return "I'm offline right now. Please make sure the AI server is running locally on port 8080.";
    }
    return "Sorry, I encountered an error. Please try again later.";
  }

  scrollToBottom() {
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveChatHistory() {
    try {
      localStorage.setItem('ai-chat-history', JSON.stringify(this.messages.slice(-10)));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }

  loadChatHistory() {
    try {
      const history = localStorage.getItem('ai-chat-history');
      if (history) {
        const messages = JSON.parse(history);
        messages.forEach(msg => {
          if (msg.type !== 'assistant' || msg.content !== this.elements.messages.firstElementChild?.textContent) {
            this.addMessage(msg.type, msg.content);
          }
        });
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }

  saveChatState(isOpen) {
    try {
      localStorage.setItem('ai-chat-open', JSON.stringify(isOpen));
    } catch (e) {
      console.error('Failed to save chat state:', e);
    }
  }

  loadChatState() {
    try {
      const state = localStorage.getItem('ai-chat-open');
      return state ? JSON.parse(state) : false;
    } catch (e) {
      console.error('Failed to load chat state:', e);
      return false;
    }
  }

  getSessionId() {
    try {
      // Try to get existing session ID from localStorage
      let sessionId = localStorage.getItem('ai-session-id');

      if (!sessionId) {
        // Generate a client-side session ID if none exists
        // This will be replaced by server-generated ID on first message
        sessionId = 'client-' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('ai-session-id', sessionId);
      }

      return sessionId;
    } catch (e) {
      console.error('Failed to get session ID:', e);
      // Fallback to a temporary session ID
      return 'temp-' + Math.random().toString(36).substring(2, 11);
    }
  }

  saveSessionId(sessionId) {
    try {
      localStorage.setItem('ai-session-id', sessionId);
    } catch (e) {
      console.error('Failed to save session ID:', e);
    }
  }

  clearSession() {
    // Clear the session (useful for starting fresh)
    try {
      localStorage.removeItem('ai-session-id');
      localStorage.removeItem('ai-chat-history');
      this.sessionId = this.getSessionId();
      this.messages = [];

      // Clear chat messages from UI
      if (this.elements.messages) {
        this.elements.messages.innerHTML = `
          <div class="ai-message ai-message--assistant">
            <div class="ai-message__avatar">🤖</div>
            <div class="ai-message__content" data-i18n="ai.welcome">
              Hi! I'm Xin's AI assistant. Ask me about his work, projects, or research!
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }

  // Update translations when language changes
  updateTranslations() {
    if (window.i18n) {
      const lang = window.i18n.getCurrentLanguage();

      // Update all translatable elements in the chat widget
      this.elements.widget.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = window.i18n.t(key, lang);
      });

      // Update placeholder
      const placeholder = this.elements.input.getAttribute('data-i18n-placeholder');
      if (placeholder) {
        this.elements.input.placeholder = window.i18n.t(placeholder, lang);
      }
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
      }, 50); // Reduced debounce for smoother updates
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

    // Get margin (same as CSS --space-lg: 2rem)
    const margin = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2; // 2rem in pixels

    // Calculate position from percentage
    let newX = (this.positionPercentage.x / 100) * viewportWidth;
    let newY = (this.positionPercentage.y / 100) * viewportHeight;

    // Constrain to viewport boundaries with margin
    const minX = margin;
    const maxX = viewportWidth - toggleWidth - margin;
    const minY = margin;
    const maxY = viewportHeight - toggleHeight - margin;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    // Update position
    this.elements.widget.style.left = `${newX}px`;
    this.elements.widget.style.top = `${newY}px`;

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
    let dragThreshold = 5; // Minimum pixels to move before considering it a drag

    const dragStart = (e) => {
      // Prevent dragging when interacting with input or textarea
      if (e.target.closest('input, textarea')) {
        return;
      }

      // Only allow dragging on toggle button (not header)
      const isToggle = e.target.closest('#ai-toggle');
      const isCloseButton = e.target.closest('#ai-close');

      if (!isToggle || isCloseButton) {
        return;
      }

      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX;
        initialY = e.touches[0].clientY;
      } else {
        initialX = e.clientX;
        initialY = e.clientY;
      }

      // Get current position
      const rect = this.elements.widget.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;

      isDragging = true;
      hasMoved = false;
    };

    const drag = (e) => {
      if (!isDragging) return;

      let clientX, clientY;
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const deltaX = clientX - initialX;
      const deltaY = clientY - initialY;

      // Check if movement exceeds threshold
      if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
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

        // Get margin (same as CSS --space-lg: 2rem)
        const margin = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2; // 2rem in pixels

        // Constrain to viewport boundaries with margin
        const minX = margin;
        const maxX = viewportWidth - toggleWidth - margin;
        const minY = margin;
        const maxY = viewportHeight - toggleHeight - margin;

        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // Store position as percentage for zoom consistency
        this.positionPercentage = {
          x: (newX / viewportWidth) * 100,
          y: (newY / viewportHeight) * 100
        };

        // Update position
        this.elements.widget.style.position = 'fixed';
        this.elements.widget.style.left = `${newX}px`;
        this.elements.widget.style.top = `${newY}px`;
        this.elements.widget.style.right = 'auto';
        this.elements.widget.style.bottom = 'auto';

        // Update cursor
        this.elements.widget.style.cursor = 'grabbing';
        if (this.elements.header) {
          this.elements.header.style.cursor = 'grabbing';
        }
        this.elements.toggle.style.cursor = 'grabbing';

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
      this.elements.widget.style.cursor = '';
      if (this.elements.header) {
        this.elements.header.style.cursor = '';
      }
      this.elements.toggle.style.cursor = '';

      // Update window position if chat is open
      if (this.isOpen && hasMoved) {
        this.updateWindowPosition();
      }

      // Reset flag after a short delay to allow click event to be skipped
      setTimeout(() => {
        this.wasDragging = false;
      }, 100);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if assistant already exists (for page navigation)
  if (!window.aiAssistant) {
    // Get server URL from configuration
    const serverUrl = window.AI_SERVER_CONFIG
      ? window.AI_SERVER_CONFIG.serverUrl
      : 'http://localhost:8080/chat';

    console.log('AI Assistant: Initializing with server URL:', serverUrl);

    // Initialize AI Assistant
    window.aiAssistant = new AIAssistant({
      serverUrl: serverUrl,
      maxMessages: 50,
      reconnectInterval: 5000
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