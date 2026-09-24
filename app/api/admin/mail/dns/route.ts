import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import { checkRecords, expectedRecords } from '@/src/mail/dns';
import { getDkim, mailConfig } from '@/src/mail/mailcow';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const cfg = mailConfig();
  const dkim = cfg.configured ? await getDkim().catch(() => null) : null;
  const records = await checkRecords(expectedRecords(dkim));
  return NextResponse.json({ domain: cfg.domain, host: cfg.host, ip: cfg.ip, records });
}
