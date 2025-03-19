import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')

# Model Configuration
GEMINI_MODEL = 'gemini-2.0-flash'

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

# Translation Options
TRANSLATION_LANGUAGES = [
    # Indian Languages
    "Hindi",
    "Telugu",
    "Tamil",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Gujarati",
    "Marathi",
    "Punjabi",
    "Urdu",
    # International Languages
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean"
] 