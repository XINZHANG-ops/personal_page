# AI Assistant Configuration Guide

This guide explains how to customize the AI Assistant widget by modifying the configuration constants.

## 📁 File Overview

The AI Assistant is split into modular files for easy customization:

```
js/
├── ai-assistant-constants.js    ← 🎯 MAIN SETTINGS FILE (start here!)
├── ai-assistant-storage.js      ← Storage utilities (rarely need to change)
├── ai-assistant-positioning.js  ← Position calculations (rarely need to change)
├── ai-assistant-templates.js    ← HTML templates (rarely need to change)
├── ai-assistant-dom-utils.js    ← DOM helpers (rarely need to change)
├── ai-assistant-config.js       ← Server URL configuration
└── ai-assistant.js              ← Main logic (rarely need to change)
```

## 🎨 Most Common Customizations

### 1. Change Icons

**File:** `js/ai-assistant-constants.js`

Look for `window.AI_CONSTANTS = {` and find the `ICONS` section:

```javascript
ICONS: {
  ROBOT: '🤖',      // ← Change this to any emoji you want
  USER: '👤',       // ← User avatar icon
  CLOSE_X: '×',     // ← Close button (small X)
  CLOSE_CROSS: '✕'  // ← Close button on toggle (large X)
}
```

**Examples:**
- Robot alternatives: `'🤖'`, `'🦾'`, `'🧠'`, `'💬'`, `'🎯'`, `'⚡'`, `'🚀'`
- User alternatives: `'👤'`, `'👨'`, `'👩'`, `'😊'`, `'🙋'`

### 2. Adjust Chat Window Size

**File:** `js/ai-assistant-constants.js`

```javascript
DIMENSIONS: {
  CHAT_WIDTH: 380,      // ← Width of chat window in pixels
  CHAT_HEIGHT: 500,     // ← Height of chat window in pixels
  POSITION_GAP: 5,      // ← Gap between toggle and chat window
  DRAG_THRESHOLD: 5,    // ← How many pixels before drag starts
  // ...
}
```

**Common adjustments:**
- Larger chat: `CHAT_WIDTH: 450`, `CHAT_HEIGHT: 600`
- Smaller chat: `CHAT_WIDTH: 320`, `CHAT_HEIGHT: 400`
- More space from toggle: `POSITION_GAP: 10`

### 3. Change Toggle Button Size

**File:** `js/ai-assistant-constants.js`

```javascript
DIMENSIONS: {
  // ...
  TOGGLE_WIDTH: 60,           // ← Toggle button width (desktop)
  TOGGLE_HEIGHT: 60,          // ← Toggle button height (desktop)
  TOGGLE_WIDTH_MOBILE: 50,    // ← Toggle button width (mobile)
  TOGGLE_HEIGHT_MOBILE: 50,   // ← Toggle button height (mobile)
  TOGGLE_FONT_SIZE: 28,       // ← Icon size (desktop)
  TOGGLE_FONT_SIZE_MOBILE: 24,// ← Icon size (mobile)
  // ...
}
```

**Examples:**
- Larger toggle: `TOGGLE_WIDTH: 70`, `TOGGLE_HEIGHT: 70`, `TOGGLE_FONT_SIZE: 32`
- Smaller toggle: `TOGGLE_WIDTH: 50`, `TOGGLE_HEIGHT: 50`, `TOGGLE_FONT_SIZE: 24`

### 4. Adjust Timing/Speed

**File:** `js/ai-assistant-constants.js`

```javascript
TIMING: {
  RECONNECT_INTERVAL: 5000,  // ← How often to check server (ms)
  RESIZE_DEBOUNCE: 50,       // ← Delay before repositioning on resize (ms)
  DRAG_RESET_DELAY: 100,     // ← Delay after drag ends (ms)
  TYPING_ANIMATION: 1400     // ← Typing indicator speed (ms)
}
```

**Common adjustments:**
- Faster server checks: `RECONNECT_INTERVAL: 3000` (3 seconds)
- Smoother resize: `RESIZE_DEBOUNCE: 100` (slower but smoother)

### 5. Change Message Limits

**File:** `js/ai-assistant-constants.js`

```javascript
LIMITS: {
  MAX_MESSAGES: 50,        // ← Max messages in memory before cleanup
  CHAT_HISTORY_LIMIT: 10   // ← Max messages saved to localStorage
}
```

**Examples:**
- Store more history: `MAX_MESSAGES: 100`, `CHAT_HISTORY_LIMIT: 20`
- Use less memory: `MAX_MESSAGES: 30`, `CHAT_HISTORY_LIMIT: 5`

### 6. Update Error Messages

**File:** `js/ai-assistant-constants.js`

```javascript
MESSAGES: {
  ERROR_CONNECTION: "I'm offline right now. Please make sure the AI server is running locally on port 8080.",
  ERROR_GENERIC: "Sorry, I encountered an error. Please try again later.",
  ERROR_PROCESSING: "I couldn't process that request."
}
```

**Customize to match your brand:**
```javascript
MESSAGES: {
  ERROR_CONNECTION: "Can't connect to the AI server. Is it running?",
  ERROR_GENERIC: "Oops! Something went wrong. Please try again.",
  ERROR_PROCESSING: "I didn't understand that. Can you rephrase?"
}
```

### 7. Change User Context Information

**File:** `js/ai-assistant-constants.js`

```javascript
CONTEXT_INFO: {
  name: "Xin Zhang",                                          // ← Your name
  role: "Senior AI/ML Engineer",                              // ← Your role
  expertise: ["Machine Learning", "Deep Learning", ...],       // ← Your skills
  languages: ["Python", "JavaScript", "SQL", "Bash"],         // ← Programming languages
  location: "Waterloo, ON"                                    // ← Your location
}
```

**This information is sent to the AI server with each message to provide context.**

### 8. Configure Server URL

**File:** `js/ai-assistant-config.js` (different file!)

```javascript
const AI_CONFIG = {
  LOCAL: 'http://localhost:8080/chat',           // ← Local development
  NGROK: 'https://your-id.ngrok-free.app/chat',  // ← ngrok tunnel for GitHub Pages
  PRODUCTION: 'https://your-api-server.com/chat' // ← Production server
};
```

**The config automatically detects your environment:**
- `localhost` → Uses `LOCAL`
- `github.io` → Uses `NGROK`
- Other domains → Uses `PRODUCTION`

## 🎨 Advanced Customizations

### Change CSS Class Names

**File:** `js/ai-assistant-constants.js`

Only change these if you're also modifying `css/ai-assistant.css`:

```javascript
CSS_CLASSES: {
  WINDOW: 'ai-assistant__window',
  WINDOW_OPEN: 'ai-assistant__window--open',
  TOGGLE: 'ai-assistant__toggle',
  // ... etc
}
```

### Modify API Endpoints

**File:** `js/ai-assistant-constants.js`

```javascript
API_CONFIG: {
  DEFAULT_SERVER_URL: 'http://localhost:8080/chat',  // ← Default server URL
  HEALTH_ENDPOINT: '/health',                        // ← Health check endpoint
  CHAT_ENDPOINT: '/chat'                             // ← Chat endpoint
}
```

## 📝 Editing Tips

### ✅ DO:
- Change icon emojis to personalize your assistant
- Adjust dimensions to fit your design
- Update context info to match your profile
- Modify error messages to match your brand voice
- Test changes by refreshing your browser

### ❌ DON'T:
- Remove required constants (you'll get errors)
- Change constant names (other files depend on them)
- Modify files other than `ai-assistant-constants.js` unless you know what you're doing
- Forget to save after making changes

## 🔄 After Making Changes

1. **Save the file** (`js/ai-assistant-constants.js`)
2. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R to clear cache)
3. **Test the changes** - open the chat widget and verify it works
4. **Check browser console** for errors (F12 → Console tab)

## 🐛 Troubleshooting

### Toggle button disappeared?
- Check browser console for errors (F12)
- Make sure all script files are loading (check Network tab)
- Verify you didn't break JavaScript syntax (missing comma, quote, etc.)

### Icons not showing?
- Some emojis may not display on all devices
- Try a different emoji
- Clear browser cache and reload

### Chat window too big/small?
- Adjust `CHAT_WIDTH` and `CHAT_HEIGHT` in `DIMENSIONS`
- Remember the window also respects `90vw` and `70vh` max sizes

### Position issues after dragging?
- Adjust `POSITION_GAP` to change spacing
- Adjust `DRAG_THRESHOLD` if dragging is too sensitive

## 📚 Related Files

If you need to make deeper customizations:

- **`css/ai-assistant.css`** - Visual styling (colors, fonts, animations)
- **`js/ai-assistant-templates.js`** - HTML structure of messages and widget
- **`js/ai-assistant.js`** - Main logic and behavior

## 💡 Common Use Cases

### Making it your own brand:
1. Change `CONTEXT_INFO` to your information
2. Pick an icon that represents you/your brand
3. Adjust `CHAT_WIDTH` and `CHAT_HEIGHT` to fit your design
4. Customize error messages to match your voice

### Making it more/less chatty:
1. Increase `MAX_MESSAGES` for longer conversations
2. Increase `CHAT_HISTORY_LIMIT` to remember more across sessions
3. Decrease both to save memory/storage

### Optimizing for mobile:
1. Make `CHAT_WIDTH` smaller (e.g., 320px)
2. Make `TOGGLE_WIDTH_MOBILE` smaller (e.g., 45px)
3. Reduce `CHAT_HEIGHT` for more screen space

### Performance tuning:
1. Increase `RECONNECT_INTERVAL` to check server less often
2. Increase `RESIZE_DEBOUNCE` for less frequent position updates
3. Reduce `MAX_MESSAGES` to use less memory

## 🎓 Quick Examples

### Example 1: Professional Corporate Style
```javascript
ICONS: {
  ROBOT: '💼',  // Briefcase instead of robot
  USER: '👤',
  CLOSE_X: '×',
  CLOSE_CROSS: '✕'
},
DIMENSIONS: {
  CHAT_WIDTH: 400,   // Slightly larger
  CHAT_HEIGHT: 550,  // Taller for more messages
  TOGGLE_WIDTH: 65,  // Bigger button
  TOGGLE_HEIGHT: 65,
}
```

### Example 2: Fun & Friendly Style
```javascript
ICONS: {
  ROBOT: '🎉',  // Party emoji
  USER: '😊',   // Smile emoji
  CLOSE_X: '×',
  CLOSE_CROSS: '👋'  // Wave goodbye
},
MESSAGES: {
  ERROR_CONNECTION: "Oops! Can't find the server. Is it taking a coffee break? ☕",
  ERROR_GENERIC: "Whoops! Something went wrong. Let's try that again! 🔄",
  ERROR_PROCESSING: "Hmm, I didn't quite get that. Can you try again? 🤔"
}
```

### Example 3: Minimalist Style
```javascript
ICONS: {
  ROBOT: '•',   // Simple dot
  USER: '○',    // Circle
  CLOSE_X: '×',
  CLOSE_CROSS: '–'
},
DIMENSIONS: {
  CHAT_WIDTH: 320,   // Compact
  CHAT_HEIGHT: 450,
  TOGGLE_WIDTH: 50,  // Small button
  TOGGLE_HEIGHT: 50,
  POSITION_GAP: 2    // Tight spacing
}
```

## 🚀 Next Steps

1. Open `js/ai-assistant-constants.js`
2. Find the section you want to customize (use the examples above)
3. Make your changes
4. Save and refresh your browser
5. Enjoy your personalized AI assistant!

---

**Need more help?** Check out:
- `REFACTORING_SUMMARY.md` - Understanding the code structure
- `ARCHITECTURE.md` - Deep dive into how everything works
- `MIGRATION_GUIDE.md` - Examples of code changes

**Pro tip:** Make one change at a time and test it before making another. This makes it easier to find issues!
