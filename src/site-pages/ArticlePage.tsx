// An article, case study, whitepaper, news item or video from Insights.
// Rendered on the server: the Markdown body becomes plain HTML in the page,
// which is what search engines read. Raw HTML inside the Markdown is not
// executed (react-markdown escapes it).

import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { getContent, toPublic } from '../content/store';
import type { Article } from '../content/types';

function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const aparat = url.match(/aparat\.com\/v\/([\w-]+)/);
  if (aparat) return `https://www.aparat.com/video/video/embed/videohash/${aparat[1]}/vt/frame`;
  return null;
}

export async function ArticlePage({ article }: { article: Article }) {
  const content = toPublic(await getContent());
  const related = content.articles.filter((a) => a.slug !== article.slug).slice(0, 3);
  const embed = article.video ? embedUrl(article.video) : null;

  return (
    <>
      <PageHero
        eyebrow={`${article.kind.toUpperCase()} · ${article.category.toUpperCase()}`}
        title={article.title}
        lead={article.excerpt}
        crumbs={[{ label: 'Insights', to: '/insights' }, { label: article.category }]}
        image={article.cover || content.pages.insights.heroImage}
        flip={!article.cover && content.pages.insights.heroFlip}
      />

      <section className="bg-space-0">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-6 font-mono text-[11px] text-ink-faint">
            <time dateTime={article.date}>{article.date}</time>
            <span className="h-px w-5 bg-line" />
            <span>{article.readTime}</span>
            {article.author && <><span className="h-px w-5 bg-line" /><span>{article.author}</span></>}
          </div>

          {article.video && (
            <div className="mt-10 overflow-hidden rounded-lg border border-line bg-black">
              {embed ? (
                <iframe src={embed} title={article.title} className="aspect-video w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              ) : (
                <video src={article.video} controls preload="metadata" className="aspect-video w-full" poster={article.cover || undefined} />
              )}
            </div>
          )}

          {article.body.trim() ? (
            <div className="sim-prose mt-10">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
            </div>
          ) : (
            <p className="mt-10 text-[16px] leading-relaxed text-ink-muted">{article.excerpt}</p>
          )}

          <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-line bg-space-1 p-8 sm:flex-row sm:items-center">
            <p className="max-w-md text-[14.5px] text-ink-muted">
              Talk to the engineers behind the platform about your network, your plant or your city.
            </p>
            <Button to="/request-demo">Request a Demo</Button>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-space-1">
          <div className="mx-auto max-w-shell px-5 py-16 lg:px-10">
            <div className="font-mono text-[10px] tracking-label text-cyan/80">RELATED</div>
            <ul className="mt-8 grid gap-px border border-line bg-line lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug} className="bg-space-1">
                  <Link href={`/insights/${a.slug}`} className="group flex h-full flex-col p-7 transition-colors duration-200 ease-sim hover:bg-space-2">
                    <span className="font-mono text-[10px] tracking-label text-ink-faint">{a.kind.toUpperCase()}</span>
                    <span className="mt-4 font-display text-[17px] font-semibold leading-snug text-ink group-hover:text-cyan-soft">{a.title}</span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[13px] text-cyan-soft">
                      Explore
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
