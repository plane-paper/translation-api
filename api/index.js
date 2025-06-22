const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://goblinator-nine.vercel.app',
    'https://translation-api-dusky.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // You'll need to add this to Vercel
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Translation API is working!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Translation API is working!' });
});

// Translation route with OpenAI
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Missing text or targetLanguage',
        received: { text, targetLanguage }
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }

    // Create the translation prompt
    const prompt = `Translate the following text from "${req.body.fromLang || 'auto-detect'}" to "${targetLanguage}". 
    
Text to translate: "${text}"

Important: Only return the translated text, nothing else. No explanations, no quotes, just the direct translation.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate text accurately while preserving the original meaning and tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const translatedText = completion.choices[0].message.content.trim();
    
    res.json({
      translatedText,
      originalText: text,
      targetLanguage,
      fromLanguage: req.body.fromLang || 'auto-detect',
      success: true
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    
    // Handle different types of errors
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'OpenAI API quota exceeded',
        message: 'Please check your OpenAI billing'
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({
        error: 'Invalid OpenAI API key'
      });
    } else {
      res.status(500).json({ 
        error: 'Translation failed',
        message: error.message 
      });
    }
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