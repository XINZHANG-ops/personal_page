#!/usr/bin/env python3
"""
Simple AI Server for Portfolio Website with Session Management
===============================================================

This server provides a dummy AI assistant with session management
so multiple users can chat without their conversations mixing.

To run:
    python server.py

The server will run on http://localhost:8080
"""

import json
import uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for your GitHub Pages domain
CORS(app, origins=["*"], supports_credentials=True)

# Store user sessions in memory (in production, use Redis or a database)
sessions = {}

# Session timeout (30 minutes)
SESSION_TIMEOUT = timedelta(minutes=30)

def get_or_create_session(session_id=None):
    """Get existing session or create a new one"""
    current_time = datetime.now()

    # Clean up expired sessions
    expired_sessions = []
    for sid, session in sessions.items():
        if current_time - session['last_activity'] > SESSION_TIMEOUT:
            expired_sessions.append(sid)
    for sid in expired_sessions:
        del sessions[sid]
        logger.info(f"Expired session: {sid}")

    # Get or create session
    if session_id and session_id in sessions:
        session = sessions[session_id]
        session['last_activity'] = current_time
        logger.info(f"Using existing session: {session_id}")
    else:
        session_id = str(uuid.uuid4())
        session = {
            'id': session_id,
            'created': current_time,
            'last_activity': current_time,
            'message_count': 0,
            'context': []
        }
        sessions[session_id] = session
        logger.info(f"Created new session: {session_id}")

    return session_id, session

def generate_dummy_response(message, session):
    """Generate a dummy response based on the message"""
    message_lower = message.lower()

    # Increment message count for this session
    session['message_count'] += 1

    # Store message in session context (keep last 10 messages)
    session['context'].append({'role': 'user', 'content': message})
    if len(session['context']) > 20:  # Keep last 10 exchanges (20 messages)
        session['context'] = session['context'][-20:]

    # Dummy responses based on keywords
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        response = f"Hello! I'm Xin's AI assistant. This is message #{session['message_count']} in our conversation. How can I help you learn about his work?"

    elif 'project' in message_lower:
        response = "Xin has worked on several exciting AI/ML projects including computer vision, NLP, and deep learning applications. Check out the Projects section for detailed information!"

    elif 'experience' in message_lower or 'work' in message_lower:
        response = "Xin is a Senior AI/ML Engineer with extensive experience in machine learning, deep learning, and data science. He has worked on projects ranging from recommendation systems to computer vision applications."

    elif 'skill' in message_lower:
        response = "Xin's technical skills include Python, TensorFlow, PyTorch, scikit-learn, SQL, and cloud platforms like AWS and GCP. He's also proficient in software engineering practices and MLOps."

    elif 'education' in message_lower or 'study' in message_lower:
        response = "Xin has a strong educational background in computer science and mathematics, with specialized training in machine learning and artificial intelligence."

    elif 'contact' in message_lower:
        response = "You can reach Xin through the contact form on the website or connect via LinkedIn and GitHub. His email is xinzhang940208@gmail.com."

    elif 'research' in message_lower or 'paper' in message_lower:
        response = "Xin is passionate about AI research, particularly in areas like neural networks, computer vision, and NLP. Check out the Writing section for his paper readings and technical blog posts."

    elif 'beer' in message_lower:
        response = "Ah, you found the beer section! Xin enjoys craft beer and has created a detailed scoring system to track his favorites. It's a fun data visualization project!"

    elif any(word in message_lower for word in ['who are you', 'what are you', 'your name']):
        response = f"I'm an AI assistant for Xin Zhang's portfolio website. I'm currently in demo mode. You're in session {session['id'][:8]}... with {session['message_count']} messages so far."

    elif 'session' in message_lower or 'conversation' in message_lower:
        response = f"Your session ID is {session['id'][:8]}... You've sent {session['message_count']} messages in this conversation. Your session will remain active for 30 minutes of inactivity."

    else:
        # Default response with session info
        responses = [
            f"That's an interesting question! (Message #{session['message_count']} in this session)",
            f"I'm in demo mode right now, but I understand you're asking about: {message[:50]}...",
            f"Thanks for message #{session['message_count']}! In a full implementation, I would provide detailed information about that topic.",
            "I'm a simple demo assistant. Xin will implement the real AI backend later!",
            f"Session {session['id'][:8]}: I see you're interested in that topic. Check out the relevant sections on the website for more details!"
        ]
        response = responses[session['message_count'] % len(responses)]

    # Add response to session context
    session['context'].append({'role': 'assistant', 'content': response})

    return response

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'mode': 'demo',
        'active_sessions': len(sessions),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Main chat endpoint with session management"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response('', 204)
        return response

    try:
        data = request.json
        message = data.get('message', '')
        context = data.get('context', {})

        # Get session ID from request (could be from cookie, header, or request body)
        session_id = data.get('session_id', None)

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Get or create session
        session_id, session = get_or_create_session(session_id)

        # Generate response
        response_text = generate_dummy_response(message, session)

        # Log the interaction
        logger.info(f"Session {session_id[:8]}: User: {message[:50]}...")
        logger.info(f"Session {session_id[:8]}: Bot: {response_text[:50]}...")

        # Return response with session ID
        response = jsonify({
            'response': response_text,
            'session_id': session_id,
            'message_count': session['message_count'],
            'timestamp': datetime.now().isoformat()
        })

        return response

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session information"""
    if session_id in sessions:
        session = sessions[session_id]
        return jsonify({
            'session_id': session_id,
            'created': session['created'].isoformat(),
            'last_activity': session['last_activity'].isoformat(),
            'message_count': session['message_count'],
            'context_length': len(session['context'])
        })
    else:
        return jsonify({'error': 'Session not found'}), 404

@app.route('/sessions', methods=['GET'])
def list_sessions():
    """List all active sessions (for debugging)"""
    session_list = []
    for sid, session in sessions.items():
        session_list.append({
            'session_id': sid[:8] + '...',
            'message_count': session['message_count'],
            'last_activity': session['last_activity'].isoformat()
        })

    return jsonify({
        'active_sessions': len(sessions),
        'sessions': session_list
    })

def main():
    print("""
    ╔══════════════════════════════════════════════╗
    ║   Portfolio AI Assistant Server (Demo Mode)  ║
    ╚══════════════════════════════════════════════╝

    Server Configuration:
    - Mode: Demo (Dummy responses)
    - Port: 8080
    - Session timeout: 30 minutes
    - CORS: Enabled for all origins

    Endpoints:
    - POST   /chat           - Send a message
    - GET    /health         - Health check
    - GET    /session/<id>   - Get session info
    - GET    /sessions       - List all sessions

    Session Management:
    - Each user gets a unique session ID
    - Sessions expire after 30 minutes of inactivity
    - Conversations are isolated per session

    Server running at: http://localhost:8080

    Test with curl:
    curl -X POST http://localhost:8080/chat \\
         -H "Content-Type: application/json" \\
         -d '{"message": "Hello"}'

    Press Ctrl+C to stop the server.
    """)

    # Run server
    app.run(host='0.0.0.0', port=8080, debug=False)

if __name__ == '__main__':
    main()