import { supabase } from '../lib/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

function extractKeywords(message) {
  if (!message) return [];
  // simple NLP utility: Remove punctuation to avoid breaking PostgREST .or() syntax
  const cleanMessage = message.replace(/[^\w\s]/gi, '');
  return cleanMessage.split(/\s+/).filter(word => word.length > 3);
}

export async function chatHandler(req, res) {
  try {
    const { message, session_id } = req.body;

    // 1. Extract keywords from the user message
    const keywords = extractKeywords(message);

    // 2. Query Supabase for relevant projects
    let query = supabase.from('projects').select('*').limit(20);

    if (keywords.length > 0) {
      const orString = keywords.map(k => `project_name.ilike.%${k}%`).join(',');
      query = query.or(orString);
    }

    const { data: projects, error } = await query;
    if (error) {
      console.error("Supabase Error:", error);
    }

    // 3. Build the system prompt with injected data
    const systemInstruction = `
You are Nkechi, INGEC Intelligence Assistant.
Answer ONLY using the project data below. Never fabricate.
Flag abandoned projects with [ABANDONMENT ALERT].
Flag protected projects with [PROTECTED - Cannot be cancelled].

PROJECT DATA:
${JSON.stringify(projects || [], null, 2)}`;

    // 4. Call Gemini API
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(message);
    const replyText = result.response.text();

    res.json({
      reply: replyText,
      projects_referenced: (projects || []).map(p => p.id),
      has_abandoned: (projects || []).some(p => p.status === 'ABANDONED'),
    });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
