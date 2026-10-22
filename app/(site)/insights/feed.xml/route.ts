import { getContent, toPublic } from '@/src/content/store';
import { absoluteUrl, siteUrl } from '@/src/seo/metadata';

// RSS for the Insights articles: feed readers, LinkedIn/Telegram automations
// and search engines pick up a new article from here.
export const dynamic = 'force-dynamic';

const x = (s: string) => s.replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch]!));

export async function GET() {
  const full = await getContent();
  const c = toPublic(full);
  const items = c.articles.filter((a) => !a.seo.noindex).slice(0, 50).map((a) => {
    const url = absoluteUrl(full, `/insights/${a.slug}`);
    const cover = a.cover ? `<enclosure url="${x(absoluteUrl(full, a.cover))}" type="${a.cover.endsWith('.png') ? 'image/png' : 'image/jpeg'}" length="0"/>` : '';
    return `<item><title>${x(a.title)}</title><link>${x(url)}</link><guid isPermaLink="true">${x(url)}</guid><pubDate>${new Date(a.date).toUTCString()}</pubDate><category>${x(a.category)}</category><description>${x(a.seo.description || a.excerpt)}</description>${cover}</item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(full.settings.siteName)} Insights</title><link>${x(siteUrl(full))}/insights</link><atom:link href="${x(siteUrl(full))}/insights/feed.xml" rel="self" type="application/rss+xml"/><description>${x(full.pages.insights.seo.description || full.seo.description)}</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}
