/**
 * AI Assistant HTML Templates
 * Centralized HTML generation for consistent markup
 */

(function(window) {
  'use strict';

  class Templates {
    /**
     * Generate message HTML
     * @param {string} type - Message type ('user' or 'assistant')
     * @param {string} content - Message content (already escaped)
     * @param {Object} contextType - Optional context type object with icon
     * @returns {string} Message HTML
     */
    static message(type, content, contextType = null) {
      const ICONS = window.ICONS;
      const CSS_CLASSES = window.CSS_CLASSES;
      const avatar = type === 'user' ? ICONS.USER : ICONS.ROBOT;

      // Add context badge for user messages with context type (positioned outside the message box)
      const contextBadge = (type === 'user' && contextType)
        ? `<span class="ai-message__context-badge" title="${contextType.id}">${contextType.icon}</span>`
        : '';

      return `
      <div class="${CSS_CLASSES.MESSAGE} ${CSS_CLASSES[`MESSAGE_${type.toUpperCase()}`]}${contextBadge ? ' ai-message--has-context' : ''}">
        ${contextBadge}
        <div class="${CSS_CLASSES.MESSAGE_AVATAR}">${avatar}</div>
        <div class="${CSS_CLASSES.MESSAGE_CONTENT}">${content}</div>
      </div>
    `;
    }

    /**
     * Generate typing indicator HTML
     * @returns {string} Typing indicator HTML
     */
    static typingIndicator() {
      const ICONS = window.ICONS;
      const CSS_CLASSES = window.CSS_CLASSES;
      return `
      <div class="${CSS_CLASSES.MESSAGE} ${CSS_CLASSES.MESSAGE_ASSISTANT}">
        <div class="${CSS_CLASSES.MESSAGE_AVATAR}">${ICONS.ROBOT}</div>
        <div class="${CSS_CLASSES.MESSAGE_CONTENT} ${CSS_CLASSES.MESSAGE_TYPING}">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    }

    /**
     * Generate welcome message HTML
     * @param {string} welcomeText - Welcome message text
     * @returns {string} Welcome message HTML
     */
    static welcomeMessage(welcomeText) {
      const ICONS = window.ICONS;
      const CSS_CLASSES = window.CSS_CLASSES;
      return `
      <div class="${CSS_CLASSES.MESSAGE} ${CSS_CLASSES.MESSAGE_ASSISTANT}">
        <div class="${CSS_CLASSES.MESSAGE_AVATAR}">${ICONS.ROBOT}</div>
        <div class="${CSS_CLASSES.MESSAGE_CONTENT}" data-i18n="ai.welcome">
          ${welcomeText}
        </div>
      </div>
    `;
    }

    /**
     * Generate main chat widget HTML
     * @param {Object} translations - Translation object {title, welcome, placeholder, send}
     * @returns {string} Complete widget HTML
     */
    static chatWidget(translations) {
      const ICONS = window.ICONS;
      const CSS_CLASSES = window.CSS_CLASSES;
      return `
      <div id="ai-assistant" class="ai-assistant">
        <!-- Toggle Button -->
        <button id="ai-toggle" class="${CSS_CLASSES.TOGGLE}" aria-label="Open AI Assistant">
          ${ICONS.ROBOT}
        </button>

        <!-- Chat Window -->
        <div id="ai-window" class="${CSS_CLASSES.WINDOW}">
          <!-- Resize Handles (dynamically shown based on position) -->
          <div class="ai-assistant__resize-handle ai-assistant__resize-handle--nw" data-resize="nw"></div>
          <div class="ai-assistant__resize-handle ai-assistant__resize-handle--ne" data-resize="ne"></div>
          <div class="ai-assistant__resize-handle ai-assistant__resize-handle--sw" data-resize="sw"></div>
          <div class="ai-assistant__resize-handle ai-assistant__resize-handle--se" data-resize="se"></div>

          <!-- Header -->
          <div id="ai-header" class="ai-assistant__header">
            <h3 class="ai-assistant__title">
              <span id="ai-status" class="${CSS_CLASSES.STATUS}"></span>
              <span data-i18n="ai.title">${translations.title}</span>
            </h3>
            <div class="ai-assistant__header-actions">
              <button id="ai-new-session" class="ai-assistant__new-session" aria-label="New Session" title="Start new conversation">
                <span data-i18n="ai.newSession">New</span>
              </button>
              <button id="ai-close" class="ai-assistant__close" aria-label="Close">
                ${ICONS.CLOSE_X}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div id="ai-messages" class="ai-assistant__messages">
            ${Templates.welcomeMessage(translations.welcome)}
          </div>

          <!-- Input -->
          <div class="ai-assistant__input-container">
            <div class="ai-assistant__input-wrapper">
              <div id="ai-context-tag-display" class="ai-context-tag-display"></div>
              <div
                id="ai-input"
                class="ai-assistant__input"
                contenteditable="true"
                data-placeholder="${translations.placeholder}"
                data-i18n-placeholder="ai.placeholder"
                role="textbox"
                aria-multiline="true"
              ></div>
            </div>
            <button id="ai-send" class="ai-assistant__send">
              <span data-i18n="ai.send">${translations.send}</span>
            </button>
          </div>
        </div>
      </div>
    `;
    }
  }

  window.Templates = Templates;

})(window);
