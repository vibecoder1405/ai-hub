# YouTube Transcript Summarizer & Translator

A powerful application that allows you to:
1. Extract transcripts from YouTube videos
2. Generate concise summaries with customizable length
3. Translate content into multiple languages
4. View full transcripts with automatic language detection

## Features
- Automatic language detection
- User-defined summary length (50-500 words)
- Support for multiple target languages
- Clean and intuitive Streamlit interface
- Powered by Google's Gemini AI model
- Tab-based interface for easy navigation between summary and full transcript
- Flexible API key configuration (via .env file or UI)

## Prerequisites
- Python 3.7 or higher
- Google API key for Gemini AI

## Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd youtube-summarizer
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Configure your Google Gemini API Key (choose one method):

   a. Using .env file (recommended for development):
   ```
   Create a .env file in the project root and add:
   GOOGLE_API_KEY=your_api_key_here
   ```

   b. Using the application UI:
   - Run the application
   - Click on "API Key Settings" in the sidebar
   - Enter your API key in the secure input field

## Usage

1. Run the Streamlit application:
```bash
streamlit run main.py
```

2. Open your web browser and navigate to the URL shown in the terminal (typically http://localhost:8501)

3. In the application:
   - Configure your API key if not using .env file
   - Enter a YouTube URL in the sidebar
   - Select your desired summary length
   - Click "Process Video"
   - View the summary and translation in the main area
   - Switch to the "Full Transcript" tab to see the complete text
   - Use the language selector in the top right to change the translation language

## Notes
- The application works best with videos that have closed captions available
- Processing time may vary depending on video length and complexity
- Make sure you have a stable internet connection
- The application automatically detects the language of the transcript
- You can translate both the summary and full transcript
- Your API key is stored securely in the session and is not saved permanently when using the UI method

## Troubleshooting
If you encounter any issues:
1. Make sure the video has closed captions available
2. Check if the video is private or age-restricted
3. Verify your Google API key is valid and has sufficient quota
4. Ensure you have a stable internet connection
5. Try a different video if the current one doesn't work
6. If using the UI method, make sure to enter your API key before processing videos

## Contributing
Feel free to submit issues and enhancement requests! 