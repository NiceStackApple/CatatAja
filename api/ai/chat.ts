import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS Headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
          return res.status(200).json({
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

        const contents = messages.map((m: any) => {
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

        return res.status(200).json({
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
    console.error('Error handling AI chat request in serverless function:', error);
    return res.status(500).json({
      error: 'Failed to communicate with AI assistant.',
      details: error.message
    });
  }
}
