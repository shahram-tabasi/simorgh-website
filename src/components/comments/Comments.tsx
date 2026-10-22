'use client';

// Comments under an article, in the style of a professional social feed:
// a heart on the article, posts with a name and a headline, hearts and
// one level of replies, questions that the team marks answered.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { BadgeCheckIcon, CheckCircle2Icon, HeartIcon, LinkIcon, MessageCircleIcon, PinIcon, SendIcon } from 'lucide-react';
import type { CommentKind, PublicComment, Thread } from '../../comments/store';

const KIND_LABEL: Record<CommentKind, string> = { comment: 'Comment', question: 'Question', idea: 'Idea', experience: 'Experience' };
const FILTERS: { key: 'all' | CommentKind; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'question', label: 'Questions' }, { key: 'idea', label: 'Ideas' }, { key: 'experience', label: 'Experience' },
];
const ME_KEY = 'simorgh-commenter';

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (s < 60) return 'just now';
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour');
  if (s < 86400 * 30) return rtf.format(-Math.floor(s / 86400), 'day');
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

function Avatar({ name, team, small }: { name: string; team: boolean; small?: boolean }) {
  const size = small ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-[12.5px]';
  if (team) {
    return (
      <span className={`${size} grid shrink-0 place-items-center rounded-full border border-cyan/40 bg-space-2`}>
        <img src="/logo-mark.png" alt="" className="h-[62%] w-[62%] object-contain" />
      </span>
    );
  }
  return (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue/60 to-cyan/40 font-semibold text-ink`} aria-hidden="true">
      {initials(name) || '·'}
    </span>
  );
}

function loadMe() {
  try { return JSON.parse(localStorage.getItem(ME_KEY) || 'null') as { name: string; email: string; headline: string } | null; } catch { return null; }
}

function Composer({ slug, parent, onDone, autoFocus }: { slug: string; parent?: PublicComment; onDone: (status: string) => void; autoFocus?: boolean }) {
  const me = useRef(typeof window === 'undefined' ? null : loadMe());
  const startedAt = useRef(Date.now());
  const [text, setText] = useState(parent ? (parent.team ? '' : `@${parent.name.split(' ')[0]} `) : '');
  const [name, setName] = useState(me.current?.name ?? '');
  const [email, setEmail] = useState(me.current?.email ?? '');
  const [headline, setHeadline] = useState(me.current?.headline ?? '');
  const [kind, setKind] = useState<CommentKind>('comment');
  const [notify, setNotify] = useState(true);
  const [open, setOpen] = useState(!!parent || !!autoFocus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hp = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim() || !name.trim() || !email.trim()) { setError('Please write something and give your name and email.'); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name, email, headline, kind, notify, parentId: parent?.id ?? null, startedAt: startedAt.current, website: hp.current?.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === 'too-many' ? 'You have posted several comments in a short time. Please wait a few minutes.'
          : data.error === 'closed' ? 'Comments are closed on this article.' : 'Please check your name, email and comment.');
        return;
      }
      try { localStorage.setItem(ME_KEY, JSON.stringify({ name, email, headline })); } catch { /* private mode */ }
      setText('');
      onDone(data.status);
    } catch {
      setError('Could not send. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full border border-line bg-space-0/70 px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint/80 outline-none transition-colors focus:border-cyan/60';
  return (
    <form onSubmit={submit} className={parent ? 'mt-3' : ''}>
      <div className="flex items-start gap-3">
        {!parent && <Avatar name={name || 'You'} team={false} />}
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            rows={open ? 3 : 1}
            maxLength={2000}
            autoFocus={autoFocus}
            placeholder={parent ? `Reply to ${parent.name}…` : 'Share a thought, a question or your own experience…'}
            aria-label={parent ? `Reply to ${parent.name}` : 'Your comment'}
            className={`${field} resize-y`} />
          {open && (
            <div className="mt-2 grid gap-2">
              {!parent && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="What kind of post">
                  {(['comment', 'question', 'idea', 'experience'] as CommentKind[]).map((k) => (
                    <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                      className={`border px-2.5 py-1 font-mono text-[10.5px] tracking-label transition-colors ${kind === k ? 'border-cyan/60 bg-cyan/10 text-cyan-soft' : 'border-line text-ink-faint hover:text-ink'}`}>
                      {KIND_LABEL[k].toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} type="email" placeholder="Email (never shown)" aria-label="Email, never shown" autoComplete="email" className={field} />
              </div>
              {!parent && (
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={80} placeholder="Role and company, e.g. Process engineer at …  (optional)" aria-label="Role and company (optional)" autoComplete="organization-title" className={field} />
              )}
              <input ref={hp} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[12.5px] text-ink-muted">
                  <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-cyan" />
                  Email me when someone replies
                </label>
                <button type="submit" disabled={busy || !text.trim()}
                  className="inline-flex items-center gap-2 bg-blue px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue/85 disabled:opacity-50">
                  <SendIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {busy ? 'Sending…' : parent ? 'Reply' : 'Post'}
                </button>
              </div>
              {error && <p className="text-[12.5px] text-red-300" role="alert">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

function Heart({ liked, count, onClick, label }: { liked: boolean; count: number; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={liked} aria-label={label}
      className={`group inline-flex items-center gap-1.5 text-[12.5px] transition-colors ${liked ? 'text-rose-400' : 'text-ink-faint hover:text-ink'}`}>
      <HeartIcon className={`h-4 w-4 transition-transform duration-150 group-active:scale-125 ${liked ? 'fill-current' : ''}`} strokeWidth={1.8} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

function Post({ c, slug, onLike, onPosted, reply }: {
  c: PublicComment; slug: string; onLike: (id: string) => void; onPosted: (status: string) => void; reply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(c.replies.length <= 2);
  return (
    <li id={`comment-${c.id}`} className={`scroll-mt-28 ${reply ? 'mt-4' : 'border-b border-line py-6 last:border-b-0'}`}>
      <div className="flex gap-3">
        <Avatar name={c.name} team={c.team} small={reply} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[14px] font-semibold text-ink">{c.name}</span>
            {c.team && <BadgeCheckIcon className="h-4 w-4 text-cyan" strokeWidth={2} aria-label="SIMORGH team" />}
            {c.pinned && <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-label text-ink-faint"><PinIcon className="h-3 w-3" />PINNED</span>}
            {!reply && c.kind !== 'comment' && (
              <span className="border border-line px-1.5 py-px font-mono text-[9.5px] tracking-label text-ink-muted">{KIND_LABEL[c.kind].toUpperCase()}</span>
            )}
            {c.answered && (
              <span className="inline-flex items-center gap-1 border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-px font-mono text-[9.5px] tracking-label text-emerald-300">
                <CheckCircle2Icon className="h-3 w-3" />ANSWERED
              </span>
            )}
          </div>
          {(c.headline || c.team) && <div className="text-[12px] text-ink-faint">{c.team ? 'SIMORGH team' : c.headline}</div>}
          <p className="mt-2 whitespace-pre-line break-words text-[14.5px] leading-relaxed text-ink-muted">{c.text}</p>
          <div className="mt-2.5 flex items-center gap-5">
            <time dateTime={c.createdAt} suppressHydrationWarning className="text-[12px] text-ink-faint">{ago(c.createdAt)}</time>
            <Heart liked={c.liked} count={c.likes} onClick={() => onLike(c.id)} label={c.liked ? 'Remove like' : 'Like this comment'} />
            <button type="button" onClick={() => setReplying((v) => !v)} className="text-[12.5px] font-medium text-ink-faint hover:text-ink">Reply</button>
          </div>

          {!reply && c.replies.length > 0 && (
            <div className="mt-3">
              {!showReplies ? (
                <button type="button" onClick={() => setShowReplies(true)} className="flex items-center gap-3 text-[12.5px] font-medium text-ink-faint hover:text-ink">
                  <span className="h-px w-6 bg-line" />View {c.replies.length} replies
                </button>
              ) : (
                <ul>
                  {c.replies.map((r) => (
                    <Post key={r.id} c={r} slug={slug} reply onLike={onLike} onPosted={onPosted} />
                  ))}
                </ul>
              )}
            </div>
          )}
          {replying && (
            <Composer slug={slug} parent={c} autoFocus onDone={(s) => { setReplying(false); setShowReplies(true); onPosted(s); }} />
          )}
        </div>
      </div>
    </li>
  );
}

export function Comments({ slug, title, initial }: { slug: string; title: string; initial: Thread }) {
  const [thread, setThread] = useState(initial);
  const [filter, setFilter] = useState<'all' | CommentKind>('all');
  const [sort, setSort] = useState<'top' | 'new'>('new');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/comments/${slug}`, { cache: 'no-store' });
    if (res.ok) setThread(await res.json());
  }, [slug]);

  const like = async (commentId: string | null) => {
    // Shown at once, put right by the answer.
    const flip = (c: PublicComment): PublicComment => c.id === commentId
      ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
      : { ...c, replies: c.replies.map(flip) };
    setThread((t) => commentId ? { ...t, comments: t.comments.map(flip) } : { ...t, liked: !t.liked, likes: t.likes + (t.liked ? -1 : 1) });
    const res = await fetch(`/api/comments/${slug}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId }) });
    if (!res.ok) reload();
  };

  const posted = (status: string) => {
    setNotice(status === 'approved' ? '' : 'Thank you. Your comment will appear after a quick review.');
    reload();
  };

  const share = async () => {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* cancelled */ }
  };

  const shown = useMemo(() => {
    const list = thread.comments.filter((c) => filter === 'all' || c.kind === filter);
    if (sort === 'top') {
      return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.likes + b.replies.length) - (a.likes + a.replies.length));
    }
    return list;
  }, [thread.comments, filter, sort]);

  return (
    <section id="comments" aria-label="Comments" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-center gap-6 border-y border-line py-4">
        <Heart liked={thread.liked} count={thread.likes} onClick={() => like(null)} label={thread.liked ? 'Remove your like from this article' : 'Like this article'} />
        <a href="#comments" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-ink">
          <MessageCircleIcon className="h-4 w-4" strokeWidth={1.8} />
          {thread.count} {thread.count === 1 ? 'comment' : 'comments'}
        </a>
        <button type="button" onClick={share} className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint hover:text-ink">
          <LinkIcon className="h-4 w-4" strokeWidth={1.8} />
          {copied ? 'Link copied' : 'Share'}
        </button>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold tracking-tight text-ink">Discussion</h2>
      <p className="mt-1 text-[13px] text-ink-faint">Questions are answered by the engineers who wrote the article.</p>

      {thread.enabled ? (
        <div className="mt-6">
          <Composer slug={slug} onDone={posted} />
          {notice && <p className="mt-3 border border-cyan/30 bg-cyan/5 px-3 py-2 text-[13px] text-cyan-soft" role="status">{notice}</p>}
        </div>
      ) : (
        <p className="mt-6 text-[13.5px] text-ink-faint">Comments are closed.</p>
      )}

      {thread.comments.length > 0 && (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter comments">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                  className={`border px-3 py-1.5 font-mono text-[10.5px] tracking-label transition-colors ${filter === f.key ? 'border-cyan/60 text-cyan-soft' : 'border-line text-ink-faint hover:text-ink'}`}>
                  {f.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-3 text-[12.5px]" role="group" aria-label="Sort comments">
              {(['new', 'top'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSort(s)} aria-pressed={sort === s}
                  className={sort === s ? 'font-medium text-ink' : 'text-ink-faint hover:text-ink'}>{s === 'new' ? 'Newest' : 'Top'}</button>
              ))}
            </div>
          </div>
          <ul className="mt-2">
            {shown.map((c) => <Post key={c.id} c={c} slug={slug} onLike={like} onPosted={posted} />)}
          </ul>
          {shown.length === 0 && <p className="py-8 text-center text-[13px] text-ink-faint">Nothing here yet.</p>}
        </>
      )}
    </section>
  );
}
