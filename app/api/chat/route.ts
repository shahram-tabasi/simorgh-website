import { NextResponse } from 'next/server';
import { getContent, toPublic } from '@/src/content/store';

async function siteContext() {
  const c = toPublic(await getContent());
  const { products, industries, ecosystem, intelligenceChain, aiLayers, articles, settings } = c;
  return JSON.stringify({ products, industries, ecosystem, intelligenceChain, aiLayers, articles, contact: { email: settings.email, phone: settings.phone, address: settings.address } }).slice(0, 50000);
}

export async function POST(req: Request) {
  try {
    const { messages = [], locale = 'en' } = await req.json();
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ answer: 'The AI engine is configured in the application, but OPENAI_API_KEY has not been added on the server yet.' });
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', temperature: 0.2, messages: [
        { role: 'system', content: `You are Simorgh Site Intelligence, the official AI guide for the SIMORGH website. Answer from the supplied site knowledge first. Never invent product capabilities, prices, clients, metrics or policies. If information is not present, say so and suggest the relevant page. Answer in the user's current site language (${locale}), while preserving technical terms, product names, software names and acronyms exactly. Be concise and professional. Site knowledge: ${await siteContext()}` },
        ...messages.slice(-12)
      ] })
    });
    const data = await response.json();
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content || 'No answer was returned.' });
  } catch {
    return NextResponse.json({ answer: 'The AI service could not be reached.' }, { status: 500 });
  }
}
