import streamlit as st
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi
import os
from dotenv import load_dotenv
from langdetect import detect

# Load environment variables
load_dotenv()

# Initialize session state for API key
if 'api_key' not in st.session_state:
    st.session_state.api_key = os.getenv('GOOGLE_API_KEY', '')

# Configure Gemini
if st.session_state.api_key:
    genai.configure(api_key=st.session_state.api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

def get_video_id(url):
    """Extract video ID from YouTube URL"""
    if 'youtu.be' in url:
        return url.split('/')[-1].split('?')[0]
    elif 'youtube.com' in url:
        if 'v=' in url:
            return url.split('v=')[1].split('&')[0]
        elif 'embed/' in url:
            return url.split('embed/')[-1].split('?')[0]
    return None

def get_transcript(video_id):
    """Get transcript from YouTube video"""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript(['en', 'es', 'fr', 'de'])
        return ' '.join([entry['text'] for entry in transcript.fetch()])
    except Exception as e:
        return f"Error getting transcript: {str(e)}"

def generate_summary(text, word_count):
    """Generate summary using Gemini"""
    prompt = f"""Please analyze the following text and create a comprehensive summary in approximately {word_count} words. Structure your response as follows:

1. Title: Create a concise, engaging title that captures the main topic
2. Brief Introduction: 2-3 sentences introducing the main topic and context
3. Target Audience: Identify who this content is primarily aimed at (e.g., beginners, professionals, students, etc.)
4. Key Points: Present the main points in bullet format, focusing on the most important information
5. Conclusion: A brief conclusion that ties everything together and provides value to the target audience

Text to analyze:
{text}

Please format your response as follows:

# [Title]

## Introduction
[Your introduction here]

## Target Audience
[Your target audience analysis here]

## Key Points
- [Point 1]
- [Point 2]
- [Point 3]
...

## Conclusion
[Your conclusion here]"""
    
    response = model.generate_content(prompt)
    return response.text

def translate_text(text, target_language):
    """Translate text using Gemini"""
    prompt = f"""Translate the following text to {target_language}:

{text}

Translation:"""
    
    response = model.generate_content(prompt)
    return response.text

def detect_language(text):
    """Detect the language of the text"""
    try:
        lang_code = detect(text)
        lang_names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean'
        }
        return lang_names.get(lang_code, 'Unknown')
    except:
        return 'Unknown'

# Set page config for better layout
st.set_page_config(layout="wide")

# Initialize session state
if 'process_video' not in st.session_state:
    st.session_state.process_video = False
if 'detected_language' not in st.session_state:
    st.session_state.detected_language = None
if 'transcript' not in st.session_state:
    st.session_state.transcript = None

# Sidebar for inputs
with st.sidebar:
    st.title("YouTube Summarizer")
    
    # API Key input
    with st.expander("API Key Settings", expanded=not bool(st.session_state.api_key)):
        api_key = st.text_input("Google Gemini API Key", type="password", value=st.session_state.api_key)
        if api_key:
            st.session_state.api_key = api_key
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            st.success("API Key configured successfully!")
    
    st.write("Enter video details to get started!")
    
    # Input fields in sidebar
    youtube_url = st.text_input("YouTube URL")
    word_count = st.number_input("Summary Length (words)", min_value=50, max_value=500, value=100)
    
    if st.button("Process Video", use_container_width=True):
        if not st.session_state.api_key:
            st.error("Please configure your Google Gemini API Key first!")
        else:
            st.session_state.process_video = True

# Main content area
st.title("YouTube Video Summary")

# Language selection for translation (top right)
col1, col2, col3 = st.columns([2, 1, 1])
with col3:
    if st.session_state.transcript:
        st.session_state.detected_language = detect_language(st.session_state.transcript)
        st.write(f"Detected Language: {st.session_state.detected_language}")
    
    target_language = st.selectbox(
        "Translate to",
        ["Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean"],
        index=0
    )

# Language code mapping
LANG_CODES = {
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Chinese": "zh",
    "Japanese": "ja",
    "Korean": "ko"
}

# Process video if button was clicked
if st.session_state.process_video:
    if youtube_url:
        video_id = get_video_id(youtube_url)
        if video_id:
            # Create tabs for different views
            tab1, tab2 = st.tabs(["Summary", "Full Transcript"])
            
            with tab1:
                with st.spinner("Generating summary..."):
                    # Get transcript
                    transcript = get_transcript(video_id)
                    
                    if "Error" not in transcript:
                        # Store transcript in session state
                        st.session_state.transcript = transcript
                        
                        # Generate summary
                        summary = generate_summary(transcript, word_count)
                        st.markdown(summary)
                        
                        # Translation
                        st.subheader(f"Translation to {target_language}")
                        translation = translate_text(summary, target_language)
                        st.markdown(translation)
                    else:
                        st.error(transcript)
                        st.info("Tips if you're seeing an error:\n"
                               "1. Make sure the video has closed captions available\n"
                               "2. Try a different video\n"
                               "3. Check if the video is private or age-restricted")
            
            with tab2:
                if st.session_state.transcript:
                    st.subheader("Full Transcript")
                    if target_language != st.session_state.detected_language:
                        with st.spinner("Translating transcript..."):
                            translated_transcript = translate_text(st.session_state.transcript, target_language)
                            st.write(translated_transcript)
                    else:
                        st.write(st.session_state.transcript)
        else:
            st.error("Invalid YouTube URL. Please make sure you're using a valid YouTube URL.")
    else:
        st.warning("Please enter a YouTube URL")

# Add some helpful information in sidebar
with st.sidebar.expander("How to use"):
    st.write("""
    1. Configure your Google Gemini API Key (if not using .env file)
    2. Paste a YouTube video URL
    3. Select the desired summary length
    4. Click 'Process Video'
    5. View the summary and translation
    6. Switch to 'Full Transcript' tab to see the complete text
    
    Note: The video must have closed captions available.
    """) 