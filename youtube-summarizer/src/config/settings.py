import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

# Model Configuration
GEMINI_MODEL = 'gemini-2.0-flash'

# Translation Languages
TRANSLATION_LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Hindi',
    'Bengali',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Gujarati',
    'Marathi',
    'Punjabi',
    'Urdu'
]

# File size limits
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB in bytes

# Language Configuration
PREFERRED_LANGUAGES = [
    'en',  # English
    'hi',  # Hindi
    'te',  # Telugu
    'ta',  # Tamil
    'kn',  # Kannada
    'ml',  # Malayalam
    'bn',  # Bengali
    'gu',  # Gujarati
    'mr',  # Marathi
    'pa',  # Punjabi
    'ur',  # Urdu
    'es',  # Spanish
    'fr',  # French
    'de'   # German
]

LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
    'te': 'Telugu',
    'ta': 'Tamil',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'mr': 'Marathi',
    'pa': 'Punjabi',
    'ur': 'Urdu'
} 