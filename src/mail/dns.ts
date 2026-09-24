// Server-only: the DNS records the domain needs for the site and for email,
// and a live check of what the internet currently sees for each one.

import { promises as dns } from 'node:dns';
import { mailConfig } from './mailcow';

export interface DnsRecord {
  type: 'A' | 'MX' | 'TXT' | 'CNAME' | 'SRV' | 'PTR';
  /** Name as ArvanCloud asks for it: "@" for the domain itself, otherwise the sub-name. */
  name: string;
  value: string;
  priority?: number;
  /** Must be DNS-only (grey cloud) in ArvanCloud: mail never goes through the CDN. */
  noProxy?: boolean;
  purpose: string;
  status?: 'ok' | 'missing' | 'different' | 'unknown';
  found?: string[];
}

const fqdn = (name: string, domain: string) => (name === '@' ? domain : `${name}.${domain}`);
const norm = (s: string) => s.toLowerCase().replace(/\.$/, '').replace(/\s+/g, ' ').replace(/"/g, '').trim();

export function expectedRecords(dkim: { selector: string; txt: string } | null): DnsRecord[] {
  const { domain, host, ip } = mailConfig();
  const sub = host.endsWith(`.${domain}`) ? host.slice(0, -domain.length - 1) : host;
  const IP = ip || '<IP سرور>';
  return [
    { type: 'A', name: '@', value: IP, purpose: 'سایت (می‌تواند پشت CDN آروان باشد)' },
    { type: 'A', name: 'www', value: IP, purpose: 'سایت با www (می‌تواند پشت CDN آروان باشد)' },
    { type: 'A', name: sub, value: IP, noProxy: true, purpose: 'سرور ایمیل — حتماً بدون CDN' },
    { type: 'MX', name: '@', value: host, priority: 10, purpose: 'ایمیل‌های ورودی به این سرور می‌آیند' },
    { type: 'TXT', name: '@', value: `v=spf1 mx a:${host} ~all`, purpose: 'SPF: فقط این سرور اجازه ارسال از طرف دامنه را دارد' },
    { type: 'TXT', name: `${dkim?.selector || 'dkim'}._domainkey`, value: dkim?.txt || '(بعد از راه‌اندازی سرور ایمیل اینجا نمایش داده می‌شود)', purpose: 'DKIM: امضای ایمیل‌ها؛ جلوی اسپم شدن را می‌گیرد' },
    { type: 'TXT', name: '_dmarc', value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain}`, purpose: 'DMARC: سیاست برخورد با ایمیل‌های جعلی' },
    { type: 'CNAME', name: 'autodiscover', value: host, noProxy: true, purpose: 'تنظیم خودکار Outlook' },
    { type: 'CNAME', name: 'autoconfig', value: host, noProxy: true, purpose: 'تنظیم خودکار Thunderbird' },
    { type: 'SRV', name: '_autodiscover._tcp', value: `0 1 443 ${host}`, purpose: 'تنظیم خودکار ایمیل در موبایل و Outlook (اختیاری)' },
    { type: 'PTR', name: IP, value: host, purpose: 'Reverse DNS — در پنل آروان نیست؛ از ارائه‌دهنده IP/دیتاسنتر بخواهید' },
  ];
}

async function lookup(r: DnsRecord, domain: string): Promise<string[]> {
  const name = fqdn(r.name, domain);
  switch (r.type) {
    case 'A': return dns.resolve4(name);
    case 'MX': return (await dns.resolveMx(name)).map((m) => `${m.priority} ${m.exchange}`);
    case 'TXT': return (await dns.resolveTxt(name)).map((parts) => parts.join(''));
    case 'CNAME': return dns.resolveCname(name).catch(async () => (await dns.resolve4(name)).map((a) => `A ${a}`));
    case 'SRV': return (await dns.resolveSrv(name)).map((s) => `${s.priority} ${s.weight} ${s.port} ${s.name}`);
    case 'PTR': return /^\d+\.\d+\.\d+\.\d+$/.test(r.name) ? dns.reverse(r.name) : [];
  }
}

function matches(r: DnsRecord, found: string[], ipKnown: boolean) {
  if (r.type === 'A' && !ipKnown) return found.length > 0;
  // An A record behind ArvanCloud's CDN answers with Arvan's addresses; that is fine for the site.
  if (r.type === 'A' && !r.noProxy) return found.length > 0;
  if (r.type === 'MX') return found.some((f) => norm(f).endsWith(norm(r.value)));
  if (r.type === 'TXT' && r.value.startsWith('v=spf1')) return found.some((f) => norm(f).startsWith('v=spf1') && (norm(f).includes(' mx') || norm(f).includes(norm(r.value.split(' ')[2]))));
  if (r.type === 'TXT' && r.value.startsWith('v=DMARC1')) return found.some((f) => norm(f).startsWith('v=dmarc1'));
  if (r.type === 'TXT' && r.value.startsWith('v=DKIM1')) {
    const key = (s: string) => s.replace(/\s|"/g, '').match(/p=([^;]+)/)?.[1];
    return found.some((f) => key(f) === key(r.value));
  }
  return found.some((f) => norm(f) === norm(r.value) || norm(f).endsWith(norm(r.value)));
}

export async function checkRecords(records: DnsRecord[]): Promise<DnsRecord[]> {
  const { domain, ip } = mailConfig();
  return Promise.all(records.map(async (r) => {
    if (r.type === 'PTR' && !ip) return { ...r, status: 'unknown' as const };
    try {
      const found = await lookup(r, domain);
      if (!found.length) return { ...r, status: 'missing' as const, found };
      return { ...r, status: matches(r, found, Boolean(ip)) ? 'ok' as const : 'different' as const, found };
    } catch {
      return { ...r, status: 'missing' as const, found: [] };
    }
  }));
}
