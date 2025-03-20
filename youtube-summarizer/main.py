import streamlit as st
from src.services.youtube_service import YouTubeService
from src.services.ai_service import AIService
from src.utils.language_utils import detect_language
from src.config.settings import (
    GOOGLE_API_KEY, 
    YOUTUBE_API_KEY,
    TRANSLATION_LANGUAGES
)
import requests
from bs4 import BeautifulSoup
import os
import pyperclip
from datetime import datetime, timedelta
import re

# Load custom CSS and JavaScript
def load_custom_css():
    with open('src/styles/custom.css') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

def load_custom_js():
    with open('src/styles/custom.js') as f:
        st.markdown(f'<script>{f.read()}</script>', unsafe_allow_html=True)

# Initialize services
st.session_state.youtube_service = YouTubeService()
st.session_state.ai_service = AIService()

# Set page config for better layout
st.set_page_config(
    layout="wide",
    page_title="AI YouTube Content Analyzer",
    page_icon="🤖",
    initial_sidebar_state="expanded"
)

# Load custom CSS and JavaScript
load_custom_css()
load_custom_js()

# Initialize session state variables at the start of the app
if 'process_video' not in st.session_state:
    st.session_state.process_video = False
if 'detected_language' not in st.session_state:
    st.session_state.detected_language = None
if 'transcript' not in st.session_state:
    st.session_state.transcript = None
if 'video_details' not in st.session_state:
    st.session_state.video_details = None
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'loading' not in st.session_state:
    st.session_state.loading = False
if 'url_submitted' not in st.session_state:
    st.session_state.url_submitted = False
if 'youtube_url' not in st.session_state:
    st.session_state.youtube_url = None

# Main content area with centered title
st.markdown("""
    <div class="main-header text-center">
        <h1>🤖 AI YouTube Content Analyzer</h1>
        <p class="subtitle">Get YouTube transcript, use AI to summarize YouTube videos, perform comments analysis and chat with video all in one click</p>
    </div>
""", unsafe_allow_html=True)

# Sidebar for API Keys and URL input
with st.sidebar:
    st.markdown("""
        <div class="sidebar-header">
            <h2>⚙️ Settings</h2>
        </div>
    """, unsafe_allow_html=True)
    
    # YouTube URL input
    youtube_url = st.text_input("Enter YouTube URL", placeholder="https://www.youtube.com/watch?v=...")
    
    # API Key inputs
    with st.expander("🔑 API Key Configuration", expanded=not bool(GOOGLE_API_KEY)):
        api_key = st.text_input("Google Gemini API Key", type="password", value=GOOGLE_API_KEY)
        if api_key:
            st.session_state.ai_service = AIService()
            st.success("✅ Gemini API Key configured successfully!")
            
        youtube_api_key = st.text_input("YouTube Data API Key", type="password", value=YOUTUBE_API_KEY)
        if youtube_api_key:
            st.session_state.youtube_service = YouTubeService()
            st.success("✅ YouTube API Key configured successfully!")

    with st.expander("📖 How to use"):
        st.markdown("""
            <div class="usage-guide">
                <ol>
                    <li>Configure your Google Gemini API Key (if not using .env file)</li>
                    <li>Configure your YouTube Data API Key (if not using .env file)</li>
                    <li>Enter a YouTube video URL</li>
                    <li>Choose from three analysis options:
                        <ul>
                            <li>📝 Generate Summary</li>
                            <li>💬 Chat with Video</li>
                            <li>📊 Comments Analysis</li>
                        </ul>
                    </li>
                </ol>
            </div>
        """, unsafe_allow_html=True)

    if st.button("Process Video", use_container_width=True):
        st.session_state.url_submitted = True
        if not GOOGLE_API_KEY:
            st.error("❌ Please configure your Google Gemini API Key first!")
        elif not YOUTUBE_API_KEY:
            st.error("❌ Please configure your YouTube Data API Key first!")
        elif not youtube_url:
            st.error("❌ Please enter a YouTube URL first!")
        else:
            try:
                # Only validate URL if one is provided
                video_id = st.session_state.youtube_service.get_video_id(youtube_url)
                if video_id:
                    st.session_state.youtube_url = youtube_url
                    st.session_state.process_video = True
                    st.session_state.transcript = None
                    st.session_state.video_details = None
                    st.session_state.chat_history = []
                    st.session_state.detected_language = None
                    st.rerun()
                else:
                    st.error("❌ Invalid YouTube URL. Please make sure you're using a valid YouTube URL.")
            except Exception as e:
                st.error("❌ Error processing URL. Please make sure you're using a valid YouTube URL.")

# Show featured videos if no URL is provided and no video is being processed
if not youtube_url and not st.session_state.process_video:
    st.markdown("""
        <div class="trending-section">
            <h2>🎥 Featured Videos</h2>
            <p>Click on any video to start analyzing</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Featured videos
    featured_videos = [
        {
            'video_id': '_waPvOwL9Z8',
            'title': 'GTC March 2025 Keynote with NVIDIA CEO Jensen Huang',
            'thumbnail': f'https://img.youtube.com/vi/_waPvOwL9Z8/maxresdefault.jpg',
            'channel_name': 'NVIDIA',
            'category': 'Tech'
        },
        {
            'video_id': 'IDYt1l_7UvU',
            'title': "NASA's SpaceX Crew-9 Re-Entry and Splashdown",
            'thumbnail': f'https://img.youtube.com/vi/IDYt1l_7UvU/maxresdefault.jpg',
            'channel_name': 'NASA',
            'category': 'Space'
        },
        {
            'video_id': 'EWvNQjAaOHw',
            'title': 'How I use LLMs',
            'thumbnail': f'https://img.youtube.com/vi/EWvNQjAaOHw/maxresdefault.jpg',
            'channel_name': 'Andrej Karpathy',
            'category': 'AI'
        },
        {
            'video_id': 's3G2kLruJJo',
            'title': 'Top 100 Places To Visit On Earth - Ultimate Travel Guide',
            'thumbnail': f'https://img.youtube.com/vi/s3G2kLruJJo/maxresdefault.jpg',
            'channel_name': 'BE AMAZED',
            'category': 'Travel'
        }
    ]
    
    # Create rows of 2 videos each
    for i in range(0, len(featured_videos), 2):
        row_videos = featured_videos[i:i+2]
        cols = st.columns(2)
        
        for idx, video in enumerate(row_videos):
            with cols[idx]:
                st.markdown(f"""
                    <div class="trending-video">
                        <div class="video-category">{video['category']}</div>
                        <img src="{video['thumbnail']}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                        <h4>{video['title']}</h4>
                        <p><strong>Channel:</strong> {video['channel_name']}</p>
                    </div>
                """, unsafe_allow_html=True)
                
                if st.button("Analyze this video", key=f"analyze_{video['video_id']}"):
                    st.session_state.youtube_url = f"https://www.youtube.com/watch?v={video['video_id']}"
                    youtube_url = st.session_state.youtube_url
                    st.session_state.process_video = True
                    st.session_state.transcript = None
                    st.session_state.video_details = None
                    st.session_state.chat_history = []
                    st.session_state.detected_language = None
                    st.rerun()

# Process video if button was clicked or featured video was selected
if st.session_state.process_video and st.session_state.youtube_url:
    # Use the URL from session state
    video_id = st.session_state.youtube_service.get_video_id(st.session_state.youtube_url)
    if video_id:
        # Get video details and display them
        video_details = st.session_state.youtube_service.get_video_details(video_id)
        if video_details:
            st.session_state.video_details = video_details
            col1, col2 = st.columns([1, 2])
            with col1:
                st.image(video_details['thumbnail'], use_column_width=True)
            with col2:
                st.markdown(f"""
                    <div class="video-details">
                        <h3>{video_details['title']}</h3>
                        <p><strong>Channel:</strong> {video_details['channel_name']}</p>
                        <p><strong>Subscribers:</strong> {video_details['channel_subscribers']:,}</p>
                        <p><strong>Views:</strong> {video_details['video_views']:,}</p>
                        <p><strong>Likes:</strong> {video_details['video_likes']:,}</p>
                        <p><strong>Published:</strong> {video_details['published_date'].split('T')[0]}</p>
                    </div>
                """, unsafe_allow_html=True)
        
        # Create tabs for different analysis options
        tab1, tab2, tab3, tab4 = st.tabs(["📝 Generate Summary", "💬 Chat with Video", "📊 Comments Analysis", "📄 Full Transcript"])
        
        with tab1:
            st.markdown("""
                <div class="analysis-section">
                    <h3>Video Summary</h3>
                    <p>Generate a comprehensive summary of the video content.</p>
                </div>
            """, unsafe_allow_html=True)
            
            col1, col2, col3 = st.columns([2, 1, 1])
            with col1:
                word_count = st.number_input(
                    "Summary Length (words)", 
                    min_value=50, 
                    max_value=1000, 
                    value=150,
                    key="youtube_word_count"
                )
            with col2:
                enable_translation = st.checkbox("Enable Translation", value=False, key="youtube_translation")
            with col3:
                if enable_translation:
                    target_language = st.selectbox(
                        "Translate to",
                        TRANSLATION_LANGUAGES,
                        index=0,
                        key="youtube_target_lang"
                    )
            
            if st.button("Generate Summary", use_container_width=True):
                st.session_state.loading = True
                with st.spinner("Generating summary..."):
                    transcript = st.session_state.youtube_service.get_transcript(video_id)
                    
                    if "Error" not in transcript:
                        st.session_state.transcript = transcript
                        st.session_state.detected_language = detect_language(transcript)
                        
                        # Update the summary prompt to include better formatting
                        summary_prompt = f"""
                        Create a comprehensive summary of the following video content in approximately {word_count} words.
                        Format the summary with the following structure:

                        # [Title]
                        Create a concise, engaging title that captures the main topic.

                        ## Introduction
                        Provide a brief introduction to the main topic and context.

                        ## Key Points
                        Present the main points in a clear, organized manner.

                        ## Conclusion
                        Summarize the key takeaways and provide value to the reader.

                        Video Content:
                        {transcript}

                        Please format your response using markdown syntax.
                        """
                        
                        summary = st.session_state.ai_service.model.generate_content(summary_prompt).text
                        
                        if enable_translation:
                            translation = st.session_state.ai_service.translate_text(summary, target_language)
                            st.markdown(f"""
                                <div class="translation-section">
                                    <h3>Translation to {target_language}</h3>
                                    <div class="translated-content">{translation}</div>
                                    <hr>
                                    <h3>Original ({st.session_state.detected_language})</h3>
                                    <div class="original-content">{summary}</div>
                                </div>
                            """, unsafe_allow_html=True)
                        else:
                            st.markdown(summary)
                    else:
                        st.error(transcript)
                        st.info("""
                            <div class="error-tips">
                                <h4>Tips if you're seeing an error:</h4>
                                <ul>
                                    <li>Make sure the video has closed captions available</li>
                                    <li>Try a different video</li>
                                    <li>Check if the video is private or age-restricted</li>
                                </ul>
                            </div>
                        """, unsafe_allow_html=True)
                st.session_state.loading = False
        
        with tab2:
            st.markdown("""
                <div class="analysis-section">
                    <h3>Chat with Video</h3>
                    <p>Ask questions about the video content and get AI-powered answers.</p>
                </div>
            """, unsafe_allow_html=True)
            
            # Initialize chat history if not exists
            if 'chat_history' not in st.session_state:
                st.session_state.chat_history = []
            
            # Display chat history
            for message in st.session_state.chat_history:
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])
            
            # Chat input
            if prompt := st.chat_input("Ask a question about the video..."):
                # Add user message to chat history
                st.session_state.chat_history.append({"role": "user", "content": prompt})
                with st.chat_message("user"):
                    st.markdown(prompt)
                
                # Get video transcript if not already loaded
                if not st.session_state.transcript:
                    transcript = st.session_state.youtube_service.get_transcript(video_id)
                    if "Error" not in transcript:
                        st.session_state.transcript = transcript
                
                # Generate AI response
                with st.chat_message("assistant"):
                    with st.spinner("Thinking..."):
                        # Create context-aware prompt with better instructions
                        context_prompt = f"""
                        You are an AI assistant analyzing a YouTube video. Based on the following video transcript, please provide a detailed and contextual answer to the user's question.
                        Your response should:
                        1. Be comprehensive and well-structured
                        2. Include relevant quotes or examples from the video
                        3. Connect different parts of the video content to provide a complete answer
                        4. If the answer cannot be found in the transcript, clearly state that
                        5. Use markdown formatting for better readability

                        Question: {prompt}

                        Video Transcript:
                        {st.session_state.transcript}

                        Please provide a detailed answer:
                        """
                        
                        response = st.session_state.ai_service.model.generate_content(context_prompt)
                        st.markdown(response.text)
                        st.session_state.chat_history.append({"role": "assistant", "content": response.text})
        
        with tab3:
            st.markdown("""
                <div class="analysis-section">
                    <h3>Comments Analysis</h3>
                    <p>Analyze sentiment and themes in video comments.</p>
                </div>
            """, unsafe_allow_html=True)
            
            col1, col2 = st.columns([1, 1])
            with col1:
                enable_translation = st.checkbox("Enable Translation", value=False, key="comments_translation")
            with col2:
                if enable_translation:
                    target_language = st.selectbox(
                        "Translate to",
                        TRANSLATION_LANGUAGES,
                        index=0,
                        key="comments_target_lang"
                    )
            
            if st.button("Analyze Comments", use_container_width=True):
                st.session_state.loading = True
                with st.spinner("Analyzing comments..."):
                    comments = st.session_state.youtube_service.get_video_comments(video_id)
                    if comments:
                        sentiment_analysis = st.session_state.ai_service.analyze_sentiment(comments)
                        if sentiment_analysis:
                            st.markdown(f"""
                                <div class="sentiment-analysis">
                                    <h3>Comment Analysis</h3>
                                    <p><strong>Overall Sentiment:</strong> {sentiment_analysis['category']}</p>
                                    <p><strong>Total Comments Analyzed:</strong> {sentiment_analysis['total_comments']}</p>
                                </div>
                            """, unsafe_allow_html=True)
                                
                            comment_analysis = st.session_state.ai_service.analyze_comments(comments)
                            if comment_analysis:
                                if enable_translation:
                                    translated_analysis = st.session_state.ai_service.translate_text(comment_analysis, target_language)
                                    st.markdown(f"""
                                        <div class="translation-section">
                                            <h3>Translation to {target_language}</h3>
                                            <div class="translated-content">{translated_analysis}</div>
                                            <hr>
                                            <h3>Original ({st.session_state.detected_language})</h3>
                                            <div class="original-content">{comment_analysis}</div>
                                        </div>
                                    """, unsafe_allow_html=True)
                                else:
                                    st.markdown(f"""
                                        <div class="comment-analysis">
                                            {comment_analysis}
                                        </div>
                                    """, unsafe_allow_html=True)
                    else:
                        st.warning("No comments available for analysis.")
                st.session_state.loading = False
        
        with tab4:
            st.markdown("""
                <div class="analysis-section">
                    <h3>Full Video Transcript</h3>
                    <p>View and copy the complete video transcript.</p>
                </div>
            """, unsafe_allow_html=True)
            
            if not st.session_state.transcript:
                transcript = st.session_state.youtube_service.get_transcript(video_id)
                if "Error" not in transcript:
                    st.session_state.transcript = transcript
            
            if st.session_state.transcript:
                st.markdown(f"""
                    <div class="transcript-container">
                        <div class="transcript-content">
                            {st.session_state.transcript}
                        </div>
                        <button class="copy-button" onclick="copyTranscript()">
                            📋 Copy Transcript
                        </button>
                    </div>
                """, unsafe_allow_html=True)
            else:
                st.error("Transcript not available for this video.")
else:
    # Only show error if URL has been submitted and is invalid
    if st.session_state.url_submitted and not st.session_state.youtube_url:
        # Don't show any error message here - errors are handled in the button click
        pass

# Add copy functionality to all tabs
st.markdown("""
    <script>
    function copyTranscript() {
        const transcript = document.querySelector('.transcript-content').innerText;
        navigator.clipboard.writeText(transcript).then(() => {
            alert('Transcript copied to clipboard!');
        });
    }

    function copySummary() {
        const summary = document.querySelector('.summary-content').innerText;
        navigator.clipboard.writeText(summary).then(() => {
            alert('Summary copied to clipboard!');
        });
    }

    function copyAnalysis() {
        const analysis = document.querySelector('.comment-analysis').innerText;
        navigator.clipboard.writeText(analysis).then(() => {
            alert('Analysis copied to clipboard!');
        });
    }
    </script>
""", unsafe_allow_html=True)

# Update the loading spinner style
st.markdown("""
    <style>
    .stSpinner > div {
        border-top-color: #FF0000;
        width: 50px;
        height: 50px;
        margin: 20px auto;
    }
    </style>
""", unsafe_allow_html=True)

# Display loading spinner without text
if st.session_state.loading:
    st.markdown(
        """
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
        """,
        unsafe_allow_html=True
    )

# Update the comment analysis display to remove HTML tags
if st.session_state.get('comment_analysis'):
    comment_analysis = st.session_state.comment_analysis
    # Strip any HTML tags from the analysis
    comment_analysis = re.sub(r'<[^>]+>', '', comment_analysis)
    st.markdown(comment_analysis) 