// State management
const state = {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    recordingStartTime: null,
    timerInterval: null,
    voiceFile: null,
    documentFile: null,
    generatedAudio: null
};

// DOM Elements
const elements = {
    uploadBtn: document.getElementById('uploadBtn'),
    recordBtn: document.getElementById('recordBtn'),
    uploadSection: document.getElementById('uploadSection'),
    recordingSection: document.getElementById('recordingSection'),
    voiceFile: document.getElementById('voiceFile'),
    documentFile: document.getElementById('documentFile'),
    startRecordBtn: document.getElementById('startRecordBtn'),
    recordingStatus: document.getElementById('recordingStatus'),
    timer: document.getElementById('timer'),
    audioPreview: document.getElementById('audioPreview'),
    generateBtn: document.getElementById('generateBtn'),
    resultSection: document.getElementById('resultSection'),
    audioPlayer: document.getElementById('audioPlayer'),
    downloadBtn: document.getElementById('downloadBtn')
};

// Utility Functions
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateTimer = () => {
    if (!state.isRecording || !state.recordingStartTime) return;
    const elapsed = Math.floor((Date.now() - state.recordingStartTime) / 1000);
    elements.timer.textContent = formatTime(elapsed);
};

const createAudioElement = (audioBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = audioUrl;
    return audio;
};

const handleError = (error) => {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
};

// Event Handlers
const handleUploadClick = () => {
    elements.uploadSection.classList.remove('hidden');
    elements.recordingSection.classList.add('hidden');
    elements.uploadBtn.classList.add('bg-blue-600');
    elements.recordBtn.classList.remove('bg-green-600');
};

const handleRecordClick = () => {
    elements.recordingSection.classList.remove('hidden');
    elements.uploadSection.classList.add('hidden');
    elements.recordBtn.classList.add('bg-green-600');
    elements.uploadBtn.classList.remove('bg-blue-600');
};

const handleVoiceFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    state.voiceFile = file;
    elements.audioPreview.innerHTML = '';
    elements.audioPreview.appendChild(createAudioElement(file));
    updateGenerateButton();
};

const handleDocumentFileChange = (event) => {
    state.documentFile = event.target.files[0];
    updateGenerateButton();
};

const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];
        
        state.mediaRecorder.ondataavailable = (event) => {
            state.audioChunks.push(event.data);
        };
        
        state.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(state.audioChunks, { type: 'audio/wav' });
            state.voiceFile = audioBlob;
            elements.audioPreview.innerHTML = '';
            elements.audioPreview.appendChild(createAudioElement(audioBlob));
            updateGenerateButton();
            
            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            state.isRecording = false;
            clearInterval(state.timerInterval);
            elements.recordingStatus.textContent = 'Recording complete';
            elements.startRecordBtn.textContent = 'Start Recording';
            elements.startRecordBtn.classList.remove('bg-red-600');
            elements.startRecordBtn.classList.add('bg-red-500');
        };
        
        state.mediaRecorder.start();
        state.isRecording = true;
        state.recordingStartTime = Date.now();
        state.timerInterval = setInterval(updateTimer, 1000);
        
        elements.recordingStatus.textContent = 'Recording...';
        elements.startRecordBtn.textContent = 'Stop Recording';
        elements.startRecordBtn.classList.remove('bg-red-500');
        elements.startRecordBtn.classList.add('bg-red-600');
    } catch (error) {
        handleError(error);
    }
};

const handleGenerateClick = async () => {
    if (!state.voiceFile || !state.documentFile) return;
    
    try {
        elements.generateBtn.disabled = true;
        elements.generateBtn.textContent = 'Generating...';
        
        // Create FormData for API request
        const formData = new FormData();
        formData.append('voice', state.voiceFile);
        formData.append('document', state.documentFile);
        
        // Send request to backend
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to generate speech');
        
        const audioBlob = await response.blob();
        state.generatedAudio = audioBlob;
        
        // Display result
        elements.resultSection.classList.remove('hidden');
        elements.audioPlayer.innerHTML = '';
        elements.audioPlayer.appendChild(createAudioElement(audioBlob));
    } catch (error) {
        handleError(error);
    } finally {
        elements.generateBtn.disabled = false;
        elements.generateBtn.textContent = 'Generate Speech';
    }
};

const handleDownloadClick = () => {
    if (!state.generatedAudio) return;
    
    const url = URL.createObjectURL(state.generatedAudio);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_speech.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Update generate button state
const updateGenerateButton = () => {
    elements.generateBtn.disabled = !(state.voiceFile && state.documentFile);
};

// Event Listeners
elements.uploadBtn.addEventListener('click', handleUploadClick);
elements.recordBtn.addEventListener('click', handleRecordClick);
elements.voiceFile.addEventListener('change', handleVoiceFileChange);
elements.documentFile.addEventListener('change', handleDocumentFileChange);
elements.startRecordBtn.addEventListener('click', handleStartRecording);
elements.generateBtn.addEventListener('click', handleGenerateClick);
elements.downloadBtn.addEventListener('click', handleDownloadClick);

// Keyboard accessibility
const handleKeyDown = (event, handler) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
    }
};

elements.uploadBtn.addEventListener('keydown', (e) => handleKeyDown(e, handleUploadClick));
elements.recordBtn.addEventListener('keydown', (e) => handleKeyDown(e, handleRecordClick));
elements.startRecordBtn.addEventListener('keydown', (e) => handleKeyDown(e, handleStartRecording));
elements.generateBtn.addEventListener('keydown', (e) => handleKeyDown(e, handleGenerateClick));
elements.downloadBtn.addEventListener('keydown', (e) => handleKeyDown(e, handleDownloadClick)); 