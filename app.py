import os
import logging
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Initialize Gemini API
genai.configure(api_key="AIzaSyAbxt0_DtgHuQCQUvnw5Flo_8MZqyrZhOE")
model = genai.GenerativeModel('gemini-pro')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process-voice', methods=['POST'])
def process_voice():
    try:
        data = request.json
        user_input = data.get('text', '')

        if not user_input:
            return jsonify({'error': 'No input provided'}), 400

        # Generate AI response using Gemini
        response = model.generate_content(
            "You are a helpful voice assistant. Keep responses concise and natural. User says: " + user_input
        )

        ai_response = response.text
        return jsonify({'response': ai_response})

    except Exception as e:
        logging.error(f"Error processing voice input: {str(e)}")
        return jsonify({'error': 'Failed to process voice input'}), 500