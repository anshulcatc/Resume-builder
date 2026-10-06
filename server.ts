import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Gemini API initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// AI Bullet Enhancement & Assistance route
app.post('/api/ai/enhance', async (req, res) => {
  try {
    const { action, text, context } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ai) {
      // Intelligent fallback when API key is not configured
      const fallback = performLocalEnhancement(action, text);
      return res.json({ result: fallback, source: 'local' });
    }

    let prompt = '';
    switch (action) {
      case 'improve':
        prompt = `You are an elite MBA / corporate resume editor. Rewrite the following resume bullet point to make it more professional, achievement-oriented, and impactful, while strictly preserving the user's factual claims. Do NOT invent new metrics or fake numbers. If numbers exist, highlight them. Keep length to 120-180 characters.\n\nOriginal bullet: "${text}"\n\nReturn ONLY the revised bullet point text, nothing else.`;
        break;
      case 'shorten':
        prompt = `You are a resume editor fitting text to a 1-page template. Make the following bullet point more concise while keeping all core facts and metrics. Aim for 90-130 characters.\n\nOriginal bullet: "${text}"\n\nReturn ONLY the shortened bullet point text, nothing else.`;
        break;
      case 'expand':
        prompt = `You are a resume editor. Expand the following bullet point to improve clarity and professional tone without fabricating any metrics or responsibilities. Aim for 140-190 characters.\n\nOriginal bullet: "${text}"\n\nReturn ONLY the expanded bullet point text, nothing else.`;
        break;
      case 'grammar':
        prompt = `Fix any grammatical errors, spelling, punctuation, and tense inconsistencies in this resume bullet point. Maintain past tense for completed work. Do not alter factual meaning.\n\nOriginal bullet: "${text}"\n\nReturn ONLY the corrected bullet point text, nothing else.`;
        break;
      default:
        prompt = `Improve the following resume bullet point for an executive resume:\n"${text}"\n\nReturn ONLY the improved bullet point text.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const result = response.text?.trim() || text;
    // Strip accidental leading bullets or quotes
    const cleaned = result.replace(/^["'●•\-\s]+|["'\s]+$/g, '').trim();
    return res.json({ result: cleaned, source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Graceful fallback to heuristic enhancement
    const fallback = performLocalEnhancement(req.body.action, req.body.text || '');
    return res.json({ result: fallback, source: 'fallback_error', note: error.message });
  }
});

// Heuristic fallback for offline/no-key mode
function performLocalEnhancement(action: string, text: string): string {
  let cleaned = text.trim();
  if (action === 'grammar') {
    // Basic capitalization & punctuation
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (!cleaned.endsWith('.')) cleaned += '.';
    }
    return cleaned;
  }
  if (action === 'shorten') {
    return cleaned.replace(/\b(in order to|with the aim of|responsible for|helped to|worked on|tasked with)\b/gi, '')
                  .replace(/\s{2,}/g, ' ')
                  .trim();
  }
  if (action === 'improve') {
    // Transform weak opening verbs to strong action verbs
    const verbMap: Record<string, string> = {
      'worked on': 'Spearheaded',
      'helped': 'Facilitated',
      'did': 'Executed',
      'made': 'Formulated',
      'handled': 'Orchestrated',
      'managed': 'Directed',
      'created': 'Engineered',
    };
    let improved = cleaned;
    for (const [weak, strong] of Object.entries(verbMap)) {
      const regex = new RegExp(`^${weak}\\b`, 'i');
      if (regex.test(improved)) {
        improved = improved.replace(regex, strong);
        break;
      }
    }
    if (!improved.endsWith('.')) improved += '.';
    return improved;
  }
  return cleaned;
}

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
