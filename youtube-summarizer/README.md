# 🤖 AI YouTube Content Analyzer

An AI-powered application that helps you analyze YouTube videos by providing transcripts, summaries, interactive chat, and comment analysis.

## ✨ Features

- 🎥 **Trending Videos**: Discover and analyze popular YouTube videos
- 📝 **Video Summaries**: Get AI-generated summaries of video content
- 💬 **Chat with Video**: Ask questions about the video content and get contextual answers
- 📊 **Comments Analysis**: Analyze sentiment and themes in video comments
- 📄 **Full Transcript**: Access and copy the complete video transcript
- 🌍 **Translation Support**: Translate summaries and analysis to multiple languages
- 📋 **Copy Functionality**: Easy copying of summaries, transcripts, and analysis

## 🚀 Getting Started

### Prerequisites

- Python 3.12 or higher
- Google Gemini API Key
- YouTube Data API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-summarizer.git
cd youtube-summarizer
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your API keys:
```env
GOOGLE_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### Running the Application

```bash
streamlit run main.py
```

## 🔧 Configuration

The application can be configured through the following settings in `src/config/settings.py`:
- Translation languages
- Model settings
- API configurations

## 🎯 Usage

1. Enter a YouTube URL or select from trending videos
2. Choose from available analysis options:
   - Generate Summary
   - Chat with Video
   - Analyze Comments
   - View Full Transcript
3. Use translation features if needed
4. Copy and share results

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Streamlit for the amazing web framework
- Google Gemini for AI capabilities
- YouTube Data API for video data access 