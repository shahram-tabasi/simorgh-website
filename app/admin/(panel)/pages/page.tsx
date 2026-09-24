import type { Metadata } from 'next';
import { PagesEditor } from '@/src/admin/ui/sections/PagesEditor';

export const metadata: Metadata = { title: 'صفحات و پس‌زمینه‌ها' };

export default function Page() {
  return <PagesEditor />;
}
