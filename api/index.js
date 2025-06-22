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
    console.log('=== Translation Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Raw body type:', typeof req.body);
    
    const { text, targetLanguage } = req.body;
    
    console.log('Extracted text:', text);
    console.log('Extracted targetLanguage:', targetLanguage);
    
    if (!text || !targetLanguage) {
      console.log('Missing required fields!');
      return res.status(400).json({ 
        error: 'Missing text or targetLanguage',
        received: { text, targetLanguage },
        bodyKeys: Object.keys(req.body || {})
      });
    }
    
    const translatedText = `Translated "${text}" to ${targetLanguage}`;
    
    console.log('Sending response:', { translatedText });
    
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