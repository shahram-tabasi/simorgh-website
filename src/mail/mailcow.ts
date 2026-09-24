// Server-only: the company mailboxes (info@, sales@ …) live on a mailcow mail
// server next to the site. The admin panel manages them through mailcow's API.
//
//   MAILCOW_URL=https://mail.simorghai.com      (or http://127.0.0.1:8080 on the same machine)
//   MAILCOW_API_KEY=…                           (mailcow → System → Configuration → Access → API, read-write)
//   MAIL_DOMAIN=simorghai.com
//   MAIL_HOST=mail.simorghai.com                (the mail server's name, used in the DNS records)
//   MAIL_SERVER_IP=…                            (the server's public IP, for the A record check)
//   WEBMAIL_URL=https://mail.simorghai.com/SOGo/ (where /mail sends people; this is the default)

export const mailConfig = () => {
  const domain = (process.env.MAIL_DOMAIN || 'simorghai.com').toLowerCase();
  const host = (process.env.MAIL_HOST || `mail.${domain}`).toLowerCase();
  const url = (process.env.MAILCOW_URL || '').replace(/\/+$/, '');
  return {
    domain,
    host,
    url,
    ip: process.env.MAIL_SERVER_IP || '',
    // Public address, never MAILCOW_URL: that one is often 127.0.0.1, reachable only from the server.
    webmail: process.env.WEBMAIL_URL || `https://${host}/SOGo/`,
    configured: Boolean(url && process.env.MAILCOW_API_KEY),
  };
};

export interface Mailbox {
  username: string;
  name: string;
  /** Megabytes; 0 = unlimited. */
  quotaMb: number;
  usedBytes: number;
  messages: number;
  active: boolean;
}

export interface Alias {
  id: number;
  address: string;
  goto: string;
  active: boolean;
}

type McResult = { type: 'success' | 'danger' | 'error'; msg: unknown };

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const { url } = mailConfig();
  const res = await fetch(`${url}/api/v1/${path}`, {
    method,
    headers: { 'X-API-Key': process.env.MAILCOW_API_KEY || '', 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401 || res.status === 403) throw new Error('mailcow-auth');
  if (!res.ok) throw new Error(`mailcow-${res.status}`);
  return res.json() as Promise<T>;
}

// mailcow's message codes, in words the admin understands.
const MESSAGES: Record<string, string> = {
  object_exists: 'این آدرس از قبل وجود دارد.',
  is_alias_or_mailbox: 'این آدرس از قبل به‌عنوان صندوق یا آدرس فرعی وجود دارد.',
  password_complexity: 'رمز به اندازه کافی قوی نیست.',
  password_mismatch: 'دو رمز یکسان نیستند.',
  mailbox_quota_exceeded: 'حجم انتخاب‌شده بیشتر از سقف مجاز دامنه است.',
  mailbox_quota_left_exceeded: 'فضای باقی‌مانده دامنه کافی نیست.',
  max_mailbox_exceeded: 'تعداد صندوق‌های دامنه به سقف رسیده است.',
  domain_invalid: 'دامنه نامعتبر است.',
  access_denied: 'دسترسی رد شد؛ کلید API باید Read-Write باشد.',
  goto_invalid: 'آدرس مقصد نامعتبر است.',
  alias_invalid: 'آدرس فرعی نامعتبر است.',
};

/** Write calls answer with a list of {type, msg}; anything but "success" is an error. */
async function write(path: string, body: unknown) {
  const out = await call<McResult[] | McResult>('POST', path, body);
  const list = Array.isArray(out) ? out : [out];
  const bad = list.find((r) => r.type !== 'success');
  if (bad) {
    const [code, ...rest] = Array.isArray(bad.msg) ? bad.msg.map(String) : [String(bad.msg)];
    throw new Error(MESSAGES[code] ? `${MESSAGES[code]}${rest.length ? ` (${rest.join(' ')})` : ''}` : [code, ...rest].join(' '));
  }
}

const truthy = (v: unknown) => v === 1 || v === '1' || v === true;

export async function listMailboxes(): Promise<Mailbox[]> {
  const { domain } = mailConfig();
  const rows = await call<Record<string, unknown>[] | Record<string, never>>('GET', `get/mailbox/all/${domain}`);
  return (Array.isArray(rows) ? rows : []).map((r) => ({
    username: String(r.username),
    name: String(r.name ?? ''),
    quotaMb: Math.round(Number(r.quota ?? 0) / 1048576),
    usedBytes: Number(r.quota_used ?? 0),
    messages: Number(r.messages ?? 0),
    active: truthy(r.active),
  })).sort((a, b) => a.username.localeCompare(b.username));
}

export async function listAliases(): Promise<Alias[]> {
  const { domain } = mailConfig();
  const rows = await call<Record<string, unknown>[] | Record<string, unknown>>('GET', 'get/alias/all');
  return (Array.isArray(rows) ? rows : [])
    .filter((r) => String(r.domain ?? '').toLowerCase() === domain)
    .map((r) => ({ id: Number(r.id), address: String(r.address), goto: String(r.goto), active: truthy(r.active) }))
    .sort((a, b) => a.address.localeCompare(b.address));
}

export async function getDkim(): Promise<{ selector: string; txt: string } | null> {
  const { domain } = mailConfig();
  const r = await call<{ dkim_selector?: string; dkim_txt?: string }>('GET', `get/dkim/${domain}`);
  return r && r.dkim_txt ? { selector: r.dkim_selector || 'dkim', txt: r.dkim_txt } : null;
}

export async function domainExists() {
  const { domain } = mailConfig();
  const r = await call<Record<string, unknown>>('GET', `get/domain/${domain}`);
  return Boolean(r && (r as { domain_name?: string }).domain_name);
}

/** First-time setup: add the domain to mailcow and give it a 2048-bit DKIM key. */
export async function setupDomain() {
  const { domain } = mailConfig();
  if (!(await domainExists())) {
    await write('add/domain', {
      domain, description: 'SIMORGH', active: '1', aliases: 400, mailboxes: 50,
      defquota: 3072, maxquota: 20480, quota: 102400, backupmx: '0', relay_all_recipients: '0', restart_sogo: 10,
    });
  }
  if (!(await getDkim())) await write('add/dkim', { domains: domain, dkim_selector: 'dkim', key_size: 2048 });
}

export async function addMailbox(m: { localPart: string; name: string; password: string; quotaMb: number }) {
  const { domain } = mailConfig();
  await write('add/mailbox', {
    local_part: m.localPart, domain, name: m.name, password: m.password, password2: m.password,
    quota: String(m.quotaMb), active: '1', force_pw_update: '0', tls_enforce_in: '0', tls_enforce_out: '0',
  });
}

export async function editMailbox(username: string, attr: { name?: string; password?: string; quotaMb?: number; active?: boolean }) {
  const a: Record<string, string> = {};
  if (attr.name !== undefined) a.name = attr.name;
  if (attr.password) { a.password = attr.password; a.password2 = attr.password; }
  if (attr.quotaMb !== undefined) a.quota = String(attr.quotaMb);
  if (attr.active !== undefined) a.active = attr.active ? '1' : '0';
  await write('edit/mailbox', { items: [username], attr: a });
}

export async function deleteMailbox(username: string) {
  await write('delete/mailbox', [username]);
}

export async function addAlias(address: string, goto: string) {
  await write('add/alias', { address, goto, active: '1' });
}

export async function deleteAlias(id: number) {
  await write('delete/alias', [String(id)]);
}
