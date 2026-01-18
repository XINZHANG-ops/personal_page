/**
 * AI Assistant Chat Widget
 * Connects to locally hosted AI model server
 */

(function(window) {
  'use strict';

  // Use global utilities loaded from separate files
  const { ICONS, DIMENSIONS, TIMING, LIMITS, STORAGE_KEYS, CSS_CLASSES, API_CONFIG, MESSAGES, CONTEXT_INFO, CONTEXT_TYPES } = window;
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
    this.shouldAutoFocus = true; // Track if input should auto-focus
    this.selectedContextType = null; // Track @mentioned context type
    this.showingMentionDropdown = false; // Track if @ dropdown is visible

    // Track position as percentage for zoom consistency
    this.positionPercentage = null; // { x: %, y: % }

    // Track chat window size - Load from localStorage or use defaults
    const savedSize = this.loadChatSize();
    this.chatSize = {
      width: savedSize?.width || DIMENSIONS.CHAT_WIDTH,
      height: savedSize?.height || DIMENSIONS.CHAT_HEIGHT
    };

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
      newSession: document.getElementById('ai-new-session'),
      messages: document.getElementById('ai-messages'),
      input: document.getElementById('ai-input'),
      send: document.getElementById('ai-send'),
      status: document.getElementById('ai-status'),
      header: document.getElementById('ai-header')
    };

    // Create and inject mention dropdown
    this.createMentionDropdown();

    // Apply dimensions from constants to override CSS
    this.applyChatDimensions();

    // Add event listeners
    this.setupEventListeners();
    this.setupMentionListener();
    this.setupDraggable();
    this.setupResizable();
    this.setupResizeHandler();
  }

  applyChatDimensions() {
    // Apply chat window dimensions from saved size or constants
    this.elements.window.style.width = `${this.chatSize.width}px`;
    this.elements.window.style.height = `${this.chatSize.height}px`;
    this.elements.window.style.maxWidth = `${DIMENSIONS.CHAT_MAX_WIDTH_VW}vw`;
    this.elements.window.style.maxHeight = `${DIMENSIONS.CHAT_MAX_HEIGHT_VH}vh`;
  }

  getTranslations(lang) {
    const translations = {
      en: {
        title: 'AI Assistant',
        welcome: "Hi! I'm Xin's AI assistant. Ask me about his work, projects, or research!",
        placeholder: 'Type your message...',
        send: 'Send',
        newSession: 'New'
      },
      zh: {
        title: 'AI 助手',
        welcome: '你好！我是张信的AI助手。可以问我关于他的工作、项目或研究的问题！',
        placeholder: '输入您的消息...',
        send: '发送',
        newSession: '新对话'
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

    // New session button
    this.elements.newSession.addEventListener('click', () => this.startNewSession());

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

    // Track user interaction with input - if user focuses input, enable auto-focus
    this.elements.input.addEventListener('focus', () => {
      this.shouldAutoFocus = true;
    });

    // If user clicks outside chat messages/input area, disable auto-focus
    this.elements.window.addEventListener('click', (e) => {
      // Check if click is outside input and messages area
      const isInputArea = e.target.closest('.ai-assistant__input-container');
      const isMessagesArea = e.target.closest('.ai-assistant__messages');

      if (!isInputArea && !isMessagesArea) {
        this.shouldAutoFocus = false;
      }
    });
  }

  createMentionDropdown() {
    // Create mention dropdown HTML
    const dropdown = document.createElement('div');
    dropdown.id = 'ai-mention-dropdown';
    dropdown.className = 'ai-mention-dropdown';
    dropdown.style.display = 'none';

    // Add options from CONTEXT_TYPES
    CONTEXT_TYPES.forEach(type => {
      const option = document.createElement('div');
      option.className = 'ai-mention-dropdown__option';
      option.dataset.contextId = type.id;
      option.innerHTML = `
        <span class="ai-mention-dropdown__icon">${type.icon}</span>
        <span class="ai-mention-dropdown__label">${type.label}</span>
      `;
      option.addEventListener('click', () => this.selectContextType(type));
      dropdown.appendChild(option);
    });

    // Insert dropdown into the chat window
    const inputContainer = document.querySelector('.ai-assistant__input-container');
    inputContainer.appendChild(dropdown);
    this.elements.mentionDropdown = dropdown;
  }

  setupMentionListener() {
    this.elements.input.addEventListener('input', (e) => {
      // Check if user deleted the tag
      if (this.selectedContextType) {
        const tag = this.elements.input.querySelector('.ai-context-tag');
        if (!tag) {
          // Tag was deleted, clear selection
          this.removeContextType();
        }
      }

      // Check if user just typed @
      const sel = window.getSelection();
      if (!sel.rangeCount) return;

      const range = sel.getRangeAt(0);
      const textNode = range.startContainer;

      // Get text before cursor
      if (textNode.nodeType === Node.TEXT_NODE) {
        const textContent = textNode.textContent || '';
        const cursorPos = range.startOffset;
        const beforeCursor = textContent.substring(0, cursorPos);
        const lastAtIndex = beforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
          const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
          const isValidPosition = lastAtIndex === 0 || /\s/.test(beforeCursor[lastAtIndex - 1]);
          const shouldShowDropdown = isValidPosition && textAfterAt.trim() === '';

          if (shouldShowDropdown && !this.selectedContextType) {
            this.showMentionDropdown();
            return;
          }
        }
      }

      this.hideMentionDropdown();
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#ai-mention-dropdown') && !e.target.closest('#ai-input')) {
        this.hideMentionDropdown();
      }
    });

    // Handle keyboard navigation in dropdown
    this.elements.input.addEventListener('keydown', (e) => {
      if (this.showingMentionDropdown) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.hideMentionDropdown();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateMentionDropdown(e.key === 'ArrowDown' ? 1 : -1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectHighlightedOption();
        }
      }
    });
  }

  showMentionDropdown() {
    this.showingMentionDropdown = true;
    this.elements.mentionDropdown.style.display = 'block';

    // Highlight first option by default
    const firstOption = this.elements.mentionDropdown.querySelector('.ai-mention-dropdown__option');
    if (firstOption) {
      firstOption.classList.add('ai-mention-dropdown__option--highlighted');
    }

    // Position dropdown below cursor
    const inputRect = this.elements.input.getBoundingClientRect();
    const containerRect = this.elements.input.closest('.ai-assistant__input-container').getBoundingClientRect();
    this.elements.mentionDropdown.style.bottom = `${containerRect.height}px`;
    this.elements.mentionDropdown.style.left = '0px';
  }

  hideMentionDropdown() {
    this.showingMentionDropdown = false;
    this.elements.mentionDropdown.style.display = 'none';

    // Remove highlighting
    const options = this.elements.mentionDropdown.querySelectorAll('.ai-mention-dropdown__option');
    options.forEach(opt => opt.classList.remove('ai-mention-dropdown__option--highlighted'));
  }

  navigateMentionDropdown(direction) {
    const options = Array.from(this.elements.mentionDropdown.querySelectorAll('.ai-mention-dropdown__option'));
    const highlighted = this.elements.mentionDropdown.querySelector('.ai-mention-dropdown__option--highlighted');

    let newIndex = 0;
    if (highlighted) {
      const currentIndex = options.indexOf(highlighted);
      newIndex = (currentIndex + direction + options.length) % options.length;
      highlighted.classList.remove('ai-mention-dropdown__option--highlighted');
    }

    const newHighlighted = options[newIndex];
    newHighlighted.classList.add('ai-mention-dropdown__option--highlighted');

    // Scroll the highlighted option into view
    newHighlighted.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    });
  }

  selectHighlightedOption() {
    const highlighted = this.elements.mentionDropdown.querySelector('.ai-mention-dropdown__option--highlighted');
    if (highlighted) {
      const contextId = highlighted.dataset.contextId;
      const type = CONTEXT_TYPES.find(t => t.id === contextId);
      if (type) {
        this.selectContextType(type);
      }
    }
  }

  selectContextType(type) {
    this.selectedContextType = type;
    this.hideMentionDropdown();

    // Get current content and find @ position
    const content = this.elements.input.textContent || '';
    const lastAtIndex = content.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Store the tag info
      this.elements.input.dataset.contextType = type.id;

      // Create the tag element
      const tag = document.createElement('span');
      tag.className = `ai-context-tag ai-context-tag--${type.id}`;
      tag.contentEditable = 'false';
      tag.dataset.contextId = type.id;
      tag.innerHTML = `${type.icon} ${type.label}`;

      // Split content at @ and insert tag
      const beforeAt = content.substring(0, lastAtIndex);
      const afterAtRaw = content.substring(lastAtIndex + 1);
      const afterAt = afterAtRaw.replace(/^\s*/, ''); // Remove whitespace after @

      // Clear input and rebuild with tag
      this.elements.input.innerHTML = '';

      if (beforeAt) {
        this.elements.input.appendChild(document.createTextNode(beforeAt));
      }

      this.elements.input.appendChild(tag);

      // Add space after tag
      const spaceNode = document.createTextNode('\u00A0');
      this.elements.input.appendChild(spaceNode);

      if (afterAt) {
        this.elements.input.appendChild(document.createTextNode(afterAt));
      }

      // Focus and move cursor after tag
      this.elements.input.focus();
      const range = document.createRange();
      const sel = window.getSelection();

      // Move cursor after the space
      range.setStartAfter(spaceNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  removeContextType() {
    this.selectedContextType = null;
    delete this.elements.input.dataset.contextType;

    // Remove tag element from input
    const tag = this.elements.input.querySelector('.ai-context-tag');
    if (tag) {
      tag.remove();
    }
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
      // Enable auto-focus when opening chat and focus input
      this.shouldAutoFocus = true;
      this.elements.input.focus();
      this.scrollToBottom();
    } else {
      this.elements.window.classList.remove(CSS_CLASSES.WINDOW_OPEN);
      this.elements.toggle.classList.remove(CSS_CLASSES.TOGGLE_ACTIVE);
      this.elements.toggle.innerHTML = ICONS.ROBOT;
      // Disable auto-focus when closing
      this.shouldAutoFocus = false;
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

    // Update resize handle based on window position
    this.updateResizeHandle();
  }

  // Determine and show the appropriate resize handle based on chat window position
  updateResizeHandle() {
    const toggleRect = this.elements.toggle.getBoundingClientRect();
    const windowRect = this.elements.window.getBoundingClientRect();

    // Get all resize handles
    const handles = {
      nw: this.elements.window.querySelector('.ai-assistant__resize-handle--nw'),
      ne: this.elements.window.querySelector('.ai-assistant__resize-handle--ne'),
      sw: this.elements.window.querySelector('.ai-assistant__resize-handle--sw'),
      se: this.elements.window.querySelector('.ai-assistant__resize-handle--se')
    };

    // Hide all handles first
    Object.values(handles).forEach(handle => {
      if (handle) handle.classList.remove('ai-assistant__resize-handle--active');
    });

    // Determine which handle to show based on toggle position relative to window
    // The resize handle should be in the SAME corner as the chat window position
    // Toggle在右下 → Chat在左上 → Resize handle在左上 (nw)
    // Toggle在右上 → Chat在左下 → Resize handle在左下 (sw)
    // Toggle在左上 → Chat在右下 → Resize handle在右下 (se)
    // Toggle在左下 → Chat在右上 → Resize handle在右上 (ne)

    const toggleCenterX = toggleRect.left + toggleRect.width / 2;
    const toggleCenterY = toggleRect.top + toggleRect.height / 2;
    const windowCenterX = windowRect.left + windowRect.width / 2;
    const windowCenterY = windowRect.top + windowRect.height / 2;

    const toggleIsRight = toggleCenterX > windowCenterX;
    const toggleIsBelow = toggleCenterY > windowCenterY;

    let activeHandle = null;

    if (toggleIsRight && toggleIsBelow) {
      // Toggle在右下 → Chat在左上 → use nw handle
      activeHandle = handles.nw;
    } else if (toggleIsRight && !toggleIsBelow) {
      // Toggle在右上 → Chat在左下 → use sw handle
      activeHandle = handles.sw;
    } else if (!toggleIsRight && toggleIsBelow) {
      // Toggle在左下 → Chat在右上 → use ne handle
      activeHandle = handles.ne;
    } else {
      // Toggle在左上 → Chat在右下 → use se handle
      activeHandle = handles.se;
    }

    // Show the selected handle
    if (activeHandle) {
      activeHandle.classList.add('ai-assistant__resize-handle--active');
    }
  }

  async sendMessage() {
    const message = this.elements.input.textContent.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage('user', message);

    // Clear input
    this.elements.input.innerHTML = '';
    this.elements.input.style.height = 'auto';

    // Clear context type selection after sending
    const contextTypeToSend = this.selectedContextType;
    this.selectedContextType = null;
    delete this.elements.input.dataset.contextType;

    // Disable input while processing
    this.setTyping(true);

    try {
      // Send to server with the saved context type
      const response = await this.sendToServer(message, contextTypeToSend);

      // Add AI response
      this.addMessage('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', this.getErrorMessage(error));
    } finally {
      this.setTyping(false);
    }
  }

  async sendToServer(message, contextType = null) {
    // Get current page information
    const currentPage = this.getCurrentPageInfo();

    // Include session ID for user isolation
    const requestData = {
      message: message,
      session_id: this.sessionId,
      current_page: currentPage,
      context: {
        ...CONTEXT_INFO,
        timestamp: new Date().toISOString()
      }
    };

    // Add context_type if user selected one via @ mention
    if (contextType) {
      requestData.context_type = contextType.id;
    }

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
    // Render markdown for assistant messages, escape HTML for user messages
    const formattedContent = type === 'assistant'
      ? this.renderMarkdown(content)
      : DOMUtils.escapeHtml(content);

    const messageHTML = Templates.message(type, formattedContent);

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
    this.elements.input.contentEditable = !isTyping;
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

      // Auto-focus input after response if user was actively using it
      if (this.shouldAutoFocus) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          this.elements.input.focus();
        }, 100);
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

  startNewSession() {
    // Directly clear session without notification
    this.clearSession();

    // Re-focus input after clearing session
    this.shouldAutoFocus = true;
    setTimeout(() => {
      this.elements.input.focus();
    }, 100);
  }

  saveChatSize() {
    StorageManager.set(STORAGE_KEYS.CHAT_SIZE, this.chatSize);
  }

  loadChatSize() {
    return StorageManager.get(STORAGE_KEYS.CHAT_SIZE, null);
  }

  renderMarkdown(text) {
    if (!text) return '';

    // Escape HTML first to prevent XSS
    let html = DOMUtils.escapeHtml(text);

    // Process line by line for better list handling
    const lines = html.split('\n');
    const processedLines = [];
    let inOrderedList = false;
    let inUnorderedList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip empty lines within lists (but close lists if we hit two empty lines)
      if (line.trim() === '') {
        if (inOrderedList || inUnorderedList) {
          // Check if next line is also empty or not a list item
          const nextLine = lines[i + 1];
          if (!nextLine || nextLine.trim() === '' ||
              (!nextLine.match(/^(\s*)(\d+)[\.\)]\s+/) && !nextLine.match(/^(\s*)[-*]\s+/))) {
            if (inOrderedList) {
              processedLines.push('</ol>');
              inOrderedList = false;
            }
            if (inUnorderedList) {
              processedLines.push('</ul>');
              inUnorderedList = false;
            }
          }
        }
        processedLines.push(line);
        continue;
      }

      // Check for numbered list items: 1. item or 1) item
      const orderedMatch = line.match(/^(\s*)(\d+)[\.\)]\s+(.+)$/);
      if (orderedMatch) {
        if (!inOrderedList) {
          // Close unordered list if switching
          if (inUnorderedList) {
            processedLines.push('</ul>');
            inUnorderedList = false;
          }
          processedLines.push('<ol>');
          inOrderedList = true;
        }
        processedLines.push(`<li>${orderedMatch[3]}</li>`);
        continue;
      } else if (inOrderedList && !line.match(/^\s*$/)) {
        // Close list if we hit a non-list line
        processedLines.push('</ol>');
        inOrderedList = false;
      }

      // Check for unordered list items: - item or * item (but not *** or ---)
      const unorderedMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
      if (unorderedMatch && !line.match(/^[-*]{3,}$/)) {
        if (!inUnorderedList) {
          // Close ordered list if switching
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          processedLines.push('<ul>');
          inUnorderedList = true;
        }
        processedLines.push(`<li>${unorderedMatch[3]}</li>`);
        continue;
      } else if (inUnorderedList && !line.match(/^\s*$/)) {
        // Close list if we hit a non-list line
        processedLines.push('</ul>');
        inUnorderedList = false;
      }

      // Headers (only if line starts with # and has space after)
      if (line.match(/^###\s+/)) {
        processedLines.push(`<h3>${line.substring(4)}</h3>`);
      } else if (line.match(/^##\s+/)) {
        processedLines.push(`<h2>${line.substring(3)}</h2>`);
      } else if (line.match(/^#\s+/)) {
        processedLines.push(`<h1>${line.substring(2)}</h1>`);
      } else {
        processedLines.push(line);
      }
    }

    // Close any open lists
    if (inOrderedList) processedLines.push('</ol>');
    if (inUnorderedList) processedLines.push('</ul>');

    html = processedLines.join('\n');

    // Inline formatting - IMPORTANT: Process in specific order to avoid conflicts
    // Order matters! Links and code must be processed BEFORE italic to protect underscores

    // 1. First process code blocks (to protect content inside backticks)
    // Support both single-line and content with spaces
    html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');

    // 2. Then process links (to protect underscores in URLs)
    // This protects URLs like personal_page from being turned into personal<em>page</em>
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function(_match, text, url) {
      // Make sure URL doesn't have spaces (basic validation)
      url = url.trim();
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // 3. Then bold (needs to be before italic to handle ** vs *)
    // Use non-greedy matching and ensure we don't match across multiple paragraphs
    html = html.replace(/\*\*([^\n]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^\n]+?)__/g, '<strong>$1</strong>');

    // 4. Finally italic - but ONLY match underscores/asterisks in plain text
    // Avoid matching * in lists or _ in URLs/variable names
    // Only match single * or _ that are surrounded by whitespace or punctuation
    html = html.replace(/(?<![*\w<])\*([^*\n<>]+?)\*(?![*\w>])/g, '<em>$1</em>');
    // For underscores, be more careful - only match if surrounded by spaces/punctuation
    html = html.replace(/(?<![\w_<])_([^_\n<>]+?)_(?![_\w>])/g, '<em>$1</em>');

    // Line breaks (convert remaining \n to <br>, but not after block elements)
    // Also don't add <br> after closing or before opening tags
    html = html.replace(/\n(?!<\/?(ol|ul|li|h[123]|br))/g, '<br>');
    // Remove <br> that appear right after opening or before closing block tags
    html = html.replace(/(<(ol|ul|h[123])>)<br>/g, '$1');
    html = html.replace(/<br>(<\/(ol|ul|h[123])>)/g, '$1');

    return html;
  }

  getCurrentPageInfo() {
    // Get current page URL and path
    const url = window.location.href;
    const pathname = window.location.pathname;
    const title = document.title;

    // Extract page name from pathname
    let pageName = 'home';
    if (pathname.includes('/pages/')) {
      // Extract filename without .html
      const match = pathname.match(/\/pages\/([^\/]+)\.html/);
      if (match) {
        pageName = match[1];
      }
    } else if (pathname === '/' || pathname === '/index.html') {
      pageName = 'home';
    }

    return {
      url: url,
      pathname: pathname,
      title: title,
      page_name: pageName
    };
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

  // Setup resizable functionality (dynamic corner based on position)
  setupResizable() {
    const resizeHandles = this.elements.window.querySelectorAll('.ai-assistant__resize-handle');

    let isResizing = false;
    let currentHandle = null;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;

    const resizeStart = (e) => {
      // Prevent text selection during resize
      e.preventDefault();

      // Get the handle being dragged
      currentHandle = e.target.getAttribute('data-resize');
      if (!currentHandle) return;

      const coords = DOMUtils.getEventCoordinates(e);
      isResizing = true;

      startX = coords.clientX;
      startY = coords.clientY;

      const rect = this.elements.window.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;

      // Add resizing class for visual feedback
      this.elements.window.style.transition = 'none';
      document.body.style.cursor = `${currentHandle}-resize`;
      document.body.style.userSelect = 'none';
    };

    const resize = (e) => {
      if (!isResizing || !currentHandle) return;

      e.preventDefault();
      const coords = DOMUtils.getEventCoordinates(e);

      const deltaX = coords.clientX - startX;
      const deltaY = coords.clientY - startY;

      // Get viewport constraints
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = viewportWidth * (DIMENSIONS.CHAT_MAX_WIDTH_VW / 100);
      const maxHeight = viewportHeight * (DIMENSIONS.CHAT_MAX_HEIGHT_VH / 100);

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // Handle different resize directions
      if (currentHandle === 'nw') {
        // Top-left: drag left/up increases size
        const desiredWidth = startWidth - deltaX;
        const desiredHeight = startHeight - deltaY;
        newWidth = Math.max(DIMENSIONS.CHAT_MIN_WIDTH, Math.min(desiredWidth, maxWidth));
        newHeight = Math.max(DIMENSIONS.CHAT_MIN_HEIGHT, Math.min(desiredHeight, maxHeight));

        // Only move if not constrained
        if (newWidth === desiredWidth) {
          newLeft = Math.max(0, startLeft + deltaX);
          newWidth = startLeft + startWidth - newLeft;
        } else {
          newLeft = startLeft + startWidth - newWidth;
        }
        if (newHeight === desiredHeight) {
          newTop = Math.max(0, startTop + deltaY);
          newHeight = startTop + startHeight - newTop;
        } else {
          newTop = startTop + startHeight - newHeight;
        }
      } else if (currentHandle === 'ne') {
        // Top-right: drag right/up increases size
        const desiredWidth = startWidth + deltaX;
        const desiredHeight = startHeight - deltaY;
        newWidth = Math.max(DIMENSIONS.CHAT_MIN_WIDTH, Math.min(desiredWidth, maxWidth));
        newHeight = Math.max(DIMENSIONS.CHAT_MIN_HEIGHT, Math.min(desiredHeight, maxHeight));

        // Constrain to viewport
        if (startLeft + newWidth > viewportWidth) {
          newWidth = viewportWidth - startLeft;
        }
        if (newHeight === desiredHeight) {
          newTop = Math.max(0, startTop + deltaY);
          newHeight = startTop + startHeight - newTop;
        } else {
          newTop = startTop + startHeight - newHeight;
        }
      } else if (currentHandle === 'sw') {
        // Bottom-left: drag left/down increases size
        const desiredWidth = startWidth - deltaX;
        const desiredHeight = startHeight + deltaY;
        newWidth = Math.max(DIMENSIONS.CHAT_MIN_WIDTH, Math.min(desiredWidth, maxWidth));
        newHeight = Math.max(DIMENSIONS.CHAT_MIN_HEIGHT, Math.min(desiredHeight, maxHeight));

        // Constrain to viewport
        if (newWidth === desiredWidth) {
          newLeft = Math.max(0, startLeft + deltaX);
          newWidth = startLeft + startWidth - newLeft;
        } else {
          newLeft = startLeft + startWidth - newWidth;
        }
        if (startTop + newHeight > viewportHeight) {
          newHeight = viewportHeight - startTop;
        }
      } else if (currentHandle === 'se') {
        // Bottom-right: drag right/down increases size
        const desiredWidth = startWidth + deltaX;
        const desiredHeight = startHeight + deltaY;
        newWidth = Math.max(DIMENSIONS.CHAT_MIN_WIDTH, Math.min(desiredWidth, maxWidth));
        newHeight = Math.max(DIMENSIONS.CHAT_MIN_HEIGHT, Math.min(desiredHeight, maxHeight));

        // Constrain to viewport
        if (startLeft + newWidth > viewportWidth) {
          newWidth = viewportWidth - startLeft;
        }
        if (startTop + newHeight > viewportHeight) {
          newHeight = viewportHeight - startTop;
        }
      }

      // Apply new dimensions and position
      this.elements.window.style.width = `${newWidth}px`;
      this.elements.window.style.height = `${newHeight}px`;
      this.elements.window.style.left = `${newLeft}px`;
      this.elements.window.style.top = `${newTop}px`;

      // Store size
      this.chatSize.width = newWidth;
      this.chatSize.height = newHeight;
    };

    const resizeEnd = () => {
      if (!isResizing) return;

      isResizing = false;
      currentHandle = null;

      // Remove visual feedback
      this.elements.window.style.transition = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save size to localStorage
      this.saveChatSize();

      // Update resize handle position after resize
      this.updateResizeHandle();
    };

    // Attach listeners to resize handle (only one - bottom-right corner)
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', resizeStart);
      handle.addEventListener('touchstart', resizeStart, { passive: false });
    });

    // Global resize and end events
    document.addEventListener('mousemove', resize);
    document.addEventListener('touchmove', resize, { passive: false });
    document.addEventListener('mouseup', resizeEnd);
    document.addEventListener('touchend', resizeEnd);
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