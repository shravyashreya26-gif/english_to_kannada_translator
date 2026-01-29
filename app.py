import pkgutil
import importlib.util
# Python 3.14 removed pkgutil.get_loader; provide small compatibility shim used by Flask
if not hasattr(pkgutil, "get_loader"):
    class _LoaderProxy:
        def __init__(self, name):
            self.name = name
        def get_filename(self, fullname):
            spec = importlib.util.find_spec(fullname)
            if spec is None:
                raise ImportError(fullname)
            return spec.origin
    def get_loader(name):
        spec = importlib.util.find_spec(name)
        if spec is None:
            return None
        return _LoaderProxy(name)
    pkgutil.get_loader = get_loader

from flask import Flask, render_template, request, jsonify, send_file
import os
from gtts import gTTS
from io import BytesIO
import translators as ts
from datetime import datetime

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# Ensure audio folder exists
AUDIO_FOLDER = 'static/audio'
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        english_text = data.get('text', '').strip()
        
        if not english_text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Translate using google translator
        kannada_text = ts.translate_text(english_text, from_language='en', to_language='kn')
        
        return jsonify({
            'english': english_text,
            'kannada': kannada_text,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/audio', methods=['POST'])
def generate_audio():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        language = data.get('language', 'en')  # 'en' for English, 'kn' for Kannada
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Generate speech
        tts = gTTS(text=text, lang=language, slow=False)
        
        # Save to BytesIO
        audio_file = BytesIO()
        tts.write_to_fp(audio_file)
        audio_file.seek(0)
        
        return send_file(
            audio_file,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=f'audio_{language}_{datetime.now().timestamp()}.mp3'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translate-and-audio', methods=['POST'])
def translate_and_audio():
    try:
        data = request.get_json()
        english_text = data.get('text', '').strip()
        
        if not english_text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Translate
        kannada_text = ts.translate_text(english_text, from_language='en', to_language='kn')
        
        # Generate Kannada audio
        tts = gTTS(text=kannada_text, lang='kn', slow=False)
        audio_file = BytesIO()
        tts.write_to_fp(audio_file)
        audio_file.seek(0)
        
        # Convert to base64 for embedding in response
        import base64
        audio_base64 = base64.b64encode(audio_file.getvalue()).decode()
        
        return jsonify({
            'english': english_text,
            'kannada': kannada_text,
            'audio': f'data:audio/mpeg;base64,{audio_base64}',
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
