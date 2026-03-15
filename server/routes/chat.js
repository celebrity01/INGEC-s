import { supabase } from '../lib/supabase.js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractKeywords(message) {
  if (!message) return [];
  // simple NLP utility
  return message.split(/\s+/).filter(word => word.length > 3);
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
    const systemPrompt = `
You are Nkechi, INGEC Intelligence Assistant.
Answer ONLY using the project data below. Never fabricate.
Flag abandoned projects with [ABANDONMENT ALERT].
Flag protected projects with [PROTECTED - Cannot be cancelled].

PROJECT DATA:
${JSON.stringify(projects || [], null, 2)}`;

    // 4. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    res.json({
      reply: response.content[0].text,
      projects_referenced: (projects || []).map(p => p.id),
      has_abandoned: (projects || []).some(p => p.status === 'ABANDONED'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
