import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser for body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Secure Server-Side Proxy Endpoint for Groq AI with transparent Gemini fallback
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, systemPrompt, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages parameter.' });
    }

    // Try calling Groq if GROQ_API_KEY is configured
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.trim() !== '') {
      try {
        const fullMessages = [];
        if (systemPrompt) {
          fullMessages.push({ role: 'system', content: systemPrompt });
        }
        fullMessages.push(...messages);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: fullMessages,
            temperature: temperature ?? 0.7,
            max_tokens: 1500
          })
        });

        if (response.ok) {
          const data = await response.json();
          return res.json({
            success: true,
            message: data.choices[0]?.message || { role: 'assistant', content: 'No response content.' },
            usage: data.usage
          });
        } else {
          const errorText = await response.text();
          console.warn('Groq API returned an error, attempting Gemini fallback:', errorText);
        }
      } catch (groqErr: any) {
        console.warn('Failed to connect to Groq, attempting Gemini fallback:', groqErr.message);
      }
    }

    // Try calling Gemini if GEMINI_API_KEY is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const contents = messages.map(m => {
          const role = m.role === 'assistant' ? 'model' : 'user';
          return {
            role,
            parts: [{ text: m.content || '' }]
          };
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: temperature ?? 0.6,
          }
        });

        return res.json({
          success: true,
          message: {
            role: 'assistant',
            content: response.text || 'No response content.'
          }
        });
      } catch (geminiErr: any) {
        console.error('Gemini fallback failed:', geminiErr);
        return res.status(500).json({
          error: 'Failed to communicate with both Groq and Gemini assistant.',
          details: geminiErr.message
        });
      }
    }

    return res.status(500).json({
      error: 'AI Co-pilot is not configured. Please configure GEMINI_API_KEY or GROQ_API_KEY.'
    });

  } catch (error: any) {
    console.error('Error handling AI chat request:', error);
    return res.status(500).json({
      error: 'Failed to communicate with AI assistant.',
      details: error.message
    });
  }
});

// Telegram Bot Webhook Endpoint
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    // Support simulated requests with raw text or standard Telegram Updates
    const messageText = update?.message?.text || update?.text || '';
    const chatId = update?.message?.chat?.id || update?.chatId;
    const fromName = update?.message?.from?.first_name || 'User';

    if (!messageText.trim()) {
      return res.status(200).json({ ok: true, info: 'Empty message' });
    }

    const systemPrompt = `You are an intelligent Telegram AI Bot for the 'Ruang Tsaqif' productivity dashboard.
You receive a text message from a user. Formulate a friendly, warm, and highly motivating response in Indonesian language. Acknowledge what they wrote. Keep it under 2-3 sentences. Mention that the dashboard data has been updated in their workspace! Start with a nice emoji.`;

    let replyContent = "Halo! Layanan AI Telegram Bot siap membantu Anda mencatat produktivitas Anda. 🚀";

    // Call Groq or Gemini to process
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (groqKey && groqKey.trim() !== '') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: messageText }
            ],
            temperature: 0.7,
            max_tokens: 400
          })
        });

        if (response.ok) {
          const data = await response.json();
          replyContent = data.choices[0]?.message?.content || replyContent;
        }
      } catch (err) {
        console.warn('Groq failed inside webhook, calling Gemini fallback:', err);
      }
    } else if (geminiKey && geminiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: messageText }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          }
        });
        replyContent = response.text || replyContent;
      } catch (err) {
        console.error('Gemini failed inside webhook:', err);
      }
    }

    // Send response back to Telegram if a Chat ID is present
    const botToken = (req.query.token as string) || process.env.TELEGRAM_BOT_TOKEN;
    if (chatId && botToken) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyContent
          })
        });
      } catch (err) {
        console.error('Failed to send message to Telegram API:', err);
      }
    }

    // Always respond with success status to Telegram webhook
    return res.status(200).json({
      success: true,
      reply: replyContent,
      chatId: chatId,
      from: fromName
    });

  } catch (error: any) {
    console.error('Error in Telegram webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
