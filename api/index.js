const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Translation API is working!' });
});

// Translation route
app.post('/api/translate', (req, res) => {
  const { text, targetLanguage } = req.body;
  
  res.json({
    translatedText: `Mock translation: ${text} -> ${targetLanguage}`,
    success: true
  });
});

module.exports = app;