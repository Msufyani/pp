class VoiceAssistant {
    constructor() {
        this.micButton = document.getElementById('micButton');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.waveform = document.getElementById('waveform');
        this.conversationBox = document.getElementById('conversationBox');
        this.errorAlert = document.getElementById('errorAlert');

        this.recognition = null;
        this.isListening = false;
        this.synthesis = window.speechSynthesis;

        this.initializeSpeechRecognition();
        this.setupEventListeners();

        // Initialize voices
        this.voices = [];
        this.selectedVoice = null;
        this.loadVoices();

        // Handle voice loading
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        // Try to find a male English voice for variety
        this.selectedVoice = this.voices.find(voice => 
            voice.lang.includes('en-US') && voice.name.includes('Male')) || 
            this.voices.find(voice => voice.lang.includes('en-US')) || 
            this.voices[0];
    }

    initializeSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.setupRecognitionEvents();
        } else {
            this.showError('Speech recognition is not supported in this browser.');
            this.micButton.disabled = true;
        }
    }

    setupEventListeners() {
        this.micButton.addEventListener('click', () => this.toggleListening());
    }

    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI(true);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI(false);
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.processVoiceInput(transcript);
        };

        this.recognition.onerror = (event) => {
            this.showError(`Error: ${event.error}`);
            this.isListening = false;
            this.updateUI(false);
        };
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        try {
            this.recognition.start();
            this.hideError();
        } catch (error) {
            this.showError('Failed to start listening. Please try again.');
        }
    }

    stopListening() {
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    updateUI(isListening) {
        this.micButton.classList.toggle('recording', isListening);
        this.waveform.classList.toggle('active', isListening);
        this.voiceStatus.textContent = isListening ? 'Listening...' : 'Click to start speaking';
    }

    async processVoiceInput(transcript) {
        this.addMessageToConversation('user', transcript);

        try {
            const response = await fetch('/process-voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: transcript })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            this.addMessageToConversation('assistant', data.response);
            this.speakResponse(data.response);

        } catch (error) {
            this.showError(error.message);
        }
    }

    addMessageToConversation(role, message) {
        const messageElement = document.createElement('p');
        messageElement.className = `${role}-message`;
        messageElement.textContent = `${role === 'user' ? '👤' : '🤖'} ${message}`;

        this.conversationBox.appendChild(messageElement);
        this.conversationBox.scrollTop = this.conversationBox.scrollHeight;
    }

    speakResponse(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        // Clean up text by removing punctuation and special characters
        const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.selectedVoice;
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1;

        this.synthesis.speak(utterance);
    }

    showError(message) {
        this.errorAlert.textContent = message;
        this.errorAlert.classList.remove('d-none');
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorAlert.classList.add('d-none');
        this.errorAlert.textContent = '';
    }
}

// Initialize the voice assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistant();
});