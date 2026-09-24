import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminStoreProvider } from '@/src/admin/ui/AdminStore';
import { AdminShell } from '@/src/admin/ui/AdminShell';
import { SESSION_COOKIE, verifyToken } from '@/src/admin/session';
import { getContent } from '@/src/content/store';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect('/admin/login');
  const content = await getContent();
  return (
    <AdminStoreProvider initial={content}>
      <AdminShell user={session.u}>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
