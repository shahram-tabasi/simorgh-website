import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import {
  addAlias, addMailbox, deleteAlias, deleteMailbox, domainExists, editMailbox, listAliases, listMailboxes, mailConfig, setupDomain,
} from '@/src/mail/mailcow';
import { smtpConfigured } from '@/src/mail/notify';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  'mailcow-auth': 'کلید API سرور ایمیل پذیرفته نشد. MAILCOW_API_KEY را بررسی کنید (باید Read-Write باشد و IP سایت در لیست مجاز باشد).',
};
const fail = (e: unknown, status = 502) => {
  const msg = e instanceof Error ? e.message : String(e);
  const text = ERRORS[msg]
    ?? (/fetch failed|ECONNREFUSED|ENOTFOUND|timeout|aborted/i.test(msg) ? 'سرور ایمیل در دسترس نیست. MAILCOW_URL و روشن بودن mailcow را بررسی کنید.' : msg);
  return NextResponse.json({ error: text }, { status });
};

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const cfg = mailConfig();
  const base = { configured: cfg.configured, domain: cfg.domain, host: cfg.host, webmail: cfg.webmail, smtp: smtpConfigured() };
  if (!cfg.configured) return NextResponse.json(base);
  try {
    const ready = await domainExists();
    if (!ready) return NextResponse.json({ ...base, ready, mailboxes: [], aliases: [] });
    const [mailboxes, aliases] = await Promise.all([listMailboxes(), listAliases()]);
    return NextResponse.json({ ...base, ready, mailboxes, aliases });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return NextResponse.json({ ...base, error: ERRORS[msg] ?? 'سرور ایمیل در دسترس نیست. MAILCOW_URL و روشن بودن mailcow را بررسی کنید.' });
  }
}

const LOCAL = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { domain } = mailConfig();
  const b = await req.json().catch(() => ({}));
  try {
    switch (b.action) {
      case 'setup':
        await setupDomain();
        break;
      case 'add-mailbox': {
        const local = String(b.localPart || '').trim().toLowerCase();
        if (!LOCAL.test(local)) return fail(new Error('نام ایمیل فقط می‌تواند حروف انگلیسی، عدد، نقطه، - و _ باشد.'), 400);
        if (String(b.password || '').length < 10) return fail(new Error('رمز ایمیل حداقل ۱۰ کاراکتر باشد.'), 400);
        await addMailbox({ localPart: local, name: String(b.name || local), password: String(b.password), quotaMb: Number(b.quotaMb) || 3072 });
        break;
      }
      case 'edit-mailbox': {
        if (!String(b.username || '').endsWith(`@${domain}`)) return fail(new Error('bad mailbox'), 400);
        if (b.password && String(b.password).length < 10) return fail(new Error('رمز ایمیل حداقل ۱۰ کاراکتر باشد.'), 400);
        await editMailbox(String(b.username), { name: b.name, password: b.password || undefined, quotaMb: b.quotaMb, active: b.active });
        break;
      }
      case 'delete-mailbox':
        if (!String(b.username || '').endsWith(`@${domain}`)) return fail(new Error('bad mailbox'), 400);
        await deleteMailbox(String(b.username));
        break;
      case 'add-alias': {
        const local = String(b.localPart || '').trim().toLowerCase();
        const goto = String(b.goto || '').split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
        if (!LOCAL.test(local)) return fail(new Error('نام ایمیل فقط می‌تواند حروف انگلیسی، عدد، نقطه، - و _ باشد.'), 400);
        if (!goto.length || !goto.every((g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g))) return fail(new Error('مقصد باید یک یا چند آدرس ایمیل معتبر باشد.'), 400);
        await addAlias(`${local}@${domain}`, goto.join(','));
        break;
      }
      case 'delete-alias':
        await deleteAlias(Number(b.id));
        break;
      default:
        return fail(new Error('unknown action'), 400);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
