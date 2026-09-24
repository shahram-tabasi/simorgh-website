'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRightIcon, BoldIcon, ExternalLinkIcon, Heading2Icon, Heading3Icon, ImageIcon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon, PlusIcon, QuoteIcon, SearchIcon, TableIcon, Trash2Icon } from 'lucide-react';
import type { Article } from '../../../content/types';
import { patcher, slugify, useAdmin } from '../AdminStore';
import { Area, Btn, Card, Field, Grid, ImageField, PageTitle, SeoFields, Select, StatusBadge, Text, inputCls } from '../fields';
import { MediaPicker } from '../MediaPicker';

const KINDS: { value: Article['kind']; label: string }[] = [
  { value: 'Technical Article', label: 'مقاله فنی' },
  { value: 'Case Study', label: 'مطالعه موردی' },
  { value: 'Video', label: 'ویدئو' },
  { value: 'Whitepaper', label: 'وایت‌پیپر' },
  { value: 'News', label: 'خبر' },
];

const today = () => new Date().toISOString().slice(0, 10);

function blankArticle(n: number): Article {
  return {
    slug: `new-article-${n}`, title: '', kind: 'Technical Article', category: 'Engineering AI', readTime: '5 min', excerpt: '',
    date: today(), cover: '', author: 'SIMORGH', body: '', video: '', status: 'draft',
    seo: { title: '', description: '', keywords: '', image: '' },
  };
}

export function ArticlesEditor() {
  const { draft, set } = useAdmin();
  const [editing, setEditing] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const articles = draft.articles;

  const add = () => {
    set('articles', [blankArticle(articles.length + 1), ...articles]);
    setEditing(0);
  };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new')) { add(); window.history.replaceState(null, '', '/admin/articles'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (editing !== null && articles[editing]) {
    return (
      <ArticleForm
        article={articles[editing]}
        onBack={() => setEditing(null)}
        onChange={(v) => set('articles', articles.map((a, j) => (j === editing ? v : a)))}
        onDelete={() => {
          if (!confirm(`«${articles[editing].title || 'این مقاله'}» حذف شود؟`)) return;
          set('articles', articles.filter((_, j) => j !== editing));
          setEditing(null);
        }}
      />
    );
  }

  const list = articles.map((a, i) => ({ a, i }))
    .filter(({ a }) => !query || `${a.title} ${a.category} ${a.slug}`.toLowerCase().includes(query.toLowerCase()))
    .sort((x, y) => y.a.date.localeCompare(x.a.date));

  return (
    <div>
      <PageTitle title="مقالات و اخبار" lead="مقاله‌ها، اخبار، مطالعات موردی، وایت‌پیپرها و ویدئوها. هر مقاله صفحه مخصوص خودش را دارد (/insights/نامک) و در نقشه سایت برای گوگل ثبت می‌شود."
        actions={<Btn kind="primary" onClick={add}><PlusIcon className="h-4 w-4" />مقاله جدید</Btn>} />
      <div className="relative mb-4 max-w-sm">
        <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو…" className={`${inputCls} ps-8`} />
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        {list.map(({ a, i }) => (
          <button key={i} type="button" onClick={() => setEditing(i)} className="flex w-full items-center gap-4 border-b border-line bg-space-1/80 p-3 text-start last:border-0 hover:bg-space-2">
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-space-3">{a.cover && <img src={a.cover} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] text-ink" dir="auto">{a.title || 'بدون عنوان'}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-faint">{KINDS.find((k) => k.value === a.kind)?.label} · {a.category} · <span dir="ltr">{a.date}</span>{!a.body.trim() && ' · بدون متن کامل'}</div>
            </div>
            <StatusBadge status={a.status} />
          </button>
        ))}
        {list.length === 0 && <div className="p-8 text-center text-[13px] text-ink-faint">مقاله‌ای نیست.</div>}
      </div>
    </div>
  );
}

function ArticleForm({ article, onChange, onBack, onDelete }: { article: Article; onChange: (a: Article) => void; onBack: () => void; onDelete: () => void }) {
  const p = patcher(article, onChange);
  const folder = `articles/${article.slug}`;
  const words = article.body.trim() ? article.body.trim().split(/\s+/).length : 0;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={onBack}><ArrowRightIcon className="h-4 w-4 ltr:rotate-180" />همه مقالات</Btn>
        <div className="flex-1" />
        {article.status !== 'draft' && <a href={`/insights/${article.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-[13px] text-ink-muted hover:text-ink"><ExternalLinkIcon className="h-4 w-4" />مشاهده</a>}
        <Btn kind="danger" onClick={onDelete}><Trash2Icon className="h-4 w-4" />حذف</Btn>
      </div>

      <Card title="مشخصات">
        <Text label="عنوان" value={article.title} max={90}
          onChange={(title) => onChange({ ...article, title, ...(article.slug.startsWith('new-article') && article.status === 'draft' ? { slug: slugify(title) || article.slug } : {}) })} />
        <Area label="خلاصه (در فهرست مقالات و نتایج جستجو)" value={article.excerpt} onChange={p('excerpt')} rows={2} max={220} />
        <Grid cols={3}>
          <Text label="نامک (slug)" value={article.slug} onChange={(v) => p('slug')(slugify(v))} ltr hint={`/insights/${article.slug}`} />
          <Select label="نوع" value={article.kind} onChange={p('kind')} options={KINDS} />
          <Text label="دسته‌بندی" value={article.category} onChange={p('category')} />
          <Text label="تاریخ انتشار" type="date" value={article.date} onChange={p('date')} ltr />
          <Text label="زمان مطالعه" value={article.readTime} onChange={p('readTime')} hint={`پیشنهاد: ${Math.max(1, Math.round(words / 200))} min`} />
          <Text label="نویسنده" value={article.author} onChange={p('author')} />
          <Select label="وضعیت" value={article.status} onChange={p('status')} options={[{ value: 'published', label: 'منتشر شده' }, { value: 'draft', label: 'پیش‌نویس' }]} />
        </Grid>
        <Grid>
          <ImageField label="تصویر کاور" value={article.cover} onChange={p('cover')} folder={folder} hint="افقی ۱۲۰۰×۶۳۰ یا بزرگ‌تر. در سربرگ مقاله و اشتراک‌گذاری در شبکه‌های اجتماعی استفاده می‌شود." />
          <div className="grid content-start gap-3">
            <Text label="ویدئو (اختیاری)" value={article.video} onChange={p('video')} ltr placeholder="https://www.aparat.com/v/… یا /media/…mp4"
              hint="لینک یوتیوب یا آپارات، یا یک فایل ویدئوی بارگذاری‌شده." />
            <ImageField label="یا فایل ویدئو" value={/^\/media\//.test(article.video) ? article.video : ''} onChange={p('video')} folder={folder} accept="video" aspect="aspect-video max-h-40" />
          </div>
        </Grid>
      </Card>

      <MarkdownEditor value={article.body} onChange={p('body')} folder={folder} words={words} />

      <SeoFields value={article.seo} onChange={p('seo')} path={`/insights/${article.slug}`} fallbackTitle={article.title || 'عنوان مقاله'} fallbackDescription={article.excerpt} />
    </div>
  );
}

function MarkdownEditor({ value, onChange, folder, words }: { value: string; onChange: (v: string) => void; folder: string; words: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'split' | 'write' | 'preview'>('split');
  const [picking, setPicking] = useState(false);

  /** Wrap the selection (or insert at the cursor) and keep the focus in the editor. */
  const wrap = (before: string, after = '', placeholder = '') => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + selected.length); });
  };
  const line = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const s = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    onChange(value.slice(0, s) + prefix + value.slice(s));
    requestAnimationFrame(() => el.focus());
  };

  const tools = [
    { t: 'تیتر ۲', i: Heading2Icon, f: () => line('## ') },
    { t: 'تیتر ۳', i: Heading3Icon, f: () => line('### ') },
    { t: 'پررنگ', i: BoldIcon, f: () => wrap('**', '**', 'متن') },
    { t: 'کج', i: ItalicIcon, f: () => wrap('_', '_', 'متن') },
    { t: 'لینک', i: LinkIcon, f: () => wrap('[', '](https://)', 'متن لینک') },
    { t: 'فهرست', i: ListIcon, f: () => line('- ') },
    { t: 'فهرست شماره‌دار', i: ListOrderedIcon, f: () => line('1. ') },
    { t: 'نقل‌قول', i: QuoteIcon, f: () => line('> ') },
    { t: 'جدول', i: TableIcon, f: () => wrap('\n| ستون ۱ | ستون ۲ |\n|---|---|\n| ', ' | |\n', 'مقدار') },
    { t: 'عکس', i: ImageIcon, f: () => setPicking(true) },
  ];

  return (
    <Card title="متن مقاله" hint="با Markdown بنویسید: ## برای تیتر، **پررنگ**، - برای فهرست. تیترهای ## و ### به ساختار بهتر برای گوگل کمک می‌کنند."
      actions={
        <div className="flex rounded-md border border-line p-0.5 text-[12px]">
          {(['write', 'split', 'preview'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded px-2.5 py-1 ${mode === m ? 'bg-space-3 text-ink' : 'text-ink-faint'}`}>
              {{ write: 'نوشتن', split: 'دوستونه', preview: 'پیش‌نمایش' }[m]}
            </button>
          ))}
        </div>
      }>
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-space-0/60 p-1">
        {tools.map(({ t, i: I, f }) => (
          <button key={t} type="button" title={t} aria-label={t} onClick={f} className="grid h-8 w-8 place-items-center rounded text-ink-muted hover:bg-space-3 hover:text-ink"><I className="h-4 w-4" /></button>
        ))}
        <span className="ms-auto px-2 text-[11.5px] text-ink-faint">{words} کلمه</span>
      </div>
      <div className={`grid gap-4 ${mode === 'split' ? 'lg:grid-cols-2' : ''}`}>
        {mode !== 'preview' && (
          <Field label="">
            <textarea ref={ref} dir="auto" value={value} onChange={(e) => onChange(e.target.value)} rows={24}
              className={`${inputCls} min-h-[28rem] resize-y font-mono text-[13px] leading-7`} placeholder={'## مقدمه\n\nمتن مقاله…'} />
          </Field>
        )}
        {mode !== 'write' && (
          <div dir="auto" className="sim-prose max-h-[40rem] min-h-[28rem] overflow-y-auto rounded-md border border-line bg-space-0/60 p-5 text-[15px]">
            {value.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-ink-faint">پیش‌نمایش اینجا نمایش داده می‌شود.</p>}
          </div>
        )}
      </div>
      {picking && <MediaPicker folder={folder} accept="image" onClose={() => setPicking(false)} onPick={(url) => { setPicking(false); wrap(`\n![`, `](${url})\n`, 'توضیح عکس'); }} />}
    </Card>
  );
}
