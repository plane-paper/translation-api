const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration - allow your frontend domain
const corsOptions = {
  origin: [
    'https://goblinator-nine.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173' // for Vite
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Translation API is working!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Translation API is working!' });
});

app.post('/api/translate', (req, res) => {
  try {
    const { text, fromLang, toLang } = req.body;  // Changed to match React
    
    if (!text || !toLang) {
      return res.status(400).json({ 
        error: 'Missing text or toLang',
        received: { text, fromLang, toLang }
      });
    }
    
    // Your translation logic here
    const translatedText = `Translated "${text}" from ${fromLang || 'auto'} to ${toLang}`;
    
    res.json({
      translation: translatedText,  // Changed to match React expectation
      originalText: text,
      fromLang,
      toLang,
      success: true
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed',
      message: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

module.exports = app;