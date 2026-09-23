import { AdminAuthProvider } from '@/src/contexts/AdminAuthContext';
import { AdminLayout } from '@/src/components/admin/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider><AdminLayout>{children}</AdminLayout></AdminAuthProvider>;
}
