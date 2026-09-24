import type { Metadata } from 'next';
import { SectionsEditor } from '@/src/admin/ui/sections/SectionsEditor';

export const metadata: Metadata = { title: 'بخش‌های صفحه اصلی' };

export default function Page() {
  return <SectionsEditor />;
}
