import type { Metadata } from 'next';
import { MailEditor } from '@/src/admin/ui/sections/MailEditor';

export const metadata: Metadata = { title: 'ایمیل سازمانی' };

export default function Page() {
  return <MailEditor />;
}
