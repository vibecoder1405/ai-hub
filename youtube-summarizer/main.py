import streamlit as st
from src.services.youtube_service import YouTubeService
from src.services.ai_service import AIService
from src.utils.language_utils import detect_language
from src.config.settings import GOOGLE_API_KEY, YOUTUBE_API_KEY, TRANSLATION_LANGUAGES

# Initialize services
youtube_service = YouTubeService()
ai_service = AIService()

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
    
    # API Key inputs
    with st.expander("API Key Settings", expanded=not bool(GOOGLE_API_KEY)):
        api_key = st.text_input("Google Gemini API Key", type="password", value=GOOGLE_API_KEY)
        if api_key:
            ai_service = AIService()
            st.success("Gemini API Key configured successfully!")
            
        youtube_api_key = st.text_input("YouTube Data API Key", type="password", value=YOUTUBE_API_KEY)
        if youtube_api_key:
            youtube_service = YouTubeService()
            st.success("YouTube API Key configured successfully!")
    
    st.write("Enter video details to get started!")
    
    # Input fields in sidebar
    youtube_url = st.text_input("YouTube URL")
    word_count = st.number_input("Summary Length (words)", min_value=50, max_value=500, value=100)
    
    # Translation options in sidebar
    st.divider()
    st.subheader("Translation Options")
    enable_translation = st.checkbox("Enable Translation", value=False)
    
    if enable_translation:
        target_language = st.selectbox(
            "Translate to",
            TRANSLATION_LANGUAGES,
            index=0
        )
    
    if st.button("Process Video", use_container_width=True):
        if not GOOGLE_API_KEY:
            st.error("Please configure your Google Gemini API Key first!")
        elif not YOUTUBE_API_KEY:
            st.error("Please configure your YouTube Data API Key first!")
        else:
            st.session_state.process_video = True

# Main content area
st.title("YouTube Video Summary")

# Process video if button was clicked
if st.session_state.process_video:
    if youtube_url:
        video_id = youtube_service.get_video_id(youtube_url)
        if video_id:
            # Get video details and display them
            video_details = youtube_service.get_video_details(video_id)
            if video_details:
                col1, col2 = st.columns([1, 2])
                with col1:
                    st.image(video_details['thumbnail'], use_column_width=True)
                with col2:
                    st.subheader(video_details['title'])
                    st.write(f"**Channel:** {video_details['channel_name']}")
                    st.write(f"**Subscribers:** {video_details['channel_subscribers']:,}")
                    st.write(f"**Views:** {video_details['video_views']:,}")
                    st.write(f"**Likes:** {video_details['video_likes']:,}")
                    st.write(f"**Published:** {video_details['published_date'].split('T')[0]}")
            
            # Create tabs for different views
            tab1, tab2, tab3 = st.tabs(["Summary", "Full Transcript", "Comments Analysis"])
            
            with tab1:
                with st.spinner("Generating summary..."):
                    # Get transcript
                    transcript = youtube_service.get_transcript(video_id)
                    
                    if "Error" not in transcript:
                        # Store transcript in session state and detect language
                        st.session_state.transcript = transcript
                        st.session_state.detected_language = detect_language(transcript)
                        
                        # Generate summary
                        summary = ai_service.generate_summary(transcript, word_count)
                        
                        # Show translated content first if enabled
                        if enable_translation:
                            st.subheader(f"Translation to {target_language}")
                            translation = ai_service.translate_text(summary, target_language)
                            st.markdown(translation)
                            st.divider()
                            st.subheader(f"Original ({st.session_state.detected_language})")
                            st.markdown(summary)
                        else:
                            st.markdown(summary)
                    else:
                        st.error(transcript)
                        st.info("Tips if you're seeing an error:\n"
                               "1. Make sure the video has closed captions available\n"
                               "2. Try a different video\n"
                               "3. Check if the video is private or age-restricted")
            
            with tab2:
                if st.session_state.transcript:
                    st.subheader("Full Transcript")
                    if enable_translation and target_language != st.session_state.detected_language:
                        with st.spinner("Translating transcript..."):
                            translated_transcript = ai_service.translate_text(st.session_state.transcript, target_language)
                            st.subheader(f"Translation to {target_language}")
                            st.write(translated_transcript)
                            st.divider()
                            st.subheader(f"Original ({st.session_state.detected_language})")
                            st.write(st.session_state.transcript)
                    else:
                        st.write(st.session_state.transcript)
            
            with tab3:
                with st.spinner("Analyzing comments..."):
                    comments = youtube_service.get_video_comments(video_id)
                    if comments:
                        sentiment_analysis = ai_service.analyze_sentiment(comments)
                        if sentiment_analysis:
                            st.subheader("Comment Analysis")
                            st.write(f"**Overall Sentiment:** {sentiment_analysis['category']}")
                            st.write(f"**Total Comments Analyzed:** {sentiment_analysis['total_comments']}")
                            
                            # Generate comprehensive comment analysis
                            comment_analysis = ai_service.analyze_comments(comments)
                            if comment_analysis:
                                st.markdown(comment_analysis)
                    else:
                        st.warning("No comments available for analysis.")
        else:
            st.error("Invalid YouTube URL. Please make sure you're using a valid YouTube URL.")
    else:
        st.warning("Please enter a YouTube URL")

# Add some helpful information in sidebar
with st.sidebar.expander("How to use"):
    st.write("""
    1. Configure your Google Gemini API Key (if not using .env file)
    2. Configure your YouTube Data API Key (if not using .env file)
    3. Paste a YouTube video URL
    4. Select the desired summary length
    5. (Optional) Enable translation and select target language
    6. Click 'Process Video'
    7. View the summary, translation (if enabled), and comments analysis
    8. Switch between tabs to see different views
    
    Note: The video must have closed captions available.
    """) 