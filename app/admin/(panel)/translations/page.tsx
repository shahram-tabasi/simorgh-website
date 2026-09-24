import type { Metadata } from 'next';
import { TranslationsEditor } from '@/src/admin/ui/sections/TranslationsEditor';

export const metadata: Metadata = { title: 'ترجمه‌ها' };

export default function Page() {
  return <TranslationsEditor />;
}
