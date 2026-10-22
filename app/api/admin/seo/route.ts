import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import { googleDnsVerified } from '@/src/mail/dns';

export const dynamic = 'force-dynamic';

/** Live checks for the dashboard's SEO list that the content alone cannot answer. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ googleDns: await googleDnsVerified() });
}
