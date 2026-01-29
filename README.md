# English → Kannada Translator

Small Flask web app that translates English text to Kannada and generates Kannada audio.

Files included:
- `app.py` — Flask application with translation and TTS.
- `templates/index.html` — HTML UI.
- `static/css/style.css` — styles.
- `static/js/main.js` — small JS helper.
- `requirements.txt` — Python dependencies.
- `README_TRANSLATOR.md` — additional notes.

Quick start (PowerShell):

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 in your browser, paste English text and click "Translate". If translation succeeds an audio player will appear to play the generated Kannada MP3.

Notes:
- The app uses `deep-translator` for translation and `gTTS` for Kannada TTS. Results depend on those services.
- Generated MP3 files are stored in `static/audio`. Remove old files periodically if needed.
- If you want higher-quality TTS or an API-key based translator (Google Cloud, AWS Polly), I can update the app to use those.
# english_to_kannada_translator