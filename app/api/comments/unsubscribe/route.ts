import { unsubscribe } from '@/src/comments/store';

// The link at the bottom of a reply email: no more emails about that comment.
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get('t') || '';
  const ok = /^[a-f0-9]{32}$/.test(t) && (await unsubscribe(t));
  const msg = ok ? 'You will not get more emails about replies to this comment.' : 'This link is not valid any more.';
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>SIMORGH</title><body style="font-family:sans-serif;background:#05070d;color:#dfe6f3;display:grid;place-items:center;min-height:90vh"><p>${msg}</p></body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}
