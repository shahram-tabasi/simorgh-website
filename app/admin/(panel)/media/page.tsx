import type { Metadata } from 'next';
import { MediaEditor } from '@/src/admin/ui/sections/MediaEditor';

export const metadata: Metadata = { title: 'کتابخانه رسانه' };

export default function Page() {
  return <MediaEditor />;
}
