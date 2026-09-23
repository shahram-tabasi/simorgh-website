import { AdminAuthProvider } from '@/src/contexts/AdminAuthContext';
import { SiteLayout } from '@/src/components/layout/SiteLayout';

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <SiteLayout>{children}</SiteLayout>
    </AdminAuthProvider>
  );
}
