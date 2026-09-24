import type { Metadata } from 'next';
import { ArticlesEditor } from '@/src/admin/ui/sections/ArticlesEditor';

export const metadata: Metadata = { title: 'مقالات' };

export default function Page() {
  return <ArticlesEditor />;
}
