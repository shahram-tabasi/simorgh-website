import { NextResponse } from 'next/server';
import { protectedPattern, protectedTerms } from '@/src/data/glossary';

// Fallback translator for text the bundled catalogs (src/locales) do not
// cover — admin-edited content, new pages. Needs OPENAI_API_KEY; without it
// the response says `unavailable: true` and the client stops asking. Any other
// `fallback: true` is a failed attempt: the client shows English and does not cache it.
//
// Protected terms (product names, software, standards, acronyms) are swapped
// for numbered tokens before the text leaves the server and put back
// afterwards, so they come back exactly as written whatever the model does.

const token = (index: number) => `⟦${index}⟧`;

function mask(text: string) {
  const terms: string[] = [];
  const masked = text.replace(new RegExp(protectedPattern.source, 'g'), (term) => {
    terms.push(term);
    return token(terms.length - 1);
  });
  return { masked, terms };
}

function unmask(text: string, terms: string[]) {
  return text.replace(/⟦(\d+)⟧/g, (whole, index) => terms[Number(index)] ?? whole);
}

export async function POST(req: Request) {
  try {
    const { texts = [], locale = 'en' } = await req.json();
    if (locale === 'en' || !Array.isArray(texts) || texts.length === 0) return NextResponse.json({ translations: texts });
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ translations: texts, fallback: true, unavailable: true });

    const masked = texts.map((text: string) => mask(String(text)));

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
            content: `You are the translation engine for the SIMORGH website. Translate UI and editorial website text into locale ${locale}. Return JSON only: {"translations":[...]} in exactly the same order and count. Preserve HTML-free plain text. Tokens like ⟦0⟧ stand for protected names: copy every token unchanged into the translation, in the grammatically right place. NEVER translate, transliterate, or alter protected technical terms, product names, software names, company names, acronyms, model names, standards, protocols, URLs, numbers, units, or codes. Protected examples: ${protectedTerms.join(', ')}. Translate natural-language UI around those terms. Do not add explanations.`
          },
          { role: 'user', content: JSON.stringify(masked.map((item: { masked: string }) => item.masked)) }
        ]
      })
    });
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return NextResponse.json({ translations: texts, fallback: true });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length) return NextResponse.json({ translations: texts, fallback: true });
    return NextResponse.json({
      translations: parsed.translations.map((text: string, index: number) => unmask(String(text), masked[index].terms)),
    });
  } catch {
    return NextResponse.json({ translations: [], fallback: true }, { status: 500 });
  }
}
