import type { Metadata } from 'next';
import { IndustriesEditor } from '@/src/admin/ui/sections/IndustriesEditor';

export const metadata: Metadata = { title: 'صنایع' };

export default function Page() {
  return <IndustriesEditor />;
}
