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
        // Try to find a clear, professional English voice
        this.selectedVoice = this.voices.find(voice =>
            voice.lang.includes('en-GB') && voice.name.includes('Male')) ||
            this.voices.find(voice => voice.lang.includes('en-US') && !voice.name.includes('Female')) ||
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
            await this.speakResponse(data.response);

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

    async speakResponse(text) {
        // Split text into sentences for better speech synthesis
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);

        for (let sentence of sentences) {
            await this.speakSentence(sentence);
        }
    }

    speakSentence(text) {
        return new Promise((resolve) => {
            // Cancel any ongoing speech
            this.synthesis.cancel();

            // Clean up text by removing special characters and normalizing punctuation
            const cleanText = text.trim()
                .replace(/[!?]+/g, '.') // Replace multiple exclamation/question marks with period
                .replace(/\.+/g, '.') // Replace multiple periods with single one
                .replace(/\s+/g, ' '); // Normalize spaces

            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Try to find a clear, natural-sounding voice
            if (!this.selectedVoice) {
                this.loadVoices();
            }
            utterance.voice = this.selectedVoice;

            // Adjust speech parameters for more natural sound
            utterance.rate = 1.1;      // Slightly faster than default
            utterance.pitch = 1.0;     // Natural pitch
            utterance.volume = 1;      // Full volume

            utterance.onend = () => {
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                resolve();
            };

            this.synthesis.speak(utterance);
        });
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