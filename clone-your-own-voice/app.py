import streamlit as st
import os
from dotenv import load_dotenv
from elevenlabs import client
import google.generativeai as genai
from docx import Document
import PyPDF2
import tempfile
import magic
import io
from audio_recorder_streamlit import audio_recorder
import wave
import numpy as np

# Load environment variables
load_dotenv()

# Configure API keys
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not ELEVENLABS_API_KEY or not GEMINI_API_KEY:
    st.error("Please set up your API keys in the .env file")
    st.stop()

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Configure ElevenLabs
client.api_key = ELEVENLABS_API_KEY

# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        st.error(f"Error reading PDF file: {str(e)}")
        return None

# Function to extract text from DOCX
def extract_text_from_docx(docx_file):
    try:
        doc = Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        st.error(f"Error reading DOCX file: {str(e)}")
        return None

# Function to process document and extract text
def process_document(file):
    try:
        # Get file type
        file_bytes = file.read()
        file_type = magic.from_buffer(file_bytes, mime=True)
        file.seek(0)  # Reset file pointer
        
        if file_type == 'application/pdf':
            return extract_text_from_pdf(file)
        elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return extract_text_from_docx(file)
        else:
            raise ValueError("Unsupported file type. Please upload a PDF or DOCX file.")
    except Exception as e:
        st.error(f"Error processing document: {str(e)}")
        return None

# Function to save recorded audio bytes as a WAV file
def save_audio_bytes(audio_bytes, filename):
    """Save audio bytes to a WAV file"""
    try:
        with wave.open(filename, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 2 bytes per sample
            wav_file.setframerate(44100)  # 44.1kHz
            wav_file.writeframes(audio_bytes)
        return filename
    except Exception as e:
        st.error(f"Error saving audio file: {str(e)}")
        return None

def main():
    st.title("Clone Your Own Voice")
    st.write("Upload a voice sample or record your voice, then upload a document to generate speech in your voice!")

    # Voice input section
    st.subheader("Voice Input")
    voice_input_method = st.radio(
        "Choose voice input method:",
        ["Upload Voice Sample", "Record Voice"]
    )

    voice_sample = None
    if voice_input_method == "Upload Voice Sample":
        voice_sample = st.file_uploader("Upload Voice Sample (MP3 or WAV)", type=['mp3', 'wav'])
    else:
        st.write("Record your voice (speak clearly for 10-15 seconds):")
        audio_bytes = audio_recorder(
            text="Click to record",
            recording_color="#e74c3c",
            neutral_color="#2ecc71",
            icon_name="mic",
            icon_size="2x"
        )
        
        if audio_bytes:
            st.audio(audio_bytes, format="audio/wav")
            # Save recorded audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
                if save_audio_bytes(audio_bytes, tmp_file.name):
                    voice_sample = open(tmp_file.name, 'rb')
    
    # Document upload
    document = st.file_uploader("Upload Document (PDF or DOCX)", type=['pdf', 'docx'])
    
    if voice_sample and document:
        try:
            # Process the document
            with st.spinner("Processing document..."):
                text = process_document(document)
                if not text:
                    st.error("Failed to extract text from the document")
                    return
            
            # Clone voice
            with st.spinner("Cloning your voice..."):
                voice_bytes = voice_sample.read()
                voice_sample.seek(0)  # Reset the file pointer
                
                cloned_voice = client.clone(
                    name="Custom Voice",
                    description="Custom cloned voice",
                    files=[voice_bytes]
                )
            
            # Generate speech
            with st.spinner("Generating speech..."):
                audio = client.generate(
                    text=text,
                    voice_id=cloned_voice.voice_id,
                    model_id="eleven_monolingual_v1"
                )
            
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tmp_file.write(audio)
                tmp_file_path = tmp_file.name
            
            # Create columns for audio player and download button
            col1, col2 = st.columns(2)
            
            # Play audio
            with col1:
                st.subheader("Listen to Generated Audio")
                st.audio(tmp_file_path)
            
            # Download button
            with col2:
                st.subheader("Download Audio")
                with open(tmp_file_path, 'rb') as f:
                    st.download_button(
                        label="Download MP3",
                        data=f,
                        file_name="generated_speech.mp3",
                        mime="audio/mp3"
                    )
            
            # Clean up
            os.unlink(tmp_file_path)
            
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
            if "quota" in str(e).lower():
                st.warning("You may have exceeded your API quota. Please check your ElevenLabs account.")
            elif "api" in str(e).lower():
                st.warning("There might be an issue with your API key. Please verify it's correct.")
            elif "voice" in str(e).lower():
                st.warning("There might be an issue with the voice sample. Please try recording again or upload a different sample.")
        finally:
            # Clean up temporary files
            if voice_input_method == "Record Voice" and voice_sample:
                voice_sample.close()
                try:
                    os.unlink(voice_sample.name)
                except:
                    pass

if __name__ == "__main__":
    main()
