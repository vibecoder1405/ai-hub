# YouTube Video Summarizer

A powerful Streamlit application that provides comprehensive analysis of YouTube videos, including summaries, translations, and comment analysis.

## Features

- **Video Summary Generation**
  - Creates concise, structured summaries of video content
  - Customizable summary length (50-500 words)
  - Identifies target audience and key takeaways
  - Supports multiple languages including Indian languages

- **Multi-Language Support**
  - Automatic language detection
  - Support for multiple languages including:
    - Indian Languages: Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Urdu
    - International Languages: English, Spanish, French, German
  - Handles both manual and auto-generated captions

- **Translation Capabilities**
  - Translate summaries and full transcripts
  - Supports multiple target languages:
    - Indian Languages: Hindi, Telugu, Tamil, Malayalam, Kannada, Bengali, Gujarati, Marathi, Punjabi, Urdu
    - International Languages: Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean

- **Video Information Display**
  - Video thumbnail preview
  - Channel details (name, subscribers)
  - Video statistics (views, likes)
  - Publication date

- **Comment Analysis**
  - Analyzes up to 100 video comments
  - Provides comprehensive feedback analysis:
    - Overall sentiment
    - What users liked
    - Key learnings and helpful aspects
    - Areas for improvement
    - Common themes in comments

## Prerequisites

- Python 3.7 or higher
- Google Gemini API key
- YouTube Data API key
- Internet connection

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-summarizer.git
cd youtube-summarizer
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
   Create a `.env` file in the project root with:
```
GOOGLE_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Usage

1. Start the application:
```bash
streamlit run main.py
```

2. Configure API Keys:
   - Enter your Google Gemini API key
   - Enter your YouTube Data API key
   - Or use the `.env` file method

3. Process a video:
   - Paste a YouTube video URL
   - Select desired summary length
   - (Optional) Enable translation and select target language
   - Click "Process Video"

4. View results:
   - Summary tab: Get a structured summary of the video
   - Full Transcript tab: View the complete transcript
   - Comments Analysis tab: See user feedback analysis

## API Key Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file or enter it in the app

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Copy the key to your `.env` file or enter it in the app

## Troubleshooting

### Common Issues

1. **No Transcripts Found**
   - Ensure the video has closed captions available
   - Try a different video
   - Check if the video is private or age-restricted

2. **API Key Errors**
   - Verify API keys are correctly entered
   - Check if API quotas are exceeded
   - Ensure proper API access is enabled

3. **Translation Issues**
   - Check if the source language is supported
   - Verify the target language is available
   - Ensure sufficient API quota for translation

### Tips for Best Results

1. Use videos with clear audio and available captions
2. For longer videos, consider using shorter summary lengths
3. Enable translation for non-English content
4. Check comment analysis for user feedback insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Streamlit](https://streamlit.io/) for the web interface
- [Google Gemini](https://makersuite.google.com/) for AI capabilities
- [YouTube Data API](https://developers.google.com/youtube/v3) for video data
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api) for transcript handling 