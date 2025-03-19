from langdetect import detect
from src.config.settings import LANGUAGE_NAMES

def detect_language(text):
    """Detect the language of the text"""
    try:
        lang_code = detect(text)
        return LANGUAGE_NAMES.get(lang_code, 'Unknown')
    except:
        return 'Unknown' 