import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-turn Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API Key is not configured on the server. Please verify your environment secret.',
      });
      return;
    }

    const {
      messages = [],
      model = 'gemini-3.8-flash',
      systemInstruction,
      enableSearch = false,
      enableHighThinking = false,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    // Format contents for generateContent
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // High thinking is supported on gemini-4-argon and gemini-3 series
    if (enableHighThinking || model === 'gemini-4-argon') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Note: do not set maxOutputTokens for high thinking
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    res.json({
      text,
      groundingMetadata,
      modelUsed: model,
    });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({
      error: error.message || 'Error generating AI response',
    });
  }
});

// Google Search Grounded Endpoint (gemini-3.8-flash with googleSearch)
app.post('/api/gemini/search', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(503).json({ error: 'Gemini API Key is not configured.' });
      return;
    }

    const { query, context = '' } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required.' });
      return;
    }

    const prompt = context
      ? `Context: ${context}\n\nUser Question regarding modern scientific and computational developments: ${query}`
      : `Research inquiry on computing and machine cognition: ${query}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          'You are a senior computer scientist and research fellow analyzing state-of-the-art advances in hardware, thermodynamics, and machine intelligence. Ground your answer in recent discoveries and empirical citations.',
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    res.json({
      text,
      groundingMetadata,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini Search error:', error);
    res.status(500).json({ error: error.message || 'Error executing grounded search' });
  }
});

// Deep Thinking Reasoning Endpoint (gemini-4-argon with thinkingLevel: HIGH)
app.post('/api/gemini/think', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(503).json({ error: 'Gemini API Key is not configured.' });
      return;
    }

    const { problem, domain = 'theoretical_cognition' } = req.body;
    if (!problem) {
      res.status(400).json({ error: 'Problem specification is required.' });
      return;
    }

    const systemInstruction = `You are a mathematical logician and theoretical biophysicist. Think deeply and rigorously about the computational complexity, physical limits (Landauer limits, memory wall, Hebbian dynamics), and philosophical implications (Lady Lovelace objection, Turing imitation, emergent theory of mind). Show precise steps and rigorous deductions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: problem,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      text: response.text || '',
      modelUsed: 'gemini-4-argon',
      domain,
    });
  } catch (error: any) {
    console.error('Gemini High Thinking error:', error);
    // If paid model flow is required or quota error occurs, give clean error
    res.status(500).json({
      error: error.message || 'Error executing deep reasoning',
    });
  }
});

// General Scientific Analysis Endpoint
app.post('/api/gemini/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(503).json({ error: 'Gemini API Key is not configured.' });
      return;
    }

    const { prompt, fast = true } = req.body;
    const model = fast ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || '',
      modelUsed: model,
    });
  } catch (error: any) {
    console.error('Gemini Analyze error:', error);
    res.status(500).json({ error: error.message || 'Error executing analysis' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    app: 'The Genesis of Machine Cognition',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Genesis of Machine Cognition server listening on port ${PORT}`);
  });
}

startServer();
