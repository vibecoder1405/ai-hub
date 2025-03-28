# Clone Your Own Voice

A Streamlit application that allows you to clone your voice and generate speech from documents using ElevenLabs API and Google's Gemini LLM.

## Features

- Voice input through upload or direct recording
- Document upload (PDF or DOCX)
- Voice cloning using ElevenLabs API
- Text extraction from documents
- Text-to-speech generation in your cloned voice
- Audio playback and download options

## Prerequisites

- Python 3.8 or higher
- ElevenLabs API key
- Google Gemini API key
- libmagic (system library)

### Installing libmagic

#### macOS
```bash
brew install libmagic
```

#### Ubuntu/Debian
```bash
sudo apt-get install libmagic1
```

#### Windows
Download and install the libmagic DLL from: https://github.com/nscaife/file-windows

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clone-your-own-voice
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add your API keys:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

1. Run the Streamlit application:
```bash
streamlit run app.py
```

2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:8501)

3. Choose your voice input method:
   - Upload a voice sample (MP3 or WAV)
   - Record your voice directly in the browser (speak clearly for 10-15 seconds)

4. Upload a document (PDF or DOCX)

5. Wait for the voice cloning and speech generation process

6. Play the generated audio or download it as an MP3 file

## Notes

- The voice sample should be clear and contain only one speaker
- Longer voice samples (10-15 seconds) generally produce better results
- The application supports PDF and DOCX files for text extraction
- Generated audio is saved as MP3 format
- Make sure your microphone is properly configured when using the recording feature

## Troubleshooting

### Common Issues

1. **ImportError: No module named 'elevenlabs'**
   - Make sure you have installed all requirements using `pip install -r requirements.txt`

2. **ImportError: No module named 'magic'**
   - Install libmagic system library as described in the Prerequisites section

3. **API Key Errors**
   - Verify your API keys are correctly set in the `.env` file
   - Check if you have sufficient quota in your ElevenLabs account

4. **Audio Recording Issues**
   - Ensure your browser has permission to access the microphone
   - Try using a different browser if issues persist

## License

MIT License 