import type { Metadata } from 'next';
import { Dashboard } from '@/src/admin/ui/sections/Dashboard';

export const metadata: Metadata = { title: 'داشبورد' };

export default function Page() {
  return <Dashboard />;
}
