// Configuration
const CONFIG = {
    VALID_TOKENS: ['chriswijaya07', 'nadia05'],
    GEMINI_API_KEY: 'AIzaSyChnFkWvBb-KeF9roqpoGa51cjZI5TZrI4',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    WHATSAPP_SUPPORT_EMAIL: 'support@support.whatsapp.com'
};

// Global variables
let generatedSubject = '';
let generatedMail = '';
let currentUserData = {};

// Language configurations for prompts
const LANGUAGE_CONFIG = {
    brazil: {
        name: 'Português (Brasil)',
        code: 'pt-BR',
        prompt: 'em português brasileiro'
    },
    jepang: {
        name: '日本語',
        code: 'ja',
        prompt: 'dalam bahasa Jepang'
    },
    indonesia: {
        name: 'Indonesia',
        code: 'id',
        prompt: 'dalam bahasa Indonesia'
    },
    kanada: {
        name: 'English (Canada)',
        code: 'en-CA',
        prompt: 'in Canadian English'
    },
    kamboja: {
        name: 'ខ្មែរ (Khmer)',
        code: 'km',
        prompt: 'dalam bahasa Khmer (Kamboja)'
    },
    chinese: {
        name: '中文',
        code: 'zh',
        prompt: 'dalam bahasa Mandarin'
    },
    english: {
        name: 'English',
        code: 'en',
        prompt: 'in English'
    },
    korea: {
        name: '한국어',
        code: 'ko',
        prompt: 'dalam bahasa Korea'
    }
};

// DOM Elements
const elements = {
    // Screens
    tokenScreen: document.getElementById('tokenScreen'),
    mainScreen: document.getElementById('mainScreen'),
    reviewScreen: document.getElementById('reviewScreen'),
    manualScreen: document.getElementById('manualScreen'),
    autoScreen: document.getElementById('autoScreen'),
    
    // Forms
    tokenForm: document.getElementById('tokenForm'),
    mainForm: document.getElementById('mainForm'),
    
    // Inputs
    tokenInput: document.getElementById('tokenInput'),
    userName: document.getElementById('userName'),
    userNumber: document.getElementById('userNumber'),
    language: document.getElementById('language'),
    
    // Buttons
    createBtn: document.getElementById('createBtn'),
    manualReviewBtn: document.getElementById('manualReviewBtn'),
    autoReviewBtn: document.getElementById('autoReviewBtn'),
    backToFormBtn: document.getElementById('backToFormBtn'),
    copySubjectBtn: document.getElementById('copySubjectBtn'),
    copyMailBtn: document.getElementById('copyMailBtn'),
    backToReviewBtn: document.getElementById('backToReviewBtn'),
    backToReviewFromAutoBtn: document.getElementById('backToReviewFromAutoBtn'),
    generateNewBtn: document.getElementById('generateNewBtn'),
    sendEmailBtn: document.getElementById('sendEmailBtn'),
    
    // Content areas
    subjectPreview: document.getElementById('subjectPreview'),
    mailPreview: document.getElementById('mailPreview'),
    autoSubjectPreview: document.getElementById('autoSubjectPreview'),
    autoMailPreview: document.getElementById('autoMailPreview'),
    sendStatus: document.getElementById('sendStatus'),
    
    // Messages
    successMessage: document.getElementById('successMessage'),
    errorMessage: document.getElementById('errorMessage'),
    tokenError: document.getElementById('tokenError'),
    
    // Loading elements
    btnText: document.getElementById('btnText'),
    loadingSpinner: document.getElementById('loadingSpinner')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Show token screen initially
    showScreen('tokenScreen');
}

function setupEventListeners() {
    // Token form
    elements.tokenForm.addEventListener('submit', handleTokenSubmit);
    
    // Main form
    elements.mainForm.addEventListener('submit', handleMainFormSubmit);
    
    // Review buttons
    elements.manualReviewBtn.addEventListener('click', () => showManualReview());
    elements.autoReviewBtn.addEventListener('click', () => showAutoReview());
    
    // Navigation buttons
    elements.backToFormBtn.addEventListener('click', () => showScreen('mainScreen'));
    elements.backToReviewBtn.addEventListener('click', () => showScreen('reviewScreen'));
    elements.backToReviewFromAutoBtn.addEventListener('click', () => showScreen('reviewScreen'));
    elements.generateNewBtn.addEventListener('click', () => showScreen('mainScreen'));
    
    // Copy buttons
    elements.copySubjectBtn.addEventListener('click', () => copyToClipboard(generatedSubject, 'Subject'));
    elements.copyMailBtn.addEventListener('click', () => copyToClipboard(generatedMail, 'Email content'));
    
    // Send email button
    elements.sendEmailBtn.addEventListener('click', handleAutoSend);
}

function handleTokenSubmit(e) {
    e.preventDefault();
    
    const token = elements.tokenInput.value.trim();
    
    if (CONFIG.VALID_TOKENS.includes(token)) {
        elements.tokenError.style.display = 'none';
        showScreen('mainScreen');
        elements.tokenInput.value = '';
        showMessage('Login berhasil! Selamat datang.', 'success');
    } else {
        elements.tokenError.style.display = 'block';
        elements.tokenInput.value = '';
        elements.tokenInput.focus();
    }
}

async function handleMainFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    currentUserData = {
        name: elements.userName.value.trim(),
        number: elements.userNumber.value.trim(),
        language: elements.language.value
    };
    
    // Validate data
    if (!currentUserData.name || !currentUserData.number || !currentUserData.language) {
        showMessage('Mohon lengkapi semua field!', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Generate content using Gemini AI
        await generateUnbanContent(currentUserData);
        
        // Hide loading and show review options
        setLoadingState(false);
        showScreen('reviewScreen');
        showMessage('Pesan unban berhasil dibuat!', 'success');
        
    } catch (error) {
        console.error('Error generating content:', error);
        setLoadingState(false);
        showMessage('Gagal membuat pesan. Silakan coba lagi.', 'error');
    }
}

async function generateUnbanContent(userData) {
    const languageConfig = LANGUAGE_CONFIG[userData.language];
    
    // Create comprehensive prompts for both subject and email content
    const subjectPrompt = createSubjectPrompt(userData, languageConfig);
    const emailPrompt = createEmailPrompt(userData, languageConfig);
    
    try {
        // Generate subject
        const subjectResponse = await callGeminiAPI(subjectPrompt);
        generatedSubject = cleanGeneratedText(subjectResponse);
        
        // Generate email content
        const emailResponse = await callGeminiAPI(emailPrompt);
        generatedMail = cleanGeneratedText(emailResponse);
        
        // Add random elements for uniqueness
        generatedSubject = addRandomElements(generatedSubject);
        generatedMail = addRandomElements(generatedMail);
        
    } catch (error) {
        throw new Error('Failed to generate content: ' + error.message);
    }
}

function createSubjectPrompt(userData, languageConfig) {
    return `Buatkan subjek email untuk permintaan unban WhatsApp yang profesional dan menarik perhatian support team. 
    
    Detail pengguna:
    - Nama: ${userData.name}
    - Nomor: ${userData.number}
    - Bahasa: ${languageConfig.name}
    
    Persyaratan:
    - Tulis ${languageConfig.prompt}
    - Maksimal 10-15 kata
    - Profesional dan sopan
    - Menarik perhatian support
    - Jangan gunakan kata "tolong" atau "mohon" berlebihan
    - Fokus pada permintaan review akun
    - Unik dan berbeda setiap kali generate
    
    Contoh struktur: "Account Review Request - [Nama] - [Alasan Singkat]"
    
    Hanya berikan subjek saja, tanpa tanda kutip atau penjelasan tambahan.`;
}

function createEmailPrompt(userData, languageConfig) {
    return `Buatkan isi email lengkap untuk permintaan unban WhatsApp yang profesional dan persuasif.
    
    Detail pengguna:
    - Nama: ${userData.name}
    - Nomor: ${userData.number}
    - Bahasa: ${languageConfig.name}
    
    Persyaratan email:
    - Tulis ${languageConfig.prompt}
    - Panjang 300-500 kata
    - Sangat profesional dan sopan
    - Struktur: Salam, Perkenalan, Penjelasan masalah, Permintaan review, Penutup
    - Jelaskan bahwa akun di-banned tanpa alasan jelas
    - Minta review dan investigasi lebih lanjut
    - Tunjukkan komitmen mengikuti terms of service
    - Berikan alasan mengapa akun penting (bisnis/komunikasi keluarga)
    - Unik dan berbeda setiap kali generate
    - Jangan terlalu memohon, tetapi tegas dan profesional
    - Sertakan nomor WhatsApp dalam email
    - selalu buat nomor yang mau di banned mengikuti kode negara dari nomornya, bukan dari negaranta
    Format:
    Dear WhatsApp Support Team,
    
    [Isi email...]
    
    Best regards,
    [Nama]
    [Nomor WhatsApp]
    
    Berikan hanya isi email lengkap, tanpa subjek atau penjelasan tambahan.`;
}

async function callGeminiAPI(prompt) {
    const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
}

function cleanGeneratedText(text) {
    // Remove unwanted characters and format text
    return text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/^\s*[-\*\+]\s/gm, '') // Remove bullet points
        .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
        .trim();
}

function addRandomElements(text) {
    // Add slight variations to make each generation unique
    const variations = [
        { from: 'Dear', to: Math.random() > 0.5 ? 'Dear' : 'Respected' },
        { from: 'Best regards', to: Math.random() > 0.5 ? 'Best regards' : 'Sincerely' },
        { from: 'Thank you', to: Math.random() > 0.5 ? 'Thank you' : 'Thanks' }
    ];
    
    variations.forEach(variation => {
        text = text.replace(new RegExp(variation.from, 'g'), variation.to);
    });
    
    return text;
}

function showManualReview() {
    elements.subjectPreview.textContent = generatedSubject;
    elements.mailPreview.textContent = generatedMail;
    showScreen('manualScreen');
}

function showAutoReview() {
    elements.autoSubjectPreview.textContent = generatedSubject;
    elements.autoMailPreview.textContent = generatedMail;
    elements.sendStatus.textContent = 'Siap untuk dikirim';
    elements.sendStatus.style.color = '#a5d6a7';
    showScreen('autoScreen');
}

function handleAutoSend() {
    // Create mailto link for automatic email sending
    const subject = encodeURIComponent(generatedSubject);
    const body = encodeURIComponent(generatedMail);
    const mailto = `mailto:${CONFIG.WHATSAPP_SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    
    // Update status
    elements.sendStatus.textContent = 'Membuka email client...';
    elements.sendStatus.style.color = '#ffb74d';
    
    // Open email client
    try {
        window.open(mailto, '_self');
        
        setTimeout(() => {
            elements.sendStatus.textContent = 'Email telah dibuka di aplikasi email Anda';
            elements.sendStatus.style.color = '#a5d6a7';
            showMessage('Email client telah dibuka. Silakan kirim email dari aplikasi email Anda.', 'success');
        }, 1000);
        
    } catch (error) {
        elements.sendStatus.textContent = 'Gagal membuka email client';
        elements.sendStatus.style.color = '#ff8a65';
        showMessage('Gagal membuka email client. Silakan copy manual.', 'error');
    }
}

async function copyToClipboard(text, type) {
    try {
        await navigator.clipboard.writeText(text);
        showMessage(`${type} berhasil di-copy ke clipboard!`, 'success');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage(`${type} berhasil di-copy!`, 'success');
    }
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    elements[screenId].classList.add('active');
    
    // Reset form if going back to main screen
    if (screenId === 'mainScreen') {
        elements.mainForm.reset();
        currentUserData = {};
        generatedSubject = '';
        generatedMail = '';
    }
}

function setLoadingState(loading) {
    if (loading) {
        elements.createBtn.disabled = true;
        elements.btnText.style.display = 'none';
        elements.loadingSpinner.style.display = 'inline-block';
    } else {
        elements.createBtn.disabled = false;
        elements.btnText.style.display = 'inline';
        elements.loadingSpinner.style.display = 'none';
    }
}

function showMessage(message, type) {
    const messageElement = type === 'success' ? elements.successMessage : elements.errorMessage;
    const textElement = type === 'success' ? 
        messageElement.querySelector('#successText') : 
        messageElement.querySelector('#errorText');
    
    textElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
    
    // Add click to dismiss
    messageElement.onclick = () => {
        messageElement.style.display = 'none';
    };
}

// Utility functions
function validatePhoneNumber(number) {
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(number.replace(/\s/g, ''));
}

function formatPhoneNumber(number) {
    return number.replace(/\s+/g, '').trim();
}

// Enhanced form validation
elements.mainForm.addEventListener('input', function(e) {
    if (e.target === elements.userNumber) {
        const number = e.target.value;
        if (number && !validatePhoneNumber(number)) {
            e.target.style.borderColor = '#ff5252';
        } else {
            e.target.style.borderColor = 'rgba(0, 188, 212, 0.3)';
        }
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to go back
    if (e.key === 'Escape') {
        if (elements.manualScreen.classList.contains('active')) {
            showScreen('reviewScreen');
        } else if (elements.autoScreen.classList.contains('active')) {
            showScreen('reviewScreen');
        } else if (elements.reviewScreen.classList.contains('active')) {
            showScreen('mainScreen');
        }
    }
    
    // Ctrl+C to copy (when in manual review)
    if (e.ctrlKey && e.key === 'c' && elements.manualScreen.classList.contains('active')) {
        e.preventDefault();
        copyToClipboard(generatedMail, 'Email content');
    }
});

// Add auto-save functionality for form data
function saveFormData() {
    const formData = {
        name: elements.userName.value,
        number: elements.userNumber.value,
        language: elements.language.value
    };
    sessionStorage.setItem('whatsapp_unban_form', JSON.stringify(formData));
}

function loadFormData() {
    const saved = sessionStorage.getItem('whatsapp_unban_form');
    if (saved) {
        const formData = JSON.parse(saved);
        elements.userName.value = formData.name || '';
        elements.userNumber.value = formData.number || '';
        elements.language.value = formData.language || '';
    }
}

// Auto-save on form changes
elements.userName.addEventListener('input', saveFormData);
elements.userNumber.addEventListener('input', saveFormData);
elements.language.addEventListener('change', saveFormData);

// Load saved data when app initializes
window.addEventListener('load', loadFormData);

// Handle page visibility change (pause/resume)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // App became visible again
        console.log('App resumed');
    } else {
        // App became hidden
        console.log('App paused');
        saveFormData();
    }
});

// Error handling for network issues
window.addEventListener('online', function() {
    showMessage('Koneksi internet kembali tersambung', 'success');
});

window.addEventListener('offline', function() {
    showMessage('Koneksi internet terputus. Beberapa fitur mungkin tidak tersedia.', 'error');
});

console.log('WhatsApp Unban Generator loaded successfully!');