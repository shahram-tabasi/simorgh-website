import { NextResponse } from 'next/server';

const protectedTerms = [
  'SIMORGH', 'EPLAN', 'Siemens', 'ABB', 'Schneider Electric', 'Rockwell', 'Microsoft',
  'Smart Grid', 'Digital Twin', 'AI', 'RAG', 'PLC', 'SLD', 'BOM', 'GIS', 'IoT',
  'Modbus', 'IEC', 'SCADA', 'HMI', 'API', 'SaaS', 'MCP', 'EPLAN Integration',
  'Simorgh Design Suite', 'Simorgh Grid', 'Simorgh Kara', 'Simorgh Shop'
];

export async function POST(req: Request) {
  try {
    const { texts = [], locale = 'en' } = await req.json();
    if (locale === 'en' || !Array.isArray(texts) || texts.length === 0) return NextResponse.json({ translations: texts });
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ translations: texts, fallback: true });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are the translation engine for the SIMORGH website. Translate UI and editorial website text into locale ${locale}. Return JSON only: {"translations":[...]} in exactly the same order and count. Preserve HTML-free plain text. NEVER translate, transliterate, or alter protected technical terms, product names, software names, company names, acronyms, model names, standards, protocols, URLs, numbers, units, or codes. Protected examples: ${protectedTerms.join(', ')}. Translate natural-language UI around those terms. Do not add explanations.`
          },
          { role: 'user', content: JSON.stringify(texts) }
        ]
      })
    });
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return NextResponse.json({ translations: texts, fallback: true });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length) return NextResponse.json({ translations: texts, fallback: true });
    return NextResponse.json({ translations: parsed.translations });
  } catch {
    return NextResponse.json({ translations: [], fallback: true }, { status: 500 });
  }
}
