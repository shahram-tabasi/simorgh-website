// Server-only: an email to the team when someone sends the contact or demo
// form. Sent through the company mail server (e.g. from noreply@ or info@).
//
//   SMTP_HOST=mail.simorghai.com   SMTP_PORT=587
//   SMTP_USER=noreply@simorghai.com SMTP_PASS=…
// The recipient is set in the admin panel (Settings → notification email).

import nodemailer from 'nodemailer';
import type { Submission } from '../content/store';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function notifySubmission(item: Submission, to: string) {
  if (!smtpConfigured() || !to.trim()) return;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const f = item.fields;
  const who = f.name || [f.firstName, f.lastName].filter(Boolean).join(' ') || f.email;
  const kind = item.type === 'demo' ? 'Demo request' : 'Contact message';
  const rows = Object.entries(f).filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#667;vertical-align:top">${esc(k)}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`).join('');
  await transport.sendMail({
    from: process.env.SMTP_FROM || `SIMORGH website <${process.env.SMTP_USER}>`,
    to,
    replyTo: f.email ? `${who} <${f.email}>` : undefined,
    subject: `${kind}: ${who}${f.company || f.organisation ? ` — ${f.company || f.organisation}` : ''}`,
    text: Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<p style="font-family:sans-serif">${kind} from the website</p><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
  });
}
