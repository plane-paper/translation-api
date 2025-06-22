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
  apiKey: process.env.OPENAI_API_KEY,
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
    console.log('=== Translation Request ===');
    console.log('Request body:', req.body);
    
    const { text, targetLanguage, fromLang } = req.body; // Added fromLang extraction
    
    if (!text || !targetLanguage) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing text or targetLanguage',
        received: { text, targetLanguage, fromLang }
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('Missing OpenAI API key');
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }

    console.log(`Translating from "${fromLang}" to "${targetLanguage}"`);

    // Create the translation prompt
    const prompt = `Translate the following text from "${fromLang || 'auto-detect'}" to "${targetLanguage}": "${text}"`;

    // Fix: Use the extracted fromLang variable
    const systemMessage = fromLang === "Brainrot" 
        ? "You are a brainrot to English translator. You should translate the phrase into plain English."
        : "You are an English to brainrot translator. You should translate the phrase into brainrot slang.";

    console.log('System message:', systemMessage);
    console.log('User prompt:', prompt);

    // Call OpenAI API - try with a standard model first
    const completion = await openai.chat.completions.create({
      model: "ft:gpt-4.1-nano-2025-04-14:personal:brainrot-translate:Bl8MOsFc",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    console.log('OpenAI response:', completion.choices[0]);

    const translatedText = completion.choices[0].message.content.trim();
    
    console.log('Final translated text:', translatedText);
    
    res.json({
      translatedText,
      originalText: text,
      targetLanguage,
      fromLanguage: fromLang || 'auto-detect',
      success: true
    });
    
  } catch (error) {
    console.error('Translation error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
    
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
    } else if (error.code === 'model_not_found') {
      res.status(400).json({
        error: 'Model not found',
        message: 'The specified model is not available'
      });
    } else {
      res.status(500).json({ 
        error: 'Translation failed',
        message: error.message,
        code: error.code || 'unknown'
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