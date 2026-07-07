import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser for body
app.use(express.json());

// Fallback API Key if not present in process.env
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Secure Server-Side Proxy Endpoint for Groq AI
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, systemPrompt, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages parameter.' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API Key is not configured on the server.' });
    }

    // Build payload for Groq
    const fullMessages = [];
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt });
    }
    fullMessages.push(...messages);

    // Call Groq API via standard server-side fetch
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // High quality, fast model
        messages: fullMessages,
        temperature: temperature ?? 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API returned an error:', errorText);
      return res.status(response.status).json({
        error: `Groq API error: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      message: data.choices[0]?.message || { role: 'assistant', content: 'No response content.' },
      usage: data.usage
    });
  } catch (error: any) {
    console.error('Error handling Groq API chat request:', error);
    return res.status(500).json({
      error: 'Failed to communicate with Groq AI assistant.',
      details: error.message
    });
  }
});

// Configure Vite middleware or static serving depending on environment
async function setupRouting() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running server in DEVELOPMENT mode with Vite Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running server in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ruang Tsaqif server is successfully listening on http://0.0.0.0:${PORT}`);
  });
}

setupRouting();
