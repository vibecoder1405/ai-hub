import os
from newsletter_generator import NewsletterGenerator
from email_sender import EmailSender
import streamlit as st
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize session state for configuration
if 'config' not in st.session_state:
    st.session_state.config = {
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', ''),
        'SMTP_SERVER': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
        'SMTP_PORT': os.getenv('SMTP_PORT', '587'),
        'SENDER_EMAIL': os.getenv('SENDER_EMAIL', ''),
        'SENDER_PASSWORD': os.getenv('SENDER_PASSWORD', '')
    }

# Streamlit page configuration
st.set_page_config(
    page_title="Newsletter Generator",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="📰"
)

# Sidebar configuration
with st.sidebar:
    st.title("⚙️ Configuration")
    
    # Configuration Mode Selection
    config_mode = st.radio(
        "Configuration Mode",
        ["Use .env file", "Configure in UI"],
        help="Choose how to provide configuration values"
    )
    
    if config_mode == "Configure in UI":
        st.markdown("### Gemini API Setup")
        new_api_key = st.text_input(
            "Enter Gemini API Key",
            value=st.session_state.config['GEMINI_API_KEY'],
            type="password",
            help="Get your API key from https://makersuite.google.com/app/apikey"
        )
        
        st.markdown("### Email Configuration")
        new_smtp_server = st.text_input(
            "SMTP Server",
            value=st.session_state.config['SMTP_SERVER']
        )
        new_smtp_port = st.text_input(
            "SMTP Port",
            value=st.session_state.config['SMTP_PORT']
        )
        new_sender_email = st.text_input(
            "Sender Email",
            value=st.session_state.config['SENDER_EMAIL']
        )
        new_sender_password = st.text_input(
            "App Password",
            value=st.session_state.config['SENDER_PASSWORD'],
            type="password",
            help="For Gmail, use App Password from Google Account settings"
        )

        if st.button("Save Configuration"):
            st.session_state.config.update({
                'GEMINI_API_KEY': new_api_key,
                'SMTP_SERVER': new_smtp_server,
                'SMTP_PORT': new_smtp_port,
                'SENDER_EMAIL': new_sender_email,
                'SENDER_PASSWORD': new_sender_password
            })
            st.success("Configuration saved!")
    
    else:  # Using .env file
        st.markdown("### Current Configuration Status")
        st.info(f"API Key: {'*' * 20 if os.getenv('GEMINI_API_KEY') else 'Not set'}")
        st.info(f"SMTP Server: {os.getenv('SMTP_SERVER', 'Not set')}")
        st.info(f"SMTP Port: {os.getenv('SMTP_PORT', 'Not set')}")
        st.info(f"Sender Email: {os.getenv('SENDER_EMAIL', 'Not set')}")
        st.info(f"Email Password: {'*' * 20 if os.getenv('SENDER_PASSWORD') else 'Not set'}")
        
        st.markdown("---")
        st.markdown("ℹ️ **Note:** Edit the .env file to update configuration.")

    # Show current active configuration
    st.markdown("### Active Configuration")
    active_config = st.session_state.config
    st.info(f"API Key: {'*' * 20 if active_config['GEMINI_API_KEY'] else 'Not set'}")
    st.info(f"SMTP Server: {active_config['SMTP_SERVER']}")
    st.info(f"SMTP Port: {active_config['SMTP_PORT']}")
    st.info(f"Sender Email: {active_config['SENDER_EMAIL']}")
    st.info(f"Email Password: {'*' * 20 if active_config['SENDER_PASSWORD'] else 'Not set'}")

# Validate configuration
if not st.session_state.config['GEMINI_API_KEY']:
    st.error("Please configure your Gemini API key")
    st.stop()

if not all([
    st.session_state.config['SMTP_SERVER'],
    st.session_state.config['SMTP_PORT'],
    st.session_state.config['SENDER_EMAIL'],
    st.session_state.config['SENDER_PASSWORD']
]):
    st.warning("Please complete email configuration to enable sending newsletters")

# Initialize EmailSender with current configuration
email_sender = EmailSender(
    smtp_server=st.session_state.config['SMTP_SERVER'],
    smtp_port=int(st.session_state.config['SMTP_PORT']),
    sender_email=st.session_state.config['SENDER_EMAIL'],
    sender_password=st.session_state.config['SENDER_PASSWORD']
)

# Main content area
st.title("📰 AI Newsletter Generator")
st.markdown("### Welcome to the Newsletter Generator!")

# Initialize the NewsletterGenerator
@st.cache_resource(show_spinner=True)
def get_generator():
    return NewsletterGenerator(api_key=st.session_state.config['GEMINI_API_KEY'])

generator = get_generator()

# Create tabs for different sections
tab1, tab2 = st.tabs(["Generate Newsletter", "Email Configuration"])

with tab1:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        topic = st.text_input("Enter Topic", help="Enter the main topic for your newsletter")
        description = st.text_area("Additional Details (optional)", height=100, help="Add any specific details or focus areas you want to include")

    with col2:
        st.markdown("### Tips")
        st.markdown("""
        - Be specific with your topic
        - Include relevant keywords
        - Add context in details
        - Review before sending
        """)

    if "newsletter_content" not in st.session_state:
        st.session_state.newsletter_content = None

    if st.button("Generate Newsletter", type="primary"):
        if topic.strip():
            with st.spinner("Generating Newsletter..."):
                newsletter_content = generator.generate_newsletter(topic, description)
                if newsletter_content:
                    st.session_state.newsletter_content = newsletter_content
                    st.markdown("## Generated Newsletter")
                    st.markdown(newsletter_content)
                else:
                    st.error("Failed to generate newsletter. Please try again.")
        else:
            st.warning("Please provide a topic")

with tab2:
    st.markdown("### Email Configuration")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        emails_input = st.text_area(
            "Recipient Emails",
            help="Enter email addresses, one per line",
            height=100,
            key="emails"
        )
        
        email_subject = st.text_input(
            "Email Subject",
            help="Enter the subject line for the email",
            value="Your AI-Generated Newsletter"
        )

    with col2:
        st.markdown("### Email Guidelines")
        st.markdown("""
        - Enter one email per line
        - Verify email addresses
        - Use clear subject lines
        - Test with small groups first
        """)

    if st.button("Send Newsletter", type="primary"):
        if not st.session_state.newsletter_content:
            st.error("Please generate a newsletter first!")
        elif not emails_input.strip():
            st.error("Please enter at least one recipient email address!")
        else:
            recipient_emails = [email.strip() for email in emails_input.split('\n') if email.strip()]
            
            invalid_emails = EmailSender.validate_emails(recipient_emails)
            if invalid_emails:
                st.error(f"Invalid email addresses found: {', '.join(invalid_emails)}")
            else:
                with st.spinner("Sending newsletter..."):
                    success, message = email_sender.send_newsletter(
                        recipient_emails=recipient_emails,
                        subject=email_subject,
                        content=st.session_state.newsletter_content
                    )
                    if success:
                        st.success(message)
                    else:
                        st.error(message)

# Footer
st.markdown("---")
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.markdown("### 🚀 Powered by Google Gemini")
    st.markdown("Made with ❤️ by AI Engineering Hub")
