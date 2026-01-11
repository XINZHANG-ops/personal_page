# AI Assistant Setup for GitHub Pages

## The Problem
- GitHub Pages serves your site over **HTTPS** (secure)
- Your local server runs on **HTTP** (not secure)
- Browsers block HTTPS → HTTP connections (mixed content)

## Solutions

### Option 1: ngrok Tunnel (Recommended for Testing)

1. **Install ngrok:**
   ```bash
   # Mac
   brew install ngrok

   # Or download from
   https://ngrok.com/download
   ```

2. **Start your local AI server:**
   ```bash
   python ai-server/server.py
   ```

3. **Create secure tunnel:**
   ```bash
   ngrok http 8080
   ```

4. **Update configuration:**
   - ngrok will give you a URL like: `https://abc123.ngrok.io`
   - Edit `js/ai-assistant-config.js`
   - Change line 14 to your ngrok URL:
   ```javascript
   NGROK: 'https://abc123.ngrok.io/chat',  // Your actual ngrok URL
   ```

5. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update AI assistant ngrok URL"
   git push
   ```

### Option 2: Local HTTPS with mkcert (More Permanent)

1. **Install mkcert:**
   ```bash
   brew install mkcert
   mkcert -install
   ```

2. **Generate certificates:**
   ```bash
   cd ai-server
   mkcert localhost 127.0.0.1
   ```

3. **Update server.py to use HTTPS:**
   ```python
   # Add at the end of server.py
   if __name__ == '__main__':
       app.run(
           host='0.0.0.0',
           port=8080,
           ssl_context=('localhost.pem', 'localhost-key.pem')
       )
   ```

4. **Update config to use HTTPS:**
   ```javascript
   LOCAL: 'https://localhost:8080/chat',
   ```

### Option 3: Deploy AI Server to Cloud (Production)

Deploy your server to:
- **Heroku** (free tier available)
- **Railway** (easy deployment)
- **AWS Lambda** (serverless)
- **Google Cloud Run** (containerized)

Then update `PRODUCTION` URL in config.

## Quick Test

1. **Local testing (works out of the box):**
   - Open `file:///path/to/index.html`
   - Or use `python -m http.server 8000`
   - AI assistant connects to `localhost:8080`

2. **GitHub Pages testing:**
   - Must use ngrok or cloud deployment
   - Check browser console for connection status

## Security Notes

- **ngrok URLs change** each time you restart (free tier)
- **Don't commit API keys** if you add real AI later
- **Consider IP whitelisting** in production
- **Use environment variables** for sensitive data

## Troubleshooting

### "Mixed Content Blocked"
- You're trying HTTP from HTTPS
- Solution: Use ngrok or HTTPS

### "Connection Refused"
- Server not running
- Wrong port
- Firewall blocking

### "CORS Error"
- Update `CORS(app, origins=["*"])` in server.py
- Or specify your GitHub Pages URL

## Testing Multiple Users

1. Open your GitHub Pages site in:
   - Chrome normal window
   - Chrome incognito
   - Firefox
   - Safari

2. Each browser gets its own session ID

3. Check server logs to see different sessions:
   ```
   Session abc123: User: Hello
   Session xyz789: User: Hi there
   ```

## Commands Reference

```bash
# Start AI server
python ai-server/server.py

# Start ngrok tunnel
ngrok http 8080

# Check active sessions
curl http://localhost:8080/sessions

# Test from command line
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```