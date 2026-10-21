import { NextResponse } from 'next/server';
import { getContent, toPublic } from '@/src/content/store';
import { llmChat, llmConfigured } from '@/src/lib/llm';

// What the model is given about the site, cut to fit its 32k-token window
// with room for the conversation and the answer.
const CONTEXT_CHARS = Number(process.env.LLM_CONTEXT_CHARS || 30000);

async function siteContext() {
  const c = toPublic(await getContent());
  const { products, industries, ecosystem, intelligenceChain, aiLayers, articles, settings } = c;
  return JSON.stringify({ products, industries, ecosystem, intelligenceChain, aiLayers, articles, contact: { email: settings.email, phone: settings.phone, address: settings.address } }).slice(0, CONTEXT_CHARS);
}

export async function POST(req: Request) {
  try {
    const { messages = [], locale = 'en' } = await req.json();
    if (!llmConfigured()) return NextResponse.json({ answer: 'The AI engine is configured in the application, but LLM_API_KEY has not been added on the server yet.' });
    const history = (Array.isArray(messages) ? messages : [])
      .filter((m: { role?: string; content?: unknown }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    const answer = await llmChat([
      { role: 'system', content: `You are Simorgh Site Intelligence, the official AI guide for the SIMORGH website.
Rules:
- Answer from the site knowledge below. Never invent product capabilities, prices, clients, metrics or policies. If something is not there, say so in one sentence and name the page to look at.
- Be short and complete: answer exactly what was asked, nothing more. At most 3 short sentences, or one intro line and at most 6 list items of one line each. No closing offers or questions unless the question was unclear.
- Greetings and small talk: one short friendly sentence.
- Format: plain sentences; a list only for several items; **bold** only for product names. No headings, tables, code blocks or emojis.
- Language: the user's site language (${locale}). Keep technical terms, product names, software names and acronyms exactly as written.
Site knowledge: ${await siteContext()}` },
      ...history,
    ], { maxTokens: 400, temperature: 0.2 });
    return NextResponse.json({ answer: answer || 'No answer was returned.' });
  } catch (error) {
    console.error('chat:', error instanceof Error ? error.message : error);
    return NextResponse.json({ answer: 'The AI service could not be reached.' }, { status: 500 });
  }
}
