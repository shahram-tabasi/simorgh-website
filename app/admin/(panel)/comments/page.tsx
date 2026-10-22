import type { Metadata } from 'next';
import { CommentsInbox } from '@/src/admin/ui/sections/CommentsInbox';

export const metadata: Metadata = { title: 'دیدگاه‌ها' };

export default function Page() {
  return <CommentsInbox />;
}
