// DOM Elements
const englishText = document.getElementById('englishText');
const kannadadText = document.getElementById('kannadadText');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakEnglishBtn = document.getElementById('speakEnglishBtn');
const speakKannadaBtn = document.getElementById('speakKannadaBtn');
const downloadBtn = document.getElementById('downloadBtn');
const charCount = document.getElementById('charCount');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Store translated text
let currentTranslation = null;

// Update character count
englishText.addEventListener('input', () => {
    charCount.textContent = englishText.value.length;
});

// Translate on Enter key
englishText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        translate();
    }
});

// Clear button
clearBtn.addEventListener('click', () => {
    englishText.value = '';
    kannadadText.textContent = '';
    charCount.textContent = '0';
    copyBtn.disabled = true;
    speakKannadaBtn.disabled = true;
    downloadBtn.disabled = true;
    currentTranslation = null;
    hideMessages();
});

// Translate button
translateBtn.addEventListener('click', translate);

// Copy button
copyBtn.addEventListener('click', () => {
    if (currentTranslation) {
        navigator.clipboard.writeText(currentTranslation).then(() => {
            showMessage('Translation copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy', 'error');
        });
    }
});

// Speak English
speakEnglishBtn.addEventListener('click', () => {
    if (englishText.value.trim()) {
        speak(englishText.value, 'en');
    } else {
        showMessage('Please enter English text', 'error');
    }
});

// Speak Kannada
speakKannadaBtn.addEventListener('click', () => {
    if (currentTranslation) {
        speak(currentTranslation, 'kn');
    }
});

// Download audio
downloadBtn.addEventListener('click', async () => {
    if (currentTranslation) {
        await downloadAudio(currentTranslation, 'kn');
    }
});

// Main translate function
async function translate() {
    const text = englishText.value.trim();
    
    if (!text) {
        showMessage('Please enter English text', 'error');
        return;
    }
    
    showLoading(true);
    hideMessages();
    
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        
        if (data.success) {
            kannadadText.textContent = data.kannada;
            currentTranslation = data.kannada;
            copyBtn.disabled = false;
            speakKannadaBtn.disabled = false;
            downloadBtn.disabled = false;
            showMessage('Translation successful!', 'success');
        } else {
            showMessage(data.error || 'Translation failed', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
        console.error('Translation error:', error);
    } finally {
        showLoading(false);
    }
}

// Speak function using Web Speech API
function speak(text, language) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    if (language === 'kn') {
        utterance.lang = 'kn-IN';
    } else {
        utterance.lang = 'en-US';
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
}

// Download audio as MP3
async function downloadAudio(text, language) {
    showLoading(true);
    
    try {
        const response = await fetch('/audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: text,
                language: language 
            })
        });
        
        if (!response.ok) {
            throw new Error('Audio generation failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translation_${language}_${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage('Audio downloaded successfully!', 'success');
    } catch (error) {
        showMessage('Error downloading audio: ' + error.message, 'error');
        console.error('Download error:', error);
    } finally {
        showLoading(false);
    }
}

// Show/hide loading
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Show message
function showMessage(message, type) {
    hideMessages();
    
    if (type === 'success') {
        successMessage.textContent = message;
        successMessage.classList.remove('hidden');
        setTimeout(() => hideMessages(), 3000);
    } else if (type === 'error') {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => hideMessages(), 4000);
    }
}

// Hide messages
function hideMessages() {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Initialize
window.addEventListener('load', () => {
    console.log('Translator initialized');
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synthesis = window.speechSynthesis;
    
    if (!synthesis) {
        console.warn('Speech Synthesis API not supported');
    }
});
