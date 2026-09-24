import { NextResponse } from 'next/server';
import { mailConfig } from '@/src/mail/mailcow';

// /mail → the webmail (SOGo on the mail server), where staff read their email.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.redirect(mailConfig().webmail, 302);
}
