const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { google } = require('googleapis');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure API keys
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!ELEVENLABS_API_KEY || !GEMINI_API_KEY) {
    console.error('Please set up your API keys in the .env file');
    process.exit(1);
}

// Serve static files
app.use(express.static('public'));

// Process document and extract text
const processDocument = async (filePath) => {
    const fileExt = path.extname(filePath).toLowerCase();
    
    if (fileExt === '.pdf') {
        const pdfBytes = await fs.promises.readFile(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        let text = '';
        
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPage(i);
            text += await page.getText() + '\n';
        }
        
        return text;
    } else if (fileExt === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }
    
    throw new Error('Unsupported file type');
};

// Clone voice using ElevenLabs API
const cloneVoice = async (voiceFile) => {
    const formData = new FormData();
    formData.append('files', voiceFile);
    formData.append('name', 'Custom Voice');
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Failed to clone voice');
    }
    
    const data = await response.json();
    return data.voice_id;
};

// Generate speech using ElevenLabs API
const generateSpeech = async (text, voiceId) => {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1'
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to generate speech');
    }
    
    return response.blob();
};

// API endpoint for generating speech
app.post('/api/generate', upload.fields([
    { name: 'voice', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), async (req, res) => {
    try {
        const voiceFile = req.files['voice'][0];
        const documentFile = req.files['document'][0];
        
        // Process document
        const text = await processDocument(documentFile.path);
        
        // Clone voice
        const voiceId = await cloneVoice(voiceFile.path);
        
        // Generate speech
        const audioBlob = await generateSpeech(text, voiceId);
        
        // Clean up temporary files
        await fs.promises.unlink(voiceFile.path);
        await fs.promises.unlink(documentFile.path);
        
        // Send response
        res.setHeader('Content-Type', 'audio/mp3');
        res.setHeader('Content-Disposition', 'attachment; filename=generated_speech.mp3');
        audioBlob.arrayBuffer().then(buffer => {
            res.send(Buffer.from(buffer));
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 