# AI Assistant Server for Portfolio Website

This server provides an AI assistant chatbot for your static GitHub Pages portfolio site.

## Architecture

```
[GitHub Pages] ---> [User's Browser] ---> [Local AI Server (port 8080)]
     (Static)          (JavaScript)           (Python + AI Model)
```

## Quick Start

### Option 1: Demo Mode (No AI, just for testing)

```bash
cd ai-server
python server.py --mode demo
```

### Option 2: OpenAI API (Recommended for best results)

1. Get an API key from https://platform.openai.com/api-keys

2. Install dependencies:
```bash
pip install flask flask-cors openai python-dotenv
```

3. Create `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

4. Run:
```bash
python server.py --mode openai
```

### Option 3: Ollama (100% Local, Free)

1. Install Ollama from https://ollama.ai

2. Pull a model:
```bash
ollama pull llama2  # 7B parameters, ~4GB
# or
ollama pull mistral  # Faster, good quality
# or
ollama pull phi  # Smallest, ~2GB
```

3. Install dependencies:
```bash
pip install flask flask-cors requests
```

4. Run:
```bash
python server.py --mode ollama
```

### Option 4: Hugging Face Transformers (Local)

1. Install dependencies:
```bash
pip install flask flask-cors transformers torch
```

2. Run:
```bash
python server.py --mode transformers
```

## How It Works

1. **User visits your GitHub Pages site** - The static site loads with the chat widget
2. **User types a message** - JavaScript sends the message to `localhost:8080`
3. **Local server processes** - Your Python server (running locally) generates a response
4. **Response sent back** - The chat widget displays the AI response

## Security Notes

- The server only accepts requests from localhost by default
- In production, update CORS settings to only allow your GitHub Pages domain
- Never commit API keys to GitHub

## Customization

Edit `server.py` to:
- Add custom responses based on your portfolio content
- Integrate with different AI models
- Add memory/conversation history
- Connect to a vector database for RAG (Retrieval Augmented Generation)

## Troubleshooting

### "Connection refused" error
- Make sure the server is running (`python server.py`)
- Check if port 8080 is available: `lsof -i :8080`

### CORS errors
- The server has CORS enabled for all origins by default
- For production, update the CORS origins in `server.py`

### Ollama not working
- Make sure Ollama is running: `ollama serve`
- Check if model is downloaded: `ollama list`

## Advanced Setup (Optional)

### Using with ngrok (Share with others)

1. Install ngrok: https://ngrok.com/download
2. Run your server: `python server.py`
3. In another terminal: `ngrok http 8080`
4. Update `js/ai-assistant.js` with the ngrok URL
5. Now anyone can use your AI assistant!

### Using with a VPS/Cloud Server

1. Deploy `server.py` to a cloud provider (AWS, DigitalOcean, etc.)
2. Update `js/ai-assistant.js` with your server URL
3. Add SSL certificate for HTTPS
4. Update CORS settings for security

## Model Recommendations

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| GPT-3.5 | API | Fast | Excellent | Best overall |
| Llama2-7B | 4GB | Medium | Good | Balanced local |
| Mistral-7B | 4GB | Fast | Good | Fast local |
| Phi-2 | 2GB | Fast | Decent | Low-resource |
| DialoGPT | 1GB | Fast | Basic | Minimum viable |