/**
 * i18n (Internationalization) Module
 * Handles language switching between English and Chinese
 *
 * Features:
 * - Automatic fallback to English if translation missing
 * - LocalStorage persistence
 * - Browser language detection
 * - Modular and easy to extend
 */

(function() {
    'use strict';

    // Default language
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'zh'];

    // Current language
    let currentLang = DEFAULT_LANG;

    /**
     * Get nested translation value
     * Example: getNestedValue({nav: {about: 'About'}}, 'nav.about') => 'About'
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Get translation for a key
     * Falls back to English if translation not found
     */
    function t(key, lang = currentLang) {
        // Try to get translation in current language
        const translations = lang === 'zh' ? window.translations_zh : window.translations_en;
        let value = getNestedValue(translations, key);

        // Fallback to English if not found
        if (!value && lang !== 'en') {
            value = getNestedValue(window.translations_en, key);
        }

        // Return key if still not found (for debugging)
        return value || `[${key}]`;
    }

    /**
     * Update all elements with data-i18n attribute
     */
    function updatePageText(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key, lang);

            // Update text content - preserve line breaks
            if (translation.includes('\n')) {
                el.innerHTML = translation.replace(/\n/g, '<br>');
            } else {
                el.textContent = translation;
            }
        });

        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = t(key, lang);
            el.setAttribute('placeholder', translation);
        });

        // Update elements with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = t(key, lang);
            el.setAttribute('title', translation);
        });

        // Update elements with data-i18n-aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            const translation = t(key, lang);
            el.setAttribute('aria-label', translation);
        });
    }

    /**
     * Update language toggle buttons
     */
    function updateLanguageToggle(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === lang) {
                btn.classList.add('lang-btn--active');
            } else {
                btn.classList.remove('lang-btn--active');
            }
        });

        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', lang);
    }

    /**
     * Set language and update page
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            console.warn(`Language "${lang}" not supported. Falling back to ${DEFAULT_LANG}`);
            lang = DEFAULT_LANG;
        }

        currentLang = lang;

        // Save to localStorage
        try {
            localStorage.setItem('language', lang);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }

        // Update page
        updatePageText(lang);
        updateLanguageToggle(lang);

        // Dispatch event for other modules to listen to
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    }

    /**
     * Get browser language preference
     */
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;

        // Check if browser language starts with supported language code
        for (const lang of SUPPORTED_LANGS) {
            if (browserLang.toLowerCase().startsWith(lang)) {
                return lang;
            }
        }

        return DEFAULT_LANG;
    }

    /**
     * Initialize i18n system
     */
    function init() {
        // Try to get language from localStorage first
        let savedLang = null;
        try {
            savedLang = localStorage.getItem('language');
        } catch (e) {
            console.warn('Could not read language preference:', e);
        }

        // Priority: localStorage > browser > default
        const initialLang = savedLang || getBrowserLanguage();

        // Set initial language
        setLanguage(initialLang);

        // Setup language toggle buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }

    // Export public API
    window.i18n = {
        t: t,
        setLanguage: setLanguage,
        getCurrentLanguage: () => currentLang,
        init: init
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
