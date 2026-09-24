import type { Metadata } from 'next';
import { RequestsInbox } from '@/src/admin/ui/sections/RequestsInbox';

export const metadata: Metadata = { title: 'پیام‌ها' };

export default function Page() {
  return <RequestsInbox />;
}
