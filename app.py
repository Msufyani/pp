import os
import logging
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Initialize OpenAI client
# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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

        # Generate AI response using OpenAI
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful voice assistant. Keep responses concise and natural."},
                {"role": "user", "content": user_input}
            ],
            max_tokens=150
        )

        ai_response = response.choices[0].message.content
        return jsonify({'response': ai_response})

    except Exception as e:
        logging.error(f"Error processing voice input: {str(e)}")
        return jsonify({'error': 'Failed to process voice input'}), 500
