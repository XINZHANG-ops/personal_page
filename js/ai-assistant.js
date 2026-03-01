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
    this.selectedImage = null; // Track selected image for upload (base64 data)

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
    this.setupImageUpload(); // Setup image upload for beer page
    this.setupDraggable();
    this.setupResizable();
    this.setupResizeHandler();

    // Set default context tag based on current page
    this.setDefaultContextTag();
  }

  applyChatDimensions() {
    // Apply chat window dimensions from saved size or constants
    this.elements.window.style.width = `${this.chatSize.width}px`;
    this.elements.window.style.height = `${this.chatSize.height}px`;
    this.elements.window.style.maxWidth = `${DIMENSIONS.CHAT_MAX_WIDTH_VW}vw`;
    this.elements.window.style.maxHeight = `${DIMENSIONS.CHAT_MAX_HEIGHT_VH}vh`;
  }

  getTranslations(lang) {
    // Always use global i18n system - all translations are in js/i18n/
    return {
      title: window.i18n.t('ai.title', lang),
      welcome: window.i18n.t('ai.welcome', lang),
      placeholder: window.i18n.t('ai.placeholder', lang),
      send: window.i18n.t('ai.send', lang),
      newSession: window.i18n.t('ai.newSession', lang),
      mentionTitle: window.i18n.t('ai.mentionTitle', lang)
    };
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

    // Add title header
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const translations = this.getTranslations(currentLang);
    const title = document.createElement('div');
    title.className = 'ai-mention-dropdown__title';
    title.setAttribute('data-i18n', 'ai.mentionTitle');
    title.textContent = translations.mentionTitle;
    dropdown.appendChild(title);

    // Add options from CONTEXT_TYPES
    CONTEXT_TYPES.forEach(type => {
      const option = document.createElement('div');
      option.className = 'ai-mention-dropdown__option';
      option.dataset.contextId = type.id;

      // Get localized label from i18n
      const label = window.i18n ? window.i18n.t(type.labelKey, currentLang) : type.id;

      option.innerHTML = `
        <span class="ai-mention-dropdown__icon">${type.icon}</span>
        <span class="ai-mention-dropdown__label" data-i18n="${type.labelKey}">${label}</span>
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
          // Allow @ anywhere, not just after space or at start
          const shouldShowDropdown = textAfterAt.trim() === '';

          if (shouldShowDropdown) {
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

    // Handle keyboard navigation in dropdown and backspace for tag deletion
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
      } else if (e.key === 'Backspace' && this.selectedContextType) {
        // If input is empty and there's a tag, delete the tag
        const content = this.elements.input.textContent.trim();
        if (content === '' || (e.target.selectionStart === 0 && e.target.selectionEnd === 0)) {
          e.preventDefault();
          this.removeContextTag();
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

    // Get current content and remove @ symbol
    const content = this.elements.input.textContent || '';
    const lastAtIndex = content.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Remove the @ from input
      const beforeAt = content.substring(0, lastAtIndex);
      const afterAtRaw = content.substring(lastAtIndex + 1);
      const afterAt = afterAtRaw.replace(/^\s*/, ''); // Remove whitespace after @
      this.elements.input.textContent = beforeAt + afterAt;

      // Display tag in the separate tag display area
      this.displayContextTag(type);

      // Focus back on input at the position where @ was
      this.elements.input.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      const textNode = this.elements.input.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const newPos = Math.min(lastAtIndex, textNode.length);
        range.setStart(textNode, newPos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  displayContextTag(type) {
    const tagDisplay = document.getElementById('ai-context-tag-display');
    if (!tagDisplay) return;

    // Get localized label from i18n
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
    const label = window.i18n ? window.i18n.t(type.labelKey, currentLang) : type.id;

    // Create the tag element
    const tag = document.createElement('span');
    tag.className = `ai-context-tag ai-context-tag--${type.id}`;
    tag.dataset.contextId = type.id;
    tag.dataset.i18n = type.labelKey;
    tag.innerHTML = `${type.icon} ${label}`;
    tag.tabIndex = -1; // Make it focusable but not in tab order

    // Clear any existing tag and add new one
    tagDisplay.innerHTML = '';
    tagDisplay.appendChild(tag);
  }

  removeContextTag() {
    const tagDisplay = document.getElementById('ai-context-tag-display');
    if (tagDisplay) {
      tagDisplay.innerHTML = '';
    }
    this.selectedContextType = null;
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

  setupImageUpload() {
    // Only show image upload on beer page
    const currentPage = this.getCurrentPageInfo();
    if (!currentPage.page_name || !currentPage.page_name.includes('beer')) {
      return; // Not on beer page, skip
    }

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/webp';
    fileInput.style.display = 'none';
    fileInput.id = 'ai-image-upload';
    document.body.appendChild(fileInput);

    // Create upload button (camera icon)
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'ai-assistant__upload-btn';
    uploadBtn.setAttribute('aria-label', 'Upload beer image');
    uploadBtn.innerHTML = '📷'; // Camera emoji
    uploadBtn.title = 'Upload beer image';

    // Insert button at the start of input wrapper (before context tag display)
    const inputWrapper = this.elements.input.closest('.ai-assistant__input-wrapper');
    if (inputWrapper) {
      inputWrapper.insertBefore(uploadBtn, inputWrapper.firstChild);
    }

    // Store references
    this.elements.imageUploadBtn = uploadBtn;
    this.elements.imageFileInput = fileInput;

    // Handle upload button click
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        alert('Image file is too large. Maximum size is 5MB.');
        fileInput.value = '';
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP).');
        fileInput.value = '';
        return;
      }

      try {
        // Compress and encode image
        const compressedBase64 = await this.compressAndEncodeImage(file);
        this.selectedImage = compressedBase64;

        // Debug: log compressed image info
        console.log('Image compressed successfully!');
        console.log('Compressed size:', compressedBase64.length, 'characters');
        console.log('Format:', compressedBase64.substring(0, 30));

        // Visual feedback: change button appearance
        uploadBtn.classList.add('ai-assistant__upload-btn--selected');
        uploadBtn.innerHTML = '✓'; // Checkmark
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again.');
        fileInput.value = '';
      }
    });
  }

  async compressAndEncodeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Compression settings
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          const QUALITY = 0.7; // JPEG quality (0-1)

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (maintain aspect ratio)
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Create canvas and draw compressed image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 JPEG
          const base64 = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(base64);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
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
    // Allow sending if either message or image exists
    if ((!message && !this.selectedImage) || this.isTyping) return;

    // Save context type and image before clearing
    const contextTypeToSend = this.selectedContextType;
    const imageToSend = this.selectedImage;

    // Debug: log what we're about to send
    console.log('Sending message with image:', imageToSend ? 'YES' : 'NO');
    if (imageToSend) {
      console.log('Image to send length:', imageToSend.length);
    }

    // Add user message with context type badge and image
    this.addMessage('user', message, contextTypeToSend, imageToSend);

    // Clear input
    this.elements.input.innerHTML = '';
    this.elements.input.style.height = 'auto';

    // Clear context type selection and tag display after sending
    this.removeContextTag();
    delete this.elements.input.dataset.contextType;

    // Clear selected image and reset upload button
    this.clearSelectedImage();

    // Disable input while processing
    this.setTyping(true);

    try {
      // Send to server with the saved context type and image
      const response = await this.sendToServer(message, contextTypeToSend, imageToSend);

      // Add AI response
      this.addMessage('assistant', response.text);

      // Handle beer recognition results if present
      if (response.beerIds && response.beerIds.length > 0) {
        this.handleBeerRecognition(response.beerIds);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', this.getErrorMessage(error));
    } finally {
      this.setTyping(false);

      // Restore default context tag based on current page after sending
      this.setDefaultContextTag();
    }
  }

  clearSelectedImage() {
    this.selectedImage = null;

    // Reset upload button if exists
    if (this.elements.imageUploadBtn) {
      this.elements.imageUploadBtn.classList.remove('ai-assistant__upload-btn--selected');
      this.elements.imageUploadBtn.innerHTML = '📷';
    }

    // Clear file input
    if (this.elements.imageFileInput) {
      this.elements.imageFileInput.value = '';
    }
  }

  handleBeerRecognition(beerIds) {
    // Check if we're on beer page and if filterBeersByPrediction function exists
    if (typeof window.filterBeersByPrediction === 'function') {
      // Call the global function to filter beers by predicted IDs
      window.filterBeersByPrediction(beerIds);
    } else {
      console.warn('Beer filtering function not available. Make sure you are on the beer page.');
    }
  }

  async sendToServer(message, contextType = null, imageData = null) {
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

    // Add image if user uploaded one
    if (imageData) {
      requestData.image = imageData;
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

      // Return object with text response and optional beer IDs
      return {
        text: data.response || data.message || MESSAGES.ERROR_PROCESSING,
        beerIds: data.beer_ids_pred || null
      };
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

  addMessage(type, content, contextType = null, imageData = null) {
    // Debug: log image data
    if (imageData) {
      console.log('Adding message with image, data length:', imageData.length);
      console.log('Image data prefix:', imageData.substring(0, 50));
    }

    // Render markdown for assistant messages, escape HTML for user messages
    const formattedContent = type === 'assistant'
      ? this.renderMarkdown(content)
      : DOMUtils.escapeHtml(content);

    // Don't pass imageData to template (we'll add it via DOM)
    const messageHTML = Templates.message(type, formattedContent, contextType, null);

    // Remove typing indicator if exists
    const typingIndicator = this.elements.messages.querySelector(`.${CSS_CLASSES.MESSAGE_TYPING}`);
    if (typingIndicator) {
      DOMUtils.removeElement(typingIndicator);
    }

    this.elements.messages.insertAdjacentHTML('beforeend', messageHTML);

    // If there's an image, add it via DOM manipulation (safer for Base64 data)
    if (imageData && type === 'user') {
      const lastMessage = this.elements.messages.lastElementChild;
      const messageContent = lastMessage.querySelector('.ai-message__content');

      if (messageContent) {
        // Create image element
        const img = document.createElement('img');
        img.className = 'ai-message__image';
        img.alt = 'Uploaded beer image';
        img.loading = 'lazy';

        // Force opacity to 1 to fix display issue
        img.style.opacity = '1';
        img.style.display = 'block';

        // Set src directly (bypasses HTML escaping issues)
        img.src = imageData;

        img.onload = () => {
          // Force opacity again after load
          img.style.opacity = '1';
          img.style.display = 'block';

          console.log('Image loaded successfully via DOM');
          console.log('Image natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          console.log('Image display size:', img.width, 'x', img.height);
          console.log('Image offsetWidth/Height:', img.offsetWidth, 'x', img.offsetHeight);

          const computedStyle = window.getComputedStyle(img);
          console.log('Image computed display:', computedStyle.display);
          console.log('Image computed visibility:', computedStyle.visibility);
          console.log('Image computed opacity:', computedStyle.opacity);
          console.log('Image computed width:', computedStyle.width);
          console.log('Image computed height:', computedStyle.height);
          console.log('Image computed maxWidth:', computedStyle.maxWidth);
          console.log('Image computed maxHeight:', computedStyle.maxHeight);
        };
        img.onerror = (e) => {
          console.error('Failed to load image via DOM', e);
          console.error('Image src length:', img.src.length);
          console.error('Image src prefix:', img.src.substring(0, 100));
        };

        // Insert image at the beginning of message content
        messageContent.insertBefore(img, messageContent.firstChild);

        console.log('Image element added to DOM');
        console.log('Image classList:', img.className);
        console.log('Parent element:', messageContent.className);
      } else {
        console.error('Could not find message content element');
      }
    }

    this.scrollToBottom();

    // Save to history (include contextType and imageData if present)
    const messageData = { type, content, timestamp: Date.now() };
    if (contextType) {
      messageData.contextType = contextType.id;
    }
    if (imageData) {
      messageData.imageData = imageData;
    }
    this.messages.push(messageData);
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

    // Only retry when disconnected to save requests
    if (!this.isConnected) {
      setTimeout(() => this.checkConnection(), this.config.reconnectInterval);
    }
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
        // Restore context type if saved
        let contextType = null;
        if (msg.contextType) {
          contextType = CONTEXT_TYPES.find(ct => ct.id === msg.contextType);
        }
        // Restore image data if saved
        const imageData = msg.imageData || null;
        this.addMessage(msg.type, msg.content, contextType, imageData);
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

    // Clear any context tag and restore default based on current page
    this.removeContextTag();
    this.setDefaultContextTag();
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

  setDefaultContextTag() {
    const pageInfo = this.getCurrentPageInfo();
    const pageName = pageInfo.page_name;

    // Map page names to context types
    const pageToContextMap = {
      'beer-ratings': 'beer',
      'beer': 'beer'
      // Add more mappings as needed
    };

    // Check if current page has a default context type
    const defaultContextId = pageToContextMap[pageName];
    if (defaultContextId) {
      const contextType = CONTEXT_TYPES.find(ct => ct.id === defaultContextId);
      if (contextType) {
        this.selectedContextType = contextType;
        this.displayContextTag(contextType);
      }
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

      // Update mention dropdown options
      if (this.elements.mentionDropdown) {
        const labels = this.elements.mentionDropdown.querySelectorAll('.ai-mention-dropdown__label');
        labels.forEach(label => {
          const i18nKey = label.getAttribute('data-i18n');
          if (i18nKey) {
            label.textContent = window.i18n.t(i18nKey, lang);
          }
        });
      }

      // Update displayed context tag if one is selected
      if (this.selectedContextType) {
        this.displayContextTag(this.selectedContextType);
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