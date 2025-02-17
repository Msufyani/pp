# Nexus - AI Voice Assistant

A modern web-based AI voice assistant that leverages Google's Gemini API for natural language processing and the Web Speech API for voice interactions.

## Features

- 🎙️ Real-time voice recognition
- 🤖 AI-powered responses using Google Gemini
- 🔊 Natural text-to-speech output
- 💫 Smooth animations and visual feedback
- 🎨 Clean, professional UI design

## Prerequisites

- Python 3.8 or higher
- Google Gemini API key
- Modern web browser with Web Speech API support

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nexus-voice-assistant.git
cd nexus-voice-assistant
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your environment variables as described above.

4. Run the application:
```bash
python main.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Click the microphone button to start recording
2. Speak your question or command
3. Wait for the AI's voice response
4. The conversation will be displayed in the chat window

## Technologies Used

- Flask (Python web framework)
- Google Gemini API (AI language model)
- Web Speech API (Voice recognition and synthesis)
- Bootstrap 5 (UI framework)
- JavaScript (Client-side functionality)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
