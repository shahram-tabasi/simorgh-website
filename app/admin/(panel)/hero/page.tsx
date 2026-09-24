import type { Metadata } from 'next';
import { HeroEditor } from '@/src/admin/ui/sections/HeroEditor';

export const metadata: Metadata = { title: 'بخش اول صفحه اصلی' };

export default function Page() {
  return <HeroEditor />;
}
