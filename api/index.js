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

// Translation route
app.post('/api/translate', (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Missing text or targetLanguage' 
      });
    }
    
    // Your translation logic here
    const translatedText = `Translated "${text}" to ${targetLanguage}`;
    
    res.json({
      translatedText,
      originalText: text,
      targetLanguage,
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