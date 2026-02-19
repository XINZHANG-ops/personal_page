/**
 * AI Assistant Configuration
 *
 * This file manages the server URL for the AI assistant.
 * Update the SERVER_URL based on your deployment environment.
 */

// Configuration options:
const AI_CONFIG = {
  // For local development (when opening file:// or http://localhost)
  LOCAL: 'http://localhost:8080/chat',

  // For GitHub Pages with ngrok tunnel (update with your ngrok URL)
  NGROK: 'https://04f1-99-250-110-81.ngrok-free.app/chat',  // Your actual ngrok URL

  // For production with a proper backend
  PRODUCTION: 'https://your-api-server.com/chat'  // UPDATE THIS!
};

// Auto-detect environment and set appropriate URL
function getAIServerURL() {
  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    console.log('AI Assistant: Using local server');
    return AI_CONFIG.LOCAL;
  }

  // GitHub Pages (github.io domain)
  if (hostname.includes('github.io')) {
    console.log('AI Assistant: Using ngrok tunnel for GitHub Pages');
    // IMPORTANT: Update NGROK URL above with your actual ngrok URL!
    return AI_CONFIG.NGROK;
  }

  // Custom domain or production
  console.log('AI Assistant: Using production server');
  return AI_CONFIG.PRODUCTION;
}

// Export configuration
window.AI_SERVER_CONFIG = {
  serverUrl: getAIServerURL(),

  // Helper to update URL dynamically (useful for testing)
  setServerUrl: function(url) {
    this.serverUrl = url;
    console.log('AI Assistant: Server URL updated to', url);
  },

  // Check if we're on GitHub Pages
  isGitHubPages: function() {
    return window.location.hostname.includes('github.io');
  }
};
