// Server-only: an email to the team when someone sends the contact or demo
// form. Sent through the company mail server (e.g. from noreply@ or info@).
//
//   SMTP_HOST=mail.simorghai.com   SMTP_PORT=587
//   SMTP_USER=noreply@simorghai.com SMTP_PASS=…
// The recipient is set in the admin panel (Settings → notification email).

import nodemailer from 'nodemailer';
import type { Submission } from '../content/store';
import type { StoredComment } from '../comments/store';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function smtp() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const from = () => process.env.SMTP_FROM || `SIMORGH website <${process.env.SMTP_USER}>`;

export async function notifySubmission(item: Submission, to: string) {
  if (!smtpConfigured() || !to.trim()) return;
  const transport = smtp();
  const f = item.fields;
  const who = f.name || [f.firstName, f.lastName].filter(Boolean).join(' ') || f.email;
  const kind = item.type === 'demo' ? 'Demo request' : 'Contact message';
  const rows = Object.entries(f).filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#667;vertical-align:top">${esc(k)}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`).join('');
  await transport.sendMail({
    from: from(),
    to,
    replyTo: f.email ? `${who} <${f.email}>` : undefined,
    subject: `${kind}: ${who}${f.company || f.organisation ? ` — ${f.company || f.organisation}` : ''}`,
    text: Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<p style="font-family:sans-serif">${kind} from the website</p><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
  });
}

const para = (s: string) => esc(s).replace(/\n/g, '<br>');

/** To the team: a new comment, and whether it waits for approval. */
export async function notifyComment(c: StoredComment, articleTitle: string, siteUrl: string, to: string) {
  if (!smtpConfigured() || !to.trim()) return;
  const url = `${siteUrl}/insights/${c.slug}#comment-${c.id}`;
  const state = c.status === 'pending' ? 'waits for approval in the admin panel (Comments)' : 'is live';
  await smtp().sendMail({
    from: from(),
    to,
    replyTo: `${c.name} <${c.email}>`,
    subject: `${c.status === 'pending' ? 'Comment to approve' : 'New comment'}: ${articleTitle}`,
    text: `${c.name} (${c.email})${c.headline ? `, ${c.headline}` : ''} wrote on "${articleTitle}":\n\n${c.text}\n\nThe comment ${state}.\n${url}\n${siteUrl}/admin/comments`,
    html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6"><p><b>${esc(c.name)}</b> &lt;${esc(c.email)}&gt;${c.headline ? `, ${esc(c.headline)}` : ''} wrote on <a href="${esc(url)}">${esc(articleTitle)}</a>:</p><blockquote style="margin:0;padding:8px 14px;border-left:3px solid #2f6bff;color:#333">${para(c.text)}</blockquote><p>The comment ${state}. <a href="${esc(siteUrl)}/admin/comments">Open comments</a></p></div>`,
  });
}

/** To a reader who asked to hear about replies. */
export async function notifyReply(parent: StoredComment, reply: StoredComment, articleTitle: string, siteUrl: string) {
  if (!smtpConfigured() || !parent.notify || parent.email.toLowerCase() === reply.email.toLowerCase()) return;
  const url = `${siteUrl}/insights/${parent.slug}#comment-${reply.id}`;
  const stop = `${siteUrl}/api/comments/unsubscribe?t=${parent.token}`;
  const who = reply.team ? `${reply.name} (SIMORGH team)` : reply.name;
  await smtp().sendMail({
    from: from(),
    to: `${parent.name} <${parent.email}>`,
    subject: `${who} replied to your comment on "${articleTitle}"`,
    headers: { 'List-Unsubscribe': `<${stop}>` },
    text: `${who} replied:\n\n${reply.text}\n\nRead the conversation: ${url}\n\nNo more emails about this comment: ${stop}`,
    html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6"><p>${esc(who)} replied to your comment on <a href="${esc(url)}">${esc(articleTitle)}</a>:</p><blockquote style="margin:0;padding:8px 14px;border-left:3px solid #2f6bff;color:#333">${para(reply.text)}</blockquote><p><a href="${esc(url)}">Read the conversation</a></p><p style="color:#888;font-size:12px"><a href="${esc(stop)}" style="color:#888">No more emails about this comment</a></p></div>`,
  });
}
